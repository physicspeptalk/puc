/**
 * App.tsx — Physics Pep Talk PUC Educational Website
 *
 * Coursera Design System (Coursera.org layout):
 * - Clean, professional corporate education portal (white / light-gray #f5f7fa canvas).
 * - Dark top utility bar (For Students, For Parents, Counselling, YouTube).
 * - Clean white navigation bar with logo, Explore dropdown, search bar, and Coursera-blue buttons.
 * - Hero carousel with Coursera's iconic dual-card banners (Featured Course + Counselling series).
 * - "New and popular" 3-column course grid:
 *     • Most popular courses (with thumbnail, star rating, partner tag, and direct links)
 *     • Hot new releases & entrance batches
 *     • Student success stories & video feedback
 * - Trust metrics: 5,000+ Paid Students, 1,000+ Counselled Students, 4.5★ Play Store Rating.
 * - Preserves all business logic, Google Sheets live fetching, and analytics.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import peptalkLogo from "./assets/peptalklogo.png";
import {
  siteConfig,
  navLinks,
  youtubeChannels,
  categoryBlocks,
  buildWhatsAppUrl,
  buildPhoneUrl,
} from "./config/siteConfig";
import {
  trackCTAClick,
  trackWhatsAppClick,
  trackCallClick,
  trackExternalLink,
  trackVideoPlay,
  trackPageView,
} from "./utils/analytics";
import { fetchCourses, type Course } from "./services/courseService";
import {
  HERO_SLIDE_DURATION_MS,
  DEFAULT_FALLBACK_COURSES,
  THEMES,
  calculateCarouselDimensions,
  calculateTrackTranslateX,
  getExtendedSlides,
  normalizeActiveIndex,
} from "./utils/carousel";
import { fetchPucTestimonials, type PucTestimonial } from "./services/testimonialService";
import { fetchResourceLinks, type ResourceLinks } from "./services/resourcesService";
import {
  BlogsDropdownDesktop,
  BlogsAccordionMobile,
} from "./components/BlogsDropdown";
import BlogListingPage from "./components/BlogListingPage";
import BlogArticlePage from "./components/BlogArticlePage";
import FacultiesPage from "./components/FacultiesPage";
import LandingQuickNav from "./components/LandingQuickNav";

const CURRENT_YEAR = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL PROGRESS BAR (Slim Coursera Blue Accent)
// ─────────────────────────────────────────────────────────────────────────────

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="fixed top-0 left-0 h-[2.5px] bg-[#0056D2] z-[100] transition-[width] duration-100 ease-out"
      style={{ width: `${pct}%` }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Scroll progress"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVEAL ON SCROLL
// ─────────────────────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    const el = ref.current;
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const delayClass =
    delay === 1 ? "delay-75" : delay === 2 ? "delay-150" : delay === 3 ? "delay-200" : "";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${delayClass} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function ExternalIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function WaIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function StarIcon({ className = "w-3.5 h-3.5 text-amber-500 fill-amber-500" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function PlayStoreIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.986V2.8a2.38 2.38 0 0 1 .609-.986zm11.306 11.308l2.368 2.368-12.08 6.953 9.712-9.321zm0-2.244L5.203 1.557l12.08 6.953-2.368 2.368zm1.123 1.122l3.493-2.008a1.64 1.64 0 0 1 0 2.846l-3.493 2.008-1.84-1.423 1.84-1.423z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSERA TOP UTILITY BAR (Counselling Portal, YouTube, Call & Play Store)
// ─────────────────────────────────────────────────────────────────────────────

function CourseraTopBar() {
  return (
    <div className="bg-[#181818] text-neutral-300 text-xs hidden md:block border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
        <div className="flex items-center gap-6">
          <a
            href="https://counselling.physicspeptalk.com/kcet/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white transition-colors py-2 leading-none flex items-center gap-1 font-medium"
          >
            <span>Counselling Portal</span>
            <ExternalIcon className="w-2.5 h-2.5 opacity-60" />
          </a>
          <a
            href="#youtube"
            className="text-neutral-400 hover:text-white transition-colors py-2 leading-none font-medium"
          >
            YouTube Channels
          </a>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-neutral-400">
          <span>Call: <a href={buildPhoneUrl()} className="text-white font-medium hover:underline">{siteConfig.phoneNumber}</a></span>
          <span>•</span>
          <a
            href={siteConfig.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white flex items-center gap-1"
          >
            <PlayStoreIcon className="w-3 h-3 text-amber-400" />
            {siteConfig.stats.playStoreRating} ★ Play Store
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSERA MAIN HEADER (White Navbar + Navigation + Coursera Blue Action)
// ─────────────────────────────────────────────────────────────────────────────

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  // Lock body scroll and handle Escape key while mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-white border-b border-gray-200 shadow-xs" role="banner">
      <CourseraTopBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-18 gap-3 sm:gap-4">
        {/* Brand & Explore Dropdown */}
        <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0">
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === "/" || window.location.pathname === "") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                if (window.location.hash) {
                  history.pushState(null, "", "/");
                }
              }
            }}
            className="flex items-center gap-2 sm:gap-2.5 group"
            aria-label={`${siteConfig.brandName} home`}
          >
            <img
              src={peptalkLogo}
              alt="Physics Pep Talk logo"
              className="h-8 w-8 md:h-9 md:w-9 rounded-md object-cover shadow-xs flex-shrink-0"
              width="36"
              height="36"
            />
            <div className="leading-tight min-w-0">
              <span className="font-extrabold text-[#0056D2] text-sm sm:text-lg md:text-xl tracking-tight block truncate">
                {siteConfig.brandName}
              </span>
              <span className="hidden sm:block text-[10px] text-gray-500 font-semibold tracking-wider uppercase truncate">
                {siteConfig.tagline}
              </span>
            </div>
          </a>

          {/* Coursera "Explore ▾" Button & Nav Links */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="/#courses"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-[#0056D2] border border-[#0056D2] hover:bg-blue-50 transition-colors"
            >
              <span>Explore</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <a
              href="/faculties/"
              className="text-xs font-semibold text-gray-700 hover:text-[#0056D2] px-2 py-1.5 transition-colors"
            >
              Faculties
            </a>
            <BlogsDropdownDesktop />
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <a
            href={buildPhoneUrl()}
            onClick={() => trackCallClick("header")}
            className="hidden sm:inline-flex text-xs font-semibold text-gray-700 hover:text-[#0056D2] px-2.5 py-1.5 transition-colors"
          >
            Call Us
          </a>

          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("header")}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-xs font-bold text-white bg-[#0056D2] hover:bg-[#00419e] shadow-xs transition-colors"
          >
            <WaIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Join for Free</span>
            <span className="sm:hidden">Join</span>
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with Backdrop */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-16 md:top-[108px] z-50 flex flex-col" role="dialog" aria-modal="true">
          {/* Soft Dim Backdrop */}
          <div
            className="fixed inset-x-0 bottom-0 top-16 md:top-[108px] bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel */}
          <div className="relative bg-white border-b border-gray-200 px-4 py-5 shadow-2xl z-10 max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-108px)] overflow-y-auto overscroll-contain animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
              {navLinks.map((link) => {
                const isExternal = "external" in link && link.external;
                const isActive = typeof window !== "undefined" && (
                  link.href === window.location.pathname ||
                  (link.href.startsWith("/#") && window.location.hash === link.href.slice(1))
                );
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={close}
                    className={`px-3.5 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? "bg-blue-50 text-[#0056D2] font-bold border-l-3 border-[#0056D2]"
                        : "text-gray-800 hover:text-[#0056D2] hover:bg-gray-50"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isExternal ? (
                      <ExternalIcon className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <span className="text-xs text-gray-400">→</span>
                    )}
                  </a>
                );
              })}

              <div className="my-1.5 border-t border-gray-100" />
              <BlogsAccordionMobile onClose={close} />

              <div className="pt-3 grid grid-cols-2 gap-2.5">
                <a
                  href={buildPhoneUrl()}
                  onClick={() => { trackCallClick("mobile"); close(); }}
                  className="flex items-center justify-center gap-2 px-3 py-3 min-h-[44px] rounded-xl text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 active:scale-98 transition-all"
                >
                  <PhoneIcon className="w-4 h-4 text-[#0056D2]" />
                  <span>Call Us</span>
                </a>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { trackWhatsAppClick("mobile"); close(); }}
                  className="flex items-center justify-center gap-2 px-3 py-3 min-h-[44px] rounded-xl text-xs font-bold text-white bg-[#0056D2] hover:bg-[#00419e] active:scale-98 shadow-xs transition-all"
                >
                  <WaIcon className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSERA HERO CAROUSEL BANNERS (Scrollable Peeking Carousel Track)
// Matches Coursera.org's sliding hero track with centered active card & peeking sides
// ─────────────────────────────────────────────────────────────────────────────

interface HeroProps {
  courses: Course[];
  loadingCourses: boolean;
}

function Hero({ courses, loadingCourses }: HeroProps) {

  const effectiveCourses = courses.length > 0 ? courses : DEFAULT_FALLBACK_COURSES;
  const isMultiSlide = effectiveCourses.length > 1;

  // Track infinite loop slides: [lastClone, ...courses, firstClone] when isMultiSlide
  const extendedCourses = useMemo(() => getExtendedSlides(effectiveCourses), [effectiveCourses]);

  const [currentIndex, setCurrentIndex] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Math.min(window.innerWidth - 32, 1216);
    }
    return 1024;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const startTimeRef = useRef(0);
  const isPausedRef = useRef(isPaused);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Responsive container width measuring
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(updateWidth);
      ro.observe(containerRef.current);
    }
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
      if (ro) ro.disconnect();
    };
  }, []);

  // Adjust slide position when courses change
  const [prevCoursesCount, setPrevCoursesCount] = useState(effectiveCourses.length);
  if (effectiveCourses.length !== prevCoursesCount) {
    setPrevCoursesCount(effectiveCourses.length);
    setCurrentIndex(1);
  }

  // Double rAF after disabling transition for loop reset
  useEffect(() => {
    if (!enableTransition) {
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => {
          setEnableTransition(true);
        });
        return () => cancelAnimationFrame(r2);
      });
      return () => cancelAnimationFrame(r1);
    }
  }, [enableTransition]);

  // Active index for dots and progress bar (maps 1..N to 0..N-1, with wrap around)
  const activeIndex = normalizeActiveIndex(currentIndex, effectiveCourses.length);

  const handleNext = useCallback(() => {
    if (!isMultiSlide) return;
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setEnableTransition(true);
    setCurrentIndex((prev) => prev + 1);
    progressRef.current = 0;
    setProgress(0);
    startTimeRef.current = Date.now();

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  }, [isMultiSlide]);

  const handlePrev = useCallback(() => {
    if (!isMultiSlide) return;
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setEnableTransition(true);
    setCurrentIndex((prev) => prev - 1);
    progressRef.current = 0;
    setProgress(0);
    startTimeRef.current = Date.now();

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  }, [isMultiSlide]);

  const goToSlide = useCallback((targetRealIdx: number) => {
    if (!isMultiSlide) return;
    const targetIdx = targetRealIdx + 1;
    if (targetIdx === currentIndex) return;

    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setEnableTransition(true);
    setCurrentIndex(targetIdx);
    progressRef.current = 0;
    setProgress(0);
    startTimeRef.current = Date.now();

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  }, [isMultiSlide, currentIndex]);

  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  // Progress bar animation loop and auto-advancing
  useEffect(() => {
    if (!isMultiSlide) return;

    startTimeRef.current = Date.now() - (progressRef.current / 100) * HERO_SLIDE_DURATION_MS;
    let animId: number;

    const tick = () => {
      if (!isPausedRef.current) {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const pct = Math.min((elapsed / HERO_SLIDE_DURATION_MS) * 100, 100);
        progressRef.current = pct;
        setProgress(pct);

        if (pct >= 100) {
          handleNextRef.current();
          progressRef.current = 0;
          setProgress(0);
          startTimeRef.current = Date.now();
        }
      } else {
        startTimeRef.current = Date.now() - (progressRef.current / 100) * HERO_SLIDE_DURATION_MS;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isMultiSlide, effectiveCourses.length]);

  // Seamless infinite loop transition reset
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current) return;
    if (e.propertyName !== "transform") return;

    isTransitioningRef.current = false;

    if (!isMultiSlide) return;

    if (currentIndex <= 0) {
      // Jumped to clone of last slide -> snap to real last slide
      setEnableTransition(false);
      setCurrentIndex(effectiveCourses.length);
    } else if (currentIndex >= effectiveCourses.length + 1) {
      // Jumped to clone of first slide -> snap to real first slide
      setEnableTransition(false);
      setCurrentIndex(1);
    }
  };

  // Touch swipe support with 2D gesture disambiguation
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);
  const isSwipingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMultiSlide) return;
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchDeltaXRef.current = 0;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    if (!isSwipingRef.current) {
      if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY) * 1.25) {
        isSwipingRef.current = true;
      } else if (Math.abs(diffY) > 10) {
        touchStartXRef.current = null;
        touchStartYRef.current = null;
        return;
      }
    }

    if (isSwipingRef.current) {
      touchDeltaXRef.current = diffX;
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;

    const diffX = touchDeltaXRef.current;
    const wasSwiping = isSwipingRef.current;

    setDragOffset(0);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchDeltaXRef.current = 0;
    isSwipingRef.current = false;

    if (wasSwiping && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  // Dimensions & translation calculations
  const { gap, slideWidth, centerOffset } = calculateCarouselDimensions(containerWidth);
  const activeSlidePosition = isMultiSlide ? currentIndex : 1;
  const trackTranslateX = isMultiSlide
    ? calculateTrackTranslateX({
        centerOffset,
        slideWidth,
        gap,
        currentIndex: activeSlidePosition,
        dragOffset,
      })
    : 0;

  return (
    <section id="home" className="bg-[#F5F7FA] pt-4 sm:pt-6 pb-10 sm:pb-12 md:pb-16 scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28" aria-label="Hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 0. Download Official App CTA Button (Attractive, Centered) ───── */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <a
            href={siteConfig.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExternalLink("hero_download_playstore_btn")}
            className="group relative inline-flex items-center gap-3 px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border border-slate-800 cursor-pointer"
            aria-label="Download Physics PeP Talk App on Google Play Store"
          >
            {/* Google Play 4-color authentic logo */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 512 512" className="w-full h-full" aria-hidden="true">
                <path fill="#4285F4" d="M32.5 28.5L271.8 256 32.5 483.5c-4.2-4.5-6.5-10.7-6.5-17.5V46c0-6.8 2.3-13 6.5-17.5z"/>
                <path fill="#34A853" d="M351.3 176.5L271.8 256l79.5 79.5 90.2-51.5c14.2-8.1 14.2-21.4 0-29.5l-90.2-78z"/>
                <path fill="#EA4335" d="M271.8 256L32.5 28.5C36.8 24 43.5 22 51.5 26.5l299.8 170L271.8 256z"/>
                <path fill="#FBBC04" d="M271.8 256l79.5 79.5L51.5 485.5c-8 4.5-14.7 2.5-19-2L271.8 256z"/>
              </svg>
            </div>

            {/* Label & Title */}
            <div className="text-left leading-tight">
              <span className="block text-[10px] sm:text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Download Official App
              </span>
              <span className="block text-sm sm:text-base font-extrabold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                Get it on Google Play
              </span>
            </div>

            {/* 4.5 Rating badge pill */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-700">
              <div className="flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-md text-amber-300 text-xs font-bold">
                <span>{siteConfig.stats.playStoreRating}</span>
                <span className="text-amber-400 text-xs">★</span>
              </div>
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>

        {/* ── 1. Trust Metrics Strip (Coursera Institutional Proof) ────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 bg-white border border-gray-200/80 rounded-xl p-3 sm:px-6 mb-5 sm:mb-6 shadow-xs text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-gray-900">
              {siteConfig.stats.paidStudents} Paid Students Enrolled
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0056D2] flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-gray-900">
              {siteConfig.stats.counselledStudents} Counselled Students (KCET &amp; COMEDK)
            </span>
          </div>

          <a
            href={siteConfig.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExternalLink("hero_playstore_strip")}
            className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gray-800 hover:text-[#0056D2] transition-colors"
          >
            <div className="flex items-center gap-1 text-amber-500">
              <span>{siteConfig.stats.playStoreRating}</span>
              <StarIcon />
            </div>
            <span>On Google Play</span>
            <ExternalIcon className="w-2.5 h-2.5 opacity-60" />
          </a>
        </div>

        {/* ── 2. Scrollable Showcase Banners Track (2 on Desktop, 1 on Mobile) ── */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden mb-4 select-none group touch-pan-y"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          aria-roledescription="carousel"
          aria-label="Course Highlights Carousel"
        >
          {loadingCourses ? (
            <div className="w-full flex justify-center py-2">
              <div
                style={{ width: slideWidth > 0 ? `${slideWidth}px` : "100%" }}
                className="rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#00255D] to-[#0056D2] p-6 sm:p-8 md:p-10 min-h-[220px] sm:min-h-[240px] md:min-h-[260px] animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-8 bg-white/20 rounded-lg w-3/4" />
                  <div className="h-4 bg-white/15 rounded w-1/2" />
                </div>
                <div className="flex items-center justify-end pt-4 border-t border-white/15">
                  <div className="h-9 bg-white/30 rounded-lg w-28" />
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={trackRef}
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translate3d(${trackTranslateX}px, 0, 0)`,
                transition: enableTransition && dragOffset === 0
                  ? "transform 500ms cubic-bezier(0.25, 1, 0.5, 1)"
                  : "none",
                gap: `${gap}px`,
              }}
              className="flex items-stretch will-change-transform py-2"
            >
              {extendedCourses.map((slideCourse, extIdx) => {
                const realIdx = isMultiSlide
                  ? ((extIdx - 1) % effectiveCourses.length + effectiveCourses.length) % effectiveCourses.length
                  : 0;
                const theme = THEMES[realIdx % THEMES.length];
                const description = slideCourse?.description?.trim() || "PUC & KCET Preparation Program";
                const courseUrl = slideCourse?.courseUrl?.trim() || "";
                const thumbnailUrl = slideCourse?.thumbnailUrl?.trim() || "";

                return (
                  <div
                    key={`${courseUrl || description}-${extIdx}`}
                    style={{
                      width: slideWidth > 0 ? `${slideWidth}px` : "100%",
                      flexShrink: 0,
                    }}
                    className="transition-all duration-300 ease-out"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Slide ${realIdx + 1} of ${effectiveCourses.length}: ${description}`}
                  >
                    <div
                      className={`relative rounded-2xl md:rounded-3xl ${theme.bg} text-white p-5 sm:p-6 md:p-7 overflow-hidden h-full min-h-[220px] sm:min-h-[240px] md:min-h-[260px] flex flex-col justify-between border ${theme.border} shadow-md`}
                    >
                      {/* Decorative glowing gradient orbs */}
                      <div className={`absolute -right-12 -bottom-12 w-72 h-72 ${theme.glow} rounded-full blur-3xl pointer-events-none`} />
                      <div className="absolute right-1/3 top-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                      {/* Content: ONLY description from Google Sheet & Thumbnail */}
                      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 flex-1">
                        <div className="flex-1 min-w-0 pr-0 sm:pr-2">
                          <h2 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-white leading-snug">
                            {description}
                          </h2>
                        </div>

                        {thumbnailUrl ? (
                          <div className="w-full sm:w-44 md:w-52 lg:w-56 aspect-[16/9] sm:aspect-video rounded-xl overflow-hidden bg-white/10 p-1 border border-white/20 shadow-md flex-shrink-0 self-center sm:self-auto">
                            <img
                              src={thumbnailUrl}
                              alt={description}
                              className="w-full h-full object-cover rounded-lg"
                              loading="eager"
                            />
                          </div>
                        ) : (
                          <div className="w-full sm:w-44 md:w-52 lg:w-56 aspect-[16/9] sm:aspect-video rounded-xl bg-white/10 backdrop-blur-xs p-3 border border-white/15 shadow-md flex-shrink-0 self-center sm:self-auto flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Physics Pep Talk</span>
                              <span className="text-xs font-bold text-amber-300">★ 4.9</span>
                            </div>
                            <div className="text-center py-1">
                              <div className="text-2xl mb-1">⚡</div>
                              <p className="text-[11px] font-bold text-white leading-tight line-clamp-1">{description}</p>
                            </div>
                            <div className="text-[9px] text-white/60 text-center font-medium">Karnataka PUC &amp; KCET</div>
                          </div>
                        )}
                      </div>

                      {/* Banner Action CTA */}
                      <div className="relative z-10 pt-4 flex items-center justify-end border-t border-white/15 mt-3 sm:mt-4">
                        {courseUrl ? (
                          <a
                            href={courseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackCTAClick(`hero_banner_${description}`);
                            }}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all hover:shadow-md active:scale-95 cursor-pointer ${theme.btnClass}`}
                          >
                            <span>Enroll now</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <a
                            href={buildWhatsAppUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all hover:shadow-md active:scale-95 cursor-pointer ${theme.btnClass}`}
                          >
                            <span>Inquire now</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Coursera Next & Prev Arrows */}
          {isMultiSlide && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous course slide"
                className="hidden sm:flex absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-gray-800 shadow-md hover:shadow-xl border border-gray-200/90 items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 focus:opacity-100 cursor-pointer touch-manipulation"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next course slide"
                className="hidden sm:flex absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-gray-800 shadow-md hover:shadow-xl border border-gray-200/90 items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 focus:opacity-100 cursor-pointer touch-manipulation"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Carousel Progress Indicators (Slowly fills up and goes to next slide) */}
        <div className="flex items-center justify-center mb-8">
          <div
            className="flex items-center gap-1.5 sm:gap-2.5 py-2 select-none"
            role="tablist"
            aria-label="Course carousel navigation"
          >
            {effectiveCourses.map((item, idx) => {
              const isActive = idx === activeIndex;
              const label = item.description || `Slide ${idx + 1}`;
              return (
                <button
                  key={item.courseUrl || idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1}: ${label}`}
                  onClick={() => goToSlide(idx)}
                  className="flex items-center justify-center py-3 px-1.5 min-w-[36px] min-h-[36px] focus:outline-none cursor-pointer group"
                >
                  {isActive ? (
                    /* Active indicator: elongated pill that slowly fills up with Coursera blue */
                    <div
                      className="w-12 sm:w-14 h-2 rounded-full bg-gray-200 overflow-hidden relative shadow-2xs transition-all duration-300"
                      title={`Slide ${idx + 1} (${Math.round(progress)}%)`}
                    >
                      <div
                        className="h-full bg-[#0056D2] rounded-full will-change-[width]"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  ) : (
                    /* Inactive indicator: sleek dot */
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-gray-400 group-hover:scale-125 transition-all duration-300"
                      title={`Go to slide ${idx + 1}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL COURSES CATALOG (Coursera Course Grid)
// ─────────────────────────────────────────────────────────────────────────────

function CourseCard({ course }: { course: Course }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <article className="group flex flex-col bg-white border border-gray-200 hover:border-[#0056D2] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200">
      <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
        {course.thumbnailUrl && !imgErr ? (
          <img
            src={course.thumbnailUrl}
            alt={course.description?.slice(0, 80) || "Course thumbnail"}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs font-bold">Physics Pep Talk</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/90 backdrop-blur-xs text-[#0056D2] shadow-xs">
          PCM BATCH
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
            Physics Pep Talk
          </span>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#0056D2] transition-colors">
            {course.description || "Physics Pep Talk Course"}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            Full conceptual mastery, previous years question papers (PYQs), blueprint revisions, and formula sheets.
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-600 font-semibold flex items-center gap-1">
            <StarIcon /> 4.9
          </span>
          {course.courseUrl ? (
            <a
              href={course.courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCTAClick("coursera_course_card_grid")}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0056D2] hover:text-[#00419e] hover:underline"
            >
              <span>Enroll</span>
              <ExternalIcon className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs text-gray-400">Coming Soon</span>
          )}
        </div>
      </div>
    </article>
  );
}

function FeaturedCoursesSection({ courses, loading, error }: { courses: Course[]; loading: boolean; error: string | null }) {
  if (!loading && courses.length === 0 && !error) return null;

  return (
    <section id="courses" className="py-10 sm:py-16 md:py-20 bg-white border-t border-gray-200 scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              All Courses &amp; Batches
            </h2>
            <p className="text-sm text-gray-600">
              Browse structured courses tailored for Karnataka 1st &amp; 2nd PUC board examinations, plus competitive KCET and COMEDK tests.
            </p>
          </div>
        </Reveal>

        {!loading && error && (
          <p className="text-center text-gray-500 text-sm py-10">Courses temporarily unavailable — please check back soon.</p>
        )}

        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="aspect-[16/9] bg-gray-100 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            : courses.map((c, i) => (
                <Reveal key={c.courseUrl || i} delay={(i % 3) + 1}>
                  <CourseCard course={c} />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALIZED TRACKS SECTION (Coursera "Explore by Goal" Cards)
// ─────────────────────────────────────────────────────────────────────────────

function CategoryBlocksSection() {
  const [links, setLinks] = useState<ResourceLinks | null>(null);
  useEffect(() => {
    fetchResourceLinks().then(setLinks);
  }, []);

  function resolveUrl(block: typeof categoryBlocks[number]): string {
    if (!links) return block.ctaUrl;
    if (block.id === "puc-board")   return links.boardsCourses;
    if (block.id === "cet-comedk")  return links.kcetComedkCourses;
    if (block.id === "counselling") return links.counsellingEnrollment;
    return block.ctaUrl;
  }

  return (
    <section id="categories" className="py-10 sm:py-16 md:py-20 bg-[#F5F7FA] border-t border-gray-200 scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 sm:mb-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Explore by Academic Goal
            </h2>
            <p className="text-sm text-gray-600">
              Pick your pathway — board exam percentage enhancement, competitive entrance problem solving, or personalized counselling.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
          {categoryBlocks.map((block, idx) => {
            const href = resolveUrl(block);
            return (
              <Reveal key={block.id} delay={idx + 1}>
                <article className="h-full flex flex-col p-5 sm:p-7 rounded-2xl bg-white border border-gray-200 hover:border-[#0056D2] hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl mb-4">
                    {block.emoji}
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0056D2] mb-1">
                    {block.subtitle}
                  </span>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {block.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                    {block.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackCTAClick(`category_${block.id}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0056D2] hover:underline"
                    >
                      <span>{block.ctaLabel}</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT REVIEWS & FEEDBACK SECTION
// ─────────────────────────────────────────────────────────────────────────────

function StudentFeedbackSection({ items, loading, error }: { items: PucTestimonial[]; loading: boolean; error: string | null }) {
  if (!loading && items.length === 0 && !error) return null;

  return (
    <section id="feedback" className="py-10 sm:py-16 md:py-20 bg-white border-t border-gray-200 scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 sm:mb-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              From the Physics Pep Talk Community
            </h2>
            <p className="text-sm text-gray-600">
              1,000+ students and parents share their experiences regarding our Dhrona &amp; Sudarshana batches.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.youtubeUrl || i} delay={(i % 3) + 1}>
              <article className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                <div className="relative aspect-[16/9] bg-black">
                  <img
                    src={t.thumbnailUrl}
                    alt={t.caption || "Student review"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <a
                    href={t.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackVideoPlay(t.caption || t.youtubeUrl)}
                    className="absolute inset-0 bg-black/30 hover:bg-black/15 flex items-center justify-center transition-colors"
                    aria-label="Play testimonial video on YouTube"
                  >
                    <span className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                      <svg className="w-5 h-5 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </a>
                </div>
                {t.caption && (
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs font-semibold text-gray-800 leading-relaxed line-clamp-2 mb-2">
                      &ldquo;{t.caption}&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                      <span>Verified Review</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <StarIcon /> 5.0
                      </span>
                    </div>
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL YOUTUBE CHANNELS SECTION
// ─────────────────────────────────────────────────────────────────────────────

function YouTubeSection() {
  return (
    <section id="youtube" className="py-10 sm:py-16 md:py-20 bg-[#F5F7FA] border-t border-gray-200 scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 sm:mb-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Free Lectures on YouTube
            </h2>
            <p className="text-sm text-gray-600">
              Access hours of free concept explanations, PUC board question paper breakdowns, and college cut-off analysis.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 max-w-4xl">
          {youtubeChannels.map((ch, idx) => (
            <Reveal key={ch.id} delay={idx + 1}>
              <article className="h-full flex flex-col p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#0056D2] hover:shadow-md transition-all">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{ch.name}</h3>
                    <p className="text-xs text-[#0056D2] font-semibold">@{ch.handle}</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed flex-1 mb-5">
                  {ch.description}
                </p>

                <div className="pt-3 border-t border-gray-100">
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackExternalLink(`youtube_${ch.id}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    <span>Subscribe on YouTube</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT SECTION
// ─────────────────────────────────────────────────────────────────────────────

function ContactSection() {
  const items = [
    {
      key: "whatsapp",
      icon: <WaIcon className="w-5 h-5 text-emerald-600" />,
      title: "WhatsApp Chat",
      sub: siteConfig.whatsappNumber ? `+91 ${siteConfig.whatsappNumber}` : "Instant Chat",
      href: buildWhatsAppUrl(),
      external: true,
      onClick: () => trackWhatsAppClick("contact_section"),
      badge: "Fastest Response",
    },
    ...(siteConfig.phoneNumber ? [{
      key: "phone",
      icon: <PhoneIcon className="w-5 h-5 text-[#0056D2]" />,
      title: "Phone Call",
      sub: siteConfig.phoneNumber,
      href: buildPhoneUrl(),
      external: false,
      onClick: () => trackCallClick("contact_section"),
      badge: "Mon–Sat 9AM–7PM",
    }] : []),
    ...(siteConfig.email ? [{
      key: "email",
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email Support",
      sub: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
      external: false,
      onClick: () => {},
      badge: "Admissions Desk",
    }] : []),
    {
      key: "instagram",
      icon: (
        <svg className="w-5 h-5 text-pink-600 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      title: "Instagram",
      sub: "@physics_pep_talk",
      href: siteConfig.instagramUrl,
      external: true,
      onClick: () => trackExternalLink("instagram_contact"),
      badge: "Community",
    },
  ];

  return (
    <section id="contact" className="py-10 sm:py-16 md:py-20 bg-white border-t border-gray-200 scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 sm:mb-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Need Admission Guidance?
            </h2>
            <p className="text-sm text-gray-600">
              Get in touch with our student counseling desk to select the best batch for your target examination.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl">
          {items.map((item, idx) => (
            <Reveal key={item.key} delay={idx + 1}>
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={item.onClick}
                className="group flex flex-col p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#0056D2] hover:shadow-md transition-all min-h-[140px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 truncate mb-4">{item.sub}</p>
                <div className="mt-auto flex items-center gap-1 text-xs font-bold text-[#0056D2]">
                  <span>Connect</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSERA STYLE FOOTER
// ─────────────────────────────────────────────────────────────────────────────

function Footer() {
  const year = CURRENT_YEAR;

  return (
    <footer className="border-t border-gray-200 bg-[#1F1F1F] text-gray-300" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={peptalkLogo}
                alt="Physics Pep Talk"
                className="h-8 w-8 rounded-lg object-cover"
                width="32"
                height="32"
              />
              <span className="text-white font-bold text-base">{siteConfig.brandName}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Karnataka&apos;s leading education academy for PUC board examinations and competitive entrance guidance.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Batches &amp; Tracks
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#courses" className="hover:text-white transition-colors">1st &amp; 2nd PUC Boards</a></li>
              <li><a href="#courses" className="hover:text-white transition-colors">KCET PCM Fastrack Batch</a></li>
              <li><a href="#courses" className="hover:text-white transition-colors">Dhrona COMEDK Counselling</a></li>
              <li><a href="/faculties/" className="hover:text-white transition-colors">Faculty Profiles</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Community &amp; Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/blogs/" className="hover:text-white transition-colors">PUC Preparation Blogs</a></li>
              <li><a href={siteConfig.youtubeMainUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube Channel</a></li>
              <li><a href={siteConfig.playStoreUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Android Mobile App</a></li>
              <li><a href={siteConfig.parentWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Main Website</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Support &amp; Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp: +91 {siteConfig.whatsappNumber}
                </a>
              </li>
              <li><a href={siteConfig.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href={siteConfig.termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <p>© {year} {siteConfig.brandName}. All rights reserved.</p>
          <p>Structured learning for PUC, KCET, COMEDK &amp; NEET in Karnataka.</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────────────────────

function parseRoute(pathname: string): { page: "home" | "blog-listing" | "blog-article" | "faculties"; slug?: string } {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/blogs" || pathname === "/blogs/") return { page: "blog-listing" };
  const blogArticleMatch = pathname.match(/^\/blogs\/([^/]+)\/?$/);
  if (blogArticleMatch) return { page: "blog-article", slug: blogArticleMatch[1] };
  if (path === "/faculties" || pathname === "/faculties/") return { page: "faculties" };
  return { page: "home" };
}

function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));
  useEffect(() => {
    const handler = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  return route;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APPLICATION
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const route = useRoute();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [testimonials, setTestimonials] = useState<PucTestimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCourses().then(({ courses: c, error: e }) => {
      if (!cancelled) {
        setCourses(c);
        setCoursesError(e);
        setLoadingCourses(false);
      }
    });

    fetchPucTestimonials().then(({ testimonials: t, error: e }) => {
      if (!cancelled) {
        setTestimonials(t);
        setTestimonialsError(e);
        setLoadingTestimonials(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (route.page === "blog-listing") {
      trackPageView("/blogs/", "Blog — Physics Pep Talk");
    } else if (route.page === "blog-article" && route.slug) {
      trackPageView(`/blogs/${route.slug}/`, `Blog Article — ${route.slug}`);
    } else if (route.page === "faculties") {
      trackPageView("/faculties/", "Our Faculties — Physics Pep Talk");
    } else {
      trackPageView("/", "Home — Physics Pep Talk");
    }
  }, [route]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 font-sans antialiased selection:bg-[#0056D2] selection:text-white flex flex-col justify-between">
      <ScrollProgress />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-[#0056D2] text-white rounded-md font-bold text-xs"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        {route.page === "home" && (
          <>
            {/* Coursera Hero Carousel Banners */}
            <Hero
              courses={courses}
              loadingCourses={loadingCourses}
            />

            {/* Full Academic Course Catalog */}
            <FeaturedCoursesSection
              courses={courses}
              loading={loadingCourses}
              error={coursesError}
            />

            {/* Specialized Study Tracks */}
            <CategoryBlocksSection />

            {/* Real Student Video Reviews */}
            <StudentFeedbackSection
              items={testimonials}
              loading={loadingTestimonials}
              error={testimonialsError}
            />

            {/* Official YouTube Channels */}
            <YouTubeSection />

            {/* Direct Contact & Support */}
            <ContactSection />

            {/* Microsoft Learn Styled Landing Page Quick Nav */}
            <LandingQuickNav />
          </>
        )}

        {route.page === "blog-listing" && <BlogListingPage />}
        {route.page === "blog-article" && route.slug && <BlogArticlePage slug={route.slug} />}
        {route.page === "faculties" && <FacultiesPage />}
      </main>

      <Footer />
    </div>
  );
}
