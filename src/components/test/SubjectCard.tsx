/**
 * SubjectCard.tsx
 *
 * Subject presentation card with iconography, syllabus badges, and direct test link.
 */

import React from "react";
import type { SubjectConfig } from "../../config/testSeriesConfig";

export function SubjectIcon({
  iconName,
  className = "w-6 h-6",
}: {
  iconName: SubjectConfig["iconName"];
  className?: string;
}) {
  if (iconName === "atom") {
    // Physics
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="9" ry="4" strokeWidth="1.8" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="4" strokeWidth="1.8" transform="rotate(-30 12 12)" />
      </svg>
    );
  }
  if (iconName === "flask") {
    // Chemistry
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M9 3h6m-4 0v4.5L5.2 17.8A2 2 0 006.8 21h10.4a2 2 0 001.6-3.2L13 7.5V3"
        />
        <circle cx="9" cy="17" r="1" fill="currentColor" />
        <circle cx="13" cy="15" r="1" fill="currentColor" />
        <circle cx="15" cy="18" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (iconName === "function") {
    // Mathematics
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 4c-1.5 0-2.5 1-2.5 2.5 0 2 2 4.5 2.5 6.5s-.5 4-2.5 4M17 4c1.5 0 2.5 1 2.5 2.5 0 2-2 4.5-2.5 6.5s.5 4 2.5 4M8 12h8"
        />
      </svg>
    );
  }
  // Biology (dna)
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M6 3c3 3 3 6 0 9s-3 6 0 9m12-18c-3 3-3 6 0 9s3 6 0 9M6 5h12M6 8h12M6 14h12M6 17h12"
      />
    </svg>
  );
}

interface SubjectCardProps {
  config: SubjectConfig;
  questionCount?: number;
  onSelect: () => void;
  isActive?: boolean;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  config,
  questionCount,
  onSelect,
  isActive = false,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl border-2 transition-all p-5 sm:p-6 flex flex-col justify-between group cursor-pointer ${
        isActive
          ? "border-[#0056D2] shadow-md ring-2 ring-blue-100"
          : "border-gray-200/90 hover:border-gray-300 hover:shadow-lg"
      }`}
    >
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${config.themeColor}15`, color: config.themeColor }}
          >
            <SubjectIcon iconName={config.iconName} className="w-6 h-6" />
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${config.badgeBg}`}>
            {config.shortName}
          </span>
        </div>

        {/* Title & Tagline */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0056D2] transition-colors">
            {config.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{config.tagline}</p>
        </div>

        {/* Question Count */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>
            {questionCount !== undefined ? `${questionCount} Questions Available` : "NCERT & KCET Bank"}
          </span>
        </div>
      </div>

      {/* Button CTA */}
      <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs font-bold text-[#0056D2] group-hover:underline">
          Start {config.name} Test
        </span>
        <svg className="w-4 h-4 text-[#0056D2] transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </div>
  );
};

export default SubjectCard;
