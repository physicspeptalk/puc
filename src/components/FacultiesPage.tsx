/**
 * FacultiesPage.tsx
 *
 * Renders the /faculties/ page.
 * Includes: 3D loading screen, animated hero banner, faculty grid.
 * Matches the dark futuristic design system (indigo/teal palette, grid bg, particles).
 */

import { useState, useEffect } from "react";
import { fetchFaculties, type Faculty } from "../services/facultyService";
import { PageLoader } from "./PageLoader";

// ─── Particle helpers ──────────────────────────────────────────────────────────

function HeroParticles() {
  return (
    <div className="page-hero-particles" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="page-hero-particle"
          style={{
            "--hp-x":    `${(i * 43 + 7) % 100}%`,
            "--hp-delay":`${(i * 0.27) % 2.5}s`,
            "--hp-dur":  `${2.2 + (i % 4) * 0.5}s`,
            "--hp-size": `${2 + (i % 3)}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── 3-D orbital accent SVG (decorative, right side of hero) ──────────────────

function HeroOrbitalAccent() {
  return (
    <div className="page-hero-3d" aria-hidden="true">
      <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
        {/* Outer ring */}
        <ellipse cx="140" cy="140" rx="130" ry="50"
          stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"
          strokeDasharray="8 5"/>
        {/* Middle ring */}
        <ellipse cx="140" cy="140" rx="100" ry="100"
          stroke="rgba(99,102,241,0.2)" strokeWidth="1"
          strokeDasharray="4 8"/>
        {/* Inner ring */}
        <ellipse cx="140" cy="140" rx="70" ry="28"
          stroke="rgba(20,184,138,0.35)" strokeWidth="1.5"
          strokeDasharray="6 4"/>
        {/* Nucleus glow */}
        <circle cx="140" cy="140" r="18" fill="url(#fac-grad)" opacity="0.9"/>
        <circle cx="140" cy="140" r="28" fill="rgba(99,102,241,0.08)"/>
        {/* Electron dots */}
        <circle cx="270" cy="140" r="5" fill="rgba(99,102,241,0.9)" filter="url(#fac-glow)"/>
        <circle cx="140" cy="10"  r="5" fill="rgba(20,184,138,0.9)"  filter="url(#fac-glow2)"/>
        <circle cx="80"  cy="190" r="4" fill="rgba(165,180,252,0.8)" filter="url(#fac-glow)"/>
        <defs>
          <radialGradient id="fac-grad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#a5b4fc"/>
            <stop offset="100%" stopColor="#4f46e5"/>
          </radialGradient>
          <filter id="fac-glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="fac-glow2">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// ─── Dark mode toggle ──────────────────────────────────────────────────────────
// (removed — site is dark-only)

// ─── Avatar helpers ────────────────────────────────────────────────────────────

const AVATAR_COLOURS = [
  "bg-primary-600",
  "bg-accent-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-500",
  "bg-cyan-600",
  "bg-amber-500",
  "bg-indigo-600",
];

function getAvatarColour(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLOURS[Math.abs(hash) % AVATAR_COLOURS.length];
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// ─── Faculty card ──────────────────────────────────────────────────────────────

function FacultyCard({ faculty }: { faculty: Faculty }) {
  const [imgErr, setImgErr] = useState(false);
  const showAvatar = !faculty.pictureUrl || imgErr;
  const colour = getAvatarColour(faculty.name);

  return (
    <article className="map-card scan-target flex flex-col overflow-hidden group hover:border-primary-500/40 transition-all duration-300">
      {/* Photo / Avatar */}
      <div className="relative w-full aspect-[3/4] bg-surface-900 overflow-hidden flex-shrink-0">
        {showAvatar ? (
          <div className={`w-full h-full flex items-center justify-center ${colour}`}>
            <span className="text-white font-display font-bold text-5xl select-none">
              {getInitials(faculty.name)}
            </span>
          </div>
        ) : (
          <img
            src={faculty.pictureUrl}
            alt={`Photo of ${faculty.name}`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgErr(true)}
          />
        )}
        {/* Top gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-950/80 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-display font-bold text-ink-50 leading-tight">
            {faculty.name}
          </h2>
          {faculty.subject && (
            <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md bg-primary-950/40 border border-primary-800 text-primary-400 uppercase tracking-widest">
              {faculty.subject}
            </span>
          )}
        </div>

        {faculty.experience && (
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <svg className="w-4 h-4 flex-shrink-0 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <span className="font-semibold text-surface-300">{faculty.experience}</span>
              {/^\d/.test(faculty.experience) ? " years of experience" : ""}
            </span>
          </div>
        )}

        {faculty.description && (
          <p className="text-sm text-surface-400 leading-relaxed">{faculty.description}</p>
        )}
      </div>
    </article>
  );
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="map-card overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-surface-800" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-surface-800 rounded w-2/3" />
        <div className="h-3 bg-surface-800 rounded w-1/3" />
        <div className="h-3 bg-surface-800 rounded w-full" />
        <div className="h-3 bg-surface-800 rounded w-5/6" />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface FacultiesPageProps {
  // dark-only — no theme props needed
}

export default function FacultiesPage(_props: FacultiesPageProps = {}) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    fetchFaculties()
      .then(({ faculties: f, error: e }) => { setFaculties(f); setError(e); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLoader label="Our Faculties" icon="atom">
      <div className="min-h-screen bg-surface-950 relative overflow-x-hidden">

        {/* Ambient grid background */}
        <div className="map-bg" aria-hidden="true" />

        {/* ── Sticky nav bar ────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-surface-950/90 backdrop-blur-xl border-b border-surface-800/80">
          <div className="container-pad py-3 flex items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-400 hover:text-primary-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Physics Pep Talk
            </a>
            <span className="text-surface-700" aria-hidden="true">/</span>
            <span className="text-sm text-surface-500">Faculties</span>
            <div className="ml-auto" />

          </div>
        </header>

        {/* ── Hero banner ───────────────────────────────────────── */}
        <section className="page-hero" aria-label="Faculties hero">
          <div className="page-hero-glow" aria-hidden="true" />
          <HeroParticles />
          <HeroOrbitalAccent />

          <div className="page-hero-content">
            <div className="page-hero-eyebrow">
              <span className="page-hero-eyebrow-dot" aria-hidden="true" />
              Meet the Team
            </div>

            <h1 className="page-hero-title">
              Our{" "}
              <span className="page-hero-title-gradient">Faculties</span>
            </h1>

            <p className="page-hero-desc">
              Experienced educators dedicated to helping PUC students excel in board exams, KCET, and COMEDK.
            </p>

            <div className="page-hero-stats">
              <div className="page-hero-stat">
                <span className="page-hero-stat-icon">🎓</span>
                <div>
                  <div className="page-hero-stat-label">Specialisation</div>
                  <div className="page-hero-stat-value">PUC Physics</div>
                </div>
              </div>
              <div className="page-hero-stat">
                <span className="page-hero-stat-icon">📍</span>
                <div>
                  <div className="page-hero-stat-label">Board</div>
                  <div className="page-hero-stat-value">Karnataka PUC</div>
                </div>
              </div>
              <div className="page-hero-stat">
                <span className="page-hero-stat-icon">🏆</span>
                <div>
                  <div className="page-hero-stat-label">Exams Covered</div>
                  <div className="page-hero-stat-value">KCET · COMEDK</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Faculty grid ──────────────────────────────────────── */}
        <main id="main-content" className="container-pad py-14 relative z-10">

          {error && !loading && (
            <div role="alert" className="mb-8 p-5 rounded-lg border border-surface-800 bg-surface-900/50 text-surface-400 text-sm">
              Could not load faculty profiles. Please check your connection and try again.
            </div>
          )}

          {loading && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && !error && faculties.length === 0 && (
            <div className="text-center py-24 text-surface-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="font-medium text-surface-400">No faculty profiles yet.</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          )}

          {!loading && faculties.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {faculties.map((f) => <FacultyCard key={f.name} faculty={f} />)}
            </div>
          )}
        </main>

        {/* ── Footer strip ──────────────────────────────────────── */}
        <footer className="border-t border-surface-800 mt-8">
          <div className="container-pad py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a href="/" className="text-sm text-surface-500 hover:text-primary-400 transition-colors duration-200">
              ← Back to home
            </a>
            <span className="text-sm text-surface-600">physicspeptalk.com</span>
          </div>
        </footer>
      </div>
    </PageLoader>
  );
}
