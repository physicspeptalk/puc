/**
 * App.tsx — Physics Pep Talk PUC Educational Website
 *
 * Layout: scrollable roadmap journey — vertical spine with animated stop nodes,
 * particle field, section-specific graphic accents, glassmorphic panels.
 * All business logic (data fetching, analytics, routing, dark mode) preserved.
 */

import { useState, useEffect, useLayoutEffect, useRef } from "react";
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
// SCROLL PROGRESS BAR
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
      className="scroll-progress"
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
// PARTICLE FIELD (CSS-driven, no canvas)
// ─────────────────────────────────────────────────────────────────────────────

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${3 + (i * 3.5) % 94}%`,
  bottom: `${(i * 7) % 100}%`,
  size: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
  color: i % 4 === 0 ? "#6366f1" : i % 4 === 1 ? "#818cf8" : i % 4 === 2 ? "#14b88a" : "#a5b4fc",
  duration: `${10 + (i * 2.3) % 18}s`,
  delay: `-${(i * 1.7) % 20}s`,
  dx: `${(i % 2 === 0 ? 1 : -1) * (10 + (i * 3) % 30)}px`,
}));

function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationDuration: p.duration,
            animationDelay: p.delay,
            ["--dx" as string]: p.dx,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVEAL ON SCROLL
// ─────────────────────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setVisible(true); }),
      { threshold: 0.07, rootMargin: "0px 0px -6% 0px" }
    );
    const el = ref.current;
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal reveal-delay-${delay} ${visible ? "visible" : ""}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAP STOP WRAPPER
// Each section is wrapped in this to get the spine node + connectors
// ─────────────────────────────────────────────────────────────────────────────

function RoadmapStop({
  number,
  label,
  accent = false,
  id,
  children,
}: {
  number: number;
  label: string;
  accent?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="roadmap-stop pt-24 pb-2 relative">
      {/* Animated node on the spine */}
      <div className={`stop-node ${accent ? "accent" : ""}`} aria-hidden="true">
        {String(number).padStart(2, "0")}
      </div>
      {/* Label badge */}
      <div className="stop-label" aria-hidden="true">{label}</div>
      {/* Horizontal connector lines */}
      <div className="stop-connector left"  aria-hidden="true" />
      <div className="stop-connector right" aria-hidden="true" />
      {/* Content */}
      <div className="container-pad py-12 sm:py-16">
        {children}
      </div>
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
// SECTION HEADING (inside each stop)
// ─────────────────────────────────────────────────────────────────────────────

function StopHeading({
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
    <div className={`mb-10 sm:mb-12 ${center ? "text-center mx-auto max-w-2xl" : ""}`}>
      <span className="inline-flex items-center gap-2 mb-3 text-[11px] font-bold text-primary-400 uppercase tracking-[0.18em]">
        <span className="w-5 h-px bg-primary-500/50" aria-hidden="true" />
        {eyebrow}
        <span className="w-5 h-px bg-primary-500/50" aria-hidden="true" />
      </span>
      <h2 className="mb-4 text-balance">{title}</h2>
      <p className="text-base sm:text-lg text-surface-400 leading-relaxed">{body}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────

function Header({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface-950/90 backdrop-blur-xl border-b border-surface-800/80 shadow-[0_1px_24px_-4px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-[68px]">

        {/* Brand */}
        <a
          href="#home"
          className="flex items-center gap-2.5 group rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
          aria-label={`${siteConfig.brandName} — home`}
        >
          <div className="relative">
            <img
              src={peptalkLogo}
              alt="Physics Pep Talk logo"
              className="h-9 w-9 md:h-10 md:w-10 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
              width="40" height="40"
            />
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-2 ring-primary-400/50 ring-offset-1 ring-offset-surface-950" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-bold text-ink-50 text-[15px] md:text-base leading-none tracking-tight">
              {siteConfig.brandName}
            </p>
            <p className="text-surface-500 text-[11px] font-medium mt-0.5 uppercase tracking-[0.12em]">
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
                className="relative text-sm font-medium text-surface-400 hover:text-ink-50 transition-colors duration-200 flex items-center gap-1.5 group"
              >
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" aria-hidden="true" />
                {link.label}
                {isExternal && <ExternalIcon className="w-3 h-3 opacity-40" />}
              </a>
            );
          })}
          <BlogsDropdownDesktop />
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:text-ink-50 hover:bg-surface-800 transition-all duration-200"
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
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-glow-sm scan-target"
          >
            <WaIcon className="w-4 h-4" />
            <span>{siteConfig.whatsappNumber}</span>
          </a>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg text-surface-400 hover:bg-surface-800 transition-colors duration-200"
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
            className="p-2 rounded-lg text-surface-300 hover:bg-surface-800 transition-colors duration-200"
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
        <div id="mobile-nav" className="md:hidden bg-surface-950/96 backdrop-blur-xl border-b border-surface-800">
          <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isExternal = "external" in link && link.external;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={close}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-300 hover:text-primary-400 hover:bg-surface-800/50 transition-colors duration-150"
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
// 3D LEARNING SCENE  (pure CSS/SVG — no external deps)
// A continuously-animated physics/learning composition:
//   • Atom with 3 orbital rings + electron dots
//   • Floating physics formula cards
//   • Open book with page-turn animation
//   • Orbiting subject bubbles (Physics / Maths / Chemistry)
//   • Glowing energy arcs
// ─────────────────────────────────────────────────────────────────────────────

function LearningScene() {
  return (
    <div className="learning-scene" role="img" aria-label="Animated physics and learning graphic">

      {/* ── Outer glow backdrop ───────────────────────────────────────── */}
      <div className="ls-backdrop" />

      {/* ── Atom nucleus + orbital rings ─────────────────────────────── */}
      <div className="ls-atom">
        {/* Nucleus */}
        <div className="ls-nucleus">
          <div className="ls-nucleus-inner" />
          {/* proton/neutron dots */}
          <div className="ls-nucleon n1" />
          <div className="ls-nucleon n2" />
          <div className="ls-nucleon n3" />
        </div>

        {/* Ring 1 — XY plane */}
        <div className="ls-ring r1">
          <div className="ls-electron e1" />
        </div>
        {/* Ring 2 — tilted 60° */}
        <div className="ls-ring r2">
          <div className="ls-electron e2" />
        </div>
        {/* Ring 3 — tilted 120° */}
        <div className="ls-ring r3">
          <div className="ls-electron e3" />
        </div>
      </div>

      {/* ── Floating formula cards ────────────────────────────────────── */}
      <div className="ls-formula f1">F = ma</div>
      <div className="ls-formula f2">E = mc²</div>
      <div className="ls-formula f3">v = u + at</div>
      <div className="ls-formula f4">∇·E = ρ/ε₀</div>
      <div className="ls-formula f5">λ = h/p</div>

      {/* ── Open book ────────────────────────────────────────────────── */}
      <div className="ls-book">
        <div className="ls-book-spine" />
        <div className="ls-book-page left">
          <div className="ls-page-line" />
          <div className="ls-page-line" />
          <div className="ls-page-line short" />
        </div>
        <div className="ls-book-page right ls-page-turn">
          <div className="ls-page-line" />
          <div className="ls-page-line" />
          <div className="ls-page-line short" />
        </div>
      </div>

      {/* ── Orbiting subject bubbles ──────────────────────────────────── */}
      <div className="ls-orbit-track">
        <div className="ls-bubble b-physics">Physics</div>
        <div className="ls-bubble b-maths">Maths</div>
        <div className="ls-bubble b-chem">Chemistry</div>
      </div>

      {/* ── Energy arc lines ─────────────────────────────────────────── */}
      <svg className="ls-arcs" viewBox="0 0 400 400" fill="none">
        <path className="ls-arc arc1" d="M 40 200 Q 200 40  360 200" />
        <path className="ls-arc arc2" d="M 40 200 Q 200 360 360 200" />
        <path className="ls-arc arc3" d="M 200 40  Q 360 200 200 360" />
      </svg>

      {/* ── Floating dots (mini-particles inside the scene) ──────────── */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="ls-dot"
          style={{
            left:  `${10 + (i * 9) % 80}%`,
            top:   `${5  + (i * 13) % 85}%`,
            width:  `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            animationDelay: `${-(i * 0.7)}s`,
            animationDuration: `${3 + (i * 0.4) % 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STOP 00 — HERO (not a numbered stop, it's the map title card)
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero"
      style={{ paddingTop: "80px" }}
    >
      {/* Orbit rings (graphic accent) */}
      <div className="hero-orbit hero-orbit-1" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-2" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-3" aria-hidden="true" />

      <div className="container-pad relative z-10 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Copy */}
          <div>
            {/* Map title badge */}
            <div className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-md bg-primary-950/60 border border-primary-700/50 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
              </span>
              <span className="text-[11px] font-bold text-primary-300 uppercase tracking-[0.14em]">
                Physics Pep Talk · PUC Board &amp; KCET Prep
              </span>
            </div>

            <h1 className="mb-5 text-balance text-ink-50">
              Your Path to{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                  Academic Excellence
                </span>
                <span
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-500 to-accent-500 rounded-sm"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-surface-400 leading-relaxed mb-8 max-w-lg">
              Explore Physics Pep Talk&apos;s KCET &amp; PUC board exam preparation courses, PCM learning content,
              educational YouTube channels, and counselling guidance for KCET &amp; COMEDK — all in one place.
            </p>

            {/* Scroll hint */}
            <p className="text-xs text-surface-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-6 h-px bg-surface-700" aria-hidden="true" />
              Scroll down to explore the journey
              <span className="w-6 h-px bg-surface-700" aria-hidden="true" />
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <a
                href="#courses"
                onClick={() => trackCTAClick("hero_courses")}
                className="group inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-base px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-glow scan-target"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("hero")}
                className="group inline-flex items-center justify-center gap-2 border border-surface-700 hover:border-primary-600 bg-surface-900/60 backdrop-blur-sm hover:bg-primary-950/40 text-ink-100 font-semibold text-base px-6 py-3 rounded-xl transition-all duration-200"
              >
                <WaIcon className="w-[18px] h-[18px]" />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* 3D Learning Scene */}
          <div className="relative mt-4 lg:mt-0 flex items-center justify-center" aria-hidden="true">
            <LearningScene />
          </div>

        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STOP 01 — FEATURED COURSES
// ─────────────────────────────────────────────────────────────────────────────

function CourseCard({ course }: { course: Course }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <article className="group map-card flex flex-col scan-target">
      <div className="aspect-video bg-surface-800 relative overflow-hidden">
        {course.thumbnailUrl && !imgErr ? (
          <img
            src={course.thumbnailUrl}
            alt={course.description?.slice(0, 80) || "Course thumbnail"}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-surface-950/80 backdrop-blur-sm text-[10px] font-bold text-primary-300 tracking-wider border border-primary-800/40">
          PCM
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5 gap-4">
        <p className="text-sm text-surface-400 leading-relaxed flex-1 line-clamp-3">
          {course.description || "Physics Pep Talk course."}
        </p>
        {course.courseUrl ? (
          <a
            href={course.courseUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick("course_card")}
            className="group/btn inline-flex items-center justify-center gap-2 border border-surface-700 hover:border-primary-500 hover:bg-primary-600 hover:text-white text-surface-200 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 hover:shadow-glow-sm"
          >
            Explore Course
            <ExternalIcon className="w-3 h-3 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </a>
        ) : (
          <span className="inline-flex items-center justify-center bg-surface-800 text-surface-500 text-sm px-4 py-2.5 rounded-lg select-none">
            Link Coming Soon
          </span>
        )}
      </div>
    </article>
  );
}

function CourseSkeleton() {
  return (
    <div className="map-card overflow-hidden animate-pulse">
      <div className="aspect-video bg-surface-800" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 bg-surface-800 rounded w-full" />
        <div className="h-3 bg-surface-800 rounded w-4/5" />
        <div className="h-10 bg-surface-800 rounded-lg mt-1" />
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
    <RoadmapStop number={1} label="Courses" id="courses">
      {/* Atom graphic accent */}
      <div className="atom-graphic" aria-hidden="true">
        <div className="atom-core" />
        <div className="atom-ring" />
        <div className="atom-ring" />
      </div>

      <div className="section-panel p-6 sm:p-8 relative">
        <Reveal delay={1}>
          <StopHeading
            eyebrow="Our Courses"
            title="Featured Courses"
            body="PCM courses aligned to the Karnataka PUC syllabus, plus KCET and COMEDK preparation."
          />
        </Reveal>

        {!loading && error && (
          <p className="text-center text-surface-500 text-sm py-10">Courses temporarily unavailable — check back soon.</p>
        )}

        {(loading || courses.length > 0) && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </RoadmapStop>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STOP 02 — CATEGORY BLOCKS
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

  const nodeColors = [
    "bg-gradient-to-br from-primary-600 to-primary-700 border-primary-500/40",
    "bg-gradient-to-br from-accent-600 to-accent-700 border-accent-500/40",
    "bg-gradient-to-br from-primary-700 to-accent-600 border-primary-400/30",
  ];
  const glowColors = [
    "hover:shadow-[0_0_32px_-6px_rgba(99,102,241,0.5)]",
    "hover:shadow-[0_0_32px_-6px_rgba(20,184,138,0.5)]",
    "hover:shadow-[0_0_32px_-6px_rgba(99,102,241,0.4)]",
  ];

  return (
    <RoadmapStop number={2} label="Categories" accent id="categories">
      {/* Hex graphic */}
      <div className="hex-graphic" aria-hidden="true" />

      <div className="section-panel accent p-6 sm:p-8">
        <Reveal delay={1}>
          <StopHeading
            eyebrow="Explore by Category"
            title="Find the Right Resource"
            body="Board exam prep, competitive entrances, or personalised counselling — choose what fits your goal."
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryBlocks.map((block, idx) => {
            const href = resolveUrl(block);
            return (
              <Reveal key={block.id} delay={idx + 1}>
                <article className={`group map-card flex flex-col p-5 sm:p-6 scan-target relative overflow-hidden ${glowColors[idx]} transition-all duration-300`}>
                  {/* Top color bar */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] ${nodeColors[idx]} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} aria-hidden="true" />

                  {/* Number dot */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold mb-4 ${nodeColors[idx]} border`}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  <span className="text-[11px] font-bold text-surface-500 uppercase tracking-[0.14em] mb-2 block">
                    {block.subtitle}
                  </span>
                  <h3 className="mb-3 text-ink-50">{block.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed flex-1 mb-6">
                    {block.description}
                  </p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCTAClick(`category_${block.id}`)}
                    className="group/btn inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-200 hover:shadow-glow-accent w-fit"
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
    </RoadmapStop>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STOP 03 — STUDENT FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

