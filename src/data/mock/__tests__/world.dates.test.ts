import { describe, it, expect } from "vitest";
import { DEMO_NOW, OFFICIAL_EXAM, KY_BOUNDARIES, KY_RANGE, cycleDate } from "@/data/mock/world";

const before = (a: string, b: string) => new Date(a).getTime() < new Date(b).getTime();

describe("mốc thời gian world", () => {
  it("DEMO_NOW sau thi thử (cuối Kỳ 2) và trước kỳ thi THPT", () => {
    expect(before(KY_RANGE["ky-2"].to, DEMO_NOW)).toBe(true);
    expect(before(DEMO_NOW, OFFICIAL_EXAM.date)).toBe(true);
  });

  it("ranh giới Kỳ 1 và Kỳ 2 tăng dần, không chồng lấn", () => {
    const b1 = KY_BOUNDARIES["ky-1"];
    const b2 = KY_BOUNDARIES["ky-2"];
    for (let i = 1; i < b1.length; i++) expect(before(b1[i - 1], b1[i])).toBe(true);
    for (let i = 1; i < b2.length; i++) expect(before(b2[i - 1], b2[i])).toBe(true);
    expect(before(b1[b1.length - 1], b2[0])).toBe(true);
  });

  it("ca-nam gộp ranh giới cả 2 kỳ", () => {
    expect(KY_BOUNDARIES["ca-nam"]).toEqual([...KY_BOUNDARIES["ky-1"], ...KY_BOUNDARIES["ky-2"]]);
  });

  it("cycleDate deterministic, nằm trong range của Kỳ và tăng theo idx", () => {
    const d0 = cycleDate("ky-1", 0, 5);
    const d1 = cycleDate("ky-1", 1, 5);
    expect(cycleDate("ky-1", 0, 5)).toBe(d0);
    expect(before(d0, d1)).toBe(true);
    expect(before(KY_RANGE["ky-1"].from, d0) || d0 === KY_RANGE["ky-1"].from).toBe(true);
    expect(before(d1, KY_RANGE["ky-1"].to)).toBe(true);
  });
});
