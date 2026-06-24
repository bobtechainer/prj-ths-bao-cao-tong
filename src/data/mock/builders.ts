import type {
  ClassReport, ClassRosterRow, EngagementPoint, ExamCodeReport, ExamReport, HomeReport,
  Ky, MissionReportView, MissionStudentReportView, PhongOverview, PhongSchoolRow, PrepSurface,
  QuestionReport, SchoolReport, SessionAnalytics, Student, StudentProfile, Subject, TopicAccuracy,
  WeakTopic,
} from "@/data/types";
import { SUBJECTS } from "@/data/types";
import { mean, median, toBands, histogram, normalize } from "@/lib/metrics";
import { learningIndex, effortIndex, convergeWeakTopics } from "@/lib/indices";
import { examInsights } from "@/lib/insights";
import { Rng } from "@/lib/random";
import {
  getWorld, CLASS_HERO, SCHOOL_HERO, DIA_TOPICS, cycleDate,
} from "./world";
import {
  REAL_STUDENTS, REAL_CODE1, REAL_CODE2, REAL_MISSED_1, REAL_MISSED_2, REAL_HIST_TOTAL,
  type RealMissed, type RealCode,
} from "./sontay.real";

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Chủ đề khó hơn (bám theo dữ liệu thật: HS hay mất điểm các chủ đề này).
const TOPIC_BIAS: Record<string, number> = {
  "Ngoại thương và kinh tế": -0.26,
  "Vùng kinh tế": -0.16,
  "Dân cư và đô thị hóa": -0.18,
};

function difficultyOf(errorRate: number): QuestionReport["difficulty"] {
  return errorRate >= 0.5 ? "kho" : errorRate >= 0.3 ? "tb" : "de";
}

function missedToQuestion(m: RealMissed, code: string, i: number, soHs: number): QuestionReport {
  return {
    questionId: `${code}-q${i}`,
    topic: m.chuDe,
    content: m.noiDung,
    correctAnswer: m.dapAnDung,
    commonWrong: m.saiPhoBien,
    errorRate: m.tyLeSai,
    correctRate: r1(1 - m.tyLeSai) ,
    numAnswered: soHs,
    difficulty: difficultyOf(m.tyLeSai),
  };
}

function codeReport(code: string, real: RealCode, missed: RealMissed[]): ExamCodeReport {
  const studentsOfCode = REAL_STUDENTS.filter((s) => s.code === code);
  const diems = studentsOfCode.map((s) => s.diem);
  const topMissed = missed.map((m, i) => missedToQuestion(m, code, i, real.soHs));
  const topics: TopicAccuracy[] = real.topics.map((t) => ({
    topic: t.chuDe,
    numQuestions: t.soCau,
    accuracy: t.tyLeDung,
  }));
  const cr: ExamCodeReport = {
    examCode: code,
    numStudents: real.soHs,
    avg: real.diemTb,
    median: real.trungVi,
    bands: toBands(diems, 10),
    histogram: real.hist,
    topics,
    topMissed,
    insights: [],
  };
  cr.insights = examInsights(cr, code.replace("MÃ ĐỀ GỐC", "mã đề gốc").toLowerCase());
  return cr;
}

/** ExamReport THẬT của lớp/khối hero (Địa lí Sơn Tây, 108 HS). */
export function buildHeroExam(): ExamReport {
  const allDiem = REAL_STUDENTS.map((s) => s.diem);
  const c1 = codeReport("MÃ ĐỀ GỐC 1", REAL_CODE1, REAL_MISSED_1);
  const c2 = codeReport("MÃ ĐỀ GỐC 2", REAL_CODE2, REAL_MISSED_2);
  return {
    examId: "sontay-dia-thithu-1",
    title: "Thi thử THPT môn Địa lí",
    subject: "Địa lí",
    term: "Học kì 1 · 2025–2026",
    numStudents: REAL_STUDENTS.length,
    avg: r2(mean(allDiem)),
    median: median(allDiem),
    bands: toBands(allDiem, 10),
    histogram: REAL_HIST_TOTAL,
    codes: [c1, c2],
    topMissedByCode: [
      { examCode: c1.examCode, questions: c1.topMissed },
      { examCode: c2.examCode, questions: c2.topMissed },
    ],
    studentDetail: REAL_STUDENTS.map((s) => ({
      name: s.name,
      examCode: s.code,
      score: s.diem,
      correct: s.soCauDung,
      strong: s.tot,
      weak: s.yeu,
    })),
  };
}

