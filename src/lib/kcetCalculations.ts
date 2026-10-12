/**
 * KCET Pure Calculation Library
 *
 * All functions are pure (no side effects, no external data).
 * Engineering (PCM) and Biology (PCMB) are strictly separated —
 * Biology values MUST NOT appear in the Engineering calculation path.
 *
 * Source: Karnataka Examinations Authority (KEA) official formula
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EngineeringPCMInput {
  pucPhysics: number;
  pucChemistry: number;
  pucMathematics: number;
  kcetPhysics: number;
  kcetChemistry: number;
  kcetMathematics: number;
}

export interface EngineeringPCMResult {
  pucPcmTotal: number;
  pucPcmPercent: number;
  kcetPcmTotal: number;
  kcetPcmPercent: number;
  engineeringCompositePercent: number;
}

export interface PCMBInput {
  pucPhysics: number;
  pucChemistry: number;
  pucMathematics: number;
  pucBiology: number;
  kcetPhysics: number;
  kcetChemistry: number;
  kcetMathematics: number;
  kcetBiology: number;
}

export interface PCMBResult {
  pucPcmbTotal: number;
  pucPcmbPercent: number;
  kcetPcmbTotal: number;
  kcetPcmbPercent: number;
  pcmbCompositePercent: number;
}

export type ChanceLabel = "Very Hard" | "May Be" | "Possible" | "Guaranteed";

export interface ChanceResult {
  rankDifference: number;    // cutoffRank - predictedRank; positive means student is better
  marginPercent: number;     // (rankDifference / cutoffRank) * 100
  chance: ChanceLabel;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Returns an error message string if marks are invalid, or null if valid.
 */
export function validatePUCMark(value: number, subject: string): string | null {
  if (!Number.isFinite(value)) return `${subject}: must be a number`;
  if (value < 0) return `${subject}: cannot be negative`;
  if (value > 100) return `${subject}: cannot exceed 100`;
  return null;
}

export function validateKCETMark(value: number, subject: string): string | null {
  if (!Number.isFinite(value)) return `${subject}: must be a number`;
  if (value < 0) return `${subject}: cannot be negative`;
  if (value > 60) return `${subject}: cannot exceed 60`;
  return null;
}

/**
 * Validate all Engineering PCM inputs.
 * Returns array of error messages (empty if valid).
 */
export function validateEngineeringInputs(input: EngineeringPCMInput): string[] {
  const errors: string[] = [];

  const pucChecks: Array<[number, string]> = [
    [input.pucPhysics, "PUC Physics"],
    [input.pucChemistry, "PUC Chemistry"],
    [input.pucMathematics, "PUC Mathematics"],
  ];
  for (const [val, name] of pucChecks) {
    const err = validatePUCMark(val, name);
    if (err) errors.push(err);
  }

  const kcetChecks: Array<[number, string]> = [
    [input.kcetPhysics, "KCET Physics"],
    [input.kcetChemistry, "KCET Chemistry"],
    [input.kcetMathematics, "KCET Mathematics"],
  ];
  for (const [val, name] of kcetChecks) {
    const err = validateKCETMark(val, name);
    if (err) errors.push(err);
  }

  return errors;
}

/**
 * Validate all PCMB inputs.
 * Returns array of error messages (empty if valid).
 */
