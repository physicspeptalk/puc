/**
 * BlogListingPage.tsx
 *
 * Renders the /blogs/ listing page.
 * Fetches all published posts from Google Sheets and displays them as cards.
 * Posts are sorted newest-first (by date column).
 */

import { useState, useEffect } from "react";
import {
  fetchPublishedBlogs,
  buildBlogArticleUrl,
  type BlogPost,
} from "../services/blogService";
import { trackBlogArticleOpen } from "../utils/analytics";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(raw: string): string {
  if (!raw || !raw.trim()) return "";

  let d = new Date(raw);

  if (isNaN(d.getTime())) {
    const parts = raw.trim().split(/[-/]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(Number);
      if (c > 100) d = new Date(c, b - 1, a);
    }
  }

  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700 shadow-card hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Cover image */}
      {post.coverImage && (
        <a
          href={buildBlogArticleUrl(post.slug)}
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => trackBlogArticleOpen(post.slug, post.title)}
          className="block aspect-video overflow-hidden bg-surface-50 dark:bg-surface-900"
        >
          <img
            src={post.coverImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </a>
      )}

      <div className="flex flex-col flex-1 p-6">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-lg font-bold text-surface-900 dark:text-white leading-snug mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
          <a
            href={buildBlogArticleUrl(post.slug)}
            onClick={() => trackBlogArticleOpen(post.slug, post.title)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
          >
            {post.title}
          </a>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed mb-4 flex-1 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-surface-100 dark:border-surface-700 text-xs text-surface-400 dark:text-surface-500">
          <span className="font-medium text-surface-500 dark:text-surface-400">{post.author}</span>
          {post.date && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700 overflow-hidden animate-pulse">
      <div className="aspect-video bg-surface-100 dark:bg-surface-700" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-surface-100 dark:bg-surface-700 rounded w-1/4" />
        <div className="h-5 bg-surface-100 dark:bg-surface-700 rounded w-3/4" />
        <div className="h-3 bg-surface-100 dark:bg-surface-700 rounded w-full" />
        <div className="h-3 bg-surface-100 dark:bg-surface-700 rounded w-5/6" />
      </div>
    </div>
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

interface BlogListingPageProps {
  dark: boolean;
  onToggleDark: () => void;
}

export default function BlogListingPage({ dark, onToggleDark }: BlogListingPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchPublishedBlogs()
      .then(({ posts: fetched, error: err }) => {
        setPosts(fetched);
        setError(err);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Page header */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="flex items-center justify-between mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label="Back to home"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </a>
            <DarkToggle dark={dark} onToggle={onToggleDark} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-surface-900 dark:text-white tracking-tight mb-3">
            Blog
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400">
            Physics tips, exam strategies, and PUC guidance.
          </p>
        </div>
      </div>

      {/* Content */}
      <main
        id="main-content"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16"
      >
        {/* Error state */}
        {error && !loading && (
          <div
            role="alert"
            className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-700 dark:text-red-400 text-sm"
          >
            Could not load blog posts. Please check your connection and try
            again.
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20 text-surface-400 dark:text-surface-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="font-medium">No posts yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}

        {/* Post grid */}
        {!loading && posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
