/**
 * KCET Google Sheets Data Service
 *
 * Fetches and normalizes college + cutoff data from a publicly shared
 * Google Sheet (CSV export endpoint).
 *
 * ⚠️  CONFIGURATION REQUIRED ⚠️
 * Before this feature will work, you MUST:
 * 1. Set KCET_SHEET_SPREADSHEET_ID to your Google Sheet's ID
 *    (the long string in the URL: docs.google.com/spreadsheets/d/THIS_PART/edit)
 * 2. Set KCET_SHEET_GID to the gid= value of the specific tab
 *    (visible in the URL when you select the tab: ?gid=THIS_PART)
 * 3. Make the Google Sheet publicly accessible:
 *    File → Share → General access → "Anyone with the link" (Viewer)
 *
 * Data source: Karnataka Examinations Authority (KEA)
 * Round: UGCET 2026 Third Round Provisional Allotment
 */

// ---------------------------------------------------------------------------
// ⚠️ PLACEHOLDER — FILL IN BEFORE DEPLOYING ⚠️
// ---------------------------------------------------------------------------
const KCET_SHEET_SPREADSHEET_ID = "1s5b70GeX9TvfjEBd6-0_-t-P9HuJ9H5wPida_W7ciiU";

const KCET_SHEET_GID = "584552781";
// ---------------------------------------------------------------------------

/**
 * The CSV export URL pattern for a public Google Sheet.
 * Replace SPREADSHEET_ID and GID with real values above.
 */
function buildSheetCsvUrl(spreadsheetId: string, gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
}

// ---------------------------------------------------------------------------
// Column name constants (must match the Google Sheet headers exactly)
// ---------------------------------------------------------------------------

const COL_COLLEGE_CODE = "College Code";
const COL_COLLEGE_NAME = "College / Institution (as printed by KEA)";
const COL_BRANCH = "Branch / Course";
const COL_RK_PDF_PAGE = "RK PDF Page";
const COL_H_PDF_PAGE = "371(J) PDF Page";

/**
 * All expected RK (Rest of Karnataka) category columns in the KEA dataset.
 * These are read dynamically from the sheet headers, but this list is used
 * to validate that required columns are present.
 */
export const EXPECTED_RK_CATEGORIES = [
  "1G", "1K", "1R",
  "2AG", "2AK", "2AR",
  "2BG", "2BK", "2BR",
  "3AG", "3AK", "3AR",
  "3BG", "3BK", "3BR",
  "GM", "GMK", "GMP", "GMR",
  "NRI", "OPN", "OTH",
  "S1G", "S1K", "S1R",
  "S2G", "S2K", "S2R",
  "S3G", "S3K", "S3R",
  "S4G", "S4K", "S4R",
  "STG", "STK", "STR",
] as const;

/**
 * All expected 371(J) Kalyana Karnataka category columns.
 */
export const EXPECTED_H_CATEGORIES = [
  "1H", "1KH", "1RH",
  "2AH", "2AKH", "2ARH",
  "2BH", "2BKH", "2BRH",
  "3AH", "3AKH", "3ARH",
  "3BH", "3BKH", "3BRH",
  "GMH", "GMKH", "GMPH", "GMRH",
  "S1H", "S1KH", "S1RH",
  "S2H", "S2KH", "S2RH",
  "S3H", "S3KH", "S3RH",
  "S4H", "S4KH", "S4RH",
  "STH", "STKH", "STRH",
] as const;

export type RKCategory = typeof EXPECTED_RK_CATEGORIES[number];
export type HCategory = typeof EXPECTED_H_CATEGORIES[number];
export type KcetCategory = RKCategory | HCategory;

/**
 * Maps each RK category to its 371(J) H equivalent.
 * Built from the actual category lists — not guessed.
 * Pattern: remove trailing G/K/R/GK suffix, then append H suffix.
 *
 * Mapping rules derived from the official KEA dataset structure:
 *   1G → 1H, 1K → 1KH, 1R → 1RH
 *   2AG → 2AH, 2AK → 2AKH, 2AR → 2ARH
 *   etc.
 */
