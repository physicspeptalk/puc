/**
 * OptionSelector.tsx
 *
 * Interactive MCQ option selector (Options A, B, C, D):
 *   - Accessible keyboard selection (A-D, 1-4)
 *   - Clear visual selection styling (Coursera Blue accent)
 *   - Formatted math / Unicode rendering via MathRenderer
 */

import React from "react";
import type { QuestionOptions } from "../../services/testSeriesTypes";
import MathRenderer from "./MathRenderer";

interface OptionSelectorProps {
  options: QuestionOptions;
  selectedOption: "A" | "B" | "C" | "D" | null;
  onSelectOption: (option: "A" | "B" | "C" | "D") => void;
  disabled?: boolean;
}

const OPTION_KEYS: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  selectedOption,
  onSelectOption,
  disabled = false,
}) => {
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Multiple choice options">
      {OPTION_KEYS.map((key) => {
        const optionText = options[key];
        if (!optionText && optionText !== "0") return null;

        const isSelected = selectedOption === key;

        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelectOption(key)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 group cursor-pointer ${
              isSelected
                ? "bg-blue-50/70 border-[#0056D2] shadow-xs"
                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/70"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {/* Letter Badge */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                isSelected
                  ? "bg-[#0056D2] text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
              }`}
            >
              {key}
            </div>

            {/* Option Content */}
            <div className="flex-1 pt-0.5 text-sm sm:text-base text-gray-800 leading-relaxed font-normal">
              <MathRenderer text={optionText} />
            </div>

            {/* Keyboard shortcut hint */}
            <span className="hidden sm:inline-block text-[11px] font-mono text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
              Key {key}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default OptionSelector;
