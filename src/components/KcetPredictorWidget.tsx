/**
 * KcetPredictorWidget
 *
 * Floating button visible on all counselling pages (desktop and mobile).
 * Navigates to /kcet-college-predictor/ when clicked.
 *
 * Positioned bottom-right, above the MobileCTA bar on small screens.
 */

import { useState, useEffect } from "react";

export default function KcetPredictorWidget() {
  const [visible, setVisible] = useState(false);

  // Fade in after a short delay — avoids distracting on initial load
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed z-40 transition-all duration-500
        bottom-20 right-4
        md:bottom-8 md:right-6
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <a
        href="/kcet-college-predictor/"
        className="
          flex items-center gap-2
          bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
          text-white font-bold
          px-4 py-3 rounded-2xl
          shadow-xl shadow-indigo-300/50
          border-2 border-indigo-500
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          text-sm md:text-base
          group
          no-underline
        "
        aria-label="Open KCET Rank and College Predictor"
      >
        <span className="text-lg" aria-hidden="true">🎓</span>
        <span className="hidden sm:inline leading-tight">
          KCET Rank &amp; College<br className="hidden md:block" /> Predictor
        </span>
        <span className="sm:hidden">College Predictor</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}
