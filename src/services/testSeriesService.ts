/**
 * testSeriesService.ts
 *
 * Full lifecycle service for Physics Pep Talk online test series:
 *   - Google Apps Script API integration (cheat-proof server evaluation)
 *   - Direct Google Sheets gviz CSV fallback integration
 *   - Built-in sample question bank fallback when Google Sheets tabs have 0 rows
 *   - In-memory response caching (5-minute TTL)
 *   - LocalStorage session persistence (prevents progress loss on page refresh)
 */

import {
  SPREADSHEET_ID,
  APPS_SCRIPT_API_URL,
  SUBJECT_CONFIGS,
  type SubjectId,
} from "../config/testSeriesConfig";
import type {
  Question,
  SecureQuestionRecord,
  SubjectFetchResult,
  TestEvaluationResult,
  TestSubmissionPayload,
  TestSessionState,
} from "./testSeriesTypes";
import { parseSheetCsvToQuestions } from "./testSeriesParser";
import { evaluateTest } from "./testEvaluation";
import { SAMPLE_QUESTIONS_BY_SUBJECT } from "./sampleQuestionBank";

// ─── In-Memory Cache ────────────────────────────────────────────────────────

interface CacheEntry {
  data: SubjectFetchResult;
  secureRecords: SecureQuestionRecord[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map<SubjectId, CacheEntry>();

export function clearTestSeriesCache(subjectId?: SubjectId): void {
  if (subjectId) {
    memoryCache.delete(subjectId);
  } else {
    memoryCache.clear();
  }
}

// ─── Question Fetcher ───────────────────────────────────────────────────────

/**
 * Fetch questions for a specific subject.
 * SECURITY: Strips correct answers and explanations before returning!
 */
export async function fetchSubjectQuestions(
  subjectId: SubjectId,
  forceRefresh = false
): Promise<SubjectFetchResult> {
  const config = SUBJECT_CONFIGS[subjectId];
  if (!config) {
    return {
      subjectId,
      subjectName: subjectId,
      questions: [],
      topics: {},
      totalQuestions: 0,
      source: "sample_bank",
      error: `Unknown subject: "${subjectId}"`,
    };
  }

  // Check in-memory cache
  if (!forceRefresh) {
    const cached = memoryCache.get(subjectId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // Strategy 1: Google Apps Script API (if configured)
  if (APPS_SCRIPT_API_URL) {
    try {
      const apiUrl = `${APPS_SCRIPT_API_URL}?action=questions&subject=${subjectId}&_cb=${Date.now()}`;
      const res = await fetch(apiUrl, { cache: "no-cache" });
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.questions) && json.questions.length > 0) {
          const result: SubjectFetchResult = {
            subjectId,
            subjectName: config.name,
            questions: json.questions,
            topics: json.topics || extractTopicsFromQuestions(json.questions),
            totalQuestions: json.questions.length,
            source: "apps_script",
            error: null,
            promoCourse: json.promoCourse || null,
          };
          memoryCache.set(subjectId, {
            data: result,
            secureRecords: [],
            timestamp: Date.now(),
          });
          return result;
        }
      }
    } catch (e) {
      console.warn("Apps Script fetch failed, falling back to Google Sheets CSV:", e);
    }
  }

  // Strategy 2: Direct Google Sheets CSV fetch
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${config.sheetGid}&_cb=${Date.now()}`;
    const res = await fetch(csvUrl, { cache: "no-cache" });

    if (res.ok) {
      const csvText = await res.text();
      const parsed = parseSheetCsvToQuestions(csvText, subjectId, config.name);

      if (parsed.questions.length > 0) {
        const result: SubjectFetchResult = {
          subjectId,
          subjectName: config.name,
          questions: parsed.questions,
          topics: parsed.topics,
          totalQuestions: parsed.questions.length,
          source: "google_sheets_csv",
          error: null,
          promoCourse: parsed.promoCourse || null,
        };
        memoryCache.set(subjectId, {
          data: result,
          secureRecords: parsed.secureRecords,
          timestamp: Date.now(),
        });
        return result;
      }
    }
  } catch (e) {
    console.warn("Direct Google Sheets CSV fetch failed, falling back to sample bank:", e);
  }

  // Strategy 3: Built-in Sample Question Bank (active while sheet tabs have 0 data rows)
  const samples = SAMPLE_QUESTIONS_BY_SUBJECT[subjectId] || [];
  const publicQuestions: Question[] = samples.map((s) => ({
    id: s.id,
    subject: s.subject,
    topic: s.topic,
    question: s.question,
    options: s.options,
  }));

  const topics: Record<string, number> = {};
  publicQuestions.forEach((q) => {
    topics[q.topic] = (topics[q.topic] || 0) + 1;
  });

  const result: SubjectFetchResult = {
    subjectId,
    subjectName: config.name,
    questions: publicQuestions,
    topics,
    totalQuestions: publicQuestions.length,
    source: "sample_bank",
    error: null,
    promoCourse: null,
  };

  memoryCache.set(subjectId, {
    data: result,
    secureRecords: samples,
    timestamp: Date.now(),
  });

  return result;
}

function extractTopicsFromQuestions(questions: Question[]): Record<string, number> {
  const map: Record<string, number> = {};
  questions.forEach((q) => {
    if (q.topic) {
      map[q.topic] = (map[q.topic] || 0) + 1;
    }
  });
  return map;
}

// ─── Test Submission & Evaluation ──────────────────────────────────────────

/**
 * Submit answers and obtain evaluation results.
 * When Apps Script is enabled, evaluates server-side.
 * When running in client CSV/sample mode, evaluates via private evaluator.
 */
export async function submitTestAnswers(
  submission: TestSubmissionPayload
): Promise<TestEvaluationResult> {
  const config = SUBJECT_CONFIGS[submission.subjectId];
  const subjectTitle = config ? config.name : submission.subjectId;

  // Try Apps Script first if configured
  if (APPS_SCRIPT_API_URL) {
    try {
      const res = await fetch(APPS_SCRIPT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.evaluation) {
          return json.evaluation as TestEvaluationResult;
        }
      }
    } catch (e) {
      console.warn("POST to Apps Script failed, trying GET fallback:", e);
      try {
        const fallbackUrl = `${APPS_SCRIPT_API_URL}?action=submit&payload=${encodeURIComponent(
          JSON.stringify(submission)
        )}`;
        const res = await fetch(fallbackUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.status === "success" && json.evaluation) {
            return json.evaluation as TestEvaluationResult;
          }
        }
      } catch (fErr) {
        console.warn("Apps Script submit fallback also failed:", fErr);
      }
    }
  }

  // Fallback: Use secure records stored in memory during question fetch
  const cached = memoryCache.get(submission.subjectId);
  const secureRecords = cached?.secureRecords || SAMPLE_QUESTIONS_BY_SUBJECT[submission.subjectId] || [];

  const evaluation = evaluateTest(secureRecords, submission, subjectTitle);
  evaluation.promoCourse = cached?.data?.promoCourse || null;
  return evaluation;
}

// ─── Session Persistence (localStorage) ────────────────────────────────────

const SESSION_STORAGE_KEY_PREFIX = "peptalk_test_session_";

export function saveTestSession(session: TestSessionState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      `${SESSION_STORAGE_KEY_PREFIX}${session.subjectId}`,
      JSON.stringify(session)
    );
  } catch (e) {
    console.error("Failed to save test session to localStorage:", e);
  }
}

export function loadTestSession(subjectId: SubjectId): TestSessionState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${SESSION_STORAGE_KEY_PREFIX}${subjectId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TestSessionState;

    // Check if session has expired (e.g. > 12 hours old or timeRemaining <= 0)
    if (Date.now() - parsed.startedAt > 12 * 60 * 60 * 1000) {
      clearTestSession(subjectId);
      return null;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load test session from localStorage:", e);
    return null;
  }
}

export function clearTestSession(subjectId: SubjectId): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(`${SESSION_STORAGE_KEY_PREFIX}${subjectId}`);
  } catch (e) {
    console.error("Failed to clear test session from localStorage:", e);
  }
}
