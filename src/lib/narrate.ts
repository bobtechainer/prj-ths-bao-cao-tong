import type {
  NarratedLine, PrepSurface, WeakTopic, UpcomingExam, EventStatus, IndexBreakdown,
} from "@/data/types";
import { diem, pct, int } from "@/lib/format";

const TREND_WORD: Record<"up" | "flat" | "down", string> = {
  up: "đang đi lên",
  flat: "giữ nhịp ổn định",
  down: "đang chững lại",
};

function line(text: string, figures: { label: string; value: string }[]): NarratedLine {
  return { text, figures };
}

export function narrateStudentOverview(j: {
  rank: number;
  classSize: number;
  trend: "up" | "flat" | "down";
  learningIndex: IndexBreakdown;
  effortIndex: IndexBreakdown;
}): NarratedLine {
  const trendTail: Record<"up" | "flat" | "down", string> = {
    up: "đang đi lên",
    flat: "khá đều",
    down: "có phần chững lại",
  };
  const text = `Em đang xếp hạng ${j.rank}/${j.classSize} trong lớp và ${TREND_WORD[j.trend]}. Chỉ số học tập ${j.learningIndex.total}, nỗ lực ${j.effortIndex.total} — nhịp học ${trendTail[j.trend]}.`;
  return line(text, [
    { label: "Hạng", value: `${int(j.rank)}/${int(j.classSize)}` },
    { label: "Học tập", value: int(j.learningIndex.total) },
    { label: "Nỗ lực", value: int(j.effortIndex.total) },
  ]);
}

export function narrateClassOverview(j: {
  numStudents: number;
  examAvg: number;
  learningIndex: IndexBreakdown;
  effortIndex: IndexBreakdown;
  needSupport: number;
}): NarratedLine {
  const text = `Lớp có ${int(j.numStudents)} em, điểm thi trung bình ${diem(j.examAvg)}. Có ${int(j.needSupport)} em cô nên để ý kèm thêm trong giai đoạn tới.`;
  return line(text, [
    { label: "Sĩ số", value: int(j.numStudents) },
    { label: "Điểm TB", value: diem(j.examAvg) },
    { label: "Cần hỗ trợ", value: int(j.needSupport) },
  ]);
}

export function narratePrep(s: PrepSurface, gentle: boolean): NarratedLine {
  const who = gentle ? "Em" : "Các em";
  const text = `${who} chuẩn bị khá đều: xem trước ${s.xemTruoc.count}/${s.xemTruoc.total} buổi, làm bài chuẩn bị ${s.baiChuanBi.count}/${s.baiChuanBi.total}, nộp đúng giờ ${s.dungGio.count}/${s.dungGio.total}.`;
  return line(text, [
    { label: "Xem trước", value: `${int(s.xemTruoc.count)}/${int(s.xemTruoc.total)}` },
    { label: "Bài chuẩn bị", value: `${int(s.baiChuanBi.count)}/${int(s.baiChuanBi.total)}` },
    { label: "Đúng giờ", value: `${int(s.dungGio.count)}/${int(s.dungGio.total)}` },
  ]);
}

export function narrateClassroom(
  cycleLop: { attendanceRate: number; quizAccuracyAvg: number; numSessions: number },
  gentle: boolean
): NarratedLine {
  const who = gentle ? "Trên lớp em" : "Trên lớp các em";
  const text = `${who} đi học ${pct(cycleLop.attendanceRate)} số buổi và trả lời nhanh đúng khoảng ${pct(cycleLop.quizAccuracyAvg)} qua ${int(cycleLop.numSessions)} buổi.`;
  return line(text, [
    { label: "Chuyên cần", value: pct(cycleLop.attendanceRate) },
    { label: "Đúng quiz", value: pct(cycleLop.quizAccuracyAvg) },
    { label: "Số buổi", value: int(cycleLop.numSessions) },
  ]);
}

