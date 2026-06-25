import type { ReportRepository } from "./repository";
import type { ClassJourney, ClassReport, ExamPaper, Ky, MissionDetail, SchoolReport, StudentJourney, StudentProfile, Subject } from "./types";
import { getWorld, getHongTeaching, getHongProfile, CLASS_HERO, DIA_TOPICS } from "./mock/world";
import { getStudentOverview, getClassOverview } from "./mock/overview";
import { ACCOUNTS } from "./mock/accounts";
import { buildClassReport, buildPhong, buildSchoolReport, buildStudentProfile } from "./mock/builders";
import {
  buildExamPaper, buildExamSubmission, buildMissionDetail, buildMissionSubmission,
} from "./mock/questions";
import { buildStudentJourney, buildClassJourney } from "./mock/journey";
import { Rng } from "@/lib/random";

const classCache = new Map<string, ClassReport>();
const schoolCache = new Map<string, SchoolReport>();
const studentCache = new Map<string, StudentProfile>();
const paperCache = new Map<string, ExamPaper>();
const missionCache = new Map<string, MissionDetail>();
const studentJourneyCache = new Map<string, StudentJourney>();
const classJourneyCache = new Map<string, ClassJourney>();

function classIdOfExam(examId: string): string {
  return examId.startsWith("exam-") ? examId.slice(5) : CLASS_HERO;
}
function splitId(prefixed: string, prefixLen: number): { base: string; index: number } {
  const rest = prefixed.slice(prefixLen);
  const li = rest.lastIndexOf("-");
  return { base: rest.slice(0, li), index: Number(rest.slice(li + 1)) };
}

function getClassReport(classId: string): ClassReport {
  if (!classCache.has(classId)) classCache.set(classId, buildClassReport(classId));
  return classCache.get(classId)!;
}
function getStudentProfile(studentId: string): StudentProfile {
  if (!studentCache.has(studentId)) studentCache.set(studentId, buildStudentProfile(studentId));
  return studentCache.get(studentId)!;
}

export const mockRepository: ReportRepository = {
  getAccounts: () => ACCOUNTS,
  getAccount: (id) => ACCOUNTS.find((a) => a.id === id),
  getSchools: () => getWorld().schools,
  getClassesOfSchool: (schoolId) => getWorld().classes.filter((c) => c.schoolId === schoolId),
  getStudentsOfClass: (classId) => {
    const w = getWorld();
    const k = w.classById.get(classId);
    return k ? k.studentIds.map((id) => w.byId.get(id)!) : [];
  },
  getClass: (classId) => getWorld().classById.get(classId),
  getSchool: (schoolId) => getWorld().schoolById.get(schoolId),
  getPhongOverview: () => buildPhong(),
  getSchoolReport: (schoolId) => {
    if (!schoolCache.has(schoolId)) schoolCache.set(schoolId, buildSchoolReport(schoolId));
    return schoolCache.get(schoolId)!;
  },
  getClassReport,
  getStudentProfile,
  getTeaching: () => getHongTeaching(),
  getTeacherProfile: (_teacherId: string) => getHongProfile(),

  getStudentJourney: (studentId: string, term: Ky, subject: Subject) => {
    const key = `${studentId}|${term}|${subject}`;
    if (!studentJourneyCache.has(key)) studentJourneyCache.set(key, buildStudentJourney(studentId, term, subject));
    return studentJourneyCache.get(key)!;
  },
  getClassJourney: (classId: string, term: Ky, subject: Subject) => {
    const key = `${classId}|${term}|${subject}`;
    if (!classJourneyCache.has(key)) classJourneyCache.set(key, buildClassJourney(classId, term, subject));
    return classJourneyCache.get(key)!;
  },
  getStudentOverview: (studentId: string, term: Ky) => getStudentOverview(studentId, term),
  getClassOverview: (classId: string, term: Ky) => getClassOverview(classId, term),

  getExamPaper: (examId) => {
    if (!paperCache.has(examId)) paperCache.set(examId, buildExamPaper(getClassReport(classIdOfExam(examId)).thi));
    return paperCache.get(examId)!;
  },

  getStudentExamSubmission: (examId, key) => {
    const paper = mockRepository.getExamPaper(examId);
    const report = getClassReport(classIdOfExam(examId)).thi;
    let name = "Học sinh", score = 0, correct = 0, strong = "—", weak = "—";
    if (key.startsWith("c")) {
      const idx = Number(key.slice(1));
      const d = report.studentDetail[idx] ?? report.studentDetail[0];
      ({ name, score, correct, strong, weak } = { name: d.name, score: d.score, correct: d.correct, strong: d.strong, weak: d.weak });
    } else {
      const sid = key.startsWith("s:") ? key.slice(2) : key;
      const w = getWorld();
      const student = w.byId.get(sid);
      name = student?.name ?? "Học sinh";
      const real = student ? w.realByName.get(student.name) : undefined;
      if (real) {
        score = real.diem; correct = real.soCauDung; strong = real.tot; weak = real.yeu;
      } else {
        const p = getStudentProfile(sid);
        score = p.exams[p.exams.length - 1].score;
        correct = Math.round((score / 10) * paper.questions.length);
        strong = p.strongTopics.join(", ");
        weak = p.weakTopics.map((t) => t.topic).join(", ");
      }
    }
    return buildExamSubmission(paper, key, name, score, correct, strong, weak);
  },

  getMissionDetail: (missionId) => {
    if (missionCache.has(missionId)) return missionCache.get(missionId)!;
    let detail: MissionDetail;
    if (missionId.startsWith("pm-")) {
      const { base: studentId, index } = splitId(missionId, 3);
      const p = getStudentProfile(studentId);
      const m = p.missions[index] ?? p.missions[0];
      detail = buildMissionDetail(missionId, m?.title ?? "Nhiệm vụ", "Địa lí", DIA_TOPICS, 42, 38, 7.6);
    } else {
      const { base: classId, index } = splitId(missionId, 2);
      const m = getClassReport(classId).nha.missions[index] ?? getClassReport(classId).nha.missions[0];
      detail = buildMissionDetail(missionId, m.title, m.subject, DIA_TOPICS, m.total, m.completed, m.avgScore);
    }
    missionCache.set(missionId, detail);
    return detail;
  },

  getStudentMissionSubmission: (missionId, studentId) => {
    const detail = mockRepository.getMissionDetail(missionId);
    const name = getWorld().byId.get(studentId)?.name ?? "Học sinh";
    const rng = new Rng("msub-status-" + missionId + "-" + studentId);
    const status = (["graded", "graded", "submitted", "graded", "inprogress"] as const)[rng.int(0, 4)];
    const done = status === "graded" || status === "submitted";
    const correct = done ? rng.int(6, 10) : 0;
    const score = done ? Math.round((correct / 10) * 10 * 10) / 10 : null;
    return buildMissionSubmission(detail, studentId, name, status, score, correct, done ? rng.int(400, 1400) : 0);
  },
};
