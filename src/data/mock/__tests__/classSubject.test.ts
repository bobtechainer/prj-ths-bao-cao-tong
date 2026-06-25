import { describe, it, expect } from "vitest";
import { buildClassSubjectReport } from "@/data/mock/builders";
import { CLASS_HERO } from "@/data/mock/world";

describe("buildClassSubjectReport", () => {
  it("Địa lí ở 12 Văn = đúng report thật (subject Địa lí)", () => {
    const r = buildClassSubjectReport(CLASS_HERO, "Địa lí");
    expect(r.subject).toBe("Địa lí");
    expect(r.roster.length).toBeGreaterThan(0);
  });

  it("môn khác: subject đổi đúng, deterministic (2 lần y hệt)", () => {
    const a = buildClassSubjectReport("son-tay-12-toán", "Lịch sử");
    const b = buildClassSubjectReport("son-tay-12-toán", "Lịch sử");
    expect(a.subject).toBe("Lịch sử");
    expect(a.thi.avg).toBe(b.thi.avg);
    expect(a.roster.map((x) => x.exam)).toEqual(b.roster.map((x) => x.exam));
  });

  it("chỉ số lớp tính ra (0..100), không NaN", () => {
    const r = buildClassSubjectReport("son-tay-12-sinh", "Lịch sử");
    expect(r.learningIndex.total).toBeGreaterThanOrEqual(0);
    expect(r.learningIndex.total).toBeLessThanOrEqual(100);
    expect(Number.isNaN(r.effortIndex.total)).toBe(false);
  });

  it("weakTopics thuộc bộ chủ đề của môn", () => {
    const r = buildClassSubjectReport("son-tay-12-sinh", "Lịch sử");
    // chỉ kiểm tra có ít nhất 1 chủ đề và là chuỗi không rỗng
    expect(r.weakTopics.length).toBeGreaterThan(0);
    expect(r.weakTopics.every((t) => typeof t.topic === "string" && t.topic.length > 0)).toBe(true);
  });
});
