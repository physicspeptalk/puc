/**
 * BlogArticlePage.tsx
 *
 * Renders a single blog article at /blogs/:slug/
 * Coursera Design System:
 * - Clean light canvas (#F5F7FA).
 * - Breadcrumb navigation.
 * - Single-column readable reading layout (max-w-4xl).
 * - Crisp article header with tags, author, date, and share action.
 * - Rich typography styling for markdown content.
 * - In-article admissions guidance box and back navigation.
 */

import { useState, useEffect } from "react";
import { marked } from "marked";
import {
  fetchBlogBySlug,
  BLOGS_LISTING_URL,
  type BlogPost,
} from "../services/blogService";
import { buildWhatsAppUrl } from "../config/siteConfig";

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

function ArrowLeftIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function ArticleSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 space-y-6">
        <div className="h-4 bg-gray-200 rounded w-28" />
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded-xl w-full" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${80 + (i * 5) % 20}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BlogArticlePage({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(() => Boolean(slug));
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(() => !slug);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetchBlogBySlug(slug)
      .then(({ post: p, error: err }) => {
        if (err) {
          setError(err);
        } else if (p) {
          setPost(p);
        } else {
          setNotFound(true);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load article");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F5F7FA] min-h-[60vh]">
        <ArticleSkeleton />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bg-[#F5F7FA] min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-xs">
            <span className="text-4xl mb-4 block">📄</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
            <p className="text-sm text-gray-600 mb-6">
              The article you are looking for does not exist or may have been unpublished.
            </p>
            <a
              href={BLOGS_LISTING_URL}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold text-white bg-[#0056D2] hover:bg-[#00419e] transition-colors"
            >
              <ArrowLeftIcon />
              <span>Back to all articles</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-[#F5F7FA] min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-red-700">
            <h1 className="text-xl font-bold mb-2">Error Loading Article</h1>
            <p className="text-sm text-gray-600 mb-6">{error || "Could not retrieve post."}</p>
            <a
              href={BLOGS_LISTING_URL}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-white bg-[#0056D2]"
            >
              <ArrowLeftIcon />
              <span>Back to all articles</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const htmlContent = renderMarkdown(post.content);

  return (
    <div className="bg-[#F5F7FA]">
      {/* ── Breadcrumb Navigation ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 text-xs text-gray-500 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <a href="/" className="hover:text-[#0056D2] font-medium transition-colors flex-shrink-0">Home</a>
          <span className="text-gray-400">/</span>
          <a href={BLOGS_LISTING_URL} className="hover:text-[#0056D2] font-medium transition-colors flex-shrink-0">Blogs</a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold truncate">{post.title}</span>
        </div>
      </div>

      {/* ── Main Article Canvas ───────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-10 lg:p-12 shadow-xs">

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#0056D2] border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Article Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pb-6 mb-8 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0056D2] font-bold flex items-center justify-center text-xs">
                {post.author ? post.author[0].toUpperCase() : "P"}
              </div>
              <div>
                <span className="font-semibold text-gray-900 block">{post.author || "Physics Pep Talk"}</span>
                {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copied ? "Link Copied!" : "Share Link"}</span>
            </button>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 border border-gray-200 bg-gray-100">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Excerpt Lead */}
          {post.excerpt && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-gray-800 text-sm sm:text-base leading-relaxed font-medium mb-8">
              {post.excerpt}
            </div>
          )}

          {/* Markdown Content */}
          <div
            className="prose prose-slate max-w-none text-sm sm:text-base prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 prose-a:text-[#0056D2] prose-a:font-semibold hover:prose-a:underline prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:list-disc prose-ol:list-decimal prose-blockquote:border-l-4 prose-blockquote:border-[#0056D2] prose-blockquote:bg-blue-50/40 prose-blockquote:py-2.5 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-table:border prose-table:border-gray-200 prose-th:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-td:border prose-td:border-gray-200 prose-img:rounded-xl prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* ── In-Article Course Recommendation Box ───────────────── */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#00255D] to-[#0056D2] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <span className="bg-white/20 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider block w-fit mb-2">
                Fastrack Batch 2027
              </span>
              <h3 className="text-lg sm:text-xl font-bold leading-tight">
                Aiming for 100/100 in PUC &amp; Top KCET Rank?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-lg">
                Join our structured online batches with topic-wise video lectures, formula revision cards, and chapter test series.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0 w-full sm:w-auto">
              <a
                href="/#courses"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md font-bold text-xs text-[#0056D2] bg-white hover:bg-blue-50 text-center shadow-xs transition-colors"
              >
                <span>Browse Batches</span>
                <ArrowRightIcon />
              </a>
              <a
                href={buildWhatsAppUrl(`Hi, I read your article "${post.title}" and have questions about KCET/PUC preparation.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-md font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 text-center shadow-xs transition-colors"
              >
                Ask WhatsApp Desk
              </a>
            </div>
          </div>

          {/* ── Bottom Navigation ─────────────────────────────────── */}
          <div className="pt-8 mt-10 border-t border-gray-200 flex items-center justify-between">
            <a
              href={BLOGS_LISTING_URL}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0056D2] hover:text-[#00419e] transition-colors"
            >
              <ArrowLeftIcon />
              <span>Back to all articles</span>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Back to top ↑
            </a>
          </div>

        </article>
      </main>
    </div>
  );
}
