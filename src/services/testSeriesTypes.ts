/**
 * testSeriesTypes.ts
 *
 * Core TypeScript definitions for the Physics Pep Talk Online Test Series.
 */

import type { SubjectId } from "../config/testSeriesConfig";

export type { SubjectId };

export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

/**
 * Public question structure sent to the frontend.
 * SECURITY: Neither correctAnswer nor explanation is present here!
 */
export interface Question {
  id: string;
  subject: string;
  topic: string;
  question: string;
  options: QuestionOptions;
}

/**
 * Full question record containing correct answers and explanations.
 * Only retained in secure server evaluation or private evaluator module.
 */
export interface SecureQuestionRecord extends Question {
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export type QuestionNavStatus =
  | "answered"
  | "unanswered"
  | "marked"
  | "marked-answered"
  | "not-visited";

export interface TestSessionState {
  subjectId: SubjectId;
  topicFilter: string | null;
  questionIds: string[];
  currentQuestionIndex: number;
  answers: Record<string, "A" | "B" | "C" | "D">;
  markedForReview: Record<string, boolean>;
  visited: Record<string, boolean>;
  timeRemainingSeconds: number;
  totalTimeSeconds: number;
  isSubmitted: boolean;
  startedAt: number;
}

export interface QuestionReviewItem {
  id: string;
  topic: string;
  question: string;
  options: QuestionOptions;
  studentAnswer: "A" | "B" | "C" | "D" | null;
  correctAnswer: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  isUnattempted: boolean;
  explanation: string;
}

export interface TestEvaluationResult {
  subjectId: SubjectId;
  subjectName: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  accuracy: number;
  timeSpentSeconds: number;
  review: QuestionReviewItem[];
}

export interface TestSubmissionPayload {
  subjectId: SubjectId;
  questionIds: string[];
  answers: Record<string, "A" | "B" | "C" | "D">;
  timeSpentSeconds: number;
}

export interface SubjectFetchResult {
  subjectId: SubjectId;
  subjectName: string;
  questions: Question[];
  topics: Record<string, number>;
  totalQuestions: number;
  source: "apps_script" | "google_sheets_csv" | "sample_bank";
  error: string | null;
}
