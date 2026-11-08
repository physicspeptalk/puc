/**
 * TestIndexHub.tsx
 *
 * Subject selection hub for /tests (and /test):
 *   - Allows student to choose between Physics, Chemistry, Mathematics, and Biology
 *   - Stream filtering: All Subjects (PCMB), Engineering Stream (PCM), Medical Stream (PCB)
 *   - Live question counts fetched dynamically from Google Sheets
 *   - Subject comparison matrix and examination guidelines
 */

import React, { useState, useEffect } from "react";
import {
  SUBJECT_CONFIGS,
  SUBJECT_ORDER,
  type SubjectId,
} from "../../config/testSeriesConfig";
import { fetchSubjectQuestions } from "../../services/testSeriesService";
import { SubjectIcon } from "./SubjectCard";

interface TestIndexHubProps {
  onSelectSubject?: (subjectId: SubjectId) => void;
}

type StreamFilter = "all" | "pcm" | "pcb";

export const TestIndexHub: React.FC<TestIndexHubProps> = ({ onSelectSubject }) => {
  const [streamFilter, setStreamFilter] = useState<StreamFilter>("all");
  const [questionCounts, setQuestionCounts] = useState<Record<SubjectId, number>>({
    physics: 10,
    chemistry: 10,
    maths: 8,
    bio: 10,
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Fetch live question counts for each subject
  useEffect(() => {
    let cancelled = false;

    async function loadAllCounts() {
      const counts: Partial<Record<SubjectId, number>> = {};
      await Promise.all(
        SUBJECT_ORDER.map(async (subId) => {
          try {
            const res = await fetchSubjectQuestions(subId);
            counts[subId] = res.questions.length;
          } catch (e) {
            console.warn(`Could not load count for ${subId}:`, e);
          }
        })
      );

      if (!cancelled) {
        setQuestionCounts((prev) => ({
          ...prev,
          ...(counts as Record<SubjectId, number>),
        }));
        setLoadingCounts(false);
      }
    }

    loadAllCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChooseSubject = (subId: SubjectId) => {
    if (onSelectSubject) {
      onSelectSubject(subId);
    } else {
      window.location.assign(SUBJECT_CONFIGS[subId].route);
    }
  };

  const filteredSubjects = SUBJECT_ORDER.filter((subId) => {
    if (streamFilter === "pcm") return subId === "physics" || subId === "chemistry" || subId === "maths";
    if (streamFilter === "pcb") return subId === "physics" || subId === "chemistry" || subId === "bio";
    return true;
  });

  const totalBankQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 animate-in fade-in duration-300">
      {/* ─── Hero Header ──────────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#0056D2]">
          <span className="w-2 h-2 rounded-full bg-[#0056D2] animate-pulse" />
          <span>Karnataka PUC &amp; KCET Test Series</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Choose Your Subject to Begin Practice
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto font-normal">
          Select a subject below to attempt live chapter-wise and full-length mock examinations.
          Features realistic countdown timer, question palette, instant evaluation, and step-by-step solutions.
        </p>

        {/* Global Stats Counter */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-500">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200/90 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong className="text-gray-900 font-bold">
              {loadingCounts ? "38+" : totalBankQuestions}
            </strong>{" "}
            Live MCQs Available
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200/90 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <strong className="text-gray-900 font-bold">4 Subjects</strong> (PCMB)
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200/90 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <strong className="text-gray-900 font-bold">+1 / 0</strong> Marking Scheme
          </span>
        </div>
      </div>

      {/* ─── Stream Filter Segment ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/90 shadow-xs">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Filter by Academic Stream:
        </span>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStreamFilter("all")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              streamFilter === "all"
                ? "bg-[#0056D2] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Subjects (PCMB)
          </button>
          <button
            type="button"
            onClick={() => setStreamFilter("pcm")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              streamFilter === "pcm"
                ? "bg-[#0056D2] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Engineering (PCM)
          </button>
          <button
            type="button"
            onClick={() => setStreamFilter("pcb")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              streamFilter === "pcb"
                ? "bg-[#0056D2] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Medical (PCB)
          </button>
        </div>
      </div>

      {/* ─── Subject Selection Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSubjects.map((subId) => {
          const config = SUBJECT_CONFIGS[subId];
          const count = questionCounts[subId];

          return (
            <article
              key={subId}
              onClick={() => handleChooseSubject(subId)}
              className="bg-white rounded-3xl border-2 border-gray-200/90 hover:border-[#0056D2] hover:shadow-xl transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              {/* Subtle accent border at top */}
              <div
                className="absolute top-0 inset-x-0 h-1.5 transition-colors"
                style={{ backgroundColor: config.themeColor }}
              />

              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs"
                      style={{ backgroundColor: `${config.themeColor}15`, color: config.themeColor }}
                    >
                      <SubjectIcon iconName={config.iconName} className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-[#0056D2] transition-colors leading-tight">
                        {config.name}
                      </h2>
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        {config.badgeText}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-extrabold px-3 py-1 rounded-lg ${config.badgeBg}`}>
                    {config.shortName}
                  </span>
                </div>

                {/* Tagline & Description */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  {config.description}
                </p>

                {/* Key Syllabus Topics Pills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Core Chapters:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {config.defaultTopics.slice(0, 4).map((topic) => (
                      <span
                        key={topic}
                        className="text-[11px] font-medium bg-gray-100/90 text-gray-700 px-2.5 py-0.5 rounded-md"
                      >
                        {topic}
                      </span>
                    ))}
                    {config.defaultTopics.length > 4 && (
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                        +{config.defaultTopics.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Exam Metric Indicators */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs border-t border-gray-100">
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-[10px] text-gray-400 block font-medium">Questions</span>
                    <span className="font-extrabold text-gray-900 text-sm">
                      {loadingCounts ? "..." : `${count} MCQs`}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-[10px] text-gray-400 block font-medium">Duration</span>
                    <span className="font-extrabold text-gray-900 text-sm">
                      {config.defaultTimeMinutes} Mins
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-[10px] text-gray-400 block font-medium">Marking</span>
                    <span className="font-extrabold text-emerald-700 text-sm">+1.0 / 0</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">
                  Instant Result + Explanations
                </span>

                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0056D2] group-hover:bg-[#00419e] text-white text-xs font-bold shadow-xs transition-colors">
                  <span>Start {config.name} Test</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* ─── Platform Features / Why Pep Talk Test Series ───────────────────── */}
      <section className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-8 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Why Practice with Physics Pep Talk?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Engineered to reflect the latest Karnataka Board blueprint and KCET / COMEDK exam pattern.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
          <div className="space-y-2 p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0056D2] flex items-center justify-center font-bold">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-gray-900">CBT Exam Experience</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              One question at a time, question navigation palette, mark for review, and timed countdown.
            </p>
          </div>

          <div className="space-y-2 p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              🎯
            </div>
            <h3 className="text-sm font-bold text-gray-900">Instant Score &amp; Accuracy</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              No waiting for results. Receive your total marks, accuracy percentage, and time taken instantly upon submission.
            </p>
          </div>

          <div className="space-y-2 p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              💡
            </div>
            <h3 className="text-sm font-bold text-gray-900">Comprehensive Solutions</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              Every single question includes a detailed step-by-step mathematical explanation, formula derivation, and concept breakdown.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestIndexHub;
