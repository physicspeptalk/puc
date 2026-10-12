/**
 * blogService.ts
 *
 * Fetches and parses blog post records from the PUC Google Spreadsheet.
 *
 * Worksheet: PUC_BLOGS_GID (Blogs tab)
 * Expected columns (row 1 is the header, order is flexible):
 *   title        → Blog post title (required)
 *   slug         → URL-safe slug, e.g. "understanding-physics-basics" (required)
 *   published    → "true" / "yes" / "1" marks a post as published; else draft
 *   date         → ISO date string e.g. "2026-10-12" (optional)
 *   author       → Author name (optional, defaults to site name)
 *   excerpt      → Short summary for listing page cards (optional)
 *   content      → Full article body in Markdown (optional)
 *   cover_image  → Public image URL for the article cover (optional)
 *   tags         → Comma-separated tag list e.g. "physics,kcet,tips" (optional)
 *
 * Only rows where published === true/yes/1 are returned by fetchPublishedBlogs().
 *
 * Module-level promise cache: all callers (nav dropdown, listing page, article
 * page) share a single fetch per page load — no duplicate requests.
 */

import { fetchSheetRows, PUC_BLOGS_GID } from "./googleSheets";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface BlogPost {
  /** Display title of the blog post */
  title: string;
  /**
   * URL-safe slug used to build the article path.
   * Only lowercase alphanumeric characters and hyphens are permitted.
   */
  slug: string;
  /** Whether this post is published */
  published: boolean;
  /** ISO date string e.g. "2026-10-12", empty string if not provided */
  date: string;
  /** Author name */
  author: string;
  /** Short summary for listing page cards */
  excerpt: string;
  /** Full article body in Markdown */
  content: string;
  /** Optional cover image URL */
  coverImage: string;
  /** Parsed tag list */
  tags: string[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** The static "View All Blogs" URL */
export const BLOGS_LISTING_URL = "/blogs/";

const DEFAULT_AUTHOR = "Physics Pep Talk";

// ─── Slug validation ────────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return typeof slug === "string" && SLUG_RE.test(slug.trim());
}

/**
 * Build the canonical article path from a slug.
 * e.g. "understanding-physics" → "/blogs/understanding-physics/"
 */
export function buildBlogArticleUrl(slug: string): string {
  return `/blogs/${slug.trim()}/`;
}

// ─── Published check ────────────────────────────────────────────────────────

function isPublished(value: string): boolean {
  const v = (value ?? "").toLowerCase().trim();
  return v === "true" || v === "yes" || v === "1";
}

// ─── Tag parser ─────────────────────────────────────────────────────────────

function parseTags(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

// ─── Row parser ─────────────────────────────────────────────────────────────

function parseBlogRow(row: Record<string, string>): BlogPost | null {
  const title = (row["title"] ?? "").trim();
  const slug = (row["slug"] ?? "").trim().toLowerCase();
  const published = isPublished(row["published"] ?? "");

  // Required fields
  if (!title) return null;
  if (!isValidSlug(slug)) return null;

  return {
    title,
    slug,
    published,
    date: (row["date"] ?? "").trim(),
    author: (row["author"] ?? "").trim() || DEFAULT_AUTHOR,
    excerpt: (row["excerpt"] ?? row["description"] ?? "").trim(),
    content: (row["content"] ?? "").trim(),
    coverImage: (row["cover_image"] ?? row["cover image"] ?? "").trim(),
    tags: parseTags(row["tags"] ?? ""),
  };
}

// ─── Cache ──────────────────────────────────────────────────────────────────

let _cachedAll: { posts: BlogPost[]; error: string | null } | null = null;
let _pendingFetch: Promise<{ posts: BlogPost[]; error: string | null }> | null =
  null;

// ─── Core fetch (all rows) ───────────────────────────────────────────────────

/**
 * Fetch ALL blog rows (published + unpublished) from the spreadsheet.
 * Results are module-level cached for the page session.
 */
async function fetchAllBlogRows(forceRefresh = false): Promise<{
  posts: BlogPost[];
  error: string | null;
}> {
  if (!forceRefresh && _cachedAll) return _cachedAll;
  if (!forceRefresh && _pendingFetch) return _pendingFetch;

  _pendingFetch = (async () => {
    const { rows, error } = await fetchSheetRows(PUC_BLOGS_GID);

    if (error) {
      _cachedAll = { posts: [], error };
      _pendingFetch = null;
      return _cachedAll;
    }

    const posts: BlogPost[] = [];
    for (const row of rows) {
      const post = parseBlogRow(row);
      if (post) posts.push(post);
    }

    _cachedAll = { posts, error: null };
    _pendingFetch = null;
    return _cachedAll;
  })();

  return _pendingFetch;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch all published blog posts, sorted newest-first by date.
 * Used by: nav dropdown, blog listing page.
 */
export async function fetchPublishedBlogs(options?: {
  forceRefresh?: boolean;
}): Promise<{ posts: BlogPost[]; error: string | null }> {
  const { posts, error } = await fetchAllBlogRows(options?.forceRefresh);
  return {
    posts: posts
      .filter((p) => p.published)
      .sort((a, b) => {
        // Newest first; posts without a date go to the end
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      }),
    error,
  };
}

/**
 * Fetch a single published blog post by slug.
 * Used by: blog article page.
 * Returns null if not found or not published.
 */
export async function fetchBlogBySlug(
  slug: string,
  options?: { forceRefresh?: boolean }
): Promise<{ post: BlogPost | null; error: string | null }> {
  const { posts, error } = await fetchAllBlogRows(options?.forceRefresh);
  if (error) return { post: null, error };
  const post = posts.find((p) => p.slug === slug && p.published) ?? null;
  return { post, error: null };
}

/**
 * Clear the module-level cache (useful for testing).
 */
export function clearBlogCache(): void {
  _cachedAll = null;
  _pendingFetch = null;
}