function FeedbackCard({ t }: { t: PucTestimonial }) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className="group map-card flex flex-col overflow-hidden">
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
            onClick={() => { setPlaying(true); trackVideoPlay(t.caption || t.youtubeUrl); }}
            className="absolute inset-0 w-full h-full group/thumb"
            aria-label={`Play: ${t.caption?.slice(0, 60) || "feedback video"}`}
          >
            <img
              src={t.thumbnailUrl}
              alt={t.caption?.slice(0, 80) || "Student feedback thumbnail"}
              className="w-full h-full object-cover group-hover/thumb:scale-[1.04] transition-transform duration-500 ease-out"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/20 transition-colors duration-200" />
            <span className="absolute inset-0 flex items-center justify-center">
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
        <div className="px-5 py-4 border-t border-surface-800/60">
          <p className="text-sm text-surface-400 leading-relaxed line-clamp-2">{t.caption}</p>
        </div>
      )}
    </article>
  );
}

function FeedbackSkeleton() {
  return (
    <div className="map-card overflow-hidden animate-pulse">
      <div className="aspect-video bg-surface-800" />
      <div className="px-5 py-4"><div className="h-3 bg-surface-800 rounded w-3/4" /></div>
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
    <RoadmapStop number={3} label="Feedback" id="feedback">
      {/* Wave graphic accent */}
      <div className="wave-graphic" aria-hidden="true">
        {[1,2,3,4,5].map((i) => <div key={i} className="wave-bar" />)}
      </div>

      <div className="section-panel p-6 sm:p-8">
        <Reveal delay={1}>
          <StopHeading
            eyebrow="Student Feedback"
            title="What Our Students Say"
            body="Hear from students and parents who have used Physics Pep Talk's courses and guidance."
          />
        </Reveal>

        {!loading && error && items.length === 0 && (
          <p className="text-center text-surface-500 text-sm py-8">Feedback temporarily unavailable.</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </RoadmapStop>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STOP 04 — YOUTUBE
// ─────────────────────────────────────────────────────────────────────────────

function YouTubeSection() {
  return (
    <RoadmapStop number={4} label="YouTube" accent id="youtube">
      {/* YT pulse rings */}
      <div className="yt-graphic" aria-hidden="true">
        <div className="yt-ring" />
        <div className="yt-ring" />
      </div>

      <div className="section-panel accent p-6 sm:p-8">
        <Reveal delay={1}>
          <StopHeading
            eyebrow="YouTube"
            title="Official YouTube Channels"
            body="Subscribe for free Physics lessons, board exam prep, and KCET/COMEDK guidance videos."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
          {youtubeChannels.map((ch, idx) => (
            <Reveal key={ch.id} delay={idx + 1}>
              <article className="group map-card flex flex-col p-5 sm:p-6 scan-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base text-ink-50 leading-tight">{ch.name}</h3>
                    <p className="text-surface-500 text-xs mt-0.5 font-mono">@{ch.handle}</p>
                  </div>
                </div>

                <p className="text-sm text-surface-400 leading-relaxed flex-1 mb-5">{ch.description}</p>

                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackExternalLink(`youtube_${ch.id}`)}
                  className="group/btn inline-flex items-center gap-2 border border-surface-700 hover:border-primary-500 hover:bg-primary-950/40 hover:text-primary-300 text-surface-300 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 w-fit"
                >
                  Visit Channel
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </RoadmapStop>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STOP 05 — CONTACT
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
      hoverBorder: "hover:border-green-500/60",
      hoverGlow:   "hover:shadow-[0_0_20px_-4px_rgba(34,197,94,0.4)]",
    },
    ...(siteConfig.phoneNumber ? [{
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
      hoverBorder: "hover:border-primary-500/60",
      hoverGlow:   "hover:shadow-glow-sm",
    }] : []),
    ...(siteConfig.email ? [{
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
      hoverBorder: "hover:border-primary-500/60",
      hoverGlow:   "hover:shadow-glow-sm",
    }] : []),
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
      hoverBorder: "hover:border-pink-500/60",
      hoverGlow:   "hover:shadow-[0_0_20px_-4px_rgba(236,72,153,0.4)]",
    },
  ];

  return (
    <RoadmapStop number={5} label="Contact" id="contact">
      {/* Signal dots */}
      <div className="signal-graphic" aria-hidden="true">
        {[1,2,3].map((i) => <div key={i} className="signal-dot" />)}
      </div>

      <div className="section-panel p-6 sm:p-8">
        <Reveal delay={1}>
          <StopHeading
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
                className={`group flex items-center gap-3 map-card p-4 transition-all duration-200 hover:-translate-y-1 ${item.hoverBorder} ${item.hoverGlow}`}
              >
                <span className="w-10 h-10 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center flex-shrink-0 text-surface-400 transition-all duration-200 group-hover:bg-primary-600 group-hover:border-primary-500 group-hover:text-white group-hover:shadow-glow-sm">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-50 text-sm">{item.title}</p>
                  <p className="text-surface-500 text-xs truncate mt-0.5">{item.sub}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-surface-600 flex-shrink-0 transition-all duration-200 group-hover:text-primary-400 group-hover:translate-x-0.5" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </RoadmapStop>
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
      href: siteConfig.instagramUrl, label: "Instagram",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
    },
    {
      href: siteConfig.youtubeMainUrl, label: "YouTube",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
    },
    {
      href: siteConfig.youtubeKcetUrl, label: "YouTube KCET",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
    },
  ];

  return (
    <footer className="relative z-10 border-t border-surface-800/60 bg-surface-950/80 backdrop-blur-xl" role="contentinfo">
      {/* Gradient top edge */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" aria-hidden="true" />

      <div className="container-pad py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">

          {/* Brand */}
          <div className="max-w-xs">
            <a href="#home" className="inline-flex items-center gap-2.5 mb-5 group rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950">
              <img src={peptalkLogo} alt="Physics Pep Talk" className="h-10 w-10 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105" width="40" height="40" />
              <div>
                <p className="text-ink-50 font-display font-bold text-base leading-tight">{siteConfig.brandName}</p>
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

          {/* Navigation */}
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
                      className="group text-sm text-surface-500 hover:text-ink-50 transition-colors duration-150 inline-flex items-center gap-1.5"
                    >
                      <span className="w-0 group-hover:w-2.5 h-px bg-primary-500 transition-all duration-200" aria-hidden="true" />
                      {link.label}
                      {isExt && <ExternalIcon className="w-3 h-3 opacity-40" />}
                    </a>
                  </li>
                );
              })}
              {siteConfig.blogUrl && (
                <li>
                  <a href={siteConfig.blogUrl} target="_blank" rel="noopener noreferrer"
                    className="group text-sm text-surface-500 hover:text-ink-50 transition-colors duration-150 inline-flex items-center gap-1.5">
                    <span className="w-0 group-hover:w-2.5 h-px bg-primary-500 transition-all duration-200" aria-hidden="true" />
                    Blogs <ExternalIcon className="w-3 h-3 opacity-40" />
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-bold text-surface-500 uppercase tracking-[0.16em] mb-5">Legal &amp; Links</h3>
            <ul className="flex flex-col gap-2.5 list-none space-y-0">
              {[
                { href: siteConfig.privacyPolicyUrl, label: "Privacy Policy" },
                { href: siteConfig.termsUrl,         label: "Terms & Disclaimer" },
                { href: siteConfig.parentWebsite,    label: "Physics Pep Talk (Main Site)" },
                ...(siteConfig.email ? [{ href: `mailto:${siteConfig.email}`, label: siteConfig.email }] : []),
              ].map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    className="group text-sm text-surface-500 hover:text-ink-50 transition-colors duration-150 inline-flex items-center gap-1.5"
                  >
                    <span className="w-0 group-hover:w-2.5 h-px bg-accent-500 transition-all duration-200" aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

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
    return true; // default dark — roadmap theme is dark-first
  });

  useEffect(() => {
    // roadmap is always dark — keep html class in sync for components that check it
    document.documentElement.classList.add("dark");
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
    <div className="min-h-screen bg-surface-950 relative overflow-x-hidden">
      {/* ── Fixed ambient layers ─────────────────────────────────── */}
      <div className="map-bg" aria-hidden="true" />
      <ParticleField />
      <ScrollProgress />

      {/* Skip link */}
      <a
        href="#main-content"
        className="absolute -top-12 left-4 z-[9999] bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold text-sm focus:top-4 transition-all duration-200"
      >
        Skip to main content
      </a>

      <Header dark={dark} onToggleDark={toggleDark} />

      <main id="main-content" className="relative z-10">
        {/* Hero is full-screen, outside the roadmap spine */}
        <Hero />

        {/* ── ROADMAP ─────────────────────────────────────────────── */}
        <div className="roadmap relative">
          {/* Continuous spine line */}
          <div className="roadmap-spine" aria-hidden="true" />

          <FeaturedCourses />
          <CategoryBlocks />
          <StudentFeedback />
          <YouTubeSection />
          <Contact />
        </div>
      </main>

      <Footer />
    </div>
  );
}
