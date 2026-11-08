import { describe, it, expect, beforeEach } from "vitest";
import {
  fetchSubjectQuestions,
  submitTestAnswers,
  saveTestSession,
  loadTestSession,
  clearTestSession,
  clearTestSeriesCache,
} from "./testSeriesService";
import type { TestSessionState } from "./testSeriesTypes";

describe("testSeriesService", () => {
  beforeEach(() => {
    clearTestSeriesCache();
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
    };
  });

  describe("fetchSubjectQuestions", () => {
    it("fetches questions for all four subjects without exposing answers or explanations", async () => {
      const subjects = ["physics", "chemistry", "maths", "bio"] as const;

      for (const sub of subjects) {
        const result = await fetchSubjectQuestions(sub, true);
        expect(result.subjectId).toBe(sub);
        expect(result.questions.length).toBeGreaterThanOrEqual(8);
        expect(result.error).toBeNull();
        expect(Object.keys(result.topics).length).toBeGreaterThan(0);

        // Check that promotional course info was parsed from columns K-O
        expect(result.promoCourse).toBeDefined();
        expect(result.promoCourse?.buyUrl).toContain("physicspeptalk.com");
        expect(result.promoCourse?.thumbnailUrl).toBeTruthy();
        expect(result.promoCourse?.title).toBeTruthy();
        expect(result.promoCourse?.description).toBeTruthy();

        // SECURITY VERIFICATION: Public questions must NEVER expose answers or explanations
        for (const q of result.questions) {
          expect((q as any).correctAnswer).toBeUndefined();
          expect((q as any).explanation).toBeUndefined();
          expect(q.options.A).toBeDefined();
          expect(q.options.B).toBeDefined();
          expect(q.question).toBeTruthy();
        }
      }
    }, 15000);
  });

  describe("submitTestAnswers", () => {
    it("evaluates submitted answers and returns score, accuracy, answer review, and promoCourse", async () => {
      // First fetch questions so cache / secure records are initialized
      const fetchRes = await fetchSubjectQuestions("chemistry", false);
      expect(fetchRes.questions.length).toBeGreaterThanOrEqual(1);

      const testedQuestions = fetchRes.questions.slice(0, 2);
      const answers: Record<string, "A" | "B" | "C" | "D"> = {};
      testedQuestions.forEach((q, idx) => {
        answers[q.id] = idx === 0 ? "B" : "C";
      });

      const evalRes = await submitTestAnswers({
        subjectId: "chemistry",
        questionIds: testedQuestions.map((q) => q.id),
        answers,
        timeSpentSeconds: 45,
      });

      expect(evalRes.subjectId).toBe("chemistry");
      expect(evalRes.totalQuestions).toBe(testedQuestions.length);
      expect(evalRes.timeSpentSeconds).toBe(45);
      expect(evalRes.review.length).toBe(testedQuestions.length);

      // Verify promotional course is attached to evaluation result
      expect(evalRes.promoCourse).toBeDefined();
      expect(evalRes.promoCourse?.buyUrl).toContain("physicspeptalk.com");
      expect(evalRes.promoCourse?.title).toBeTruthy();

      // Verify that after submission, correct answers and explanations ARE provided
      for (const item of evalRes.review) {
        expect(item.correctAnswer).toMatch(/^[A-D]$/);
        expect(item.explanation).toBeTruthy();
        expect(typeof item.isCorrect).toBe("boolean");
      }
    }, 15000);
  });

  describe("localStorage Session Persistence", () => {
    it("saves, loads, and clears test sessions", () => {
      const session: TestSessionState = {
        subjectId: "physics",
        topicFilter: null,
        questionIds: ["phy-1", "phy-2"],
        currentQuestionIndex: 1,
        answers: { "phy-1": "A" },
        markedForReview: { "phy-2": true },
        visited: { "phy-1": true, "phy-2": true },
        timeRemainingSeconds: 1500,
        totalTimeSeconds: 1800,
        isSubmitted: false,
        startedAt: Date.now(),
      };

      saveTestSession(session);

      const loaded = loadTestSession("physics");
      expect(loaded).toBeDefined();
      expect(loaded?.currentQuestionIndex).toBe(1);
      expect(loaded?.answers["phy-1"]).toBe("A");
      expect(loaded?.markedForReview["phy-2"]).toBe(true);

      clearTestSession("physics");
      expect(loadTestSession("physics")).toBeNull();
    });
  });
});
