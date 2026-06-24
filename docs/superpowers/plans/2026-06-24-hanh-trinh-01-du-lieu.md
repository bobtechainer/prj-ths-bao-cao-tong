# Plan 01 — Nền dữ liệu & Trợ lý Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute this plan. Each Task is a self-contained, test-first deliverable. Follow the checkbox (`- [ ]`) steps in order: write the failing test, run it and confirm it fails for the stated reason, write the minimal real code, run it and confirm it passes, then run the gate (`npx tsc --noEmit; npx vitest run; npx vite build`). Never skip a checkpoint. Never leave a placeholder.

## Goal

Dựng TẦNG DỮ LIỆU + TRỢ LÝ (narrate) cho hành trình báo cáo dạng kể chuyện bám timeline — KHÔNG đụng UI. Sau Plan 01, repository có hai method mới `getStudentJourney(studentId, term, subject)` và `getClassJourney(classId, term, subject)` trả về `StudentJourney` / `ClassJourney` đã gắn NGÀY cho mọi sự kiện, đã cắt chặng theo mốc kiểm tra, và đã kèm các câu Trợ lý (`NarratedLine`) deterministic — mỗi câu mang figures hiển thị ngay cạnh, đúng thì (chỉ "chữa/ôn trước [sự kiện]" khi sự kiện còn ở tương lai so với `DEMO_NOW`).

## Architecture

```
src/data/types.ts          (T1) thêm contract journey: Ky, EventStatus, PrepSurface,
                                 NarratedLine, UpcomingExam, CycleSession,
                                 StudentCycle, StudentJourney, ClassCycle, ClassJourney
src/data/mock/world.ts     (T2) DEMO_NOW, OFFICIAL_EXAM, helper sinh ngày theo Kỳ
src/lib/cycles.ts          (T3) statusOf(date,now) + partitionByCycle(events,boundaries)  [PURE]
src/data/mock/builders.ts  (T4) gắn ngày exams/classHistory/missions; trải Kỳ1+Kỳ2;
                                 buildStudentPrepSurface / buildClassPrepSurface (số thô)
src/lib/narrate.ts         (T5) narrate* — tất cả PURE, deterministic, figures luôn có số
src/data/mock/journey.ts   (T6,T7) buildStudentJourney / buildClassJourney assemblers
src/data/repository.ts     (T8) thêm 2 method vào interface
src/data/mockRepository.ts (T8) wiring + cache theo key (studentId|classId)+term+subject
```

Tầng dữ liệu thuần (PURE) ở `src/lib/cycles.ts` và `src/lib/narrate.ts`; assembler ở `src/data/mock/journey.ts` đọc lại các builder hiện có (`buildStudentProfile`, `buildClassReport`) rồi xếp thành chặng — KHÔNG bịa lại `weakTopics`/`accuracy`.

## Tech Stack

Vite7 + React19 + TS + Tailwind4 + shadcn/Radix + Recharts3 + framer-motion12 + React Router 7 + Zustand(+immer) + Vitest. Root: `c:/Trường học số - source code/prj-ths-bao-cao-tong/`. Mã nguồn ở `src/`. KHÔNG phải git repo → mỗi task kết bằng "Checkpoint: chạy cổng" (`npx tsc --noEmit`; `npx vitest run`; `npx vite build`), KHÔNG có bước git commit. Alias `@` = `src`.

## Global Constraints

- Chỉ token MobiFone qua biến CSS / lớp Tailwind (brand/warning/success/error/blue-light/indigo). KHÔNG hex thô. _(Plan 01 không có UI nên ràng buộc này áp dụng khi không sinh chuỗi màu hex trong dữ liệu.)_
- Font Be Vietnam Pro. Câu chữ theo skill "humanized" (giọng giáo viên, không sáo rỗng, không "AI phân tích cho thấy"). KHÔNG dùng chữ "demo/minh hoạ".
- Dẫn chứng số liệu: chỉ bịa SỐ THÔ (đếm buổi/lượt/điểm). Mọi tỉ lệ/chỉ số hiển thị phải truy input→output. MỖI câu Trợ lý (`NarratedLine`) phải mang figures hiển thị ngay cạnh.
- Mọi chuyển động tôn trọng prefers-reduced-motion (đã có hook `useReduced()` + `reducedMotion` trong uiStore). _(không áp dụng trực tiếp ở Plan 01.)_
- Cổng phải xanh: `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.
- `convergence.topics` LẤY NGUYÊN `weakTopics` có sẵn (giữ `accuracyAvg` thật). TUYỆT ĐỐI KHÔNG dựng lại bằng `convergeWeakTopics` với accuracy bịa.

---

### Task 1: Thêm types journey vào `src/data/types.ts`

**Files**
- Modify: `src/data/types.ts`
- Test: `src/data/__tests__/journeyTypes.test.ts`

**Interfaces**
- Consumes: `Subject`, `IndexBreakdown`, `WeakTopic`, `MissionStudentReportView`, `Student`, `SessionAnalytics`, `HomeReport`, `ExamReport`, `Klass`, `ClassRosterRow` (đã có trong file).
- Produces: `Ky`, `KY_LABEL`, `EventStatus`, `PrepSurface`, `NarratedLine`, `UpcomingExam`, `CycleSession`, `StudentCycle`, `StudentJourney`, `ClassCycle`, `ClassJourney`.

**Steps**

- [ ] Viết test fail `src/data/__tests__/journeyTypes.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { KY_LABEL } from "@/data/types";
import type {
  Ky, EventStatus, PrepSurface, NarratedLine, UpcomingExam,
  CycleSession, StudentCycle, StudentJourney, ClassCycle, ClassJourney,
} from "@/data/types";

