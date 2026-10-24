/**
 * BlogListingPage.tsx
 *
 * Renders the /blogs/ listing page.
 * Editorial layout: publication-style list of posts sorted newest-first.
 * Fetches all published posts from Google Sheets.
 * Visual direction matches the futuristic, graphic-intensive design system.
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

// ─── Post list item (editorial, not a card) ──────────────────────────────────

function PostItem({ post }: { post: BlogPost }) {
  return (
    <article
      className="flex flex-col gap-4 border-b border-surface-200 dark:border-surface-800 py-7 last:border-0 transition-colors duration-200 hover:bg-surface-50 dark:hover:bg-surface-900/30"
      aria-label={post.title}
    >
      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400 uppercase tracking-widest"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 dark:text-ink-50 leading-snug mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
        <a
          href={buildBlogArticleUrl(post.slug)}
          onClick={() => trackBlogArticleOpen(post.slug, post.title)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md block"
        >
          {post.title}
        </a>
      </h2>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-surface-400 dark:text-surface-500 mt-2">
        <span className="font-medium">{post.author}</span>
        {post.date && (
          <>
            <span aria-hidden="true" className="mx-1">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </>
        )}
      </div>
    </article>
  );
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div className="animate-pulse border-b border-surface-200 dark:border-surface-800 py-7">
      <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-1/4 mb-2" />
      <div className="h-5 bg-surface-100 dark:bg-surface-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-full" />
      <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-5/6 mt-2" />
    </div>
  );
}

// ─── Dark mode toggle button ─────────────────────────────────────────────────

function DarkToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-10 h-10 rounded-lg flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200"
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
    <div className="min-h-screen bg-white dark:bg-surface-950 relative z-0">
      {/* Page header */}
      <div className="bg-white dark:bg-surface-950 border-b border-surface-200 dark:border-surface-800">
        <div className="container-pad py-10 md:py-14">
          <div className="flex items-center justify-between mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              aria-label="Back to home"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </a>
            <DarkToggle dark={dark} onToggle={onToggleDark} />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-ink-900 dark:text-ink-50 leading-[1.05] tracking-tight mb-3">
            Blog
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-400 readable">
            Physics tips, exam strategies, and PUC guidance for Karnataka students.
          </p>
        </div>
      </div>

      {/* Content */}
      <main id="main-content" className="container-pad py-12 md:py-16">
        {/* Error state */}
        {error && !loading && (
          <div
            role="alert"
            className="mb-8 p-5 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 text-surface-600 dark:text-surface-300 text-sm"
          >
            Could not load blog posts. Please check your connection and try again.
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20 text-surface-400 dark:text-surface-500 readable mx-auto">
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

        {/* Post list */}
        {!loading && posts.length > 0 && (
          <div className="space-y-0">
            {posts.map((post) => (
              <PostItem key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
