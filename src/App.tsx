/**
 * App.tsx — Physics Pep Talk PUC Educational Website
 *
 * Visual direction: precision-futuristic — sharp grid, electric accents,
 * scan-line shimmer, tight geometry. Human-made, not AI-generated.
 *
 *   ▸ Deep slate surfaces / electric indigo + teal accent palette
 *   ▸ Background grid + bloom shapes (fixed, z-0)
 *   ▸ Space Grotesk display typeface; Inter body
 *   ▸ Scroll-reveal, scan-sweep shimmer, corner-bracket hover reveals
 *   ▸ 6–16 px border radius — never pill-shaped
 *   ▸ All data-fetching, analytics, routing, SEO, dark-mode logic preserved
 */

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import peptalkLogo from "./assets/peptalklogo.png";
import heroImage from "./assets/hero.png";
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
  trackDarkModeToggle,
} from "./utils/analytics";
import { fetchCourses, type Course } from "./services/courseService";
import { fetchPucTestimonials, type PucTestimonial } from "./services/testimonialService";
import { fetchResourceLinks, type ResourceLinks } from "./services/resourcesService";
import {
  BlogsDropdownDesktop,
  BlogsAccordionMobile,
} from "./components/BlogsDropdown";
import BlogListingPage from "./components/BlogListingPage";
import BlogArticlePage from "./components/BlogArticlePage";
import FacultiesPage from "./components/FacultiesPage";

// ─────────────────────────────────────────────────────────────────────────────
// REVEAL ON SCROLL
// ─────────────────────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const checkNow = () => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) setVisible(true);
  };

  useLayoutEffect(() => { checkNow(); }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setVisible(true); }),
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal reveal-delay-${delay} ${visible ? "visible" : ""}`}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ICONS
// ─────────────────────────────────────────────────────────────────────────────

function ArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function ExternalIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function WaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER — shared pattern
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  body,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 ${center ? "text-center mx-auto readable" : ""}`}>
      <span className="inline-flex items-center gap-1.5 mb-3 text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.16em] flex-wrap">
        <span className="w-4 h-px bg-primary-500/60 flex-shrink-0" aria-hidden="true" />
        {eyebrow}
        <span className="w-4 h-px bg-primary-500/60 flex-shrink-0" aria-hidden="true" />
      </span>
      <h2 className="mb-4">{title}</h2>
      <p className="text-lg text-surface-500 dark:text-surface-400 leading-relaxed">{body}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────

