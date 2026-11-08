/**
 * TestTakingInterface.tsx
 *
 * Full-screen, distraction-free examination interface for Physics Pep Talk:
 *   - One question at a time
 *   - 4 Options (A, B, C, D) with instant selection
 *   - Previous / Next / Mark for Review / Clear
 *   - Question palette with live status colors
 *   - Real-time countdown timer with auto-submit
 *   - Session auto-persistence (survives accidental page refresh)
 *   - Full confirmation modal before final submission
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Question, SubjectId, TestEvaluationResult } from "../../services/testSeriesTypes";
import { SUBJECT_CONFIGS } from "../../config/testSeriesConfig";
import {
  saveTestSession,
  loadTestSession,
  clearTestSession,
  submitTestAnswers,
} from "../../services/testSeriesService";
import QuestionCard from "./QuestionCard";
import QuestionNavigation from "./QuestionNavigation";
import CountdownTimer from "./CountdownTimer";
import { formatTime } from "../../utils/testUtils";
import TestProgress from "./TestProgress";
import SubmitConfirmation from "./SubmitConfirmation";

interface TestTakingInterfaceProps {
  subjectId: SubjectId;
  questions: Question[];
  topicFilter: string | null;
  onFinish: (result: TestEvaluationResult) => void;
  onExit: () => void;
}

export const TestTakingInterface: React.FC<TestTakingInterfaceProps> = ({
  subjectId,
  questions,
  topicFilter,
  onFinish,
  onExit,
}) => {
  const config = SUBJECT_CONFIGS[subjectId];

  // Filter questions if topic filter was active
  const activeQuestions = useMemo(() => {
    if (!topicFilter) return questions;
    const filtered = questions.filter((q) => q.topic.toLowerCase() === topicFilter.toLowerCase());
    return filtered.length > 0 ? filtered : questions;
  }, [questions, topicFilter]);

  const totalQuestions = activeQuestions.length;
  const initialDurationSeconds = totalQuestions * 60; // 1 minute per question default

  // Session state initialization (restore from localStorage if valid)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState(initialDurationSeconds);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = loadTestSession(subjectId);
    if (saved && saved.questionIds && saved.questionIds.length === activeQuestions.length) {
      setAnswers(saved.answers || {});
      setMarkedForReview(saved.markedForReview || {});
      setVisited(saved.visited || {});
      setCurrentIndex(Math.min(saved.currentQuestionIndex || 0, activeQuestions.length - 1));
      if (saved.timeRemainingSeconds > 0) {
        setTimeRemaining(saved.timeRemainingSeconds);
      }
      setHasRestoredSession(true);
    } else {
      // Mark first question as visited
      if (activeQuestions[0]) {
        setVisited({ [activeQuestions[0].id]: true });
      }
    }
  }, [subjectId, activeQuestions]);

  // Persist session to localStorage on changes
  useEffect(() => {
    if (totalQuestions === 0) return;

    saveTestSession({
      subjectId,
      topicFilter,
      questionIds: activeQuestions.map((q) => q.id),
      currentQuestionIndex: currentIndex,
      answers,
      markedForReview,
      visited,
      timeRemainingSeconds: timeRemaining,
      totalTimeSeconds: initialDurationSeconds,
      isSubmitted: false,
      startedAt: Date.now(),
    });
  }, [
    subjectId,
    topicFilter,
    activeQuestions,
    currentIndex,
    answers,
    markedForReview,
    visited,
    timeRemaining,
    initialDurationSeconds,
    totalQuestions,
  ]);

  // Mark current question as visited
  useEffect(() => {
    const currentQ = activeQuestions[currentIndex];
    if (currentQ && !visited[currentQ.id]) {
      setVisited((prev) => ({ ...prev, [currentQ.id]: true }));
    }
  }, [currentIndex, activeQuestions, visited]);

  // Option selection
  const handleSelectOption = useCallback((option: "A" | "B" | "C" | "D") => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  }, [activeQuestions, currentIndex]);

  // Clear current response
  const handleClearResponse = useCallback(() => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  }, [activeQuestions, currentIndex]);

  // Toggle mark for review
  const handleToggleMarkForReview = useCallback(() => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  }, [activeQuestions, currentIndex]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
  }, [totalQuestions]);

  const handleMarkAndNext = useCallback(() => {
    handleToggleMarkForReview();
    if (currentIndex < totalQuestions - 1) {
      handleNext();
    }
  }, [handleToggleMarkForReview, currentIndex, totalQuestions, handleNext]);

  // Test submission
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeSpent = Math.max(0, initialDurationSeconds - timeRemaining);

    try {
      const evaluation = await submitTestAnswers({
        subjectId,
        questionIds: activeQuestions.map((q) => q.id),
        answers,
        timeSpentSeconds: timeSpent,
      });

      clearTestSession(subjectId);
      setIsSubmitModalOpen(false);
      onFinish(evaluation);
    } catch (err) {
      console.error("Test submission failed:", err);
      alert("Failed to submit test. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  }, [isSubmitting, initialDurationSeconds, timeRemaining, subjectId, activeQuestions, answers, onFinish]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside an input or modal is open
      if (isSubmitModalOpen) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const key = e.key.toUpperCase();

      if (key === "A" || key === "1") {
        handleSelectOption("A");
      } else if (key === "B" || key === "2") {
        handleSelectOption("B");
      } else if (key === "C" || key === "3") {
        handleSelectOption("C");
      } else if (key === "D" || key === "4") {
        handleSelectOption("D");
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (key === "M") {
        handleToggleMarkForReview();
      } else if (key === "X" || e.key === "Backspace" || e.key === "Delete") {
        handleClearResponse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isSubmitModalOpen,
    handleSelectOption,
    handleNext,
    handlePrev,
    handleToggleMarkForReview,
    handleClearResponse,
  ]);

  const currentQuestion = activeQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  if (!currentQuestion) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-600 mb-4">No questions found for this test.</p>
        <button
          type="button"
          onClick={onExit}
          className="px-4 py-2 bg-[#0056D2] text-white rounded-lg font-bold text-xs"
        >
          Return to Overview
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between selection:bg-[#0056D2] selection:text-white">
      {/* ─── Top Examination Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Test Info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to pause / leave the test? Your progress will remain saved.")) {
                onExit();
              }
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Leave test (Session saved)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0056D2] text-sm sm:text-base tracking-tight">
                {config.name}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:inline">
                • {topicFilter || "Full Mock Test"}
              </span>
            </div>
            {hasRestoredSession && (
              <span className="text-[10px] text-emerald-600 font-medium block">
                Session Restored from Auto-Save
              </span>
            )}
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className="flex items-center gap-3">
          <CountdownTimer
            initialSeconds={timeRemaining}
            onExpire={handleSubmitTest}
            onTick={(rem) => setTimeRemaining(rem)}
          />
        </div>

        {/* Right: Submit Button & Mobile Palette Toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile Palette Button */}
          <button
            type="button"
            onClick={() => setMobilePaletteOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
            aria-label="Open question navigation palette"
          >
            <svg className="w-4 h-4 text-[#0056D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="hidden sm:inline">Palette</span>
          </button>

          {/* Submit Test Button */}
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 sm:px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* ─── Main Examination Area ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6">
        {/* Progress bar */}
        <TestProgress
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          markedCount={markedCount}
        />

        {/* Grid layout: Question on Left, Navigation Palette on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* Left Column: Question Card & Controls */}
          <div className="lg:col-span-8 space-y-4">
            <QuestionCard
              questionNumber={currentIndex + 1}
              totalQuestions={totalQuestions}
              question={currentQuestion}
              selectedOption={answers[currentQuestion.id] || null}
              isMarkedForReview={!!markedForReview[currentQuestion.id]}
              onSelectOption={handleSelectOption}
              onToggleMarkForReview={handleToggleMarkForReview}
              onClearResponse={handleClearResponse}
            />

            {/* Bottom Question Action Bar */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAndNext}
                  className="px-3.5 py-2.5 rounded-xl border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Mark &amp; Next
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Save &amp; Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Finish &amp; Submit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Desktop): Question Palette */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <QuestionNavigation
              questions={activeQuestions}
              currentIndex={currentIndex}
              answers={answers}
              markedForReview={markedForReview}
              visited={visited}
              onSelectQuestion={(idx) => setCurrentIndex(idx)}
            />
          </div>
        </div>
      </main>

      {/* ─── Mobile Palette Modal / Drawer ─────────────────────────────────── */}
      {mobilePaletteOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setMobilePaletteOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <span className="font-bold text-gray-900 text-sm">Question Navigation</span>
              <button
                type="button"
                onClick={() => setMobilePaletteOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <QuestionNavigation
              questions={activeQuestions}
              currentIndex={currentIndex}
              answers={answers}
              markedForReview={markedForReview}
              visited={visited}
              onSelectQuestion={(idx) => {
                setCurrentIndex(idx);
                setMobilePaletteOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ─── Submit Confirmation Modal ─────────────────────────────────────── */}
      <SubmitConfirmation
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmitTest}
        isSubmitting={isSubmitting}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        markedCount={markedCount}
        timeRemaining={formatTime(timeRemaining)}
      />
    </div>
  );
};

export default TestTakingInterface;