function genScores(rng: Rng, n: number, m: number, sd: number): number[] {
  return Array.from({ length: n }, () => r1(clamp(rng.gauss(m, sd, 0, 10), 0, 10)));
}

function topicAccuracies(rng: Rng, base: number): TopicAccuracy[] {
  return DIA_TOPICS.map((topic) => ({
    topic,
    numQuestions: rng.int(2, 7),
    accuracy: clamp(rng.gauss(base, 0.07) + (TOPIC_BIAS[topic] ?? 0), 0.2, 0.98),
  }));
}

/** ExamReport sinh cho lớp không phải hero. */
export function buildGeneratedExam(classId: string, subject: Subject): ExamReport {
  const rng = new Rng("exam-" + classId);
  const members = getWorld().classById.get(classId)?.studentIds.map((id) => getWorld().byId.get(id)!) ?? [];
  const n = members.length || rng.int(36, 42);
  const m = rng.range(6.6, 8.1);
  const diems = genScores(rng, n, m, 1.2);
  const topics = topicAccuracies(rng, m / 10);
  const sortedTopics = [...topics].sort((a, b) => b.accuracy - a.accuracy);
  const strongTopics = sortedTopics.slice(0, 2).map((t) => t.topic).join(", ");
  const weakTopics = sortedTopics.slice(-2).map((t) => t.topic).join(", ");
  const studentDetail = members.map((mem, i) => ({
    name: mem.name,
    examCode: "MÃ ĐỀ 01",
    score: diems[i],
    correct: Math.round((diems[i] / 10) * 40),
    strong: strongTopics,
    weak: weakTopics,
  }));
  const topMissed = topics
    .slice()
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 8)
    .map((t, i) => ({
      questionId: `g-${classId}-q${i}`,
      topic: t.topic,
      content: `Câu hỏi về ${t.topic.toLowerCase()}.`,
      correctAnswer: "Phương án đúng",
      commonWrong: "Phương án nhiễu các em hay chọn",
      errorRate: r1(1 - t.accuracy),
      correctRate: r1(t.accuracy),
      numAnswered: n,
      difficulty: difficultyOf(1 - t.accuracy),
    }));
  const code: ExamCodeReport = {
    examCode: "MÃ ĐỀ 01",
    numStudents: n,
    avg: r1(mean(diems)),
    median: median(diems),
    bands: toBands(diems, 10),
    histogram: histogram(diems, 0.5),
    topics,
    topMissed,
    insights: [],
  };
  code.insights = examInsights(code, "đề này");
  return {
    examId: "exam-" + classId,
    title: `Thi thử môn ${subject}`,
    subject,
    term: "Học kì 1 · 2025–2026",
    numStudents: n,
    avg: code.avg,
    median: code.median,
    bands: code.bands,
    histogram: code.histogram,
    codes: [code],
    topMissedByCode: [{ examCode: code.examCode, questions: topMissed }],
    studentDetail,
  };
}