export const RK_TO_H_MAP: Partial<Record<RKCategory, HCategory>> = {
  "1G": "1H",   "1K": "1KH",   "1R": "1RH",
  "2AG": "2AH", "2AK": "2AKH", "2AR": "2ARH",
  "2BG": "2BH", "2BK": "2BKH", "2BR": "2BRH",
  "3AG": "3AH", "3AK": "3AKH", "3AR": "3ARH",
  "3BG": "3BH", "3BK": "3BKH", "3BR": "3BRH",
  "GM":  "GMH", "GMK": "GMKH", "GMP": "GMPH", "GMR": "GMRH",
  "S1G": "S1H", "S1K": "S1KH", "S1R": "S1RH",
  "S2G": "S2H", "S2K": "S2KH", "S2R": "S2RH",
  "S3G": "S3H", "S3K": "S3KH", "S3R": "S3RH",
  "S4G": "S4H", "S4K": "S4KH", "S4R": "S4RH",
  "STG": "STH", "STK": "STKH", "STR": "STRH",
  // NRI, OPN, OTH do not have corresponding H categories in the dataset
};

// ---------------------------------------------------------------------------
// Normalized row type
// ---------------------------------------------------------------------------

export type CutoffMap = Record<string, number | null>;

export interface KcetCollegeRow {
  collegeCode: string;
  collegeName: string;
  branch: string;
  rkPdfPage: string | null;
  hPdfPage: string | null;
  /** All category cutoff values. Key = category code, value = rank or null. */
  cutoffs: CutoffMap;
}

// ---------------------------------------------------------------------------
// Data loading state
// ---------------------------------------------------------------------------

export type DataStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; rows: KcetCollegeRow[]; detectedCategories: string[]; loadedAt: Date }
  | { state: "error"; message: string };

// ---------------------------------------------------------------------------
// CSV parsing utilities
// ---------------------------------------------------------------------------

/**
 * Parse a raw CSV string into an array of row objects.
 * Handles quoted fields (including commas inside quotes) per RFC 4180.
 *
 * The KEA Google Sheet has TWO header rows:
 *   Row 1: Merged group labels ("College / Branch", "Rest of Karnataka…", "371(J)…")
 *   Row 2: Actual column names ("College Code", "1G", "GM", "GMH", etc.)
 *
 * We detect this by checking whether row 1 contains any known category column
 * names. If it doesn't (i.e. it's a group-label row), we skip it and use
 * row 2 as the real header row.
 */
function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];

  const allKnownCategories = new Set([
    ...EXPECTED_RK_CATEGORIES,
    ...EXPECTED_H_CATEGORIES,
  ]);

  // Parse first line as candidate headers
  const firstLineValues = parseCSVLine(lines[0]);
  const firstLineTrimmed = firstLineValues.map((v) => v.trim());

  // Check if first row contains any real category column names
  const firstLineHasCategories = firstLineTrimmed.some((h) =>
    allKnownCategories.has(h as KcetCategory)
  );

  // Also check if it contains the real structural column names
  const firstLineHasStructural = firstLineTrimmed.includes("College Code") ||
    firstLineTrimmed.includes(COL_COLLEGE_CODE);

  let headers: string[];
  let dataStartLine: number;

  if (!firstLineHasCategories && !firstLineHasStructural) {
    // Row 1 is a group-label row — use row 2 as headers, data starts at row 3
    if (lines.length < 3) return [];
    headers = parseCSVLine(lines[1]).map((v) => v.trim());
    dataStartLine = 2;
  } else {
    // Row 1 is already the real header row
    headers = firstLineTrimmed;
    dataStartLine = 1;
  }

  const rows: Record<string, string>[] = [];

  for (let i = dataStartLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] ?? "").trim();
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Parse a cutoff rank value from the sheet.
 * "--" (no allocation) → null
 * Empty string → null
 * Numeric string → number
 */
