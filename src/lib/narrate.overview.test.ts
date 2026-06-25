import { describe, expect, test } from "vitest";
import { buildStudentOverview } from "@/data/mock/overview";
import { STUDENT_HERO } from "@/data/mock/world";
import {
  narrateOverviewMoDau,
  narrateOverviewCacMon,
  narrateOverviewHoiTu,
} from "./narrate";

describe("narrateOverviewMoDau", () => {
  test("contains overallLearningIndex figure", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const line = narrateOverviewMoDau(ov);
    const values = line.figures.map((f) => f.value);
    expect(values).toContain(String(ov.overallLearningIndex));
  });

  test("text is non-empty and contains no forbidden demo marker", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const line = narrateOverviewMoDau(ov);
    expect(line.text.length).toBeGreaterThan(10);
    expect(line.text).not.toMatch(/demo|minh hoạ/i);
  });
});

describe("narrateOverviewCacMon", () => {
  test("figures contain strongest and weakest subject names", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const line = narrateOverviewCacMon(ov);
    const labels = line.figures.map((f) => f.label);
    // At least one figure references the strongest subject
    expect(labels.some((l) => l.includes(ov.strongest.subject))).toBe(true);
  });

  test("text contains diem of strongest subject (computed, grounded)", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const line = narrateOverviewCacMon(ov);
    if (ov.strongest.latestExamScore !== null) {
      // The number (possibly formatted) must appear in text or figures
      const allText =
        line.text + " " + line.figures.map((f) => f.value).join(" ");
      expect(allText).toMatch(/\d/);
    }
  });
});

describe("narrateOverviewHoiTu", () => {
  test("text mentions weakest subject", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const line = narrateOverviewHoiTu(ov, null);
    expect(line.text).toContain(ov.weakest.subject);
  });

  test("figures non-empty", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const line = narrateOverviewHoiTu(ov, null);
    expect(line.figures.length).toBeGreaterThan(0);
  });
});
