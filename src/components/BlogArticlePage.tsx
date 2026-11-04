/**
 * BlogArticlePage.tsx
 *
 * Renders a single blog article at /blogs/:slug/
 * Coursera Design System & Microsoft Learn 3-Column Navigation:
 * - Left column: Tree-structured documentation navigation sidebar (no search bar,
 *   expandable category groups, active guide highlight, collapse toggle).
 * - Center column: Clean readable article canvas with metadata, tags, cover,
 *   styled markdown content, and admissions callout.
 * - Right column: "In this article" table of contents (active section highlight,
 *   smooth scrolling, helpfulness feedback widget).
 * - Mobile responsive: Sticky top guide drawer toggle and in-article jump dropdown.
 */

import { useState, useEffect, useMemo } from "react";
import { marked } from "marked";
import {
  fetchBlogBySlug,
  fetchPublishedBlogs,
  BLOGS_LISTING_URL,
  type BlogPost,
} from "../services/blogService";
import { buildWhatsAppUrl } from "../config/siteConfig";
import ArticleNavSidebar from "./ArticleNavSidebar";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s+on\w+="[^"]*"/gi, "")
    .replace(/\s+on\w+='[^']*'/gi, "")
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
    .replace(/href='javascript:[^']*'/gi, "href='#'");
}

function extractToc(md: string): TocItem[] {
  if (!md) return [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(md)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim().replace(/\*\*|__|\*|_|`|\[(.*?)\]\(.*?\)/g, "$1");
    const id = rawText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (id && rawText) {
      items.push({ id, text: rawText, level });
    }
  }
  return items;
}

function renderMarkdown(md: string): string {
  if (!md) return "";
  const renderer = new marked.Renderer();
  renderer.heading = ({ text, depth }) => {
    const plain = text.replace(/<[^>]+>/g, "");
    const id = plain
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `<h${depth} id="${id}" class="scroll-mt-28">${text}</h${depth}>\n`;
  };
  return sanitizeHtml(marked.parse(md, { renderer }) as string);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-4 h-96" />
        <div className="lg:col-span-9 bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 space-y-6">
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-xl w-full" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${80 + (i * 5) % 20}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogArticlePage({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(() => Boolean(slug));
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(() => !slug);
  const [copied, setCopied] = useState(false);

  // Sidebar and TOC states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [feedbackState, setFeedbackState] = useState<"none" | "yes" | "no">("none");

  // Fetch article
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

  // Fetch all published articles for left tree navigation
  useEffect(() => {
    fetchPublishedBlogs().then(({ posts }) => {
      setAllPosts(posts);
    });
  }, []);

  // Extract headings from markdown content
  const toc = useMemo(() => extractToc(post?.content || ""), [post?.content]);

  // Active heading spy based on scroll position
  useEffect(() => {
    if (toc.length === 0) return;

    const onScroll = () => {
      let current = "";
      for (const item of toc) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 140) {
            current = item.id;
          }
        }
      }
      if (current) {
        setActiveHeading(current);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  // Lock body scroll and handle Escape key while mobile TOC sheet is open
  useEffect(() => {
    if (!mobileTocOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileTocOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileTocOpen]);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* ── Breadcrumb & Top Bar ──────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 text-xs text-gray-500 py-3 sticky top-16 md:top-[108px] z-30 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <a href="/" className="hover:text-[#0056D2] font-medium transition-colors flex-shrink-0">Home</a>
            <span className="text-gray-400">/</span>
            <a href={BLOGS_LISTING_URL} className="hover:text-[#0056D2] font-medium transition-colors flex-shrink-0">Blogs</a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold truncate">{post.title}</span>
          </div>

          {/* Mobile Navigation Helper Buttons */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-md text-[11px] font-bold text-[#0056D2] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
              aria-label="Open guides list"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Guides</span>
            </button>

            {toc.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setMobileTocOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-md text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors cursor-pointer"
                  aria-label="Table of contents"
                >
                  <span>On this page</span>
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mobile TOC Slide-Up Bottom Sheet */}
                {mobileTocOpen && (
                  <div className="fixed inset-0 z-[130] flex flex-col justify-end" role="dialog" aria-modal="true">
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                      onClick={() => setMobileTocOpen(false)}
                      aria-hidden="true"
                    />

                    {/* Sheet Card */}
                    <div className="relative w-full max-h-[75vh] bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 flex flex-col p-4 pb-6 z-10 animate-in slide-in-from-bottom duration-250 overscroll-contain">
                      {/* Drag pill handle */}
                      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#0056D2]" />
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            In this article
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMobileTocOpen(false)}
                          className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Close table of contents"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Headings List */}
                      <div className="overflow-y-auto space-y-1 py-1 max-h-[50vh] overscroll-contain [webkit-overflow-scrolling:touch]">
                        {toc.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              scrollToHeading(item.id);
                              setMobileTocOpen(false);
                            }}
                            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs min-h-[40px] flex items-center transition-colors cursor-pointer ${
                              activeHeading === item.id
                                ? "bg-blue-50 text-[#0056D2] font-bold border-l-2 border-[#0056D2]"
                                : item.level === 3
                                ? "pl-6 text-gray-600 hover:bg-gray-100 font-normal"
                                : "text-gray-800 font-medium hover:bg-gray-100"
                            }`}
                          >
                            <span className="truncate">{item.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main 3-Column Documentation / Article Viewport ─────────── */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex gap-8 items-start">
        {/* Left Column: Documentation Tree Navigation Sidebar */}
        <ArticleNavSidebar
          posts={allPosts.length > 0 ? allPosts : [post]}
          currentSlug={post.slug}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        {/* Center Column: Main Article Canvas */}
        <main className="flex-1 min-w-0">
          <article className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-8 lg:p-12 shadow-xs">

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
            <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#00255D] to-[#0056D2] text-white p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
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

        {/* Right Column: Microsoft Learn "In this article" (TOC) */}
        {toc.length > 0 && (
          <aside className="hidden xl:block w-56 2xl:w-64 flex-shrink-0 sticky top-24">
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0056D2]" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  In this article
                </h3>
              </div>

              <nav className="space-y-1 max-h-[calc(100vh-18rem)] overflow-y-auto text-xs pr-1" aria-label="In this article">
                {toc.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={`block w-full text-left py-1.5 px-2 rounded-md transition-colors leading-snug cursor-pointer ${
                      item.level === 3 ? "pl-4 text-gray-500 text-[11px]" : "text-gray-700 font-medium"
                    } ${
                      activeHeading === item.id
                        ? "text-[#0056D2] font-bold bg-blue-50 border-l-2 border-[#0056D2]"
                        : "hover:text-[#0056D2] hover:bg-gray-50"
                    }`}
                  >
                    <span className="line-clamp-2">{item.text}</span>
                  </button>
                ))}
              </nav>

              {/* Microsoft Learn "Was this page helpful?" Component */}
              <div className="pt-4 mt-4 border-t border-gray-100 text-xs">
                <span className="text-gray-500 block mb-2 font-medium">Was this page helpful?</span>
                {feedbackState === "none" ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackState("yes")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0056D2] text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <span>👍</span>
                      <span>Yes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackState("no")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <span>👎</span>
                      <span>No</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-2">
                    Thank you for your feedback! ✨
                  </p>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