export function buildSession(classId: string, members: Student[]): SessionAnalytics {
  const rng = new Rng("session-" + classId);
  const total = members.length;
  const absent = rng.int(0, 2);
  const late = rng.int(1, 4);
  const leftEarly = rng.int(0, 2);
  const present = total - absent;
  const durationMin = 45;
  // SỐ THÔ: số lượt tương tác (giơ tay + trả lời) ghi nhận mỗi 5 phút — không phải chỉ số tổng hợp.
  const markersAt: Record<number, string> = { 10: "Quiz 1", 25: "Trò chơi", 35: "Quiz 2" };
  const engagement: EngagementPoint[] = Array.from({ length: 10 }, (_, i) => {
    const minute = i * 5;
    const peak = markersAt[minute] ? rng.int(6, 10) : 0;
    return { t: minute, score: rng.int(2, 6) + peak, marker: markersAt[minute] };
  });
  const quizzes = [1, 2, 3, 4].map((i) => ({
    q: `Câu hỏi nhanh ${i}`,
    accuracy: clamp(rng.gauss(0.72, 0.12), 0.3, 0.98),
    avgTimeSec: rng.int(8, 22),
  }));
  const leaderboard = members
    .slice(0, 8)
    .map((s, i) => ({
      studentId: s.id,
      studentName: s.name,
      rank: i + 1,
      score: 0,
      correct: rng.int(5, 10),
      wrong: rng.int(0, 4),
      streak: rng.int(1, 6),
    }))
    .map((x) => ({ ...x, score: x.correct * 100 - x.wrong * 10 }))
    .sort((a, b) => b.score - a.score)
    .map((x, i) => ({ ...x, rank: i + 1 }));
  return {
    sessionId: "ses-" + classId,
    classId,
    date: "2026-05-20",
    durationMin,
    attendance: { present, absent, late, leftEarly },
    engagement,
    quizzes,
    leaderboard,
    topics: topicAccuracies(rng, 0.73),
  };
}

export function buildHome(classId: string, members: Student[]): HomeReport {
  const rng = new Rng("home-" + classId);
  const subjects: Subject[] = ["Địa lí"];
  const missions: MissionReportView[] = ["Ôn tập Địa lí KTXH", "Bài tập Atlat & biểu đồ", "Trắc nghiệm chương 2", "Đề luyện cuối kì", "Bài về nhà tuần 12"].map(
    (title, i) => {
      const total = members.length;
      const completed = total - rng.int(0, 8);
      const diems = genScores(rng, completed, rng.range(6.5, 8.2), 1.3);
      return {
        missionId: `m-${classId}-${i}`,
        title,
        subject: subjects[0],
        avgScore: r1(mean(diems)),
        minScore: r1(Math.min(...diems)),
        maxScore: r1(Math.max(...diems)),
        stddev: r1(Math.sqrt(mean(diems.map((d) => (d - mean(diems)) ** 2)))),
        completionRate: completed / total,
        completed,
        total,
        notDone: total - completed,
        needsReview: rng.int(0, 5),
        scoreDistribution: histogram(diems, 1, 10),
      };
    }
  );
  const items: QuestionReport[] = topicAccuracies(rng, 0.7).map((t, i) => ({
    questionId: `hi-${classId}-${i}`,
    topic: t.topic,
    content: `Câu hỏi về ${t.topic.toLowerCase()}.`,
    correctAnswer: "Phương án đúng",
    commonWrong: "Phương án nhiễu các em hay chọn",
    errorRate: r1(1 - t.accuracy),
    correctRate: r1(t.accuracy),
    numAnswered: members.length,
    difficulty: difficultyOf(1 - t.accuracy),
  }));
  const students: MissionStudentReportView[] = members.map((s, i) => {
    const status = (["graded", "submitted", "inprogress", "todo"] as const)[rng.int(0, 3)];
    const done = status === "graded" || status === "submitted";
    const totalQ = 20;
    const correct = done ? rng.int(10, 20) : 0;
    return {
      missionId: missions[0].missionId,
      studentId: s.id,
      studentName: s.name,
      totalScore: done ? r1((correct / totalQ) * 10) : null,
      correctCount: correct,
      wrongCount: done ? totalQ - correct : 0,
      totalQuestions: totalQ,
      durationSec: done ? rng.int(300, 1500) : 0,
      status,
      attempts: rng.int(1, 3),
      late: rng.bool(0.18),
    };
  });
  return { missions, items, students };
}

function examScoreOf(world: ReturnType<typeof getWorld>, s: Student, isHero: boolean, rng: Rng): number {
  if (isHero) {
    const real = world.realByName.get(s.name);
    if (real) return real.diem;
  }
  return r1(clamp(rng.gauss(7.3, 1.2, 0, 10), 0, 10));
}

