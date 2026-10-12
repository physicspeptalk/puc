/**
 * BlogsDropdown.tsx
 *
 * Provides two exports:
 *
 *  1. <BlogsDropdownDesktop />
 *     A "Blogs ▾" button for the desktop navigation bar.
 *     Opens a floating panel (click + optional hover) listing published
 *     blog posts fetched from Google Sheets.
 *
 *  2. <BlogsAccordionMobile />
 *     A collapsible "Blogs ▾" accordion row for the hamburger menu.
 *     Tapping it reveals nested blog links; selecting one closes the
 *     parent mobile menu via the onClose callback.
 *
 * Both components share the same `useBlogPosts` hook which fires a single
 * fetch request (module-level cached in blogService.ts) on first mount.
 *
 * Accessibility:
 *  - Desktop uses role="menu" / role="menuitem" pattern with
 *    aria-haspopup, aria-expanded, and keyboard navigation (↑↓, Esc, Enter/Space).
 *  - Mobile uses a <button> that toggles aria-expanded on the nested list.
 *  - Focus is trapped into the dropdown on open (first item focused).
 *  - Escape key closes the dropdown.
 *  - Click outside closes the dropdown.
 *  - Animations respect prefers-reduced-motion.
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

// ─── Shared hook ─────────────────────────────────────────────────────────────

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
    setLoading(true);
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

// ─── Shared icons ─────────────────────────────────────────────────────────────

function ChevronDown({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function ExternalArrow({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

export function BlogsDropdownDesktop() {
  const { posts, loading, error } = useBlogPosts();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // ── Close handlers ────────────────────────────────────────────────────────

  const close = useCallback(() => setOpen(false), []);

  // Click outside
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

  // Escape key
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

  // Focus first menu item on open
  useEffect(() => {
    if (open && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>(
        '[role="menuitem"]'
      );
      first?.focus();
    }
  }, [open]);

  // ── Keyboard navigation inside the menu ───────────────────────────────────

  const handleMenuKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
          []
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

  // ── Toggle open/close ─────────────────────────────────────────────────────

  const toggle = () => setOpen((v) => !v);

  const handleItemClick = () => {
    close();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative" style={{ isolation: "isolate" }}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Blogs menu"
        className={`
          px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors
          ${
            open
              ? "text-primary-700 bg-primary-50"
              : "text-surface-600 hover:text-primary-700 hover:bg-primary-50"
          }
        `}
      >
        Blogs
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={`
            absolute left-0 top-full mt-1.5 z-[200]
            w-64 bg-white rounded-xl shadow-xl
            border border-surface-100
            overflow-hidden
            blogs-dropdown-animate
          `}
          role="presentation"
          // Prevent overflow clipping from ancestor overflow:hidden containers
          style={{ minWidth: "min(16rem, 90vw)" }}
        >
          {/* Scroll container with max-height */}
          <ul
            ref={menuRef}
            role="menu"
            aria-label="Blog posts"
            onKeyDown={handleMenuKeyDown}
            className="overflow-y-auto"
            style={{ maxHeight: "min(22rem, 70vh)" }}
          >
            {loading && (
              <li
                role="menuitem"
                aria-disabled="true"
                className="px-4 py-3 text-sm text-surface-400 text-center"
                tabIndex={-1}
              >
                Loading blogs…
              </li>
            )}

            {!loading && error && (
              <li
                role="menuitem"
                aria-disabled="true"
                className="px-4 py-3 text-sm text-surface-400 text-center"
                tabIndex={-1}
              >
                Could not load blogs
              </li>
            )}

            {!loading && !error && posts.length === 0 && (
              <li
                role="menuitem"
                aria-disabled="true"
                className="px-4 py-3 text-sm text-surface-400 text-center"
                tabIndex={-1}
              >
                No posts yet
              </li>
            )}

            {!loading &&
              posts.map((post) => (
                <li key={post.slug} role="none">
                  <a
                    href={buildBlogArticleUrl(post.slug)}
                    role="menuitem"
                    tabIndex={0}
                    onClick={handleItemClick}
                    className="
                      block px-4 py-2.5 text-sm text-surface-700
                      hover:text-primary-700 hover:bg-primary-50
                      focus:outline-none focus-visible:bg-primary-50 focus-visible:text-primary-700
                      transition-colors leading-snug
                    "
                  >
                    {post.title}
                  </a>
                </li>
              ))}

            {/* Divider + View All */}
            {!loading && (
              <li role="none" className="border-t border-surface-100">
                <a
                  href={BLOGS_LISTING_URL}
                  role="menuitem"
                  tabIndex={0}
                  onClick={handleItemClick}
                  className="
                    flex items-center justify-between
                    px-4 py-2.5 text-sm font-semibold
                    text-primary-600 hover:text-primary-700 hover:bg-primary-50
                    focus:outline-none focus-visible:bg-primary-50
                    transition-colors
                  "
                >
                  View All Blogs
                  <ExternalArrow className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE ACCORDION
// ─────────────────────────────────────────────────────────────────────────────

interface BlogsAccordionMobileProps {
  /** Called after the user selects an item so the parent menu can close */
  onClose: () => void;
}

export function BlogsAccordionMobile({ onClose }: BlogsAccordionMobileProps) {
  const { posts, loading, error } = useBlogPosts();
  const [expanded, setExpanded] = useState(false);
  const panelId = "blogs-mobile-panel";

  const handleItemClick = () => {
    setExpanded(false);
    onClose();
  };

  return (
    <div>
      {/* Accordion toggle */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((v) => !v)}
        className={`
          w-full flex items-center justify-between
          px-3 py-2.5 rounded-lg text-sm font-medium
          transition-colors
          ${
            expanded
              ? "text-primary-700 bg-primary-50"
              : "text-surface-700 hover:text-primary-700 hover:bg-primary-50"
          }
        `}
      >
        <span>Blogs</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Nested list */}
      {expanded && (
        <ul
          id={panelId}
          aria-label="Blog posts"
          className="mt-0.5 ml-3 border-l border-surface-200 pl-3 flex flex-col gap-0.5"
        >
          {loading && (
            <li className="px-2 py-2 text-sm text-surface-400">
              Loading blogs…
            </li>
          )}

          {!loading && error && (
            <li className="px-2 py-2 text-sm text-surface-400">
              Could not load blogs
            </li>
          )}

          {!loading && !error && posts.length === 0 && (
            <li className="px-2 py-2 text-sm text-surface-400">No posts yet</li>
          )}

          {!loading &&
            posts.map((post) => (
              <li key={post.slug}>
                <a
                  href={buildBlogArticleUrl(post.slug)}
                  onClick={handleItemClick}
                  className="
                    block px-2 py-2 rounded-lg text-sm
                    text-surface-600 hover:text-primary-700 hover:bg-primary-50
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
                    transition-colors leading-snug
                  "
                >
                  {post.title}
                </a>
              </li>
            ))}

          {/* View All */}
          {!loading && (
            <li className="border-t border-surface-100 mt-0.5 pt-0.5">
              <a
                href={BLOGS_LISTING_URL}
                onClick={handleItemClick}
                className="
                  flex items-center gap-1.5 px-2 py-2 rounded-lg
                  text-sm font-semibold text-primary-600
                  hover:text-primary-700 hover:bg-primary-50
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
                  transition-colors
                "
              >
                View All Blogs
                <ExternalArrow className="w-3.5 h-3.5 flex-shrink-0" />
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
