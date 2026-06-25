import { describe, expect, test } from "vitest";
import { STUDENT_HERO } from "@/data/mock/world";
import { SUBJECTS } from "@/data/types";
import { buildStudentOverview } from "./overview";

describe("buildStudentOverview", () => {
  test("returns entries for all 8 subjects", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ca-nam");
    expect(overview.subjects).toHaveLength(SUBJECTS.length);
    for (const sub of SUBJECTS) {
      const entry = overview.subjects.find((e) => e.subject === sub);
      expect(entry, `missing subject ${sub}`).toBeDefined();
    }
  });

  test("each subject entry has numeric learningIndex in 0-100", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ca-nam");
    for (const e of overview.subjects) {
      expect(e.learningIndex).toBeGreaterThanOrEqual(0);
      expect(e.learningIndex).toBeLessThanOrEqual(100);
    }
  });

  test("overallLearningIndex equals mean of per-subject learningIndex", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const mean =
      overview.subjects.reduce((s, e) => s + e.learningIndex, 0) /
      overview.subjects.length;
    expect(overview.overallLearningIndex).toBeCloseTo(Math.round(mean), 0);
  });

  test("strongest has highest latestExamScore, weakest has lowest", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ky-1");
    const scores = overview.subjects
      .map((e) => e.latestExamScore ?? -Infinity);
    expect(overview.strongest.latestExamScore).toBe(Math.max(...scores));
    expect(overview.weakest.latestExamScore).toBe(Math.min(...scores));
  });

  test("subjects sorted strongest→weakest", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ky-2");
    const scores = overview.subjects.map((e) => e.latestExamScore ?? -Infinity);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  test("slice.subject === 'Tất cả môn', kind === 'overview'", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ca-nam");
    expect(overview.kind).toBe("overview");
    expect(overview.slice.subject).toBe("Tất cả môn");
  });
});
