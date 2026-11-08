/**
 * TestProgress.tsx
 *
 * Visual progress bar and stats counter during examination.
 */

import React from "react";

interface TestProgressProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  markedCount: number;
}

export const TestProgress: React.FC<TestProgressProps> = ({
  currentIndex,
  totalQuestions,
  answeredCount,
  markedCount,
}) => {
  const percentComplete =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5 font-medium">
        <span className="font-semibold text-gray-900">
          Question {currentIndex + 1}{" "}
          <span className="text-gray-400 font-normal">of {totalQuestions}</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            {answeredCount} Answered
          </span>
          {markedCount > 0 && (
            <span className="text-purple-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
              {markedCount} Marked
            </span>
          )}
          <span className="text-gray-500">{percentComplete}%</span>
        </div>
      </div>
      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Test progress"
      >
        <div
          className="h-full bg-[#0056D2] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentComplete}%` }}
        />
      </div>
    </div>
  );
};

export default TestProgress;
