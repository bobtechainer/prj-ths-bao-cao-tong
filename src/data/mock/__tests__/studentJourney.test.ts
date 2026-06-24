import { describe, it, expect } from "vitest";
import { buildStudentJourney } from "@/data/mock/journey";
import { buildStudentProfile } from "@/data/mock/builders";
import { STUDENT_HERO, DEMO_NOW } from "@/data/mock/world";
import { statusOf } from "@/lib/cycles";

describe("buildStudentJourney", () => {
  it("convergence.topics LẤY NGUYÊN weakTopics của profile (giữ accuracyAvg thật)", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const profile = buildStudentProfile(STUDENT_HERO);
    expect(j.convergence.topics).toEqual(profile.weakTopics);
  });

  it("now = DEMO_NOW và kind='student'", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    expect(j.now).toBe(DEMO_NOW);
    expect(j.kind).toBe("student");
  });

  it("trạng thái chặng đúng theo statusOf(range.to, now)", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    for (const c of j.cycles) {
      expect(c.status).toBe(statusOf(c.range.to, DEMO_NOW));
    }
  });

  it("mỗi narration có figures mang số", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const lines = [j.overview.narration, j.prep.narration, j.convergence.narration];
    for (const c of j.cycles) lines.push(c.lop.narration, c.nha.narration);
    for (const l of lines) {
      expect(l.figures.length).toBeGreaterThan(0);
      for (const f of l.figures) expect(/\d/.test(f.value)).toBe(true);
    }
  });

  it("nextExam còn tương lai (OFFICIAL_EXAM sau DEMO_NOW)", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    expect(j.convergence.nextExam).not.toBeNull();
    expect(j.convergence.nextExam!.title).toBe("Kỳ thi THPT chính thức");
  });

  it("lát rỗng → empty=true", () => {
    // môn không có dữ liệu trong profile (profile chỉ sinh Địa lí) → không có exam/buổi/nhiệm vụ Địa lí cho Toán
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Toán");
    expect(j.empty).toBe(true);
  });
});