function Header({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-surface-950/85 backdrop-blur-xl border-b border-surface-200/80 dark:border-surface-800/80 shadow-card"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-[68px]">

        {/* Brand */}
        <a
          href="#home"
          className="flex items-center gap-2.5 group rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label={`${siteConfig.brandName} — home`}
        >
          <div className="relative">
            <img
              src={peptalkLogo}
              alt="Physics Pep Talk logo"
              className="h-9 w-9 md:h-10 md:w-10 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
              width="40" height="40"
            />
            {/* subtle glow ring on hover */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-2 ring-primary-400/40 ring-offset-1 dark:ring-offset-surface-950" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-bold text-ink-900 dark:text-ink-50 text-[15px] md:text-base leading-none tracking-tight">
              {siteConfig.brandName}
            </p>
            <p className="text-surface-400 dark:text-surface-500 text-[11px] font-medium mt-0.5 uppercase tracking-[0.12em]">
              {siteConfig.tagline}
            </p>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const isExternal = "external" in link && link.external;
            return (
              <a
                key={link.href}
                href={link.href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="relative text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-ink-900 dark:hover:text-ink-50 transition-colors duration-200 flex items-center gap-1.5 group"
              >
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" aria-hidden="true" />
                {link.label}
                {isExternal && <ExternalIcon className="w-3 h-3 opacity-40" />}
              </a>
            );
          })}
          <BlogsDropdownDesktop />
        </nav>

        {/* Desktop: dark toggle + WhatsApp CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-400 dark:text-surface-500 hover:text-ink-900 dark:hover:text-ink-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
          >
            {dark ? (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("header")}
            className="group relative flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm px-4 py-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-glow-sm scan-target"
          >
            <WaIcon className="w-4 h-4" />
            <span>{siteConfig.whatsappNumber}</span>
          </a>
        </div>

        {/* Mobile: dark + hamburger */}
        <div className="md:hidden flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200"
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
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden bg-white/95 dark:bg-surface-950/95 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800"
        >
          <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isExternal = "external" in link && link.external;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={close}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors duration-150"
                >
                  {link.label}
                  {isExternal && <ExternalIcon className="w-3 h-3 opacity-40" />}
                </a>
              );
            })}
            <BlogsAccordionMobile onClose={close} />
            <div className="pt-3 pb-1">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { trackWhatsAppClick("header_mobile"); close(); }}
                className="flex items-center justify-center gap-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-4 py-3 rounded-lg w-full transition-colors duration-150"
              >
                <WaIcon />
                {siteConfig.whatsappNumber}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      id="home"
      className="relative pt-28 pb-14 sm:pt-32 sm:pb-20 md:pt-36 md:pb-28 bg-surface-50 dark:bg-surface-950 overflow-hidden"
      aria-label="Hero"
    >
      {/* subtle radial vignette at top */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-64 sm:h-96 bg-gradient-to-b from-primary-50/30 dark:from-primary-950/20 to-transparent"
        aria-hidden="true"
      />

      <div className="container-pad relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — copy */}
          <div>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-md bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/60">
              <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
              </span>
              <span className="text-[11px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-[0.12em]">
                Physics Pep Talk · PUC Board &amp; KCET Prep
              </span>
            </div>

            <h1 className="mb-5 text-balance">
              Clear, exam-focused{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary-600 dark:text-primary-400">Physics</span>
                <span
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-500 to-accent-500 rounded-sm -z-0"
                  aria-hidden="true"
                />
              </span>{" "}
              for PUC students.
            </h1>

            <p className="text-base sm:text-lg text-surface-500 dark:text-surface-400 leading-relaxed mb-8 max-w-lg">
              KCET and board exam preparation, PCM learning content, educational YouTube channels,
              and counselling guidance for KCET &amp; COMEDK — all in one place.
            </p>

            <div className="flex flex-col xs:flex-row flex-wrap gap-3">
              <a
                href="#courses"
                onClick={() => trackCTAClick("hero_courses")}
                className="group inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-base px-6 py-3 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-glow scan-target"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("hero")}
                className="group inline-flex items-center justify-center gap-2 border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 hover:border-primary-300 dark:hover:border-primary-700 text-ink-800 dark:text-ink-100 font-semibold text-base px-6 py-3 rounded-lg transition-all duration-200"
              >
                <WaIcon className="w-[18px] h-[18px]" />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right — hero image frame */}
          <div className="relative mt-4 lg:mt-0">
            {/* Orbit rings — desktop only to avoid overflow on mobile */}
            <div
              className="hidden lg:block absolute -inset-8 rounded-xl border border-primary-500/10 dark:border-primary-400/10 pointer-events-none"
              style={{ animation: "orbit 30s linear infinite" }}
              aria-hidden="true"
            />

            {/* Main image card */}
            <div className="relative h-[280px] sm:h-[380px] lg:h-[540px] w-full rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900 group scan-target scanlines">
              <img
                src={heroImage}
                alt="Physics Pep Talk learning environment"
                className="w-full h-full object-cover opacity-80 dark:opacity-60 group-hover:opacity-100 dark:group-hover:opacity-80 transition-opacity duration-700 ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-transparent to-accent-500/5 pointer-events-none" aria-hidden="true" />

              {/* Geometric lines */}
              <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-primary-400/50 to-transparent" aria-hidden="true" />
              <div className="absolute top-4 left-4 h-px w-16 bg-gradient-to-r from-primary-400/50 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-4 right-4 w-px h-16 bg-gradient-to-t from-accent-400/50 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-4 right-4 h-px w-16 bg-gradient-to-l from-accent-400/50 to-transparent" aria-hidden="true" />

              {/* Corner brackets */}
              <span className="corner-bracket tl group-hover:!border-primary-400/70 transition-colors duration-300" aria-hidden="true" />
              <span className="corner-bracket tr group-hover:!border-primary-400/70 transition-colors duration-300" aria-hidden="true" />
              <span className="corner-bracket bl group-hover:!border-accent-400/70 transition-colors duration-300" aria-hidden="true" />
              <span className="corner-bracket br group-hover:!border-accent-400/70 transition-colors duration-300" aria-hidden="true" />
            </div>

            {/* PCM badge — inside the relative container so it never clips the viewport */}
            <div
              className="absolute top-3 right-3 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary-600 border border-primary-500 flex items-center justify-center shadow-glow-sm"
              style={{ animation: "floatY 4s ease-in-out infinite" }}
              aria-hidden="true"
            >
              <span className="text-white font-display font-bold text-xs sm:text-sm tracking-tight">PCM</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────────────────────────────────────

