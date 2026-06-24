import type {
  Ky, Subject, StudentJourney, StudentCycle,
  CycleSession, MissionStudentReportView,
} from "@/data/types";
import {
  buildStudentProfile, buildClassReport,
  studentExamsForKy, studentSessionsForKy, studentMissionsForKy, missionDate,
  buildStudentPrepSurface,
  type DatedExam,
} from "./builders";
import {
  getWorld, DEMO_NOW, OFFICIAL_EXAM, KY_BOUNDARIES, KY_RANGE,
} from "./world";
import { statusOf, partitionByCycle } from "@/lib/cycles";
import { mean } from "@/lib/metrics";
import {
  narrateStudentOverview, narratePrep,
  narrateClassroom, narrateHome, narrateExam, narrateConvergence,
} from "@/lib/narrate";
import type { UpcomingExam } from "@/data/types";

function resolveNextExam(now: string): UpcomingExam | null {
  return statusOf(OFFICIAL_EXAM.date, now) === "upcoming" ? OFFICIAL_EXAM : null;
}

function cycleRange(term: Ky, idx: number, boundaries: string[]): { from: string; to: string } {
  const from = idx === 0 ? KY_RANGE[term].from : boundaries[idx - 1];
  const to = boundaries[idx] ?? KY_RANGE[term].to;
  return { from, to };
}

function avgOrNull(xs: number[]): number | null {
  return xs.length ? Math.round(mean(xs) * 10) / 10 : null;
}

export function buildStudentJourney(studentId: string, term: Ky, subject: Subject): StudentJourney {
  const world = getWorld();
  const profile = buildStudentProfile(studentId);
  const now = DEMO_NOW;
  const nextExam = resolveNextExam(now);

  // Lát môn: profile hiện chỉ có Địa lí → môn khác là lát rỗng.
  const subjectMatches = subject === "Địa lí";
  const exams: DatedExam[] = subjectMatches ? studentExamsForKy(studentId, term) : [];
  const sessions = subjectMatches ? studentSessionsForKy(studentId, term) : [];
  const missions: MissionStudentReportView[] = subjectMatches ? studentMissionsForKy(studentId, term) : [];

  const boundaries = KY_BOUNDARIES[term];
  const sessionBuckets = partitionByCycle(sessions, boundaries);
  const examBuckets = partitionByCycle(exams, boundaries);
  const missionDated = missions.map((m, i) => ({ m, date: missionDate(studentId, term, i, missions.length) }));
  const missionBuckets = partitionByCycle(missionDated, boundaries);

  const examId = world.classById.get(profile.student.classId)
    ? buildClassReport(profile.student.classId).thi.examId
    : "sontay-dia-thithu-1";

  const cycles: StudentCycle[] = boundaries.map((_, k) => {
    const range = cycleRange(term, k, boundaries);
    const status = statusOf(range.to, now);
    const cSessions: CycleSession[] = sessionBuckets[k] ?? [];
    const cMissions = (missionBuckets[k] ?? []).map((x) => x.m);
    // ERRATA: use .at(-1) to avoid off-by-one
    const cExam = (examBuckets[k] ?? []).at(-1) ?? null;

    const attendanceRate = cSessions.length ? mean(cSessions.map((s) => s.attendance)) : 0;
    const quizAccuracyAvg = cSessions.length ? mean(cSessions.map((s) => s.quizAccuracy)) : 0;
    const graded = cMissions.filter((m) => m.status === "graded" || m.status === "submitted");
    const completionRate = cMissions.length ? graded.length / cMissions.length : 0;
    const onTimeRate = cMissions.length ? cMissions.filter((m) => !m.late).length / cMissions.length : 0;
    const avgScore = avgOrNull(
      graded.map((m) => m.totalScore).filter((v): v is number => v != null)
    );

    return {
      id: `cyc-${k}`,
      label: `Chặng ${k + 1}`,
      range,
      status,
      lop: {
        sessions: cSessions,
        attendanceRate,
        quizAccuracyAvg,
        narration: narrateClassroom(
          { attendanceRate, quizAccuracyAvg, numSessions: cSessions.length },
          true
        ),
      },
      nha: {
        missions: cMissions,
        completionRate,
        onTimeRate,
        avgScore,
        narration: narrateHome(
          { completionRate, onTimeRate, avgScore, numMissions: cMissions.length },
          true
        ),
      },
      exam: cExam
        ? {
            examId,
            submissionKey: "s:" + studentId,
            term: cExam.term,
            date: cExam.date,
            score: cExam.score,
            classAvg: cExam.classAvg,
            narration: narrateExam(
              { score: cExam.score, classAvg: cExam.classAvg, term: cExam.term },
              status,
              true
            ),
          }
        : null,
    };
  });

  const prepSurface = buildStudentPrepSurface(studentId, term);
  const empty = !subjectMatches || (exams.length === 0 && sessions.length === 0 && missions.length === 0);

  return {
    kind: "student",
    slice: { term, subject },
    now,
    student: profile.student,
    className: profile.className,
    schoolName: profile.schoolName,
    overview: {
      rank: profile.rank,
      classSize: profile.classSize,
      trend: profile.trend,
      learningIndex: profile.learningIndex,
      effortIndex: profile.effortIndex,
      narration: narrateStudentOverview({
        rank: profile.rank,
        classSize: profile.classSize,
        trend: profile.trend,
        learningIndex: profile.learningIndex,
        effortIndex: profile.effortIndex,
      }),
    },
    prep: { surface: prepSurface, narration: narratePrep(prepSurface, true) },
    cycles,
    convergence: {
      // ERRATA: convergence.topics = profile.weakTopics DIRECTLY (keep real accuracyAvg)
      topics: profile.weakTopics,
      nextExam,
      narration: narrateConvergence(profile.weakTopics, true, nextExam),
    },
    availableSlices: { terms: ["ky-1", "ky-2", "ca-nam"], subjects: ["Địa lí"] },
    empty,
  };
}
