import { describe, it, expect } from "vitest";
import { narrateClassOverviewMoDau, narrateClassOverviewCacMon, narrateClassOverviewHoiTu } from "@/lib/narrate";
import type { ClassOverview, UpcomingExam } from "@/data/types";

const ov: ClassOverview = {
  kind: "class-overview",
  slice: { term: "ky-1", subject: "Tất cả môn" },
  now: "2026-06-10",
  klass: { id: "c", schoolId: "s", khoi: 12, name: "12 Văn", focus: "Văn", homeroomTeacher: "Cô Hồng", studentIds: ["a", "b"] },
  schoolName: "Sơn Tây",
  numStudents: 42,
  subjects: [
    { subject: "Vật lí", examAvg: 7.6, learningIndex: 78, effortIndex: 80, weakTopics: [] },
    { subject: "Địa lí", examAvg: 6.2, learningIndex: 64, effortIndex: 70,
      weakTopics: [{ topic: "Vùng kinh tế", surfaces: { lop: true, nha: false, thi: true }, confirmed: true, accuracyAvg: 0.48 }] },
  ],
  overallLearningIndex: 71,
  attendanceRate: 0.96,
  needSupport: 6,
  strongest: { subject: "Vật lí", examAvg: 7.6, learningIndex: 78, effortIndex: 80, weakTopics: [] },
  weakest: { subject: "Địa lí", examAvg: 6.2, learningIndex: 64, effortIndex: 70, weakTopics: [] },
  availableSlices: { terms: ["ky-1", "ky-2", "ca-nam"], subjects: ["Tất cả môn"] },
};
const NEXT: UpcomingExam = { title: "Kỳ thi THPT chính thức", date: "2026-06-26" };

describe("narrate class overview", () => {
  it("mỗi câu có figure mang số", () => {
    for (const l of [narrateClassOverviewMoDau(ov), narrateClassOverviewCacMon(ov), narrateClassOverviewHoiTu(ov, NEXT)]) {
      expect(l.figures.length).toBeGreaterThan(0);
      for (const f of l.figures) expect(/\d/.test(f.value)).toBe(true);
      expect(l.text.length).toBeGreaterThan(0);
    }
  });
  it("ĐÚNG THÌ: nextExam=null không có 'trước'", () => {
    expect(narrateClassOverviewHoiTu(ov, null).text).not.toContain("trước Kỳ thi");
  });
  it("nextExam!=null có 'trước {title}'", () => {
    expect(narrateClassOverviewHoiTu(ov, NEXT).text).toContain("trước " + NEXT.title);
  });
  it("figure value luôn mang chữ số kể cả khi examAvg là null", () => {
    const nullOv: ClassOverview = {
      ...ov,
      needSupport: 0,
      strongest: { ...ov.strongest, examAvg: null, learningIndex: 55 },
      weakest: { ...ov.weakest, examAvg: null, learningIndex: 40 },
    };
    for (const l of [narrateClassOverviewCacMon(nullOv), narrateClassOverviewHoiTu(nullOv, null)]) {
      expect(l.figures.length).toBeGreaterThan(0);
      for (const f of l.figures) expect(/\d/.test(f.value)).toBe(true);
    }
  });
});
