/**
 * CoursePromoModal.tsx
 *
 * Post-test promotional modal displaying purely dynamic data from
 * Google Sheets columns K-O:
 *   - Column K: Course Thumbnail (promo.thumbnailUrl)
 *   - Column L: Course Tag       (promo.tag)
 *   - Column M: Course Name      (promo.title)
 *   - Column N: Course Desc      (promo.description)
 *   - Column O: Course Link      (promo.buyUrl)
 *
 * Strictly NO static filler information or hardcoded bullet points.
 */

import React, { useEffect, useState } from "react";
import type { PromoCourseInfo } from "../../services/testSeriesTypes";

interface CoursePromoModalProps {
  promo: PromoCourseInfo;
  isOpen: boolean;
  onClose: () => void;
}

export const CoursePromoModal: React.FC<CoursePromoModalProps> = ({
  promo,
  isOpen,
  onClose,
}) => {
  const [imageError, setImageError] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={promo.title ? "promo-modal-title" : undefined}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[#00255D] via-[#0056D2] to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close promotion dialog"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-gray-100 text-gray-500 hover:text-gray-900 shadow-xs border border-gray-200 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
          {/* Column L: Course Tag (only if present in Google Sheet) */}
          {promo.tag && (
            <div className="flex items-center justify-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                {promo.tag}
              </span>
            </div>
          )}

          {/* Column K: Course Thumbnail Image (only if present in Google Sheet) */}
          {promo.thumbnailUrl && !imageError && (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs bg-gray-50 aspect-video flex items-center justify-center">
              <img
                src={promo.thumbnailUrl}
                alt={promo.title || "Course Thumbnail"}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Column M: Course Name & Column N: Course Description (dynamic only) */}
          {(promo.title || promo.description) && (
            <div className="space-y-2 text-left">
              {promo.title && (
                <h3
                  id="promo-modal-title"
                  className="text-xl sm:text-2xl font-black text-gray-900 leading-snug tracking-tight"
                >
                  {promo.title}
                </h3>
              )}
              {promo.description && (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {promo.description}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            {/* Column O: Course Link */}
            {promo.buyUrl && (
              <a
                href={promo.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0056D2] hover:bg-[#00419e] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all text-center"
              >
                <span>Enroll / Buy Course Now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold transition-colors cursor-pointer text-center"
            >
              Review Test Answers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePromoModal;