export function validatePCMBInputs(input: PCMBInput): string[] {
  const errors: string[] = [];

  const pucChecks: Array<[number, string]> = [
    [input.pucPhysics, "PUC Physics"],
    [input.pucChemistry, "PUC Chemistry"],
    [input.pucMathematics, "PUC Mathematics"],
    [input.pucBiology, "PUC Biology"],
  ];
  for (const [val, name] of pucChecks) {
    const err = validatePUCMark(val, name);
    if (err) errors.push(err);
  }

  const kcetChecks: Array<[number, string]> = [
    [input.kcetPhysics, "KCET Physics"],
    [input.kcetChemistry, "KCET Chemistry"],
    [input.kcetMathematics, "KCET Mathematics"],
    [input.kcetBiology, "KCET Biology"],
  ];
  for (const [val, name] of kcetChecks) {
    const err = validateKCETMark(val, name);
    if (err) errors.push(err);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Engineering PCM Composite Calculation
// CRITICAL: This function has NO biology parameter.
//           Biology MUST NOT influence this result.
// ---------------------------------------------------------------------------

/**
 * Calculate the Engineering PCM composite merit percentage.
 *
 * Formula (official KEA):
 *   Step 1: pucPcmTotal = pucPhysics + pucChemistry + pucMathematics
 *   Step 2: pucPcmPercent = (pucPcmTotal / 300) * 100
 *   Step 3: kcetPcmTotal = kcetPhysics + kcetChemistry + kcetMathematics
 *   Step 4: kcetPcmPercent = (kcetPcmTotal / 180) * 100
 *   Step 5: engineeringCompositePercent = (pucPcmPercent + kcetPcmPercent) / 2
 *
 * This produces the student's composite merit score for Engineering.
 * It does NOT produce an official KEA rank — that requires an empirical
 * candidate-level marks/rank dataset.
 */
export function calculateEngineeringPCM(
  input: EngineeringPCMInput
): EngineeringPCMResult {
  const {
    pucPhysics,
    pucChemistry,
    pucMathematics,
    kcetPhysics,
    kcetChemistry,
    kcetMathematics,
  } = input;

  // Step 1 & 2: PUC PCM
  const pucPcmTotal = pucPhysics + pucChemistry + pucMathematics;
  const pucPcmPercent = (pucPcmTotal / 300) * 100;

  // Step 3 & 4: KCET PCM
  const kcetPcmTotal = kcetPhysics + kcetChemistry + kcetMathematics;
  const kcetPcmPercent = (kcetPcmTotal / 180) * 100;

  // Step 5: Engineering composite
  const engineeringCompositePercent = (pucPcmPercent + kcetPcmPercent) / 2;

  return {
    pucPcmTotal,
    pucPcmPercent,
    kcetPcmTotal,
    kcetPcmPercent,
    engineeringCompositePercent,
  };
}

// ---------------------------------------------------------------------------
// PCMB Composite Calculation (SEPARATE from Engineering)
// Biology is only used here.
// ---------------------------------------------------------------------------

/**
 * Calculate the PCMB composite merit percentage.
 *
 * COMPLETELY SEPARATE from Engineering calculation.
 * Changing Biology values here has zero effect on Engineering composite.
 */
export function calculatePCMB(input: PCMBInput): PCMBResult {
  const {
    pucPhysics,
    pucChemistry,
    pucMathematics,
    pucBiology,
    kcetPhysics,
    kcetChemistry,
    kcetMathematics,
    kcetBiology,
  } = input;

  // PUC PCMB
  const pucPcmbTotal = pucPhysics + pucChemistry + pucMathematics + pucBiology;
  const pucPcmbPercent = (pucPcmbTotal / 400) * 100;

  // KCET PCMB
  const kcetPcmbTotal =
    kcetPhysics + kcetChemistry + kcetMathematics + kcetBiology;
  const kcetPcmbPercent = (kcetPcmbTotal / 240) * 100;

  // PCMB composite
  const pcmbCompositePercent = (pucPcmbPercent + kcetPcmbPercent) / 2;

  return {
    pucPcmbTotal,
    pucPcmbPercent,
    kcetPcmbTotal,
    kcetPcmbPercent,
    pcmbCompositePercent,
  };
}

// ---------------------------------------------------------------------------
// Chance Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the admission chance for a given college cutoff vs predicted rank.
 *
 * IMPORTANT: Lower KCET rank = better.
 *   - If predictedRank < cutoffRank: student is better ranked → positive margin
 *   - If predictedRank > cutoffRank: student is worse ranked → negative margin
 *
 * Chance bands (product heuristic, NOT official KEA probability):
 *   marginPercent < 10     → "Very Hard"
 *   10  <= margin < 20     → "May Be"
 *   20  <= margin < 35     → "Possible"
 *   margin >= 35           → "Guaranteed"
 *
 * Returns null if inputs are invalid.
 */
export function calculateChance(params: {
  predictedRank: number;
  cutoffRank: number;
}): ChanceResult | null {
  const { predictedRank, cutoffRank } = params;

  if (
    !Number.isFinite(predictedRank) ||
    !Number.isFinite(cutoffRank) ||
    cutoffRank <= 0
  ) {
    return null;
  }

  // rankDifference > 0 means student is better ranked than cutoff
  const rankDifference = cutoffRank - predictedRank;
  const marginPercent = (rankDifference / cutoffRank) * 100;

  let chance: ChanceLabel;
  if (marginPercent < 10) {
    chance = "Very Hard";
  } else if (marginPercent < 20) {
    chance = "May Be";
  } else if (marginPercent < 35) {
    chance = "Possible";
  } else {
    chance = "Guaranteed";
  }

  return {
    rankDifference,
    marginPercent,
    chance,
  };
}

// ---------------------------------------------------------------------------
// Round number formatting helpers
// ---------------------------------------------------------------------------

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatPercent(value: number, decimals = 2): string {
  return `${roundTo(value, decimals).toFixed(decimals)}%`;
}

export function formatRank(rank: number): string {
  return rank.toLocaleString("en-IN");
}
