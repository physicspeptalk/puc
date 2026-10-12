/**
 * googleSheets.test.ts
 *
 * Unit tests for the PUC Google Sheets service utilities:
 *   - parseCsvToRows: CSV parsing
 *   - isValidHttpUrl: HTTP URL validation
 *   - isValidYouTubeUrl: YouTube URL validation
 *   - extractYouTubeId: YouTube ID extraction
 *   - splitCsvLine: CSV line splitting
 */

import { describe, it, expect } from "vitest";
import {
  parseCsvToRows,
  splitCsvLine,
  isValidHttpUrl,
  isValidYouTubeUrl,
  extractYouTubeId,
} from "../services/googleSheets";

// ─── parseCsvToRows ──────────────────────────────────────────────────────────

describe("parseCsvToRows", () => {
  it("parses a simple two-column sheet correctly", () => {
    const csv = `course links,thumbnail,description\nhttps://example.com,https://img.example.com/thumb.jpg,My Physics Course`;
    const rows = parseCsvToRows(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]["course links"]).toBe("https://example.com");
    expect(rows[0]["thumbnail"]).toBe("https://img.example.com/thumb.jpg");
    expect(rows[0]["description"]).toBe("My Physics Course");
  });

  it("normalises header keys to lowercase", () => {
    const csv = `Course Links,Thumbnail,Description\nhttps://example.com,https://thumb.com/img.jpg,Test`;
    const rows = parseCsvToRows(csv);
    expect(rows[0]).toHaveProperty("course links");
    expect(rows[0]).toHaveProperty("thumbnail");
    expect(rows[0]).toHaveProperty("description");
  });

  it("skips completely empty rows", () => {
    const csv = `course links,description\nhttps://a.com,Course A\n,,\nhttps://b.com,Course B\n`;
    const rows = parseCsvToRows(csv);
    expect(rows).toHaveLength(2);
  });

  it("handles rows with missing columns gracefully", () => {
    const csv = `course links,thumbnail,description\nhttps://example.com`;
    const rows = parseCsvToRows(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]["thumbnail"]).toBe("");
    expect(rows[0]["description"]).toBe("");
  });

  it("returns empty array for CSV with only a header row", () => {
    const csv = `course links,thumbnail,description\n`;
    const rows = parseCsvToRows(csv);
    expect(rows).toHaveLength(0);
  });

  it("returns empty array for empty CSV string", () => {
    expect(parseCsvToRows("")).toHaveLength(0);
  });

  it("handles Windows-style line endings (CRLF)", () => {
    const csv = "course links,description\r\nhttps://a.com,Course A\r\n";
    const rows = parseCsvToRows(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]["course links"]).toBe("https://a.com");
  });

  it("handles quoted fields with commas inside", () => {
    const csv = `youtube link,Captions\nhttps://youtu.be/dQw4w9WgXcQ,"This course, which covers Physics, is great"`;
    const rows = parseCsvToRows(csv);
    expect(rows[0]["captions"]).toBe("This course, which covers Physics, is great");
  });

  it("handles the feedback sheet column names case-insensitively", () => {
    const csv = `youtube link,Captions\nhttps://youtu.be/dQw4w9WgXcQ,Great course`;
    const rows = parseCsvToRows(csv);
    // Header "Captions" should be normalised to "captions"
    expect(rows[0]).toHaveProperty("captions");
    expect(rows[0]["youtube link"]).toBe("https://youtu.be/dQw4w9WgXcQ");
  });
});

// ─── splitCsvLine ────────────────────────────────────────────────────────────

describe("splitCsvLine", () => {
  it("splits a plain CSV line", () => {
    expect(splitCsvLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("handles quoted fields containing commas", () => {
    expect(splitCsvLine('"a,b",c')).toEqual(["a,b", "c"]);
  });

  it("handles escaped double-quotes inside quoted fields", () => {
    expect(splitCsvLine('"He said ""hello""",world')).toEqual(['He said "hello"', "world"]);
  });

  it("handles empty fields", () => {
    expect(splitCsvLine("a,,c")).toEqual(["a", "", "c"]);
  });

  it("handles a single field", () => {
    expect(splitCsvLine("hello")).toEqual(["hello"]);
  });
});

// ─── isValidHttpUrl ──────────────────────────────────────────────────────────

describe("isValidHttpUrl", () => {
  it("accepts https URLs", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("https://physicspeptalk.com/courses")).toBe(true);
  });

  it("accepts http URLs", () => {
    expect(isValidHttpUrl("http://example.com")).toBe(true);
  });

  it("rejects empty strings", () => {
    expect(isValidHttpUrl("")).toBe(false);
  });

  it("rejects javascript: URIs", () => {
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data: URIs", () => {
    expect(isValidHttpUrl("data:text/html,<h1>hello</h1>")).toBe(false);
  });

  it("rejects plain text (not a URL)", () => {
    expect(isValidHttpUrl("not a url")).toBe(false);
  });

  it("rejects null-like values", () => {
    expect(isValidHttpUrl(null as unknown as string)).toBe(false);
    expect(isValidHttpUrl(undefined as unknown as string)).toBe(false);
  });
});

// ─── isValidYouTubeUrl ───────────────────────────────────────────────────────

describe("isValidYouTubeUrl", () => {
  it("accepts youtube.com/watch?v= URLs", () => {
    expect(isValidYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts youtu.be/ short URLs", () => {
    expect(isValidYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts youtube.com/embed/ URLs", () => {
    expect(isValidYouTubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts youtube.com/shorts/ URLs", () => {
    expect(isValidYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(true);
  });

  it("rejects non-YouTube URLs", () => {
    expect(isValidYouTubeUrl("https://vimeo.com/12345678")).toBe(false);
    expect(isValidYouTubeUrl("https://example.com")).toBe(false);
  });

  it("rejects YouTube channel URLs (no video ID)", () => {
    // These are valid URLs but not video URLs with 11-char IDs
    expect(isValidYouTubeUrl("https://www.youtube.com/@physicspeptalk")).toBe(false);
  });

  it("rejects empty strings", () => {
    expect(isValidYouTubeUrl("")).toBe(false);
  });

  it("rejects malformed YouTube URLs with wrong-length ID", () => {
    expect(isValidYouTubeUrl("https://youtu.be/short")).toBe(false);
    expect(isValidYouTubeUrl("https://youtu.be/toolongvideoidhere123")).toBe(false);
  });
});

// ─── extractYouTubeId ────────────────────────────────────────────────────────

describe("extractYouTubeId", () => {
  it("extracts video ID from youtube.com/watch?v=", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from youtu.be/ short URL", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from youtube.com/embed/", () => {
    expect(extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from youtube.com/shorts/", () => {
    expect(extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from URL with extra query params", () => {
    expect(
      extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&index=2")
    ).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from youtu.be with query params", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=30")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for non-YouTube URLs", () => {
    expect(extractYouTubeId("https://vimeo.com/12345678")).toBeNull();
    expect(extractYouTubeId("https://example.com")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractYouTubeId("")).toBeNull();
  });

  it("returns null for youtube channel URL (no video ID)", () => {
    expect(extractYouTubeId("https://www.youtube.com/@physicspeptalk")).toBeNull();
  });

  it("returns null for malformed URL", () => {
    expect(extractYouTubeId("not a url")).toBeNull();
  });

  it("returns null for javascript: URI", () => {
    expect(extractYouTubeId("javascript:alert(1)")).toBeNull();
  });
});
