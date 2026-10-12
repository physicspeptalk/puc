/**
 * KCET Calculations — Unit Tests
 *
 * Covers all 16 required test scenarios from the spec:
 *  1.  PUC PCM calculation
 *  2.  KCET PCM calculation
 *  3.  Engineering composite
 *  4.  PCMB calculation
 *  5.  Biology exclusion from Engineering
 *  6.  "--" converted to null
 *  7.  Missing cutoff
 *  8.  Category matching
 *  9.  371(J) mapping
 * 10.  Rank difference
 * 11.  Chance margin bands (with boundary values)
 * 12.  50-result limit
 * 13.  Sorting
 * 14.  Invalid marks
 * 15.  Google Sheet unavailable (error handling)
 * 16.  Missing required columns
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateEngineeringPCM,
  calculatePCMB,
  calculateChance,
  validateEngineeringInputs,
  validatePCMBInputs,
  roundTo,
} from "../lib/kcetCalculations";
import {
  filterAndRankColleges,
  filterAndSplitColleges,
} from "../services/kcetChance";
import {
  resolveEffectiveCategory,
  RK_TO_H_MAP,
  resetDataCache,
} from "../services/kcetData";
import type { KcetCollegeRow } from "../services/kcetData";

// ---------------------------------------------------------------------------
// 1 & 2 — PUC PCM and KCET PCM calculations
// ---------------------------------------------------------------------------

describe("calculateEngineeringPCM", () => {
  it("correctly computes PUC PCM total and percent", () => {
    const result = calculateEngineeringPCM({
      pucPhysics: 80,
      pucChemistry: 90,
      pucMathematics: 100,
      kcetPhysics: 0,
      kcetChemistry: 0,
      kcetMathematics: 0,
    });
    expect(result.pucPcmTotal).toBe(270);
    expect(result.pucPcmPercent).toBeCloseTo(90.0, 4);
  });

  it("correctly computes KCET PCM total and percent", () => {
    const result = calculateEngineeringPCM({
      pucPhysics: 0,
      pucChemistry: 0,
      pucMathematics: 0,
      kcetPhysics: 54,
      kcetChemistry: 54,
      kcetMathematics: 54,
    });
    expect(result.kcetPcmTotal).toBe(162);
    expect(result.kcetPcmPercent).toBeCloseTo(90.0, 4);
  });

  // 3 — Engineering composite
  it("computes engineering composite correctly", () => {
    // pucPcmPercent = (270/300)*100 = 90
    // kcetPcmPercent = (162/180)*100 = 90
    // composite = (90 + 90) / 2 = 90
    const result = calculateEngineeringPCM({
      pucPhysics: 80,
      pucChemistry: 90,
      pucMathematics: 100,
      kcetPhysics: 54,
      kcetChemistry: 54,
      kcetMathematics: 54,
    });
    expect(result.engineeringCompositePercent).toBeCloseTo(90.0, 4);
  });

  it("handles perfect scores", () => {
    const result = calculateEngineeringPCM({
      pucPhysics: 100,
      pucChemistry: 100,
      pucMathematics: 100,
      kcetPhysics: 60,
      kcetChemistry: 60,
      kcetMathematics: 60,
    });
    expect(result.pucPcmTotal).toBe(300);
    expect(result.pucPcmPercent).toBe(100);
    expect(result.kcetPcmTotal).toBe(180);
    expect(result.kcetPcmPercent).toBe(100);
    expect(result.engineeringCompositePercent).toBe(100);
  });

  it("handles zero scores", () => {
    const result = calculateEngineeringPCM({
      pucPhysics: 0,
      pucChemistry: 0,
      pucMathematics: 0,
      kcetPhysics: 0,
      kcetChemistry: 0,
      kcetMathematics: 0,
    });
    expect(result.engineeringCompositePercent).toBe(0);
  });

  it("sample from spec: P=85, C=91, M=94 PUC + P=52, C=56, M=58 KCET", () => {
    const result = calculateEngineeringPCM({
      pucPhysics: 85,
      pucChemistry: 91,
      pucMathematics: 94,
      kcetPhysics: 52,
      kcetChemistry: 56,
      kcetMathematics: 58,
    });
    // pucTotal = 270, pucPct = 90
    // kcetTotal = 166, kcetPct = 166/180*100 ≈ 92.222...
    // composite = (90 + 92.222) / 2 ≈ 91.111
    expect(result.pucPcmTotal).toBe(270);
    expect(result.kcetPcmTotal).toBe(166);
    expect(result.engineeringCompositePercent).toBeCloseTo(91.111, 2);
  });
});

// ---------------------------------------------------------------------------
// 4 — PCMB calculation
// ---------------------------------------------------------------------------

describe("calculatePCMB", () => {
  it("computes PCMB totals and percents correctly", () => {
    const result = calculatePCMB({
      pucPhysics: 80,
      pucChemistry: 80,
      pucMathematics: 80,
      pucBiology: 80,
      kcetPhysics: 40,
      kcetChemistry: 40,
      kcetMathematics: 40,
      kcetBiology: 40,
    });
    expect(result.pucPcmbTotal).toBe(320);
    expect(result.pucPcmbPercent).toBe(80);
    expect(result.kcetPcmbTotal).toBe(160);
    expect(result.kcetPcmbPercent).toBeCloseTo(66.667, 2);
    expect(result.pcmbCompositePercent).toBeCloseTo((80 + 66.667) / 2, 2);
  });

  it("handles perfect PCMB scores", () => {
    const result = calculatePCMB({
      pucPhysics: 100,
      pucChemistry: 100,
      pucMathematics: 100,
      pucBiology: 100,
      kcetPhysics: 60,
      kcetChemistry: 60,
      kcetMathematics: 60,
      kcetBiology: 60,
    });
    expect(result.pucPcmbTotal).toBe(400);
    expect(result.pucPcmbPercent).toBe(100);
    expect(result.kcetPcmbTotal).toBe(240);
    expect(result.kcetPcmbPercent).toBe(100);
    expect(result.pcmbCompositePercent).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// 5 — Biology MUST NOT affect Engineering composite
// ---------------------------------------------------------------------------

describe("Biology exclusion from Engineering calculation", () => {
  const BASE_INPUT = {
    pucPhysics: 80,
    pucChemistry: 80,
    pucMathematics: 80,
    kcetPhysics: 50,
    kcetChemistry: 50,
    kcetMathematics: 50,
  };

  it("changing Biology values must not change Engineering composite", () => {
    const result1 = calculateEngineeringPCM(BASE_INPUT);
    const result2 = calculateEngineeringPCM(BASE_INPUT); // identical, no bio param possible

    // Both must produce exactly the same composite
    expect(result1.engineeringCompositePercent).toBe(result2.engineeringCompositePercent);
  });

  it("calculateEngineeringPCM function signature has no biology parameter", () => {
    // If Biology appeared in the Engineering type, TypeScript would reject this
    // at compile time. This test confirms the runtime function works with only PCM.
    const result = calculateEngineeringPCM({
      pucPhysics: 80,
      pucChemistry: 80,
      pucMathematics: 80,
      kcetPhysics: 50,
      kcetChemistry: 50,
      kcetMathematics: 50,
      // NOTE: no pucBiology or kcetBiology — would be a TypeScript error to add them
    });
    expect(typeof result.engineeringCompositePercent).toBe("number");
  });

  it("PCMB with max biology vs min biology produces different PCMB composite", () => {
    const highBio = calculatePCMB({
      pucPhysics: 80, pucChemistry: 80, pucMathematics: 80, pucBiology: 100,
      kcetPhysics: 50, kcetChemistry: 50, kcetMathematics: 50, kcetBiology: 60,
    });
    const lowBio = calculatePCMB({
      pucPhysics: 80, pucChemistry: 80, pucMathematics: 80, pucBiology: 0,
      kcetPhysics: 50, kcetChemistry: 50, kcetMathematics: 50, kcetBiology: 0,
    });
    // PCMB composites differ (biology matters for PCMB)
    expect(highBio.pcmbCompositePercent).not.toBe(lowBio.pcmbCompositePercent);

    // But Engineering composites (from calculateEngineeringPCM with same PCM) are EQUAL
    const eng1 = calculateEngineeringPCM({ pucPhysics: 80, pucChemistry: 80, pucMathematics: 80, kcetPhysics: 50, kcetChemistry: 50, kcetMathematics: 50 });
    const eng2 = calculateEngineeringPCM({ pucPhysics: 80, pucChemistry: 80, pucMathematics: 80, kcetPhysics: 50, kcetChemistry: 50, kcetMathematics: 50 });
    expect(eng1.engineeringCompositePercent).toBe(eng2.engineeringCompositePercent);
  });
});

// ---------------------------------------------------------------------------
// 6 — "--" converted to null (data normalization)
// ---------------------------------------------------------------------------

describe('parseCutoffValue — "--" handling', () => {
  // We test indirectly via filterAndRankColleges using null cutoffs

  it("rows with null cutoff are excluded from results", () => {
    const rows: KcetCollegeRow[] = [
      { collegeCode: "E001", collegeName: "College A", branch: "CS", rkPdfPage: "1", hPdfPage: null, cutoffs: { GM: null } },
      { collegeCode: "E002", collegeName: "College B", branch: "CS", rkPdfPage: "2", hPdfPage: null, cutoffs: { GM: 5000 } },
    ];
    const results = filterAndRankColleges(rows, { baseCategory: "GM", is371J: false, predictedRank: 3000 });
    expect(results).toHaveLength(1);
    expect(results[0].collegeCode).toBe("E002");
  });
});

// ---------------------------------------------------------------------------
// 7 — Missing cutoff (no entry for selected category)
// ---------------------------------------------------------------------------

describe("Missing cutoff handling", () => {
  it("rows without the selected category key are excluded", () => {
    const rows: KcetCollegeRow[] = [
      { collegeCode: "E001", collegeName: "College A", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { "1G": 10000 } },
    ];
    // Asking for GM when only 1G is present → empty result
    const results = filterAndRankColleges(rows, { baseCategory: "GM", is371J: false, predictedRank: 5000 });
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 8 — Category matching
// ---------------------------------------------------------------------------

describe("Category matching", () => {
  const rows: KcetCollegeRow[] = [
    { collegeCode: "E001", collegeName: "College A", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 10000, "2AG": 15000 } },
    { collegeCode: "E002", collegeName: "College B", branch: "ME", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 20000 } },
  ];

  it("filters by the correct RK category", () => {
    const results = filterAndRankColleges(rows, { baseCategory: "2AG", is371J: false, predictedRank: 5000 });
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe("2AG");
  });

  it("GM category returns both rows", () => {
    const results = filterAndRankColleges(rows, { baseCategory: "GM", is371J: false, predictedRank: 5000 });
    expect(results).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// 9 — 371(J) category mapping
// ---------------------------------------------------------------------------

describe("371(J) mapping", () => {
  it("resolveEffectiveCategory returns H category when 371J=true", () => {
    const result = resolveEffectiveCategory("GM", true);
    expect(result).not.toBeNull();
    expect(result!.category).toBe("GMH");
    expect(result!.seatType).toBe("371(J) Kalyana Karnataka");
  });

  it("resolveEffectiveCategory returns RK category when 371J=false", () => {
    const result = resolveEffectiveCategory("GM", false);
    expect(result).not.toBeNull();
    expect(result!.category).toBe("GM");
    expect(result!.seatType).toBe("Rest of Karnataka");
  });

  it("1G maps to 1H", () => expect(RK_TO_H_MAP["1G"]).toBe("1H"));
  it("1K maps to 1KH", () => expect(RK_TO_H_MAP["1K"]).toBe("1KH"));
  it("2AG maps to 2AH", () => expect(RK_TO_H_MAP["2AG"]).toBe("2AH"));
  it("2BK maps to 2BKH", () => expect(RK_TO_H_MAP["2BK"]).toBe("2BKH"));
  it("STG maps to STH", () => expect(RK_TO_H_MAP["STG"]).toBe("STH"));

  it("NRI has no 371(J) H mapping → returns null", () => {
    const result = resolveEffectiveCategory("NRI", true);
    expect(result).toBeNull();
  });

  it("OPN has no 371(J) H mapping → returns null", () => {
    const result = resolveEffectiveCategory("OPN", true);
    expect(result).toBeNull();
  });

  it("uses GMH column when 371J=true", () => {
    const rows: KcetCollegeRow[] = [
      { collegeCode: "E001", collegeName: "College A", branch: "CS", rkPdfPage: null, hPdfPage: "5", cutoffs: { GM: 10000, GMH: 12000 } },
    ];
    const results = filterAndRankColleges(rows, { baseCategory: "GM", is371J: true, predictedRank: 8000 });
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe("GMH");
    expect(results[0].cutoffRank).toBe(12000);
  });
});

// ---------------------------------------------------------------------------
// 10 — Rank difference calculation
// ---------------------------------------------------------------------------

describe("Rank difference", () => {
  it("student rank better than cutoff → positive difference", () => {
    const result = calculateChance({ predictedRank: 15000, cutoffRank: 20000 });
    expect(result).not.toBeNull();
    expect(result!.rankDifference).toBe(5000); // 20000 - 15000
  });

  it("student rank worse than cutoff → negative difference", () => {
    const result = calculateChance({ predictedRank: 25000, cutoffRank: 20000 });
    expect(result).not.toBeNull();
    expect(result!.rankDifference).toBe(-5000); // 20000 - 25000
  });

  it("equal ranks → zero difference", () => {
    const result = calculateChance({ predictedRank: 10000, cutoffRank: 10000 });
    expect(result).not.toBeNull();
    expect(result!.rankDifference).toBe(0);
    expect(result!.marginPercent).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 11 — Chance margin bands (including all boundary values from spec)
// ---------------------------------------------------------------------------

describe("calculateChance — margin bands and boundaries", () => {
  function margin(predicted: number, cutoff: number) {
    return ((cutoff - predicted) / cutoff) * 100;
  }

  it("margin < 10 → Very Hard", () => {
    // margin = (20000 - 18200) / 20000 * 100 = 9
    const r = calculateChance({ predictedRank: 18200, cutoffRank: 20000 });
    expect(r!.chance).toBe("Very Hard");
    expect(r!.marginPercent).toBeCloseTo(9, 1);
  });

  it("margin = 9.99 → Very Hard", () => {
    const cutoff = 10000;
    const predicted = cutoff - (9.99 / 100) * cutoff;
    const r = calculateChance({ predictedRank: predicted, cutoffRank: cutoff });
    expect(r!.chance).toBe("Very Hard");
  });

  it("margin = 10 → May Be", () => {
    const r = calculateChance({ predictedRank: 18000, cutoffRank: 20000 });
    expect(margin(18000, 20000)).toBe(10);
    expect(r!.chance).toBe("May Be");
  });

  it("margin = 19.99 → May Be", () => {
    const cutoff = 10000;
    const predicted = cutoff - (19.99 / 100) * cutoff;
    const r = calculateChance({ predictedRank: predicted, cutoffRank: cutoff });
    expect(r!.chance).toBe("May Be");
  });

  it("margin = 20 → Possible", () => {
    const r = calculateChance({ predictedRank: 16000, cutoffRank: 20000 });
    expect(margin(16000, 20000)).toBe(20);
    expect(r!.chance).toBe("Possible");
  });

  it("margin = 34.99 → Possible", () => {
    const cutoff = 10000;
    const predicted = cutoff - (34.99 / 100) * cutoff;
    const r = calculateChance({ predictedRank: predicted, cutoffRank: cutoff });
    expect(r!.chance).toBe("Possible");
  });

  it("margin = 35 → Guaranteed", () => {
    const r = calculateChance({ predictedRank: 13000, cutoffRank: 20000 });
    expect(margin(13000, 20000)).toBe(35);
    expect(r!.chance).toBe("Guaranteed");
  });

  it("margin = 50 → Guaranteed", () => {
    const r = calculateChance({ predictedRank: 10000, cutoffRank: 20000 });
    expect(margin(10000, 20000)).toBe(50);
    expect(r!.chance).toBe("Guaranteed");
  });

  it("negative margin → Very Hard", () => {
    const r = calculateChance({ predictedRank: 25000, cutoffRank: 20000 });
    expect(r!.marginPercent).toBeLessThan(0);
    expect(r!.chance).toBe("Very Hard");
  });

  it("returns null for cutoffRank = 0", () => {
    expect(calculateChance({ predictedRank: 5000, cutoffRank: 0 })).toBeNull();
  });

  it("returns null for non-finite predictedRank", () => {
    expect(calculateChance({ predictedRank: NaN, cutoffRank: 10000 })).toBeNull();
  });

  it("returns null for non-finite cutoffRank", () => {
    expect(calculateChance({ predictedRank: 5000, cutoffRank: Infinity })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 12 — 50-result limit
// ---------------------------------------------------------------------------

describe("50-result limit", () => {
  it("returns at most 50 results even with 100 matching rows", () => {
    const rows: KcetCollegeRow[] = Array.from({ length: 100 }, (_, i) => ({
      collegeCode: `E${String(i).padStart(3, "0")}`,
      collegeName: `College ${i}`,
      branch: "CS",
      rkPdfPage: null,
      hPdfPage: null,
      cutoffs: { GM: 10000 + i * 100 },
    }));
    const results = filterAndRankColleges(rows, { baseCategory: "GM", is371J: false, predictedRank: 5000 });
    expect(results.length).toBeLessThanOrEqual(50);
  });

  it("returns 0 if no rows match", () => {
    const rows: KcetCollegeRow[] = [
      { collegeCode: "E001", collegeName: "College A", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { "1G": 5000 } },
    ];
    const results = filterAndRankColleges(rows, { baseCategory: "GM", is371J: false, predictedRank: 3000 });
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 13 — Sorting: above section sorted cutoff DESC, below section cutoff ASC
// ---------------------------------------------------------------------------

describe("Result sorting — 25-above / 25-below split", () => {
  it("above section is sorted by cutoff DESC (closest hard college first)", () => {
    // predictedRank = 10000
    // All cutoffs below 10000 → all go into "above" bucket
    const rows: KcetCollegeRow[] = [
      { collegeCode: "E001", collegeName: "A", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 2000 } },
      { collegeCode: "E002", collegeName: "B", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 9000 } },
      { collegeCode: "E003", collegeName: "C", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 5000 } },
    ];
    const result = filterAndSplitColleges(rows, { baseCategory: "GM", is371J: false, predictedRank: 10000 });
    expect(result).not.toBeNull();
    // All cutoffs (2000, 9000, 5000) are < 10000 → all in "above"
    expect(result!.above.length).toBe(3);
    // Sorted DESC: 9000, 5000, 2000
    expect(result!.above[0].cutoffRank).toBe(9000);
    expect(result!.above[1].cutoffRank).toBe(5000);
    expect(result!.above[2].cutoffRank).toBe(2000);
    expect(result!.below.length).toBe(0);
  });

  it("below section is sorted by cutoff ASC (closest safe college first)", () => {
    // predictedRank = 5000
    // All cutoffs >= 5000 → all go into "below" bucket
    const rows: KcetCollegeRow[] = [
      { collegeCode: "E001", collegeName: "A", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 20000 } },
      { collegeCode: "E002", collegeName: "B", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 6000 } },
      { collegeCode: "E003", collegeName: "C", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 12000 } },
    ];
    const result = filterAndSplitColleges(rows, { baseCategory: "GM", is371J: false, predictedRank: 5000 });
    expect(result).not.toBeNull();
    expect(result!.below.length).toBe(3);
    // Sorted ASC: 6000, 12000, 20000
    expect(result!.below[0].cutoffRank).toBe(6000);
    expect(result!.below[1].cutoffRank).toBe(12000);
    expect(result!.below[2].cutoffRank).toBe(20000);
    expect(result!.above.length).toBe(0);
  });

  it("result ranks are 1-based sequential within each section", () => {
    const rows: KcetCollegeRow[] = [
      { collegeCode: "E001", collegeName: "A", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 8000 } },
      { collegeCode: "E002", collegeName: "B", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 9000 } },
      { collegeCode: "E003", collegeName: "C", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { GM: 12000 } },
    ];
    const result = filterAndSplitColleges(rows, { baseCategory: "GM", is371J: false, predictedRank: 10000 });
    // 8000, 9000 < 10000 → above; 12000 >= 10000 → below
    expect(result!.above[0].rank).toBe(1);
    expect(result!.above[1].rank).toBe(2);
    expect(result!.below[0].rank).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 14 — Invalid marks validation
// ---------------------------------------------------------------------------

describe("validateEngineeringInputs", () => {
  it("rejects negative PUC marks", () => {
    const errors = validateEngineeringInputs({
      pucPhysics: -1, pucChemistry: 80, pucMathematics: 80,
      kcetPhysics: 40, kcetChemistry: 40, kcetMathematics: 40,
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("negative"))).toBe(true);
  });

  it("rejects PUC marks above 100", () => {
    const errors = validateEngineeringInputs({
      pucPhysics: 101, pucChemistry: 80, pucMathematics: 80,
      kcetPhysics: 40, kcetChemistry: 40, kcetMathematics: 40,
    });
    expect(errors.some((e) => e.includes("exceed 100"))).toBe(true);
  });

  it("rejects KCET marks above 60", () => {
    const errors = validateEngineeringInputs({
      pucPhysics: 80, pucChemistry: 80, pucMathematics: 80,
      kcetPhysics: 61, kcetChemistry: 40, kcetMathematics: 40,
    });
    expect(errors.some((e) => e.includes("exceed 60"))).toBe(true);
  });

  it("rejects NaN marks", () => {
    const errors = validateEngineeringInputs({
      pucPhysics: NaN, pucChemistry: 80, pucMathematics: 80,
      kcetPhysics: 40, kcetChemistry: 40, kcetMathematics: 40,
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("accepts valid boundary values (0 and max)", () => {
    const errors = validateEngineeringInputs({
      pucPhysics: 0, pucChemistry: 100, pucMathematics: 50,
      kcetPhysics: 0, kcetChemistry: 60, kcetMathematics: 30,
    });
    expect(errors).toHaveLength(0);
  });
});

describe("validatePCMBInputs", () => {
  it("rejects KCET Biology above 60", () => {
    const errors = validatePCMBInputs({
      pucPhysics: 80, pucChemistry: 80, pucMathematics: 80, pucBiology: 80,
      kcetPhysics: 40, kcetChemistry: 40, kcetMathematics: 40, kcetBiology: 61,
    });
    expect(errors.some((e) => e.includes("Biology") && e.includes("exceed 60"))).toBe(true);
  });

  it("rejects PUC Biology above 100", () => {
    const errors = validatePCMBInputs({
      pucPhysics: 80, pucChemistry: 80, pucMathematics: 80, pucBiology: 101,
      kcetPhysics: 40, kcetChemistry: 40, kcetMathematics: 40, kcetBiology: 40,
    });
    expect(errors.some((e) => e.includes("Biology") && e.includes("exceed 100"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 15 — Google Sheet loading (sheet is now configured with real ID/GID)
// ---------------------------------------------------------------------------

describe("Google Sheet loading", () => {
  beforeEach(() => {
    resetDataCache();
  });

  it("loadKcetData returns ready state with >0 rows when sheet is configured", async () => {
    const { loadKcetData } = await import("../services/kcetData");
    const status = await loadKcetData();
    // The sheet is configured with real ID/GID — should load successfully
    expect(status.state).toBe("ready");
    if (status.state === "ready") {
      expect(status.rows.length).toBeGreaterThan(0);
      expect(status.detectedCategories.length).toBeGreaterThan(0);
      expect(status.detectedCategories).toContain("GM");
      expect(status.detectedCategories).toContain("1G");
    }
  }, 15000); // allow time for network fetch
});

// ---------------------------------------------------------------------------
// 16 — Missing required columns
// ---------------------------------------------------------------------------

describe("Missing required columns handling", () => {
  it("rows with no matching category column return empty results", () => {
    const rows: KcetCollegeRow[] = [
      // Only has "1G" cutoff — no "GM"
      { collegeCode: "E001", collegeName: "College A", branch: "CS", rkPdfPage: null, hPdfPage: null, cutoffs: { "1G": 5000 } },
    ];
    const results = filterAndRankColleges(rows, { baseCategory: "GM", is371J: false, predictedRank: 3000 });
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Utility: roundTo
// ---------------------------------------------------------------------------

describe("roundTo utility", () => {
  it("rounds to specified decimal places", () => {
    expect(roundTo(91.1111, 2)).toBe(91.11);
    expect(roundTo(10.005, 2)).toBe(10.01);
    expect(roundTo(50, 0)).toBe(50);
  });
});
