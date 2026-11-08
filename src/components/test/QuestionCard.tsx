/**
 * QuestionCard.tsx
 *
 * Primary question display card during examination.
 */

import React from "react";
import type { Question } from "../../services/testSeriesTypes";
import MathRenderer from "./MathRenderer";
import OptionSelector from "./OptionSelector";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: Question;
  selectedOption: "A" | "B" | "C" | "D" | null;
  isMarkedForReview: boolean;
  onSelectOption: (option: "A" | "B" | "C" | "D") => void;
  onToggleMarkForReview: () => void;
  onClearResponse: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber,
  totalQuestions,
  question,
  selectedOption,
  isMarkedForReview,
  onSelectOption,
  onToggleMarkForReview,
  onClearResponse,
}) => {
  return (
    <article className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 sm:p-7 md:p-8 flex flex-col gap-6">
      {/* Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#0056D2] text-white">
            Q{questionNumber} / {totalQuestions}
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
            {question.topic}
          </span>
          <span className="hidden sm:inline-block text-xs text-gray-400 font-medium">
            +1.0 / 0.0 marks
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark for review button */}
          <button
            type="button"
            onClick={onToggleMarkForReview}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isMarkedForReview
                ? "bg-purple-100 border-purple-300 text-purple-900"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Mark this question to review later"
          >
            <svg
              className={`w-3.5 h-3.5 ${isMarkedForReview ? "text-purple-600 fill-purple-600" : "text-gray-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span>{isMarkedForReview ? "Marked for Review" : "Mark for Review"}</span>
          </button>

          {/* Clear response button */}
          {selectedOption && (
            <button
              type="button"
              onClick={onClearResponse}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="text-base sm:text-lg md:text-xl font-medium text-gray-900 leading-relaxed">
        <MathRenderer text={question.question} as="div" />
      </div>

      {/* Options */}
      <div className="pt-2">
        <OptionSelector
          options={question.options}
          selectedOption={selectedOption}
          onSelectOption={onSelectOption}
        />
      </div>
    </article>
  );
};

export default QuestionCard;
