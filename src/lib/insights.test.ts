import { describe, expect, test } from "vitest";
import { examInsights } from "./insights";
import type { ExamCodeReport, QuestionReport } from "@/data/types";

function q(errorRate: number): QuestionReport {
  return {
    questionId: "q",
    topic: "Chủ đề",
    content: "…",
    correctAnswer: "A",
    commonWrong: "B",
    errorRate,
    correctRate: 1 - errorRate,
    numAnswered: 44,
    difficulty: "tb",
  };
}

const code1: ExamCodeReport = {
  examCode: "MÃ ĐỀ GỐC 1",
  numStudents: 44,
  avg: 7.97,
  median: 8,
  bands: [{ label: "5 – 6.49", count: 4, ratio: 0.09 }],
  histogram: [],
  topics: [{ topic: "Vùng kinh tế", numQuestions: 3, accuracy: 0.81 }],
  // 5 câu có correctRate < 0.7 (errorRate > 0.3)
  topMissed: [0.6364, 0.4773, 0.4545, 0.4318, 0.4318, 0.2727, 0.25, 0.2045].map(q),
  insights: [],
};

describe("examInsights", () => {
  test("nêu điểm trung bình", () => {
    expect(examInsights(code1, "mã đề gốc 1")[0]).toContain("Điểm trung bình mã đề gốc 1 là 7,97");
  });
  test("đếm đúng số câu sai nhiều (correctRate < 70%)", () => {
    const lines = examInsights(code1);
    expect(lines.some((l) => l.includes("5 câu"))).toBe(true);
  });
  test("nhắc nhóm 5–6,49 khi có học sinh", () => {
    const lines = examInsights(code1);
    expect(lines.some((l) => l.includes("nhóm 5–6,49"))).toBe(true);
  });
});
