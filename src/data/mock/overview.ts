import type { Ky, StudentOverview, SubjectEntry } from "@/data/types";
import { SUBJECTS } from "@/data/types";
import { buildStudentSubjectSlice, buildStudentProfile } from "./builders";
import { getWorld, DEMO_NOW } from "./world";

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function buildStudentOverview(studentId: string, term: Ky): StudentOverview {
  void getWorld(); // reserved for future use
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
