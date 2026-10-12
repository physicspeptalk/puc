/**
 * KcetPredictor — Main Page Component
 *
 * Flow:
 *   1. Load KEA cutoff data from Google Sheets
 *   2. Collect student marks via KcetInputForm
 *   3. Run predictEngineeringRank() → estimatedRank + composite
 *   4. Run filterAndSplitColleges() → 25 above + 25 below
 *   5. Display merit card + split result table
 *
 * Data source: Karnataka Examinations Authority (KEA)
 * Round: UGCET 2026 Third Round
 */

import { useEffect, useState, useCallback } from "react";
import KcetInputForm, { type KcetFormValues } from "./KcetInputForm";
import KcetResultTable from "./KcetResultTable";
import {
  loadKcetData,
  splitCategoriesByType,
  resolveEffectiveCategory,
  type DataStatus,
} from "../../services/kcetData";
import {
  filterAndSplitColleges,
  type SplitResults,
} from "../../services/kcetChance";
import {
  predictEngineeringRank,
  type RankPredictionResult,
} from "../../services/kcetRank";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt2(n: number) {
  return n.toFixed(2);
}
function fmtRank(n: number) {
  return n.toLocaleString("en-IN");
}

// ---------------------------------------------------------------------------
// Merit result card
// ---------------------------------------------------------------------------

function MeritCard({ rank }: { rank: RankPredictionResult }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Your Merit Score</h2>

      {/* Grid of intermediate values */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Board PCM</p>
          <p className="text-xl font-bold text-gray-900">
            {rank.boardPCM}
            <span className="text-sm font-normal text-gray-400"> /300</span>
          </p>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Board PCM %</p>
          <p className="text-xl font-bold text-gray-900">{fmt2(rank.boardPCMPercent)}%</p>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">KCET PCM</p>
          <p className="text-xl font-bold text-gray-900">
            {rank.kcetPCM}
            <span className="text-sm font-normal text-gray-400"> /180</span>
          </p>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">KCET PCM %</p>
          <p className="text-xl font-bold text-gray-900">{fmt2(rank.kcetPCMPercent)}%</p>
        </div>
      </div>

      {/* Composite + rank banner */}
      <div className="bg-indigo-600 text-white rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-indigo-200 mb-1">Composite Score (50:50)</p>
          <p className="text-4xl font-extrabold tracking-tight">
            {fmt2(rank.compositeScore)}%
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-indigo-200 mb-1">Estimated KCET Rank</p>
          <p className="text-4xl font-extrabold tracking-tight">
            ~{fmtRank(rank.estimatedRank)}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
        ⚠️ {rank.disclaimer}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading / error screens
// ---------------------------------------------------------------------------

function DataLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-gray-600 font-medium">Loading KEA cutoff data…</p>
      <p className="text-sm text-gray-400">Fetching from official Google Sheet</p>
    </div>
  );
}

function DataErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-4xl mb-4">⚠️</p>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Data Unavailable</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      <button type="button" onClick={onRetry}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
        Try Again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App state machine
// ---------------------------------------------------------------------------

