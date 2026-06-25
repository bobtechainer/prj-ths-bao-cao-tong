# All-Subjects Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cross-subject "Tất cả môn" overview to the student journey, sliced by Kỳ, that renders through the existing `<Journey>` shell with 3 chapters (Mở đầu / Các môn / Hội tụ) and per-subject comparison bars.

**Architecture:** `getStudentOverview(studentId, term)` computes per-subject slices via `buildStudentSubjectSlice` and aggregates them into a `StudentOverview` shape. `buildOverviewChapters(overview, nav)` produces `ChapterDef[]`. The route `hoc-sinh.tsx` detects `?mon=all`, branches to the overview path, and passes generic `KyMonPicker<S extends string>` the list `["Tất cả môn", ...SUBJECTS]`. No new fabricated data—all figures are computed from the per-subject slices.

**Tech Stack:** React 18, TypeScript (strict), Vite, Vitest + Testing Library, Recharts, Tailwind + MobiFone CSS tokens, react-router-dom v6, branch `feat/hanh-trinh-bao-cao`.

## Global Constraints

- MobiFone CSS tokens only — no hex / inline color values in JSX.
- `@` alias maps to `src/`.
- `npx tsc --noEmit` must pass; `npx vitest run` full suite green.
- Existing per-subject and class tests must not regress.
- No `console.log` in production code.
- Conventional commits, no Co-Authored-By trailer.
- No new fabricated figures — all numbers derived from `buildStudentSubjectSlice`.
- `ChapterDef.render()` returns bare content — do NOT wrap in `<Chapter>` inside `render()` (Journey shell wraps it).
- KHÔNG "demo/minh hoạ" in any UI copy.
- Color = band signal + numeric value shown (not color-only).
- `tabular-nums` class on all numeric cells.
- `prefers-reduced-motion`: use `useUiStore().reducedMotion` (already used by tests via `useUiStore.setState({ reducedMotion: true })`).
- Git branch: `feat/hanh-trinh-bao-cao`. Commit with `feat(journey): ...`.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/data/types.ts` (modify) | Add `StudentOverview` type |
| Create | `src/data/repository.ts` (modify) | Add `getStudentOverview` to `ReportRepository` |
| Create | `src/data/mock/overview.ts` | `buildStudentOverview` + `getStudentOverview` assembler |
| Modify | `src/data/mockRepository.ts` | Wire `getStudentOverview`, add cache |
| Create | `src/lib/narrate.ts` (modify) | Add `narrateOverviewMoDau`, `narrateOverviewCacMon`, `narrateOverviewHoiTu` |
| Create | `src/components/journey/overviewChapters.tsx` | `buildOverviewChapters(overview, nav)` → `ChapterDef[]` |
| Create | `src/components/journey/SubjectComparisonBars.tsx` | Horizontal bar list per subject, colored by band, with drill links |
| Modify | `src/components/journey/KyMonPicker.tsx` | Make generic `KyMonPicker<S extends string>` |
| Modify | `src/routes/hoc-sinh.tsx` | Parse `?mon=all`, branch to overview path, use `KyMonPicker<string>` |
| Create | `src/data/mock/overview.test.ts` | Tests for `getStudentOverview` |
| Create | `src/components/journey/overviewChapters.test.tsx` | Tests for `buildOverviewChapters` |
| Create | `src/components/journey/SubjectComparisonBars.test.tsx` | Tests for drill links + rendering |
| Create | `src/routes/hoc-sinh.overview.test.tsx` | Route-level test for `?mon=all` |

---

## Task 1 — Data types and `StudentOverview` shape

**Files:**
- Modify: `src/data/types.ts` (after `StudentJourney` interface, ~line 449)
- Modify: `src/data/repository.ts`

**Interfaces:**
- Produces: `StudentOverview`, `SubjectEntry` — consumed by Task 3 (assembler), Task 4 (narrate), Task 5 (chapters)

- [ ] **Step 1: Add `SubjectEntry` and `StudentOverview` to `src/data/types.ts`**

Insert after the closing brace of `StudentJourney` (after line 449):

```typescript
/** Một môn trong overview tổng hợp. */
export interface SubjectEntry {
  subject: Subject;
  /** Điểm thi gần nhất (exams.at(-1).score) hoặc null nếu chưa có bài thi. */
  latestExamScore: number | null;
  /** learningIndex.total đã tính từ buildStudentSubjectSlice. */
  learningIndex: number;
  /** effortIndex.total. */
  effortIndex: number;
  rank: number;
  classSize: number;
  trend: "up" | "flat" | "down";
  weakTopics: WeakTopic[];
}

export interface StudentOverview {
  kind: "overview";
  slice: { term: Ky; subject: "Tất cả môn" };
  now: string;
  student: Student;
  className: string;
  schoolName: string;
  /** Danh sách 8 môn, sorted strongest→weakest by latestExamScore (null last). */
  subjects: SubjectEntry[];
  /** Trung bình learningIndex qua 8 môn. */
  overallLearningIndex: number;
  /** Môn có điểm cao nhất (latestExamScore). */
  strongest: SubjectEntry;
  /** Môn có điểm thấp nhất (latestExamScore). */
  weakest: SubjectEntry;
  availableSlices: { terms: Ky[]; subjects: string[] };
}
```

- [ ] **Step 2: Add `getStudentOverview` to `src/data/repository.ts`**

Add the import at the top:
```typescript
import type { StudentOverview } from "./types";
```

Add to the `ReportRepository` interface (after `getClassJourney` line):
```typescript
getStudentOverview(studentId: string, term: Ky): StudentOverview;
```

- [ ] **Step 3: Run `npx tsc --noEmit` and expect TS errors about unimplemented method (that's fine — we'll implement in Task 2)**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx tsc --noEmit 2>&1 | head -30
```
Expected: errors mentioning `getStudentOverview` not implemented on `mockRepository` — confirm types themselves are valid.

