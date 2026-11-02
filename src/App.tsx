/**
 * App.tsx — Physics Pep Talk PUC Educational Website
 *
 * Professional Enterprise Design (Google / Microsoft design patterns)
 * - Restrained, clean slate & dark palette with energetic warm accent (#f97316)
 * - Modern typography hierarchy, clean card elevations, and breathing room
 * - Hero section features:
 *     • Authoritative headline & category tags
 *     • 3 trust metrics (5,000+ Paid Students, 1,000+ Counselled Students, 4.8★ On Play Store)
 *     • Live Featured Courses & Student Success Stories showcase cards directly in the hero
 *     • Interactive carousel controls & prominent "Explore All Courses →" CTA
 * - Preserves all business logic, data fetching (Google Sheets), routing, and analytics.
 */

import { useState, useEffect, useRef } from "react";
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
  trackCarouselNav,
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
// SCROLL PROGRESS BAR (Slim, unobtrusive)
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
      className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-orange-500 via-amber-400 to-primary-500 z-[100] transition-[width] duration-100 ease-out"
      style={{ width: `${pct}%` }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVEAL ON SCROLL (Simple, professional entrance)
// ─────────────────────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const el = ref.current;
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const delayClass = delay === 1 ? "delay-100" : delay === 2 ? "delay-200" : delay === 3 ? "delay-300" : "";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${delayClass} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADING (Standard Google/Microsoft style)
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 md:mb-16 ${center ? "text-center max-w-3xl mx-auto" : "max-w-2xl"}`}>
      {eyebrow && (
        <span className="inline-block text-xs font-bold tracking-[0.18em] uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full mb-3.5">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
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

function ChevronLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

function StarIcon({ className = "w-4 h-4 text-amber-400 fill-amber-400" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function GooglePlayIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.986V2.8a2.38 2.38 0 0 1 .609-.986zm11.306 11.308l2.368 2.368-12.08 6.953 9.712-9.321zm0-2.244L5.203 1.557l12.08 6.953-2.368 2.368zm1.123 1.122l3.493-2.008a1.64 1.64 0 0 1 0 2.846l-3.493 2.008-1.84-1.423 1.84-1.423z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER (Microsoft / Google Clean Corporate Style)
// ─────────────────────────────────────────────────────────────────────────────

function Header() {
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
          ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20"
          : "bg-slate-950/40 backdrop-blur-sm border-b border-transparent"
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-18">
        {/* Brand */}
        <a
          href="#home"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg"
          aria-label={`${siteConfig.brandName} — home`}
        >
          <img
            src={peptalkLogo}
            alt="Physics Pep Talk logo"
            className="h-9 w-9 md:h-10 md:w-10 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform duration-200"
            width="40"
            height="40"
          />
          <div className="leading-tight">
            <p className="font-bold text-white text-base md:text-lg tracking-tight">
              {siteConfig.brandName}
            </p>
            <p className="text-slate-400 text-[11px] font-medium tracking-wider uppercase">
              {siteConfig.tagline}
            </p>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const isExternal = "external" in link && link.external;
            return (
              <a
                key={link.href}
                href={link.href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150 flex items-center gap-1.5"
              >
                {link.label}
                {isExternal && <ExternalIcon className="w-3 h-3 text-slate-500" />}
              </a>
            );
          })}
          <BlogsDropdownDesktop />
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={buildPhoneUrl()}
            onClick={() => trackCallClick("header")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all duration-150"
          >
            <PhoneIcon className="w-3.5 h-3.5 text-orange-400" />
            <span>{siteConfig.phoneNumber}</span>
          </a>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("header")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 shadow-sm transition-all duration-150"
          >
            <WaIcon className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-2">
          <a
            href={buildPhoneUrl()}
            onClick={() => trackCallClick("header_mobile_icon")}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Call Us"
          >
            <PhoneIcon className="w-5 h-5 text-orange-400" />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
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

      {/* Mobile Drawer */}
      {menuOpen && (
        <div id="mobile-nav" className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-4 backdrop-blur-xl">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isExternal = "external" in link && link.external;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={close}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  {isExternal && <ExternalIcon className="w-3.5 h-3.5 text-slate-500" />}
                </a>
              );
            })}
            <div className="my-1 border-t border-slate-800/80" />
            <BlogsAccordionMobile onClose={close} />
            <div className="pt-3 grid grid-cols-2 gap-2">
              <a
                href={buildPhoneUrl()}
                onClick={() => { trackCallClick("mobile_drawer"); close(); }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700"
              >
                <PhoneIcon className="w-3.5 h-3.5 text-orange-400" />
                <span>Call</span>
              </a>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { trackWhatsAppClick("mobile_drawer"); close(); }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500"
              >
                <WaIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION (With Course Showcase + Student Success Stories Directly Inside)
// As requested & referenced in user screenshot
// ─────────────────────────────────────────────────────────────────────────────

interface HeroProps {
  courses: Course[];
  testimonials: PucTestimonial[];
  loadingCourses: boolean;
  loadingTestimonials: boolean;
}

function Hero({ courses, testimonials, loadingCourses, loadingTestimonials }: HeroProps) {
  const [courseIdx, setCourseIdx] = useState(0);
  const [testiIdx, setTestiIdx] = useState(0);
  const [activeVideo, setActiveVideo] = useState(false);

  // Auto rotate course slide every 6s if user hasn't interacted
  useEffect(() => {
    if (courses.length <= 1) return;
    const interval = setInterval(() => {
      setCourseIdx((prev) => (prev + 1) % courses.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [courses.length]);

  const currentCourse = courses[courseIdx] || null;
  const currentTesti = testimonials[testiIdx] || null;

  const nextCourse = () => {
    trackCarouselNav("next", courseIdx);
    setCourseIdx((prev) => (prev + 1) % courses.length);
  };
  const prevCourse = () => {
    trackCarouselNav("prev", courseIdx);
    setCourseIdx((prev) => (prev - 1 + courses.length) % courses.length);
  };

  const nextTesti = () => {
    setActiveVideo(false);
    setTestiIdx((prev) => (prev + 1) % testimonials.length);
  };
  const prevTesti = () => {
    setActiveVideo(false);
    setTestiIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-slate-950"
      aria-label="Hero"
    >
      {/* Subtle enterprise ambient background gradient (inspired by Google / Microsoft Cloud) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-orange-500/10 via-primary-500/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-48 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Text / Authority Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 shadow-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Karnataka&apos;s Premier Learning Community</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-4 text-balance">
            Karnataka&apos;s Trusted Teachers{" "}
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              for Competitive Exams
            </span>
          </h1>

          {/* Exam Badges / Pills */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-400 mb-6">
            <span className="text-orange-400">KCET</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">NEET</span>
            <span className="text-slate-600">•</span>
            <span className="text-orange-400">PUC BOARDS</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">COMEDK</span>
          </div>

          {/* Short Subhead */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            High-yield PCM concepts, comprehensive board exam mastery, and round-by-round counselling guidance to secure your top engineering &amp; medical rank.
          </p>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TRUST STAT METRICS BAR (User requested: 5000+ paid students,       */}
          {/* 1000+ counselled students, 4.8★ Play Store rating)                  */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Stat 1: 5000+ Paid Students */}
              <div className="flex items-center justify-center sm:justify-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-11 h-11 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-5.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {siteConfig.stats.paidStudents}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    Paid Students Enrolled
                  </p>
                </div>
              </div>

              {/* Stat 2: 1000+ Counselled Students */}
              <div className="flex items-center justify-center sm:justify-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-11 h-11 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {siteConfig.stats.counselledStudents}
                  </p>
                  <p className="text-xs font-medium text-slate-400 leading-snug">
                    Counselled Students (KCET &amp; COMEDK)
                  </p>
                </div>
              </div>

              {/* Stat 3: Play Store Rating (4.8★ / 5.0 scale) */}
              <a
                href={siteConfig.playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackExternalLink("playstore_hero_stat")}
                className="group flex items-center justify-center sm:justify-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-colors"
                title="View Physics PeP Talk on Google Play Store"
              >
                <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <GooglePlayIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                      {siteConfig.stats.playStoreRating}
                    </p>
                    <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300 flex items-center gap-1">
                    {siteConfig.stats.playStoreLabel}
                    <ExternalIcon className="w-2.5 h-2.5 opacity-50" />
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* HERO SHOWCASE CARDS (FEATURED COURSES & STUDENT SUCCESS STORIES)   */}
        {/* Matches the side-by-side cards from the user's reference screenshot */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="mt-6 md:mt-10 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* Card 1: Featured Courses Showcase */}
            <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-slate-700">
              {/* Card Header Bar */}
              <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <h2 className="text-sm font-bold text-white tracking-wide">Featured Courses</h2>
                </div>
                {courses.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevCourse}
                      aria-label="Previous featured course"
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-slate-500 px-1">
                      {courseIdx + 1} / {courses.length}
                    </span>
                    <button
                      onClick={nextCourse}
                      aria-label="Next featured course"
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Course Media / Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                {loadingCourses ? (
                  <div className="animate-pulse space-y-4">
                    <div className="aspect-[16/9] bg-slate-800 rounded-xl" />
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                ) : currentCourse ? (
                  <div className="flex flex-col flex-1">
                    <div className="relative aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 mb-4 group">
                      {currentCourse.thumbnailUrl ? (
                        <img
                          src={currentCourse.thumbnailUrl}
                          alt={currentCourse.description || "Course Preview"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <span className="text-sm font-medium">Physics Pep Talk Course</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-bold text-orange-400 border border-orange-500/30">
                        PUC &amp; KCET
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-1 mb-1">
                      {currentCourse.description || "Comprehensive KCET / PUC Preparation"}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      Complete video lectures, chapterwise tests, formula cheat sheets, and Karnataka blueprint revision.
                    </p>

                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-800/60">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Admissions Open
                      </span>
                      {currentCourse.courseUrl ? (
                        <a
                          href={currentCourse.courseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackCTAClick("hero_featured_course")}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          Enroll Now
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-12 text-center">Courses temporarily loading...</p>
                )}
              </div>
            </div>

            {/* Card 2: Student Success Stories Showcase */}
            <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-slate-700">
              {/* Card Header Bar */}
              <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-bold text-white tracking-wide">Student Success Stories</h2>
                </div>
                {testimonials.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevTesti}
                      aria-label="Previous testimonial"
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-slate-500 px-1">
                      {testiIdx + 1} / {testimonials.length}
                    </span>
                    <button
                      onClick={nextTesti}
                      aria-label="Next testimonial"
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Video Testimonial Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                {loadingTestimonials ? (
                  <div className="animate-pulse space-y-4">
                    <div className="aspect-[16/9] bg-slate-800 rounded-xl" />
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                ) : currentTesti ? (
                  <div className="flex flex-col flex-1">
                    <div className="relative aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 mb-4 group">
                      {activeVideo ? (
                        <iframe
                          src={`${currentTesti.embedUrl}?autoplay=1&rel=0`}
                          title={currentTesti.caption || "Student feedback"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVideo(true);
                            trackVideoPlay(currentTesti.caption || currentTesti.youtubeUrl);
                          }}
                          className="w-full h-full relative cursor-pointer group/thumb"
                          aria-label={`Play: ${currentTesti.caption || "testimonial video"}`}
                        >
                          <img
                            src={currentTesti.thumbnailUrl}
                            alt={currentTesti.caption || "Student feedback thumbnail"}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/20 transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-13 h-13 rounded-full bg-red-600 group-hover/thumb:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover/thumb:scale-110">
                              <svg className="w-6 h-6 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </div>
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                            Verified Review
                          </div>
                        </button>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-1 mb-1">
                      {currentTesti.caption || "Student & Parent Feedback on Dhrona Batch"}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      Hear authentic experiences regarding our teaching methodologies, test series, and counselling rank improvement.
                    </p>

                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-800/60">
                      <span className="text-xs text-slate-400">
                        Dhrona &amp; Sudarshana Batches
                      </span>
                      <a
                        href="#feedback"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        More Reviews
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-12 text-center">Reviews temporarily loading...</p>
                )}
              </div>
            </div>

          </div>

          {/* Dots Indicator for Showcase */}
          {courses.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6" aria-label="Course carousel pagination">
              {courses.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    trackCarouselNav("dot", i);
                    setCourseIdx(i);
                  }}
                  aria-label={`Go to course ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    courseIdx === i ? "w-7 bg-orange-500" : "w-2 bg-slate-700 hover:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Primary CTA Button (Matching the prominent orange button from reference screenshot) */}
          <div className="mt-8 text-center">
            <a
              href="#courses"
              onClick={() => trackCTAClick("hero_explore_all_courses")}
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Explore All Courses</span>
              <ArrowRightIcon className="w-5 h-5" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL COURSES SECTION (Full Catalog with Clean Enterprise Grid)
// ─────────────────────────────────────────────────────────────────────────────

function CourseCard({ course }: { course: Course }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <article className="group flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md hover:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[16/9] bg-slate-950 relative overflow-hidden">
        {course.thumbnailUrl && !imgErr ? (
          <img
            src={course.thumbnailUrl}
            alt={course.description?.slice(0, 80) || "Course thumbnail"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-orange-400 border border-slate-800">
          PCM BATCH
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 md:p-6 justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug mb-2 group-hover:text-orange-400 transition-colors">
            {course.description || "Physics Pep Talk Course"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            Curated syllabus, previous year questions (PYQs), formula revision sheets, and targeted exam problem solving.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            Karnataka Syllabus
          </span>
          {course.courseUrl ? (
            <a
              href={course.courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCTAClick("course_card_grid")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-orange-600 transition-colors"
            >
              Explore Course
              <ExternalIcon className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs text-slate-500 font-medium">Link Soon</span>
          )}
        </div>
      </div>
    </article>
  );
}

function CourseSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-800 rounded w-4/5" />
        <div className="h-3 bg-slate-800 rounded w-3/5" />
        <div className="h-8 bg-slate-800 rounded mt-4" />
      </div>
    </div>
  );
}

function FeaturedCoursesSection({ courses, loading, error }: { courses: Course[]; loading: boolean; error: string | null }) {
  if (!loading && courses.length === 0 && !error) return null;

  return (
    <section id="courses" className="py-20 lg:py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Comprehensive Catalog"
            title="All Academic Courses & Batches"
            subtitle="Explore our targeted preparation batches for 1st & 2nd PUC Boards, KCET entrance, and COMEDK admissions."
          />
        </Reveal>

        {!loading && error && (
          <p className="text-center text-slate-500 text-sm py-10">Courses temporarily unavailable — please check back soon.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <CourseSkeleton key={i} />)
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
// LEARNING CATEGORIES / TRACKS SECTION (Microsoft Azure / Google Cloud Pattern)
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
    <section id="categories" className="py-20 lg:py-24 bg-slate-900/40 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Specialized Tracks"
            title="Find the Right Preparation Track"
            subtitle="Whether you need complete board exam score boosting, competitive entrance shortcuts, or choice-filling guidance — we have you covered."
          />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {categoryBlocks.map((block, idx) => {
            const href = resolveUrl(block);
            return (
              <Reveal key={block.id} delay={idx + 1}>
                <article className="group h-full flex flex-col p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-105 transition-transform">
                    {block.emoji}
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
                    {block.subtitle}
                  </span>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {block.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">
                    {block.description}
                  </p>

                  <div className="pt-5 border-t border-slate-800/80">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackCTAClick(`category_${block.id}`)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-orange-400 transition-colors"
                    >
                      <span>{block.ctaLabel}</span>
                      <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
// STUDENT SUCCESS & REVIEWS SECTION (Clean Customer Stories Pattern)
// ─────────────────────────────────────────────────────────────────────────────

function StudentFeedbackSection({ items, loading, error }: { items: PucTestimonial[]; loading: boolean; error: string | null }) {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  if (!loading && items.length === 0 && !error) return null;

  return (
    <section id="feedback" className="py-20 lg:py-24 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Student & Parent Trust"
            title="Real Reviews & Student Success Stories"
            subtitle="Hear directly from students and parents whose results and engineering admissions were transformed by Physics Pep Talk."
          />
        </Reveal>

        {!loading && error && items.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-8">Feedback videos temporarily unavailable.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[16/9] bg-slate-800" />
                  <div className="p-4"><div className="h-4 bg-slate-800 rounded w-3/4" /></div>
                </div>
              ))
            : items.map((t, i) => (
                <Reveal key={t.youtubeUrl || i} delay={(i % 3) + 1}>
                  <article className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md hover:border-slate-700 transition-all duration-300">
                    <div className="relative aspect-[16/9] bg-slate-950">
                      {activeVideoUrl === t.youtubeUrl ? (
                        <iframe
                          src={`${t.embedUrl}?autoplay=1&rel=0`}
                          title={t.caption || "Student feedback"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVideoUrl(t.youtubeUrl);
                            trackVideoPlay(t.caption || t.youtubeUrl);
                          }}
                          className="w-full h-full relative cursor-pointer group/thumb"
                          aria-label={`Play: ${t.caption?.slice(0, 60) || "feedback video"}`}
                        >
                          <img
                            src={t.thumbnailUrl}
                            alt={t.caption?.slice(0, 80) || "Student feedback thumbnail"}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/20 transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-12 h-12 rounded-full bg-red-600 group-hover/thumb:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover/thumb:scale-110">
                              <svg className="w-5 h-5 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </div>
                        </button>
                      )}
                    </div>
                    {t.caption && (
                      <div className="p-4 md:p-5 flex-1 flex items-center">
                        <p className="text-sm font-medium text-slate-300 leading-relaxed line-clamp-2">
                          &ldquo;{t.caption}&rdquo;
                        </p>
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
    <section id="youtube" className="py-20 lg:py-24 bg-slate-900/30 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Free Learning"
            title="Official YouTube Channels"
            subtitle="Access hours of free concept explanations, PUC board exam question paper breakdowns, and KCET counselling updates."
          />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {youtubeChannels.map((ch, idx) => (
            <Reveal key={ch.id} delay={idx + 1}>
              <article className="group h-full flex flex-col p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 text-white shadow-md group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{ch.name}</h3>
                    <p className="text-xs font-mono text-orange-400 mt-0.5">@{ch.handle}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-6">
                  {ch.description}
                </p>

                <div className="pt-4 border-t border-slate-800/80">
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackExternalLink(`youtube_${ch.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-red-600 transition-colors"
                  >
                    <span>Subscribe &amp; Watch</span>
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
// CONTACT SECTION (Clean Microsoft / Google Support Cards)
// ─────────────────────────────────────────────────────────────────────────────

function ContactSection() {
  const items = [
    {
      key: "whatsapp",
      icon: <WaIcon className="w-5 h-5 text-emerald-400" />,
      title: "WhatsApp Chat",
      sub: siteConfig.whatsappNumber ? `+91 ${siteConfig.whatsappNumber}` : "Chat directly",
      href: buildWhatsAppUrl(),
      external: true,
      onClick: () => trackWhatsAppClick("contact_section"),
      badge: "Instant Reply",
    },
    ...(siteConfig.phoneNumber ? [{
      key: "phone",
      icon: <PhoneIcon className="w-5 h-5 text-orange-400" />,
      title: "Direct Phone Call",
      sub: siteConfig.phoneNumber,
      href: buildPhoneUrl(),
      external: false,
      onClick: () => trackCallClick("contact_section"),
      badge: "Mon–Sat 9AM–7PM",
    }] : []),
    ...(siteConfig.email ? [{
      key: "email",
      icon: (
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email Support",
      sub: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
      external: false,
      onClick: () => {},
      badge: "Admissions & General",
    }] : []),
    {
      key: "instagram",
      icon: (
        <svg className="w-5 h-5 text-pink-400 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      title: "Instagram",
      sub: "@physics_pep_talk",
      href: siteConfig.instagramUrl,
      external: true,
      onClick: () => trackExternalLink("instagram_contact"),
      badge: "Community Updates",
    },
  ];

  return (
    <section id="contact" className="py-20 lg:py-24 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Help & Support"
            title="Have Questions? We Are Here to Guide You"
            subtitle="Reach out to our student counselling and admission desk. We help students choose the right course, study plan, and entrance strategy."
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {items.map((item, idx) => (
            <Reveal key={item.key} delay={idx + 1}>
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={item.onClick}
                className="group flex flex-col p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400 truncate mb-4">{item.sub}</p>
                <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-orange-400 group-hover:text-orange-300">
                  <span>Connect</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
// FOOTER (Clean 4-column Enterprise Footer)
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

function Footer() {
  const year = CURRENT_YEAR;

  const socialLinks = [
    { href: buildWhatsAppUrl(), label: "WhatsApp", icon: <WaIcon className="w-4 h-4" /> },
    {
      href: siteConfig.instagramUrl,
      label: "Instagram",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      href: siteConfig.youtubeMainUrl,
      label: "YouTube",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <a href="#home" className="inline-flex items-center gap-3 mb-4 group">
              <img
                src={peptalkLogo}
                alt="Physics Pep Talk"
                className="h-9 w-9 rounded-lg object-cover"
                width="36"
                height="36"
              />
              <span className="text-white font-bold text-base">{siteConfig.brandName}</span>
            </a>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Empowering Karnataka PUC students to achieve top board percentages and premier competitive engineering ranks.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Academic Tracks */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Academic Tracks
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#courses" className="hover:text-white transition-colors">1st &amp; 2nd PUC Boards</a>
              </li>
              <li>
                <a href="#courses" className="hover:text-white transition-colors">KCET PCM Fastrack</a>
              </li>
              <li>
                <a href="#courses" className="hover:text-white transition-colors">Dhrona COMEDK Counselling</a>
              </li>
              <li>
                <a href="/faculties/" className="hover:text-white transition-colors">Expert Faculty Profiles</a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/blogs/" className="hover:text-white transition-colors">Preparation Blogs</a>
              </li>
              <li>
                <a href={siteConfig.youtubeMainUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  YouTube Lectures
                </a>
              </li>
              <li>
                <a href={siteConfig.playStoreUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Android App on Play Store
                </a>
              </li>
              <li>
                <a href={siteConfig.parentWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Physics Pep Talk Main Site
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Support &amp; Legal
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp: +91 {siteConfig.whatsappNumber}
                </a>
              </li>
              {siteConfig.email && (
                <li>
                  <a href={`mailto:${siteConfig.email}`} className="hover:text-white transition-colors truncate block">
                    {siteConfig.email}
                  </a>
                </li>
              )}
              <li>
                <a href={siteConfig.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href={siteConfig.termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {year} {siteConfig.brandName}. All rights reserved.</p>
          <p>Educational resources for PUC &amp; entrance exam students in Karnataka.</p>
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

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Testimonials state
  const [testimonials, setTestimonials] = useState<PucTestimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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

  if (route.page === "blog-listing") {
    trackPageView("/blogs/", "Blog — Physics Pep Talk");
    return <BlogListingPage />;
  }
  if (route.page === "blog-article" && route.slug) {
    trackPageView(`/blogs/${route.slug}/`, `Blog Article — ${route.slug}`);
    return <BlogArticlePage slug={route.slug} />;
  }
  if (route.page === "faculties") {
    trackPageView("/faculties/", "Our Faculties — Physics Pep Talk");
    return <FacultiesPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
      <ScrollProgress />

      {/* Skip to Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-orange-600 text-white rounded-lg font-bold"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="relative z-10">
        {/* Hero Section with Showcase Cards & Trust Stats */}
        <Hero
          courses={courses}
          testimonials={testimonials}
          loadingCourses={loadingCourses}
          loadingTestimonials={loadingTestimonials}
        />

        {/* Full Academic Course Catalog */}
        <FeaturedCoursesSection
          courses={courses}
          loading={loadingCourses}
          error={coursesError}
        />

        {/* Specialized Tracks / Categories */}
        <CategoryBlocksSection />

        {/* Real Student Reviews & Video Testimonials */}
        <StudentFeedbackSection
          items={testimonials}
          loading={loadingTestimonials}
          error={testimonialsError}
        />

        {/* Official YouTube Channels */}
        <YouTubeSection />

        {/* Direct Contact & Counselling Support */}
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