type AppState =
  | { phase: "loading_data" }
  | { phase: "data_error"; message: string }
  | { phase: "form"; rkCategories: string[] }
  | {
      phase: "results";
      rkCategories: string[];
      rankResult: RankPredictionResult;
      splitResults: SplitResults;
      categoryUsed: string;
      seatType: string;
      totalRows: number;
      noMappingError: string | null;
    };

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function KcetPredictor() {
  const [state, setState] = useState<AppState>({ phase: "loading_data" });

  // ── Load data on mount ──────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setState({ phase: "loading_data" });
    const status: DataStatus = await loadKcetData();
    if (status.state === "error") {
      setState({ phase: "data_error", message: status.message });
      return;
    }
    if (status.state === "ready") {
      const { rkCategories } = splitCategoriesByType(status.detectedCategories);
      setState({ phase: "form", rkCategories });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Form submission ─────────────────────────────────────────────────────

  const handleFormSubmit = useCallback(async (values: KcetFormValues) => {
    const status: DataStatus = await loadKcetData();
    if (status.state !== "ready") {
      setState({ phase: "data_error", message: "Data unavailable. Please try again." });
      return;
    }

    const { rows, detectedCategories } = status;
    const { rkCategories } = splitCategoriesByType(detectedCategories);

    // Rank prediction (includes composite calculation)
    const rankResult = predictEngineeringRank({
      boardPhysics: parseFloat(values.pucPhysics),
      boardChemistry: parseFloat(values.pucChemistry),
      boardMathematics: parseFloat(values.pucMathematics),
      kcetPhysics: parseFloat(values.kcetPhysics),
      kcetChemistry: parseFloat(values.kcetChemistry),
      kcetMathematics: parseFloat(values.kcetMathematics),
    });

    // Resolve category (handles 371J mapping)
    const resolved = resolveEffectiveCategory(values.category, values.is371J);
    if (!resolved) {
      setState({
        phase: "results",
        rkCategories,
        rankResult,
        splitResults: { above: [], below: [], totalMatched: 0 },
        categoryUsed: values.category,
        seatType: "",
        totalRows: rows.length,
        noMappingError: `The category "${values.category}" does not have a 371(J) equivalent in the KEA dataset. Categories like NRI, OPN, OTH do not have H equivalents. Try without 371(J) selected.`,
      });
      return;
    }

    // 25-above / 25-below split
    const splitResults = filterAndSplitColleges(rows, {
      baseCategory: values.category,
      is371J: values.is371J,
      predictedRank: rankResult.estimatedRank,
    }) ?? { above: [], below: [], totalMatched: 0 };

    setState({
      phase: "results",
      rkCategories,
      rankResult,
      splitResults,
      categoryUsed: resolved.category,
      seatType: resolved.seatType,
      totalRows: rows.length,
      noMappingError: null,
    });
  }, []);

  // ── Back to form ────────────────────────────────────────────────────────

  const handleBack = useCallback(async () => {
    const status = await loadKcetData();
    if (status.state === "ready") {
      const { rkCategories } = splitCategoriesByType(status.detectedCategories);
      setState({ phase: "form", rkCategories });
    }
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/kcet/" className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Back to home">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
              🎓 KCET 2026 Rank &amp; College Predictor
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Official KEA cutoff data · Physics Pep Talk
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero text on form phase */}
        {(state.phase === "form" || state.phase === "loading_data") && (
          <div className="text-center mb-10">
            <p className="text-gray-600 max-w-2xl mx-auto text-base">
              Enter your Board and KCET PCM marks. We'll calculate your composite score,
              estimate your rank using historical 2025 data, and show you 25 colleges
              above and 25 colleges below your estimated rank using official KEA cutoffs.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full px-3 py-1">✓ Only official KEA data</span>
              <span className="text-xs bg-blue-100 text-blue-800 border border-blue-200 rounded-full px-3 py-1">✓ 2025 rank model</span>
              <span className="text-xs bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full px-3 py-1">✓ 25 above + 25 below</span>
            </div>
          </div>
        )}

        {/* State rendering */}
        {state.phase === "loading_data" && <DataLoadingScreen />}

        {state.phase === "data_error" && (
          <DataErrorScreen message={state.message} onRetry={loadData} />
        )}

        {state.phase === "form" && (
          <KcetInputForm
            availableCategories={state.rkCategories}
            onSubmit={handleFormSubmit}
            loading={false}
          />
        )}

        {state.phase === "results" && (
          <>
            {/* Merit + rank card */}
            <MeritCard rank={state.rankResult} />

            {/* Back button */}
            <div className="mb-6">
              <button type="button" onClick={handleBack}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                ← Change marks / category
              </button>
            </div>

            {/* 371(J) mapping error */}
            {state.noMappingError && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-800 text-sm">
                <strong>371(J) mapping not available:</strong> {state.noMappingError}
              </div>
            )}

            {/* Result table with 25+25 */}
            <KcetResultTable
              splitResults={state.splitResults}
              totalLoadedRows={state.totalRows}
              categoryUsed={state.categoryUsed}
              seatType={state.seatType}
              estimatedRank={state.rankResult.estimatedRank}
            />
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 mt-8 border-t border-gray-200">
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500">College and cutoff data: <strong>Karnataka Examinations Authority (KEA)</strong></p>
          <p className="text-xs text-gray-500">Data round: <strong>UGCET 2026 Third Round Provisional Allotment</strong></p>
          <p className="text-xs text-gray-500">Rank estimate: <strong>Historical 2025 score-to-rank data</strong> · Not an official KEA rank</p>
          <p className="text-xs text-gray-400 mt-2">© 2026 Physics Pep Talk · For guidance only. Verify with KEA official sources.</p>
        </div>
      </footer>
    </div>
  );
}
