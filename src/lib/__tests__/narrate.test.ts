import { describe, it, expect } from "vitest";
import {
  narrateStudentOverview, narrateClassOverview, narratePrep,
  narrateClassroom, narrateHome, narrateExam, narrateClassExam, narrateConvergence,
} from "@/lib/narrate";
import type { IndexBreakdown, WeakTopic, UpcomingExam } from "@/data/types";

const idx = (total: number): IndexBreakdown => ({ total, parts: [], partial: undefined });
const topics: WeakTopic[] = [
  { topic: "Vùng kinh tế", surfaces: { lop: true, nha: false, thi: true }, confirmed: true, accuracyAvg: 0.48 },
];
const NEXT: UpcomingExam = { title: "Kỳ thi THPT chính thức", date: "2026-06-26" };

describe("narrate — figures luôn có số", () => {
  const all = [
    narrateStudentOverview({ rank: 5, classSize: 42, trend: "up", learningIndex: idx(78), effortIndex: idx(82) }),
    narrateClassOverview({ numStudents: 42, examAvg: 7.1, learningIndex: idx(74), effortIndex: idx(80), needSupport: 6 }),
    narratePrep({ xemTruoc: { count: 4, total: 5 }, baiChuanBi: { count: 3, total: 6 }, dungGio: { count: 5, total: 6 } }, true),
    narrateClassroom({ attendanceRate: 0.95, quizAccuracyAvg: 0.72, numSessions: 3 }, true),
    narrateHome({ completionRate: 0.86, onTimeRate: 0.8, avgScore: 7.4, numMissions: 4 }, true),
    narrateExam({ score: 7, classAvg: 7.2, term: "Thi thử gần nhất" }, "past", true),
    narrateClassExam({ avg: 7.1, median: 7.0, numStudents: 108, title: "Thi thử THPT môn Địa lí" }, "past"),
    narrateConvergence(topics, true, NEXT),
  ];
  it("mỗi câu có ít nhất 1 figure và mỗi figure mang số", () => {
    for (const line of all) {
      expect(line.figures.length).toBeGreaterThan(0);
      for (const f of line.figures) expect(/\d/.test(f.value)).toBe(true);
      expect(line.text.length).toBeGreaterThan(0);
    }
  });
});

describe("narrate — deterministic", () => {
  it("gọi 2 lần ra y hệt", () => {
    const a = narrateConvergence(topics, false, NEXT);
    const b = narrateConvergence(topics, false, NEXT);
    expect(a).toEqual(b);
    const c = narrateExam({ score: 8, classAvg: 7, term: "Thi thử gần nhất" }, "past", true);
    const d = narrateExam({ score: 8, classAvg: 7, term: "Thi thử gần nhất" }, "past", true);
    expect(c).toEqual(d);
  });
});

describe("narrate — ĐÚNG THÌ", () => {
  it("nextExam=null ⇒ KHÔNG chứa 'chữa trước', dùng 'ôn/củng cố lại'", () => {
    const line = narrateConvergence(topics, false, null);
    expect(line.text).not.toContain("chữa trước");
    expect(/ôn|củng cố/.test(line.text)).toBe(true);
  });
  it("nextExam!=null ⇒ chứa 'trước {title}'", () => {
    const line = narrateConvergence(topics, false, NEXT);
    expect(line.text).toContain("trước " + NEXT.title);
  });
  it("gentle (học sinh) dùng 'nên ôn lại'; giáo viên dùng 'nên chữa trước' khi có nextExam", () => {
    expect(narrateConvergence(topics, true, NEXT).text).toContain("nên ôn lại");
    expect(narrateConvergence(topics, false, NEXT).text).toContain("nên chữa trước");
  });
});

describe("narrateClassExam — không so avg với chính nó", () => {
  it("dùng trung vị + N, không có cụm 'so với trung bình'", () => {
    const line = narrateClassExam({ avg: 7.1, median: 7.0, numStudents: 108, title: "Thi thử THPT môn Địa lí" }, "past");
    const labels = line.figures.map((f) => f.label.toLowerCase());
    expect(labels.some((l) => l.includes("trung vị"))).toBe(true);
    expect(labels.some((l) => l.includes("số bài") || l.includes("bài"))).toBe(true);
    expect(line.text).not.toContain("so với trung bình");
  });
});
