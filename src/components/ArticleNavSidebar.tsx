/**
 * ArticleNavSidebar.tsx
 *
 * Microsoft Learn / Documentation style collapsible navigation sidebar.
 * Features:
 * - Tree-structured category groups with expandable/collapsible carets.
 * - Active guide highlighted in Coursera blue with border indicator.
 * - Desktop collapse / expand toggle (« / ») to optimize reading canvas.
 * - Mobile responsive drawer with backdrop.
 * - No search bar (per user instruction).
 * - Styled in the clean Coursera / Physics Pep Talk design system.
 */

import { useState, useMemo, useEffect } from "react";
import { buildBlogArticleUrl, BLOGS_LISTING_URL, type BlogPost } from "../services/blogService";

interface ArticleNavSidebarProps {
  posts: BlogPost[];
  currentSlug?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface CategoryGroup {
  id: string;
  title: string;
  icon: string;
  posts: BlogPost[];
}

export default function ArticleNavSidebar({
  posts,
  currentSlug,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: ArticleNavSidebarProps) {
  // Categorize articles into logical groups
  const groups: CategoryGroup[] = useMemo(() => {
    const kcet: BlogPost[] = [];
    const boards: BlogPost[] = [];
    const counselling: BlogPost[] = [];
    const other: BlogPost[] = [];

    posts.forEach((post) => {
      const text = `${post.title} ${post.tags.join(" ")} ${post.excerpt}`.toLowerCase();
      if (text.includes("counselling") || text.includes("option entry") || text.includes("comedk") || text.includes("seat")) {
        counselling.push(post);
      } else if (text.includes("kcet") || text.includes("entrance") || text.includes("competitive")) {
        kcet.push(post);
      } else if (text.includes("board") || text.includes("puc") || text.includes("blueprint") || text.includes("exam")) {
        boards.push(post);
      } else {
        other.push(post);
      }
    });

    const result: CategoryGroup[] = [];

    if (kcet.length > 0) {
      result.push({
        id: "kcet",
        title: "KCET & Competitive Entrance",
        icon: "🎯",
        posts: kcet,
      });
    }

    if (boards.length > 0) {
      result.push({
        id: "boards",
        title: "1st & 2nd PUC Boards",
        icon: "📚",
        posts: boards,
      });
    }

    if (counselling.length > 0) {
      result.push({
        id: "counselling",
        title: "Counselling & Option Entry",
        icon: "🧭",
        posts: counselling,
      });
    }

    if (other.length > 0 || result.length === 0) {
      result.push({
        id: "other",
        title: "Study Guides & Blueprints",
        icon: "💡",
        posts: other.length > 0 ? other : posts,
      });
    }

    return result;
  }, [posts]);

  // Collapsible section state for category groups
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    kcet: true,
    boards: true,
    counselling: true,
    other: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Lock body scroll and handle Escape key while mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, onCloseMobile]);

  const content = (
    <div className="flex flex-col h-full select-none">
      {/* ── Top Header Strip ─────────────────────────────────────── */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0056D2]" />
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Preparation Guides
          </h2>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex w-7 h-7 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 items-center justify-center transition-colors cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden w-9 h-9 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center cursor-pointer"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Scrollable Navigation Tree ───────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4 text-xs font-sans" aria-label="Documentation sidebar">
        {/* All Articles Overview link */}
        <a
          href={BLOGS_LISTING_URL}
          onClick={onCloseMobile}
          className={`flex items-center gap-2 px-3 py-2.5 min-h-[40px] rounded-lg font-semibold transition-colors ${
            !currentSlug
              ? "bg-blue-50 text-[#0056D2] border-l-3 border-[#0056D2]"
              : "text-gray-700 hover:text-[#0056D2] hover:bg-gray-100"
          }`}
        >
          <span>📖</span>
          <span>All Published Guides</span>
          <span className="ml-auto text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {posts.length}
          </span>
        </a>

        <div className="border-t border-gray-100" />

        {/* Grouped Category Trees */}
        {groups.map((group) => {
          const isOpen = openSections[group.id] !== false;

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header with Caret */}
              <button
                type="button"
                onClick={() => toggleSection(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 min-h-[38px] text-xs font-bold text-gray-800 hover:text-[#0056D2] rounded-md transition-colors cursor-pointer group"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{group.icon}</span>
                  <span className="truncate">{group.title}</span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#0056D2] transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Group Articles */}
              {isOpen && (
                <div className="pl-4 space-y-1 border-l border-gray-200 ml-3 mt-1">
                  {group.posts.map((post) => {
                    const isActive = post.slug === currentSlug;
                    return (
                      <a
                        key={post.slug}
                        href={buildBlogArticleUrl(post.slug)}
                        onClick={onCloseMobile}
                        className={`group flex items-center py-2 px-2.5 min-h-[38px] rounded-r-md text-xs leading-snug transition-all ${
                          isActive
                            ? "bg-blue-50 text-[#0056D2] font-bold border-l-2 border-[#0056D2] pl-2 shadow-2xs"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium"
                        }`}
                      >
                        <span className="line-clamp-2">{post.title}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom Helpful Academic Shortcuts ────────────────────── */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 space-y-1 text-xs">
        <a
          href="/#courses"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-gray-700 hover:text-[#0056D2] hover:bg-white font-medium transition-colors"
        >
          <span>Explore Batches</span>
          <span className="text-[10px] text-gray-400">→</span>
        </a>
        <a
          href="/faculties/"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-gray-700 hover:text-[#0056D2] hover:bg-white font-medium transition-colors"
        >
          <span>Faculty Profiles</span>
          <span className="text-[10px] text-gray-400">→</span>
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Collapsible Sidebar ──────────────────────────── */}
      <aside
        className={`hidden lg:block flex-shrink-0 bg-white border border-gray-200/90 rounded-2xl shadow-xs sticky top-24 transition-all duration-300 overflow-hidden ${
          isCollapsed ? "w-12 h-12" : "w-64 xl:w-72 h-[calc(100vh-7.5rem)]"
        }`}
      >
        {isCollapsed ? (
          <div className="w-full h-full flex items-center justify-center p-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="w-8 h-8 rounded-lg hover:bg-blue-50 text-[#0056D2] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Expand sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          content
        )}
      </aside>

      {/* ── Mobile Slide-Over Drawer ─────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[120] flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Box */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
