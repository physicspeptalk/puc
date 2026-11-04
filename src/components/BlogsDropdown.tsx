/**
 * BlogsDropdown.tsx
 *
 * Provides two exports:
 *  1. <BlogsDropdownDesktop />
 *     A Coursera-styled "Blogs ▾" dropdown for the desktop header.
 *     Features:
 *     - Clean white card with subtle border and elevation shadow (rounded-2xl).
 *     - Header strip with guide count badge.
 *     - Rich item list with topic icons, bold titles, excerpt previews, and category badges.
 *     - Strictly no unstyled bullet points (list-none).
 *     - Polished "View all guides & blueprints →" footer.
 *     - Full keyboard accessibility (ArrowDown, ArrowUp, Esc, Enter) and click-outside dismissal.
 *
 *  2. <BlogsAccordionMobile />
 *     A clean, bullet-free mobile accordion for the mobile slide menu.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import {
  fetchPublishedBlogs,
  buildBlogArticleUrl,
  BLOGS_LISTING_URL,
  type BlogPost,
} from "../services/blogService";
import {
  trackBlogDropdownOpen,
  trackBlogArticleOpen,
  trackBlogViewAll,
} from "../utils/analytics";

// ─── Shared Hook ─────────────────────────────────────────────────────────────

function useBlogPosts(): {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
} {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedBlogs()
      .then(({ posts: fetched, error: err }) => {
        if (cancelled) return;
        setPosts(fetched);
        setError(err);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load blogs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, loading, error };
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function getPostIcon(post: BlogPost): string {
  const text = `${post.title} ${post.tags.join(" ")} ${post.excerpt}`.toLowerCase();
  if (text.includes("counselling") || text.includes("option entry") || text.includes("comedk") || text.includes("seat")) {
    return "🧭";
  }
  if (text.includes("kcet") || text.includes("entrance") || text.includes("rank")) {
    return "🎯";
  }
  if (text.includes("board") || text.includes("puc") || text.includes("exam") || text.includes("blueprint")) {
    return "📚";
  }
  return "📖";
}

function getPostBadge(post: BlogPost): string {
  if (post.tags.length > 0) return post.tags[0].toUpperCase();
  const text = `${post.title} ${post.excerpt}`.toLowerCase();
  if (text.includes("counselling")) return "COUNSELLING";
  if (text.includes("kcet")) return "KCET PREP";
  if (text.includes("board")) return "PUC BOARDS";
  return "BLUEPRINT";
}

// ─── Desktop Dropdown ────────────────────────────────────────────────────────

export function BlogsDropdownDesktop() {
  const { posts, loading, error } = useBlogPosts();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  // Keyboard navigation on button
  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        trackBlogDropdownOpen();
      }
      setTimeout(() => {
        const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
        first?.focus();
      }, 50);
    }
  };

  // Keyboard navigation inside menu
  const handleMenuKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
      );
      const idx = items.indexOf(document.activeElement as HTMLElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(idx + 1) % items.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === "Tab") {
        close();
      }
    },
    [close]
  );

  const toggle = () => {
    setOpen((v) => {
      if (!v) trackBlogDropdownOpen();
      return !v;
    });
  };

  const handleItemClick = (post?: BlogPost) => {
    if (post) trackBlogArticleOpen(post.slug, post.title);
    close();
  };

  return (
    <div ref={containerRef} className="relative select-none" style={{ isolation: "isolate" }}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Blogs menu"
        className={`
          px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer outline-none focus-visible:ring-1.5 focus-visible:ring-[#0056D2]
          ${
            open
              ? "text-[#0056D2] bg-blue-50 font-bold"
              : "text-gray-700 hover:text-[#0056D2] hover:bg-blue-50/60"
          }
        `}
      >
        <span>Blogs</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? "rotate-180 text-[#0056D2]" : "text-gray-400"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Dropdown Panel */}
      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-[200] w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          role="presentation"
        >
          {/* Header Strip */}
          <div className="p-3.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0056D2]" />
              <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
                Preparation Guides
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#0056D2] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {posts.length} {posts.length === 1 ? "Guide" : "Guides"}
            </span>
          </div>

          {/* Articles List — list-none ensures NO unwanted bullets */}
          <ul
            ref={menuRef}
            role="menu"
            aria-label="Blog posts"
            onKeyDown={handleMenuKeyDown}
            className="p-2 space-y-1 list-none m-0 max-h-80 overflow-y-auto"
          >
            {loading && (
              <li role="none" className="p-4 space-y-2.5 animate-pulse list-none">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </li>
            )}

            {!loading && error && (
              <li role="none" className="p-4 text-xs text-gray-500 text-center list-none">
                Could not load guides.
              </li>
            )}

            {!loading && !error && posts.length === 0 && (
              <li role="none" className="p-4 text-xs text-gray-500 text-center list-none">
                No guides published yet.
              </li>
            )}

            {!loading &&
              posts.map((post) => (
                <li key={post.slug} role="none" className="list-none m-0 p-0">
                  <a
                    href={buildBlogArticleUrl(post.slug)}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => handleItemClick(post)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 focus:bg-blue-50/70 outline-none focus:outline-none focus-visible:ring-1.5 focus-visible:ring-[#0056D2] group transition-all text-left border-l-2 border-transparent hover:border-[#0056D2]"
                  >
                    {/* Topic Icon Container */}
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0056D2] font-bold flex items-center justify-center flex-shrink-0 text-sm group-hover:bg-[#0056D2] group-hover:text-white transition-colors">
                      {getPostIcon(post)}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-[#0056D2] transition-colors line-clamp-1">
                          {post.title}
                        </span>
                        <span className="text-xs text-[#0056D2] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0">
                          →
                        </span>
                      </div>

                      {post.excerpt && (
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 group-hover:text-gray-700">
                          {post.excerpt}
                        </p>
                      )}

                      <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-wider text-[#0056D2] bg-blue-50/80 px-1.5 py-0.2 rounded">
                        {getPostBadge(post)}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
          </ul>

          {/* Bottom Footer / View All */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <a
              href={BLOGS_LISTING_URL}
              role="menuitem"
              tabIndex={0}
              onClick={() => {
                trackBlogViewAll("dropdown");
                handleItemClick();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#0056D2] hover:bg-white hover:shadow-2xs transition-all group"
            >
              <span>View all guides &amp; blueprints</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile Accordion ────────────────────────────────────────────────────────

interface BlogsAccordionMobileProps {
  onClose: () => void;
}

export function BlogsAccordionMobile({ onClose }: BlogsAccordionMobileProps) {
  const { posts, loading, error } = useBlogPosts();
  const [expanded, setExpanded] = useState(false);
  const panelId = "blogs-mobile-panel";

  const handleItemClick = (post?: BlogPost) => {
    if (post) trackBlogArticleOpen(post.slug, post.title);
    setExpanded(false);
    onClose();
  };

  return (
    <div className="border-b border-gray-100 pb-1">
      {/* Accordion Toggle */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((v) => !v)}
        className={`
          w-full flex items-center justify-between px-3 py-3 min-h-[44px] rounded-lg text-sm font-semibold transition-colors
          ${
            expanded
              ? "text-[#0056D2] bg-blue-50 font-bold"
              : "text-gray-700 hover:text-[#0056D2] hover:bg-gray-50"
          }
        `}
      >
        <span>Blogs &amp; Guides</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            expanded ? "rotate-180 text-[#0056D2]" : "text-gray-400"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Nested List — list-none ensures NO bullets */}
      {expanded && (
        <ul
          id={panelId}
          aria-label="Blog posts"
          className="mt-1 ml-2 border-l-2 border-blue-100 pl-3 flex flex-col gap-1 list-none m-0 p-0"
        >
          {loading && (
            <li className="px-2 py-3 text-xs text-gray-400 list-none animate-pulse">
              Loading guides…
            </li>
          )}

          {!loading && error && (
            <li className="px-2 py-3 text-xs text-gray-400 list-none">
              Could not load guides
            </li>
          )}

          {!loading && !error && posts.length === 0 && (
            <li className="px-2 py-3 text-xs text-gray-400 list-none">
              No guides published yet
            </li>
          )}

          {!loading &&
            posts.map((post) => (
              <li key={post.slug} className="list-none m-0 p-0">
                <a
                  href={buildBlogArticleUrl(post.slug)}
                  onClick={() => handleItemClick(post)}
                  className="flex items-center gap-2 px-2.5 py-2.5 min-h-[40px] rounded-lg text-xs font-medium text-gray-700 hover:text-[#0056D2] hover:bg-blue-50 transition-colors"
                >
                  <span className="text-sm">{getPostIcon(post)}</span>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-gray-900 truncate">{post.title}</span>
                    {post.excerpt && (
                      <span className="block text-[10px] text-gray-500 truncate">{post.excerpt}</span>
                    )}
                  </div>
                </a>
              </li>
            ))}

          {/* View All */}
          {!loading && (
            <li className="border-t border-gray-100 mt-1 pt-1 list-none m-0">
              <a
                href={BLOGS_LISTING_URL}
                onClick={() => {
                  trackBlogViewAll("mobile_accordion");
                  handleItemClick();
                }}
                className="flex items-center justify-between px-2.5 py-2.5 min-h-[40px] rounded-lg text-xs font-bold text-[#0056D2] hover:bg-blue-50 transition-colors"
              >
                <span>View All Guides &amp; Blueprints</span>
                <span>→</span>
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
