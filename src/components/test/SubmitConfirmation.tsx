/**
 * SubmitConfirmation.tsx
 *
 * Examination submission confirmation modal dialog.
 */

import React, { useEffect } from "react";

interface SubmitConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  markedCount: number;
  timeRemaining: string;
}

export const SubmitConfirmation: React.FC<SubmitConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  totalQuestions,
  answeredCount,
  unansweredCount,
  markedCount,
  timeRemaining,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0056D2] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 id="submit-modal-title" className="text-lg font-bold text-gray-900 leading-tight">
              Ready to submit your test?
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Please review your question attempt summary before submitting.
            </p>
          </div>
        </div>

        {/* Attempt Summary Grid */}
        <div className="grid grid-cols-2 gap-2.5 bg-gray-50 p-4 rounded-xl border border-gray-200/80 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500">Total Questions</span>
            <span className="text-base font-bold text-gray-900">{totalQuestions}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500">Time Remaining</span>
            <span className="text-base font-bold font-mono text-gray-900">{timeRemaining}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-emerald-700 font-medium">Answered</span>
            <span className="text-base font-bold text-emerald-700">{answeredCount}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-amber-700 font-medium">Unanswered</span>
            <span className="text-base font-bold text-amber-700">{unansweredCount}</span>
          </div>
          {markedCount > 0 && (
            <div className="col-span-2 pt-2 border-t border-gray-200 flex items-center justify-between text-purple-700">
              <span className="font-medium">Marked for Review</span>
              <span className="font-bold">{markedCount} questions</span>
            </div>
          )}
        </div>

        {unansweredCount > 0 && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>You have {unansweredCount} unattempted questions remaining.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Return to Test
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Evaluating...</span>
              </>
            ) : (
              <span>Yes, Submit Test</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmation;
