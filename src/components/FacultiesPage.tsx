/**
 * FacultiesPage.tsx
 *
 * Renders the /faculties/ page listing all faculty members.
 * Directory layout: clean, scannable grid of profiles.
 * Data is fetched from the PUC Google Spreadsheet (GID 645621874).
 *
 * Columns: Name | Experience | Subject | Description | Picture
 * Matches the futuristic graphic-intensive design system.
 */

import { useState, useEffect } from "react";
import { fetchFaculties, type Faculty } from "../services/facultyService";

// ─── Dark mode toggle ──────────────────────────────────────────────────────

function DarkToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-10 h-10 rounded-lg flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200"
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
  );
}

// ─── Avatar placeholder ────────────────────────────────────────────────────

/** Deterministic colour from name — same name always gets same colour */
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
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Faculty card ──────────────────────────────────────────────────────────

function FacultyCard({ faculty }: { faculty: Faculty }) {
  const [imgErr, setImgErr] = useState(false);
  const showAvatar = !faculty.pictureUrl || imgErr;
  const initials = getInitials(faculty.name);
  const colour = getAvatarColour(faculty.name);

  return (
    <article className="flex flex-col bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 ease-out overflow-hidden group">
      {/* Photo / Avatar */}
      <div className="relative w-full aspect-[3/4] bg-surface-50 dark:bg-surface-800 overflow-hidden flex-shrink-0">
        {showAvatar ? (
          <div className={`w-full h-full flex items-center justify-center ${colour}`}>
            <span className="text-white font-display font-bold text-5xl select-none">{initials}</span>
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
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-display font-bold text-ink-900 dark:text-ink-50 leading-tight">
            {faculty.name}
          </h2>
          {faculty.subject && (
            <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-400 uppercase tracking-widest">
              {faculty.subject}
            </span>
          )}
        </div>

        {/* Experience */}
        {faculty.experience && (
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            <svg className="w-4 h-4 flex-shrink-0 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <span className="font-semibold text-surface-700 dark:text-surface-300">{faculty.experience}</span>
              {" "}
              {/^\d/.test(faculty.experience) ? "years of experience" : ""}
            </span>
          </div>
        )}

        {/* Description */}
        {faculty.description && (
          <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
            {faculty.description}
          </p>
        )}
      </div>
    </article>
  );
}

// ─── Skeleton card ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 animate-pulse">
      <div className="aspect-[3/4] bg-surface-100 dark:bg-surface-800" />
      <div className="p-6 space-y-2">
        <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded w-2/3" />
        <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-1/3 mb-2" />
        <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-full" />
        <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-5/6 mt-2" />
        <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-4/6" />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

interface FacultiesPageProps {
  dark: boolean;
  onToggleDark: () => void;
}

export default function FacultiesPage({ dark, onToggleDark }: FacultiesPageProps) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFaculties()
      .then(({ faculties: f, error: e }) => {
        setFaculties(f);
        setError(e);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 relative z-0">

      {/* Top bar */}
      <div className="bg-white dark:bg-surface-950 border-b border-surface-200 dark:border-surface-800">
        <div className="container-pad py-10 md:py-14">
          <div className="flex items-center justify-between mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              aria-label="Back to home"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </a>
            <DarkToggle dark={dark} onToggle={onToggleDark} />
          </div>

          {/* Heading */}
          <span className="inline-block mb-2 text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Meet the team
          </span>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-ink-900 dark:text-ink-50 leading-[1.05] tracking-tight mb-3">
            Our Faculties
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-400 readable">
            Experienced educators dedicated to helping PUC students excel in board exams, KCET, and COMEDK.
          </p>
        </div>
      </div>

      {/* Content */}
      <main id="main-content" className="container-pad py-12 md:py-16">

        {/* Error */}
        {error && !loading && (
          <div
            role="alert"
            className="mb-8 p-5 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 text-surface-600 dark:text-surface-300 text-sm"
          >
            Could not load faculty profiles. Please check your connection and try again.
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && faculties.length === 0 && (
          <div className="text-center py-20 text-surface-400 dark:text-surface-500 readable mx-auto">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="font-medium">No faculty profiles yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}

        {/* Grid */}
        {!loading && faculties.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {faculties.map((f) => (
              <FacultyCard key={f.name} faculty={f} />
            ))}
          </div>
        )}
      </main>

      {/* Footer strip */}
      <div className="border-t border-surface-100 dark:border-surface-800 mt-10">
        <div className="container-pad py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="/"
            className="text-sm text-surface-400 dark:text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          >
            ← Back to home
          </a>
          <a
            href="/"
            className="text-sm text-surface-400 dark:text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          >
            physicspeptalk.com
          </a>
        </div>
      </div>
    </div>
  );
}
