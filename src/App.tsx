/**
 * App.tsx — Physics Pep Talk PUC Educational Website
 *
 * Complete single-page site. Design language:
 *   - Clean white base with light slate sections
 *   - Deep indigo (primary-*) for headings and accents
 *   - Warm orange (accent-*) for CTAs and highlights
 *   - Generous whitespace, card-based layout
 *   - No dark mode toggle — light-only, clean and readable
 */

import { useState, useEffect, useRef, useCallback } from "react";
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
} from "./utils/analytics";
import { fetchCourses, type Course } from "./services/courseService";
import { fetchPucTestimonials, type PucTestimonial } from "./services/testimonialService";

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-accent-600 font-semibold text-xs uppercase tracking-[0.15em] mb-3">
      <span className="w-5 h-px bg-accent-500 inline-block" aria-hidden="true" />
      {children}
      <span className="w-5 h-px bg-accent-500 inline-block" aria-hidden="true" />
    </span>
  );
}

// WhatsApp SVG icon
function WaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-[68px]">
        {/* Brand */}
        <a
          href="#home"
          className="flex items-center gap-2.5 group rounded focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label={`${siteConfig.brandName} — home`}
        >
          <img
            src={peptalkLogo}
            alt="Physics Pep Talk logo"
            className="h-9 w-9 md:h-10 md:w-10 rounded-lg"
            width="40" height="40"
          />
          <div className="leading-tight">
            <p className="font-bold text-surface-900 text-[15px] md:text-base leading-none">
              {siteConfig.brandName}
            </p>
            <p className="text-surface-400 text-[11px] font-medium mt-0.5">{siteConfig.tagline}</p>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const isExternal = "external" in link && link.external;
            return (
              <a
                key={link.href}
                href={link.href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-600 hover:text-primary-700 hover:bg-primary-50 transition-colors flex items-center gap-1"
              >
                {link.label}
                {isExternal && <ExternalIcon className="w-3 h-3 opacity-50" />}
              </a>
            );
          })}
          {siteConfig.blogUrl && (
            <a
              href={siteConfig.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-600 hover:text-primary-700 hover:bg-primary-50 transition-colors flex items-center gap-1"
            >
              Blogs <ExternalIcon className="w-3 h-3 opacity-50" />
            </a>
          )}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("header")}
            className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <WaIcon className="w-4 h-4" />
            Enquire
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="md:hidden p-2 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden bg-white border-t border-surface-100 shadow-lg"
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
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  {link.label}
                  {isExternal && <ExternalIcon className="w-3 h-3 opacity-40" />}
                </a>
              );
            })}
            {siteConfig.blogUrl && (
              <a
                href={siteConfig.blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              >
                Blogs <ExternalIcon className="w-3 h-3 opacity-40" />
              </a>
            )}
            <div className="pt-3 pb-1">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { trackWhatsAppClick("header_mobile"); close(); }}
                className="flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm px-4 py-3 rounded-xl w-full transition-colors"
              >
                <WaIcon className="w-4 h-4" />
                Enquire on WhatsApp
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
      className="relative overflow-hidden bg-surface-50 pt-24 md:pt-32 pb-20 md:pb-28"
      aria-label="Hero"
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-24 w-[400px] h-[400px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(circle, #f97316 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-500" aria-hidden="true" />
            <span className="text-primary-700 text-sm font-semibold">
              Physics Pep Talk · PUC &amp; Board Preparation
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-surface-900 leading-[1.1] tracking-tight mb-6 text-balance">
            Your Path to{" "}
            <span className="relative">
              <span className="relative z-10 text-primary-600">Academic</span>
              <span
                className="absolute -bottom-1 left-0 right-0 h-3 bg-accent-300/40 -z-0 rounded"
                aria-hidden="true"
              />
            </span>{" "}
            Excellence
          </h1>

          <p className="text-lg md:text-xl text-surface-600 leading-relaxed mb-10 max-w-2xl">
            Explore Physics Pep Talk's PUC board exam preparation courses, Physics learning content,
            educational YouTube channels, and student guidance — all in one place.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap gap-3">
            <a
              href="#courses"
              onClick={() => trackCTAClick("hero_courses")}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-md shadow-primary-200"
            >
              Explore Courses
              <ArrowRight />
            </a>
            <a
              href="#youtube"
              onClick={() => trackCTAClick("hero_youtube")}
              className="inline-flex items-center gap-2 bg-white hover:bg-surface-50 border border-surface-200 text-surface-800 font-semibold px-6 py-3.5 rounded-xl text-base transition-colors shadow-card"
            >
              <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch on YouTube
            </a>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("hero")}
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3.5 rounded-xl text-base transition-colors shadow-md shadow-accent-200"
            >
              <WaIcon />
              WhatsApp Us
            </a>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap gap-6 mt-12 pt-10 border-t border-surface-200">
            {[
              { label: "PUC & CET", sub: "Board & Entrance Prep" },
              { label: "2 Channels", sub: "Free YouTube Content" },
              { label: "Physics Focus", sub: "Expert Subject Content" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className="text-xl font-bold text-primary-700">{item.label}</span>
                <span className="text-sm text-surface-500">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED COURSES CAROUSEL
// ─────────────────────────────────────────────────────────────────────────────

function CourseCard({ course }: { course: Course }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <article className="flex flex-col bg-white rounded-2xl border border-surface-100 shadow-card hover:shadow-card-lg transition-shadow h-full">
      {/* Thumbnail */}
      <div className="aspect-video rounded-t-2xl overflow-hidden bg-primary-50 flex-shrink-0">
        {course.thumbnailUrl && !imgErr ? (
          <img
            src={course.thumbnailUrl}
            alt={course.description?.slice(0, 80) || "Course thumbnail"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <p className="text-sm text-surface-600 leading-relaxed flex-1 line-clamp-3">
          {course.description || "Physics Pep Talk course."}
        </p>
        {course.courseUrl ? (
          <a
            href={course.courseUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick("course_card")}
            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            Explore Course
            <ExternalIcon />
          </a>
        ) : (
          <span className="inline-flex items-center justify-center bg-surface-100 text-surface-400 text-sm px-4 py-2.5 rounded-xl select-none">
            Link Coming Soon
          </span>
        )}
      </div>
    </article>
  );
}

function CourseSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-surface-100 bg-white animate-pulse">
      <div className="aspect-video rounded-t-2xl bg-surface-100" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 bg-surface-100 rounded w-full" />
        <div className="h-3 bg-surface-100 rounded w-4/5" />
        <div className="h-10 bg-surface-100 rounded-xl mt-2" />
      </div>
    </div>
  );
}

function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const getPerPage = useCallback(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }, []);

  const [perPage, setPerPage] = useState(3);

  useEffect(() => {
    const upd = () => setPerPage(getPerPage());
    upd();
    window.addEventListener("resize", upd, { passive: true });
    return () => window.removeEventListener("resize", upd);
  }, [getPerPage]);

  useEffect(() => {
    let cancelled = false;
    fetchCourses().then(({ courses: c, error: e }) => {
      if (!cancelled) { setCourses(c); setError(e); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const maxIdx = Math.max(0, courses.length - perPage);
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(maxIdx, i + 1));

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) next(); else prev(); }
    touchStartX.current = null;
  };

  return (
    <section id="courses" className="section-pad bg-surface-50" aria-label="Featured courses">
      <div className="container-pad">
        <div className="text-center mb-12">
          <SectionLabel>Our Courses</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
            Featured Courses
          </h2>
          <p className="text-surface-500 text-lg max-w-xl mx-auto">
            Courses updated directly from our catalogue. New content added without any redeployment.
          </p>
        </div>

        {!loading && error && courses.length === 0 && (
          <div className="text-center py-14">
            <p className="text-surface-400 text-sm font-medium">Courses temporarily unavailable — check back soon.</p>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-14">
            <p className="text-surface-400 text-sm font-medium">Courses coming soon — we're adding new content.</p>
          </div>
        )}

        {(loading || courses.length > 0) && (
          <>
            <div
              className="overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="grid gap-5"
                style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}
              >
                {loading
                  ? Array.from({ length: perPage }).map((_, i) => <CourseSkeleton key={i} />)
                  : courses.slice(index, index + perPage).map((c, i) => (
                      <CourseCard key={c.courseUrl || i} course={c} />
                    ))}
              </div>
            </div>

            {!loading && courses.length > perPage && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={prev}
                  disabled={index === 0}
                  aria-label="Previous"
                  className="w-9 h-9 rounded-full border border-surface-200 bg-white flex items-center justify-center text-surface-500 hover:border-primary-300 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-card"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-1.5">
                  {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Page ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        i === index ? "bg-primary-600 w-6" : "bg-surface-300 hover:bg-surface-400 w-2"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={next}
                  disabled={index >= maxIdx}
                  aria-label="Next"
                  className="w-9 h-9 rounded-full border border-surface-200 bg-white flex items-center justify-center text-surface-500 hover:border-primary-300 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-card"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

function CategoryBlocks() {
  const colors = [
    { bg: "bg-primary-50", border: "border-primary-100", btn: "bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-100" },
    { bg: "bg-accent-50", border: "border-accent-100", btn: "bg-accent-500 hover:bg-accent-600 text-white shadow-md shadow-accent-100" },
    { bg: "bg-emerald-50", border: "border-emerald-100", btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100" },
  ];

  return (
    <section className="section-pad bg-white" aria-label="Course categories">
      <div className="container-pad">
        <div className="text-center mb-12">
          <SectionLabel>Explore by Category</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
            Find the Right Resource
          </h2>
          <p className="text-surface-500 text-lg max-w-xl mx-auto">
            Board exam prep, competitive entrances, or personalised counselling — choose what fits your goal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryBlocks.map((block, idx) => {
            const c = colors[idx % colors.length];
            return (
              <div
                key={block.id}
                className={`flex flex-col ${c.bg} border ${c.border} rounded-2xl p-7 gap-5`}
              >
                <span className="text-4xl" role="img" aria-label={block.title}>{block.emoji}</span>
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-surface-400">{block.subtitle}</p>
                  <h3 className="text-xl font-bold text-surface-900">{block.title}</h3>
                  <p className="text-surface-600 text-sm leading-relaxed mt-1">{block.description}</p>
                </div>
                <a
                  href={block.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCTAClick(`category_${block.id}`)}
                  className={`inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-colors ${c.btn}`}
                >
                  {block.ctaLabel}
                  <ExternalIcon />
                </a>
              </div>
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
    <article className="flex flex-col rounded-2xl overflow-hidden border border-surface-100 shadow-card hover:shadow-card-md transition-shadow bg-white">
      <div className="relative aspect-video bg-surface-900">
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
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full group"
            aria-label={`Play: ${t.caption?.slice(0, 60) || "feedback video"}`}
          >
            <img
              src={t.thumbnailUrl}
              alt={t.caption?.slice(0, 80) || "Student feedback thumbnail"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-700 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      {t.caption && (
        <div className="px-4 py-3.5 border-t border-surface-50">
          <p className="text-sm text-surface-700 leading-snug line-clamp-2">{t.caption}</p>
        </div>
      )}
    </article>
  );
}

function FeedbackSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-surface-100 bg-white animate-pulse">
      <div className="aspect-video bg-surface-100" />
      <div className="px-4 py-3.5"><div className="h-3 bg-surface-100 rounded w-3/4" /></div>
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
    <section id="feedback" className="section-pad bg-surface-50" aria-label="Student feedback">
      <div className="container-pad">
        <div className="text-center mb-12">
          <SectionLabel>Student Feedback</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
            What Our Students Say
          </h2>
          <p className="text-surface-500 text-lg max-w-xl mx-auto">
            Hear from students and parents who have used Physics Pep Talk's courses and guidance.
          </p>
        </div>

        {!loading && error && items.length === 0 && (
          <p className="text-center text-surface-400 text-sm py-8">Feedback temporarily unavailable.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <FeedbackSkeleton key={i} />)
            : items.map((t) => <FeedbackCard key={t.youtubeUrl} t={t} />)}
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
    <section id="youtube" className="section-pad bg-white" aria-label="YouTube channels">
      <div className="container-pad">
        <div className="text-center mb-12">
          <SectionLabel>YouTube</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
            Official YouTube Channels
          </h2>
          <p className="text-surface-500 text-lg max-w-xl mx-auto">
            Subscribe for free Physics lessons, board exam prep, and KCET/CET guidance videos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {youtubeChannels.map((ch) => (
            <div
              key={ch.id}
              className="flex flex-col rounded-2xl bg-white border border-surface-100 shadow-card overflow-hidden"
            >
              {/* Red accent stripe */}
              <div className="h-1.5 bg-red-500" aria-hidden="true" />

              <div className="p-7 flex flex-col gap-5">
                {/* Channel identity */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-md flex-shrink-0">
                    <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 text-base leading-tight">{ch.name}</h3>
                    <p className="text-surface-400 text-sm mt-0.5">@{ch.handle}</p>
                  </div>
                </div>

                <p className="text-surface-600 text-sm leading-relaxed flex-1">{ch.description}</p>

                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackExternalLink(`youtube_${ch.id}`)}
                  className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Visit YouTube Channel
                </a>
              </div>
            </div>
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
      color: "bg-green-50 text-green-600 group-hover:bg-green-100",
      border: "hover:border-green-200",
      title: "WhatsApp",
      sub: siteConfig.whatsappNumber ? `+${siteConfig.whatsappNumber}` : "Message us",
      href: buildWhatsAppUrl(),
      external: true,
      onClick: () => trackWhatsAppClick("contact"),
    },
    ...(siteConfig.phoneNumber
      ? [{
          key: "phone",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          ),
          color: "bg-primary-50 text-primary-600 group-hover:bg-primary-100",
          border: "hover:border-primary-200",
          title: "Call Us",
          sub: siteConfig.phoneNumber,
          href: buildPhoneUrl(),
          external: false,
          onClick: () => trackCallClick("contact"),
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
          color: "bg-primary-50 text-primary-600 group-hover:bg-primary-100",
          border: "hover:border-primary-200",
          title: "Email",
          sub: siteConfig.email,
          href: `mailto:${siteConfig.email}`,
          external: false,
          onClick: () => {},
        }]
      : []),
    {
      key: "instagram",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      color: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
      border: "hover:border-pink-200",
      title: "Instagram",
      sub: "@physics_pep_talk",
      href: siteConfig.instagramUrl,
      external: true,
      onClick: () => trackExternalLink("instagram_contact"),
    },
  ];

  return (
    <section id="contact" className="section-pad bg-white" aria-label="Contact">
      <div className="container-pad">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel>Contact</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
              Have Questions?
            </h2>
            <p className="text-surface-500 text-lg">
              Reach out about our courses, resources, or to get personalised guidance. We're happy to help.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <a
                key={item.key}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={item.onClick}
                className={`group flex items-center gap-4 bg-white rounded-2xl border border-surface-100 p-5 shadow-card ${item.border} hover:shadow-card-md transition-all`}
              >
                <span className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${item.color}`}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900 text-sm">{item.title}</p>
                  <p className="text-surface-500 text-sm truncate">{item.sub}</p>
                </div>
                <svg className="w-4 h-4 text-surface-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
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

  return (
    <footer className="bg-surface-900 text-surface-400" role="contentinfo">
      <div className="container-pad py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <a href="#home" className="inline-flex items-center gap-3 mb-5 rounded">
              <img src={peptalkLogo} alt="Physics Pep Talk" className="h-10 w-10 rounded-lg" width="40" height="40" />
              <div>
                <p className="text-white font-bold text-base leading-tight">{siteConfig.brandName}</p>
                <p className="text-surface-500 text-xs mt-0.5">{siteConfig.tagline}</p>
              </div>
            </a>
            <p className="text-sm text-surface-500 leading-relaxed mb-5 max-w-xs">
              Educational resources for PUC students in Karnataka — board prep, Physics, CET guidance, and counselling.
            </p>
            {/* Social icons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { href: buildWhatsAppUrl(), label: "WhatsApp", hover: "hover:bg-green-600", icon: <WaIcon className="w-4 h-4" /> },
                {
                  href: siteConfig.instagramUrl, label: "Instagram", hover: "hover:bg-pink-600",
                  icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
                },
                {
                  href: siteConfig.youtubeMainUrl, label: "YouTube — Physics Pep Talk", hover: "hover:bg-red-600",
                  icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
                },
                {
                  href: siteConfig.youtubeKcetUrl, label: "YouTube — Pep Talk Info KCET", hover: "hover:bg-red-600",
                  icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
                },
              ].map(({ href, label, hover, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 rounded-lg bg-surface-800 ${hover} flex items-center justify-center text-surface-400 hover:text-white transition-colors`}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Navigate</h3>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isExt = "external" in link && link.external;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      {...(isExt ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-sm text-surface-500 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      {isExt && <ExternalIcon className="w-3 h-3 opacity-40" />}
                    </a>
                  </li>
                );
              })}
              {siteConfig.blogUrl && (
                <li>
                  <a href={siteConfig.blogUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-surface-500 hover:text-white transition-colors inline-flex items-center gap-1">
                    Blogs <ExternalIcon className="w-3 h-3 opacity-40" />
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Legal & contact */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Legal &amp; Links</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <a href={siteConfig.privacyPolicyUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-surface-500 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href={siteConfig.termsUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-surface-500 hover:text-white transition-colors">
                  Terms &amp; Disclaimer
                </a>
              </li>
              <li>
                <a href={siteConfig.parentWebsite} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-surface-500 hover:text-white transition-colors inline-flex items-center gap-1">
                  Physics Pep Talk (Main Site) <ExternalIcon className="w-3 h-3 opacity-40" />
                </a>
              </li>
              {siteConfig.email && (
                <li>
                  <a href={`mailto:${siteConfig.email}`}
                    className="text-sm text-surface-500 hover:text-white transition-colors">
                    {siteConfig.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-surface-600">© {year} {siteConfig.brandName}. All rights reserved.</p>
          <p className="text-xs text-surface-700">Educational resources for PUC students in Karnataka.</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main-content"
        className="absolute -top-10 left-4 z-[9999] bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold text-sm focus:top-4 transition-all duration-150"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content">
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
