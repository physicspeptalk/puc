/**
 * KCET Rank Estimation Service
 *
 * Estimates a student's KCET Engineering rank from their composite merit score
 * using historical 2025 score-to-rank data and linear interpolation.
 *
 * DATA SOURCE: Historical KCET 2025 composite score → rank calibration points.
 * This is NOT an official KEA rank. It is an estimate based on 2025 data.
 *
 * Architecture:
 *   calculateEngineeringPCM()       → compositeScore
 *           ↓
 *   predictEngineeringRank()        → estimatedRank (this file)
 *           ↓
 *   filterAndRankColleges()         → 25-above + 25-below split
 */

// ---------------------------------------------------------------------------
// Historical 2025 Composite Score → Rank Map
// DO NOT modify these values.
// ---------------------------------------------------------------------------

const KCET_2025_COMPOSITE_RANK_MAP: Array<{ score: number; rank: number }> = [
  { score: 96.22, rank: 81 },
  { score: 94.06, rank: 308 },
  { score: 90.00, rank: 1245 },
  { score: 85.00, rank: 3804 },
  { score: 80.00, rank: 8500 },
  { score: 75.00, rank: 16000 },
  { score: 70.00, rank: 30000 },
  { score: 65.00, rank: 50000 },
  { score: 60.00, rank: 80000 },
  { score: 50.00, rank: 155000 },
  { score: 40.00, rank: 235000 },
  { score: 35.00, rank: 259000 },
];

// Pre-sort descending by score (highest score = lowest/best rank)
const SORTED_MAP = [...KCET_2025_COMPOSITE_RANK_MAP].sort(
  (a, b) => b.score - a.score
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RankPredictionResult {
  boardPCM: number;
  boardPCMPercent: number;
  kcetPCM: number;
  kcetPCMPercent: number;
  compositeScore: number;
  estimatedRank: number;
  isModelConnected: true;
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Core rank estimation function
// ---------------------------------------------------------------------------

/**
 * Estimate KCET Engineering rank from the composite merit score.
 *
 * Uses linear interpolation over the historical 2025 calibration map.
 * Does NOT extrapolate beyond the supplied range.
 *
 * @param compositeScore  Result from calculateEngineeringPCM().engineeringCompositePercent
 */
export function estimateRankFromComposite(compositeScore: number): number {
  // Cap at top of range
  if (compositeScore >= SORTED_MAP[0].score) {
    return SORTED_MAP[0].rank;
  }

  // Cap at bottom of range
  const last = SORTED_MAP[SORTED_MAP.length - 1];
  if (compositeScore <= last.score) {
    return last.rank;
  }

  // Linear interpolation between nearest two bracket points
  for (let i = 0; i < SORTED_MAP.length - 1; i++) {
    const upper = SORTED_MAP[i];
    const lower = SORTED_MAP[i + 1];

    if (compositeScore <= upper.score && compositeScore >= lower.score) {
      const ratio =
        (upper.score - compositeScore) / (upper.score - lower.score);

      const estimatedRank = upper.rank + ratio * (lower.rank - upper.rank);
      return Math.round(estimatedRank);
    }
  }

  // Should never reach here given the range checks above
  throw new Error("Unable to calculate estimated rank.");
}

/**
 * Full rank prediction entry point — accepts raw marks and returns all
 * intermediate values plus the estimated rank.
 *
 * Biology is NOT a parameter here. Engineering rank uses PCM only.
 */
export function predictEngineeringRank(params: {
  boardPhysics: number;
  boardChemistry: number;
  boardMathematics: number;
  kcetPhysics: number;
  kcetChemistry: number;
  kcetMathematics: number;
}): RankPredictionResult {
  const {
    boardPhysics,
    boardChemistry,
    boardMathematics,
    kcetPhysics,
    kcetChemistry,
    kcetMathematics,
  } = params;

  // Board PCM
  const boardPCM = boardPhysics + boardChemistry + boardMathematics;
  const boardPCMPercent = (boardPCM / 300) * 100;

  // KCET PCM
  const kcetPCM = kcetPhysics + kcetChemistry + kcetMathematics;
  const kcetPCMPercent = (kcetPCM / 180) * 100;

  // 50:50 composite
  const compositeScore = (boardPCMPercent + kcetPCMPercent) / 2;

  const estimatedRank = estimateRankFromComposite(compositeScore);

  return {
    boardPCM,
    boardPCMPercent,
    kcetPCM,
    kcetPCMPercent,
    compositeScore,
    estimatedRank,
    isModelConnected: true,
    disclaimer:
      "Estimated using historical 2025 score-to-rank data. This is NOT an official KEA rank.",
  };
}

/** Whether the rank model is operational (always true now). */
export const RANK_MODEL_CONNECTED = true;
