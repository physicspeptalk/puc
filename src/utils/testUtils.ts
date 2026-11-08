/**
 * testUtils.ts
 *
 * Shared helper utilities for the test series components.
 */

import type { QuestionNavStatus } from "../services/testSeriesTypes";

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function getQuestionStatus(
  questionId: string,
  answers: Record<string, "A" | "B" | "C" | "D">,
  markedForReview: Record<string, boolean>,
  visited: Record<string, boolean>
): QuestionNavStatus {
  const isAnswered = !!answers[questionId];
  const isMarked = !!markedForReview[questionId];
  const isVisited = !!visited[questionId];

  if (isAnswered && isMarked) return "marked-answered";
  if (isMarked) return "marked";
  if (isAnswered) return "answered";
  if (isVisited) return "unanswered";
  return "not-visited";
}