function CourseCard({ course }: { course: Course }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <article className="group relative flex flex-col bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out scan-target">
      {/* thumbnail */}
      <div className="aspect-video bg-surface-100 dark:bg-surface-800 relative overflow-hidden">
        {course.thumbnailUrl && !imgErr ? (
          <img
            src={course.thumbnailUrl}
            alt={course.description?.slice(0, 80) || "Course thumbnail"}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300 dark:text-surface-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        {/* PCM tag */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-surface-950/70 backdrop-blur-sm text-[10px] font-bold text-white tracking-wider">
          PCM
        </div>
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed flex-1 line-clamp-3">
          {course.description || "Physics Pep Talk course."}
        </p>
        {course.courseUrl ? (
          <a
            href={course.courseUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick("course_card")}
            className="group/btn inline-flex items-center justify-center gap-2 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 hover:bg-primary-600 hover:border-primary-600 hover:text-white text-ink-700 dark:text-surface-200 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 hover:shadow-glow-sm"
          >
            Explore Course
            <ExternalIcon className="w-3 h-3 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </a>
        ) : (
          <span className="inline-flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-400 text-sm px-4 py-2.5 rounded-lg select-none">
            Link Coming Soon
          </span>
        )}
      </div>
    </article>
  );
}

function CourseSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 animate-pulse">
      <div className="aspect-video bg-surface-100 dark:bg-surface-800" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-full" />
        <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-4/5" />
        <div className="h-10 bg-surface-100 dark:bg-surface-800 rounded-lg mt-1" />
      </div>
    </div>
  );
}

