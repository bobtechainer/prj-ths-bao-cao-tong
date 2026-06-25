import { describe, it, expect } from "vitest";
import { getClassOverview } from "@/data/mock/overview";
import { SUBJECTS } from "@/data/types";
import { CLASS_HERO } from "@/data/mock/world";

describe("getClassOverview", () => {
  const ov = getClassOverview(CLASS_HERO, "ky-1");

  it("đủ 8 môn, sắp mạnh→yếu theo examAvg", () => {
    expect(ov.subjects.length).toBe(SUBJECTS.length);
    const scored = ov.subjects.map((s) => s.examAvg ?? -Infinity);
    for (let i = 1; i < scored.length; i++) expect(scored[i - 1]).toBeGreaterThanOrEqual(scored[i]);
  });

  it("overallLearningIndex = trung bình learningIndex các môn", () => {
    const m = Math.round(ov.subjects.reduce((a, s) => a + s.learningIndex, 0) / ov.subjects.length);
    expect(ov.overallLearningIndex).toBe(m);
  });

  it("có chuyên cần + cần hỗ trợ ở cấp lớp", () => {
    expect(ov.attendanceRate).toBeGreaterThan(0);
    expect(ov.needSupport).toBeGreaterThanOrEqual(0);
  });

  it("strongest/weakest đúng đầu/cuối", () => {
    expect(ov.strongest).toBe(ov.subjects[0]);
    expect(ov.weakest).toBe(ov.subjects[ov.subjects.length - 1]);
  });

  it("deterministic (2 lần y hệt avg)", () => {
    const a = getClassOverview("son-tay-12-toán", "ky-1");
    const b = getClassOverview("son-tay-12-toán", "ky-1");
    expect(a.subjects.map((s) => s.examAvg)).toEqual(b.subjects.map((s) => s.examAvg));
  });
});
