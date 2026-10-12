/**
 * KcetResultCard
 *
 * Mobile-first card showing a single college result.
 * Tapping expands to show full detail.
 *
 * Displayed on mobile (< md breakpoint) via KcetResultTable's responsive handling.
 */

import React, { useState } from "react";
import type { CollegeResult } from "../../services/kcetChance";
import { type ChanceLabel, formatPercent, formatRank } from "../../lib/kcetCalculations";

// ---------------------------------------------------------------------------
// Chance badge
// ---------------------------------------------------------------------------

const CHANCE_BADGE: Record<
  ChanceLabel,
  { bg: string; text: string; border: string; label: string }
> = {
  Guaranteed: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
    label: "Guaranteed",
  },
  Possible: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
    label: "Possible",
  },
  "May Be": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    label: "May Be",
  },
  "Very Hard": {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-300",
    label: "Very Hard",
  },
};

interface ChanceBadgeProps {
  chance: ChanceLabel;
  size?: "sm" | "md";
}

export function ChanceBadge({ chance, size = "md" }: ChanceBadgeProps) {
  const style = CHANCE_BADGE[chance];
  const px = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${px} ${style.bg} ${style.text} ${style.border}`}
      title="Chance is estimated by comparing your predicted rank with the KEA cutoff in the selected dataset. It is not an official KEA probability."
    >
      {style.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0 w-36">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KcetResultCard (mobile card)
// ---------------------------------------------------------------------------

interface KcetResultCardProps {
  result: CollegeResult;
}

export default function KcetResultCard({ result }: KcetResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  const rankDiffDisplay =
    result.rankDifference !== null
      ? result.rankDifference >= 0
        ? `+${formatRank(result.rankDifference)} (better than cutoff)`
        : `${formatRank(result.rankDifference)} (worse than cutoff)`
      : "N/A";

  const marginDisplay =
    result.marginPercent !== null
      ? formatPercent(result.marginPercent)
      : "N/A (rank model not connected)";

  return (
    <article
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      aria-label={`${result.collegeName} – ${result.branch}`}
    >
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5">
                #{result.rank}
              </span>
              <span className="text-xs text-gray-400">{result.collegeCode}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2">
              {result.collegeName}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{result.branch}</p>
          </div>
          <div className="shrink-0">
            <ChanceBadge chance={result.chance} />
          </div>
        </div>

        {/* Key metrics row */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-500">KEA Cutoff</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {formatRank(result.cutoffRank)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-500">Your Rank</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {result.predictedRank ? formatRank(result.predictedRank) : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-500">Margin</p>
            <p
              className={`text-sm font-bold mt-0.5 ${
                result.marginPercent === null
                  ? "text-gray-400"
                  : result.marginPercent >= 0
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {result.marginPercent !== null
                ? formatPercent(result.marginPercent)
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Expand / collapse */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
        aria-expanded={expanded}
      >
        {expanded ? "Hide details" : "View full details"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <DetailRow label="College Code" value={result.collegeCode} />
          <DetailRow label="Category" value={result.category} />
          <DetailRow label="Seat Type" value={result.seatType} />
          <DetailRow label="KEA Cutoff Rank" value={formatRank(result.cutoffRank)} />
          <DetailRow
            label="Your Predicted Rank"
            value={result.predictedRank ? formatRank(result.predictedRank) : "Not available yet"}
          />
          <DetailRow label="Rank Difference" value={rankDiffDisplay} />
          <DetailRow label="Margin %" value={marginDisplay} />
          <DetailRow label="Chance" value={<ChanceBadge chance={result.chance} size="sm" />} />
          <DetailRow label="Data Round" value={result.dataRound} />
          <DetailRow label="Source" value={result.dataSource} />
          {result.rkPdfPage && (
            <DetailRow label="RK PDF Page" value={`Page ${result.rkPdfPage}`} />
          )}
          {result.hPdfPage && (
            <DetailRow label="371(J) PDF Page" value={`Page ${result.hPdfPage}`} />
          )}

          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> Chance is estimated by comparing your predicted rank with
              the KEA cutoff in the selected dataset (
              {result.dataRound}
              ). It is not an official KEA probability or admission guarantee.
            </p>
          </div>
        </div>
      )}
    </article>
  );
}
