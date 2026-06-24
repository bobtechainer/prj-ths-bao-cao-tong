// Kiểu dữ liệu hình dạng GIỐNG view production (Hasura: mission_report_view,
// mission_student_report_view, mission_question_report_view) + SmartClass analytics.
// Dữ liệu đứng sau repository; giữ đúng tên trường để đổi sang GraphQL chỉ cần thay repository.

export type Role = "phong" | "truong" | "giaovien" | "hocsinh";

export interface Account {
  id: string;
  name: string;
  role: Role;
  org: string; // đơn vị hiển thị
  scopeId: string; // id của phạm vi vào (phòng/trường/lớp/học sinh)
  lastLogin: string; // ISO
}

export type Khoi = 10 | 11 | 12;

export interface School {
  id: string;
  name: string;
  shortName: string;
  isHero?: boolean;
}

export interface Klass {
  id: string;
  schoolId: string;
  khoi: Khoi;
  name: string; // "12 Văn"
  focus: string; // chuyên ban: "Văn"
  homeroomTeacher: string;
  studentIds: string[];
}

// Một giáo viên: 1 lớp chủ nhiệm + nhiều lớp bộ môn (dạy 1 môn).
export interface Teaching {
  teacherName: string;
  subject: Subject;
  homeroomClassId: string;
  subjectClassIds: string[];
}

// ---- Ngân hàng câu hỏi & bài làm (dẫn chứng) ----
export interface ExamQuestion {
  id: string;
  order: number;
  topic: string;
  content: string;
  options: string[];
  correctIndex: number;
  correctRate: number; // 0..1 tỉ lệ lớp/khối làm đúng
  difficulty: "de" | "tb" | "kho";
}
export interface ExamPaper {
  examId: string;
  title: string;
  subject: Subject;
  term: string;
  matrix: { topic: string; count: number }[];
  questions: ExamQuestion[];
  numStudents: number;
  avg: number;
}
export interface AnswerCell {
  questionId: string;
  chosenIndex: number; // -1 nếu bỏ trống
  correct: boolean;
}
export interface StudentExamSubmission {
  examId: string;
  studentKey: string;
  studentName: string;
  score: number;
  correctCount: number;
  total: number;
  answers: AnswerCell[];
  strong: string;
  weak: string;
}
export interface MissionDetail {
  missionId: string;
  title: string;
  subject: Subject;
  questions: ExamQuestion[];
  total: number;
  completed: number;
  avgScore: number;
}
export interface StudentMissionSubmission {
  missionId: string;
  studentId: string;
  studentName: string;
  status: "todo" | "inprogress" | "submitted" | "graded";
  score: number | null;
  durationSec: number;
  answers: AnswerCell[];
}

export interface Student {
  id: string;
  classId: string;
  name: string;
  examCode?: string; // mã đề đã làm (vd "MÃ ĐỀ GỐC 1")
}

export const SUBJECTS = [
  "Toán",
  "Ngữ văn",
  "Tiếng Anh",
  "Vật lí",
  "Hóa học",
  "Sinh học",
  "Lịch sử",
  "Địa lí",
] as const;
export type Subject = (typeof SUBJECTS)[number];

// ---- Chỉ số tổng hợp ----
export interface IndexPart {
  label: string;
  value: number; // 0..100
  weight: number; // 0..1
}
export interface IndexBreakdown {
  total: number; // 0..100
  parts: IndexPart[];
  partial?: boolean; // thiếu một mặt → đã chia lại trọng số
}

export interface WeakTopic {
  topic: string;
  surfaces: { lop: boolean; nha: boolean; thi: boolean };
  confirmed: boolean; // yếu ở >= 2 mặt
  accuracyAvg: number; // 0..1
}

// ---- Điểm số & phân bố ----
export interface BandRow {
  label: string;
  count: number;
  ratio: number; // 0..1
}
export interface HistBin {
  bin: string;
  count: number;
}

export interface TopicAccuracy {
  topic: string;
  numQuestions: number;
  accuracy: number; // 0..1
}

// ---- C. Thi ----
export interface QuestionReport {
  questionId: string;
  topic: string;
  content: string;
  correctAnswer: string;
  commonWrong: string; // lựa chọn sai phổ biến
  errorRate: number; // 0..1 (tỉ lệ sai)
  correctRate: number; // 0..1
  numAnswered: number;
  difficulty: "de" | "tb" | "kho";
}