export function buildClassReport(classId: string): ClassReport {
  const world = getWorld();
  const klass = world.classById.get(classId)!;
  const isHero = classId === CLASS_HERO;
  const subject: Subject = "Địa lí";
  const members = klass.studentIds.map((id) => world.byId.get(id)!);
  const thi = isHero ? buildHeroExam() : buildGeneratedExam(classId, subject);
  const lop = buildSession(classId, members);
  const nha = buildHome(classId, members);
  const rng = new Rng("class-" + classId);

  const homeByStudent = new Map(nha.students.map((x) => [x.studentId, x]));
  const examRng = new Rng("exam-of-" + classId);

  const roster: ClassRosterRow[] = members.map((s) => {
    const exam = examScoreOf(world, s, isHero, examRng);
    const hs = homeByStudent.get(s.id);
    const home = hs?.totalScore ?? r1(clamp(rng.gauss(7.2, 1.3, 0, 10), 0, 10));
    const quizLop = clamp(rng.gauss(72, 12, 20, 100), 20, 100);
    const attendance = clamp(rng.gauss(0.95, 0.06, 0.6, 1), 0.6, 1);
    const onTime = hs ? (hs.late ? 0 : 1) : rng.bool(0.85) ? 1 : 0;
    const learning = learningIndex({
      thi: normalize(exam, 10),
      nha: normalize(home, 10),
      quizLop,
    }).total;
    const effort = effortIndex({
      chuyenCan: attendance * 100,
      hoanThanh: hs && hs.status !== "todo" ? 100 : 60,
      dungHan: onTime * 100,
    }).total;
    return {
      studentId: s.id,
      name: s.name,
      learning,
      effort,
      exam,
      home,
      attendance,
      needSupport: exam < 6.5 || learning < 60,
    };
  });

  const classExamAvg = mean(roster.map((x) => x.exam));
  const classHomeAvg = mean(roster.map((x) => x.home));
  const classQuiz = mean(lop.quizzes.map((q) => q.accuracy)) * 100;
  const classAttendance =
    lop.attendance.present / (lop.attendance.present + lop.attendance.absent);
  const classCompletion = mean(nha.missions.map((m) => m.completionRate));
  const classOnTime = mean(roster.map((x) => (x.effort >= 0 ? 1 : 1))); // placeholder, replaced below
  const onTimeRate = nha.students.filter((s) => !s.late).length / nha.students.length;

  const learningIdx = learningIndex({
    thi: normalize(classExamAvg, 10),
    nha: normalize(classHomeAvg, 10),
    quizLop: classQuiz,
  });
  const effortIdx = effortIndex({
    chuyenCan: classAttendance * 100,
    hoanThanh: classCompletion * 100,
    dungHan: onTimeRate * 100,
  });
  void classOnTime;

  const thiTopics: TopicAccuracy[] = (() => {
    const map = new Map<string, { sum: number; n: number; q: number }>();
    for (const c of thi.codes)
      for (const t of c.topics) {
        const e = map.get(t.topic) ?? { sum: 0, n: 0, q: 0 };
        e.sum += t.accuracy;
        e.n += 1;
        e.q += t.numQuestions;
        map.set(t.topic, e);
      }
    return [...map].map(([topic, e]) => ({ topic, numQuestions: e.q, accuracy: e.sum / e.n }));
  })();

  const weakTopics: WeakTopic[] = convergeWeakTopics({
    lop: lop.topics,
    nha: nha.items.map((i) => ({ topic: i.topic, numQuestions: 1, accuracy: i.correctRate })),
    thi: thiTopics,
  });

  return {
    klass,
    students: members,
    subject,
    learningIndex: learningIdx,
    effortIndex: effortIdx,
    bands: toBands(roster.map((x) => x.exam), 10),
    weakTopics,
    roster,
    effortVsResult: roster.map((x) => ({
      studentId: x.studentId,
      name: x.name,
      effort: x.effort,
      result: x.learning,
    })),
    lop,
    nha,
    thi,
  };
}

// ---- Cấp trường ----
interface ClassSummary {
  classId: string;
  className: string;
  examAvg: number;
  median: number;
  completion: number;
  attendance: number;
  needSupportPct: number;
  scoresBySubject: Partial<Record<Subject, number>>;
}