function parseCutoffValue(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "--" || trimmed === "" || trimmed === "-") return null;

  const num = parseInt(trimmed, 10);
  if (Number.isNaN(num) || num <= 0) return null;
  return num;
}

// ---------------------------------------------------------------------------
// Normalize a CSV row to KcetCollegeRow
// ---------------------------------------------------------------------------

function normalizeRow(
  raw: Record<string, string>,
  categoryColumns: string[]
): KcetCollegeRow | null {
  const collegeCode = raw[COL_COLLEGE_CODE]?.trim();
  const collegeName = raw[COL_COLLEGE_NAME]?.trim();
  const branch = raw[COL_BRANCH]?.trim();

  // Skip rows without a college code (likely blank/header rows)
  if (!collegeCode || !collegeName || !branch) return null;

  const rkPdfPage = raw[COL_RK_PDF_PAGE]?.trim() || null;
  const hPdfPage = raw[COL_H_PDF_PAGE]?.trim() || null;

  const cutoffs: CutoffMap = {};
  for (const cat of categoryColumns) {
    cutoffs[cat] = parseCutoffValue(raw[cat] ?? "");
  }

  return {
    collegeCode,
    collegeName,
    branch,
    rkPdfPage,
    hPdfPage,
    cutoffs,
  };
}

// ---------------------------------------------------------------------------
// Detect category columns from sheet headers
// ---------------------------------------------------------------------------

/**
 * From the list of CSV headers, extract columns that look like category codes.
 * These are headers that match any known RK or H category.
 * Returns only the categories that actually exist in the sheet.
 */
function detectCategoryColumns(headers: string[]): string[] {
  const allKnown = new Set([
    ...EXPECTED_RK_CATEGORIES,
    ...EXPECTED_H_CATEGORIES,
  ]);
  return headers.filter((h) => allKnown.has(h as KcetCategory));
}

// ---------------------------------------------------------------------------
// Fetch & parse
// ---------------------------------------------------------------------------

let _cache: DataStatus = { state: "idle" };

/**
 * Fetch and normalize KCET college/cutoff data from Google Sheets.
 * Data is fetched once and cached in memory.
 * Call resetDataCache() to force a re-fetch.
 */