export function narrateHome(
  cycleNha: { completionRate: number; onTimeRate: number; avgScore: number | null; numMissions: number },
  gentle: boolean
): NarratedLine {
  const who = gentle ? "Ở nhà em" : "Ở nhà các em";
  const scorePart = cycleNha.avgScore == null ? "" : `, điểm trung bình ${diem(cycleNha.avgScore)}`;
  const text = `${who} hoàn thành ${pct(cycleNha.completionRate)} nhiệm vụ, nộp đúng hạn ${pct(cycleNha.onTimeRate)}${scorePart} trên ${int(cycleNha.numMissions)} bài.`;
  const figures: { label: string; value: string }[] = [
    { label: "Hoàn thành", value: pct(cycleNha.completionRate) },
    { label: "Đúng hạn", value: pct(cycleNha.onTimeRate) },
    { label: "Số bài", value: int(cycleNha.numMissions) },
  ];
  if (cycleNha.avgScore != null) figures.push({ label: "Điểm TB", value: diem(cycleNha.avgScore) });
  return line(text, figures);
}

/** Bản HỌC SINH: so điểm em với TB lớp. */
export function narrateExam(
  exam: { score: number; classAvg: number; term: string },
  status: EventStatus,
  gentle: boolean
): NarratedLine {
  const delta = exam.score - exam.classAvg;
  const verb =
    status === "upcoming" ? "sẽ làm" :
    status === "current"  ? "đang làm" :
    "đã làm";
  const cmp =
    delta >= 0.3 ? "nhỉnh hơn mặt bằng lớp" : delta <= -0.3 ? "thấp hơn mặt bằng lớp một chút" : "ngang mặt bằng lớp";
  const tail = gentle ? "Cứ giữ nhịp này nhé." : "";
  const text = `Ở ${exam.term}, em ${verb} được ${diem(exam.score)} điểm, ${cmp} (TB lớp ${diem(exam.classAvg)}). ${tail}`.trim();
  return line(text, [
    { label: "Điểm em", value: diem(exam.score) },
    { label: "TB lớp", value: diem(exam.classAvg) },
    { label: "Chênh", value: (delta >= 0 ? "+" : "") + diem(delta) },
  ]);
}

/** Bản LỚP: KHÔNG so avg với chính nó; dùng trung vị + N. */
export function narrateClassExam(
  report: { avg: number; median: number; numStudents: number; title: string },
  status: EventStatus
): NarratedLine {
  const verb =
    status === "upcoming" ? "Sắp tới" :
    status === "current"  ? "Đang diễn ra —" :
    "Ở";
  const skewTail =
    report.avg < report.median - 0.2 ? " Nhóm điểm thấp đang kéo mặt bằng xuống." :
    report.avg > report.median + 0.2 ? " Nhóm điểm cao đang kéo mặt bằng lên." :
    "";
  const text = `${verb} ${report.title}: điểm TB ${diem(report.avg)} · trung vị ${diem(report.median)} · ${int(report.numStudents)} bài.${skewTail}`;
  return line(text, [
    { label: "Điểm TB", value: diem(report.avg) },
    { label: "Trung vị", value: diem(report.median) },
    { label: "Số bài", value: int(report.numStudents) },
  ]);
}

export function narrateConvergence(
  topics: WeakTopic[],
  gentle: boolean,
  nextExam: UpcomingExam | null
): NarratedLine {
  const confirmed = topics.filter((t) => t.confirmed);
  const shown = (confirmed.length ? confirmed : topics).slice(0, 3);
  const names = shown.map((t) => t.topic).join(", ");
  const worst = [...topics].sort((a, b) => a.accuracyAvg - b.accuracyAvg)[0];

  // ĐÚNG THÌ: chỉ chèn "trước {title}" khi nextExam != null
  const action = nextExam
    ? gentle
      ? `nên ôn lại trước ${nextExam.title}`
      : `nên chữa trước ${nextExam.title}`
    : gentle
    ? "nên ôn lại để chắc kiến thức"
    : "nên củng cố lại trong các buổi tới";

  const head = names
    ? `Gom lại cả ba mặt, ${shown.length} chủ đề còn yếu hơn cả là ${names} — ${action}.`
    : `Chưa thấy chủ đề nào yếu rõ ở cả ba mặt — ${action}.`;

  const figures: { label: string; value: string }[] = [
    { label: "Chủ đề yếu", value: int(shown.length) },
  ];
  if (worst) figures.push({ label: `Thấp nhất · ${worst.topic}`, value: pct(worst.accuracyAvg) });
  if (nextExam) figures.push({ label: nextExam.title, value: nextExam.date });

  return line(head, figures);
}
