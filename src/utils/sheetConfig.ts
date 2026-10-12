/**
 * sheetConfig.ts
 *
 * Fetches remote config variables from a published Google Sheet.
 *
 * Sheet format expected (first tab named "config"):
 *   Column A  →  variable name   (e.g.  year)
 *   Column B  →  value           (e.g.  2027)
 *
 * How to publish the sheet as CSV:
 *   1. Open the Google Sheet.
 *   2. File → Share → Publish to web.
 *   3. Choose the "config" sheet, format "Comma-separated values (.csv)".
 *   4. Click Publish, copy the URL that appears.
 *      It will look like:
 *      https://docs.google.com/spreadsheets/d/<SHEET_ID>/pub?gid=<GID>&single=true&output=csv
 *   5. Paste the SHEET_ID below.  The gid for the first tab is usually 0.
 *
 * Alternatively, supply only SHEET_ID and let the helper build the URL.
 */

// ─────────────────────────────────────────────
// 🔧 PUBLISHED CSV URL FROM GOOGLE SHEETS
// File → Share → Publish to web → config tab → CSV → copy URL
// ─────────────────────────────────────────────
export const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmHp8RxfvBaCKLclbIOrkb2S58aAJY62p-9N5PtDdbRuIQ65QYdKkWbFsuVn0yuym8bQ71msKTmNzD/pub?output=csv";

// Keep SHEET_ID for backwards compatibility (unused now)
export const SHEET_ID = SHEET_CSV_URL;

/** A plain key→value map returned to callers. */
export type SheetConfig = Record<string, string>;

/**
 * Fetch and parse the config sheet.
 *
 * Returns an empty object (never throws) if the fetch fails — the app
 * falls back to siteConfig defaults automatically.
 */
export async function fetchSheetConfig(
  csvUrl: string = SHEET_CSV_URL
): Promise<SheetConfig> {
  if (!csvUrl || csvUrl === "YOUR_GOOGLE_SHEET_CSV_URL_HERE") {
    console.warn(
      "[sheetConfig] No published CSV URL configured. " +
        "Set SHEET_CSV_URL in src/utils/sheetConfig.ts to enable remote config."
    );
    return {};
  }

  try {
    // Append a timestamp to bust Google's server-side publish cache.
    // Without this, Google can serve a stale CSV for up to 5 minutes
    // even after you save changes in the sheet.
    const bustUrl = `${csvUrl}&_cb=${Date.now()}`;
    const response = await fetch(bustUrl, { cache: "no-cache" });

    if (!response.ok) {
      console.warn(
        `[sheetConfig] Failed to fetch config (HTTP ${response.status}). Using defaults.`
      );
      return {};
    }

    const text = await response.text();
    console.log("[sheetConfig] Raw CSV:", text);
    const parsed = parseCsv(text);
    console.log("[sheetConfig] Parsed config:", parsed);
    return parsed;
  } catch (err) {
    console.warn("[sheetConfig] Fetch error — using defaults.", err);
    return {};
  }
}

/**
 * Parse a two-column CSV (key, value) into a plain object.
 * Skips blank rows and the header row if the first cell is "variable" or "key".
 */
function parseCsv(csv: string): SheetConfig {
  const config: SheetConfig = {};

  const lines = csv.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;

    const cols = splitCsvLine(line);
    if (cols.length < 2) continue;

    const key = cols[0].trim().toLowerCase();
    const value = cols[1].trim();

    // Skip header rows — any row whose key contains a space or matches
    // common heading words is not a real config entry.
    if (!key) continue;
    if (key.includes(" ")) continue;   // "variable name", "key name", etc.
    if (key === "variable" || key === "key" || key === "name") continue;

    config[key] = value;
  }

  return config;
}

/**
 * Minimal CSV line splitter that handles double-quoted fields.
 * Handles: plain values, "quoted, values", and ""escaped quotes"".
 */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped double-quote inside a quoted field
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