export async function loadKcetData(): Promise<DataStatus> {
  if (_cache.state === "ready") return _cache;
  if (_cache.state === "loading") {
    // Wait for existing load to complete
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (_cache.state !== "loading") {
          clearInterval(check);
          resolve(_cache);
        }
      }, 100);
    });
  }

  _cache = { state: "loading" };

  try {
    // Validate config
    if (
      (KCET_SHEET_SPREADSHEET_ID as string) === "REPLACE_WITH_YOUR_SPREADSHEET_ID" ||
      (KCET_SHEET_GID as string) === "REPLACE_WITH_YOUR_SHEET_GID"
    ) {
      _cache = {
        state: "error",
        message:
          "Google Sheet is not configured. Please provide the spreadsheet ID and GID in src/services/kcetData.ts.",
      };
      return _cache;
    }

    const url = buildSheetCsvUrl(KCET_SHEET_SPREADSHEET_ID, KCET_SHEET_GID);

    let response: Response;
    try {
      response = await fetch(url, {
        cache: "default",
        headers: { Accept: "text/csv" },
      });
    } catch (networkError) {
      _cache = {
        state: "error",
        message:
          "College cutoff data is temporarily unavailable. Please check your internet connection and try again.",
      };
      console.error("[kcetData] Network error fetching sheet:", networkError);
      return _cache;
    }

    if (!response.ok) {
      const hint =
        response.status === 403 || response.status === 401
          ? " Make sure the Google Sheet is shared publicly (Anyone with the link → Viewer)."
          : "";
      _cache = {
        state: "error",
        message: `College cutoff data is temporarily unavailable (HTTP ${response.status}).${hint}`,
      };
      console.error("[kcetData] HTTP error:", response.status, response.statusText);
      return _cache;
    }

    const csvText = await response.text();
    if (!csvText || csvText.trim().length === 0) {
      _cache = {
        state: "error",
        message:
          "College cutoff data is temporarily unavailable. The data source returned an empty response.",
      };
      return _cache;
    }

    // Parse CSV
    const rawRows = parseCSV(csvText);
    if (rawRows.length === 0) {
      _cache = {
        state: "error",
        message: "College cutoff data could not be parsed. The sheet may be empty.",
      };
      return _cache;
    }

    // Detect category columns from the actual headers
    const headers = Object.keys(rawRows[0]);
    const categoryColumns = detectCategoryColumns(headers);

    if (categoryColumns.length === 0) {
      _cache = {
        state: "error",
        message:
          "Required cutoff columns were not found in the data source. Expected columns like GM, 1G, 2AG etc.",
      };
      return _cache;
    }

    // Normalize all rows
    const rows: KcetCollegeRow[] = [];
    for (const raw of rawRows) {
      const row = normalizeRow(raw, categoryColumns);
      if (row) rows.push(row);
    }

    if (rows.length === 0) {
      _cache = {
        state: "error",
        message:
          "No college rows could be loaded from the data source. Check that the sheet has the expected columns.",
      };
      return _cache;
    }

    _cache = {
      state: "ready",
      rows,
      detectedCategories: categoryColumns,
      loadedAt: new Date(),
    };
    console.info(
      `[kcetData] Loaded ${rows.length} college+branch rows. Categories detected: ${categoryColumns.join(", ")}`
    );
    return _cache;
  } catch (err) {
    _cache = {
      state: "error",
      message:
        "College cutoff data is temporarily unavailable. Please try again later.",
    };
    console.error("[kcetData] Unexpected error:", err);
    return _cache;
  }
}

/**
 * Force a re-fetch of the data on next loadKcetData() call.
 */
export function resetDataCache(): void {
  _cache = { state: "idle" };
}

/**
 * Get the current cache state without triggering a load.
 */
export function getDataCacheStatus(): DataStatus {
  return _cache;
}

// ---------------------------------------------------------------------------
// Category helpers for the UI
// ---------------------------------------------------------------------------

/**
 * Given the detected category columns from the sheet, return:
 *  - rkCategories: the RK (Rest of Karnataka) subset
 *  - hCategories:  the 371(J) H subset
 */
export function splitCategoriesByType(detected: string[]): {
  rkCategories: string[];
  hCategories: string[];
} {
  const rkSet = new Set<string>(EXPECTED_RK_CATEGORIES);
  const hSet = new Set<string>(EXPECTED_H_CATEGORIES);

  return {
    rkCategories: detected.filter((c) => rkSet.has(c)),
    hCategories: detected.filter((c) => hSet.has(c)),
  };
}

/**
 * Given a student's base RK category and their 371(J) status,
 * return the effective category column to look up in the cutoffs.
 *
 * If 371(J) = true, attempts to map the RK category to its H equivalent.
 * If no H mapping exists (e.g. NRI, OPN, OTH), returns null and the UI
 * should inform the user that no 371(J) column exists for this category.
 */
export function resolveEffectiveCategory(
  baseCategory: string,
  is371J: boolean
): { category: string; seatType: string } | null {
  if (!is371J) {
    return { category: baseCategory, seatType: "Rest of Karnataka" };
  }

  const hCategory = RK_TO_H_MAP[baseCategory as RKCategory];
  if (!hCategory) {
    // No H mapping available for this category
    return null;
  }

  return {
    category: hCategory,
    seatType: "371(J) Kalyana Karnataka",
  };
}
