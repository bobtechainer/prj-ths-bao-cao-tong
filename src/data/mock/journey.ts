import type {
  Ky, Subject, StudentJourney, StudentCycle,
  CycleSession, MissionStudentReportView,
  ClassJourney, ClassCycle,
} from "@/data/types";
import { SUBJECTS } from "@/data/types";
import {
  buildStudentProfile, buildClassReport,
  buildStudentSubjectSlice,
  studentExamsForKy, missionDate,
  buildClassPrepSurface,
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
  narrateClassOverview, narrateClassExam,
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

  // Lát môn: Địa lí dùng dữ liệu thật; môn khác dùng dữ liệu seeded deterministic.
  const slice = buildStudentSubjectSlice(studentId, term, subject);
  const exams: DatedExam[] = slice.exams;
  const sessions = slice.sessions;
  const missions: MissionStudentReportView[] = slice.missions;

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

  const prepSurface = slice.prep;
  const empty = exams.length === 0 && sessions.length === 0 && missions.length === 0;

  return {
    kind: "student",
    slice: { term, subject },
    now,
    student: profile.student,
    className: profile.className,
    schoolName: profile.schoolName,
    overview: {
      rank: slice.rank,
      classSize: slice.classSize,
      trend: slice.trend,
      learningIndex: slice.learningIndex,
      effortIndex: slice.effortIndex,
      narration: narrateStudentOverview({
        rank: slice.rank,
        classSize: slice.classSize,
        trend: slice.trend,
        learningIndex: slice.learningIndex,
        effortIndex: slice.effortIndex,
      }),
    },
    prep: { surface: prepSurface, narration: narratePrep(prepSurface, true) },
    cycles,
    convergence: {
      // ERRATA: convergence.topics = profile.weakTopics DIRECTLY cho Địa lí (keep real accuracyAvg)
      topics: slice.weakTopics,
      nextExam,
      narration: narrateConvergence(slice.weakTopics, true, nextExam),
    },
    availableSlices: { terms: ["ky-1", "ky-2", "ca-nam"], subjects: [...SUBJECTS] },
    empty,
  };
}

export function buildClassJourney(classId: string, term: Ky, subject: Subject): ClassJourney {
  const report = buildClassReport(classId);
  const now = DEMO_NOW;
  const nextExam = resolveNextExam(now);
  const boundaries = KY_BOUNDARIES[term];

  const needSupportRows = report.roster.filter((r) => r.needSupport);
  const completionRate = mean(report.nha.missions.map((m) => m.completionRate));

  const cycles: ClassCycle[] = boundaries.map((_, k) => {
    const range = cycleRange(term, k, boundaries);
    const status = statusOf(range.to, now);
    const isLast = k === boundaries.length - 1;
    return {
      id: `ccyc-${k}`,
      label: `Chặng ${k + 1}`,
      range,
      status,
      lop: {
        session: report.lop,
        narration: narrateClassroom(
          {
            attendanceRate:
              report.lop.attendance.present /
              (report.lop.attendance.present + report.lop.attendance.absent),
            quizAccuracyAvg: mean(report.lop.quizzes.map((q) => q.accuracy)),
            numSessions: 1,
          },
          false
        ),
      },
      nha: {
        report: report.nha,
        completionRate,
        narration: narrateHome(
          {
            completionRate,
            onTimeRate: report.nha.students.filter((s) => !s.late).length / report.nha.students.length,
            avgScore: Math.round(mean(report.nha.missions.map((m) => m.avgScore)) * 10) / 10,
            numMissions: report.nha.missions.length,
          },
          false
        ),
      },
      exam: isLast
        ? {
            report: report.thi,
            narration: narrateClassExam(
              {
                avg: report.thi.avg,
                median: report.thi.median,
                numStudents: report.thi.numStudents,
                title: report.thi.title,
              },
              status
            ),
          }
        : null,
    };
  });

  const prepSurface = buildClassPrepSurface(classId, term);
  const examAvg = report.thi.avg;

  return {
    kind: "class",
    slice: { term, subject },
    now,
    klass: report.klass,
    schoolName: getWorld().schoolById.get(report.klass.schoolId)?.name ?? "",
    roster: report.roster,
    overview: {
      numStudents: report.students.length,
      examAvg,
      learningIndex: report.learningIndex,
      effortIndex: report.effortIndex,
      needSupport: needSupportRows.length,
      narration: narrateClassOverview({
        numStudents: report.students.length,
        examAvg,
        learningIndex: report.learningIndex,
        effortIndex: report.effortIndex,
        needSupport: needSupportRows.length,
      }),
    },
    prep: { surface: prepSurface, narration: narratePrep(prepSurface, false) },
    cycles,
    convergence: {
      topics: report.weakTopics,
      needSupport: needSupportRows,
      nextExam,
      narration: narrateConvergence(report.weakTopics, false, nextExam),
    },
    availableSlices: { terms: ["ky-1", "ky-2", "ca-nam"], subjects: [report.subject] },
    empty: report.students.length === 0,
  };
}
