/**
 * TestInstructions.tsx
 *
 * Examination guidelines, rules, and marking scheme.
 */

import React, { useState } from "react";

export const TestInstructions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/60 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0056D2] flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">
            Important Examination Guidelines &amp; Marking Scheme
          </span>
        </div>

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100 text-xs sm:text-sm text-gray-600 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                ✓
              </span>
              <div>
                <span className="font-bold text-gray-900 block">Marking Scheme</span>
                <span>+1.0 mark for each correct answer; 0 negative marking for wrong or unattempted questions.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0056D2] flex items-center justify-center font-bold text-xs flex-shrink-0">
                ⏱
              </span>
              <div>
                <span className="font-bold text-gray-900 block">Timed Countdown</span>
                <span>The test auto-submits when the timer reaches 00:00. You can submit early anytime.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                ⚑
              </span>
              <div>
                <span className="font-bold text-gray-900 block">Mark for Review</span>
                <span>Flag questions you want to reconsider before submitting. Use the Question Palette to jump.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                💾
              </span>
              <div>
                <span className="font-bold text-gray-900 block">Session Auto-Save</span>
                <span>Your selections and timer persist locally in case of accidental page reload or network drop.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInstructions;