function classSummary(classId: string): ClassSummary {
  const world = getWorld();
  const klass = world.classById.get(classId)!;
  const isHero = classId === CLASS_HERO;
  const rng = new Rng("summary-" + classId);
  let examAvg: number, med: number, n: number;
  if (isHero) {
    const members = klass.studentIds.map((id) => world.byId.get(id)!);
    const ex = members.map((s) => world.realByName.get(s.name)?.diem ?? 7);
    examAvg = r1(mean(ex));
    med = median(ex);
    n = members.length;
  } else {
    n = klass.studentIds.length;
    const m = rng.range(6.6, 8.1);
    const ds = genScores(rng, n, m, 1.2);
    examAvg = r1(mean(ds));
    med = median(ds);
  }
  const scoresBySubject: Partial<Record<Subject, number>> = {};
  for (const sub of SUBJECTS) {
    if (isHero && sub === "Địa lí") scoresBySubject[sub] = examAvg;
    else scoresBySubject[sub] = r1(clamp(rng.gauss(7.2, 0.7, 4, 9.5), 4, 9.8));
  }
  return {
    classId,
    className: klass.name,
    examAvg,
    median: med,
    completion: clamp(rng.gauss(0.86, 0.07, 0.5, 1), 0.5, 1),
    attendance: clamp(rng.gauss(0.95, 0.04, 0.7, 1), 0.7, 1),
    needSupportPct: clamp(rng.gauss(0.14, 0.06, 0, 0.5), 0, 0.5),
    scoresBySubject,
  };
}

export function buildSchoolReport(schoolId: string): SchoolReport {
  const world = getWorld();
  const school = world.schoolById.get(schoolId)!;
  const classes = world.classes.filter((c) => c.schoolId === schoolId);
  const summaries = classes.map((c) => classSummary(c.id));
  const numStudents = classes.reduce((a, c) => a + c.studentIds.length, 0);
  const examAvg = r1(mean(summaries.map((s) => s.examAvg)));
  const rng = new Rng("school-" + schoolId);

  const weakRng = new Rng("weak-school-" + schoolId);
  const weakTopics: WeakTopic[] = convergeWeakTopics({
    lop: topicAccuracies(weakRng, 0.72),
    nha: topicAccuracies(weakRng, 0.7),
    thi: topicAccuracies(weakRng, 0.74),
  });

  return {
    school,
    classes,
    kpis: {
      numStudents,
      attendanceRate: mean(summaries.map((s) => s.attendance)),
      completionRate: mean(summaries.map((s) => s.completion)),
      examAvg,
      examMedian: median(summaries.map((s) => s.median)),
      needSupportPct: mean(summaries.map((s) => s.needSupportPct)),
    },
    classBySubject: summaries.map((s) => ({
      classId: s.classId,
      className: s.className,
      scores: s.scoresBySubject,
    })),
    weakTopics,
    trend: ["Đợt 1", "Đợt 2", "Đợt 3", "Đợt 4"].map((term, i) => ({
      term,
      examAvg: r1(clamp(examAvg - 0.4 + i * 0.18 + rng.gauss(0, 0.1), 4, 10)),
      completion: clamp(0.8 + i * 0.03 + rng.gauss(0, 0.02), 0, 1),
    })),
  };
}

export function buildPhong(): PhongOverview {
  const world = getWorld();
  const rows: PhongSchoolRow[] = world.schools.map((school) => {
    const rep = buildSchoolReport(school.id);
    return {
      schoolId: school.id,
      schoolName: school.name,
      examAvg: rep.kpis.examAvg,
      median: rep.kpis.examMedian,
      completion: rep.kpis.completionRate,
      attendance: rep.kpis.attendanceRate,
      needSupportPct: rep.kpis.needSupportPct,
    };
  });
  const numStudents = world.classes.reduce((a, c) => a + c.studentIds.length, 0);
  const rng = new Rng("phong");
  return {
    schools: world.schools,
    rows,
    kpis: {
      numSchools: world.schools.length,
      numStudents,
      examAvg: r1(mean(rows.map((r) => r.examAvg))),
      examMedian: median(rows.map((r) => r.median)),
      completionRate: mean(rows.map((r) => r.completion)),
      attendanceRate: mean(rows.map((r) => r.attendance)),
      needSupportPct: mean(rows.map((r) => r.needSupportPct)),
    },
    trend: ["Đợt 1", "Đợt 2", "Đợt 3", "Đợt 4"].map((term, i) => ({
      term,
      examAvg: r1(clamp(7.2 + i * 0.15 + rng.gauss(0, 0.08), 4, 10)),
    })),
  };
}