export interface ExamCodeReport {
  examCode: string; // "MÃ ĐỀ GỐC 1"
  numStudents: number;
  avg: number;
  median: number;
  bands: BandRow[];
  histogram: HistBin[];
  topics: TopicAccuracy[];
  topMissed: QuestionReport[];
  insights: string[];
}

export interface ExamStudentDetail {
  name: string;
  examCode: string;
  score: number;
  correct: number;
  strong: string; // chủ đề làm tốt
  weak: string; // chủ đề cần hỗ trợ
}

export interface ExamReport {
  examId: string;
  title: string; // "Thi thử THPT môn Địa lí"
  subject: Subject;
  term: string; // "Đợt 1 · 2025-2026"
  numStudents: number;
  avg: number;
  median: number;
  bands: BandRow[];
  histogram: HistBin[];
  codes: ExamCodeReport[]; // so sánh 2 mã đề
  topMissedByCode: { examCode: string; questions: QuestionReport[] }[];
  studentDetail: ExamStudentDetail[]; // Chi tiết học sinh (Sheet 4)
}

// ---- B. Nhà / Nhiệm vụ ----
export interface MissionReportView {
  missionId: string;
  title: string;
  subject: Subject;
  avgScore: number;
  minScore: number;
  maxScore: number;
  stddev: number;
  completionRate: number; // 0..1
  completed: number;
  total: number;
  notDone: number;
  needsReview: number;
  scoreDistribution: HistBin[];
}
export interface MissionStudentReportView {
  missionId: string;
  studentId: string;
  studentName: string;
  title?: string;
  totalScore: number | null; // null nếu không tính điểm
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  durationSec: number;
  status: "todo" | "inprogress" | "submitted" | "graded";
  attempts: number;
  late: boolean;
}
export interface HomeReport {
  missions: MissionReportView[];
  items: QuestionReport[]; // phân tích từng câu (gộp)
  students: MissionStudentReportView[];
}

// ---- A. Lớp / SmartClass ----
export interface AttendanceBreakdown {
  present: number;
  absent: number;
  late: number;
  leftEarly: number;
}
export interface EngagementPoint {
  t: number; // phút
  score: number; // 0..100
  marker?: string; // "Quiz 1", "Giảng bài"...
}
export interface QuizItem {
  q: string;
  accuracy: number; // 0..1
  avgTimeSec: number;
}
export interface LeaderRow {
  studentId: string;
  studentName: string;
  rank: number;
  score: number;
  correct: number;
  wrong: number;
  streak: number;
}
export interface SessionAnalytics {
  sessionId: string;
  classId: string;
  date: string;
  durationMin: number;
  attendance: AttendanceBreakdown;
  engagement: EngagementPoint[];
  quizzes: QuizItem[];
  leaderboard: LeaderRow[];
  topics: TopicAccuracy[];
}

// ---- Học sinh (hồ sơ tổng hợp) ----
export interface StudentProfile {
  student: Student;
  className: string;
  schoolName: string;
  learningIndex: IndexBreakdown;
  effortIndex: IndexBreakdown;
  weakTopics: WeakTopic[];
  strongTopics: string[];
  radar: { axis: string; value: number }[]; // 4 trục
  exams: { term: string; subject: Subject; score: number; classAvg: number }[]; // nhiều kì → timeline
  classHistory: { session: string; attendance: number; quizAccuracy: number }[]; // học trên lớp theo buổi
  missions: MissionStudentReportView[];
  attendanceRate: number; // 0..1
  rank: number; // hạng trong lớp
  classSize: number;
  teacherDraftNote: string; // bản nháp cho giáo viên
  trend: "up" | "flat" | "down";
}

// ---- Tổng hợp cấp lớp ----
export interface ClassReport {
  klass: Klass;
  students: Student[];
  subject: Subject;
  learningIndex: IndexBreakdown;
  effortIndex: IndexBreakdown;
  bands: BandRow[];
  weakTopics: WeakTopic[];
  roster: ClassRosterRow[];
  effortVsResult: { studentId: string; name: string; effort: number; result: number }[];
  lop: SessionAnalytics;
  nha: HomeReport;
  thi: ExamReport;
}
export interface ClassRosterRow {
  studentId: string;
  name: string;
  learning: number; // 0..100
  effort: number; // 0..100
  exam: number; // điểm 0..10
  home: number; // điểm 0..10
  attendance: number; // 0..1
  needSupport: boolean;
}