function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCourses().then(({ courses: c, error: e }) => {
      if (!cancelled) { setCourses(c); setError(e); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!courses.length) return;
    courses.forEach((c) => { if (c.thumbnailUrl) { const img = new Image(); img.src = c.thumbnailUrl; } });
  }, [courses]);

  if (!loading && courses.length === 0) return null;

  return (
    <section id="courses" className="section-pad bg-white dark:bg-surface-950" aria-label="Featured courses">
      <div className="container-pad">
        <Reveal delay={1}>
          <SectionHeader
            eyebrow="Our Courses"
            title="Featured Courses"
            body="PCM courses aligned to the Karnataka PUC syllabus, plus KCET and COMEDK preparation."
          />
        </Reveal>

        {!loading && error && (
          <p className="text-center text-surface-400 text-sm py-16">Courses temporarily unavailable — check back soon.</p>
        )}

        {(loading || courses.length > 0) && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Reveal key={i} delay={1}><CourseSkeleton /></Reveal>
                ))
              : courses.map((c, i) => (
                  <Reveal key={c.courseUrl || c.description} delay={(i % 3) + 1}>
                    <CourseCard course={c} />
                  </Reveal>
                ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

function CategoryBlocks() {
  const [links, setLinks] = useState<ResourceLinks | null>(null);
  useEffect(() => { fetchResourceLinks().then(setLinks); }, []);

  function resolveUrl(block: typeof categoryBlocks[number]): string {
    if (!links) return block.ctaUrl;
    if (block.id === "puc-board")   return links.boardsCourses;
    if (block.id === "cet-comedk")  return links.kcetComedkCourses;
    if (block.id === "counselling") return links.counsellingEnrollment;
    return block.ctaUrl;
  }

  const accentColors = [
    "from-primary-500 to-primary-600",
    "from-accent-500 to-accent-600",
    "from-primary-600 to-accent-500",
  ];

  return (
    <section className="section-pad bg-surface-50 dark:bg-surface-950" aria-label="Course categories">
      <div className="container-pad">
        <Reveal delay={1}>
          <SectionHeader
            eyebrow="Explore by Category"
            title="Find the Right Resource"
            body="Board exam prep, competitive entrances, or personalised counselling — choose what fits your goal."
          />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryBlocks.map((block, idx) => {
            const href = resolveUrl(block);
            return (
              <Reveal key={block.id} delay={idx + 1}>
                <article className="group relative flex flex-col bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 sm:p-7 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden scan-target">
                  {/* top gradient rule */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentColors[idx]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} aria-hidden="true" />

                  <span className="text-[11px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-[0.14em] mb-3 block">
                    {block.subtitle}
                  </span>
                  <h3 className="mb-3">{block.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed flex-1 mb-7">
                    {block.description}
                  </p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCTAClick(`category_${block.id}`)}
                    className="group/btn inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-200 hover:shadow-glow-accent hover:-translate-y-px w-fit"
                  >
                    {block.ctaLabel}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                  </a>
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
// STUDENT FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

function FeedbackCard({ t }: { t: PucTestimonial }) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className="group flex flex-col rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out">
      <div className="relative aspect-video bg-surface-900 overflow-hidden">
        {playing ? (
          <iframe
            src={`${t.embedUrl}?autoplay=1&rel=0`}
            title={t.caption || "Student feedback"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => { setPlaying(true); trackVideoPlay(t.caption || t.youtubeUrl); }}
            className="absolute inset-0 w-full h-full group/thumb"
            aria-label={`Play: ${t.caption?.slice(0, 60) || "feedback video"}`}
          >
            <img
              src={t.thumbnailUrl}
              alt={t.caption?.slice(0, 80) || "Student feedback thumbnail"}
              className="w-full h-full object-cover group-hover/thumb:scale-[1.03] transition-transform duration-500 ease-out"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/30 transition-colors duration-200" />
            <span className="absolute inset-0 flex items-center justify-center">
              {/* Play button — clean rectangle, not a circle */}
              <span className="w-12 h-12 rounded-xl bg-red-600 group-hover/thumb:bg-red-500 flex items-center justify-center shadow-lg transition-all duration-200 group-hover/thumb:scale-110">
                <svg className="w-5 h-5 text-white translate-x-px" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      {t.caption && (
        <div className="px-5 py-4 border-t border-surface-100 dark:border-surface-800">
          <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed line-clamp-2">{t.caption}</p>
        </div>
      )}
    </article>
  );
}

function FeedbackSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 animate-pulse">
      <div className="aspect-video bg-surface-100 dark:bg-surface-800" />
      <div className="px-5 py-4"><div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-3/4" /></div>
    </div>
  );
}

function StudentFeedback() {
  const [items, setItems] = useState<PucTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPucTestimonials().then(({ testimonials, error: e }) => {
      if (!cancelled) { setItems(testimonials); setError(e); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  if (!loading && items.length === 0 && !error) return null;

  return (
    <section id="feedback" className="section-pad bg-white dark:bg-surface-950" aria-label="Student feedback">
      <div className="container-pad">
        <Reveal delay={1}>
          <SectionHeader
            eyebrow="Student Feedback"
            title="What Our Students Say"
            body="Hear from students and parents who have used Physics Pep Talk's courses and guidance."
          />
        </Reveal>

        {!loading && error && items.length === 0 && (
          <p className="text-center text-surface-400 text-sm py-8">Feedback temporarily unavailable.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Reveal key={i} delay={i + 1}><FeedbackSkeleton /></Reveal>
              ))
            : items.map((t, i) => (
                <Reveal key={t.youtubeUrl} delay={(i % 3) + 1}>
                  <FeedbackCard t={t} />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE CHANNELS
// ─────────────────────────────────────────────────────────────────────────────

function YouTubeSection() {
  return (
    <section id="youtube" className="section-pad bg-surface-50 dark:bg-surface-950" aria-label="YouTube channels">
      <div className="container-pad">
        <Reveal delay={1}>
          <SectionHeader
            eyebrow="YouTube"
            title="Official YouTube Channels"
            body="Subscribe for free Physics lessons, board exam prep, and KCET/COMEDK guidance videos."
          />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {youtubeChannels.map((ch, idx) => (
            <Reveal key={ch.id} delay={idx + 1}>
              <article className="group flex flex-col bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out scan-target">
                <div className="p-6 flex flex-col gap-4">
                  {/* Channel identity row */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base leading-tight">{ch.name}</h3>
                      <p className="text-surface-400 dark:text-surface-500 text-xs mt-0.5 font-mono">@{ch.handle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed flex-1">{ch.description}</p>

                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackExternalLink(`youtube_${ch.id}`)}
                    className="group/btn mt-1 inline-flex items-center gap-2 border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-700 dark:hover:text-primary-400 text-surface-700 dark:text-surface-200 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 w-fit"
                  >
                    Visit Channel
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
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
// CONTACT
// ─────────────────────────────────────────────────────────────────────────────

function Contact() {
  const items = [
    {
      key: "whatsapp",
      icon: <WaIcon className="w-5 h-5" />,
      title: "WhatsApp",
      sub: siteConfig.whatsappNumber ? `+${siteConfig.whatsappNumber}` : "Message us",
      href: buildWhatsAppUrl(),
      external: true,
      onClick: () => trackWhatsAppClick("contact"),
      accent: "hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20",
    },
    ...(siteConfig.phoneNumber
      ? [{
          key: "phone",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          ),
          title: "Call Us",
          sub: siteConfig.phoneNumber,
          href: buildPhoneUrl(),
          external: false,
          onClick: () => trackCallClick("contact"),
          accent: "hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20",
        }]
      : []),
    ...(siteConfig.email
      ? [{
          key: "email",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          title: "Email",
          sub: siteConfig.email,
          href: `mailto:${siteConfig.email}`,
          external: false,
          onClick: () => {},
          accent: "hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20",
        }]
      : []),
    {
      key: "instagram",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      title: "Instagram",
      sub: "@physics_pep_talk",
      href: siteConfig.instagramUrl,
      external: true,
      onClick: () => trackExternalLink("instagram_contact"),
      accent: "hover:border-pink-400 dark:hover:border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20",
    },
  ];

  return (
    <section id="contact" className="section-pad bg-white dark:bg-surface-950" aria-label="Contact">
      <div className="container-pad">
        <Reveal delay={1}>
          <SectionHeader
            eyebrow="Contact"
            title="Have Questions?"
            body="Reach out about our courses, resources, or to get personalised guidance. We're happy to help."
            center
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          {items.map((item, idx) => (
            <Reveal key={item.key} delay={idx + 1}>
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={item.onClick}
                className={`group flex items-center gap-3 bg-surface-50 dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 ${item.accent}`}
              >
                <span className="w-10 h-10 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center flex-shrink-0 text-surface-600 dark:text-surface-300 transition-all duration-200 group-hover:border-transparent group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-glow-sm">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 dark:text-ink-50 text-sm">{item.title}</p>
                  <p className="text-surface-400 dark:text-surface-500 text-xs truncate mt-0.5">{item.sub}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-surface-300 dark:text-surface-600 flex-shrink-0 transition-all duration-200 group-hover:text-primary-500 group-hover:translate-x-0.5" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();

  const socialLinks = [
    { href: buildWhatsAppUrl(), label: "WhatsApp", icon: <WaIcon className="w-4 h-4" /> },
    {
      href: siteConfig.instagramUrl,
      label: "Instagram",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
    },
    {
      href: siteConfig.youtubeMainUrl,
      label: "YouTube — Physics Pep Talk",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
    },
    {
      href: siteConfig.youtubeKcetUrl,
      label: "YouTube — Pep Talk Info KCET",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
    },
  ];

  return (
    <footer className="bg-surface-950 text-surface-400 relative overflow-hidden" role="contentinfo">
      {/* Subtle top border gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" aria-hidden="true" />

      <div className="container-pad py-12 md:py-16 relative z-10">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">

          {/* Brand column */}
          <div className="max-w-xs">
            <a
              href="#home"
              className="inline-flex items-center gap-2.5 mb-5 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950 group"
            >
              <img src={peptalkLogo} alt="Physics Pep Talk" className="h-10 w-10 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105" width="40" height="40" />
              <div>
                <p className="text-white font-display font-bold text-base leading-tight">{siteConfig.brandName}</p>
                <p className="text-surface-500 text-[11px] mt-0.5 uppercase tracking-[0.12em]">{siteConfig.tagline}</p>
              </div>
            </a>
            <p className="text-sm text-surface-500 leading-relaxed mb-6">
              Educational resources for PUC students in Karnataka — board prep, Physics, CET guidance, and counselling.
            </p>
            <div className="flex gap-2.5 flex-wrap">
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-surface-900 border border-surface-800 flex items-center justify-center text-surface-500 hover:text-white hover:bg-primary-600 hover:border-primary-600 hover:shadow-glow-sm transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="text-[11px] font-bold text-surface-500 uppercase tracking-[0.16em] mb-5">Navigate</h3>
            <ul className="flex flex-col gap-2.5 list-none space-y-0">
              {navLinks.map((link) => {
                const isExt = "external" in link && link.external;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      {...(isExt ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group text-sm text-surface-500 hover:text-white transition-colors duration-150 inline-flex items-center gap-1.5"
                    >
                      <span className="w-0 group-hover:w-2.5 h-px bg-primary-500 transition-all duration-200 ease-out" aria-hidden="true" />
                      {link.label}
                      {isExt && <ExternalIcon className="w-3 h-3 opacity-40" />}
                    </a>
                  </li>
                );
              })}
              {siteConfig.blogUrl && (
                <li>
                  <a
                    href={siteConfig.blogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group text-sm text-surface-500 hover:text-white transition-colors duration-150 inline-flex items-center gap-1.5"
                  >
                    <span className="w-0 group-hover:w-2.5 h-px bg-primary-500 transition-all duration-200 ease-out" aria-hidden="true" />
                    Blogs
                    <ExternalIcon className="w-3 h-3 opacity-40" />
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-[11px] font-bold text-surface-500 uppercase tracking-[0.16em] mb-5">Legal &amp; Links</h3>
            <ul className="flex flex-col gap-2.5 list-none space-y-0">
              {[
                { href: siteConfig.privacyPolicyUrl, label: "Privacy Policy" },
                { href: siteConfig.termsUrl, label: "Terms & Disclaimer" },
                { href: siteConfig.parentWebsite, label: "Physics Pep Talk (Main Site)" },
                ...(siteConfig.email ? [{ href: `mailto:${siteConfig.email}`, label: siteConfig.email }] : []),
              ].map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    className="group text-sm text-surface-500 hover:text-white transition-colors duration-150 inline-flex items-center gap-1.5"
                  >
                    <span className="w-0 group-hover:w-2.5 h-px bg-accent-500 transition-all duration-200 ease-out" aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-surface-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-surface-600">© {year} {siteConfig.brandName}. All rights reserved.</p>
          <p className="text-xs text-surface-600">Educational resources for PUC students in Karnataka.</p>
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
// ROOT
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const route = useRoute();

  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    try {
      if (window.matchMedia("(prefers-color-scheme: light)").matches) return false;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return true;
    } catch { /* matchMedia unavailable */ }
    return true;
  });

  useEffect(() => {
    const html = document.documentElement;
    dark ? html.classList.add("dark") : html.classList.remove("dark");
  }, [dark]);

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("theme", next ? "dark" : "light");
      trackDarkModeToggle(next ? "dark" : "light");
      return next;
    });
  };

  if (route.page === "blog-listing") {
    trackPageView("/blogs/", "Blog — Physics Pep Talk");
    return <BlogListingPage dark={dark} onToggleDark={toggleDark} />;
  }
  if (route.page === "blog-article" && route.slug) {
    trackPageView(`/blogs/${route.slug}/`, `Blog Article — ${route.slug}`);
    return <BlogArticlePage slug={route.slug} dark={dark} onToggleDark={toggleDark} />;
  }
  if (route.page === "faculties") {
    trackPageView("/faculties/", "Our Faculties — Physics Pep Talk");
    return <FacultiesPage dark={dark} onToggleDark={toggleDark} />;
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 relative z-0">
      {/* Fixed background layers */}
      <div className="bg-grid" aria-hidden="true" />
      <div className="accents" aria-hidden="true">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      {/* Skip-to-content */}
      <a
        href="#main-content"
        className="absolute -top-12 left-4 z-[9999] bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold text-sm focus:top-4 transition-all duration-200"
      >
        Skip to main content
      </a>

      <Header dark={dark} onToggleDark={toggleDark} />

      <main id="main-content" className="relative z-10">
        <Hero />
        <FeaturedCourses />
        <CategoryBlocks />
        <StudentFeedback />
        <YouTubeSection />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
