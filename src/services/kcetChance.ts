/**
 * KCET Chance Service
 *
 * Filters colleges by category + predicted rank, then splits into:
 *
 *   ABOVE (25 colleges):
 *     Cutoff rank < student's predicted rank
 *     → student is WORSE than the cutoff → harder to get
 *     → sorted by cutoff rank DESCENDING (closest hard first)
 *
 *   BELOW (25 colleges):
 *     Cutoff rank >= student's predicted rank
 *     → student is AT OR BETTER than the cutoff → more chance
 *     → sorted by cutoff rank ASCENDING (easiest first among reachable)
 *
 * Total: up to 50 results (25 + 25).
 *
 * "Above" means the cutoff rank number is lower (more competitive).
 * "Below" means the cutoff rank number is higher (less competitive / safer).
 *
 * Data source: KEA official dataset only. No unofficial cutoffs used.
 */

import type { KcetCollegeRow } from "./kcetData";
import { resolveEffectiveCategory } from "./kcetData";
import { calculateChance, type ChanceLabel } from "../lib/kcetCalculations";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollegeResult {
  rank: number;                 // 1-based position in its section (above or below)

  collegeCode: string;
  collegeName: string;
  branch: string;

  category: string;             // effective category used (RK or H)
  seatType: string;

  cutoffRank: number;
  predictedRank: number;
  rankDifference: number;       // cutoffRank - predictedRank
  marginPercent: number;        // (rankDifference / cutoffRank) * 100
  chance: ChanceLabel;

  section: "above" | "below";  // which section this result belongs to

  rkPdfPage: string | null;
  hPdfPage: string | null;

  dataRound: string;
  dataSource: string;
}

export interface SplitResults {
  above: CollegeResult[];   // up to 25: cutoff < predicted rank (harder)
  below: CollegeResult[];   // up to 25: cutoff >= predicted rank (safer)
  totalMatched: number;     // total rows with a non-null cutoff for this category
}

export interface FilterParams {
  baseCategory: string;
  is371J: boolean;
  predictedRank: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SECTION_SIZE = 25;
const DATA_ROUND = "UGCET 2026 Third Round";
const DATA_SOURCE = "Karnataka Examinations Authority (KEA)";

// ---------------------------------------------------------------------------
// Main filtering function
// ---------------------------------------------------------------------------

/**
 * Filter all college rows by category, then split into 25-above + 25-below
 * relative to the student's predicted rank.
 *
 * "Above" section: colleges whose KEA cutoff rank is LOWER than the student's
 *   predicted rank. These are competitive colleges the student may struggle to
 *   get. Sorted closest-to-rank first (cutoff descending).
 *
 * "Below" section: colleges whose KEA cutoff rank is HIGHER OR EQUAL to the
 *   student's predicted rank. These are colleges the student is likely to get.
 *   Sorted closest-to-rank first (cutoff ascending).
 */
export function filterAndSplitColleges(
  allRows: KcetCollegeRow[],
  params: FilterParams
): SplitResults | null {
  const { baseCategory, is371J, predictedRank } = params;

  const resolved = resolveEffectiveCategory(baseCategory, is371J);
  if (!resolved) return null;

  const { category, seatType } = resolved;

  const aboveCandidates: CollegeResult[] = [];
  const belowCandidates: CollegeResult[] = [];

  for (const row of allRows) {
    const cutoffRank = row.cutoffs[category];
    if (cutoffRank === null || cutoffRank === undefined) continue;

    const chanceResult = calculateChance({ predictedRank, cutoffRank });
    if (!chanceResult) continue;

    const entry: CollegeResult = {
      rank: 0,
      collegeCode: row.collegeCode,
      collegeName: row.collegeName,
      branch: row.branch,
      category,
      seatType,
      cutoffRank,
      predictedRank,
      rankDifference: chanceResult.rankDifference,
      marginPercent: chanceResult.marginPercent,
      chance: chanceResult.chance,
      section: cutoffRank < predictedRank ? "above" : "below",
      rkPdfPage: row.rkPdfPage,
      hPdfPage: row.hPdfPage,
      dataRound: DATA_ROUND,
      dataSource: DATA_SOURCE,
    };

    if (cutoffRank < predictedRank) {
      // Cutoff is harder than student's rank (student is below the cutoff)
      aboveCandidates.push(entry);
    } else {
      // Cutoff is at/easier than student's rank (student meets or beats it)
      belowCandidates.push(entry);
    }
  }

  const totalMatched = aboveCandidates.length + belowCandidates.length;

  // Sort ABOVE: cutoff descending → closest hard colleges first (rank just above yours)
  aboveCandidates.sort((a, b) => {
    if (b.cutoffRank !== a.cutoffRank) return b.cutoffRank - a.cutoffRank;
    return a.collegeName.localeCompare(b.collegeName);
  });

  // Sort BELOW: cutoff ascending → closest safe colleges first (rank just below yours)
  belowCandidates.sort((a, b) => {
    if (a.cutoffRank !== b.cutoffRank) return a.cutoffRank - b.cutoffRank;
    return a.collegeName.localeCompare(b.collegeName);
  });

  // Take top 25 from each section and assign 1-based ranks
  const above = aboveCandidates.slice(0, SECTION_SIZE).map((r, i) => ({
    ...r,
    rank: i + 1,
  }));

  const below = belowCandidates.slice(0, SECTION_SIZE).map((r, i) => ({
    ...r,
    rank: i + 1,
  }));

  return { above, below, totalMatched };
}

// ---------------------------------------------------------------------------
// Legacy flat list (kept for any callers that use the old API)
// ---------------------------------------------------------------------------

/** @deprecated Use filterAndSplitColleges instead */
export function filterAndRankColleges(
  allRows: KcetCollegeRow[],
  params: FilterParams
): CollegeResult[] {
  const result = filterAndSplitColleges(allRows, params);
  if (!result) return [];
  return [...result.above, ...result.below];
}

export function countUsableCutoffs(
  rows: KcetCollegeRow[],
  category: string
): number {
  return rows.filter(
    (r) => r.cutoffs[category] !== null && r.cutoffs[category] !== undefined
  ).length;
}
