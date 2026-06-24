import type {
  AnswerCell, ExamPaper, ExamQuestion, ExamReport, MissionDetail, StudentExamSubmission,
  StudentMissionSubmission, Subject,
} from "@/data/types";
import { Rng } from "@/lib/random";

const r1 = (n: number) => Math.round(n * 10) / 10;
const diffOf = (rate: number): ExamQuestion["difficulty"] => (rate < 0.5 ? "kho" : rate < 0.7 ? "tb" : "de");

const GENERIC_STEMS = [
  "Đặc điểm nào sau đây đúng về",
  "Nhận định nào đúng khi nói về",
  "Yếu tố chủ yếu ảnh hưởng tới",
  "Phát biểu nào sau đây chính xác về",
];
const GENERIC_OPTS = [
  "Phương án phù hợp với đặc điểm chính",
  "Phương án nhấn mạnh yếu tố thứ yếu",
  "Phương án nêu nguyên nhân chưa đúng",
  "Phương án dễ nhầm với khái niệm khác",
];

function realQuestion(
  m: { topic: string; content: string; correctAnswer: string; commonWrong: string; errorRate: number },
  order: number,
  rng: Rng
): ExamQuestion {
  const opts = [m.correctAnswer, m.commonWrong, "Phương án nhiễu thứ ba", "Phương án nhiễu thứ tư"];
  // xáo trộn deterministic
  for (let i = opts.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return {
    id: `q${order}`,
    order,
    topic: m.topic,
    content: m.content,
    options: opts,
    correctIndex: opts.indexOf(m.correctAnswer),
    correctRate: r1(1 - m.errorRate),
    difficulty: diffOf(1 - m.errorRate),
  };
}

function genQuestion(topic: string, order: number, baseRate: number, rng: Rng): ExamQuestion {
  const correctIndex = rng.int(0, 3);
  const options = GENERIC_OPTS.map((o, i) => (i === correctIndex ? o.replace("phù hợp", "đúng và phù hợp") : o));
  const rate = Math.max(0.35, Math.min(0.98, baseRate + rng.gauss(0, 0.08)));
  return {
    id: `q${order}`,
    order,
    topic,
    content: `${rng.pick(GENERIC_STEMS)} ${topic.toLowerCase()}?`,
    options,
    correctIndex,
    correctRate: r1(rate),
    difficulty: diffOf(rate),
  };
}

const TOTAL_Q = 40;

export function buildExamPaper(report: ExamReport): ExamPaper {
  const rng = new Rng("paper-" + report.examId);
  const code = report.codes[0];
  const questions: ExamQuestion[] = [];
  let order = 1;
  for (const m of code.topMissed) {
    questions.push(realQuestion(m, order++, rng));
  }
  // sinh thêm cho đủ ~40 câu, rải theo chủ đề
  const topics = code.topics.length ? code.topics : [{ topic: report.subject, numQuestions: 1, accuracy: 0.75 }];
  let ti = 0;
  while (questions.length < TOTAL_Q) {
    const t = topics[ti % topics.length];
    questions.push(genQuestion(t.topic, order++, t.accuracy, rng));
    ti++;
  }
  return {
    examId: report.examId,
    title: report.title,
    subject: report.subject,
    term: report.term,
    matrix: code.topics.map((t) => ({ topic: t.topic, count: t.numQuestions })),
    questions,
    numStudents: report.numStudents,
    avg: report.avg,
  };
}

/** Bài làm: đánh dấu correctCount câu dễ nhất là đúng, còn lại sai (chọn 1 phương án nhiễu). */
export function buildExamSubmission(
  paper: ExamPaper,
  key: string,
  name: string,
  score: number,
  correctCount: number,
  strong: string,
  weak: string
): StudentExamSubmission {
  const rng = new Rng("sub-" + paper.examId + "-" + key);
  const order = [...paper.questions].sort((a, b) => b.correctRate - a.correctRate);
  const correctIds = new Set(order.slice(0, Math.min(correctCount, paper.questions.length)).map((q) => q.id));
  const answers: AnswerCell[] = paper.questions.map((q) => {
    const correct = correctIds.has(q.id);
    let chosen = q.correctIndex;
    if (!correct) {
      const wrong = q.options.map((_, i) => i).filter((i) => i !== q.correctIndex);
      chosen = wrong[rng.int(0, wrong.length - 1)];
    }
    return { questionId: q.id, chosenIndex: chosen, correct };
  });
  return {
    examId: paper.examId,
    studentKey: key,
    studentName: name,
    score,
    correctCount: Math.min(correctCount, paper.questions.length),
    total: paper.questions.length,
    answers,
    strong,
    weak,
  };
}

const Q_PER_MISSION = 10;

export function buildMissionDetail(
  missionId: string,
  title: string,
  subject: Subject,
  topics: string[],
  total: number,
  completed: number,
  avgScore: number
): MissionDetail {
  const rng = new Rng("mission-" + missionId);
  const questions: ExamQuestion[] = Array.from({ length: Q_PER_MISSION }, (_, i) =>
    genQuestion(topics[i % topics.length] ?? subject, i + 1, 0.72, rng)
  );
  return { missionId, title, subject, questions, total, completed, avgScore };
}

export function buildMissionSubmission(
  detail: MissionDetail,
  studentId: string,
  studentName: string,
  status: StudentMissionSubmission["status"],
  score: number | null,
  correctCount: number,
  durationSec: number
): StudentMissionSubmission {
  const rng = new Rng("msub-" + detail.missionId + "-" + studentId);
  const order = [...detail.questions].sort((a, b) => b.correctRate - a.correctRate);
  const done = status === "graded" || status === "submitted";
  const correctIds = new Set(done ? order.slice(0, correctCount).map((q) => q.id) : []);
  const answers: AnswerCell[] = detail.questions.map((q) => {
    if (!done) return { questionId: q.id, chosenIndex: -1, correct: false };
    const correct = correctIds.has(q.id);
    let chosen = q.correctIndex;
    if (!correct) {
      const wrong = q.options.map((_, i) => i).filter((i) => i !== q.correctIndex);
      chosen = wrong[rng.int(0, wrong.length - 1)];
    }
    return { questionId: q.id, chosenIndex: chosen, correct };
  });
  return { missionId: detail.missionId, studentId, studentName, status, score, durationSec, answers };
}