describe("journey types", () => {
  it("KY_LABEL phủ đủ 3 kỳ với nhãn tiếng Việt", () => {
    const keys: Ky[] = ["ky-1", "ky-2", "ca-nam"];
    expect(keys.map((k) => KY_LABEL[k])).toEqual(["Học kì 1", "Học kì 2", "Cả năm"]);
  });

  it("các interface ráp được (compile-time, smoke runtime)", () => {
    const status: EventStatus = "current";
    const prep: PrepSurface = {
      xemTruoc: { count: 4, total: 5 },
      baiChuanBi: { count: 3, total: 5 },
      dungGio: { count: 4, total: 5 },
    };
    const line: NarratedLine = { text: "x", figures: [{ label: "a", value: "1" }] };
    const next: UpcomingExam = { title: "Kỳ thi THPT chính thức", date: "2026-06-26" };
    const ses: CycleSession = { session: "Buổi 1", date: "2025-09-10", attendance: 1, quizAccuracy: 0.8 };
    void status; void prep; void line; void next; void ses;
    expect(true).toBe(true);
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/data/__tests__/journeyTypes.test.ts` → expected: lỗi import (`KY_LABEL` chưa export / types chưa tồn tại).

- [ ] Code tối thiểu — thêm vào CUỐI `src/data/types.ts`:

```ts
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
```

- [ ] Chạy pass: `npx vitest run src/data/__tests__/journeyTypes.test.ts` → expected: 2 passed.
- [ ] Checkpoint: chạy cổng (`npx tsc --noEmit`; `npx vitest run`; `npx vite build`).

---

### Task 2: `world.ts` — `DEMO_NOW`, `OFFICIAL_EXAM`, helper sinh ngày theo Kỳ

**Files**
- Modify: `src/data/mock/world.ts`
- Test: `src/data/mock/__tests__/world.dates.test.ts`

**Interfaces**
- Consumes: `UpcomingExam` (từ `@/data/types`).
- Produces:
  - `export const DEMO_NOW = "2026-06-10";`
  - `export const OFFICIAL_EXAM: UpcomingExam = { title: "Kỳ thi THPT chính thức", date: "2026-06-26" };`
  - `export const KY_BOUNDARIES: Record<Ky, string[]>` — mốc kiểm tra (ISO) cắt chặng theo Kỳ.
  - `export function cycleDate(ky: Ky, idx: number, total: number): string` — sinh ISO ngày của sự kiện thứ `idx`/`total` trong Kỳ, deterministic, tăng dần.
  - `export const KY_RANGE: Record<Ky, { from: string; to: string }>`.

Mốc thời gian dùng xuyên suốt: Học kì 1 = `2025-09-05` → `2026-01-10`; Học kì 2 = `2026-01-20` → `2026-06-05` (thi thử thật rơi cuối Kỳ 2, trước `DEMO_NOW` = 2026-06-10, trước `OFFICIAL_EXAM` = 2026-06-26).

**Steps**

- [ ] Viết test fail `src/data/mock/__tests__/world.dates.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { DEMO_NOW, OFFICIAL_EXAM, KY_BOUNDARIES, KY_RANGE, cycleDate } from "@/data/mock/world";

const before = (a: string, b: string) => new Date(a).getTime() < new Date(b).getTime();

describe("mốc thời gian world", () => {
  it("DEMO_NOW sau thi thử (cuối Kỳ 2) và trước kỳ thi THPT", () => {
    expect(before(KY_RANGE["ky-2"].to, DEMO_NOW)).toBe(true);
    expect(before(DEMO_NOW, OFFICIAL_EXAM.date)).toBe(true);
  });

  it("ranh giới Kỳ 1 và Kỳ 2 tăng dần, không chồng lấn", () => {
    const b1 = KY_BOUNDARIES["ky-1"];
    const b2 = KY_BOUNDARIES["ky-2"];
    for (let i = 1; i < b1.length; i++) expect(before(b1[i - 1], b1[i])).toBe(true);
    for (let i = 1; i < b2.length; i++) expect(before(b2[i - 1], b2[i])).toBe(true);
    expect(before(b1[b1.length - 1], b2[0])).toBe(true);
  });

  it("ca-nam gộp ranh giới cả 2 kỳ", () => {
    expect(KY_BOUNDARIES["ca-nam"]).toEqual([...KY_BOUNDARIES["ky-1"], ...KY_BOUNDARIES["ky-2"]]);
  });

  it("cycleDate deterministic, nằm trong range của Kỳ và tăng theo idx", () => {
    const d0 = cycleDate("ky-1", 0, 5);
    const d1 = cycleDate("ky-1", 1, 5);
    expect(cycleDate("ky-1", 0, 5)).toBe(d0);
    expect(before(d0, d1)).toBe(true);
    expect(before(KY_RANGE["ky-1"].from, d0) || d0 === KY_RANGE["ky-1"].from).toBe(true);
    expect(before(d1, KY_RANGE["ky-1"].to)).toBe(true);
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/data/mock/__tests__/world.dates.test.ts` → expected: lỗi import (`DEMO_NOW`/`cycleDate`... chưa export).

- [ ] Code tối thiểu — sửa `src/data/mock/world.ts`. Đổi dòng import type đầu file để thêm `Ky`:

```ts
import type { Khoi, Klass, Ky, School, Student, Teaching, UpcomingExam } from "@/data/types";
```

Thêm vào CUỐI file (sau `getHongTeaching`):

```ts
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
```

- [ ] Chạy pass: `npx vitest run src/data/mock/__tests__/world.dates.test.ts` → expected: 4 passed.
- [ ] Checkpoint: chạy cổng.

---

### Task 3: `src/lib/cycles.ts` — `statusOf` + `partitionByCycle`

**Files**
- Create: `src/lib/cycles.ts`
- Test: `src/lib/__tests__/cycles.test.ts`

**Interfaces**
- Consumes: `EventStatus` (từ `@/data/types`).
- Produces:
  - `export function statusOf(date: string, now: string): EventStatus`
  - `export function partitionByCycle<T extends { date: string }>(events: T[], boundaries: string[]): T[][]`

Quy ước cắt chặng: với `boundaries = [b0, b1, ...]`, chặng `k` chứa các sự kiện có `date <= boundaries[k]` và `date > boundaries[k-1]` (chặng 0 không có cận dưới). Số chặng trả về = `boundaries.length` (mỗi chặng khép bằng đúng một mốc kiểm tra). Sự kiện sau mốc cuối được dồn vào chặng cuối.

`statusOf`: `date < now` (theo ngày) → `"past"`; cùng ngày → `"current"`; `date > now` → `"upcoming"`.

**Steps**

- [ ] Viết test fail `src/lib/__tests__/cycles.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { statusOf, partitionByCycle } from "@/lib/cycles";

describe("statusOf", () => {
  it("phân loại quá khứ / hiện tại / tương lai", () => {
    expect(statusOf("2026-06-01", "2026-06-10")).toBe("past");
    expect(statusOf("2026-06-10", "2026-06-10")).toBe("current");
    expect(statusOf("2026-06-26", "2026-06-10")).toBe("upcoming");
  });
});

describe("partitionByCycle", () => {
  const boundaries = ["2025-10-20", "2026-01-08"];

  it("cắt theo mốc: mỗi mốc → một chặng, đúng số chặng", () => {
    const ev = [
      { date: "2025-09-10", id: "a" },
      { date: "2025-10-01", id: "b" },
      { date: "2025-11-05", id: "c" },
      { date: "2026-01-08", id: "d" },
    ];
    const out = partitionByCycle(ev, boundaries);
    expect(out.length).toBe(2);
    expect(out[0].map((x) => x.id)).toEqual(["a", "b"]);
    expect(out[1].map((x) => x.id)).toEqual(["c", "d"]);
  });

  it("sự kiện sau mốc cuối dồn vào chặng cuối", () => {
    const ev = [{ date: "2026-02-01", id: "late" }];
    const out = partitionByCycle(ev, boundaries);
    expect(out[out.length - 1].map((x) => x.id)).toEqual(["late"]);
  });

  it("không có mốc → một chặng chứa tất cả", () => {
    const ev = [{ date: "2025-09-10", id: "a" }];
    expect(partitionByCycle(ev, []).length).toBe(1);
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/lib/__tests__/cycles.test.ts` → expected: không tìm thấy module `@/lib/cycles`.

- [ ] Code tối thiểu `src/lib/cycles.ts`:

```ts
import type { EventStatus } from "@/data/types";

/** Quá khứ / hiện tại / tương lai so với "bây giờ", so theo NGÀY (bỏ giờ). */
export function statusOf(date: string, now: string): EventStatus {
  const d = date.slice(0, 10);
  const n = now.slice(0, 10);
  if (d < n) return "past";
  if (d > n) return "upcoming";
  return "current";
}

/**
 * Cắt danh sách sự kiện thành các chặng theo mốc kiểm tra.
 * Chặng k = các sự kiện có date <= boundaries[k] (và > boundaries[k-1]).
 * Trả về đúng boundaries.length chặng (>=1). Sự kiện sau mốc cuối dồn vào chặng cuối.
 */
export function partitionByCycle<T extends { date: string }>(
  events: T[],
  boundaries: string[]
): T[][] {
  const numCycles = Math.max(1, boundaries.length);
  const buckets: T[][] = Array.from({ length: numCycles }, () => []);
  const sorted = [...events].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  for (const ev of sorted) {
    let placed = false;
    for (let k = 0; k < boundaries.length; k++) {
      if (ev.date.slice(0, 10) <= boundaries[k].slice(0, 10)) {
        buckets[k].push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) buckets[numCycles - 1].push(ev);
  }
  return buckets;
}
```

- [ ] Chạy pass: `npx vitest run src/lib/__tests__/cycles.test.ts` → expected: 4 passed.
- [ ] Checkpoint: chạy cổng.

---

### Task 4: `builders.ts` — gắn NGÀY + trải Kỳ + PrepSurface (số thô)

**Files**
- Modify: `src/data/mock/builders.ts`
- Test: `src/data/mock/__tests__/builders.dates.test.ts`

**Interfaces**
- Consumes: `getWorld`, `CLASS_HERO`, `cycleDate`, `KY_RANGE` (từ `./world`); `Rng` (từ `@/lib/random`); `PrepSurface`, `Ky`, `MissionStudentReportView`, `Student` (từ `@/data/types`); `buildStudentProfile`, `buildClassReport`, `buildHome` (cùng file).
- Produces:
  - `export interface DatedExam { term: string; subject: Subject; score: number; classAvg: number; date: string }`
  - `export interface DatedSession { session: string; attendance: number; quizAccuracy: number; date: string }`
  - `export function studentExamsForKy(studentId: string, term: Ky): DatedExam[]`
  - `export function studentSessionsForKy(studentId: string, term: Ky): DatedSession[]`
  - `export function studentMissionsForKy(studentId: string, term: Ky): MissionStudentReportView[]` (gắn ngày qua field nội bộ — xem dưới)
  - `export function buildStudentPrepSurface(studentId: string, term: Ky): PrepSurface`
  - `export function buildClassPrepSurface(classId: string, term: Ky): PrepSurface`
  - Mở rộng kiểu trả về `MissionStudentReportView` không đổi; ngày gắn qua map phụ `export function missionDate(studentId: string, term: Ky, i: number, n: number): string`.

Ghi chú thiết kế: `buildStudentProfile` đã sinh `exams` (4 mốc), `classHistory` (5 buổi), `missions` (6) KHÔNG có ngày. Ở đây ta KHÔNG sửa profile; ta tạo các hàm phụ gắn ngày bằng `cycleDate(...)`. Với `ky-1`/`ky-2`: chia đôi danh sách (nửa đầu Kỳ 1, nửa sau Kỳ 2). Với `ca-nam`: trải toàn bộ qua cả năm. Số thô của `PrepSurface` lấy từ đếm thật (số buổi có mặt, số nhiệm vụ đã nộp, số nhiệm vụ đúng hạn).

**Steps**

- [ ] Viết test fail `src/data/mock/__tests__/builders.dates.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  studentExamsForKy, studentSessionsForKy, studentMissionsForKy, missionDate,
  buildStudentPrepSurface, buildClassPrepSurface,
} from "@/data/mock/builders";
import { partitionByCycle } from "@/lib/cycles";
import { KY_BOUNDARIES, KY_RANGE } from "@/data/mock/world";
import { STUDENT_HERO, CLASS_HERO } from "@/data/mock/world";

const inRange = (d: string, ky: "ky-1" | "ky-2" | "ca-nam") =>
  d >= KY_RANGE[ky].from && d <= KY_RANGE[ky].to;

describe("gắn ngày & trải Kỳ", () => {
  it("exams của Kỳ nằm trong range Kỳ và tăng dần", () => {
    const ex = studentExamsForKy(STUDENT_HERO, "ca-nam");
    expect(ex.length).toBeGreaterThan(0);
    for (const e of ex) expect(inRange(e.date, "ca-nam")).toBe(true);
    for (let i = 1; i < ex.length; i++) expect(ex[i - 1].date <= ex[i].date).toBe(true);
  });

  it("cắt chặng đúng: số buổi + số kỳ thi khớp số chặng (ca-nam = 4 mốc)", () => {
    const sessions = studentSessionsForKy(STUDENT_HERO, "ca-nam");
    const buckets = partitionByCycle(sessions, KY_BOUNDARIES["ca-nam"]);
    expect(buckets.length).toBe(4);
    // tổng buổi sau khi cắt = tổng buổi ban đầu (không mất sự kiện)
    expect(buckets.reduce((a, b) => a + b.length, 0)).toBe(sessions.length);
  });

  it("missionDate deterministic và nằm trong range", () => {
    const ms = studentMissionsForKy(STUDENT_HERO, "ky-2");
    const d0 = missionDate(STUDENT_HERO, "ky-2", 0, ms.length);
    expect(missionDate(STUDENT_HERO, "ky-2", 0, ms.length)).toBe(d0);
    expect(inRange(d0, "ky-2")).toBe(true);
  });

  it("PrepSurface học sinh: count <= total, số nguyên không âm", () => {
    const p = buildStudentPrepSurface(STUDENT_HERO, "ca-nam");
    for (const s of [p.xemTruoc, p.baiChuanBi, p.dungGio]) {
      expect(Number.isInteger(s.count)).toBe(true);
      expect(Number.isInteger(s.total)).toBe(true);
      expect(s.count).toBeLessThanOrEqual(s.total);
      expect(s.count).toBeGreaterThanOrEqual(0);
    }
  });

  it("PrepSurface lớp: total > 0", () => {
    const p = buildClassPrepSurface(CLASS_HERO, "ca-nam");
    expect(p.xemTruoc.total).toBeGreaterThan(0);
    expect(p.dungGio.count).toBeLessThanOrEqual(p.dungGio.total);
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/data/mock/__tests__/builders.dates.test.ts` → expected: lỗi import (các hàm mới chưa tồn tại).

- [ ] Code tối thiểu — sửa `src/data/mock/builders.ts`. Cập nhật import từ `./world` để có `cycleDate`, `KY_RANGE`:

```ts
import {
  getWorld, CLASS_HERO, SCHOOL_HERO, DIA_TOPICS, cycleDate, KY_RANGE,
} from "./world";
```

Thêm import type `Ky`, `PrepSurface` vào khối import type đầu file (dòng 1–5), kết quả:

```ts
import type {
  ClassReport, ClassRosterRow, EngagementPoint, ExamCodeReport, ExamReport, HomeReport,
  Ky, MissionReportView, MissionStudentReportView, PhongOverview, PhongSchoolRow, PrepSurface,
  QuestionReport, SchoolReport, SessionAnalytics, Student, StudentProfile, Subject, TopicAccuracy,
  WeakTopic,
} from "@/data/types";
```

Thêm vào CUỐI `src/data/mock/builders.ts`:

```ts
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
    .filter((_, i) => term === "ca-nam" || kyOfIndex(term, i, n) === term)
    .map((e) => {
      const i = profile.exams.indexOf(e);
      const sp = localSpread(term, i, n);
      return { ...e, date: cycleDate(sp.ky, sp.idx, sp.total) };
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function studentSessionsForKy(studentId: string, term: Ky): DatedSession[] {
  const profile = buildStudentProfile(studentId);
  const n = profile.classHistory.length;
  return profile.classHistory
    .filter((_, i) => term === "ca-nam" || kyOfIndex(term, i, n) === term)
    .map((s) => {
      const i = profile.classHistory.indexOf(s);
      const sp = localSpread(term, i, n);
      return { ...s, date: cycleDate(sp.ky, sp.idx, sp.total) };
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function missionDate(studentId: string, term: Ky, i: number, n: number): string {
  const sp = localSpread(term, i, n);
  // dịch nhẹ trong Kỳ để nhiệm vụ không trùng ngày buổi học (offset bằng index lẻ)
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
```

- [ ] Chạy pass: `npx vitest run src/data/mock/__tests__/builders.dates.test.ts` → expected: 5 passed.
- [ ] Checkpoint: chạy cổng.

---

### Task 5: `src/lib/narrate.ts` — Trợ lý offline (PURE, deterministic, figures luôn có số)

**Files**
- Create: `src/lib/narrate.ts`
- Test: `src/lib/__tests__/narrate.test.ts`

**Interfaces**
- Consumes: `NarratedLine`, `PrepSurface`, `WeakTopic`, `UpcomingExam`, `EventStatus`, `IndexBreakdown` (từ `@/data/types`); `diem`, `pct`, `int` (từ `@/lib/format`).
- Produces (chữ ký CHÍNH XÁC):
  - `narrateStudentOverview(j: { rank: number; classSize: number; trend: "up" | "flat" | "down"; learningIndex: IndexBreakdown; effortIndex: IndexBreakdown }): NarratedLine`
  - `narrateClassOverview(j: { numStudents: number; examAvg: number; learningIndex: IndexBreakdown; effortIndex: IndexBreakdown; needSupport: number }): NarratedLine`
  - `narratePrep(s: PrepSurface, gentle: boolean): NarratedLine`
  - `narrateClassroom(cycleLop: { attendanceRate: number; quizAccuracyAvg: number; numSessions: number }, gentle: boolean): NarratedLine`
  - `narrateHome(cycleNha: { completionRate: number; onTimeRate: number; avgScore: number | null; numMissions: number }, gentle: boolean): NarratedLine`
  - `narrateExam(exam: { score: number; classAvg: number; term: string }, status: EventStatus, gentle: boolean): NarratedLine` (bản HỌC SINH: so điểm em với TB lớp)
  - `narrateClassExam(report: { avg: number; median: number; numStudents: number; title: string }, status: EventStatus): NarratedLine` (bản LỚP: KHÔNG so avg với chính nó; nói "điểm TB X · trung vị Y · N bài")
  - `narrateConvergence(topics: WeakTopic[], gentle: boolean, nextExam: UpcomingExam | null): NarratedLine`

QUY TẮC THÌ (bắt buộc): chỉ chèn cụm "… trước {nextExam.title}" khi `nextExam != null`. Nếu `nextExam == null` → dùng "nên ôn/củng cố lại", KHÔNG "chữa trước". `gentle=true` (học sinh) → "nên ôn lại"; `gentle=false` (giáo viên) → "nên chữa trước".

**Steps**

- [ ] Viết test fail `src/lib/__tests__/narrate.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  narrateStudentOverview, narrateClassOverview, narratePrep,
  narrateClassroom, narrateHome, narrateExam, narrateClassExam, narrateConvergence,
} from "@/lib/narrate";
import type { IndexBreakdown, WeakTopic, UpcomingExam } from "@/data/types";

const idx = (total: number): IndexBreakdown => ({ total, parts: [], partial: undefined });
const topics: WeakTopic[] = [
  { topic: "Vùng kinh tế", surfaces: { lop: true, nha: false, thi: true }, confirmed: true, accuracyAvg: 0.48 },
];
const NEXT: UpcomingExam = { title: "Kỳ thi THPT chính thức", date: "2026-06-26" };

describe("narrate — figures luôn có số", () => {
  const all = [
    narrateStudentOverview({ rank: 5, classSize: 42, trend: "up", learningIndex: idx(78), effortIndex: idx(82) }),
    narrateClassOverview({ numStudents: 42, examAvg: 7.1, learningIndex: idx(74), effortIndex: idx(80), needSupport: 6 }),
    narratePrep({ xemTruoc: { count: 4, total: 5 }, baiChuanBi: { count: 3, total: 6 }, dungGio: { count: 5, total: 6 } }, true),
    narrateClassroom({ attendanceRate: 0.95, quizAccuracyAvg: 0.72, numSessions: 3 }, true),
    narrateHome({ completionRate: 0.86, onTimeRate: 0.8, avgScore: 7.4, numMissions: 4 }, true),
    narrateExam({ score: 7, classAvg: 7.2, term: "Thi thử gần nhất" }, "past", true),
    narrateClassExam({ avg: 7.1, median: 7.0, numStudents: 108, title: "Thi thử THPT môn Địa lí" }, "past"),
    narrateConvergence(topics, true, NEXT),
  ];
  it("mỗi câu có ít nhất 1 figure và mỗi figure mang số", () => {
    for (const line of all) {
      expect(line.figures.length).toBeGreaterThan(0);
      for (const f of line.figures) expect(/\d/.test(f.value)).toBe(true);
      expect(line.text.length).toBeGreaterThan(0);
    }
  });
});

describe("narrate — deterministic", () => {
  it("gọi 2 lần ra y hệt", () => {
    const a = narrateConvergence(topics, false, NEXT);
    const b = narrateConvergence(topics, false, NEXT);
    expect(a).toEqual(b);
    const c = narrateExam({ score: 8, classAvg: 7, term: "Thi thử gần nhất" }, "past", true);
    const d = narrateExam({ score: 8, classAvg: 7, term: "Thi thử gần nhất" }, "past", true);
    expect(c).toEqual(d);
  });
});

describe("narrate — ĐÚNG THÌ", () => {
  it("nextExam=null ⇒ KHÔNG chứa 'chữa trước', dùng 'ôn/củng cố lại'", () => {
    const line = narrateConvergence(topics, false, null);
    expect(line.text).not.toContain("chữa trước");
    expect(/ôn|củng cố/.test(line.text)).toBe(true);
  });
  it("nextExam!=null ⇒ chứa 'trước {title}'", () => {
    const line = narrateConvergence(topics, false, NEXT);
    expect(line.text).toContain("trước " + NEXT.title);
  });
  it("gentle (học sinh) dùng 'nên ôn lại'; giáo viên dùng 'nên chữa trước' khi có nextExam", () => {
    expect(narrateConvergence(topics, true, NEXT).text).toContain("nên ôn lại");
    expect(narrateConvergence(topics, false, NEXT).text).toContain("nên chữa trước");
  });
});

describe("narrateClassExam — không so avg với chính nó", () => {
  it("dùng trung vị + N, không có cụm 'so với trung bình'", () => {
    const line = narrateClassExam({ avg: 7.1, median: 7.0, numStudents: 108, title: "Thi thử THPT môn Địa lí" }, "past");
    const labels = line.figures.map((f) => f.label.toLowerCase());
    expect(labels.some((l) => l.includes("trung vị"))).toBe(true);
    expect(labels.some((l) => l.includes("số bài") || l.includes("bài"))).toBe(true);
    expect(line.text).not.toContain("so với trung bình");
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/lib/__tests__/narrate.test.ts` → expected: không tìm thấy module `@/lib/narrate`.

- [ ] Code tối thiểu `src/lib/narrate.ts`:

```ts
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
  const text = `Em đang xếp hạng ${j.rank}/${j.classSize} trong lớp và ${TREND_WORD[j.trend]}. Chỉ số học tập ${j.learningIndex.total}, nỗ lực ${j.effortIndex.total} — nhìn chung là một quá trình đều tay.`;
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
  const figures = [
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
  const verb = status === "upcoming" ? "sẽ làm" : "đã làm";
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
  const verb = status === "upcoming" ? "Sắp tới" : "Ở";
  const text = `${verb} ${report.title}: điểm TB ${diem(report.avg)} · trung vị ${diem(report.median)} · ${int(report.numStudents)} bài. Phần lệch giữa trung bình và trung vị cho thấy nhóm điểm thấp đang kéo mặt bằng xuống.`;
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
  // ĐÚNG THÌ:
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
```

- [ ] Chạy pass: `npx vitest run src/lib/__tests__/narrate.test.ts` → expected: tất cả passed (figures, deterministic, đúng thì, classExam).
- [ ] Checkpoint: chạy cổng.

---

### Task 6: `buildStudentJourney` assembler

**Files**
- Create: `src/data/mock/journey.ts`
- Test: `src/data/mock/__tests__/studentJourney.test.ts`

**Interfaces**
- Consumes: `buildStudentProfile`, `studentExamsForKy`, `studentSessionsForKy`, `studentMissionsForKy`, `missionDate`, `buildStudentPrepSurface` (từ `./builders`); `getWorld`, `DEMO_NOW`, `OFFICIAL_EXAM`, `KY_BOUNDARIES`, `KY_RANGE`, `STUDENT_HERO` (từ `./world`); `statusOf`, `partitionByCycle` (từ `@/lib/cycles`); `narrate*` (từ `@/lib/narrate`); `mean` (từ `@/lib/metrics`); types journey (từ `@/data/types`).
- Produces: `export function buildStudentJourney(studentId: string, term: Ky, subject: Subject): StudentJourney`

Quy tắc khoá:
- `convergence.topics = profile.weakTopics` (giữ `accuracyAvg` thật) — KHÔNG dựng lại.
- `nextExam`: nếu `OFFICIAL_EXAM.date > DEMO_NOW` → `OFFICIAL_EXAM` (còn tương lai), ngược lại `null`.
- `empty = true` khi lát Kỳ không có bất kỳ buổi học, nhiệm vụ, hay kỳ thi nào.
- Mỗi chặng khép bằng một kỳ thi: ghép kỳ thi vào chặng theo `partitionByCycle(exams, KY_BOUNDARIES[term])`; chặng cuối có thi thử thật.
- `exam.submissionKey = "s:" + studentId` (đúng link `/app/bai-lam/{examId}/s:{studentId}`); `examId` lấy từ `buildClassReport(classId).thi.examId` qua world (HS hero → `sontay-dia-thithu-1`).

**Steps**

- [ ] Viết test fail `src/data/mock/__tests__/studentJourney.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildStudentJourney } from "@/data/mock/journey";
import { buildStudentProfile } from "@/data/mock/builders";
import { STUDENT_HERO, DEMO_NOW } from "@/data/mock/world";
import { statusOf } from "@/lib/cycles";

describe("buildStudentJourney", () => {
  it("convergence.topics LẤY NGUYÊN weakTopics của profile (giữ accuracyAvg thật)", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const profile = buildStudentProfile(STUDENT_HERO);
    expect(j.convergence.topics).toEqual(profile.weakTopics);
  });

  it("now = DEMO_NOW và kind='student'", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    expect(j.now).toBe(DEMO_NOW);
    expect(j.kind).toBe("student");
  });

  it("trạng thái chặng đúng theo statusOf(range.to, now)", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    for (const c of j.cycles) {
      expect(c.status).toBe(statusOf(c.range.to, DEMO_NOW));
    }
  });

  it("mỗi narration có figures mang số", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const lines = [j.overview.narration, j.prep.narration, j.convergence.narration];
    for (const c of j.cycles) lines.push(c.lop.narration, c.nha.narration);
    for (const l of lines) {
      expect(l.figures.length).toBeGreaterThan(0);
      for (const f of l.figures) expect(/\d/.test(f.value)).toBe(true);
    }
  });

  it("nextExam còn tương lai (OFFICIAL_EXAM sau DEMO_NOW)", () => {
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    expect(j.convergence.nextExam).not.toBeNull();
    expect(j.convergence.nextExam!.title).toBe("Kỳ thi THPT chính thức");
  });

  it("lát rỗng → empty=true", () => {
    // môn không có dữ liệu trong profile (profile chỉ sinh Địa lí) → không có exam/buổi/nhiệm vụ Địa lí cho Toán
    const j = buildStudentJourney(STUDENT_HERO, "ca-nam", "Toán");
    expect(j.empty).toBe(true);
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/data/mock/__tests__/studentJourney.test.ts` → expected: không tìm thấy module `@/data/mock/journey`.

- [ ] Code tối thiểu `src/data/mock/journey.ts`:

```ts
import type {
  Ky, Subject, StudentJourney, StudentCycle, ClassJourney, ClassCycle,
  CycleSession, UpcomingExam, MissionStudentReportView,
} from "@/data/types";
import {
  buildStudentProfile, buildClassReport,
  studentExamsForKy, studentSessionsForKy, studentMissionsForKy, missionDate,
  buildStudentPrepSurface, buildClassPrepSurface,
  type DatedExam, type DatedSession,
} from "./builders";
import {
  getWorld, DEMO_NOW, OFFICIAL_EXAM, KY_BOUNDARIES, KY_RANGE, CLASS_HERO,
} from "./world";
import { statusOf, partitionByCycle } from "@/lib/cycles";
import { mean } from "@/lib/metrics";
import {
  narrateStudentOverview, narrateClassOverview, narratePrep,
  narrateClassroom, narrateHome, narrateExam, narrateClassExam, narrateConvergence,
} from "@/lib/narrate";

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
  const sessions: DatedSession[] = subjectMatches ? studentSessionsForKy(studentId, term) : [];
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
    const cExam = (examBuckets[k] ?? [])[examBuckets[k]?.length ? examBuckets[k].length - 1 : 0] ?? null;

    const attendanceRate = cSessions.length ? mean(cSessions.map((s) => s.attendance)) : 0;
    const quizAccuracyAvg = cSessions.length ? mean(cSessions.map((s) => s.quizAccuracy)) : 0;
    const graded = cMissions.filter((m) => m.status === "graded" || m.status === "submitted");
    const completionRate = cMissions.length ? graded.length / cMissions.length : 0;
    const onTimeRate = cMissions.length ? cMissions.filter((m) => !m.late).length / cMissions.length : 0;
    const avgScore = avgOrNull(graded.map((m) => m.totalScore!).filter((v) => v != null));

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
      topics: profile.weakTopics,
      nextExam,
      narration: narrateConvergence(profile.weakTopics, true, nextExam),
    },
    availableSlices: { terms: ["ky-1", "ky-2", "ca-nam"], subjects: ["Địa lí"] },
    empty,
  };
}
```

(File `journey.ts` cũng sẽ chứa `buildClassJourney` ở Task 7 — Task 6 chỉ thêm phần student; phần class thêm vào CUỐI cùng file ở Task 7.)

- [ ] Chạy pass: `npx vitest run src/data/mock/__tests__/studentJourney.test.ts` → expected: 6 passed.
- [ ] Checkpoint: chạy cổng.

---

### Task 7: `buildClassJourney` assembler

**Files**
- Modify: `src/data/mock/journey.ts` (thêm `buildClassJourney` ở cuối)
- Test: `src/data/mock/__tests__/classJourney.test.ts`

**Interfaces**
- Consumes: `buildClassReport`, `buildClassPrepSurface` (từ `./builders`); `getWorld`, `DEMO_NOW`, `OFFICIAL_EXAM`, `KY_BOUNDARIES`, `KY_RANGE` (từ `./world`); `statusOf` (từ `@/lib/cycles`); `narrateClassOverview`, `narratePrep`, `narrateClassroom`, `narrateHome`, `narrateClassExam`, `narrateConvergence` (từ `@/lib/narrate`); `mean` (từ `@/lib/metrics`).
- Produces: `export function buildClassJourney(classId: string, term: Ky, subject: Subject): ClassJourney`

Quy tắc khoá:
- `cycle.exam.narration = narrateClassExam(report, status)` (bản LỚP, không so avg với chính nó).
- `convergence.topics = report.weakTopics` (thật, từ `buildClassReport`).
- `convergence.needSupport = report.roster.filter((r) => r.needSupport)`.
- Cấp lớp chỉ có một `SessionAnalytics`/`HomeReport`/`ExamReport` (ảnh chụp lớp); mỗi chặng dùng lại cùng `session`/`report`, chỉ chặng cuối mới có `exam` (thi thử thật). `nextExam` như student.

**Steps**

- [ ] Viết test fail `src/data/mock/__tests__/classJourney.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildClassJourney } from "@/data/mock/journey";
import { buildClassReport } from "@/data/mock/builders";
import { CLASS_HERO, DEMO_NOW } from "@/data/mock/world";
import { statusOf } from "@/lib/cycles";

describe("buildClassJourney", () => {
  it("convergence.topics = report.weakTopics thật", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    const report = buildClassReport(CLASS_HERO);
    expect(j.convergence.topics).toEqual(report.weakTopics);
  });

  it("needSupport = các roster needSupport", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    const report = buildClassReport(CLASS_HERO);
    expect(j.convergence.needSupport).toEqual(report.roster.filter((r) => r.needSupport));
    expect(j.overview.needSupport).toBe(report.roster.filter((r) => r.needSupport).length);
  });

  it("cycle.exam.narration là bản LỚP (figures có 'trung vị' và 'số bài', không so avg với chính nó)", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    const withExam = j.cycles.find((c) => c.exam !== null);
    expect(withExam).toBeTruthy();
    const labels = withExam!.exam!.narration.figures.map((f) => f.label.toLowerCase());
    expect(labels.some((l) => l.includes("trung vị"))).toBe(true);
    expect(labels.some((l) => l.includes("bài"))).toBe(true);
    expect(withExam!.exam!.narration.text).not.toContain("so với trung bình");
  });

  it("trạng thái chặng đúng + kind='class' + now=DEMO_NOW", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    expect(j.kind).toBe("class");
    expect(j.now).toBe(DEMO_NOW);
    for (const c of j.cycles) expect(c.status).toBe(statusOf(c.range.to, DEMO_NOW));
  });

  it("chỉ chặng cuối có exam", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    const withExam = j.cycles.filter((c) => c.exam !== null);
    expect(withExam.length).toBe(1);
    expect(j.cycles[j.cycles.length - 1].exam).not.toBeNull();
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/data/mock/__tests__/classJourney.test.ts` → expected: `buildClassJourney` chưa export.

- [ ] Code tối thiểu — sửa import block của `src/data/mock/journey.ts` để thêm các symbol class (nếu chưa có) và thêm `buildClassReport`, `buildClassPrepSurface` (đã import ở Task 6). Thêm vào CUỐI `src/data/mock/journey.ts`:

```ts
export function buildClassJourney(classId: string, term: Ky, subject: Subject): ClassJourney {
  const world = getWorld();
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
  void world;

  return {
    kind: "class",
    slice: { term, subject },
    now,
    klass: report.klass,
    schoolName: getWorld().schoolById.get(report.klass.schoolId)?.name ?? "",
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
```

- [ ] Chạy pass: `npx vitest run src/data/mock/__tests__/classJourney.test.ts` → expected: 5 passed.
- [ ] Checkpoint: chạy cổng.

---

### Task 8: `repository.ts` interface + `mockRepository.ts` wiring (cache theo key)

**Files**
- Modify: `src/data/repository.ts`
- Modify: `src/data/mockRepository.ts`
- Test: `src/data/__tests__/journeyRepository.test.ts`

**Interfaces**
- Consumes: `StudentJourney`, `ClassJourney`, `Ky`, `Subject` (types); `buildStudentJourney`, `buildClassJourney` (từ `./mock/journey`).
- Produces (thêm vào interface `ReportRepository`):
  - `getStudentJourney(studentId: string, term: Ky, subject: Subject): StudentJourney`
  - `getClassJourney(classId: string, term: Ky, subject: Subject): ClassJourney`
- Cache key: `` `${studentId}|${term}|${subject}` `` và `` `${classId}|${term}|${subject}` ``.

**Steps**

- [ ] Viết test fail `src/data/__tests__/journeyRepository.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mockRepository } from "@/data/mockRepository";
import { STUDENT_HERO, CLASS_HERO } from "@/data/mock/world";

describe("repository journey wiring", () => {
  it("getStudentJourney trả StudentJourney đúng lát", () => {
    const j = mockRepository.getStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    expect(j.kind).toBe("student");
    expect(j.slice).toEqual({ term: "ca-nam", subject: "Địa lí" });
  });

  it("getClassJourney trả ClassJourney đúng lát", () => {
    const j = mockRepository.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    expect(j.kind).toBe("class");
    expect(j.slice).toEqual({ term: "ky-1", subject: "Địa lí" });
  });

  it("cache theo key: cùng key trả cùng tham chiếu, khác key thì khác", () => {
    const a = mockRepository.getStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const b = mockRepository.getStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const c = mockRepository.getStudentJourney(STUDENT_HERO, "ky-1", "Địa lí");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/data/__tests__/journeyRepository.test.ts` → expected: `getStudentJourney` không tồn tại trên `mockRepository`.

- [ ] Code tối thiểu — sửa `src/data/repository.ts`. Cập nhật import type để thêm `ClassJourney`, `StudentJourney`, `Ky`, `Subject`:

```ts
import type {
  Account, ClassJourney, ClassReport, ExamPaper, Klass, Ky, MissionDetail, PhongOverview,
  School, SchoolReport, Student, StudentExamSubmission, StudentJourney, StudentMissionSubmission,
  StudentProfile, Subject, Teaching,
} from "./types";
```

Thêm 2 dòng vào interface `ReportRepository` (trước dấu `}`):

```ts
  getStudentJourney(studentId: string, term: Ky, subject: Subject): StudentJourney;
  getClassJourney(classId: string, term: Ky, subject: Subject): ClassJourney;
```

- [ ] Code tối thiểu — sửa `src/data/mockRepository.ts`. Thêm import journey + types:

```ts
import type { ClassReport, ClassJourney, ExamPaper, Ky, MissionDetail, SchoolReport, StudentJourney, StudentProfile, Subject } from "./types";
import { buildStudentJourney, buildClassJourney } from "./mock/journey";
```

(Dòng `import type` cũ ở đầu file đã có `ClassReport, ExamPaper, MissionDetail, SchoolReport, StudentProfile` — thay nguyên dòng đó bằng dòng trên.)

Thêm hai cache map cạnh các cache hiện có:

```ts
const studentJourneyCache = new Map<string, StudentJourney>();
const classJourneyCache = new Map<string, ClassJourney>();
```

Thêm hai method vào object `mockRepository` (trước `getExamPaper`):

```ts
  getStudentJourney: (studentId: string, term: Ky, subject: Subject) => {
    const key = `${studentId}|${term}|${subject}`;
    if (!studentJourneyCache.has(key)) studentJourneyCache.set(key, buildStudentJourney(studentId, term, subject));
    return studentJourneyCache.get(key)!;
  },
  getClassJourney: (classId: string, term: Ky, subject: Subject) => {
    const key = `${classId}|${term}|${subject}`;
    if (!classJourneyCache.has(key)) classJourneyCache.set(key, buildClassJourney(classId, term, subject));
    return classJourneyCache.get(key)!;
  },
```

- [ ] Chạy pass: `npx vitest run src/data/__tests__/journeyRepository.test.ts` → expected: 3 passed.
- [ ] Checkpoint: chạy cổng (`npx tsc --noEmit`; `npx vitest run`; `npx vite build`) — toàn bộ test xanh, type pass, build pass.

---

## Tổng kết bàn giao

Sau Plan 01:
- `src/data/types.ts` có đủ contract journey.
- `src/lib/cycles.ts` (PURE) cắt chặng + phân loại thì.
- `src/lib/narrate.ts` (PURE) sinh câu Trợ lý deterministic, figures luôn có số, đúng thì.
- `src/data/mock/journey.ts` ráp `StudentJourney`/`ClassJourney`, giữ nguyên `weakTopics`/`accuracyAvg` thật.
- `mockRepository.getStudentJourney` / `getClassJourney` có cache theo key.

Plan 02 (vỏ UI dùng chung + studentChapters + route học sinh) và Plan 03 (classChapters + route lớp) tiêu thụ trực tiếp hai method này và các kiểu trong contract.
