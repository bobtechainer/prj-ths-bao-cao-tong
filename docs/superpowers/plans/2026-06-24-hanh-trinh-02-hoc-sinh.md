# Vỏ Hành Trình Dùng Chung + Bản Học Sinh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Mỗi Task chạy theo vòng TDD nghiêm ngặt (viết test fail → chạy thấy fail → code tối thiểu → chạy pass → Checkpoint cổng). Mọi bước đánh dấu bằng checkbox (- [ ]) syntax. Không bỏ qua bước nào, không placeholder.

**Goal:** Dựng TOÀN BỘ vỏ hành trình kể chuyện kind-agnostic (Journey, Chapter, Narrator, CycleBand, KyMonPicker, FocusPicker, TimelineRail, PresentationMode) và bản Học sinh hoàn chỉnh (buildStudentChapters + route `/app/hoc-sinh/:studentId`). Vỏ phải dùng được nguyên vẹn cho cả bản Lớp (Plan 03) mà không cần sửa.

**Architecture:** Vỏ nhận `chapters: ChapterDef[]` đã dựng sẵn (KHÔNG nhận journey thô) → Journey tự render KyMonPicker sticky + TimelineRail dọc + container scroll-snap + nút Trình chiếu mở PresentationMode bằng chính chapters. Route đọc query `?ky=&mon=&present=`, gọi `repo.getStudentJourney`, dựng chapters bằng `buildStudentChapters(j, nav)`, truyền vào `<Journey>`. Mỗi StudentCycle render qua `<CycleBand>` generic.

**Tech Stack:** Vite7 + React19 + TS + Tailwind4 + shadcn/Radix + Recharts3 + framer-motion12 + React Router 7 + Zustand + Vitest.

## Global Constraints

- Chỉ token MobiFone qua biến CSS / lớp Tailwind (brand/warning/success/error/blue-light/indigo). KHÔNG hex thô.
- Font Be Vietnam Pro. Câu chữ theo skill "humanized" (giọng giáo viên, không sáo rỗng, không "AI phân tích cho thấy"). KHÔNG dùng chữ "demo/minh hoạ".
- Dẫn chứng số liệu: chỉ bịa SỐ THÔ (đếm buổi/lượt/điểm). Mọi tỉ lệ/chỉ số hiển thị phải truy input→output. MỖI câu Trợ lý (NarratedLine) phải mang figures hiển thị ngay cạnh.
- Mọi chuyển động tôn trọng prefers-reduced-motion (đã có hook useReduced() + reducedMotion trong uiStore).
- Cổng phải xanh: `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

**Phụ thuộc:** Plan 01 đã tạo `src/data/types.ts` (Ky, KY_LABEL, EventStatus, PrepSurface, NarratedLine, StudentCycle, StudentJourney, ClassJourney, ChapterDef-liên quan), `src/data/mock/world.ts` (DEMO_NOW, OFFICIAL_EXAM), `src/lib/cycles.ts` (statusOf, partitionByCycle), `src/lib/narrate.ts` (các hàm narrate*), và `repo.getStudentJourney(studentId, term, subject)` + `repo.getClassJourney(...)`.

**SỞ HỮU FILE (Plan 02):** TẠO toàn bộ vỏ dùng chung (Journey, Chapter, Narrator, CycleBand, KyMonPicker, FocusPicker, TimelineRail, PresentationMode) + studentChapters.tsx + route học sinh. Plan 03 CHỈ import dùng đúng chữ ký, KHÔNG ghi đè vỏ.

---

### Task 1: Narrator — hiện text + figures cạnh nhau

**Files**
- Create: `src/components/journey/Narrator.tsx`
- Test: `src/components/journey/Narrator.test.tsx`

**Interfaces**
- Consumes: `NarratedLine` từ `@/data/types`.
- Produces: `export function Narrator({ line, variant }: { line: NarratedLine; variant?: "opener" | "line" }): JSX.Element`.

**Steps**

- [ ] Viết test fail `src/components/journey/Narrator.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Narrator } from "./Narrator";

