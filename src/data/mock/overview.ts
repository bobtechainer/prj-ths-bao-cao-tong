import type { ClassOverview, ClassSubjectEntry, Klass, Ky, StudentOverview, SubjectEntry } from "@/data/types";
import { SUBJECTS } from "@/data/types";
import { buildStudentSubjectSlice, buildStudentProfile, buildClassReport, buildClassSubjectReport } from "./builders";
import { DEMO_NOW, getWorld } from "./world";

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function buildStudentOverview(studentId: string, term: Ky): StudentOverview {
  const profile = buildStudentProfile(studentId);
  const student = profile.student;
  const className = profile.className;
  const schoolName = profile.schoolName;

  const subjects: SubjectEntry[] = SUBJECTS.map((subject) => {
    const slice = buildStudentSubjectSlice(studentId, term, subject);
    const latestExamScore = slice.exams.length > 0
      ? (slice.exams.at(-1)?.score ?? null)
      : null;
    return {
      subject,
      latestExamScore,
      learningIndex: slice.learningIndex.total,
      effortIndex: slice.effortIndex.total,
      rank: slice.rank,
      classSize: slice.classSize,
      trend: slice.trend,
      weakTopics: slice.weakTopics,
    };
  });

  // Sort strongest → weakest by latestExamScore (null goes last)
  const sorted = [...subjects].sort((a, b) => {
    const sa = a.latestExamScore ?? -Infinity;
    const sb = b.latestExamScore ?? -Infinity;
    return sb - sa;
  });

  const overallLearningIndex = Math.round(
    mean(sorted.map((e) => e.learningIndex))
  );

  // strongest/weakest by latestExamScore (prefer entries with actual scores)
  const withScore = sorted.filter((e) => e.latestExamScore !== null);
  const strongest = withScore[0] ?? sorted[0];
  const weakest = withScore[withScore.length - 1] ?? sorted[sorted.length - 1];

  return {
    kind: "overview",
    slice: { term, subject: "Tất cả môn" },
    now: DEMO_NOW,
    student,
    className,
    schoolName,
    subjects: sorted,
    overallLearningIndex,
    strongest,
    weakest,
    availableSlices: {
      terms: ["ky-1", "ky-2", "ca-nam"],
      subjects: ["Tất cả môn", ...SUBJECTS],
    },
  };
}

// Per-term cache: key = `${studentId}|${term}`
const overviewCache = new Map<string, StudentOverview>();

export function getStudentOverview(studentId: string, term: Ky): StudentOverview {
  const key = `${studentId}|${term}`;
  if (!overviewCache.has(key)) {
    overviewCache.set(key, buildStudentOverview(studentId, term));
  }
  return overviewCache.get(key)!;
}

export function buildClassOverview(classId: string, term: Ky): ClassOverview {
  const world = getWorld();
  const klass = world.classById.get(classId) as Klass;
  const schoolName = world.schoolById.get(klass.schoolId)?.name ?? "";

  const base = buildClassReport(classId); // chuyên cần + cần hỗ trợ THẬT (subject-agnostic)
  const attendanceRate =
    base.lop.attendance.present / (base.lop.attendance.present + base.lop.attendance.absent);
  const needSupport = base.roster.filter((r) => r.needSupport).length;

  const subjects: ClassSubjectEntry[] = SUBJECTS.map((subject) => {
    const r = buildClassSubjectReport(classId, subject);
    return {
      subject,
      examAvg: r.thi.avg,
      learningIndex: r.learningIndex.total,
      effortIndex: r.effortIndex.total,
      weakTopics: r.weakTopics,
    };
  });

  const sorted = [...subjects].sort((a, b) => (b.examAvg ?? -Infinity) - (a.examAvg ?? -Infinity));
  const overallLearningIndex = Math.round(mean(sorted.map((e) => e.learningIndex)));

  return {
    kind: "class-overview",
    slice: { term, subject: "Tất cả môn" },
    now: DEMO_NOW,
    klass,
    schoolName,
    numStudents: klass.studentIds.length,
    subjects: sorted,
    overallLearningIndex,
    attendanceRate,
    needSupport,
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
    availableSlices: { terms: ["ky-1", "ky-2", "ca-nam"], subjects: ["Tất cả môn", ...SUBJECTS] },
  };
}

const classOverviewCache = new Map<string, ClassOverview>();
export function getClassOverview(classId: string, term: Ky): ClassOverview {
  const key = `${classId}|${term}`;
  if (!classOverviewCache.has(key)) classOverviewCache.set(key, buildClassOverview(classId, term));
  return classOverviewCache.get(key)!;
}
