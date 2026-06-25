import type { Khoi, Klass, Ky, School, Student, Subject, Teaching, UpcomingExam } from "@/data/types";
import { Rng } from "@/lib/random";
import { HO, DEM_NAM, DEM_NU, TEN_NAM, TEN_NU, SCHOOL_NAMES } from "./names";
import { REAL_STUDENTS, type RealStudent } from "./sontay.real";

export const SCHOOL_HERO = "son-tay";
export const CLASS_HERO = "son-tay-12-van";
export const STUDENT_HERO = "hs-le-trung-hieu";

// Bộ chủ đề Địa lí (trùng với dữ liệu thật) — dùng chung cho cả 3 mặt để "hội tụ chủ đề yếu" chạy được.
export const DIA_TOPICS = [
  "Vị trí địa lí và phạm vi lãnh thổ",
  "Tự nhiên và thiên tai",
  "Dân cư và đô thị hóa",
  "Nông nghiệp và thủy sản",
  "Công nghiệp và dịch vụ",
  "Vùng kinh tế",
  "Ngoại thương và kinh tế",
  "Kĩ năng biểu đồ và bảng số liệu",
];

/** Bộ chủ đề theo môn — dùng để seed dữ liệu hành trình các môn không phải Địa lí. */
export const SUBJECT_TOPICS: Record<Subject, string[]> = {
  "Toán": [
    "Giới hạn và liên tục",
    "Đạo hàm và ứng dụng",
    "Tích phân",
    "Hàm số và đồ thị",
    "Số phức",
    "Tổ hợp và xác suất",
    "Dãy số và cấp số",
    "Hình học không gian",
  ],
  "Ngữ văn": [
    "Đọc hiểu văn bản",
    "Nghị luận xã hội",
    "Nghị luận văn học",
    "Phong cách ngôn ngữ",
    "Thơ hiện đại",
    "Văn xuôi hiện đại",
    "Kĩ năng viết đoạn văn",
    "Lý luận văn học",
  ],
  "Tiếng Anh": [
    "Ngữ pháp và cấu trúc",
    "Từ vựng theo chủ đề",
    "Đọc hiểu",
    "Điền từ vào đoạn văn",
    "Giao tiếp và tình huống",
    "Viết lại câu",
    "Phát âm và trọng âm",
    "Kĩ năng nghe hiểu",
  ],
  "Vật lí": [
    "Dao động cơ học",
    "Sóng cơ và sóng âm",
    "Điện xoay chiều",
    "Dao động và sóng điện từ",
    "Quang học",
    "Lượng tử ánh sáng",
    "Hạt nhân nguyên tử",
    "Vật lí và đời sống",
  ],
  "Hóa học": [
    "Este và lipit",
    "Cacbohiđrat",
    "Amin và amino axit",
    "Polime và vật liệu",
    "Đại cương kim loại",
    "Kim loại kiềm và kiềm thổ",
    "Sắt và hợp chất của sắt",
    "Hóa học và môi trường",
  ],
  "Sinh học": [
    "Di truyền phân tử",
    "Di truyền nhiễm sắc thể",
    "Quy luật di truyền",
    "Di truyền quần thể",
    "Tiến hóa",
    "Sinh thái học",
    "Sinh lí thực vật",
    "Sinh lí động vật",
  ],
  "Lịch sử": [
    "Cách mạng tháng Tám và kháng chiến chống Pháp",
    "Kháng chiến chống Mĩ",
    "Lịch sử thế giới hiện đại",
    "Quan hệ quốc tế sau 1945",
    "Việt Nam từ 1954 đến 1975",
    "Việt Nam từ 1975 đến nay",
    "Đổi mới và hội nhập",
    "Kĩ năng khai thác tư liệu lịch sử",
  ],
  "Địa lí": DIA_TOPICS,
};

const CLASS_FOCI = ["Văn", "Toán", "Anh", "Lí", "Hóa", "Sinh"];

// Học sinh hero: Lê Trung Hiếu (lớp 12 Văn, mã đề 1).
export const HIEU_REAL: RealStudent = {
  code: "MÃ ĐỀ GỐC 1",
  name: "Lê Trung Hiếu",
  diem: 7.0,
  soCauDung: 30,
  tot: "Tự nhiên và thiên tai, Kĩ năng biểu đồ và bảng số liệu",
  yeu: "Ngoại thương và kinh tế, Vùng kinh tế",
};

function genName(rng: Rng): string {
  const nu = rng.bool();
  const ho = rng.pick(HO);
  const dem = rng.pick(nu ? DEM_NU : DEM_NAM);
  const ten = rng.pick(nu ? TEN_NU : TEN_NAM);
  return `${ho} ${dem} ${ten}`;
}

export interface World {
  schools: School[];
  classes: Klass[];
  students: Student[];
  byId: Map<string, Student>;
  classById: Map<string, Klass>;
  schoolById: Map<string, School>;
  realByName: Map<string, RealStudent>;
  heroRoster: Student[]; // 12 Văn
}

let cached: World | null = null;

