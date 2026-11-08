/**
 * QuestionNavigation.tsx
 *
 * Examination question palette and navigation grid.
 *
 * Status Indicators:
 *   - Current: Active blue focus ring
 *   - Answered: Solid Emerald Green
 *   - Answered & Marked: Purple with green checkmark
 *   - Marked for Review: Solid Purple
 *   - Not Visited / Unanswered: Light Gray / Slate
 */

import React, { useState } from "react";
import type { Question } from "../../services/testSeriesTypes";
import { getQuestionStatus } from "../../utils/testUtils";

interface QuestionNavigationProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, "A" | "B" | "C" | "D">;
  markedForReview: Record<string, boolean>;
  visited: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
  className?: string;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  questions,
  currentIndex,
  answers,
  markedForReview,
  visited,
  onSelectQuestion,
  className = "",
}) => {
  const [filter, setFilter] = useState<"all" | "answered" | "unanswered" | "marked">("all");

  const total = questions.length;
  let answeredCount = 0;
  let markedCount = 0;
  let unattemptedCount = 0;

  questions.forEach((q) => {
    const isAns = !!answers[q.id];
    const isMkd = !!markedForReview[q.id];
    if (isAns) answeredCount++;
    if (isMkd) markedCount++;
    if (!isAns) unattemptedCount++;
  });

  return (
    <div className={`bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 flex flex-col gap-4 ${className}`}>
      {/* Palette Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <span>Question Palette</span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
            {total}
          </span>
        </h3>
      </div>

      {/* Legend & Stats */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-gray-600 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 flex-shrink-0" />
          <span>Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-purple-600 flex-shrink-0" />
          <span>Marked ({markedCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-gray-200 border border-gray-300 flex-shrink-0" />
          <span>Unanswered ({unattemptedCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-white border-2 border-[#0056D2] flex-shrink-0" />
          <span>Current</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
        {(["all", "answered", "unanswered", "marked"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 py-1 rounded text-center capitalize transition-colors cursor-pointer text-[11px] ${
              filter === f
                ? "bg-white text-gray-900 shadow-2xs font-bold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Question Number Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const status = getQuestionStatus(q.id, answers, markedForReview, visited);
          const isCurrent = idx === currentIndex;

          // Filter matching
          if (filter === "answered" && !answers[q.id]) return null;
          if (filter === "unanswered" && answers[q.id]) return null;
          if (filter === "marked" && !markedForReview[q.id]) return null;

          let bgClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200";

          if (status === "marked-answered") {
            bgClasses = "bg-purple-600 text-white hover:bg-purple-700 relative";
          } else if (status === "marked") {
            bgClasses = "bg-purple-500 text-white hover:bg-purple-600";
          } else if (status === "answered") {
            bgClasses = "bg-emerald-600 text-white hover:bg-emerald-700";
          } else if (status === "unanswered") {
            bgClasses = "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300";
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer relative ${bgClasses} ${
                isCurrent ? "ring-2 ring-[#0056D2] ring-offset-2 scale-105 shadow-xs" : ""
              }`}
              aria-label={`Jump to Question ${idx + 1}, status ${status}`}
              aria-current={isCurrent ? "true" : undefined}
            >
              <span>{idx + 1}</span>
              {status === "marked-answered" && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-300 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNavigation;
