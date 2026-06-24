import { describe, it, expect } from "vitest";
import {
  studentExamsForKy, studentSessionsForKy, studentMissionsForKy, missionDate,
  buildStudentPrepSurface, buildClassPrepSurface,
} from "@/data/mock/builders";
import { partitionByCycle } from "@/lib/cycles";
import { KY_BOUNDARIES, KY_RANGE } from "@/data/mock/world";
import { STUDENT_HERO, CLASS_HERO } from "@/data/mock/world";

const inRange = (d: string, ky: "ky-1" | "ky-2" | "ca-nam") =>
  d >= KY_RANGE[ky].from && d <= KY_RANGE[ky].to;

describe("gắn ngày & trải Kỳ", () => {
  it("exams của Kỳ nằm trong range Kỳ và tăng dần", () => {
    const ex = studentExamsForKy(STUDENT_HERO, "ca-nam");
    expect(ex.length).toBeGreaterThan(0);
    for (const e of ex) expect(inRange(e.date, "ca-nam")).toBe(true);
    for (let i = 1; i < ex.length; i++) expect(ex[i - 1].date <= ex[i].date).toBe(true);
  });

  it("cắt chặng đúng: số buổi + số kỳ thi khớp số chặng (ca-nam = 4 mốc)", () => {
    const sessions = studentSessionsForKy(STUDENT_HERO, "ca-nam");
    const buckets = partitionByCycle(sessions, KY_BOUNDARIES["ca-nam"]);
    expect(buckets.length).toBe(4);
    // tổng buổi sau khi cắt = tổng buổi ban đầu (không mất sự kiện)
    expect(buckets.reduce((a, b) => a + b.length, 0)).toBe(sessions.length);
  });

  it("missionDate deterministic và nằm trong range", () => {
    const ms = studentMissionsForKy(STUDENT_HERO, "ky-2");
    const d0 = missionDate(STUDENT_HERO, "ky-2", 0, ms.length);
    expect(missionDate(STUDENT_HERO, "ky-2", 0, ms.length)).toBe(d0);
    expect(inRange(d0, "ky-2")).toBe(true);
  });

  it("PrepSurface học sinh: count <= total, số nguyên không âm", () => {
    const p = buildStudentPrepSurface(STUDENT_HERO, "ca-nam");
    for (const s of [p.xemTruoc, p.baiChuanBi, p.dungGio]) {
      expect(Number.isInteger(s.count)).toBe(true);
      expect(Number.isInteger(s.total)).toBe(true);
      expect(s.count).toBeLessThanOrEqual(s.total);
      expect(s.count).toBeGreaterThanOrEqual(0);
    }
  });

  it("PrepSurface lớp: total > 0", () => {
    const p = buildClassPrepSurface(CLASS_HERO, "ca-nam");
    expect(p.xemTruoc.total).toBeGreaterThan(0);
    expect(p.dungGio.count).toBeLessThanOrEqual(p.dungGio.total);
  });
});
