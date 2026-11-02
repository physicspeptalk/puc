/**
 * FacultiesPage.tsx
 *
 * Renders the /faculties/ page.
 * Coursera Design System:
 * - Clean light canvas (#F5F7FA).
 * - Breadcrumb navigation.
 * - Coursera page hero with academic credentials and trust proof metrics.
 * - 4-column responsive faculty cards with crisp borders, subject badges, experience indicators, and WhatsApp guidance CTAs.
 */

import { useState, useEffect } from "react";
import { fetchFaculties, type Faculty } from "../services/facultyService";
import { buildWhatsAppUrl } from "../config/siteConfig";

function ArrowRightIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function FacultyCard({ faculty }: { faculty: Faculty }) {
  const [imgErr, setImgErr] = useState(false);
  const showAvatar = !faculty.pictureUrl || imgErr;

  return (
    <article className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#0056D2] hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Photo / Avatar */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden flex-shrink-0">
        {showAvatar ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#00255D] to-[#0056D2] text-white p-6">
            <span className="text-4xl font-extrabold tracking-tight select-none mb-1">
              {getInitials(faculty.name)}
            </span>
            <span className="text-[11px] font-semibold text-blue-200 tracking-wider uppercase">
              {faculty.subject || "Educator"}
            </span>
          </div>
        ) : (
          <img
            src={faculty.pictureUrl}
            alt={`Photo of ${faculty.name}`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgErr(true)}
          />
        )}

        {/* Subject Badge */}
        {faculty.subject && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#0056D2] text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
              {faculty.subject}
            </span>
          </div>
        )}

        {/* Experience Pill */}
        {faculty.experience && (
          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs">
            <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{faculty.experience} Experience</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-base font-bold text-gray-900 group-hover:text-[#0056D2] transition-colors leading-snug">
          {faculty.name}
        </h2>
        <p className="text-xs font-semibold text-[#0056D2] mt-0.5">
          {faculty.subject} Specialist
        </p>

        {faculty.description && (
          <p className="text-xs text-gray-600 leading-relaxed mt-2.5 flex-1 line-clamp-3">
            {faculty.description}
          </p>
        )}

        {/* Action Link */}
        <div className="pt-3.5 mt-3.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Mentor
          </span>

          <a
            href={buildWhatsAppUrl(`Hi, I would like to know more about batches taught by ${faculty.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0056D2] hover:text-[#00419e] group-hover:underline"
          >
            <span>Ask Guidance</span>
            <ArrowRightIcon className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  );
}

export default function FacultiesPage() {
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
    <div className="bg-[#F5F7FA]">
      {/* ── Breadcrumb Navigation ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 text-xs text-gray-500 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <a href="/" className="hover:text-[#0056D2] font-medium transition-colors">Home</a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Faculties</span>
        </div>
      </div>

      {/* ── Coursera Header Hero ───────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200 py-10 md:py-14" aria-label="Faculties overview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0056D2] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Karnataka&apos;s Top Educators</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Meet Our Expert Faculties
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
              Distinguished educators with decades of combined classroom experience, dedicated to simplifying tough physics, chemistry, and mathematics concepts for Karnataka PUC and entrance aspirants.
            </p>

            {/* Academic Proof Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#0056D2] flex items-center justify-center font-bold text-base">🎓</div>
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Curriculum</div>
                  <div className="text-xs font-bold text-gray-900">100% Karnataka PUC</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">📍</div>
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Experience</div>
                  <div className="text-xs font-bold text-gray-900">10+ to 34+ Years</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base">🏆</div>
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Target Exams</div>
                  <div className="text-xs font-bold text-gray-900">KCET · COMEDK · Boards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Faculty Cards Grid ────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Academic Leadership &amp; Mentors</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Full-time educators personally delivering lectures and doubt clearing sessions.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <StarIcon />
              <span>Top Rated Faculty</span>
            </div>
          </div>

          {error && !loading && (
            <div role="alert" className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm mb-6">
              Could not load faculty profiles. Please check your internet connection and try again.
            </div>
          )}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && !error && faculties.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <p className="font-semibold text-gray-800">No faculty profiles found.</p>
              <p className="text-xs text-gray-500 mt-1">Please check back soon.</p>
            </div>
          )}

          {!loading && faculties.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {faculties.map((f) => (
                <FacultyCard key={f.name} faculty={f} />
              ))}
            </div>
          )}

          {/* ── Bottom Admissions Callout ───────────────────────────── */}
          <div className="mt-12 rounded-2xl bg-white border border-gray-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-[#0056D2] uppercase tracking-wider block mb-1">
                Direct Mentorship
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                Want to learn directly under our faculty team?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                Enroll in our KCET Fastrack Batch or Board Mastery courses with regular interactive doubt clearance.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href="/#courses"
                className="px-5 py-2.5 rounded-md font-bold text-xs text-[#0056D2] bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                View Batches
              </a>
              <a
                href={buildWhatsAppUrl("Hi, I want to talk to an academic counsellor about faculty batches.")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-md font-bold text-xs text-white bg-[#0056D2] hover:bg-[#00419e] shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>WhatsApp Desk</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
