import { describe, it, expect } from "vitest";
import { buildStudentJourney } from "@/data/mock/journey";
import { buildStudentProfile } from "@/data/mock/builders";
import { STUDENT_HERO, DEMO_NOW } from "@/data/mock/world";
import { SUBJECTS } from "@/data/types";
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
    for (const c of j.cycles) {
      lines.push(c.lop.narration, c.nha.narration);
      if (c.exam?.narration) lines.push(c.exam.narration);
    }
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

  // ---- Multi-subject: NEW BEHAVIOR ----

  it("availableSlices.subjects bao gồm TẤT CẢ 8 môn học", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    expect(j.availableSlices.subjects).toEqual([...SUBJECTS]);
  });

  it("Toán: journey không rỗng, có cycles và convergence.topics", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Toán");
    expect(j.empty).toBe(false);
    expect(j.cycles.length).toBeGreaterThan(0);
    expect(j.convergence.topics.length).toBeGreaterThan(0);
  });

  it("Toán: cycles có ít nhất 1 session và mission", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Toán");
    const totalSessions = j.cycles.reduce((acc, c) => acc + c.lop.sessions.length, 0);
    const totalMissions = j.cycles.reduce((acc, c) => acc + c.nha.missions.length, 0);
    expect(totalSessions).toBeGreaterThan(0);
    expect(totalMissions).toBeGreaterThan(0);
  });

  it("Toán: overview indices được TÍNH từ số thô (total > 0)", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Toán");
    expect(j.overview.learningIndex.total).toBeGreaterThan(0);
    expect(j.overview.effortIndex.total).toBeGreaterThan(0);
  });

  it("Toán: narration có figures mang số", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Toán");
    const lines = [j.overview.narration, j.prep.narration, j.convergence.narration];
    for (const c of j.cycles) {
      lines.push(c.lop.narration, c.nha.narration);
      if (c.exam?.narration) lines.push(c.exam.narration);
    }
    for (const l of lines) {
      expect(l.figures.length).toBeGreaterThan(0);
      for (const f of l.figures) expect(/\d/.test(f.value)).toBe(true);
    }
  });

  it("Toán ca-nam: deterministic — hai lần gọi ra kết quả giống hệt nhau", () => {
    const j1 = buildStudentJourney(STUDENT_HERO, "ca-nam", "Toán");
    const j2 = buildStudentJourney(STUDENT_HERO, "ca-nam", "Toán");
    expect(j1.overview.learningIndex).toEqual(j2.overview.learningIndex);
    expect(j1.cycles.length).toBe(j2.cycles.length);
    expect(j1.convergence.topics).toEqual(j2.convergence.topics);
  });

  it("Vật lí: khác Toán về overview.learningIndex (dữ liệu seeded khác nhau)", () => {
    const jToan = buildStudentJourney(STUDENT_HERO, "ca-nam", "Toán");
    const jLi = buildStudentJourney(STUDENT_HERO, "ca-nam", "Vật lí");
    // Hai môn khác nhau phải cho chỉ số khác nhau (xác suất trùng gần 0)
    expect(jToan.overview.learningIndex.total).not.toBe(jLi.overview.learningIndex.total);
  });

  it("Địa lí: overview.learningIndex BẰNG learningIndex từ buildStudentProfile", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const profile = buildStudentProfile(STUDENT_HERO);
    expect(j.overview.learningIndex).toEqual(profile.learningIndex);
    expect(j.overview.effortIndex).toEqual(profile.effortIndex);
  });

  it("Địa lí: rank và classSize BẰNG buildStudentProfile", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const profile = buildStudentProfile(STUDENT_HERO);
    expect(j.overview.rank).toBe(profile.rank);
    expect(j.overview.classSize).toBe(profile.classSize);
  });
});
