/**
 * testimonialService.ts
 *
 * Fetches and parses student/parent feedback from the PUC Google Spreadsheet.
 *
 * Worksheet: GID 1342071564
 * Columns (row 1 is the header):
 *   youtube link  →  YouTube video URL
 *   Captions      →  Student / parent feedback caption
 *
 * Header matching is case-insensitive and whitespace-normalised.
 *
 * Security: YouTube video IDs are extracted and validated before constructing
 * any iframe src. Raw spreadsheet URLs are NEVER used directly in iframes.
 */

import {
  fetchSheetRows,
  extractYouTubeId,
  isValidYouTubeUrl,
  PUC_FEEDBACK_GID,
} from "./googleSheets";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PucTestimonial {
  /** Original YouTube URL from the sheet (validated) */
  youtubeUrl: string;
  /** Extracted YouTube video ID (11 chars) */
  videoId: string;
  /** Safe embed URL constructed from validated video ID */
  embedUrl: string;
  /** YouTube thumbnail URL */
  thumbnailUrl: string;
  /** Caption / feedback text from the sheet */
  caption: string;
}

// ─── Row parser ────────────────────────────────────────────────────────────

/**
 * Parse a raw sheet row into a PucTestimonial object.
 * Returns null if the YouTube URL is missing or invalid.
 */
function parseTestimonialRow(row: Record<string, string>): PucTestimonial | null {
  // Match headers case-insensitively
  const youtubeUrl =
    row["youtube link"] ||
    row["youtube url"] ||
    row["youtube_url"] ||
    row["link"] ||
    "";
  const caption =
    row["captions"] ||
    row["caption"] ||
    row["title"] ||
    row["feedback"] ||
    "";

  // Only accept rows with a valid YouTube URL
  if (!youtubeUrl || !isValidYouTubeUrl(youtubeUrl)) return null;

  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) return null;

  return {
    youtubeUrl,
    videoId,
    // Build embed URL from the validated video ID — never from the raw sheet URL
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    caption: caption.trim(),
  };
}

// ─── Fetch function ────────────────────────────────────────────────────────

/**
 * Fetch student/parent feedback from the PUC spreadsheet.
 *
 * - Fetches GID 1342071564 (feedback worksheet).
 * - Validates each YouTube URL before including the record.
 * - Constructs embed URLs from validated video IDs only.
 * - Never throws — returns error string in result on failure.
 */
export async function fetchPucTestimonials(): Promise<{
  testimonials: PucTestimonial[];
  error: string | null;
}> {
  const { rows, error } = await fetchSheetRows(PUC_FEEDBACK_GID);

  if (error) {
    return { testimonials: [], error };
  }

  const testimonials: PucTestimonial[] = [];
  for (const row of rows) {
    const testimonial = parseTestimonialRow(row);
    if (testimonial) testimonials.push(testimonial);
  }

  return { testimonials, error: null };
}
