/**
 * courseService.ts
 *
 * Fetches and parses course records from the PUC Google Spreadsheet.
 *
 * Worksheet: GID 0 (first tab)
 * Columns (row 1 is the header):
 *   course links  →  URL of the course
 *   thumbnail     →  Image URL for the course thumbnail
 *   description   →  Short description of the course
 *
 * Header matching is case-insensitive and whitespace-normalised.
 */

import { fetchSheetRows, isValidHttpUrl, PUC_COURSES_GID } from "./googleSheets";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Course {
  /** URL to the course page */
  courseUrl: string;
  /** Thumbnail image URL */
  thumbnailUrl: string;
  /** Short course description */
  description: string;
}

export interface CourseServiceResult {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

// ─── Header key normaliser ─────────────────────────────────────────────────

/**
 * Normalise a header key: lowercase + collapse whitespace.
 * "course links" → "course links"
 * "Course Links " → "course links"
 */
function normaliseKey(key: string): string {
  return key.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Find the value for a header that starts with the given prefix.
 * Allows slight variations like "course link" vs "course links".
 */
function findByPrefix(row: Record<string, string>, prefix: string): string {
  const normPrefix = normaliseKey(prefix);
  for (const [key, value] of Object.entries(row)) {
    if (normaliseKey(key).startsWith(normPrefix)) return value;
  }
  return "";
}

// ─── Row parser ────────────────────────────────────────────────────────────

/**
 * Parse a raw sheet row into a Course object.
 * Returns null if the row lacks valid required fields.
 */
function parseCourseRow(row: Record<string, string>): Course | null {
  // Match headers case-insensitively
  const courseUrl =
    row["course links"] ||
    row["course link"] ||
    findByPrefix(row, "course");
  const thumbnailUrl =
    row["thumbnail"] ||
    row["thumbnail url"] ||
    findByPrefix(row, "thumbnail");
  const description =
    row["description"] ||
    row["desc"] ||
    findByPrefix(row, "description");

  if (!courseUrl && !description) return null;

  // Validate course URL
  const validCourseUrl = isValidHttpUrl(courseUrl) ? courseUrl : "";
  // Validate thumbnail URL
  const validThumbnailUrl = isValidHttpUrl(thumbnailUrl) ? thumbnailUrl : "";
  // Description must be non-empty
  const validDescription = description.trim();

  if (!validDescription && !validCourseUrl) return null;

  return {
    courseUrl: validCourseUrl,
    thumbnailUrl: validThumbnailUrl,
    description: validDescription,
  };
}

// ─── Fetch function ────────────────────────────────────────────────────────

/**
 * Fetch course records from the PUC spreadsheet.
 *
 * - Fetches GID 0 (courses worksheet).
 * - Skips rows that don't parse into valid courses.
 * - Never throws — returns error string in result on failure.
 */
export async function fetchCourses(): Promise<{
  courses: Course[];
  error: string | null;
}> {
  const { rows, error } = await fetchSheetRows(PUC_COURSES_GID);

  if (error) {
    return { courses: [], error };
  }

  const courses: Course[] = [];
  for (const row of rows) {
    const course = parseCourseRow(row);
    if (course) courses.push(course);
  }

  return { courses, error: null };
}
