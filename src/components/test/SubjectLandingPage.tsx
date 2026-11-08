/**
 * SubjectLandingPage.tsx
 *
 * Unified, dynamic landing page and orchestrator for all 4 subject routes:
 *   - /test/physics
 *   - /test/chemistry
 *   - /test/maths
 *   - /test/bio
 *
 * Manages:
 *   - Landing overview (subject hero, question counts, topic selection, rules)
 *   - Test taking interface transition
 *   - Test results & answer review display
 *   - Loading skeletons and retry error states
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  SUBJECT_CONFIGS,
  SUBJECT_ORDER,
  type SubjectId,
} from "../../config/testSeriesConfig";
import type {
  SubjectFetchResult,
  TestEvaluationResult,
} from "../../services/testSeriesTypes";
import {
  fetchSubjectQuestions,
  clearTestSeriesCache,
  loadTestSession,
} from "../../services/testSeriesService";
import { SubjectIcon } from "./SubjectCard";
import TopicSelector from "./TopicSelector";
import TestInstructions from "./TestInstructions";
import TestTakingInterface from "./TestTakingInterface";
import TestResults from "./TestResults";

interface SubjectLandingPageProps {
  subjectId: SubjectId;
  onNavigateSubject?: (subjectId: SubjectId) => void;
}

export const SubjectLandingPage: React.FC<SubjectLandingPageProps> = ({
  subjectId,
  onNavigateSubject,
}) => {
  const config = SUBJECT_CONFIGS[subjectId];

  // Page mode: "landing" | "testing" | "results"
  const [mode, setMode] = useState<"landing" | "testing" | "results">("landing");
  const [data, setData] = useState<SubjectFetchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected topic filter
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Evaluation results
  const [evaluationResult, setEvaluationResult] = useState<TestEvaluationResult | null>(null);

  // Check for active unfinished session
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Load questions for the subject
  const loadQuestions = useCallback(
    async (force = false) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchSubjectQuestions(subjectId, force);
        setData(result);
        if (result.error && result.questions.length === 0) {
          setError(result.error);
        }

        // Check if there's an active session saved
        const existingSession = loadTestSession(subjectId);
        if (existingSession && !existingSession.isSubmitted) {
          setHasActiveSession(true);
        } else {
          setHasActiveSession(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [subjectId]
  );

  useEffect(() => {
    setMode("landing");
    setSelectedTopic(null);
    setEvaluationResult(null);
    loadQuestions();
  }, [subjectId, loadQuestions]);

  const handleStartTest = () => {
    setMode("testing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTestFinish = (result: TestEvaluationResult) => {
    setEvaluationResult(result);
    setMode("results");
    setHasActiveSession(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetake = () => {
    setEvaluationResult(null);
    setMode("testing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReturnToOverview = () => {
    setMode("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If in active testing mode
  if (mode === "testing" && data && data.questions.length > 0) {
    return (
      <TestTakingInterface
        subjectId={subjectId}
        questions={data.questions}
        topicFilter={selectedTopic}
        onFinish={handleTestFinish}
        onExit={handleReturnToOverview}
      />
    );
  }

  // If in results mode
  if (mode === "results" && evaluationResult) {
    return (
      <TestResults
        evaluation={evaluationResult}
        onRetake={handleRetake}
        onChangeTopic={() => {
          setMode("landing");
          setSelectedTopic(null);
        }}
        onChangeSubject={() => {
          if (onNavigateSubject) {
            onNavigateSubject("physics");
          } else {
            window.location.href = "/test/physics";
          }
        }}
      />
    );
  }

  const totalQuestions = data?.questions.length || 0;
  const filteredCount = selectedTopic
    ? data?.questions.filter((q) => q.topic.toLowerCase() === selectedTopic.toLowerCase()).length || 0
    : totalQuestions;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* ─── Breadcrumb Navigation ────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500" aria-label="Breadcrumb">
        <a href="/" className="hover:text-[#0056D2] transition-colors">
          Home
        </a>
        <span>/</span>
        <a href="/test/physics" className="hover:text-[#0056D2] transition-colors">
          Online Test Series
        </a>
        <span>/</span>
        <span className="text-gray-900 font-bold capitalize">{config.name}</span>
      </nav>

      {/* ─── Active Session Alert Banner (if resume is available) ─────────── */}
      {hasActiveSession && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0056D2] text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">You have an in-progress test session!</h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Your previous responses and remaining time have been saved.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleStartTest}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Resume Test
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset previous session and start fresh?")) {
                  clearTestSeriesCache(subjectId);
                  setHasActiveSession(false);
                }
              }}
              className="px-3 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* ─── Hero Card ────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 md:p-10 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: config.themeColor }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${config.themeColor}15`, color: config.themeColor }}
              >
                <SubjectIcon iconName={config.iconName} className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${config.badgeBg}`}>
                {config.badgeText}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {config.name} Online Mock Test Series
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
              {config.description}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-gray-700">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{totalQuestions} Curated MCQs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{filteredCount} Mins Recommended</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>{Object.keys(data?.topics || {}).length} Chapters Covered</span>
              </div>
            </div>
          </div>

          {/* Right CTA Box */}
          <div className="flex flex-col items-center sm:items-end justify-center gap-3 md:min-w-[220px]">
            <button
              type="button"
              disabled={loading || totalQuestions === 0}
              onClick={handleStartTest}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0056D2] hover:bg-[#00419e] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              <span>Start {config.name} Test</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <span className="text-[11px] text-gray-500 font-medium">
              Free • Instant score &amp; solutions
            </span>
          </div>
        </div>

        {/* Data Source Notice */}
        {data?.source === "sample_bank" && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
              <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Displaying high-yield sample questions. When rows are added to the Google Sheet tab, live questions load automatically.
              </span>
            </span>

            <button
              type="button"
              onClick={() => loadQuestions(true)}
              className="text-[#0056D2] font-semibold hover:underline flex items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Sheet</span>
            </button>
          </div>
        )}
      </section>

      {/* ─── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-gray-200 rounded-xl" />
            <div className="h-9 w-40 bg-gray-200 rounded-xl" />
            <div className="h-9 w-36 bg-gray-200 rounded-xl" />
          </div>
        </div>
      )}

      {/* ─── Error State ──────────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <svg className="w-8 h-8 text-rose-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="font-bold text-gray-900 text-sm">Unable to load questions from Google Sheets</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => loadQuestions(true)}
            className="px-4 py-2 bg-[#0056D2] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#00419e] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ─── Topic Selector Section ───────────────────────────────────────── */}
      {!loading && data && Object.keys(data.topics).length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 sm:p-6">
          <TopicSelector
            topics={data.topics}
            totalQuestions={totalQuestions}
            selectedTopic={selectedTopic}
            onSelectTopic={(topic) => setSelectedTopic(topic)}
          />
        </section>
      )}

      {/* ─── Instructions & Guidelines ────────────────────────────────────── */}
      <TestInstructions />

      {/* ─── Other Subjects Switcher ──────────────────────────────────────── */}
      <section className="space-y-4 pt-4 border-t border-gray-200/80">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">
            Practice Other Subjects
          </h3>
          <span className="text-xs text-gray-500">Karnataka PUC &amp; KCET Blueprint</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBJECT_ORDER.map((subKey) => {
            const subConf = SUBJECT_CONFIGS[subKey];
            const isCurrent = subKey === subjectId;

            return (
              <a
                key={subKey}
                href={subConf.route}
                onClick={(e) => {
                  if (onNavigateSubject) {
                    e.preventDefault();
                    onNavigateSubject(subKey);
                  }
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 group cursor-pointer ${
                  isCurrent
                    ? "bg-blue-50/50 border-[#0056D2] shadow-xs"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${subConf.themeColor}15`, color: subConf.themeColor }}
                >
                  <SubjectIcon iconName={subConf.iconName} className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="font-bold text-gray-900 text-sm block group-hover:text-[#0056D2] truncate">
                    {subConf.name}
                  </span>
                  <span className="text-[11px] text-gray-500 block truncate">
                    {subConf.badgeText}
                  </span>
                </div>

                {isCurrent ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2] bg-blue-100 px-2 py-0.5 rounded">
                    Active
                  </span>
                ) : (
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-[#0056D2] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SubjectLandingPage;