describe("Narrator", () => {
  test("hiện text và từng figure label/value cạnh nhau", () => {
    render(
      <Narrator
        line={{
          text: "Em giữ nhịp ổn định qua các chặng.",
          figures: [
            { label: "Hạng", value: "5/42" },
            { label: "Chuyên cần", value: "96%" },
          ],
        }}
      />
    );
    expect(screen.getByText("Em giữ nhịp ổn định qua các chặng.")).toBeInTheDocument();
    expect(screen.getByText("Hạng")).toBeInTheDocument();
    expect(screen.getByText("5/42")).toBeInTheDocument();
    expect(screen.getByText("Chuyên cần")).toBeInTheDocument();
    expect(screen.getByText("96%")).toBeInTheDocument();
  });

  test("variant opener dùng cỡ chữ lớn hơn", () => {
    const { container } = render(
      <Narrator line={{ text: "Mở đầu hành trình.", figures: [] }} variant="opener" />
    );
    expect(container.querySelector("[data-variant='opener']")).not.toBeNull();
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/Narrator.test.tsx` → expected: `Cannot find module './Narrator'`.

- [ ] Code tối thiểu `src/components/journey/Narrator.tsx`:

```tsx
import { Sparkles } from "lucide-react";
import type { NarratedLine } from "@/data/types";
import { cn } from "@/lib/utils";

/** Một câu Trợ lý offline: text + các figure (label/value) hiển thị ngay cạnh. */
export function Narrator({
  line,
  variant = "line",
}: {
  line: NarratedLine;
  variant?: "opener" | "line";
}) {
  const opener = variant === "opener";
  return (
    <div
      data-variant={variant}
      className={cn(
        "rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:bg-brand-900/10",
        opener && "p-5"
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-primary-foreground">
          <Sparkles className="size-3.5" />
        </span>
        <div className="min-w-0 space-y-2.5">
          <p
            className={cn(
              "leading-relaxed text-foreground/90",
              opener ? "text-base font-medium" : "text-sm"
            )}
          >
            {line.text}
          </p>
          {line.figures.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {line.figures.map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-baseline gap-1.5 rounded-lg border bg-card px-2.5 py-1 text-xs shadow-sm"
                >
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">{f.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] Chạy pass: `npx vitest run src/components/journey/Narrator.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 2: KyMonPicker — lọc Kỳ × Môn (chữ ký chốt cứng)

**Files**
- Create: `src/components/journey/KyMonPicker.tsx`
- Test: `src/components/journey/KyMonPicker.test.tsx`

**Interfaces**
- Consumes: `Ky`, `KY_LABEL`, `Subject` từ `@/data/types`.
- Produces: `export function KyMonPicker({ term, subject, terms, subjects, onChange }: { term: Ky; subject: Subject; terms: Ky[]; subjects: Subject[]; onChange: (next: { term: Ky; subject: Subject }) => void }): JSX.Element`.

**Steps**

- [ ] Viết test fail `src/components/journey/KyMonPicker.test.tsx`:

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KyMonPicker } from "./KyMonPicker";

describe("KyMonPicker", () => {
  test("đổi kỳ giữ nguyên môn", () => {
    const onChange = vi.fn();
    render(
      <KyMonPicker
        term="ky-1"
        subject="Địa lí"
        terms={["ky-1", "ky-2", "ca-nam"]}
        subjects={["Địa lí", "Lịch sử"]}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Cả năm" }));
    expect(onChange).toHaveBeenCalledWith({ term: "ca-nam", subject: "Địa lí" });
  });

  test("đổi môn giữ nguyên kỳ", () => {
    const onChange = vi.fn();
    render(
      <KyMonPicker
        term="ky-1"
        subject="Địa lí"
        terms={["ky-1", "ky-2"]}
        subjects={["Địa lí", "Lịch sử"]}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Lịch sử" }));
    expect(onChange).toHaveBeenCalledWith({ term: "ky-1", subject: "Lịch sử" });
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/KyMonPicker.test.tsx` → expected: `Cannot find module './KyMonPicker'`.

- [ ] Code tối thiểu `src/components/journey/KyMonPicker.tsx`:

```tsx
import type { Ky, Subject } from "@/data/types";
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

export function KyMonPicker({
  term,
  subject,
  terms,
  subjects,
  onChange,
}: {
  term: Ky;
  subject: Subject;
  terms: Ky[];
  subjects: Subject[];
  onChange: (next: { term: Ky; subject: Subject }) => void;
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

- [ ] Chạy pass: `npx vitest run src/components/journey/KyMonPicker.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 3: TimelineRail — trục thời gian dọc

**Files**
- Create: `src/components/journey/TimelineRail.tsx`
- Test: `src/components/journey/TimelineRail.test.tsx`

**Interfaces**
- Consumes: `EventStatus` từ `@/data/types`.
- Produces: `export function TimelineRail({ items, activeId }: { items: { id: string; label: string; status: EventStatus }[]; activeId?: string }): JSX.Element`.

**Steps**

- [ ] Viết test fail `src/components/journey/TimelineRail.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineRail } from "./TimelineRail";

describe("TimelineRail", () => {
  test("hiện nhãn từng mốc và đánh dấu mốc đang xem", () => {
    render(
      <TimelineRail
        items={[
          { id: "mo-dau", label: "Mở đầu", status: "past" },
          { id: "chang-1", label: "Chặng 1", status: "current" },
          { id: "hoi-tu", label: "Hội tụ", status: "upcoming" },
        ]}
        activeId="chang-1"
      />
    );
    expect(screen.getByText("Mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Chặng 1")).toBeInTheDocument();
    expect(screen.getByText("Hội tụ")).toBeInTheDocument();
    const active = screen.getByText("Chặng 1").closest("[data-active]");
    expect(active?.getAttribute("data-active")).toBe("true");
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/TimelineRail.test.tsx` → expected: `Cannot find module './TimelineRail'`.

- [ ] Code tối thiểu `src/components/journey/TimelineRail.tsx`:

```tsx
import type { EventStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const DOT: Record<EventStatus, string> = {
  past: "bg-muted-foreground/40",
  current: "bg-brand-600 ring-4 ring-brand-100",
  upcoming: "border-2 border-dashed border-muted-foreground/40 bg-card",
};

/** Trục thời gian dọc: mỗi mốc một chấm + nhãn; bấm cuộn tới chương tương ứng. */
export function TimelineRail({
  items,
  activeId,
}: {
  items: { id: string; label: string; status: EventStatus }[];
  activeId?: string;
}) {
  return (
    <nav aria-label="Trục thời gian" className="relative pl-4">
      <span aria-hidden className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
      <ul className="space-y-4">
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <li key={it.id} data-active={active} className="relative">
              <a
                href={`#${it.id}`}
                className="flex items-center gap-2.5 text-sm transition-colors hover:text-brand-700"
              >
                <span
                  className={cn(
                    "relative z-10 size-3.5 shrink-0 rounded-full",
                    DOT[it.status]
                  )}
                />
                <span
                  className={cn(
                    "truncate",
                    active ? "font-semibold text-brand-700" : "text-muted-foreground"
                  )}
                >
                  {it.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] Chạy pass: `npx vitest run src/components/journey/TimelineRail.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 4: FocusPicker — bộ chọn-một-trong-nhiều generic

**Files**
- Create: `src/components/journey/FocusPicker.tsx`
- Test: `src/components/journey/FocusPicker.test.tsx`

**Interfaces**
- Produces: `export function FocusPicker({ items, selectedId, onSelect }: { items: { id: string; label: string }[]; selectedId: string; onSelect: (id: string) => void }): JSX.Element`.

**Steps**

- [ ] Viết test fail `src/components/journey/FocusPicker.test.tsx`:

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FocusPicker } from "./FocusPicker";

describe("FocusPicker", () => {
  test("chọn một mục gọi onSelect với id", () => {
    const onSelect = vi.fn();
    render(
      <FocusPicker
        items={[
          { id: "a", label: "Lớp 12 Văn" },
          { id: "b", label: "Lớp 12 Sử" },
        ]}
        selectedId="a"
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Lớp 12 Sử" }));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  test("đánh dấu mục đang chọn", () => {
    render(
      <FocusPicker
        items={[{ id: "a", label: "Lớp 12 Văn" }]}
        selectedId="a"
        onSelect={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "Lớp 12 Văn" }).getAttribute("aria-pressed")).toBe("true");
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/FocusPicker.test.tsx` → expected: `Cannot find module './FocusPicker'`.

- [ ] Code tối thiểu `src/components/journey/FocusPicker.tsx`:

```tsx
import { cn } from "@/lib/utils";

/** Bộ chọn-một-trong-nhiều generic: dùng để chọn lớp ở bản giáo viên (Plan 03) hoặc bất kỳ danh sách focus nào. */
export function FocusPicker({
  items,
  selectedId,
  onSelect,
}: {
  items: { id: string; label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => {
        const active = it.id === selectedId;
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(it.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-transparent bg-muted/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] Chạy pass: `npx vitest run src/components/journey/FocusPicker.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 5: Chapter — section snap-start + Reveal

**Files**
- Create: `src/components/journey/Chapter.tsx`
- Test: `src/components/journey/Chapter.test.tsx`

**Interfaces**
- Consumes: `EventStatus` từ `@/data/types`; `Reveal` từ `@/components/motion`.
- Produces: `export function Chapter({ id, title, status, children }: { id: string; title: string; status?: EventStatus; children: ReactNode }): JSX.Element`.

**Steps**

- [ ] Viết test fail `src/components/journey/Chapter.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { useUiStore } from "@/stores/uiStore";
import { Chapter } from "./Chapter";

useUiStore.setState({ reducedMotion: true });

describe("Chapter", () => {
  test("render id làm anchor + tiêu đề + nội dung", () => {
    const { container } = render(
      <Chapter id="chang-1" title="Chặng 1" status="current">
        <p>Nội dung chặng</p>
      </Chapter>
    );
    const section = container.querySelector("#chang-1");
    expect(section).not.toBeNull();
    expect(section?.getAttribute("data-status")).toBe("current");
    expect(screen.getByText("Chặng 1")).toBeInTheDocument();
    expect(screen.getByText("Nội dung chặng")).toBeInTheDocument();
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/Chapter.test.tsx` → expected: `Cannot find module './Chapter'`.

- [ ] Code tối thiểu `src/components/journey/Chapter.tsx`:

```tsx
import type { ReactNode } from "react";
import type { EventStatus } from "@/data/types";
import { Reveal } from "@/components/motion";

/** Một chương trong hành trình: anchor cuộn (snap-start) + hiện dần khi tới. */
export function Chapter({
  id,
  title,
  status,
  children,
}: {
  id: string;
  title: string;
  status?: EventStatus;
  children: ReactNode;
}) {
  return (
    <section id={id} data-status={status} className="snap-start scroll-mt-24 py-2">
      <Reveal>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">{title}</h2>
        <div className="space-y-4">{children}</div>
      </Reveal>
    </section>
  );
}
```

- [ ] Chạy pass: `npx vitest run src/components/journey/Chapter.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 6: CycleBand — vỏ generic dải gọn + bung chi tiết

**Files**
- Create: `src/components/journey/CycleBand.tsx`
- Test: `src/components/journey/CycleBand.test.tsx`

**Interfaces**
- Consumes: `EventStatus`, `NarratedLine` từ `@/data/types`; `Narrator` từ `./Narrator`.
- Produces: `export function CycleBand({ label, range, status, narration, summary, children }: { label: string; range: { from: string; to: string }; status: EventStatus; narration: NarratedLine; summary: ReactNode; children: ReactNode }): JSX.Element`.

**Steps**

- [ ] Viết test fail `src/components/journey/CycleBand.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CycleBand } from "./CycleBand";

describe("CycleBand", () => {
  test("dải gọn hiện label/range/narration + summary; bung children khi bấm", () => {
    render(
      <CycleBand
        label="Chặng 1 · Giữa kì"
        range={{ from: "2026-01-10", to: "2026-03-15" }}
        status="past"
        narration={{ text: "Em làm tốt phần này.", figures: [{ label: "Đúng", value: "82%" }] }}
        summary={<div>Ba ô tóm tắt</div>}
      >
        <div>Chi tiết chặng đầy đủ</div>
      </CycleBand>
    );
    expect(screen.getByText("Chặng 1 · Giữa kì")).toBeInTheDocument();
    expect(screen.getByText("Em làm tốt phần này.")).toBeInTheDocument();
    expect(screen.getByText("Ba ô tóm tắt")).toBeInTheDocument();
    // chi tiết ẩn ban đầu
    expect(screen.queryByText("Chi tiết chặng đầy đủ")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Xem chi tiết chặng/ }));
    expect(screen.getByText("Chi tiết chặng đầy đủ")).toBeInTheDocument();
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/CycleBand.test.tsx` → expected: `Cannot find module './CycleBand'`.

- [ ] Code tối thiểu `src/components/journey/CycleBand.tsx`:

```tsx
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { EventStatus, NarratedLine } from "@/data/types";
import { cn } from "@/lib/utils";
import { Narrator } from "./Narrator";

const STATUS_BADGE: Record<EventStatus, { label: string; cls: string }> = {
  past: { label: "Đã qua", cls: "border-muted-foreground/30 text-muted-foreground" },
  current: { label: "Đang diễn ra", cls: "border-brand-300 bg-brand-50 text-brand-700" },
  upcoming: { label: "Sắp tới", cls: "border-warning-200 bg-warning-50 text-warning-700" },
};

function fmtRange(from: string, to: string): string {
  const d = (iso: string) => {
    const [y, m, day] = iso.split("-");
    return `${day}/${m}/${y}`;
  };
  return `${d(from)} – ${d(to)}`;
}

/** Vỏ generic cho một chặng: dải gọn (label/range/status + Narrator + summary) + nút bung children chi tiết. */
export function CycleBand({
  label,
  range,
  status,
  narration,
  summary,
  children,
}: {
  label: string;
  range: { from: string; to: string };
  status: EventStatus;
  narration: NarratedLine;
  summary: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const badge = STATUS_BADGE[status];
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold tracking-tight">{label}</h3>
          <p className="text-xs text-muted-foreground tabular-nums">{fmtRange(range.from, range.to)}</p>
        </div>
        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", badge.cls)}>
          {badge.label}
        </span>
      </div>

      <div className="mt-3">
        <Narrator line={narration} />
      </div>

      <div className="mt-3">{summary}</div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        {open ? "Thu gọn chặng" : "Xem chi tiết chặng"}
      </button>

      {open && <div className="mt-4 space-y-4 border-t pt-4">{children}</div>}
    </div>
  );
}
```

- [ ] Chạy pass: `npx vitest run src/components/journey/CycleBand.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 7: PresentationMode — trình chiếu full-screen từng chương

**Files**
- Create: `src/components/journey/PresentationMode.tsx`
- Test: `src/components/journey/PresentationMode.test.tsx`

**Interfaces**
- Consumes: `ChapterDef` từ `./Journey` (định nghĩa ở Task 8 — nhưng để tránh phụ thuộc vòng, PresentationMode khai báo type cục bộ tương thích cấu trúc). Để đơn giản & đúng CONTRACT (ChapterDef export ở Journey.tsx), PresentationMode import type từ `./types-journey`.
- Produces: `export function PresentationMode({ chapters, open, onClose, initialIndex }: { chapters: ChapterDef[]; open: boolean; onClose: () => void; initialIndex?: number }): JSX.Element | null`.

> Ghi chú kiến trúc: tách `ChapterDef` ra file `src/components/journey/types-journey.ts` để Journey.tsx và PresentationMode.tsx cùng import, tránh phụ thuộc vòng. Journey.tsx re-export `ChapterDef` để đúng CONTRACT ("ChapterDef export trong Journey.tsx").

- [ ] Viết test fail `src/components/journey/PresentationMode.test.tsx`:

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useUiStore } from "@/stores/uiStore";
import { PresentationMode } from "./PresentationMode";

useUiStore.setState({ reducedMotion: true });

const chapters = [
  { id: "c1", title: "Chương 1", render: () => <div>Nội dung 1</div> },
  { id: "c2", title: "Chương 2", render: () => <div>Nội dung 2</div> },
];

describe("PresentationMode", () => {
  test("đóng thì không render gì", () => {
    const { container } = render(
      <PresentationMode chapters={chapters} open={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("mở hiện chương đầu; nút › sang chương sau; Esc gọi onClose", () => {
    const onClose = vi.fn();
    render(<PresentationMode chapters={chapters} open onClose={onClose} />);
    expect(screen.getByText("Nội dung 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chương sau" }));
    expect(screen.getByText("Nội dung 2")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("mở tại initialIndex", () => {
    render(<PresentationMode chapters={chapters} open onClose={() => {}} initialIndex={1} />);
    expect(screen.getByText("Nội dung 2")).toBeInTheDocument();
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/PresentationMode.test.tsx` → expected: `Cannot find module './PresentationMode'`.

- [ ] Tạo `src/components/journey/types-journey.ts`:

```ts
import type { ReactNode } from "react";
import type { EventStatus } from "@/data/types";

/** Một chương đã dựng sẵn để vỏ Journey/PresentationMode render — kind-agnostic. */
export interface ChapterDef {
  id: string;
  title: string;
  status?: EventStatus;
  render: () => ReactNode;
}
```

- [ ] Code `src/components/journey/PresentationMode.tsx`:

```tsx
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useReduced } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { ChapterDef } from "./types-journey";

/** Trình chiếu full-screen từng chương. Phím ‹ › chuyển, Esc thoát. Reduced-motion-aware. */
export function PresentationMode({
  chapters,
  open,
  onClose,
  initialIndex = 0,
}: {
  chapters: ChapterDef[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}) {
  const reduced = useReduced();
  const [idx, setIdx] = useState(initialIndex);

  useEffect(() => {
    if (open) setIdx(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, chapters.length - 1));
      else if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, chapters.length]);

  if (!open || chapters.length === 0) return null;
  const safeIdx = Math.max(0, Math.min(idx, chapters.length - 1));
  const ch = chapters[safeIdx];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground tabular-nums">
            Chương {safeIdx + 1}/{chapters.length}
          </p>
          <h2 className="truncate text-lg font-semibold tracking-tight">{ch.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Thoát trình chiếu"
          className="grid size-9 place-items-center rounded-lg border bg-card shadow-sm hover:border-brand-300 hover:text-brand-700"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className={cn("mx-auto max-w-4xl", !reduced && "animate-in fade-in")}>{ch.render()}</div>
      </div>

      <footer className="flex items-center justify-between border-t px-6 py-3">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(i - 1, 0))}
          disabled={safeIdx === 0}
          aria-label="Chương trước"
          className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
        >
          <ChevronLeft className="size-4" /> Trước
        </button>
        <div className="flex gap-1.5">
          {chapters.map((c, i) => (
            <span
              key={c.id}
              className={cn("size-1.5 rounded-full", i === safeIdx ? "bg-brand-600" : "bg-muted-foreground/30")}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIdx((i) => Math.min(i + 1, chapters.length - 1))}
          disabled={safeIdx === chapters.length - 1}
          aria-label="Chương sau"
          className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
        >
          Sau <ChevronRight className="size-4" />
        </button>
      </footer>
    </div>
  );
}
```

- [ ] Chạy pass: `npx vitest run src/components/journey/PresentationMode.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 8: Journey — vỏ kind-agnostic (KyMonPicker sticky + TimelineRail + scroll-snap + Trình chiếu)

**Files**
- Create: `src/components/journey/Journey.tsx`
- Test: `src/components/journey/Journey.test.tsx`

**Interfaces**
- Consumes: `Ky`, `Subject`, `EventStatus` từ `@/data/types`; `ChapterDef` từ `./types-journey`; `KyMonPicker`, `TimelineRail`, `Chapter`, `PresentationMode`, `useReduced`.
- Produces:
  - `export type { ChapterDef } from "./types-journey";` (re-export đúng CONTRACT).
  - `export function Journey({ slice, availableSlices, onSlice, timeline, chapters }: { slice: { term: Ky; subject: Subject }; availableSlices: { terms: Ky[]; subjects: Subject[] }; onSlice: (s: { term: Ky; subject: Subject }) => void; timeline: { id: string; label: string; status: EventStatus }[]; chapters: ChapterDef[] }): JSX.Element`.

**Steps**

- [ ] Viết test fail `src/components/journey/Journey.test.tsx`:

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useUiStore } from "@/stores/uiStore";
import { Journey } from "./Journey";

useUiStore.setState({ reducedMotion: true });

const chapters = [
  { id: "mo-dau", title: "Mở đầu", status: "past" as const, render: () => <div>Khúc mở đầu</div> },
  { id: "hoi-tu", title: "Hội tụ", status: "upcoming" as const, render: () => <div>Khúc hội tụ</div> },
];
const timeline = [
  { id: "mo-dau", label: "Mở đầu", status: "past" as const },
  { id: "hoi-tu", label: "Hội tụ", status: "upcoming" as const },
];

describe("Journey", () => {
  test("render picker, timeline, các chương; nút Trình chiếu mở overlay", () => {
    render(
      <Journey
        slice={{ term: "ky-1", subject: "Địa lí" }}
        availableSlices={{ terms: ["ky-1", "ky-2"], subjects: ["Địa lí", "Lịch sử"] }}
        onSlice={() => {}}
        timeline={timeline}
        chapters={chapters}
      />
    );
    expect(screen.getByText("Khúc mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Khúc hội tụ")).toBeInTheDocument();
    // timeline labels (xuất hiện cả ở rail + chương → dùng getAllByText)
    expect(screen.getAllByText("Mở đầu").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Trình chiếu/ }));
    expect(screen.getByText(/Chương 1\/2/)).toBeInTheDocument();
  });

  test("đổi slice gọi onSlice", () => {
    const onSlice = vi.fn();
    render(
      <Journey
        slice={{ term: "ky-1", subject: "Địa lí" }}
        availableSlices={{ terms: ["ky-1", "ca-nam"], subjects: ["Địa lí"] }}
        onSlice={onSlice}
        timeline={timeline}
        chapters={chapters}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Cả năm" }));
    expect(onSlice).toHaveBeenCalledWith({ term: "ca-nam", subject: "Địa lí" });
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/Journey.test.tsx` → expected: `Cannot find module './Journey'`.

- [ ] Code `src/components/journey/Journey.tsx`:

```tsx
import { useState } from "react";
import { Play } from "lucide-react";
import type { Ky, Subject, EventStatus } from "@/data/types";
import { useReduced } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { ChapterDef } from "./types-journey";
import { KyMonPicker } from "./KyMonPicker";
import { TimelineRail } from "./TimelineRail";
import { Chapter } from "./Chapter";
import { PresentationMode } from "./PresentationMode";

export type { ChapterDef } from "./types-journey";

/** Vỏ hành trình kể chuyện dùng chung cho cả học sinh và lớp. Nhận chapters đã dựng sẵn. */
export function Journey({
  slice,
  availableSlices,
  onSlice,
  timeline,
  chapters,
}: {
  slice: { term: Ky; subject: Subject };
  availableSlices: { terms: Ky[]; subjects: Subject[] };
  onSlice: (s: { term: Ky; subject: Subject }) => void;
  timeline: { id: string; label: string; status: EventStatus }[];
  chapters: ChapterDef[];
}) {
  const reduced = useReduced();
  const [present, setPresent] = useState(false);
  const activeId = timeline.find((t) => t.status === "current")?.id ?? timeline[0]?.id;

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-30 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 px-3 py-2.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <KyMonPicker
          term={slice.term}
          subject={slice.subject}
          terms={availableSlices.terms}
          subjects={availableSlices.subjects}
          onChange={onSlice}
        />
        <button
          type="button"
          onClick={() => setPresent(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 shadow-sm transition-colors hover:bg-brand-100"
        >
          <Play className="size-3.5" /> Trình chiếu
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TimelineRail items={timeline} activeId={activeId} />
          </div>
        </aside>

        <div
          className={cn(
            "space-y-8",
            !reduced && "snap-y snap-mandatory"
          )}
        >
          {chapters.map((c) => (
            <Chapter key={c.id} id={c.id} title={c.title} status={c.status}>
              {c.render()}
            </Chapter>
          ))}
        </div>
      </div>

      <PresentationMode chapters={chapters} open={present} onClose={() => setPresent(false)} />
    </div>
  );
}
```

- [ ] Chạy pass: `npx vitest run src/components/journey/Journey.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 9: buildStudentChapters — dựng các chương bản Học sinh

**Files**
- Create: `src/components/journey/studentChapters.tsx`
- Test: `src/components/journey/studentChapters.test.tsx`

**Interfaces**
- Consumes: `StudentJourney`, `StudentCycle`, `MissionStudentReportView` từ `@/data/types`; `ChapterDef` từ `./types-journey`; `ProgressRing`, `TrendLine`, `ConvergencePanel`, `ChartCard`, `Narrator`, `CycleBand`; `diem`, `pct`, `duration` từ `@/lib/format`.
- Produces: `export function buildStudentChapters(j: StudentJourney, nav: (path: string) => void): ChapterDef[]`.

> Chương: `mo-dau` (Mở đầu — ProgressRing×2 + overview narration), `chuan-bi` (Chuẩn bị — 3 tỉ lệ PrepSurface + narration), `cycle-<id>` cho từng StudentCycle (CycleBand: summary 3 ô + chi tiết TrendLine/bảng nhiệm vụ/link bài làm), `hoi-tu` (Hội tụ — ConvergencePanel gentle + narration).

**Steps**

- [ ] Viết test fail `src/components/journey/studentChapters.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { mockRepository as repo } from "@/data/mockRepository";
import { STUDENT_HERO } from "@/data/mock/world";
import { buildStudentChapters } from "./studentChapters";

useUiStore.setState({ reducedMotion: true });

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>
  );

describe("buildStudentChapters", () => {
  test("dựng đủ chương Mở đầu, Chuẩn bị, từng chặng, Hội tụ", () => {
    const j = repo.getStudentJourney(STUDENT_HERO, "ky-1", "Địa lí");
    const chapters = buildStudentChapters(j, () => {});
    const ids = chapters.map((c) => c.id);
    expect(ids).toContain("mo-dau");
    expect(ids).toContain("chuan-bi");
    expect(ids).toContain("hoi-tu");
    expect(chapters.filter((c) => c.id.startsWith("cycle-")).length).toBe(j.cycles.length);
  });

  test("chương Mở đầu render được, hiện tên học sinh hoặc chỉ số", () => {
    const j = repo.getStudentJourney(STUDENT_HERO, "ky-1", "Địa lí");
    const chapters = buildStudentChapters(j, () => {});
    const moDau = chapters.find((c) => c.id === "mo-dau")!;
    wrap(<>{moDau.render()}</>);
    expect(screen.getByText(j.overview.narration.text)).toBeInTheDocument();
  });

  test("chương Hội tụ render ConvergencePanel narration", () => {
    const j = repo.getStudentJourney(STUDENT_HERO, "ky-1", "Địa lí");
    const chapters = buildStudentChapters(j, () => {});
    const hoiTu = chapters.find((c) => c.id === "hoi-tu")!;
    wrap(<>{hoiTu.render()}</>);
    expect(screen.getByText(j.convergence.narration.text)).toBeInTheDocument();
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/studentChapters.test.tsx` → expected: `Cannot find module './studentChapters'` (hoặc `repo.getStudentJourney is not a function` nếu Plan 01 chưa xong — Task này phụ thuộc Plan 01 hoàn tất).

- [ ] Code `src/components/journey/studentChapters.tsx`:

```tsx
import { FileText, ChevronRight } from "lucide-react";
import type { StudentJourney, StudentCycle, MissionStudentReportView } from "@/data/types";
import { diem, pct, duration } from "@/lib/format";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { TrendLine } from "@/components/charts/TrendLine";
import { ConvergencePanel } from "@/components/report/ConvergencePanel";
import { ChartCard } from "@/components/charts/chart-kit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ChapterDef } from "./types-journey";
import { Narrator } from "./Narrator";
import { CycleBand } from "./CycleBand";

const STATUS_LABEL: Record<MissionStudentReportView["status"], string> = {
  todo: "Chưa làm",
  inprogress: "Đang làm",
  submitted: "Đã nộp",
  graded: "Đã chấm",
};

function SummaryCell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function CycleSummary({ c }: { c: StudentCycle }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <SummaryCell label="Chuyên cần" value={pct(c.lop.attendanceRate)} hint={`${c.lop.sessions.length} buổi`} />
      <SummaryCell
        label="Bài về nhà"
        value={pct(c.nha.completionRate)}
        hint={`đúng hạn ${pct(c.nha.onTimeRate)}`}
      />
      <SummaryCell
        label="Bài thi chặng"
        value={c.exam ? diem(c.exam.score) : "—"}
        hint={c.exam ? `TB lớp ${diem(c.exam.classAvg)}` : "chưa có"}
      />
    </div>
  );
}

function CycleDetail({ c, nav }: { c: StudentCycle; nav: (path: string) => void }) {
  return (
    <div className="space-y-4">
      <ChartCard title="Trên lớp — chuyên cần & độ đúng quiz theo buổi">
        <Narrator line={c.lop.narration} />
        <div className="mt-3">
          <TrendLine
            data={c.lop.sessions.map((s) => ({
              term: s.session,
              "Chuyên cần %": Math.round(s.attendance * 100),
              "Đúng quiz %": Math.round(s.quizAccuracy * 100),
            }))}
            series={[
              { key: "Chuyên cần %", name: "Chuyên cần %" },
              { key: "Đúng quiz %", name: "Đúng quiz %" },
            ]}
            domain={[0, 100]}
          />
        </div>
      </ChartCard>

      <ChartCard title="Ở nhà — bài về nhà trong chặng" help="Bấm một dòng để xem bài làm chi tiết.">
        <Narrator line={c.nha.narration} />
        <div className="mt-3 max-h-[280px] overflow-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
              <TableRow>
                <TableHead>Nhiệm vụ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Điểm</TableHead>
                <TableHead className="text-right">Đúng</TableHead>
                <TableHead className="text-right">Thời gian</TableHead>
                <TableHead className="w-8" aria-hidden />
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.nha.missions.map((m) => (
                <TableRow
                  key={m.missionId}
                  onClick={() => nav(`/app/nhiem-vu/${m.missionId}/${m.studentId}`)}
                  className="group cursor-pointer transition-colors hover:bg-muted/60"
                >
                  <TableCell className="font-medium">{m.title ?? m.missionId}</TableCell>
                  <TableCell>{STATUS_LABEL[m.status]}{m.late ? " · trễ" : ""}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.totalScore == null ? "—" : diem(m.totalScore)}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.correctCount}/{m.totalQuestions}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.durationSec ? duration(m.durationSec) : "—"}</TableCell>
                  <TableCell className="pr-3 text-right">
                    <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>

      {c.exam && (
        <ChartCard
          title="Bài thi khép chặng"
          right={
            <button
              type="button"
              onClick={() => nav(`/app/bai-lam/${c.exam!.examId}/${c.exam!.submissionKey}`)}
              className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs font-medium shadow-sm hover:border-brand-300 hover:text-brand-700"
            >
              <FileText className="size-3.5" /> Đề & bài làm
            </button>
          }
        >
          <Narrator line={c.exam.narration} />
        </ChartCard>
      )}
    </div>
  );
}

/** Dựng các chương bản Học sinh từ StudentJourney. */
export function buildStudentChapters(
  j: StudentJourney,
  nav: (path: string) => void
): ChapterDef[] {
  const chapters: ChapterDef[] = [];

  // Mở đầu
  chapters.push({
    id: "mo-dau",
    title: "Mở đầu",
    status: "past",
    render: () => (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border bg-card p-5 shadow-sm">
          <ProgressRing value={j.overview.learningIndex.total} label="Học tập" />
          <ProgressRing value={j.overview.effortIndex.total} label="Nỗ lực" />
        </div>
        <Narrator line={j.overview.narration} variant="opener" />
      </div>
    ),
  });

  // Chuẩn bị
  const s = j.prep.surface;
  chapters.push({
    id: "chuan-bi",
    title: "Chuẩn bị",
    status: "past",
    render: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <SummaryCell
            label="Xem trước bài"
            value={pct(s.xemTruoc.total ? s.xemTruoc.count / s.xemTruoc.total : 0)}
            hint={`${s.xemTruoc.count}/${s.xemTruoc.total} buổi`}
          />
          <SummaryCell
            label="Bài chuẩn bị"
            value={pct(s.baiChuanBi.total ? s.baiChuanBi.count / s.baiChuanBi.total : 0)}
            hint={`${s.baiChuanBi.count}/${s.baiChuanBi.total} bài`}
          />
          <SummaryCell
            label="Đúng giờ"
            value={pct(s.dungGio.total ? s.dungGio.count / s.dungGio.total : 0)}
            hint={`${s.dungGio.count}/${s.dungGio.total} lượt`}
          />
        </div>
        <Narrator line={j.prep.narration} />
      </div>
    ),
  });

  // Các chặng
  for (const c of j.cycles) {
    chapters.push({
      id: `cycle-${c.id}`,
      title: c.label,
      status: c.status,
      render: () => (
        <CycleBand
          label={c.label}
          range={c.range}
          status={c.status}
          narration={c.exam ? c.exam.narration : c.lop.narration}
          summary={<CycleSummary c={c} />}
        >
          <CycleDetail c={c} nav={nav} />
        </CycleBand>
      ),
    });
  }

  // Hội tụ
  chapters.push({
    id: "hoi-tu",
    title: "Hội tụ",
    status: j.convergence.nextExam ? "upcoming" : "current",
    render: () => (
      <div className="space-y-4">
        <Narrator line={j.convergence.narration} />
        <ChartCard title="Chủ đề em nên ôn lại">
          <ConvergencePanel topics={j.convergence.topics} gentle />
        </ChartCard>
      </div>
    ),
  });

  return chapters;
}
```

- [ ] Chạy pass: `npx vitest run src/components/journey/studentChapters.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 10: Route /app/hoc-sinh/:studentId — hành trình học sinh + smoke test

**Files**
- Modify: `src/routes/hoc-sinh.tsx` (thay nội dung cũ bằng hành trình mới; route đã đăng ký sẵn trong `src/router.tsx` — KHÔNG đổi router).
- Test: `src/routes/hoc-sinh.test.tsx`

**Interfaces**
- Consumes: `repo.getStudentJourney`, `buildStudentChapters`, `Journey`, `KY_LABEL`, `Ky`, `Subject`, `EventStatus`; `useSearchParams`, `useNavigate`, `useParams` từ react-router-dom; `useUiStore`; `PageHeader`, `ExportButton`.
- Produces: `export default function HocSinh(): JSX.Element` (đọc `?ky=&mon=&present=`).

**Steps**

- [ ] Viết test fail `src/routes/hoc-sinh.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { STUDENT_HERO } from "@/data/mock/world";
import HocSinh from "./hoc-sinh";

useUiStore.setState({ reducedMotion: true });

const wrap = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <TooltipProvider>
        <Routes>
          <Route path="/app/hoc-sinh/:studentId" element={<HocSinh />} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>
  );

describe("route học sinh — hành trình render không lỗi", () => {
  test("render vỏ Journey với picker và chương Mở đầu", () => {
    wrap(`/app/hoc-sinh/${STUDENT_HERO}?ky=ky-1&mon=Địa lí`);
    expect(screen.getByText("Mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Hội tụ")).toBeInTheDocument();
    // KyMonPicker pill môn Địa lí có mặt
    expect(screen.getAllByText("Địa lí").length).toBeGreaterThan(0);
  });

  test("nút Trình chiếu có mặt", () => {
    wrap(`/app/hoc-sinh/${STUDENT_HERO}`);
    expect(screen.getByRole("button", { name: /Trình chiếu/ })).toBeInTheDocument();
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/routes/hoc-sinh.test.tsx` → expected: route cũ không render `<Journey>` nên không tìm thấy "Mở đầu"/"Hội tụ"/nút "Trình chiếu" → test fail.

- [ ] Code thay toàn bộ `src/routes/hoc-sinh.tsx`:

```tsx
import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Ky, Subject, EventStatus } from "@/data/types";
import { KY_LABEL } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";
import { PageHeader } from "@/components/report/PageHeader";
import { ExportButton } from "@/components/report/ExportButton";
import { Journey } from "@/components/journey/Journey";
import { buildStudentChapters } from "@/components/journey/studentChapters";

const TERMS: Ky[] = ["ky-1", "ky-2", "ca-nam"];

function parseKy(raw: string | null): Ky {
  return raw === "ky-2" || raw === "ca-nam" || raw === "ky-1" ? raw : "ky-1";
}

export default function HocSinh() {
  const { studentId = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const term = parseKy(params.get("ky"));
  const monParam = params.get("mon") ?? "";
  const j = repo.getStudentJourney(studentId, term, (monParam || "Địa lí") as Subject);

  const onSlice = useCallback(
    (next: { term: Ky; subject: Subject }) => {
      const p = new URLSearchParams(params);
      p.set("ky", next.term);
      p.set("mon", next.subject);
      setParams(p, { replace: true });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [params, setParams]
  );

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
        slice={j.slice}
        availableSlices={j.availableSlices}
        onSlice={onSlice}
        timeline={timeline}
        chapters={chapters}
      />
    </div>
  );
}
```

- [ ] Chạy pass: `npx vitest run src/routes/hoc-sinh.test.tsx`.
- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

## Tóm tắt sản phẩm Plan 02

Vỏ dùng chung tại `src/components/journey/`: `types-journey.ts` (ChapterDef), `Narrator.tsx`, `KyMonPicker.tsx`, `TimelineRail.tsx`, `FocusPicker.tsx`, `Chapter.tsx`, `CycleBand.tsx`, `PresentationMode.tsx`, `Journey.tsx` (re-export ChapterDef). Bản học sinh: `studentChapters.tsx` + route `src/routes/hoc-sinh.tsx`. Tất cả phụ thuộc Plan 01 (`getStudentJourney`, các kiểu CONTRACT). Plan 03 chỉ import, không sửa các file vỏ.
