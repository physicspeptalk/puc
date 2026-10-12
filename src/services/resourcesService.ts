/**
 * resourcesService.ts
 *
 * Fetches the CTA links for the three "Find the Right Resource" category cards
 * from the PUC Google Spreadsheet.
 *
 * Worksheet: PUC_RESOURCES_GID
 * Columns (row 1 is the header):
 *   Variable name  →  key identifying which card (BoardsCourses, KCST/ComedkCourses, CounsellingEnrollmenr)
 *   links          →  the destination URL for that card's CTA button
 *
 * Module-level cache — one fetch per page load.
 */

import { fetchSheetRows, isValidHttpUrl, PUC_RESOURCES_GID } from "./googleSheets";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ResourceLinks {
  /** CTA URL for the PUC / Board Courses card */
  boardsCourses: string;
  /** CTA URL for the KCET / COMEDK Courses card */
  kcetComedkCourses: string;
  /** CTA URL for the Counselling card */
  counsellingEnrollment: string;
}

/** Fallback URLs used when the sheet is unavailable */
const FALLBACK: ResourceLinks = {
  boardsCourses: "https://physicspeptalk.com",
  kcetComedkCourses: "https://physicspeptalk.com",
  counsellingEnrollment: "https://counselling.physicspeptalk.com/kcet/",
};

// ─── Cache ──────────────────────────────────────────────────────────────────

let _cached: ResourceLinks | null = null;
let _pending: Promise<ResourceLinks> | null = null;

// ─── Key normaliser ─────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

/**
 * Fetch the resource links from the spreadsheet.
 * Falls back to hardcoded URLs if the sheet is unavailable.
 * Results are module-level cached.
 */
export async function fetchResourceLinks(options?: {
  forceRefresh?: boolean;
}): Promise<ResourceLinks> {
  if (!options?.forceRefresh && _cached) return _cached;
  if (!options?.forceRefresh && _pending) return _pending;

  _pending = (async (): Promise<ResourceLinks> => {
    const { rows, error } = await fetchSheetRows(PUC_RESOURCES_GID);

    if (error || rows.length === 0) {
      _cached = { ...FALLBACK };
      _pending = null;
      return _cached;
    }

    const result: ResourceLinks = { ...FALLBACK };

    for (const row of rows) {
      // The header key is "variable name" after normalisation by the CSV parser
      const key = normalise(row["variable name"] ?? row["variable"] ?? "");
      const link = (row["links"] ?? row["link"] ?? "").trim();

      if (!isValidHttpUrl(link)) continue;

      if (key.includes("board")) {
        result.boardsCourses = link;
      } else if (key.includes("kcet") || key.includes("kcst") || key.includes("comedk") || key.includes("cet")) {
        result.kcetComedkCourses = link;
      } else if (key.includes("counsel")) {
        result.counsellingEnrollment = link;
      }
    }

    _cached = result;
    _pending = null;
    return _cached;
  })();

  return _pending;
}
