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

// ─── Google Drive URL normaliser ────────────────────────────────────────────

/**
 * Convert any Google Drive / Google user-content image URL into a proxied URL
 * that browsers can load without being blocked by Cross-Origin-Resource-Policy.
 *
 * Problem: Google Drive's download endpoint (drive.usercontent.google.com) sets
 *   cross-origin-resource-policy: same-site
 * which causes browsers to refuse loading the image cross-origin (e.g. from
 * localhost:5173 or puc.physicspeptalk.com).
 *
 * Solution: Route through wsrv.nl (images.weserv.nl) — a free, stable image
 * proxy that fetches the image server-side and re-serves it without restrictive
 * CORP headers. It also handles redirects and caches aggressively.
 *
 * URL format: https://wsrv.nl/?url=<encoded-image-url>&output=webp
 *
 * Handles these input formats:
 *   lh3.googleusercontent.com/d/FILE_ID   ← what Sheets cell images export as
 *   drive.google.com/file/d/FILE_ID/view   ← standard share link
 *   drive.google.com/open?id=FILE_ID
 *   drive.google.com/uc?id=FILE_ID
 *   drive.google.com/thumbnail?id=FILE_ID
 *
 * All Google Drive formats are normalised to the direct-download URL first,
 * then wrapped in the wsrv.nl proxy. Non-Drive URLs are returned unchanged.
 */
function normalisePictureUrl(raw: string): string {
  if (!raw) return "";

  let fileId: string | null = null;

  // lh3.googleusercontent.com/d/FILE_ID
  const lh3Match = raw.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/);
  if (lh3Match) fileId = lh3Match[1];

  // drive.google.com/file/d/FILE_ID/...
  if (!fileId) {
    const fileMatch = raw.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
    if (fileMatch) fileId = fileMatch[1];
  }

  // drive.google.com/open?id=, /uc?id=, /thumbnail?id=
  if (!fileId) {
    try {
      const u = new URL(raw);
      if (u.hostname === "drive.google.com") {
        fileId = u.searchParams.get("id");
      }
    } catch {
      // not a valid URL
    }
  }

  if (fileId) {
    // Build the direct-download URL, then proxy through wsrv.nl
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    return `https://wsrv.nl/?url=${encodeURIComponent(directUrl)}&output=webp&n=-1`;
  }

  // Not a Drive URL — return unchanged (e.g. already a direct image URL)
  return raw;
}

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

        // Normalise Google Drive / lh3 URLs → direct download format, then validate
        const normalised = normalisePictureUrl(rawPicture);
        const pictureUrl = isValidHttpUrl(normalised) ? normalised : "";

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
