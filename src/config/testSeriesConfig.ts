/**
 * testSeriesConfig.ts
 *
 * Central configuration for Physics Pep Talk Subject-Wise Online Test Series.
 *
 * Google Spreadsheet:
 *   ID: 14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg
 *
 * Subject Tab Configuration & GID Verification:
 *   - Physics:     GID 396482003  (Verified from live Google Sheets tab metadata)
 *   - Chemistry:   GID 338371251  (Verified)
 *   - Mathematics: GID 742477729  (Verified)
 *   - Biology:     GID 1456450225 (Verified)
 *
 * CONFIGURATION FLAG NOTICE:
 *   The original prompt listed Physics and Biology as both having GID 1456450225.
 *   Live inspection of the Google Spreadsheet confirmed that GID 1456450225 is
 *   the "Biology" tab, whereas the "physics" tab has GID 396482003.
 *   This file uses the verified GIDs so that each subject correctly accesses its
 *   own dedicated questions.
 */

export type SubjectId = "physics" | "chemistry" | "maths" | "bio";

export interface SubjectConfig {
  id: SubjectId;
  name: string;
  shortName: string;
  route: string;
  sheetGid: string;
  tabName: string;
  themeColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  iconName: "atom" | "flask" | "function" | "dna";
  tagline: string;
  description: string;
  defaultTimeMinutes: number;
  marksPerQuestion: number;
  negativeMarksPerQuestion: number;
  defaultTopics: string[];
}

export const SPREADSHEET_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_PUC_SPREADSHEET_ID) ||
  "14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg";

/**
 * Optional Google Apps Script API endpoint.
 * When deployed and configured, all question fetches and answer evaluations
 * route through this API to ensure cheat-proof server-side answer evaluation.
 */
export const APPS_SCRIPT_API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_TEST_API_URL) || "";

export const SUBJECT_CONFIGS: Record<SubjectId, SubjectConfig> = {
  physics: {
    id: "physics",
    name: "Physics",
    shortName: "PHY",
    route: "/test/physics",
    sheetGid:
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_PHYSICS_SHEET_GID) ||
      "396482003",
    tabName: "physics",
    themeColor: "#0056D2", // Coursera / Pep Talk Blue
    borderColor: "border-blue-500",
    badgeBg: "bg-blue-100 text-blue-800",
    badgeText: "PUC & KCET Physics",
    iconName: "atom",
    tagline: "Master Mechanics, Electromagnetism, Optics & Modern Physics",
    description:
      "Comprehensive chapter-wise and full-portion mock tests designed according to the Karnataka PUC Board blueprint and KCET / COMEDK exam pattern.",
    defaultTimeMinutes: 30,
    marksPerQuestion: 1,
    negativeMarksPerQuestion: 0,
    defaultTopics: [
      "Electric Charges & Fields",
      "Current Electricity",
      "Moving Charges & Magnetism",
      "Ray & Wave Optics",
      "Dual Nature of Radiation",
      "Semiconductors",
    ],
  },
  chemistry: {
    id: "chemistry",
    name: "Chemistry",
    shortName: "CHEM",
    route: "/test/chemistry",
    sheetGid:
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_CHEMISTRY_SHEET_GID) ||
      "338371251",
    tabName: "chemistry",
    themeColor: "#0D9488", // Teal
    borderColor: "border-teal-500",
    badgeBg: "bg-teal-100 text-teal-800",
    badgeText: "PUC & KCET Chemistry",
    iconName: "flask",
    tagline: "Solidify Physical, Inorganic & Organic Reaction Mechanisms",
    description:
      "Practice NCERT-aligned multiple choice questions covering Chemical Kinetics, Solutions, Coordination Compounds, and Key Organic Reactions.",
    defaultTimeMinutes: 30,
    marksPerQuestion: 1,
    negativeMarksPerQuestion: 0,
    defaultTopics: [
      "Solutions",
      "Electrochemistry",
      "Chemical Kinetics",
      "d and f Block Elements",
      "Coordination Compounds",
      "Haloalkanes & Haloarenes",
      "Alcohols, Phenols & Ethers",
    ],
  },
  maths: {
    id: "maths",
    name: "Mathematics",
    shortName: "MATH",
    route: "/test/maths",
    sheetGid:
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_MATHS_SHEET_GID) ||
      "742477729",
    tabName: "maths",
    themeColor: "#7C3AED", // Violet
    borderColor: "border-purple-500",
    badgeBg: "bg-purple-100 text-purple-800",
    badgeText: "PUC & KCET Mathematics",
    iconName: "function",
    tagline: "Sharpen Calculus, Vectors, Matrices & Probability Speed",
    description:
      "Step-by-step MCQ problem sets focusing on high-weightage topics: Integrals, Differential Equations, 3D Geometry, and Vectors.",
    defaultTimeMinutes: 30,
    marksPerQuestion: 1,
    negativeMarksPerQuestion: 0,
    defaultTopics: [
      "Matrices & Determinants",
      "Continuity & Differentiability",
      "Integrals",
      "Differential Equations",
      "Vector Algebra",
      "Three Dimensional Geometry",
      "Probability",
    ],
  },
  bio: {
    id: "bio",
    name: "Biology",
    shortName: "BIO",
    route: "/test/bio",
    sheetGid:
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_BIOLOGY_SHEET_GID) ||
      "1456450225",
    tabName: "Biology",
    themeColor: "#16A34A", // Emerald green
    borderColor: "border-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-800",
    badgeText: "PUC & KCET Biology",
    iconName: "dna",
    tagline: "Comprehensive NCERT Biology Drills & NEET / KCET Practice",
    description:
      "High-yield diagram-based and conceptual MCQs across Genetics, Biotechnology, Human Health, Reproduction, and Ecology.",
    defaultTimeMinutes: 30,
    marksPerQuestion: 1,
    negativeMarksPerQuestion: 0,
    defaultTopics: [
      "Sexual Reproduction in Flowering Plants",
      "Human Reproduction",
      "Principles of Inheritance & Variation",
      "Molecular Basis of Inheritance",
      "Biotechnology: Principles & Processes",
      "Organisms and Populations",
    ],
  },
};

export const SUBJECT_ORDER: SubjectId[] = ["physics", "chemistry", "maths", "bio"];

export function getSubjectConfig(subjectOrRoute: string): SubjectConfig | undefined {
  const clean = subjectOrRoute.toLowerCase().replace(/^\/test\/?/, "").replace(/\/+$/, "");
  if (clean === "physics" || clean === "phy") return SUBJECT_CONFIGS.physics;
  if (clean === "chemistry" || clean === "chem") return SUBJECT_CONFIGS.chemistry;
  if (clean === "maths" || clean === "math" || clean === "mathematics") return SUBJECT_CONFIGS.maths;
  if (clean === "bio" || clean === "biology") return SUBJECT_CONFIGS.bio;
  return undefined;
}
