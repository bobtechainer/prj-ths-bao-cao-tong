import type {
  NarratedLine, PrepSurface, WeakTopic, UpcomingExam, EventStatus, IndexBreakdown,
  StudentOverview, ClassOverview,
} from "@/data/types";
import { diem, pct, int } from "@/lib/format";

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
    up: "mấy chặng gần đây đang đi lên",
    flat: "giữ khá đều",
    down: "gần đây có phần chững lại",
  };
  const text = `Em đang đứng thứ ${j.rank}/${j.classSize} của lớp, ${trendTail[j.trend]}. Chỉ số học tập ${j.learningIndex.total}, nỗ lực ${j.effortIndex.total}.`;
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
  const text = `${who} xem trước bài ${s.xemTruoc.count}/${s.xemTruoc.total} buổi, làm ${s.baiChuanBi.count}/${s.baiChuanBi.total} bài chuẩn bị, nộp đúng giờ ${s.dungGio.count}/${s.dungGio.total} lượt.`;
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
    ? `Nhìn lại cả ba mặt — trên lớp, ở nhà và bài thi — ${shown.length} chủ đề còn yếu nhất là ${names}, ${action}.`
    : `Chưa có chủ đề nào yếu rõ ở cả ba mặt, ${action}.`;

  const figures: { label: string; value: string }[] = [
    { label: "Chủ đề yếu", value: int(shown.length) },
  ];
  if (worst) figures.push({ label: `Thấp nhất · ${worst.topic}`, value: pct(worst.accuracyAvg) });
  if (nextExam) figures.push({ label: nextExam.title, value: nextExam.date });

  return line(head, figures);
}

export function narrateOverviewMoDau(ov: StudentOverview): NarratedLine {
  const trendWord: Record<"up" | "flat" | "down", string> = {
    up: "đang đi lên",
    flat: "giữ nhịp ổn định",
    down: "có phần chững lại",
  };
  const trend = ov.strongest.trend;
  const strongScore = ov.strongest.latestExamScore;
  const scorePart = strongScore !== null ? ` (${diem(strongScore)} điểm)` : "";
  const text = `Nhìn chung cả ${ov.subjects.length} môn, chỉ số học tập trung bình đạt ${ov.overallLearningIndex} — nhịp học ${trendWord[trend]}. Môn mạnh nhất là ${ov.strongest.subject}${scorePart}.`;
  return line(text, [
    { label: "Chỉ số học tập TB", value: String(ov.overallLearningIndex) },
    { label: "Môn mạnh nhất", value: ov.strongest.subject },
    ...(strongScore !== null
      ? [{ label: `Điểm · ${ov.strongest.subject}`, value: diem(strongScore) }]
      : []),
  ]);
}

export function narrateOverviewCacMon(ov: StudentOverview): NarratedLine {
  const strongScore = ov.strongest.latestExamScore;
  const weakScore = ov.weakest.latestExamScore;
  const strongPart = strongScore !== null ? ` ${diem(strongScore)} điểm` : "";
  const weakPart = weakScore !== null ? ` ${diem(weakScore)} điểm` : "";
  const text = `${ov.strongest.subject}${strongPart} là điểm sáng; ${ov.weakest.subject}${weakPart} là môn em cần để ý hơn trong kỳ này.`;
  return line(text, [
    { label: `Mạnh nhất · ${ov.strongest.subject}`, value: strongScore !== null ? diem(strongScore) : "—" },
    { label: `Cần để ý · ${ov.weakest.subject}`, value: weakScore !== null ? diem(weakScore) : "—" },
  ]);
}

export function narrateOverviewHoiTu(ov: StudentOverview, nextExam: UpcomingExam | null): NarratedLine {
  const bottom2 = ov.subjects.slice(-2);
  const topicNames = bottom2
    .flatMap((e) => e.weakTopics.filter((t) => t.confirmed).map((t) => t.topic))
    .slice(0, 3);
  const topicPart = topicNames.length
    ? ` Các chủ đề cụ thể cần ôn: ${topicNames.join(", ")}.`
    : "";
  const action = nextExam
    ? `nên ôn lại ${ov.weakest.subject} trước ${nextExam.title}`
    : `nên tập trung thêm vào ${ov.weakest.subject}`;
  const text = `Em ${action}.${topicPart}`;
  const figures: { label: string; value: string }[] = [
    { label: "Môn cần để ý", value: ov.weakest.subject },
  ];
  if (ov.weakest.latestExamScore !== null) {
    figures.push({ label: "Điểm gần nhất", value: diem(ov.weakest.latestExamScore) });
  }
  if (nextExam) {
    figures.push({ label: nextExam.title, value: nextExam.date });
  }
  return line(text, figures);
}

export function narrateClassOverviewMoDau(ov: ClassOverview): NarratedLine {
  const text = `Lớp ${ov.klass.name} có ${int(ov.numStudents)} em, chuyên cần ${pct(ov.attendanceRate)}. Tính chung các môn, chỉ số học tập trung bình ${ov.overallLearningIndex}; mạnh nhất đang là ${ov.strongest.subject}.`;
  return line(text, [
    { label: "Sĩ số", value: int(ov.numStudents) },
    { label: "Học tập TB", value: String(ov.overallLearningIndex) },
    { label: "Cần hỗ trợ", value: int(ov.needSupport) },
  ]);
}

export function narrateClassOverviewCacMon(ov: ClassOverview): NarratedLine {
  const s = ov.strongest, w = ov.weakest;
  const sPart = s.examAvg !== null ? ` ${diem(s.examAvg)}` : "";
  const wPart = w.examAvg !== null ? ` ${diem(w.examAvg)}` : "";
  const text = `Cả lớp nhỉnh nhất ở ${s.subject}${sPart}; còn ${w.subject}${wPart} là môn nên để ý kèm thêm trong kỳ này.`;
  return line(text, [
    { label: `Cao nhất · ${s.subject}`, value: s.examAvg !== null ? diem(s.examAvg) : "—" },
    { label: `Cần để ý · ${w.subject}`, value: w.examAvg !== null ? diem(w.examAvg) : "—" },
  ]);
}

export function narrateClassOverviewHoiTu(ov: ClassOverview, nextExam: UpcomingExam | null): NarratedLine {
  const names = ov.weakest.weakTopics.filter((t) => t.confirmed).slice(0, 3).map((t) => t.topic).join(", ");
  const action = nextExam
    ? `nên ôn lại ${ov.weakest.subject} trước ${nextExam.title}`
    : `nên dành thêm thời gian cho ${ov.weakest.subject}`;
  const topicPart = names ? ` Mấy chủ đề lớp còn hay sai: ${names}.` : "";
  const text = `Cả lớp ${action}.${topicPart}`;
  const figures: { label: string; value: string }[] = [];
  if (ov.weakest.examAvg !== null) figures.push({ label: `Cần để ý · ${ov.weakest.subject}`, value: diem(ov.weakest.examAvg) });
  else figures.push({ label: "Cần để ý", value: ov.needSupport > 0 ? int(ov.needSupport) : "—" });
  if (nextExam) figures.push({ label: nextExam.title, value: nextExam.date });
  return line(text, figures);
}