// ---- Cấp trường (L1) ----
export interface SchoolReport {
  school: School;
  classes: Klass[];
  kpis: SchoolKpis;
  classBySubject: { classId: string; className: string; scores: Partial<Record<Subject, number>> }[];
  weakTopics: WeakTopic[];
  trend: { term: string; examAvg: number; completion: number }[];
}
export interface SchoolKpis {
  numStudents: number;
  attendanceRate: number; // 0..1
  completionRate: number; // 0..1
  examAvg: number;
  examMedian: number;
  needSupportPct: number; // 0..1
}

// ---- Cấp phòng (L0) ----
export interface PhongOverview {
  schools: School[];
  rows: PhongSchoolRow[];
  kpis: {
    numSchools: number;
    numStudents: number;
    examAvg: number;
    examMedian: number;
    completionRate: number;
    attendanceRate: number;
    needSupportPct: number;
  };
  trend: { term: string; examAvg: number }[];
}
export interface PhongSchoolRow {
  schoolId: string;
  schoolName: string;
  examAvg: number;
  median: number;
  completion: number; // 0..1
  attendance: number; // 0..1
  needSupportPct: number; // 0..1
}

// ---- Hành trình báo cáo (journey) ----
export type Ky = "ky-1" | "ky-2" | "ca-nam";
export const KY_LABEL: Record<Ky, string> = {
  "ky-1": "Học kì 1",
  "ky-2": "Học kì 2",
  "ca-nam": "Cả năm",
};

export type EventStatus = "past" | "current" | "upcoming";

export interface PrepSurface {
  xemTruoc: { count: number; total: number };
  baiChuanBi: { count: number; total: number };
  dungGio: { count: number; total: number };
}

export interface NarratedLine {
  text: string;
  figures: { label: string; value: string }[];
}

/** Kỳ thi THPT chính thức (mốc tương lai, không có kết quả). */
export interface UpcomingExam {
  title: string;
  date: string;
}

export interface CycleSession {
  session: string;
  date: string;
  attendance: number;
  quizAccuracy: number;
}

export interface StudentCycle {
  id: string;
  label: string;
  range: { from: string; to: string };
  status: EventStatus;
  lop: {
    sessions: CycleSession[];
    attendanceRate: number;
    quizAccuracyAvg: number;
    narration: NarratedLine;
  };
  nha: {
    missions: MissionStudentReportView[];
    completionRate: number;
    onTimeRate: number;
    avgScore: number | null;
    narration: NarratedLine;
  };
  exam: {
    examId: string;
    submissionKey: string;
    term: string;
    date: string;
    score: number;
    classAvg: number;
    narration: NarratedLine;
  } | null;
}

export interface StudentJourney {
  kind: "student";
  slice: { term: Ky; subject: Subject };
  now: string;
  student: Student;
  className: string;
  schoolName: string;
  overview: {
    rank: number;
    classSize: number;
    trend: "up" | "flat" | "down";
    learningIndex: IndexBreakdown;
    effortIndex: IndexBreakdown;
    narration: NarratedLine;
  };
  prep: { surface: PrepSurface; narration: NarratedLine };
  cycles: StudentCycle[];
  convergence: { topics: WeakTopic[]; nextExam: UpcomingExam | null; narration: NarratedLine };
  availableSlices: { terms: Ky[]; subjects: Subject[] };
  empty: boolean;
}

export interface ClassCycle {
  id: string;
  label: string;
  range: { from: string; to: string };
  status: EventStatus;
  lop: { session: SessionAnalytics; narration: NarratedLine };
  nha: { report: HomeReport; completionRate: number; narration: NarratedLine };
  exam: { report: ExamReport; narration: NarratedLine } | null;
}

export interface ClassJourney {
  kind: "class";
  slice: { term: Ky; subject: Subject };
  now: string;
  klass: Klass;
  schoolName: string;
  overview: {
    numStudents: number;
    examAvg: number;
    learningIndex: IndexBreakdown;
    effortIndex: IndexBreakdown;
    needSupport: number;
    narration: NarratedLine;
  };
  prep: { surface: PrepSurface; narration: NarratedLine };
  cycles: ClassCycle[];
  convergence: {
    topics: WeakTopic[];
    needSupport: ClassRosterRow[];
    nextExam: UpcomingExam | null;
    narration: NarratedLine;
  };
  availableSlices: { terms: Ky[]; subjects: Subject[] };
  empty: boolean;
}
