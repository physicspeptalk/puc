/**
 * KcetResultTable
 *
 * Displays split results in two sections:
 *
 *  ── 25 COLLEGES ABOVE YOUR RANK ──────────────────────────────────────────
 *  Cutoff rank < your predicted rank → these colleges are harder to get.
 *  Sorted closest-to-your-rank first (cutoff descending).
 *
 *  ── 25 COLLEGES BELOW YOUR RANK ──────────────────────────────────────────
 *  Cutoff rank ≥ your predicted rank → you have a better chance here.
 *  Sorted closest-to-your-rank first (cutoff ascending).
 *
 * Mobile: card list.
 * Desktop: table with all columns.
 */

import { useState } from "react";
import type { CollegeResult, SplitResults } from "../../services/kcetChance";
import { formatPercent, formatRank } from "../../lib/kcetCalculations";
import KcetResultCard, { ChanceBadge } from "./KcetResultCard";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KcetResultTableProps {
  splitResults: SplitResults;
  totalLoadedRows: number;
  categoryUsed: string;
  seatType: string;
  estimatedRank: number;
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  subtitle,
  count,
  colorClass,
  icon,
}: {
  title: string;
  subtitle: string;
  count: number;
  colorClass: string;
  icon: string;
}) {
  return (
    <div className={`rounded-2xl border-2 px-5 py-4 mb-4 ${colorClass}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-lg font-extrabold flex items-center gap-2">
            {icon} {title}
          </p>
          <p className="text-sm mt-0.5">{subtitle}</p>
        </div>
        <span className="text-2xl font-extrabold shrink-0">{count}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop table row
// ---------------------------------------------------------------------------

function TableRow({
  result,
  isExpanded,
  onToggle,
}: {
  result: CollegeResult;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const diff = result.rankDifference;

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-indigo-50/30 cursor-pointer transition-colors"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <td className="px-3 py-3 text-sm font-bold text-gray-400 text-center">{result.rank}</td>
        <td className="px-3 py-3">
          <div className="font-semibold text-gray-900 text-sm leading-snug">{result.collegeName}</div>
          <div className="text-xs text-gray-400 mt-0.5">{result.collegeCode}</div>
        </td>
        <td className="px-3 py-3 text-sm text-gray-700">{result.branch}</td>
        <td className="px-3 py-3 text-sm text-right font-mono text-indigo-700 font-semibold">
          {formatRank(result.cutoffRank)}
        </td>
        <td className="px-3 py-3 text-sm text-right font-mono">
          {diff !== null ? (
            <span className={diff >= 0 ? "text-emerald-700 font-semibold" : "text-red-700 font-semibold"}>
              {diff >= 0 ? "+" : ""}{formatRank(Math.abs(diff))}
            </span>
          ) : "—"}
        </td>
        <td className="px-3 py-3 text-sm text-right font-mono">
          {result.marginPercent !== null ? (
            <span className={
              result.marginPercent >= 35 ? "text-emerald-700 font-semibold" :
              result.marginPercent >= 20 ? "text-blue-700" :
              result.marginPercent >= 10 ? "text-amber-700" :
              "text-red-700"
            }>
              {formatPercent(result.marginPercent)}
            </span>
          ) : "—"}
        </td>
        <td className="px-3 py-3">
          <ChanceBadge chance={result.chance} size="sm" />
        </td>
        <td className="px-3 py-3 text-center">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="text-indigo-500 hover:text-indigo-700 text-xs"
            aria-label={`${isExpanded ? "Collapse" : "Expand"} details for ${result.collegeName}`}
          >
            {isExpanded ? "▲" : "▼"}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-indigo-50/30">
          <td colSpan={8} className="px-5 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <p className="text-xs text-gray-500">College Code</p>
                <p className="font-medium">{result.collegeCode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Category Used</p>
                <p className="font-medium">{result.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Seat Type</p>
                <p className="font-medium">{result.seatType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data Round</p>
                <p className="font-medium">{result.dataRound}</p>
              </div>
              {result.rkPdfPage && (
                <div>
                  <p className="text-xs text-gray-500">RK PDF Page</p>
                  <p className="font-medium">Page {result.rkPdfPage}</p>
                </div>
              )}
              {result.hPdfPage && (
                <div>
                  <p className="text-xs text-gray-500">371(J) PDF Page</p>
                  <p className="font-medium">Page {result.hPdfPage}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Chance is estimated by comparing your predicted rank with the KEA cutoff in {result.dataRound}.
              It is not an official KEA probability or admission guarantee. Source: {result.dataSource}.
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Desktop table
// ---------------------------------------------------------------------------

function DesktopTable({ results }: { results: CollegeResult[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (results.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[820px]">
        <thead>
          <tr className="bg-indigo-600 text-white text-xs">
            <th className="px-3 py-3 text-center w-8">#</th>
            <th className="px-3 py-3">College</th>
            <th className="px-3 py-3">Branch</th>
            <th className="px-3 py-3 text-right">KEA Cutoff</th>
            <th className="px-3 py-3 text-right">Rank Diff</th>
            <th className="px-3 py-3 text-right">Margin %</th>
            <th className="px-3 py-3">Chance</th>
            <th className="px-3 py-3 w-8"></th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {results.map((r, i) => (
            <TableRow
              key={`${r.collegeCode}-${r.branch}`}
              result={r}
              isExpanded={expandedIdx === i}
              onToggle={() => setExpandedIdx((p) => (p === i ? null : i))}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// One complete section (above or below)
// ---------------------------------------------------------------------------

function ResultSection({
  results,
  title,
  subtitle,
  count,
  colorClass,
  icon,
  emptyMessage,
}: {
  results: CollegeResult[];
  title: string;
  subtitle: string;
  count: number;
  colorClass: string;
  icon: string;
  emptyMessage: string;
}) {
  return (
    <div className="mb-10">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        count={count}
        colorClass={colorClass}
        icon={icon}
      />

      {results.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-gray-200 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-4">
            {results.map((r) => (
              <KcetResultCard key={`${r.collegeCode}-${r.branch}`} result={r} />
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <DesktopTable results={results} />
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function KcetResultTable({
  splitResults,
  totalLoadedRows,
  categoryUsed,
  seatType,
  estimatedRank,
}: KcetResultTableProps) {
  const { above, below, totalMatched } = splitResults;

  if (totalMatched === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-3xl mb-3">🔍</p>
        <p className="text-gray-700 font-semibold">No colleges found for this category.</p>
        <p className="text-sm text-gray-500 mt-2">
          The KEA dataset has no cutoff values for <strong>{categoryUsed}</strong>.
          Try a different category.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Category: <span className="text-indigo-700">{categoryUsed}</span>
            <span className="text-gray-400 font-normal ml-2">({seatType})</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Your estimated rank: <strong className="text-gray-900">~{formatRank(estimatedRank)}</strong>
            {" · "}Dataset: {totalLoadedRows.toLocaleString("en-IN")} rows
            {" · "}Matched: {totalMatched.toLocaleString("en-IN")} colleges
          </p>
        </div>
        <p className="text-xs text-gray-400 italic sm:text-right">
          Cutoff = KEA Third Round cutoff rank. Not an opening rank.
        </p>
      </div>

      {/* ABOVE section — harder colleges */}
      <ResultSection
        results={above}
        title="Colleges Above Your Rank"
        subtitle={`These ${above.length} colleges had a cutoff rank LOWER than ~${formatRank(estimatedRank)} — harder to get. Ranked closest first.`}
        count={above.length}
        colorClass="border-red-300 bg-red-50 text-red-900"
        icon="🔴"
        emptyMessage="No colleges found with a cutoff rank below your estimated rank in this category."
      />

      {/* BELOW section — safer colleges */}
      <ResultSection
        results={below}
        title="Colleges Below Your Rank"
        subtitle={`These ${below.length} colleges had a cutoff rank HIGHER than ~${formatRank(estimatedRank)} — you have a good chance. Ranked closest first.`}
        count={below.length}
        colorClass="border-emerald-300 bg-emerald-50 text-emerald-900"
        icon="🟢"
        emptyMessage="No colleges found with a cutoff rank above your estimated rank in this category."
      />

      {/* Disclaimer */}
      <div className="mt-4 bg-gray-50 rounded-2xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Disclaimer:</strong> Chance labels (Guaranteed, Possible, May Be, Very Hard) and the
          above/below split are based on comparing your estimated rank (derived from historical 2025
          score-to-rank data) with the KEA cutoff rank from the UGCET 2026 Third Round Provisional
          Allotment. These are NOT official KEA admission probabilities or guarantees.
          Data source: <strong>Karnataka Examinations Authority (KEA)</strong>.
          No third-party cutoff data is used.
        </p>
      </div>
    </div>
  );
}
