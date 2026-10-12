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

// Use default renderer — headings, lists, bold, italic, code, links, images
marked.setOptions({ async: false });

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

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
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
      <div className="h-4 bg-surface-100 rounded w-1/5 mb-8" />
      <div className="h-8 bg-surface-100 rounded w-3/4 mb-3" />
      <div className="h-5 bg-surface-100 rounded w-1/2 mb-8" />
      <div className="aspect-video bg-surface-100 rounded-2xl mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-surface-100 rounded"
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
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-surface-900 leading-[1.1] tracking-tight mb-4 text-balance">
        {post.title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-surface-400 mb-8 pb-8 border-b border-surface-100">
        <span className="font-semibold text-surface-600">{post.author}</span>
        {post.date && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </>
        )}
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div className="mb-8 rounded-2xl overflow-hidden aspect-video bg-surface-50">
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
            prose-headings:font-bold prose-headings:text-surface-900
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-surface-700 prose-p:leading-relaxed
            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-surface-900
            prose-blockquote:border-primary-400 prose-blockquote:text-surface-600
            prose-code:text-primary-700 prose-code:bg-primary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-surface-900 prose-pre:text-surface-100 prose-pre:rounded-xl
            prose-img:rounded-xl prose-img:shadow-sm
            prose-li:text-surface-700
            prose-hr:border-surface-200"
          // Content comes from our own Google Sheets + has been sanitized
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-surface-400 italic">No content yet.</p>
      )}
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface BlogArticlePageProps {
  slug: string;
}

export default function BlogArticlePage({ slug }: BlogArticlePageProps) {
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
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-surface-100 bg-white sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <a
            href="/"
            className="flex-shrink-0 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Physics Pep Talk
          </a>
          <span className="text-surface-300" aria-hidden="true">/</span>
          <a
            href={BLOGS_LISTING_URL}
            className="text-sm text-surface-500 hover:text-primary-600 transition-colors"
          >
            Blog
          </a>
          {post && (
            <>
              <span className="text-surface-300" aria-hidden="true">/</span>
              <span className="text-sm text-surface-400 truncate max-w-[200px]">
                {post.title}
              </span>
            </>
          )}
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
            <p className="text-surface-500 mb-4">
              Something went wrong while loading this post.
            </p>
            <a
              href={BLOGS_LISTING_URL}
              className="text-sm text-primary-600 hover:underline"
            >
              ← Back to all posts
            </a>
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <div className="max-w-3xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold text-surface-900 mb-3">
              Post not found
            </h1>
            <p className="text-surface-500 mb-6">
              This article doesn't exist or has been unpublished.
            </p>
            <a
              href={BLOGS_LISTING_URL}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
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
        <div className="border-t border-surface-100 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href={BLOGS_LISTING_URL}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
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
              className="text-sm text-surface-400 hover:text-primary-600 transition-colors"
            >
              physicspeptalk.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