export function buildStudentProfile(studentId: string): StudentProfile {
  const world = getWorld();
  const student = world.byId.get(studentId)!;
  const klass = world.classById.get(student.classId)!;
  const school = world.schoolById.get(klass.schoolId)!;
  const isHeroClass = klass.id === CLASS_HERO;
  const real = world.realByName.get(student.name);
  const rng = new Rng("profile-" + studentId);

  const exam = real?.diem ?? r1(clamp(new Rng("examscore-" + studentId).gauss(7.3, 1.2, 0, 10), 0, 10));
  const home = r1(clamp(rng.gauss(7.4, 1.1, 0, 10), 0, 10));
  const quizLop = clamp(rng.gauss(74, 11, 20, 100), 20, 100);
  const attendanceRate = clamp(rng.gauss(0.95, 0.05, 0.6, 1), 0.6, 1);
  const onTime = rng.bool(0.85) ? 100 : 60;

  const learning = learningIndex({ thi: normalize(exam, 10), nha: normalize(home, 10), quizLop });
  const effort = effortIndex({ chuyenCan: attendanceRate * 100, hoanThanh: rng.bool(0.85) ? 95 : 70, dungHan: onTime });

  const weakNames =
    real && real.yeu !== "—" ? real.yeu.split(",").map((t) => t.trim()) : ["Ngoại thương và kinh tế", "Vùng kinh tế"];
  const strongNames =
    real && real.tot !== "—" ? real.tot.split(",").map((t) => t.trim()) : ["Tự nhiên và thiên tai", "Kĩ năng biểu đồ và bảng số liệu"];
  // Tỉ lệ đúng từng mặt là số THÔ (bịa được); "Đúng TB" và cờ yếu đều TÍNH từ ba số đó.
  const weakTopics: WeakTopic[] = weakNames.map((topic, i) => {
    const wr = new Rng("weak-" + studentId + "-" + i);
    const accLop = clamp(wr.gauss(0.55, 0.1, 0.2, 0.95), 0.2, 0.95);
    const accNha = clamp(wr.gauss(0.72, 0.1, 0.3, 0.98), 0.3, 0.98);
    const accThi = clamp(wr.gauss(0.5, 0.1, 0.2, 0.9), 0.2, 0.9);
    const surfaces = { lop: accLop < 0.6, nha: accNha < 0.6, thi: accThi < 0.6 };
    const weakCount = Number(surfaces.lop) + Number(surfaces.nha) + Number(surfaces.thi);
    return { topic, surfaces, confirmed: weakCount >= 2, accuracyAvg: (accLop + accNha + accThi) / 3 };
  });

  // Hạng trong lớp theo điểm thi
  const members = klass.studentIds.map((id) => world.byId.get(id)!);
  const scoreOf = (s: Student) =>
    isHeroClass ? world.realByName.get(s.name)?.diem ?? 7 : new Rng("examscore-" + s.id).gauss(7.3, 1.2, 0, 10);
  const rank = [...members].sort((a, b) => scoreOf(b) - scoreOf(a)).findIndex((s) => s.id === student.id) + 1;

  // Điểm Địa lí qua các kì (kì cuối = điểm thi thật)
  const terms = ["Đợt 1 · đầu năm", "Đợt 2 · giữa kì", "Đợt 3 · trước thi", "Thi thử gần nhất"];
  const exams = terms.map((term, i) => {
    const eh = new Rng("eh-" + studentId + i);
    const score = i === terms.length - 1 ? exam : r1(clamp(exam - 0.9 + i * 0.32 + eh.gauss(0, 0.25), 0, 10));
    return { term, subject: "Địa lí" as Subject, score, classAvg: r1(clamp(7.4 - 0.25 + i * 0.12, 0, 10)) };
  });

  // Học trên lớp theo buổi
  const classHistory = ["Buổi 1", "Buổi 2", "Buổi 3", "Buổi 4", "Buổi 5"].map((session, i) => {
    const cr = new Rng("ch-" + studentId + i);
    return { session, attendance: cr.bool(0.9) ? 1 : 0, quizAccuracy: clamp(cr.gauss(0.72, 0.12, 0.3, 1), 0.3, 1) };
  });

  // Bài về nhà gần đây
  const missionTitles = ["Ôn tập Địa lí KTXH", "Bài tập Atlat & biểu đồ", "Trắc nghiệm chương 2", "Đề luyện cuối kì", "Bài về nhà tuần 12", "Ôn chủ đề Vùng kinh tế"];
  const statuses = ["graded", "graded", "submitted", "graded", "inprogress", "todo"] as const;
  const missions: MissionStudentReportView[] = missionTitles.map((title, i) => {
    const mr = new Rng("ms-" + studentId + i);
    const status = statuses[i];
    const done = status === "graded" || status === "submitted";
    const totalQ = 20;
    const correct = done ? mr.int(11, 19) : 0;
    return {
      missionId: `pm-${studentId}-${i}`, studentId, studentName: student.name, title,
      totalScore: done ? r1((correct / totalQ) * 10) : null,
      correctCount: correct, wrongCount: done ? totalQ - correct : 0, totalQuestions: totalQ,
      durationSec: done ? mr.int(400, 1400) : 0, status, attempts: mr.int(1, 3), late: mr.bool(0.15),
    };
  });

  const delta = exams[exams.length - 1].score - exams[0].score;
  const trend: "up" | "flat" | "down" = delta >= 0.3 ? "up" : delta <= -0.3 ? "down" : "flat";

  return {
    student,
    className: klass.name,
    schoolName: school.name,
    learningIndex: learning,
    effortIndex: effort,
    weakTopics,
    strongTopics: strongNames,
    // 4 trục = đúng 4 nguồn có thật của chỉ số (không còn trục ngẫu nhiên).
    radar: [
      { axis: "Điểm thi", value: Math.round(normalize(exam, 10)) },
      { axis: "Bài về nhà", value: Math.round(normalize(home, 10)) },
      { axis: "Trên lớp", value: Math.round(quizLop) },
      { axis: "Chuyên cần", value: Math.round(attendanceRate * 100) },
    ],
    exams,
    classHistory,
    missions,
    attendanceRate,
    rank,
    classSize: members.length,
    teacherDraftNote: buildTeacherNote(student.name, strongNames, weakNames, exam),
    trend,
  };
}