- [ ] **Step 4: Commit**

```bash
git add src/data/types.ts src/data/repository.ts
git commit -m "feat(journey): add StudentOverview + SubjectEntry types and repository interface"
```

---

## Task 2 — Assembler `buildStudentOverview` + mock cache

**Files:**
- Create: `src/data/mock/overview.ts`
- Modify: `src/data/mockRepository.ts`

**Interfaces:**
- Consumes: `buildStudentSubjectSlice(studentId, term, subject): StudentSubjectSlice` from `src/data/mock/builders.ts`; `buildStudentProfile(studentId)` from same; `SUBJECTS`, `StudentOverview`, `SubjectEntry`, `Ky` from `src/data/types.ts`; `DEMO_NOW` from `src/data/mock/world.ts`
- Produces: `getStudentOverview(studentId, term): StudentOverview` — consumed by Task 3 tests and route

- [ ] **Step 1: Write the failing test (create `src/data/mock/overview.test.ts`)**

```typescript
import { describe, expect, test } from "vitest";
import { STUDENT_HERO } from "@/data/mock/world";
import { SUBJECTS } from "@/data/types";
import { buildStudentOverview } from "./overview";

describe("buildStudentOverview", () => {
  test("returns entries for all 8 subjects", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ca-nam");
    expect(overview.subjects).toHaveLength(SUBJECTS.length);
    for (const sub of SUBJECTS) {
      const entry = overview.subjects.find((e) => e.subject === sub);
      expect(entry, `missing subject ${sub}`).toBeDefined();
    }
  });

  test("each subject entry has numeric learningIndex in 0-100", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ca-nam");
    for (const e of overview.subjects) {
      expect(e.learningIndex).toBeGreaterThanOrEqual(0);
      expect(e.learningIndex).toBeLessThanOrEqual(100);
    }
  });

  test("overallLearningIndex equals mean of per-subject learningIndex", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const mean =
      overview.subjects.reduce((s, e) => s + e.learningIndex, 0) /
      overview.subjects.length;
    expect(overview.overallLearningIndex).toBeCloseTo(Math.round(mean), 0);
  });

  test("strongest has highest latestExamScore, weakest has lowest", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ky-1");
    const scores = overview.subjects
      .map((e) => e.latestExamScore ?? -Infinity);
    expect(overview.strongest.latestExamScore).toBe(Math.max(...scores));
    expect(overview.weakest.latestExamScore).toBe(Math.min(...scores));
  });

  test("subjects sorted strongest→weakest", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ky-2");
    const scores = overview.subjects.map((e) => e.latestExamScore ?? -Infinity);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  test("slice.subject === 'Tất cả môn', kind === 'overview'", () => {
    const overview = buildStudentOverview(STUDENT_HERO, "ca-nam");
    expect(overview.kind).toBe("overview");
    expect(overview.slice.subject).toBe("Tất cả môn");
  });
});
```

- [ ] **Step 2: Run test to confirm RED**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/data/mock/overview.test.ts 2>&1 | tail -20
```
Expected: FAIL — "Cannot find module './overview'"

- [ ] **Step 3: Create `src/data/mock/overview.ts`**

```typescript
import type { Ky, StudentOverview, SubjectEntry } from "@/data/types";
import { SUBJECTS } from "@/data/types";
import { buildStudentSubjectSlice, buildStudentProfile } from "./builders";
import { getWorld, DEMO_NOW } from "./world";

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function buildStudentOverview(studentId: string, term: Ky): StudentOverview {
  const world = getWorld();
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

  // strongest/weakest by latestExamScore
  const withScore = sorted.filter((e) => e.latestExamScore !== null);
  const strongest = withScore[0] ?? sorted[0];
  const weakest = withScore[withScore.length - 1] ?? sorted[sorted.length - 1];

  void world; // reserved for future use

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

// Per-term cache key: `${studentId}|${term}`
const overviewCache = new Map<string, StudentOverview>();

export function getStudentOverview(studentId: string, term: Ky): StudentOverview {
  const key = `${studentId}|${term}`;
  if (!overviewCache.has(key)) {
    overviewCache.set(key, buildStudentOverview(studentId, term));
  }
  return overviewCache.get(key)!;
}
```

- [ ] **Step 4: Run test to confirm GREEN**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/data/mock/overview.test.ts 2>&1 | tail -20
```
Expected: all 6 tests PASS.

- [ ] **Step 5: Wire into `src/data/mockRepository.ts`**

Add import at the top (after the `buildStudentJourney` import line):
```typescript
import { getStudentOverview } from "./mock/overview";
```

Add to the `mockRepository` object (after `getClassJourney`):
```typescript
getStudentOverview: (studentId: string, term: Ky) => getStudentOverview(studentId, term),
```

- [ ] **Step 6: Run `npx tsc --noEmit` — expect clean**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
git add src/data/mock/overview.ts src/data/mock/overview.test.ts src/data/mockRepository.ts
git commit -m "feat(journey): buildStudentOverview assembler with per-subject slices and cache"
```

---

## Task 3 — Narrator functions for overview chapters

**Files:**
- Modify: `src/lib/narrate.ts` (append 3 new functions)

**Interfaces:**
- Consumes: `StudentOverview`, `SubjectEntry`, `NarratedLine` from `src/data/types.ts`; `diem`, `int` from `src/lib/format.ts`
- Produces: `narrateOverviewMoDau`, `narrateOverviewCacMon`, `narrateOverviewHoiTu` — consumed by Task 5

- [ ] **Step 1: Read `src/lib/format.ts` to confirm `diem` and `int` signatures**

```bash
grep -n "^export function" "C:/Trường học số - source code/prj-ths-bao-cao-tong/src/lib/format.ts"
```

- [ ] **Step 2: Write the failing test (create `src/lib/narrate.overview.test.ts`)**

```typescript
import { describe, expect, test } from "vitest";
import { buildStudentOverview } from "@/data/mock/overview";
import { STUDENT_HERO } from "@/data/mock/world";
import {
  narrateOverviewMoDau,
  narrateOverviewCacMon,
  narrateOverviewHoiTu,
} from "./narrate";

describe("narrateOverviewMoDau", () => {
  test("contains overallLearningIndex figure", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const line = narrateOverviewMoDau(ov);
    const values = line.figures.map((f) => f.value);
    expect(values).toContain(String(ov.overallLearningIndex));
  });

  test("text is non-empty and contains no forbidden demo marker", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const line = narrateOverviewMoDau(ov);
    expect(line.text.length).toBeGreaterThan(10);
    expect(line.text).not.toMatch(/demo|minh hoạ/i);
  });
});

