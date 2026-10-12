/**
 * googleSheets.ts
 *
 * Base utility for fetching and parsing Google Sheets data as CSV.
 *
 * PUC Spreadsheet:
 *   ID: 14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg
 *
 * Access method: Google Visualization API (gviz/tq?tqx=out:csv)
 *   - Requires the spreadsheet sharing set to "Anyone with the link can view"
 *   - No "Publish to web" step needed
 *   - No API key required
 *
 * GIDs used:
 *   GID 0            → Courses worksheet (course links | thumbnail | description)
 *   GID 1342071564   → Feedback worksheet (youtube link | Captions)
 */

// ─── Spreadsheet configuration ─────────────────────────────────────────────

/**
 * The PUC spreadsheet ID (from the Google Sheets URL).
 * Spreadsheet: https://docs.google.com/spreadsheets/d/14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg
 */
export const PUC_SPREADSHEET_ID = "14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg";

/**
 * Base URL for the PUC spreadsheet CSV export via Google Visualization API.
 *
 * This uses the gviz/tq endpoint which works as long as the spreadsheet
 * is shared as "Anyone with the link can view". No "Publish to web" step
 * needed, and no API key required.
 *
 * URL format: /gviz/tq?tqx=out:csv&gid=<GID>
 */
export const PUC_SHEET_BASE_URL =
  `https://docs.google.com/spreadsheets/d/${PUC_SPREADSHEET_ID}/gviz/tq`;

export const PUC_COURSES_GID = "0";
export const PUC_FEEDBACK_GID = "1342071564";

// ─── Types ─────────────────────────────────────────────────────────────────

/** A parsed row as a header→value map. Headers are normalised (lowercase, trimmed). */
export type SheetRow = Record<string, string>;

/** Result of a sheet fetch operation */
export interface SheetFetchResult {
  rows: SheetRow[];
  error: string | null;
}

// ─── URL builder ───────────────────────────────────────────────────────────

/**
 * Build the CSV export URL for a specific worksheet GID.
 *
 * Uses the Google Visualization API (gviz/tq) which works with
 * "Anyone with the link can view" sharing — no publish-to-web needed.
 */
export function buildSheetCsvUrl(gid: string): string {
  return `${PUC_SHEET_BASE_URL}?tqx=out:csv&gid=${gid}`;
}

// ─── Fetcher ────────────────────────────────────────────────────────────────

/**
 * Fetch and parse a Google Sheet worksheet as an array of row objects.
 *
 * - Row 1 is treated as the header row; keys are normalised to lowercase + trimmed.
 * - Completely empty rows are skipped.
 * - Never throws — returns error string in result on failure.
 */
export async function fetchSheetRows(gid: string): Promise<SheetFetchResult> {
  const url = buildSheetCsvUrl(gid);
  const bustUrl = `${url}&_cb=${Date.now()}`;

  try {
    const response = await fetch(bustUrl, { cache: "no-cache" });

    if (!response.ok) {
      return {
        rows: [],
        error: `HTTP ${response.status}: Failed to fetch worksheet GID ${gid}`,
      };
    }

    const text = await response.text();

    if (!text.trim()) {
      return { rows: [], error: null };
    }

    const rows = parseCsvToRows(text);
    return { rows, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      rows: [],
      error: `Network error fetching GID ${gid}: ${msg}`,
    };
  }
}

// ─── CSV Parser ─────────────────────────────────────────────────────────────

/**
 * Parse a CSV string (with header row) into an array of row objects.
 * Header keys are lowercased and trimmed.
 * Empty rows are skipped.
 */
export function parseCsvToRows(csv: string): SheetRow[] {
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse header row
  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());

  const rows: SheetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cells = splitCsvLine(line).map((c) => c.trim());

    // Skip row if all cells are empty
    if (cells.every((c) => !c)) continue;

    const row: SheetRow = {};
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) {
        row[headers[j]] = cells[j] ?? "";
      }
    }
    rows.push(row);
  }

  return rows;
}

/**
 * Minimal RFC 4180-compliant CSV line splitter.
 * Handles: plain values, "quoted, values", and ""escaped double quotes"".
 */
export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result;
}

// ─── URL validators ─────────────────────────────────────────────────────────

/**
 * Validate that a string is a safe HTTP(S) URL.
 * Returns false for empty strings, javascript: URIs, data: URIs, etc.
 */
export function isValidHttpUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Validate that a string is a valid YouTube video URL.
 * Accepts: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!isValidHttpUrl(url)) return false;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id);
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return true;
      // /embed/ID or /shorts/ID
      const match = u.pathname.match(/\/(embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      return match !== null;
    }
  } catch {
    // fall through
  }
  return false;
}

/**
 * Extract the YouTube video ID from various URL formats.
 * Returns null if the URL is not a valid YouTube URL or the ID cannot be extracted.
 */
export function extractYouTubeId(url: string): string | null {
  if (!isValidHttpUrl(url)) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const match = u.pathname.match(/\/(embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[2];
    }
  } catch {
    // fall through
  }
  return null;
}