function buildTeacherNote(name: string, strong: string[], weak: string[], exam: number): string {
  const first = name.split(" ").slice(-1)[0];
  const parts: string[] = [];
  if (strong.length) parts.push(`Em ${first} làm tốt ở ${strong.slice(0, 2).join(" và ")}.`);
  if (weak.length)
    parts.push(
      `Ở ${weak.slice(0, 2).join(" và ")}, em còn nhầm — khi ôn nên cho em làm lại vài câu dạng này và giải thích kỹ chỗ sai.`
    );
  if (exam < 6.5) parts.push("Đây là em nên để ý hỗ trợ thêm trong các buổi tới.");
  else parts.push("Nếu giữ nhịp học đều, em có thể tiến bộ tiếp ở đợt sau.");
  return parts.join(" ");
}

// ---- Gắn ngày & trải Kỳ cho hành trình học sinh ----
export interface DatedExam {
  term: string;
  subject: Subject;
  score: number;
  classAvg: number;
  date: string;
}
export interface DatedSession {
  session: string;
  attendance: number;
  quizAccuracy: number;
  date: string;
}

/** Chọn Kỳ cho phần tử thứ i của danh sách dài n khi đang ở lát "ca-nam":
 *  nửa đầu → Kỳ 1, nửa sau → Kỳ 2. Khi lát là một Kỳ cụ thể thì giữ nguyên Kỳ đó. */
