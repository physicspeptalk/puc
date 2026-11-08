/**
 * TestResults.tsx
 *
 * Examination scorecard and results breakdown dashboard.
 */

import React, { useRef } from "react";
import type { TestEvaluationResult } from "../../services/testSeriesTypes";
import { formatTime } from "../../utils/testUtils";
import AnswerReview from "./AnswerReview";

interface TestResultsProps {
  evaluation: TestEvaluationResult;
  onRetake: () => void;
  onChangeTopic?: () => void;
  onChangeSubject: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({
  evaluation,
  onRetake,
  onChangeTopic,
  onChangeSubject,
}) => {
  const reviewRef = useRef<HTMLDivElement>(null);

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getScoreVerdict = (pct: number) => {
    if (pct >= 85) return { label: "Outstanding Performance!", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (pct >= 70) return { label: "Great Effort!", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" };
    if (pct >= 50) return { label: "Good Attempt — Keep Practicing!", color: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "Needs More Revision & Concept Clarity", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const verdict = getScoreVerdict(evaluation.percentage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <section className="bg-white rounded-3xl border border-gray-200/90 shadow-md p-6 sm:p-8 md:p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#00255D] via-[#0056D2] to-cyan-500" />

        <div className="max-w-xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#0056D2] inline-block">
            {evaluation.subjectName} Test Completed
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Examination Scorecard
          </h2>

          <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${verdict.bg} ${verdict.color} ${verdict.border}`}>
            {verdict.label}
          </div>
        </div>

        {/* Primary Score Ring / Big Numbers */}
        <div className="my-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          {/* Big Score */}
          <div className="flex flex-col items-center">
            <div className="text-5xl sm:text-6xl font-black text-[#0056D2] tracking-tight">
              {evaluation.totalMarks}
              <span className="text-2xl sm:text-3xl text-gray-400 font-semibold">/{evaluation.maxMarks}</span>
            </div>
            <span className="text-xs uppercase font-bold text-gray-500 mt-1 tracking-wider">
              Total Marks Scored
            </span>
          </div>

          <div className="hidden sm:block w-px h-16 bg-gray-200" />

          {/* Percentage */}
          <div className="flex flex-col items-center">
            <div className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight">
              {evaluation.percentage}%
            </div>
            <span className="text-xs uppercase font-bold text-gray-500 mt-1 tracking-wider">
              Percentage Score
            </span>
          </div>

          <div className="hidden sm:block w-px h-16 bg-gray-200" />

          {/* Accuracy */}
          <div className="flex flex-col items-center">
            <div className="text-5xl sm:text-6xl font-black text-emerald-600 tracking-tight">
              {evaluation.accuracy}%
            </div>
            <span className="text-xs uppercase font-bold text-gray-500 mt-1 tracking-wider">
              Attempt Accuracy
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4 border-t border-gray-100 text-left">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <span className="text-[11px] text-gray-500 font-medium block">Total Questions</span>
            <span className="text-lg font-bold text-gray-900">{evaluation.totalQuestions}</span>
          </div>
          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-emerald-800 font-medium block">Correct</span>
            <span className="text-lg font-bold text-emerald-700">+{evaluation.correctAnswers}</span>
          </div>
          <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-100">
            <span className="text-[11px] text-rose-800 font-medium block">Incorrect</span>
            <span className="text-lg font-bold text-rose-700">{evaluation.incorrectAnswers}</span>
          </div>
          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100">
            <span className="text-[11px] text-amber-800 font-medium block">Time Taken</span>
            <span className="text-lg font-bold text-amber-900 font-mono">
              {formatTime(evaluation.timeSpentSeconds)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
          <button
            type="button"
            onClick={scrollToReview}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Review All Solutions</span>
          </button>

          <button
            type="button"
            onClick={onRetake}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Retake Test</span>
          </button>

          {onChangeTopic && (
            <button
              type="button"
              onClick={onChangeTopic}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Choose Another Topic</span>
            </button>
          )}

          <button
            type="button"
            onClick={onChangeSubject}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>All Subjects</span>
          </button>
        </div>
      </section>

      {/* Detailed Review Section */}
      <div ref={reviewRef}>
        <AnswerReview reviewItems={evaluation.review} />
      </div>
    </div>
  );
};

export default TestResults;
