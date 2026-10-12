/**
 * Testimonials.tsx
 *
 * Fetches testimonial videos from the Google Sheet and renders them as
 * YouTube embed cards. Videos are lazy-loaded — the iframe is only inserted
 * after the user clicks the thumbnail, keeping page load fast.
 */

import { useState } from "react";
import { useSheetConfig } from "../context/SheetConfigContext";
import type { Testimonial } from "../utils/testimonialsConfig";

// ─── Individual video card ──────────────────────────────────────────────────

function VideoCard({ testimonial }: { testimonial: Testimonial }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      {/* Video area */}
      <div className="relative aspect-video bg-gray-900">
        {playing ? (
          <iframe
            src={`${testimonial.embedUrl}?autoplay=1&rel=0`}
            title={testimonial.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset"
            aria-label={`Play video: ${testimonial.title}`}
          >
            {/* Thumbnail */}
            <img
              src={testimonial.thumbnailUrl}
              alt={testimonial.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Dark overlay on hover */}
            <span className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            {/* Play button */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-700 flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
                <svg
                  className="w-6 h-6 text-white translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Title */}
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug">
          {testimonial.title}
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton loader card ────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 animate-pulse">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
      <div className="px-4 py-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );
}

// ─── Main section ────────────────────────────────────────────────────────────

export default function Testimonials() {
  const { testimonials, loading } = useSheetConfig();

  // Don't render the section at all if load finished and there's nothing
  if (!loading && testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 bg-white dark:bg-gray-900"
      aria-label="Student testimonials"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Hear From Our Students
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Real students share their experience with our KCET counselling
            guidance.
          </p>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : testimonials.map((t) => (
                <VideoCard key={t.youtubeUrl} testimonial={t} />
              ))}
        </div>
      </div>
    </section>
  );
}
