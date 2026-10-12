/**
 * testimonialsConfig.ts
 *
 * Fetches testimonial video entries from the second tab of the Google Sheet.
 *
 * Sheet format (gid=1725574858):
 *   Row 1    →  header row (skipped)
 *   Column A →  youtube_url   (e.g. https://www.youtube.com/watch?v=xxx)
 *   Column B →  title         (e.g. "Student Review — KCET 2026")
 */

import { SHEET_CSV_URL } from "./sheetConfig";

// GID of the testimonials tab
const TESTIMONIALS_GID = "1725574858";

export interface Testimonial {
  title: string;
  youtubeUrl: string;
  /** Derived embed URL (youtube.com/embed/VIDEO_ID) */
  embedUrl: string;
  /** Derived thumbnail from YouTube */
  thumbnailUrl: string;
}

/** Build the CSV URL for the testimonials tab */
function buildTestimonialsCsvUrl(): string {
  // SHEET_CSV_URL looks like:
  // https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
  // We replace/add the gid param for the testimonials tab.
  const base = SHEET_CSV_URL.split("?")[0];
  return `${base}?gid=${TESTIMONIALS_GID}&single=true&output=csv`;
}

/**
 * Extract the YouTube video ID from various URL formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/watch?v=VIDEO_ID&list=...&index=...
 */
function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1);
    }
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
  } catch {
    // not a valid URL
  }
  return null;
}

/**
 * Fetch and parse testimonials from the sheet.
 * Returns an empty array (never throws) if the fetch fails.
 */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const url = buildTestimonialsCsvUrl();
    const bustUrl = `${url}&_cb=${Date.now()}`;
    const response = await fetch(bustUrl, { cache: "no-cache" });

    if (!response.ok) {
      console.warn(`[testimonials] HTTP ${response.status} — skipping.`);
      return [];
    }

    const text = await response.text();
    return parseTestimonialsCsv(text);
  } catch (err) {
    console.warn("[testimonials] Fetch error — skipping.", err);
    return [];
  }
}

function parseTestimonialsCsv(csv: string): Testimonial[] {
  const results: Testimonial[] = [];
  const lines = csv.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = splitCsvLine(line);
    if (cols.length < 2) continue;

    const colA = cols[0].trim();
    const colB = cols[1].trim();

    // Skip header row — if either cell looks like a heading word, not a URL
    if (!colA.startsWith("http")) continue;

    const youtubeUrl = colA;
    const title = colB || "Student Testimonial";

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) continue;

    results.push({
      title,
      youtubeUrl,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    });
  }

  return results;
}

/** Minimal CSV line splitter (handles quoted fields) */
function splitCsvLine(line: string): string[] {
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
