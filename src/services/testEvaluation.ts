/**
 * testEvaluation.ts
 *
 * Evaluation engine for Physics Pep Talk online tests.
 *
 * Used for:
 *   1. Local client evaluation when working in direct Google Sheets CSV mode or sample mode.
 *   2. Mocking and testing.
 *   3. Matching the same exact algorithm implemented in Google Apps Script `Code.gs`.
 */

import type {
  SecureQuestionRecord,
  TestEvaluationResult,
  QuestionReviewItem,
  TestSubmissionPayload,
} from "./testSeriesTypes";
import { normalizeOptionLetter } from "./testSeriesParser";

export function evaluateTest(
  records: SecureQuestionRecord[],
  submission: TestSubmissionPayload,
  subjectTitle: string
): TestEvaluationResult {
  const { subjectId, answers, timeSpentSeconds } = submission;

  // Filter records to match the tested question set (e.g. topic test or custom subset)
  const testSet =
    submission.questionIds && submission.questionIds.length > 0
      ? records.filter((r) => submission.questionIds.includes(r.id))
      : records;

  const total = testSet.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const review: QuestionReviewItem[] = testSet.map((q) => {
    const rawStudentAns = answers[q.id];
    const studentAns = rawStudentAns ? normalizeOptionLetter(rawStudentAns) : null;
    const correctAns = normalizeOptionLetter(q.correctAnswer);

    const isUnattempted = !studentAns;
    const isCorrect = !isUnattempted && studentAns === correctAns;

    if (isUnattempted) {
      unattemptedCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    return {
      id: q.id,
      topic: q.topic,
      question: q.question,
      options: q.options,
      studentAnswer: studentAns,
      correctAnswer: correctAns,
      isCorrect,
      isUnattempted,
      explanation: q.explanation || "Explanation not available for this question.",
    };
  });

  const totalMarks = correctCount; // +1 per correct, 0 negative
  const maxMarks = total;
  const percentage = total > 0 ? Math.round((correctCount / total) * 10000) / 100 : 0;
  const attempted = correctCount + incorrectCount;
  const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 10000) / 100 : 0;

  return {
    subjectId,
    subjectName: subjectTitle,
    totalQuestions: total,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    unattempted: unattemptedCount,
    totalMarks,
    maxMarks,
    percentage,
    accuracy,
    timeSpentSeconds,
    review,
  };
}
