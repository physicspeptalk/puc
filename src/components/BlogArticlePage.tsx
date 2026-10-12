/**
 * BlogArticlePage.tsx
 *
 * Renders a single blog article at /blogs/:slug/
 *
 * - Fetches the post from Google Sheets via blogService
 * - Renders the `content` column as Markdown using `marked`
 * - Sanitizes the rendered HTML (strips script tags, on* handlers)
 * - Shows loading / not-found / error states gracefully
 */

import { useState, useEffect } from "react";
import { marked } from "marked";
import {
  fetchBlogBySlug,
  BLOGS_LISTING_URL,
  type BlogPost,
} from "../services/blogService";

// ─── Marked configuration ─────────────────────────────────────────────────────

// marked v15 uses synchronous parse by default — no configuration needed.

// ─── Minimal HTML sanitizer ───────────────────────────────────────────────────

/**
 * Strip dangerous patterns from a raw HTML string.
 * - Removes <script> blocks
 * - Removes on* event handler attributes
 * - Removes javascript: hrefs
 * This is a lightweight defence-in-depth layer; Markdown itself
 * doesn't normally produce these patterns.
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s+on\w+="[^"]*"/gi, "")
    .replace(/\s+on\w+='[^']*'/gi, "")
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
    .replace(/href='javascript:[^']*'/gi, "href='#'");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: string): string {
  if (!raw || !raw.trim()) return "";

  // Try parsing as-is first (works for ISO 8601: YYYY-MM-DD)
  let d = new Date(raw);

  // Google Sheets often exports as DD-MM-YYYY or MM-DD-YYYY
  if (isNaN(d.getTime())) {
    const parts = raw.trim().split(/[-/]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(Number);
      if (c > 100) {
        d = new Date(c, b - 1, a);
      }
    }
  }

  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderMarkdown(md: string): string {
  if (!md) return "";
  const raw = marked.parse(md) as string;
  return sanitizeHtml(raw);
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function ArticleSkeleton() {
  return (
    <div className="animate-pulse max-w-3xl mx-auto">
      <div className="h-4 bg-surface-100 dark:bg-surface-700 rounded w-1/5 mb-8" />
      <div className="h-8 bg-surface-100 dark:bg-surface-700 rounded w-3/4 mb-3" />
      <div className="h-5 bg-surface-100 dark:bg-surface-700 rounded w-1/2 mb-8" />
      <div className="aspect-video bg-surface-100 dark:bg-surface-700 rounded-2xl mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-surface-100 dark:bg-surface-700 rounded"
            style={{ width: `${70 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Article ──────────────────────────────────────────────────────────────────

function Article({ post }: { post: BlogPost }) {
  const html = renderMarkdown(post.content);

  return (
    <article className="max-w-3xl mx-auto" aria-label={post.title}>
      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-surface-900 dark:text-white leading-[1.1] tracking-tight mb-4 text-balance">
        {post.title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-surface-400 dark:text-surface-500 mb-8 pb-8 border-b border-surface-100 dark:border-surface-700">
        <span className="font-semibold text-surface-600 dark:text-surface-300">{post.author}</span>
        {post.date && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </>
        )}
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div className="mb-8 rounded-2xl overflow-hidden aspect-video bg-surface-50 dark:bg-surface-800">
          <img
            src={post.coverImage}
            alt={`Cover image for ${post.title}`}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* Body */}
      {html ? (
        <div
          className="prose prose-slate prose-lg max-w-none
            dark:prose-invert
            prose-headings:font-bold prose-headings:text-surface-900
            dark:prose-headings:text-white
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-surface-700 dark:prose-p:text-surface-300 prose-p:leading-relaxed
            prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-surface-900 dark:prose-strong:text-white
            prose-blockquote:border-primary-400 prose-blockquote:text-surface-600 dark:prose-blockquote:text-surface-300
            prose-code:text-primary-700 dark:prose-code:text-primary-300 prose-code:bg-primary-50 dark:prose-code:bg-primary-950/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-surface-900 dark:prose-pre:bg-surface-950 prose-pre:text-surface-100 prose-pre:rounded-xl
            prose-img:rounded-xl prose-img:shadow-sm
            prose-li:text-surface-700 dark:prose-li:text-surface-300
            prose-hr:border-surface-200 dark:prose-hr:border-surface-700"
          // Content comes from our own Google Sheets + has been sanitized
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-surface-400 dark:text-surface-500 italic">No content yet.</p>
      )}
    </article>
  );
}

// ─── Dark mode toggle button ──────────────────────────────────────────────────

function DarkToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
    >
      {dark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface BlogArticlePageProps {
  slug: string;
  dark: boolean;
  onToggleDark: () => void;
}

export default function BlogArticlePage({ slug, dark, onToggleDark }: BlogArticlePageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    fetchBlogBySlug(slug)
      .then(({ post: fetched, error: err }) => {
        if (err) {
          setError(err);
        } else if (!fetched) {
          setNotFound(true);
        } else {
          setPost(fetched);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load post");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900">
      {/* Top bar */}
      <div className="border-b border-surface-100 dark:border-surface-800 bg-white/95 dark:bg-surface-900/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <a
            href="/"
            className="flex-shrink-0 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Physics Pep Talk
          </a>
          <span className="text-surface-300 dark:text-surface-600" aria-hidden="true">/</span>
          <a
            href={BLOGS_LISTING_URL}
            className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Blog
          </a>
          {post && (
            <>
              <span className="text-surface-300 dark:text-surface-600" aria-hidden="true">/</span>
              <span className="text-sm text-surface-400 dark:text-surface-500 truncate max-w-[200px]">
                {post.title}
              </span>
            </>
          )}
          <div className="ml-auto flex-shrink-0">
            <DarkToggle dark={dark} onToggle={onToggleDark} />
          </div>
        </div>
      </div>

      <main
        id="main-content"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16"
      >
        {/* Loading */}
        {loading && <ArticleSkeleton />}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-3xl mx-auto text-center py-20">
            <p className="text-surface-500 dark:text-surface-400 mb-4">
              Something went wrong while loading this post.
            </p>
            <a
              href={BLOGS_LISTING_URL}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              ← Back to all posts
            </a>
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <div className="max-w-3xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">
              Post not found
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              This article doesn't exist or has been unpublished.
            </p>
            <a
              href={BLOGS_LISTING_URL}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              ← View all posts
            </a>
          </div>
        )}

        {/* Article */}
        {!loading && post && <Article post={post} />}
      </main>

      {/* Footer */}
      {!loading && post && (
        <div className="border-t border-surface-100 dark:border-surface-800 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href={BLOGS_LISTING_URL}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              All posts
            </a>
            <a
              href="/"
              className="text-sm text-surface-400 dark:text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              physicspeptalk.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
