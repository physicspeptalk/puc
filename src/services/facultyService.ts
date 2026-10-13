/**
 * facultyService.ts
 *
 * Fetches faculty/teacher profiles from the PUC Google Spreadsheet.
 *
 * Worksheet: PUC_FACULTIES_GID (645621874)
 * Columns (Row 1 is the header):
 *   Name        → Faculty member's full name
 *   Experience  → Years of teaching experience (number string, e.g. "8")
 *   Subject     → Subject(s) they teach (e.g. "Physics", "Physics & Maths")
 *   Description → Short bio / description
 *   Picture     → Public image URL (Google Drive direct-download URL or any HTTPS image URL)
 *
 * NOTE on images: Google Sheets embedded cell images cannot be read via the
 * CSV/gviz API. The Picture column must contain a plain text URL
 * (e.g. https://drive.google.com/uc?export=view&id=FILE_ID).
 * If the cell is empty the UI will show a coloured avatar placeholder instead.
 *
 * Module-level cache — one fetch per page load.
 */

import { fetchSheetRows, isValidHttpUrl, PUC_FACULTIES_GID } from "./googleSheets";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Faculty {
  /** Full name */
  name: string;
  /** Years of experience as a string (e.g. "8", "10+") */
  experience: string;
  /** Subject(s) taught */
  subject: string;
  /** Short bio */
  description: string;
  /** Public image URL, or empty string if not provided */
  pictureUrl: string;
}

export interface FacultyFetchResult {
  faculties: Faculty[];
  error: string | null;
}

// ─── Cache ──────────────────────────────────────────────────────────────────

let _cached: FacultyFetchResult | null = null;
let _pending: Promise<FacultyFetchResult> | null = null;

// ─── Fetch ───────────────────────────────────────────────────────────────────

/**
 * Fetch all faculty profiles from the spreadsheet.
 * Skips rows where Name is empty.
 * Module-level cached — one network request per page load.
 */
export async function fetchFaculties(options?: {
  forceRefresh?: boolean;
}): Promise<FacultyFetchResult> {
  if (!options?.forceRefresh && _cached) return _cached;
  if (!options?.forceRefresh && _pending) return _pending;

  _pending = (async (): Promise<FacultyFetchResult> => {
    const { rows, error } = await fetchSheetRows(PUC_FACULTIES_GID);

    if (error) {
      const result = { faculties: [], error };
      _cached = result;
      _pending = null;
      return result;
    }

    const faculties: Faculty[] = rows
      .map((row) => {
        const name = (row["name"] ?? "").trim();
        const experience = (row["experience"] ?? "").trim();
        const subject = (row["subject"] ?? "").trim();
        const description = (row["description"] ?? "").trim();
        const rawPicture = (row["picture"] ?? "").trim();

        // Only accept valid HTTPS image URLs — reject empty or non-HTTP values
        const pictureUrl = isValidHttpUrl(rawPicture) ? rawPicture : "";

        return { name, experience, subject, description, pictureUrl };
      })
      // Skip rows with no name
      .filter((f) => f.name.length > 0);

    const result = { faculties, error: null };
    _cached = result;
    _pending = null;
    return result;
  })();

  return _pending;
}
