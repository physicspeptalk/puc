/**
 * BlogArticlePage.tsx
 *
 * Renders a single blog article at /blogs/:slug/
 * Includes: 3D loading screen, animated article hero, markdown content.
 * Matches the dark futuristic design system.
 */

import { useState, useEffect } from "react";
import { marked } from "marked";
import {
  fetchBlogBySlug,
  BLOGS_LISTING_URL,
  type BlogPost,
} from "../services/blogService";
import { PageLoader } from "./PageLoader";

// ─── Marked + sanitizer ────────────────────────────────────────────────────────

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s+on\w+="[^"]*"/gi, "")
    .replace(/\s+on\w+='[^']*'/gi, "")
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
    .replace(/href='javascript:[^']*'/gi, "href='#'");
}

function renderMarkdown(md: string): string {
  if (!md) return "";
  return sanitizeHtml(marked.parse(md) as string);
}

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
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="page-hero-particle"
          style={{
            "--hp-x":    `${(i * 61 + 17) % 100}%`,
            "--hp-delay":`${(i * 0.19) % 2.4}s`,
            "--hp-dur":  `${1.8 + (i % 5) * 0.5}s`,
            "--hp-size": `${2 + (i % 3)}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── 3-D DNA / wave accent SVG ────────────────────────────────────────────────

function HeroDnaAccent() {
  return (
    <div className="page-hero-3d" aria-hidden="true">
      <svg width="240" height="260" viewBox="0 0 240 260" fill="none">
        {/* Left strand */}
        <path d="M60 20 C60 60, 180 80, 180 120 C180 160, 60 180, 60 220"
          stroke="rgba(99,102,241,0.5)" strokeWidth="2" fill="none"/>
        {/* Right strand */}
        <path d="M180 20 C180 60, 60 80, 60 120 C60 160, 180 180, 180 220"
          stroke="rgba(20,184,138,0.45)" strokeWidth="2" fill="none"/>
        {/* Rungs */}
        {[35, 65, 95, 125, 155, 185, 215].map((y, i) => (
          <line key={i}
            x1={i % 2 === 0 ? 65 : 172} y1={y}
            x2={i % 2 === 0 ? 175 : 68} y2={y}
            stroke="rgba(165,180,252,0.3)" strokeWidth="1.5" strokeDasharray="3 3"/>
        ))}
        {/* Node dots */}
        {[35, 95, 155, 215].map((y, i) => (
          <circle key={i} cx={i % 2 === 0 ? 65 : 175} cy={y} r="5"
            fill="rgba(99,102,241,0.8)" filter="url(#art-glow)"/>
        ))}
        {[35, 95, 155, 215].map((y, i) => (
          <circle key={i} cx={i % 2 === 0 ? 175 : 65} cy={y} r="5"
            fill="rgba(20,184,138,0.8)" filter="url(#art-glow2)"/>
        ))}
        <defs>
          <filter id="art-glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="art-glow2">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// ─── Dark toggle — removed (dark-only site) ───────────────────────────────────

// ─── Article skeleton ─────────────────────────────────────────────────────────

function ArticleSkeleton() {
  return (
    <div className="animate-pulse max-w-2xl mx-auto">
      <div className="h-4 bg-surface-800 rounded w-1/5 mb-8" />
      <div className="h-8 bg-surface-800 rounded w-3/4 mb-3" />
      <div className="h-5 bg-surface-800 rounded w-1/2 mb-8" />
      <div className="aspect-video bg-surface-800 rounded-lg mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 bg-surface-800 rounded" style={{ width: `${70 + (i * 7) % 30}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Article hero (rendered once post is loaded) ──────────────────────────────

function ArticleHero({ post }: { post: BlogPost }) {
  return (
    <section className="page-hero" aria-label="Article hero">
      <div className="page-hero-glow" aria-hidden="true" />
      <HeroParticles />
      <HeroDnaAccent />

      <div className="page-hero-content">
        {/* Tags as eyebrow */}
        <div className="page-hero-eyebrow">
          <span className="page-hero-eyebrow-dot" aria-hidden="true" />
          {post.tags[0] ?? "Blog Article"}
        </div>

        <h1 className="page-hero-title" style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)" }}>
          <span className="page-hero-title-gradient">{post.title}</span>
        </h1>

        {/* Meta row */}
        <div className="page-hero-stats" style={{ marginTop: "16px" }}>
          {post.author && (
            <div className="page-hero-stat">
              <span className="page-hero-stat-icon">✍️</span>
              <div>
                <div className="page-hero-stat-label">Author</div>
                <div className="page-hero-stat-value">{post.author}</div>
              </div>
            </div>
          )}
          {post.date && (
            <div className="page-hero-stat">
              <span className="page-hero-stat-icon">📅</span>
              <div>
                <div className="page-hero-stat-label">Published</div>
                <div className="page-hero-stat-value">{formatDate(post.date)}</div>
              </div>
            </div>
          )}
          {post.tags.length > 1 && (
            <div className="page-hero-stat">
              <span className="page-hero-stat-icon">🏷️</span>
              <div>
                <div className="page-hero-stat-label">Topic</div>
                <div className="page-hero-stat-value">{post.tags.slice(0, 2).join(" · ")}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Article body ─────────────────────────────────────────────────────────────

function ArticleBody({ post }: { post: BlogPost }) {
  const html = renderMarkdown(post.content);

  return (
    <article className="max-w-2xl mx-auto" aria-label={post.title}>
      {/* Cover image */}
      {post.coverImage && (
        <div className="mb-12 rounded-xl overflow-hidden bg-surface-900 border border-surface-800 shadow-card">
          <img
            src={post.coverImage}
            alt={`Cover image for ${post.title}`}
            className="w-full h-auto object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* Body */}
      {html ? (
        <div
          className="prose prose-lg max-w-none
            dark:prose-invert
            prose-headings:font-display prose-headings:font-bold
            dark:prose-headings:text-ink-50
            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
            prose-p:text-surface-300 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-ink-50
            prose-blockquote:border-primary-500 prose-blockquote:text-surface-300
            prose-code:text-primary-300 prose-code:bg-primary-950/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
            prose-pre:bg-surface-900 prose-pre:text-surface-100 prose-pre:rounded-xl prose-pre:border prose-pre:border-surface-800
            prose-img:rounded-xl prose-img:shadow-sm prose-img:mb-6
            prose-li:text-surface-300 prose-li:mb-3
            prose-hr:border-surface-700"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-surface-500 italic">No content yet.</p>
      )}
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface BlogArticlePageProps {
  slug: string;
}

export default function BlogArticlePage({ slug }: BlogArticlePageProps) {
  const [post, setPost]       = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    setLoading(true); setNotFound(false);
    fetchBlogBySlug(slug)
      .then(({ post: fetched, error: err }) => {
        if (err) setError(err);
        else if (!fetched) setNotFound(true);
        else setPost(fetched);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load post"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PageLoader label="Loading Article" icon="dna">
      <div className="min-h-screen bg-surface-950 relative overflow-x-hidden">

        {/* Ambient grid */}
        <div className="map-bg" aria-hidden="true" />

        {/* ── Sticky nav ────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-surface-950/90 backdrop-blur-xl border-b border-surface-800/80">
          <div className="container-pad py-3 flex items-center gap-3">
            <a href="/" className="flex-shrink-0 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors duration-200">
              Physics Pep Talk
            </a>
            <span className="text-surface-700" aria-hidden="true">/</span>
            <a href={BLOGS_LISTING_URL} className="text-sm text-surface-500 hover:text-primary-400 transition-colors duration-200">
              Blog
            </a>
            {post && (
              <>
                <span className="text-surface-700" aria-hidden="true">/</span>
                <span className="text-sm text-surface-500 truncate max-w-[180px]">{post.title}</span>
              </>
            )}
            <div className="ml-auto flex-shrink-0" />
          </div>
        </header>

        {/* ── Article hero (shows when post loaded) ─────────────── */}
        {!loading && post && <ArticleHero post={post} />}

        {/* ── Content area ──────────────────────────────────────── */}
        <main id="main-content" className="container-pad py-12 md:py-16 relative z-10">

          {loading && <ArticleSkeleton />}

          {!loading && error && (
            <div className="max-w-2xl mx-auto text-center py-20">
              <p className="text-surface-400 mb-4">Something went wrong loading this post.</p>
              <a href={BLOGS_LISTING_URL} className="text-sm text-primary-400 hover:underline">← Back to all posts</a>
            </div>
          )}

          {!loading && notFound && (
            <div className="max-w-2xl mx-auto text-center py-20">
              <h1 className="text-4xl font-display font-bold text-ink-50 mb-3">Post not found</h1>
              <p className="text-surface-400 mb-6">This article doesn't exist or has been unpublished.</p>
              <a href={BLOGS_LISTING_URL} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-400 hover:underline">
                ← View all posts
              </a>
            </div>
          )}

          {!loading && post && <ArticleBody post={post} />}

          {!loading && post && (
            <div className="max-w-2xl mx-auto py-10 mt-6 border-t border-surface-800">
              <a href={BLOGS_LISTING_URL}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All posts
              </a>
            </div>
          )}
        </main>
      </div>
    </PageLoader>
  );
}
