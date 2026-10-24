/**
 * BlogListingPage.tsx
 *
 * Renders the /blogs/ listing page.
 * Includes: 3D loading screen, animated hero banner, post list.
 * Matches the dark futuristic design system.
 */

import { useState, useEffect } from "react";
import {
  fetchPublishedBlogs,
  buildBlogArticleUrl,
  type BlogPost,
} from "../services/blogService";
import { trackBlogArticleOpen } from "../utils/analytics";
import { PageLoader } from "./PageLoader";

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Hero particles ────────────────────────────────────────────────────────────

function HeroParticles() {
  return (
    <div className="page-hero-particles" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="page-hero-particle"
          style={{
            "--hp-x":    `${(i * 53 + 13) % 100}%`,
            "--hp-delay":`${(i * 0.23) % 2.8}s`,
            "--hp-dur":  `${2.0 + (i % 5) * 0.45}s`,
            "--hp-size": `${2 + (i % 3)}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── 3-D Book / scroll accent SVG ─────────────────────────────────────────────

function HeroBookAccent() {
  return (
    <div className="page-hero-3d" aria-hidden="true">
      <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
        {/* Open book silhouette */}
        <rect x="30" y="80" width="90" height="120" rx="4"
          fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"/>
        <rect x="140" y="80" width="90" height="120" rx="4"
          fill="rgba(20,184,138,0.06)" stroke="rgba(20,184,138,0.35)" strokeWidth="1.5"/>
        {/* Spine */}
        <rect x="118" y="75" width="24" height="130" rx="2"
          fill="url(#blog-spine)" opacity="0.8"/>
        {/* Page lines left */}
        {[0,1,2,3,4].map((n) => (
          <line key={n} x1="45" y1={100 + n * 18} x2="108" y2={100 + n * 18}
            stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
        ))}
        {/* Page lines right */}
        {[0,1,2,3,4].map((n) => (
          <line key={n} x1="152" y1={100 + n * 18} x2="215" y2={100 + n * 18}
            stroke="rgba(20,184,138,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
        ))}
        {/* Floating orbs */}
        <circle cx="130" cy="50" r="10" fill="url(#blog-orb)" filter="url(#blog-glow)"/>
        <circle cx="60"  cy="60" r="5"  fill="rgba(99,102,241,0.7)" filter="url(#blog-glow)"/>
        <circle cx="200" cy="55" r="4"  fill="rgba(20,184,138,0.7)" filter="url(#blog-glow)"/>
        {/* Connection arcs */}
        <path d="M60 60 Q130 10 200 55"
          stroke="rgba(99,102,241,0.2)" strokeWidth="1" fill="none" strokeDasharray="4 4"/>
        <defs>
          <linearGradient id="blog-spine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1"/>
            <stop offset="100%" stopColor="#14b88a"/>
          </linearGradient>
          <radialGradient id="blog-orb" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#a5b4fc"/>
            <stop offset="100%" stopColor="#4f46e5"/>
          </radialGradient>
          <filter id="blog-glow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// ─── Dark toggle — removed (dark-only site) ───────────────────────────────────

// ─── Post item ─────────────────────────────────────────────────────────────────

function PostItem({ post }: { post: BlogPost }) {
  return (
    <article
      className="group flex flex-col gap-4 border-b border-surface-800 py-8 last:border-0 transition-all duration-200 hover:bg-surface-900/30 rounded-lg px-4 -mx-4"
      aria-label={post.title}
    >
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary-950/40 border border-primary-800 text-primary-400 uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </div>
      )}

      <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-50 leading-snug group-hover:text-primary-300 transition-colors duration-200">
        <a
          href={buildBlogArticleUrl(post.slug)}
          onClick={() => trackBlogArticleOpen(post.slug, post.title)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md block"
        >
          {post.title}
        </a>
      </h2>

      {post.excerpt && (
        <p className="text-sm text-surface-400 leading-relaxed line-clamp-2">{post.excerpt}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-surface-500 mt-1">
        <span className="font-medium text-surface-400">{post.author}</span>
        {post.date && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </>
        )}
        {/* Read arrow */}
        <span className="ml-auto inline-flex items-center gap-1 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-semibold text-xs">
          Read
          <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div className="animate-pulse border-b border-surface-800 py-8">
      <div className="h-3 bg-surface-800 rounded w-1/5 mb-3" />
      <div className="h-6 bg-surface-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-surface-800 rounded w-full" />
      <div className="h-3 bg-surface-800 rounded w-5/6 mt-2" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface BlogListingPageProps {
  // dark-only — no theme props
}

export default function BlogListingPage(_props: BlogListingPageProps = {}) {
  const [posts, setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchPublishedBlogs()
      .then(({ posts: fetched, error: err }) => { setPosts(fetched); setError(err); })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load posts"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLoader label="Blog" icon="book">
      <div className="min-h-screen bg-surface-950 relative overflow-x-hidden">

        {/* Ambient grid */}
        <div className="map-bg" aria-hidden="true" />

        {/* ── Nav ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-surface-950/90 backdrop-blur-xl border-b border-surface-800/80">
          <div className="container-pad py-3 flex items-center gap-3">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-400 hover:text-primary-400 transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Physics Pep Talk
            </a>
            <span className="text-surface-700" aria-hidden="true">/</span>
            <span className="text-sm text-surface-500">Blog</span>
            <div className="ml-auto" />
          </div>
        </header>

        {/* ── Hero banner ────────────────────────────────────────── */}
        <section className="page-hero accent" aria-label="Blog hero">
          <div className="page-hero-glow" aria-hidden="true" />
          <HeroParticles />
          <HeroBookAccent />

          <div className="page-hero-content">
            <div className="page-hero-eyebrow">
              <span className="page-hero-eyebrow-dot" aria-hidden="true" />
              Knowledge Hub
            </div>

            <h1 className="page-hero-title">
              Physics Pep Talk{" "}
              <span className="page-hero-title-gradient">Blog</span>
            </h1>

            <p className="page-hero-desc">
              Physics tips, exam strategies, and PUC guidance for Karnataka students.
            </p>

            <div className="page-hero-stats">
              <div className="page-hero-stat">
                <span className="page-hero-stat-icon">📖</span>
                <div>
                  <div className="page-hero-stat-label">Topics</div>
                  <div className="page-hero-stat-value">Physics · KCET</div>
                </div>
              </div>
              <div className="page-hero-stat">
                <span className="page-hero-stat-icon">🎯</span>
                <div>
                  <div className="page-hero-stat-label">Focus</div>
                  <div className="page-hero-stat-value">Exam Strategy</div>
                </div>
              </div>
              <div className="page-hero-stat">
                <span className="page-hero-stat-icon">📅</span>
                <div>
                  <div className="page-hero-stat-label">Updated</div>
                  <div className="page-hero-stat-value">Regularly</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Post list ─────────────────────────────────────────── */}
        <main id="main-content" className="container-pad py-14 relative z-10">
          <div className="max-w-3xl">

            {error && !loading && (
              <div role="alert" className="mb-8 p-5 rounded-lg border border-surface-800 bg-surface-900/50 text-surface-400 text-sm">
                Could not load blog posts. Please check your connection and try again.
              </div>
            )}

            {loading && (
              <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}
              </div>
            )}

            {!loading && !error && posts.length === 0 && (
              <div className="text-center py-24 text-surface-500">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium text-surface-400">No posts yet.</p>
                <p className="text-sm mt-1">Check back soon!</p>
              </div>
            )}

            {!loading && posts.length > 0 && (
              <div className="space-y-0">
                {posts.map((post) => <PostItem key={post.slug} post={post} />)}
              </div>
            )}
          </div>
        </main>
      </div>
    </PageLoader>
  );
}