export function getWorld(): World {
  if (cached) return cached;

  const schools: School[] = [
    { id: SCHOOL_HERO, name: "THPT Chuyên Sơn Tây", shortName: "Sơn Tây", isHero: true },
    ...SCHOOL_NAMES.map((name, i) => ({
      id: `sch-${i + 1}`,
      name,
      shortName: name.replace("THPT ", ""),
    })),
  ];

  const classes: Klass[] = [];
  const students: Student[] = [];
  const realByName = new Map<string, RealStudent>();
  for (const s of REAL_STUDENTS) realByName.set(s.name, s);
  realByName.set(HIEU_REAL.name, HIEU_REAL);

  let heroRoster: Student[] = [];

  for (const school of schools) {
    const khoi: Khoi = 12;
    for (const focus of CLASS_FOCI) {
      const isHeroClass = school.id === SCHOOL_HERO && focus === "Văn";
      const classId = isHeroClass ? CLASS_HERO : `${school.id}-12-${focus.toLowerCase()}`;
      const rng = new Rng(classId);
      const teacher = isHeroClass ? "Nguyễn Minh Hồng" : genName(rng);
      const studentIds: string[] = [];

      if (isHeroClass) {
        // 41 học sinh thật + Lê Trung Hiếu
        const real = REAL_STUDENTS.slice(0, 41);
        const hieu: Student = { id: STUDENT_HERO, classId, name: HIEU_REAL.name, examCode: HIEU_REAL.code };
        const list: Student[] = [
          hieu,
          ...real.map((r, i) => ({
            id: `${classId}-s${i}`,
            classId,
            name: r.name,
            examCode: r.code,
          })),
        ];
        for (const st of list) {
          students.push(st);
          studentIds.push(st.id);
        }
        heroRoster = list;
      } else {
        const n = rng.int(36, 42);
        for (let i = 0; i < n; i++) {
          const st: Student = { id: `${classId}-s${i}`, classId, name: genName(rng) };
          students.push(st);
          studentIds.push(st.id);
        }
      }

      classes.push({
        id: classId,
        schoolId: school.id,
        khoi,
        name: `12 ${focus}`,
        focus,
        homeroomTeacher: teacher,
        studentIds,
      });
    }
  }

  const byId = new Map(students.map((s) => [s.id, s]));
  const classById = new Map(classes.map((c) => [c.id, c]));
  const schoolById = new Map(schools.map((s) => [s.id, s]));

  cached = { schools, classes, students, byId, classById, schoolById, realByName, heroRoster };
  return cached;
}

/** Phân công của GV Nguyễn Minh Hồng: chủ nhiệm 12 Văn + dạy Địa lí các lớp bộ môn còn lại. */
export function getHongTeaching(): Teaching {
  const w = getWorld();
  const subjectClassIds = w.classes
    .filter((c) => c.schoolId === SCHOOL_HERO && c.id !== CLASS_HERO)
    .map((c) => c.id);
  return { teacherName: "Nguyễn Minh Hồng", subject: "Địa lí", homeroomClassId: CLASS_HERO, subjectClassIds };
}

// ---- Mốc thời gian cho hành trình ----
/** Mốc "bây giờ" của bản trình bày: sau thi thử (cuối Kỳ 2), trước kỳ thi THPT chính thức. */
export const DEMO_NOW = "2026-06-10";

/** Kỳ thi THPT chính thức — mốc tương lai, KHÔNG có kết quả. */
export const OFFICIAL_EXAM: UpcomingExam = { title: "Kỳ thi THPT chính thức", date: "2026-06-26" };

/** Khoảng thời gian mỗi Kỳ (ISO). Thi thử thật rơi vào cuối Kỳ 2. */
export const KY_RANGE: Record<Ky, { from: string; to: string }> = {
  "ky-1": { from: "2025-09-05", to: "2026-01-10" },
  "ky-2": { from: "2026-01-20", to: "2026-06-05" },
  "ca-nam": { from: "2025-09-05", to: "2026-06-05" },
};

/**
 * Mốc kiểm tra cắt chặng (cuối mỗi chặng = một bài kiểm tra/kỳ thi).
 * Mỗi Kỳ có 2 mốc; chặng = quãng giữa hai mốc liền nhau, chặng cuối khép bằng mốc cuối.
 */
export const KY_BOUNDARIES: Record<Ky, string[]> = {
  "ky-1": ["2025-10-20", "2026-01-08"],
  "ky-2": ["2026-03-15", "2026-06-04"],
  "ca-nam": ["2025-10-20", "2026-01-08", "2026-03-15", "2026-06-04"],
};

/**
 * Sinh ISO ngày của sự kiện thứ `idx` trong tổng `total` sự kiện của một Kỳ.
 * Trải đều trong KY_RANGE[ky], tăng dần theo idx, deterministic.
 */
export function cycleDate(ky: Ky, idx: number, total: number): string {
  const range = KY_RANGE[ky];
  const from = new Date(range.from + "T00:00:00Z").getTime();
  const to = new Date(range.to + "T00:00:00Z").getTime();
  const span = to - from;
  const denom = total > 1 ? total - 1 : 1;
  // chừa 5% mép đầu để sự kiện đầu nằm SAU from (không trùng mép), cuối chạm gần to.
  const t = from + span * (0.05 + 0.9 * (idx / denom));
  return new Date(t).toISOString().slice(0, 10);
}