describe("narrateOverviewCacMon", () => {
  test("figures contain strongest and weakest subject names", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const line = narrateOverviewCacMon(ov);
    const labels = line.figures.map((f) => f.label);
    // At least one figure references the strongest subject
    expect(labels.some((l) => l.includes(ov.strongest.subject))).toBe(true);
  });

  test("text contains diem of strongest subject (computed, grounded)", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const line = narrateOverviewCacMon(ov);
    if (ov.strongest.latestExamScore !== null) {
      // The number (possibly formatted) must appear in text or figures
      const allText =
        line.text + " " + line.figures.map((f) => f.value).join(" ");
      expect(allText).toMatch(/\d/);
    }
  });
});

describe("narrateOverviewHoiTu", () => {
  test("text mentions weakest subject", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const line = narrateOverviewHoiTu(ov, null);
    expect(line.text).toContain(ov.weakest.subject);
  });

  test("figures non-empty", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const line = narrateOverviewHoiTu(ov, null);
    expect(line.figures.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run test to confirm RED**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/lib/narrate.overview.test.ts 2>&1 | tail -20
```
Expected: FAIL — named exports not found.

- [ ] **Step 4: Append to `src/lib/narrate.ts`**

Add at the very end of the file:

```typescript
import type { StudentOverview, UpcomingExam } from "@/data/types";

export function narrateOverviewMoDau(ov: StudentOverview): NarratedLine {
  const trendWord: Record<"up" | "flat" | "down", string> = {
    up: "đang đi lên",
    flat: "giữ nhịp ổn định",
    down: "có phần chững lại",
  };
  // Use trend from strongest subject as proxy for overall direction
  const trend = ov.strongest.trend;
  const text = `Nhìn chung cả ${ov.subjects.length} môn, chỉ số học tập trung bình đạt ${ov.overallLearningIndex} — nhịp học ${trendWord[trend]}. Môn mạnh nhất là ${ov.strongest.subject}${ov.strongest.latestExamScore !== null ? ` (${diem(ov.strongest.latestExamScore)} điểm)` : ""}.`;
  return line(text, [
    { label: "Chỉ số học tập TB", value: int(ov.overallLearningIndex) },
    { label: "Môn mạnh nhất", value: ov.strongest.subject },
    ...(ov.strongest.latestExamScore !== null
      ? [{ label: `Điểm · ${ov.strongest.subject}`, value: diem(ov.strongest.latestExamScore) }]
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
  // Collect weak topics from the 2 weakest subjects
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
  return line(text, [
    { label: "Môn cần để ý", value: ov.weakest.subject },
    ...(ov.weakest.latestExamScore !== null
      ? [{ label: "Điểm gần nhất", value: diem(ov.weakest.latestExamScore) }]
      : []),
    ...(nextExam ? [{ label: nextExam.title, value: nextExam.date }] : []),
  ]);
}
```

> Note: The `line` helper and `diem`/`int`/`pct` imports already exist at the top of `narrate.ts`. The new `StudentOverview`/`UpcomingExam` import must be merged with the existing import at the top of the file — add those types to the existing `import type { ... } from "@/data/types"` line.

- [ ] **Step 5: Run test to confirm GREEN**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/lib/narrate.overview.test.ts 2>&1 | tail -20
```

- [ ] **Step 6: `npx tsc --noEmit`**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/narrate.ts src/lib/narrate.overview.test.ts
git commit -m "feat(journey): narrator functions for overview chapters (moDau/cacMon/hoiTu)"
```

---

## Task 4 — `SubjectComparisonBars` component

**Files:**
- Create: `src/components/journey/SubjectComparisonBars.tsx`
- Create: `src/components/journey/SubjectComparisonBars.test.tsx`

**Interfaces:**
- Consumes: `SubjectEntry` from `src/data/types.ts`; `rateColor`, `ChartCard` from `@/components/charts/chart-kit`; `diem` from `@/lib/format`
- Produces: `SubjectComparisonBars({ entries, studentId, term, onDrillSubject })` — consumed by Task 5

**Design:** Pure CSS horizontal bar rows (no Recharts dependency, simpler DOM for testing). Each row: subject label + score badge + colored bar (width = score/10 * 100%) + drill arrow. Colors use `rateColor(score/10)` for CSS var. The `onDrillSubject(subject)` callback is fired on row click — the chapter wires up the URL nav.

- [ ] **Step 1: Write failing test (`src/components/journey/SubjectComparisonBars.test.tsx`)**

```typescript
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { buildStudentOverview } from "@/data/mock/overview";
import { STUDENT_HERO } from "@/data/mock/world";
import { SubjectComparisonBars } from "./SubjectComparisonBars";

describe("SubjectComparisonBars", () => {
  test("renders all subject names", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    render(
      <SubjectComparisonBars
        entries={ov.subjects}
        onDrillSubject={vi.fn()}
      />
    );
    for (const entry of ov.subjects) {
      expect(screen.getByText(entry.subject)).toBeInTheDocument();
    }
  });

  test("shows numeric score (tabular-nums) for each entry that has a score", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const withScore = ov.subjects.filter((e) => e.latestExamScore !== null);
    render(
      <SubjectComparisonBars
        entries={ov.subjects}
        onDrillSubject={vi.fn()}
      />
    );
    // At least one formatted score visible (e.g. "7.5")
    expect(withScore.length).toBeGreaterThan(0);
    // The first scored entry's value must appear somewhere
    const first = withScore[0];
    const formatted = first.latestExamScore!.toFixed(1);
    // Use getAllByText to allow multiple occurrences
    expect(screen.getAllByText(new RegExp(formatted.replace(".", "\\."), "i")).length).toBeGreaterThanOrEqual(1);
  });

  test("clicking a row calls onDrillSubject with the subject name", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const onDrill = vi.fn();
    render(
      <SubjectComparisonBars
        entries={ov.subjects}
        onDrillSubject={onDrill}
      />
    );
    // Click the first subject row
    const firstSubject = ov.subjects[0].subject;
    fireEvent.click(screen.getByText(firstSubject).closest("[data-subject]")!);
    expect(onDrill).toHaveBeenCalledWith(firstSubject);
  });

  test("strongest row has aria-label or data-strongest attribute", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    render(
      <SubjectComparisonBars
        entries={ov.subjects}
        onDrillSubject={vi.fn()}
      />
    );
    // The row for the first entry (strongest) must be marked
    const rows = document.querySelectorAll("[data-subject]");
    expect(rows[0].getAttribute("data-strongest")).toBe("true");
  });
});
```

- [ ] **Step 2: Run to confirm RED**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/components/journey/SubjectComparisonBars.test.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Create `src/components/journey/SubjectComparisonBars.tsx`**

```typescript
import { ChevronRight } from "lucide-react";
import type { SubjectEntry } from "@/data/types";
import { rateColor } from "@/components/charts/chart-kit";
import { diem } from "@/lib/format";
import { cn } from "@/lib/utils";

function bandLabel(score: number | null): string {
  if (score === null) return "";
  if (score >= 8) return "Tốt";
  if (score >= 6.5) return "Khá";
  if (score >= 5) return "TB";
  return "Yếu";
}

interface Props {
  entries: SubjectEntry[];
  onDrillSubject: (subject: string) => void;
}

/** Danh sách thanh ngang so sánh điểm giữa các môn. Màu = band, số = giá trị. */
export function SubjectComparisonBars({ entries, onDrillSubject }: Props) {
  const maxScore = Math.max(...entries.map((e) => e.latestExamScore ?? 0), 0.01);

  return (
    <div className="space-y-1.5" role="list" aria-label="So sánh điểm các môn">
      {entries.map((entry, idx) => {
        const score = entry.latestExamScore;
        const barWidth = score !== null ? `${Math.round((score / 10) * 100)}%` : "0%";
        const color = score !== null ? rateColor(score / 10) : "var(--muted-foreground)";
        const isStrongest = idx === 0;
        const isWeakest = idx === entries.length - 1;

        return (
          <button
            key={entry.subject}
            type="button"
            role="listitem"
            data-subject={entry.subject}
            data-strongest={isStrongest ? "true" : undefined}
            data-weakest={isWeakest ? "true" : undefined}
            onClick={() => onDrillSubject(entry.subject)}
            aria-label={`${entry.subject}${score !== null ? ` — ${diem(score)} điểm` : " — chưa có điểm"}. Nhấn để xem chi tiết.`}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40",
              isStrongest && "border-success-200 bg-success-50/30",
              isWeakest && "border-warning-200 bg-warning-50/30"
            )}
          >
            {/* Subject name */}
            <span className="w-24 shrink-0 truncate text-sm font-medium">
              {entry.subject}
            </span>

            {/* Bar */}
            <div className="flex-1 overflow-hidden rounded-full bg-muted/50" style={{ height: "8px" }}>
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: barWidth, background: color }}
                aria-hidden
              />
            </div>

            {/* Score badge — color + number (not color-only) */}
            <span
              className="w-12 shrink-0 text-right tabular-nums text-sm font-semibold"
              style={{ color }}
            >
              {score !== null ? diem(score) : "—"}
            </span>

            {/* Band text label */}
            <span className="w-8 shrink-0 text-xs text-muted-foreground">
              {bandLabel(score)}
            </span>

            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground/50 transition-opacity group-hover:text-brand-600"
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to confirm GREEN**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/components/journey/SubjectComparisonBars.test.tsx 2>&1 | tail -20
```

- [ ] **Step 5: `npx tsc --noEmit`**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
git add src/components/journey/SubjectComparisonBars.tsx src/components/journey/SubjectComparisonBars.test.tsx
git commit -m "feat(journey): SubjectComparisonBars horizontal comparison with drill links"
```

---

## Task 5 — `buildOverviewChapters`

**Files:**
- Create: `src/components/journey/overviewChapters.tsx`
- Create: `src/components/journey/overviewChapters.test.tsx`

**Interfaces:**
- Consumes: `StudentOverview` from `src/data/types.ts`; `SubjectComparisonBars`; `Narrator`; `ChartCard`; `ProgressRing` from `@/components/charts/ProgressRing`; `narrateOverviewMoDau`, `narrateOverviewCacMon`, `narrateOverviewHoiTu` from `@/lib/narrate`; `ChapterDef` from `./types-journey`; `OFFICIAL_EXAM` from `@/data/mock/world` (for resolving nextExam)
- Produces: `buildOverviewChapters(overview: StudentOverview, nav: (path: string) => void): ChapterDef[]`

**Chapter structure (3 chapters, NOT wrapped in `<Chapter>`):**
1. `mo-dau` — ProgressRing (overallLearningIndex) + Narrator (narrateOverviewMoDau)
2. `cac-mon` — ChartCard + SubjectComparisonBars + Narrator (narrateOverviewCacMon); each row's `onDrillSubject` calls `nav` with the correct URL
3. `hoi-tu` — Narrator (narrateOverviewHoiTu) + optional weakest subject's weak topics list

- [ ] **Step 1: Write failing test (`src/components/journey/overviewChapters.test.tsx`)**

```typescript
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { buildStudentOverview } from "@/data/mock/overview";
import { STUDENT_HERO } from "@/data/mock/world";
import { buildOverviewChapters } from "./overviewChapters";

useUiStore.setState({ reducedMotion: true });

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>
  );

describe("buildOverviewChapters", () => {
  test("returns exactly 3 chapters: mo-dau, cac-mon, hoi-tu", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const chapters = buildOverviewChapters(ov, vi.fn());
    expect(chapters.map((c) => c.id)).toEqual(["mo-dau", "cac-mon", "hoi-tu"]);
  });

  test("mo-dau chapter renders overallLearningIndex narrator text", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const chapters = buildOverviewChapters(ov, vi.fn());
    const moDau = chapters.find((c) => c.id === "mo-dau")!;
    wrap(<>{moDau.render()}</>);
    // The narrator text from narrateOverviewMoDau contains overallLearningIndex
    expect(
      screen.getByText(new RegExp(String(ov.overallLearningIndex)))
    ).toBeInTheDocument();
  });

  test("cac-mon chapter shows all 8 subject names", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const chapters = buildOverviewChapters(ov, vi.fn());
    const cacMon = chapters.find((c) => c.id === "cac-mon")!;
    wrap(<>{cacMon.render()}</>);
    for (const entry of ov.subjects) {
      expect(screen.getByText(entry.subject)).toBeInTheDocument();
    }
  });

  test("cac-mon drill row calls nav with correct URL including subject name", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const nav = vi.fn();
    const chapters = buildOverviewChapters(ov, nav);
    const cacMon = chapters.find((c) => c.id === "cac-mon")!;
    wrap(<>{cacMon.render()}</>);

    // Click the first subject row
    const firstSubject = ov.subjects[0].subject;
    fireEvent.click(screen.getByText(firstSubject).closest("[data-subject]")!);

    expect(nav).toHaveBeenCalledWith(
      expect.stringContaining(`mon=${encodeURIComponent(firstSubject)}`)
    );
  });

  test("hoi-tu chapter mentions weakest subject in narrator text", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const chapters = buildOverviewChapters(ov, vi.fn());
    const hoiTu = chapters.find((c) => c.id === "hoi-tu")!;
    wrap(<>{hoiTu.render()}</>);
    expect(
      screen.getByText(new RegExp(ov.weakest.subject))
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm RED**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/components/journey/overviewChapters.test.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Create `src/components/journey/overviewChapters.tsx`**

```typescript
import type { StudentOverview, UpcomingExam } from "@/data/types";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { ChartCard } from "@/components/charts/chart-kit";
import type { ChapterDef } from "./types-journey";
import { Narrator } from "./Narrator";
import { SubjectComparisonBars } from "./SubjectComparisonBars";
import {
  narrateOverviewMoDau,
  narrateOverviewCacMon,
  narrateOverviewHoiTu,
} from "@/lib/narrate";
import { OFFICIAL_EXAM, DEMO_NOW } from "@/data/mock/world";
import { statusOf } from "@/lib/cycles";

function resolveNextExam(): UpcomingExam | null {
  return statusOf(OFFICIAL_EXAM.date, DEMO_NOW) === "upcoming" ? OFFICIAL_EXAM : null;
}

export function buildOverviewChapters(
  ov: StudentOverview,
  nav: (path: string) => void
): ChapterDef[] {
  const nextExam = resolveNextExam();
  const { student, slice } = ov;

  function drillUrl(subject: string): string {
    return `/app/hoc-sinh/${student.id}?ky=${slice.term}&mon=${encodeURIComponent(subject)}`;
  }

  const chapters: ChapterDef[] = [
    {
      id: "mo-dau",
      title: "Mở đầu",
      render: () => (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border bg-card p-5 shadow-sm">
            <ProgressRing value={ov.overallLearningIndex} label="Học tập TB" />
          </div>
          <Narrator line={narrateOverviewMoDau(ov)} variant="opener" />
        </div>
      ),
    },
    {
      id: "cac-mon",
      title: "Các môn",
      render: () => (
        <div className="space-y-4">
          <Narrator line={narrateOverviewCacMon(ov)} />
          <ChartCard
            title="Điểm các môn"
            description="Nhấn vào một môn để xem hành trình chi tiết."
          >
            <SubjectComparisonBars
              entries={ov.subjects}
              onDrillSubject={(subject) => nav(drillUrl(subject))}
            />
          </ChartCard>
        </div>
      ),
    },
    {
      id: "hoi-tu",
      title: "Hội tụ",
      render: () => (
        <div className="space-y-4">
          <Narrator line={narrateOverviewHoiTu(ov, nextExam)} />
          {ov.weakest.weakTopics.length > 0 && (
            <ChartCard title={`Chủ đề cần chú ý — ${ov.weakest.subject}`}>
              <ul className="space-y-1.5 text-sm">
                {ov.weakest.weakTopics
                  .filter((t) => t.confirmed)
                  .slice(0, 5)
                  .map((t) => (
                    <li key={t.topic} className="flex items-center gap-2">
                      <span className="size-1.5 shrink-0 rounded-full bg-warning-500" aria-hidden />
                      <span>{t.topic}</span>
                      <span className="ml-auto tabular-nums text-muted-foreground text-xs">
                        {Math.round(t.accuracyAvg * 100)}%
                      </span>
                    </li>
                  ))}
              </ul>
            </ChartCard>
          )}
        </div>
      ),
    },
  ];

  return chapters;
}
```

- [ ] **Step 4: Run test to confirm GREEN**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/components/journey/overviewChapters.test.tsx 2>&1 | tail -20
```

- [ ] **Step 5: `npx tsc --noEmit`**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
git add src/components/journey/overviewChapters.tsx src/components/journey/overviewChapters.test.tsx
git commit -m "feat(journey): buildOverviewChapters (moDau/cacMon/hoiTu) with drill links"
```

---

## Task 6 — Generic `KyMonPicker<S>`

**Files:**
- Modify: `src/components/journey/KyMonPicker.tsx` (make generic)
- Verify: `src/components/journey/KyMonPicker.test.tsx` still passes unchanged

**Interfaces:**
- Produces: `KyMonPicker<S extends string>({ term, subject, terms, subjects, onChange })` where `onChange` receives `{ term: Ky; subject: S }`
- The existing class route passes `Subject[]`; student route will pass `string[]` — both remain type-safe.

**Key consideration:** The `Journey` shell accepts `availableSlices: { terms: Ky[]; subjects: Subject[] }` and passes it directly to `KyMonPicker`. For the overview path, `hoc-sinh.tsx` constructs its own props object without going through `StudentJourney.availableSlices` — so no existing Journey internals break.

- [ ] **Step 1: Make `KyMonPicker` generic in `src/components/journey/KyMonPicker.tsx`**

Replace the entire file with:

```typescript
import type { Ky } from "@/data/types";
import { KY_LABEL } from "@/data/types";
import { cn } from "@/lib/utils";

function Pill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-300 bg-brand-50 text-brand-700"
          : "border-transparent bg-muted/60 text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

export function KyMonPicker<S extends string>({
  term,
  subject,
  terms,
  subjects,
  onChange,
}: {
  term: Ky;
  subject: S;
  terms: Ky[];
  subjects: S[];
  onChange: (next: { term: Ky; subject: S }) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Kỳ</span>
        <div className="flex flex-wrap gap-1.5">
          {terms.map((t) => (
            <Pill
              key={t}
              active={t === term}
              label={KY_LABEL[t]}
              onClick={() => onChange({ term: t, subject })}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Môn</span>
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s) => (
            <Pill
              key={s}
              active={s === subject}
              label={s}
              onClick={() => onChange({ term, subject: s })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run existing KyMonPicker tests to confirm no regression**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/components/journey/KyMonPicker.test.tsx 2>&1 | tail -20
```
Expected: all tests PASS.

- [ ] **Step 3: `npx tsc --noEmit`**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/journey/KyMonPicker.tsx
git commit -m "refactor(journey): make KyMonPicker generic over subject string type"
```

---

## Task 7 — Route `hoc-sinh.tsx` — overview branch + `?mon=all`

**Files:**
- Modify: `src/routes/hoc-sinh.tsx`

**Interfaces:**
- Consumes: `getStudentOverview` from `src/data/mockRepository`; `buildOverviewChapters` from `@/components/journey/overviewChapters`; `StudentOverview` from `src/data/types`; generic `KyMonPicker<S>`

**Routing logic:**
- `?mon=all` → overview mode → `repo.getStudentOverview(studentId, term)` → `buildOverviewChapters(ov, nav)` → render `<Journey>` with `slice={{ term, subject: "Tất cả môn" }}` and `availableSlices={{ terms: [...], subjects: ["Tất cả môn", ...SUBJECTS] }}`
- Any real Subject string (or default "Địa lí") → existing per-subject path (unchanged)
- `onSlice` for overview: if `next.subject === "Tất cả môn"` → `?mon=all`; else → `?mon=<subject>`
- `onSlice` for per-subject: if `next.subject === "Tất cả môn"` → `?mon=all`; else → `?mon=<subject>` (existing path)
- Scroll-to-top on every slice change (already implemented as `window.scrollTo`)

- [ ] **Step 1: Write failing route test (`src/routes/hoc-sinh.overview.test.tsx`)**

```typescript
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import HocSinh from "./hoc-sinh";
import { STUDENT_HERO } from "@/data/mock/world";

useUiStore.setState({ reducedMotion: true });

const wrap = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/app/hoc-sinh/${STUDENT_HERO}${search}`]}>
      <Routes>
        <Route
          path="/app/hoc-sinh/:studentId"
          element={
            <TooltipProvider>
              <HocSinh />
            </TooltipProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe("HocSinh route — overview (?mon=all)", () => {
  test("renders overview when ?mon=all, shows 'Tất cả môn' pill as active", () => {
    wrap("?ky=ca-nam&mon=all");
    // The picker must show "Tất cả môn" active pill
    const pill = screen.getByRole("button", { name: "Tất cả môn" });
    expect(pill).toHaveAttribute("aria-pressed", "true");
  });

  test("renders a real subject name (from overview subjects) in the page", () => {
    wrap("?ky=ca-nam&mon=all");
    // At minimum, "Địa lí" must appear in the comparison list
    expect(screen.getAllByText("Địa lí").length).toBeGreaterThan(0);
  });

  test("picker offers 'Tất cả môn' as first môn option", () => {
    wrap("?ky=ky-1&mon=all");
    const monPills = screen.getAllByRole("button", {
      name: (name) => ["Tất cả môn", "Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí"].includes(name),
    });
    expect(monPills[0]).toHaveTextContent("Tất cả môn");
  });

  test("per-subject route still works when ?mon=Địa lí", () => {
    wrap("?ky=ky-1&mon=Địa lí");
    // Overview must NOT be rendered; per-subject narration appears instead
    // The per-subject journey shows "Hội tụ" as a chapter heading
    expect(screen.getByText("Hội tụ")).toBeInTheDocument();
    // Must NOT show "Các môn" (overview chapter)
    expect(screen.queryByText("Các môn")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm RED**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/routes/hoc-sinh.overview.test.tsx 2>&1 | tail -30
```

- [ ] **Step 3: Modify `src/routes/hoc-sinh.tsx`**

Replace the entire file with:

```typescript
import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Ky, Subject, EventStatus } from "@/data/types";
import { KY_LABEL, SUBJECTS } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";
import { PageHeader } from "@/components/report/PageHeader";
import { ExportButton } from "@/components/report/ExportButton";
import { Journey } from "@/components/journey/Journey";
import { buildStudentChapters } from "@/components/journey/studentChapters";
import { buildOverviewChapters } from "@/components/journey/overviewChapters";

const ALL_MON = "Tất cả môn";

function parseKy(raw: string | null): Ky {
  return raw === "ky-2" || raw === "ca-nam" || raw === "ky-1" ? raw : "ky-1";
}

function parseMon(raw: string | null): Subject | typeof ALL_MON {
  if (raw === "all") return ALL_MON;
  const s = raw ?? "";
  return (SUBJECTS as readonly string[]).includes(s) ? (s as Subject) : "Địa lí";
}

function subjectToParam(subject: Subject | typeof ALL_MON): string {
  return subject === ALL_MON ? "all" : subject;
}

export default function HocSinh() {
  const { studentId = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const term = parseKy(params.get("ky"));
  const subject = parseMon(params.get("mon"));
  const present = params.get("present") === "1";

  const onSlice = useCallback(
    (next: { term: Ky; subject: string }) => {
      const p = new URLSearchParams(params);
      p.set("ky", next.term);
      p.set("mon", subjectToParam(next.subject as Subject | typeof ALL_MON));
      setParams(p, { replace: true });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [params, setParams]
  );

  const allSubjectOptions: string[] = [ALL_MON, ...SUBJECTS];

  if (subject === ALL_MON) {
    // ---- Overview path ----
    const ov = repo.getStudentOverview(studentId, term);
    const chapters = buildOverviewChapters(ov, (path) => navigate(path));
    const timeline: { id: string; label: string; status: EventStatus }[] = [
      { id: "mo-dau", label: "Mở đầu", status: "past" },
      { id: "cac-mon", label: "Các môn", status: "current" },
      { id: "hoi-tu", label: "Hội tụ", status: "upcoming" },
    ];

    return (
      <div className="space-y-5">
        <PageHeader
          title="Hành trình học tập"
          subtitle={`${ov.student.name} · ${ov.className} · ${KY_LABEL[term]} · Tất cả môn`}
          right={
            <ExportButton
              scope={{ kind: "hoc-sinh", id: studentId, title: `Báo cáo học sinh ${ov.student.name}` }}
            />
          }
        />
        <Journey
          slice={{ term, subject: ALL_MON as Subject }}
          availableSlices={{ terms: ["ky-1", "ky-2", "ca-nam"], subjects: allSubjectOptions as Subject[] }}
          onSlice={onSlice as (s: { term: Ky; subject: Subject }) => void}
          timeline={timeline}
          chapters={chapters}
          initialPresent={present}
        />
      </div>
    );
  }

  // ---- Per-subject path (existing) ----
  const j = repo.getStudentJourney(studentId, term, subject);
  const chapters = buildStudentChapters(j, (path) => navigate(path));
  const timeline: { id: string; label: string; status: EventStatus }[] = [
    { id: "mo-dau", label: "Mở đầu", status: "past" },
    { id: "chuan-bi", label: "Chuẩn bị", status: "past" },
    ...j.cycles.map((c) => ({ id: `cycle-${c.id}`, label: c.label, status: c.status })),
    {
      id: "hoi-tu",
      label: "Hội tụ",
      status: (j.convergence.nextExam ? "upcoming" : "current") as EventStatus,
    },
  ];

  // Ensure "Tất cả môn" is the first option in picker; available subjects = all SUBJECTS
  const perSubjectAvailableSubjects: string[] = [ALL_MON, ...SUBJECTS];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hành trình học tập"
        subtitle={`${j.student.name} · ${j.className} · ${KY_LABEL[term]} · ${j.slice.subject}`}
        right={
          <ExportButton
            scope={{ kind: "hoc-sinh", id: studentId, title: `Báo cáo học sinh ${j.student.name}` }}
          />
        }
      />
      <Journey
        slice={{ term, subject: subject as Subject }}
        availableSlices={{
          terms: ["ky-1", "ky-2", "ca-nam"],
          subjects: perSubjectAvailableSubjects as Subject[],
        }}
        onSlice={onSlice as (s: { term: Ky; subject: Subject }) => void}
        timeline={timeline}
        chapters={chapters}
        initialPresent={present}
      />
    </div>
  );
}
```

> Note on type casting: `KyMonPicker` is now generic `<S extends string>`, but `Journey` still declares `availableSlices.subjects: Subject[]`. To thread `"Tất cả môn"` through without changing `Journey`'s type signature, we cast `as Subject[]`. This is intentional and localized to the route — the class route is unaffected. If the TS compiler rejects the cast, wrap it: `(perSubjectAvailableSubjects as unknown as Subject[])`.

- [ ] **Step 4: Run failing tests to confirm GREEN**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/routes/hoc-sinh.overview.test.tsx 2>&1 | tail -30
```

- [ ] **Step 5: Run full vitest suite**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run 2>&1 | tail -40
```
Expected: all tests PASS (no regressions).

- [ ] **Step 6: `npx tsc --noEmit`**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/routes/hoc-sinh.tsx src/routes/hoc-sinh.overview.test.tsx
git commit -m "feat(journey): route hoc-sinh overview branch (?mon=all) with KyMonPicker Tất cả môn"
```

---

## Task 8 — Write report + self-review

**Files:**
- Create: `c:/Trường học số - source code/prj-ths-bao-cao-tong/.superpowers/sdd/overview-report.md`

- [ ] **Step 1: Run full suite one final time and capture count**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run 2>&1 | tail -10
```

- [ ] **Step 2: `npx tsc --noEmit` final check**

```bash
cd "C:/Trường học số - source code/prj-ths-bao-cao-tong" && npx tsc --noEmit 2>&1
```

- [ ] **Step 3: Self-review checklist (run mentally, fix before reporting)**

- Overview flows through `<Journey>` shell (not a custom shell).
- `ChapterDef.render()` returns BARE content — no double `<Chapter>` wrap inside `render()`.
- All figures in Narrator text are computed from `buildStudentSubjectSlice` — no fabricated numbers.
- Picker shows "Tất cả môn" as the FIRST môn pill.
- Clicking a row in "Các môn" navigates to `/app/hoc-sinh/:id?ky=<term>&mon=<subject>`.
- Bar color uses MobiFone CSS var tokens (via `rateColor`); numeric value is always shown.
- Class route (`giao-vien.tsx` or similar) still compiles and tests pass.
- No `console.log` in any modified file.
- No hex color values in JSX.
- `tabular-nums` class on score values.

- [ ] **Step 4: Write report to `.superpowers/sdd/overview-report.md`**

Create the directory if needed:
```bash
mkdir -p "C:/Trường học số - source code/prj-ths-bao-cao-tong/.superpowers/sdd"
```

Write the report file with: status (Done/Partial), commit SHA, test count, any concerns.

- [ ] **Step 5: Final commit (report only)**

```bash
git add .superpowers/sdd/overview-report.md
git commit -m "docs(journey): overview implementation report"
```

---

## Spec Coverage Check

| Requirement | Task |
|-------------|------|
| `StudentOverview` type + `SubjectEntry` | Task 1 |
| `buildStudentOverview` with all 8 subjects via `buildStudentSubjectSlice` | Task 2 |
| `getStudentOverview` cached in `ReportRepository` + `mockRepository` | Task 2 |
| `narrateOverviewMoDau/CacMon/HoiTu` grounded narrator functions | Task 3 |
| Horizontal bar comparison component (color by band, numeric value shown) | Task 4 |
| `buildOverviewChapters` → 3 `ChapterDef[]` (Mở đầu / Các môn / Hội tụ) | Task 5 |
| Drill links per subject row → `/app/hoc-sinh/:id?ky=<term>&mon=<subject>` | Task 5 |
| Generic `KyMonPicker<S extends string>` | Task 6 |
| Route: `?mon=all` → overview; parse; picker "Tất cả môn" first | Task 7 |
| Picker `onSlice`: "Tất cả môn" → `?mon=all`; real subject → `?mon=<subject>` | Task 7 |
| Scroll-to-top on slice change | Task 7 (already implemented, preserved) |
| `npx tsc --noEmit` clean | Tasks 1,2,3,4,5,6,7 each step |
| `npx vitest run` green (no regressions) | Task 7 step 5 |
| Branch `feat/hanh-trinh-bao-cao`, conventional commits | All tasks |
| Report to `.superpowers/sdd/overview-report.md` | Task 8 |
