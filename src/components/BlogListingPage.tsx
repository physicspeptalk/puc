/**
 * BlogListingPage.tsx
 *
 * Renders the /blogs/ listing page.
 * Coursera Design System & Microsoft Learn Navigation:
 * - Left column: Collapsible tree-structured navigation sidebar (no search bar,
 *   expandable category groups, active guide highlight, collapse toggle).
 * - Main column: Coursera page hero, category filter pills, search input,
 *   and responsive card grid.
 * - Mobile responsive drawer toggle.
 */

import { useState, useEffect, useMemo } from "react";
import {
  fetchPublishedBlogs,
  buildBlogArticleUrl,
  type BlogPost,
} from "../services/blogService";
import { trackBlogArticleOpen } from "../utils/analytics";
import ArticleNavSidebar from "./ArticleNavSidebar";

function ArrowRightIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
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
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 overflow-hidden animate-pulse">
      <div className="w-full h-36 bg-gray-200 rounded-xl mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

const CATEGORIES = ["All", "KCET", "PUC Boards", "COMEDK", "Counselling"];

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Navigation sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetchPublishedBlogs()
      .then(({ posts: p, error: e }) => {
        setPosts(p);
        setError(e);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtered posts based on search query and category pill
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "All" ||
        post.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        post.title.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [posts, searchQuery, selectedCategory]);

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* ── Breadcrumb Navigation ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 text-xs text-gray-500 py-3 sticky top-16 md:top-[108px] z-30 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <a href="/" className="hover:text-[#0056D2] font-medium transition-colors">Home</a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">Blogs &amp; Articles</span>
          </div>

          {/* Mobile Browse Guides Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold text-[#0056D2] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Guides ({posts.length})</span>
          </button>
        </div>
      </div>

      {/* ── Main Content Container ────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex gap-8 items-start">
        {/* Left Column: Documentation Tree Navigation Sidebar */}
        <ArticleNavSidebar
          posts={posts}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        {/* Right Main Column */}
        <main className="flex-1 min-w-0">
          {/* Coursera Header Hero */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-10 mb-6 sm:mb-8 shadow-xs" aria-label="Blog hero">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0056D2] text-xs font-bold uppercase tracking-wider mb-3">
                <span>Study Guides &amp; Exam Strategy</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                Physics Pep Talk Blogs &amp; Blueprints
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                Practical advice, syllabus breakdown, formula memorization tricks, and round-by-round KCET option entry guides written by experienced faculty.
              </p>

              {/* Search Input Bar */}
              <div className="relative max-w-lg">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by title, subject, or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2] focus:bg-white transition-all shadow-2xs"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <SearchIcon />
                </div>
              </div>
            </div>
          </section>

          {/* Category Filter Pills (Smooth horizontal scroll on mobile) */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            <span className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-wider hidden sm:inline flex-shrink-0">
              Filter by:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                    active
                      ? "bg-[#0056D2] text-white shadow-xs"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {error && !loading && (
            <div role="alert" className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm mb-6">
              Could not load blog posts. Please check your internet connection and try again.
            </div>
          )}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && !error && filteredPosts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <div className="text-4xl mb-3">📖</div>
              <p className="font-semibold text-gray-900 text-base">No articles found</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No published articles matched your search or category filter. Try clearing the search query.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 px-4 py-2 rounded-md bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419e] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {!loading && filteredPosts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#0056D2] hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group p-4 sm:p-5"
                >
                  {/* Optional Cover Image */}
                  {post.coverImage && (
                    <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-gray-100 border border-gray-200 flex-shrink-0">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#0056D2] border border-blue-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-base font-bold text-gray-900 group-hover:text-[#0056D2] transition-colors line-clamp-2 mb-2 leading-snug">
                    <a href={buildBlogArticleUrl(post.slug)} onClick={() => trackBlogArticleOpen(post.slug, post.title)}>
                      {post.title}
                    </a>
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Metadata & Read Link */}
                  <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div>
                      {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
                    </div>

                    <a
                      href={buildBlogArticleUrl(post.slug)}
                      onClick={() => trackBlogArticleOpen(post.slug, post.title)}
                      className="inline-flex items-center gap-1 font-bold text-[#0056D2] hover:text-[#00419e] group-hover:translate-x-0.5 transition-all"
                      aria-label={`Read ${post.title}`}
                    >
                      <span>Read Guide</span>
                      <ArrowRightIcon />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
