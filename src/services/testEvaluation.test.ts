import { describe, it, expect } from "vitest";
import { evaluateTest } from "./testEvaluation";
import type { SecureQuestionRecord, TestSubmissionPayload } from "./testSeriesTypes";

describe("testEvaluation", () => {
  const dummyRecords: SecureQuestionRecord[] = [
    {
      id: "phy-1",
      subject: "Physics",
      topic: "Mechanics",
      question: "Question 1",
      options: { A: "Ans A", B: "Ans B", C: "Ans C", D: "Ans D" },
      correctAnswer: "A",
      explanation: "Explanation 1",
    },
    {
      id: "phy-2",
      subject: "Physics",
      topic: "Mechanics",
      question: "Question 2",
      options: { A: "Ans A", B: "Ans B", C: "Ans C", D: "Ans D" },
      correctAnswer: "C",
      explanation: "Explanation 2",
    },
    {
      id: "phy-3",
      subject: "Physics",
      topic: "Optics",
      question: "Question 3",
      options: { A: "Ans A", B: "Ans B", C: "Ans C", D: "Ans D" },
      correctAnswer: "D",
      explanation: "",
    },
  ];

  it("evaluates all correct answers properly", () => {
    const submission: TestSubmissionPayload = {
      subjectId: "physics",
      questionIds: ["phy-1", "phy-2", "phy-3"],
      answers: {
        "phy-1": "A",
        "phy-2": "C",
        "phy-3": "D",
      },
      timeSpentSeconds: 65,
    };

    const result = evaluateTest(dummyRecords, submission, "Physics");

    expect(result.totalQuestions).toBe(3);
    expect(result.correctAnswers).toBe(3);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.unattempted).toBe(0);
    expect(result.totalMarks).toBe(3);
    expect(result.maxMarks).toBe(3);
    expect(result.percentage).toBe(100);
    expect(result.accuracy).toBe(100);
    expect(result.timeSpentSeconds).toBe(65);

    expect(result.review[0].isCorrect).toBe(true);
    expect(result.review[0].studentAnswer).toBe("A");
    expect(result.review[0].correctAnswer).toBe("A");
    expect(result.review[0].explanation).toBe("Explanation 1");
  });

  it("evaluates mixed correct, incorrect, and unattempted answers", () => {
    const submission: TestSubmissionPayload = {
      subjectId: "physics",
      questionIds: ["phy-1", "phy-2", "phy-3"],
      answers: {
        "phy-1": "A", // Correct
        "phy-2": "B", // Incorrect (correct is C)
        // phy-3 is unattempted
      },
      timeSpentSeconds: 90,
    };

    const result = evaluateTest(dummyRecords, submission, "Physics");

    expect(result.totalQuestions).toBe(3);
    expect(result.correctAnswers).toBe(1);
    expect(result.incorrectAnswers).toBe(1);
    expect(result.unattempted).toBe(1);
    expect(result.totalMarks).toBe(1);
    expect(result.percentage).toBe(33.33);
    expect(result.accuracy).toBe(50); // 1 correct out of 2 attempted

    // Review item 2 (incorrect)
    const reviewQ2 = result.review[1];
    expect(reviewQ2.isCorrect).toBe(false);
    expect(reviewQ2.isUnattempted).toBe(false);
    expect(reviewQ2.studentAnswer).toBe("B");
    expect(reviewQ2.correctAnswer).toBe("C");
    expect(reviewQ2.explanation).toBe("Explanation 2");

    // Review item 3 (unattempted)
    const reviewQ3 = result.review[2];
    expect(reviewQ3.isCorrect).toBe(false);
    expect(reviewQ3.isUnattempted).toBe(true);
    expect(reviewQ3.studentAnswer).toBeNull();
    expect(reviewQ3.correctAnswer).toBe("D");
    expect(reviewQ3.explanation).toBe("Explanation not available for this question.");
  });
});
