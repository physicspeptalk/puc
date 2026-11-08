/**
 * TopicSelector.tsx
 *
 * Dynamic topic selector based on Column B (Topic) of Google Sheets:
 *   - "All Topics (Full Mock Test)"
 *   - Individual topic pills with question count badges
 *   - Search / filter if many topics exist
 */

import React from "react";

interface TopicSelectorProps {
  topics: Record<string, number>;
  totalQuestions: number;
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  totalQuestions,
  selectedTopic,
  onSelectTopic,
}) => {
  const topicEntries = Object.entries(topics).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Select Topic / Practice Mode
        </label>
        {selectedTopic && (
          <button
            type="button"
            onClick={() => onSelectTopic(null)}
            className="text-xs text-[#0056D2] hover:underline font-semibold cursor-pointer"
          >
            Reset to All Topics
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* All Topics Pill */}
        <button
          type="button"
          onClick={() => onSelectTopic(null)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            selectedTopic === null
              ? "bg-[#0056D2] text-white border-[#0056D2] shadow-xs scale-102"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <span>All Topics (Full Mock Test)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              selectedTopic === null ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {totalQuestions}
          </span>
        </button>

        {/* Dynamic Topic Pills */}
        {topicEntries.map(([topicName, count]) => {
          const isSelected = selectedTopic === topicName;

          return (
            <button
              key={topicName}
              type="button"
              onClick={() => onSelectTopic(topicName)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#0056D2] text-white border-[#0056D2] shadow-xs scale-102"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="truncate max-w-[200px] sm:max-w-[280px]">{topicName}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopicSelector;
