/**
 * AnswerReview.tsx
 *
 * Detailed answer review component:
 *   - Shows original question and all 4 options
 *   - Highlights student selection vs correct answer
 *   - Renders Column I Explanation with math and scientific notation
 *   - Filterable by: All, Correct, Incorrect, Unattempted
 */

import React, { useState } from "react";
import type { QuestionReviewItem } from "../../services/testSeriesTypes";
import MathRenderer from "./MathRenderer";

interface AnswerReviewProps {
  reviewItems: QuestionReviewItem[];
}

const OPTION_KEYS: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];

export const AnswerReview: React.FC<AnswerReviewProps> = ({ reviewItems }) => {
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "unattempted">("all");

  const filteredItems = reviewItems.filter((item) => {
    if (filter === "correct") return item.isCorrect;
    if (filter === "incorrect") return !item.isCorrect && !item.isUnattempted;
    if (filter === "unattempted") return item.isUnattempted;
    return true;
  });

  const correctCount = reviewItems.filter((i) => i.isCorrect).length;
  const incorrectCount = reviewItems.filter((i) => !i.isCorrect && !i.isUnattempted).length;
  const unattemptedCount = reviewItems.filter((i) => i.isUnattempted).length;

  return (
    <section className="space-y-6" aria-label="Detailed question review">
      {/* Review Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-xs">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Question-by-Question Review</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Compare your selections with the official answer key and read in-depth solutions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-[#0056D2] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({reviewItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("correct")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filter === "correct"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Correct ({correctCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("incorrect")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filter === "incorrect"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
          >
            Incorrect ({incorrectCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unattempted")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filter === "unattempted"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Unattempted ({unattemptedCount})
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {filteredItems.map((item) => {
          const originalIndex = reviewItems.findIndex((r) => r.id === item.id) + 1;

          let badgeClass = "bg-gray-100 text-gray-700 border-gray-200";
          let statusText = "Unattempted";

          if (item.isCorrect) {
            badgeClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
            statusText = "Correct (+1.0)";
          } else if (!item.isUnattempted) {
            badgeClass = "bg-rose-50 text-rose-800 border-rose-200";
            statusText = "Incorrect (0.0)";
          }

          return (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 sm:p-7 flex flex-col gap-4"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#0056D2] text-white">
                    Q{originalIndex}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                    {item.topic}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badgeClass}`}>
                  {statusText}
                </span>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed">
                <MathRenderer text={item.question} as="div" />
              </div>

              {/* Options Breakdown */}
              <div className="space-y-2.5 pt-1">
                {OPTION_KEYS.map((optKey) => {
                  const optText = item.options[optKey];
                  if (!optText && optText !== "0") return null;

                  const isCorrectAnswer = item.correctAnswer === optKey;
                  const isStudentAnswer = item.studentAnswer === optKey;

                  let rowStyle = "bg-white border-gray-200 text-gray-700";
                  let badgeStyle = "bg-gray-100 text-gray-700";

                  if (isCorrectAnswer) {
                    rowStyle = "bg-emerald-50/80 border-emerald-400 text-emerald-950 font-medium";
                    badgeStyle = "bg-emerald-600 text-white font-bold";
                  } else if (isStudentAnswer && !item.isCorrect) {
                    rowStyle = "bg-rose-50/80 border-rose-400 text-rose-950";
                    badgeStyle = "bg-rose-600 text-white font-bold";
                  }

                  return (
                    <div
                      key={optKey}
                      className={`p-3.5 rounded-xl border-2 flex items-start gap-3 transition-colors ${rowStyle}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${badgeStyle}`}
                      >
                        {optKey}
                      </div>

                      <div className="flex-1 pt-0.5 text-sm leading-relaxed">
                        <MathRenderer text={optText} />
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold flex-shrink-0">
                        {isCorrectAnswer && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Correct Answer
                          </span>
                        )}
                        {isStudentAnswer && !isCorrectAnswer && (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Your Choice
                          </span>
                        )}
                        {isStudentAnswer && isCorrectAnswer && (
                          <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                            Your Choice
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Column I Explanation */}
              <div className="mt-2 bg-blue-50/60 rounded-xl p-4 sm:p-5 border border-blue-200/70 text-xs sm:text-sm text-gray-800">
                <div className="flex items-center gap-2 font-bold text-[#0056D2] mb-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span>Detailed Explanation &amp; Solution</span>
                </div>
                <div className="leading-relaxed text-gray-700 font-normal">
                  <MathRenderer
                    text={item.explanation || "Explanation not available for this question."}
                    as="div"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default AnswerReview;