function kyOfIndex(term: Ky, i: number, n: number): Ky {
  if (term !== "ca-nam") return term;
  return i < Math.ceil(n / 2) ? "ky-1" : "ky-2";
}

/** idx cục bộ trong Kỳ + tổng phần tử của Kỳ đó (để cycleDate trải đều). */
function localSpread(term: Ky, i: number, n: number): { ky: Ky; idx: number; total: number } {
  if (term !== "ca-nam") return { ky: term, idx: i, total: n };
  const firstN = Math.ceil(n / 2);
  return i < firstN
    ? { ky: "ky-1", idx: i, total: firstN }
    : { ky: "ky-2", idx: i - firstN, total: n - firstN };
}

export function studentExamsForKy(studentId: string, term: Ky): DatedExam[] {
  const profile = buildStudentProfile(studentId);
  const n = profile.exams.length;
  return profile.exams
    .map((e, i) => ({ e, i }))
    .filter(({ i }) => term === "ca-nam" || kyOfIndex(term, i, n) === term)
    .map(({ e, i }) => {
      const sp = localSpread(term, i, n);
      return { ...e, date: cycleDate(sp.ky, sp.idx, sp.total) };
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function studentSessionsForKy(studentId: string, term: Ky): DatedSession[] {
  const profile = buildStudentProfile(studentId);
  const n = profile.classHistory.length;
  return profile.classHistory
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => term === "ca-nam" || kyOfIndex(term, i, n) === term)
    .map(({ s, i }) => {
      const sp = localSpread(term, i, n);
      return { ...s, date: cycleDate(sp.ky, sp.idx, sp.total) };
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function missionDate(studentId: string, term: Ky, i: number, n: number): string {
  void studentId;
  const sp = localSpread(term, i, n);
  return cycleDate(sp.ky, sp.idx, Math.max(sp.total, 1));
}

export function studentMissionsForKy(studentId: string, term: Ky): MissionStudentReportView[] {
  const profile = buildStudentProfile(studentId);
  const n = profile.missions.length;
  return profile.missions.filter((_, i) => term === "ca-nam" || kyOfIndex(term, i, n) === term);
}

// ---- PrepSurface (SỐ THÔ: đếm buổi/lượt, không phải chỉ số tổng hợp) ----
export function buildStudentPrepSurface(studentId: string, term: Ky): PrepSurface {
  const sessions = studentSessionsForKy(studentId, term);
  const missions = studentMissionsForKy(studentId, term);
  const submitted = missions.filter((m) => m.status === "graded" || m.status === "submitted");
  const totalSessions = sessions.length || 1;
  // "xem trước": đếm buổi có mặt (proxy số thô cho việc chuẩn bị trước buổi học)
  const xemTruocCount = sessions.filter((s) => s.attendance > 0).length;
  // "bài chuẩn bị": số nhiệm vụ đã nộp / tổng nhiệm vụ
  const baiCount = submitted.length;
  // "đúng giờ": số nhiệm vụ nộp đúng hạn / tổng nhiệm vụ
  const dungGioCount = missions.filter((m) => !m.late).length;
  return {
    xemTruoc: { count: xemTruocCount, total: totalSessions },
    baiChuanBi: { count: baiCount, total: missions.length || 1 },
    dungGio: { count: dungGioCount, total: missions.length || 1 },
  };
}

export function buildClassPrepSurface(classId: string, term: Ky): PrepSurface {
  const report = buildClassReport(classId);
  const roster = report.roster;
  const total = roster.length || 1;
  // số thô cấp lớp: đếm số HS đạt mốc chuẩn bị, không trung bình hoá.
  const xemTruoc = roster.filter((r) => r.attendance >= 0.9).length;
  const onTime = report.nha.students.filter((s) => !s.late).length;
  const submitted = report.nha.students.filter((s) => s.status === "graded" || s.status === "submitted").length;
  void term; // PrepSurface lớp lấy ảnh chụp lớp; lát Kỳ chỉ đổi narration ở tầng assembler.
  return {
    xemTruoc: { count: xemTruoc, total },
    baiChuanBi: { count: submitted, total: report.nha.students.length || 1 },
    dungGio: { count: onTime, total: report.nha.students.length || 1 },
  };
}

