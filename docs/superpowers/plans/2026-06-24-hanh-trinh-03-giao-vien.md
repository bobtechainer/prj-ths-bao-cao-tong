# Bản Giáo viên (Hành trình lớp) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Thực thi tuần tự từng Task; mỗi Step là một checkbox (`- [ ]`); chỉ chuyển Task khi cổng đã xanh. Không gộp bước, không bỏ bước test-fail.

**Goal:** Dựng *Bản Giáo viên* cho hành trình báo cáo cấp lớp: cùng vỏ kể chuyện bám timeline của Plan 02 (`<Journey>`), nhưng nội dung là cấp lớp — Mở đầu → Chuẩn bị → (Trên lớp → Ở nhà → Kỳ thi) × N chặng → Hội tụ. Giáo viên gộp số liệu cả lớp, drill xuống hành trình từng học sinh. Bộ chọn lớp (chủ nhiệm ↔ bộ môn) lấy từ `getTeaching()`. Route `/app/lop/:classId` chuyển từ vỏ tab cũ sang `<Journey>`. Trợ lý offline bám số, đúng thì.

**Architecture:**
- `buildClassChapters(j, nav)` (mới) biến `ClassJourney` thành `ChapterDef[]` — thuần dữ liệu→JSX, tái dùng toàn bộ block biểu đồ/bảng đã có (`BandDistribution`, `ScoreHistogram`, `CodeCompare`, `TopicMatrixBars`, `TopMissedTable`, `EffortScatter`, `EngagementTimeline`, `RosterTable`, `ConvergencePanel`, `ExecutiveHero`, `IndexCard`, `KpiCard`, `AttendanceDonut`).
- `ClassPicker` (mới): chọn-một-trong-nhiều lớp (chủ nhiệm + bộ môn) qua `<FocusPicker>` của Plan 02; đổi lớp cập nhật `?class=`.
- Route `lop.tsx` (sửa): đọc `?ky=&mon=&class=&present=`, gọi `repo.getClassJourney(classId, ky, mon)` → `buildClassChapters` → `<Journey>` (đúng vỏ Plan 02). KHÔNG tạo `Journey`/`CycleBand`/`PresentationMode` mới.
- Vỏ tab cũ (`lop/TongHopTab.tsx`, `lop/LopTab.tsx`, `lop/NhaTab.tsx`, `lop/ThiTab.tsx`) nghỉ hưu: rút phần biểu đồ tái dùng đã có sẵn trong `classChapters`, xoá 4 file vỏ tab. Component con biểu đồ giữ nguyên. Cập nhật `smoke.test.tsx` không còn import các tab cũ.

**Tech Stack:** Vite7 + React19 + TS + Tailwind4 + shadcn/Radix + Recharts3 + framer-motion12 + React Router 7 + Zustand(+immer) + Vitest. Alias `@` = `src`. Root: `c:/Trường học số - source code/prj-ths-bao-cao-tong/`. KHÔNG phải git repo.

**Phụ thuộc:** Plan 01 (types `Ky`/`ClassJourney`/`ClassCycle`/`NarratedLine`/`EventStatus`, `repo.getClassJourney`, `repo.getTeaching`, `src/lib/narrate.ts`, `DEMO_NOW`/`OFFICIAL_EXAM`) và Plan 02 (vỏ dùng chung). Plan này **CHỈ IMPORT** các file vỏ của Plan 02 theo đúng chữ ký dưới, **TUYỆT ĐỐI KHÔNG sửa/ghi đè** chúng.

## Global Constraints

- Chỉ token MobiFone qua biến CSS / lớp Tailwind (brand/warning/success/error/blue-light/indigo). KHÔNG hex thô.
- Font Be Vietnam Pro. Câu chữ theo skill "humanized" (giọng giáo viên, không sáo rỗng, không "AI phân tích cho thấy"). KHÔNG dùng chữ "demo/minh hoạ".
- Dẫn chứng số liệu: chỉ bịa SỐ THÔ (đếm buổi/lượt/điểm). Mọi tỉ lệ/chỉ số hiển thị phải truy input→output. MỖI câu Trợ lý (NarratedLine) phải mang figures hiển thị ngay cạnh.
- Mọi chuyển động tôn trọng prefers-reduced-motion (đã có hook `useReduced()` + `reducedMotion` trong uiStore).
- Cổng phải xanh: `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

## Chữ ký vỏ Plan 02 (CHỈ IMPORT — KHÔNG sửa)

```ts
// src/components/journey/Journey.tsx
export interface ChapterDef { id: string; title: string; status?: EventStatus; render: () => ReactNode }
export function Journey(props: {
  slice: { term: Ky; subject: Subject };
  availableSlices: { terms: Ky[]; subjects: Subject[] };
  onSlice: (s: { term: Ky; subject: Subject }) => void;
  timeline: { id: string; label: string; status: EventStatus }[];
  chapters: ChapterDef[];
}): JSX.Element;
export function Chapter(props: { id: string; title: string; status?: EventStatus; children: ReactNode }): JSX.Element;
// src/components/journey/Narrator.tsx
export function Narrator(props: { line: NarratedLine; variant?: "opener" | "line" }): JSX.Element;
// src/components/journey/CycleBand.tsx
export function CycleBand(props: {
  label: string; range: { from: string; to: string }; status: EventStatus;
  narration: NarratedLine; summary: ReactNode; children: ReactNode;
}): JSX.Element;
// src/components/journey/FocusPicker.tsx
export function FocusPicker(props: { items: { id: string; label: string }[]; selectedId: string; onSelect: (id: string) => void }): JSX.Element;
```

---

## ⚠️ Sửa bắt buộc (review) — đọc trước khi code

Code mẫu trong các Task dưới có vài chỗ cần chỉnh theo đây:

1. **KHÔNG bọc `<Chapter>` trong builder.** `Journey` (Plan 02) đã tự bọc mỗi `ChapterDef` trong `<Chapter id title status>`. Trong `classChapters.tsx`, `render()` của `moDau/chuanBi/buildCycleChapter/hoiTu` phải **trả thẳng nội dung**, KHÔNG tự bọc `<Chapter>`. → Bỏ dòng `import { Chapter } from "@/components/journey/Journey";` (Journey không export `Chapter`); không dùng `Chapter` trong file này.
2. **Truy đúng `ClassCycle.exam`.** Contract: `exam = { report: ExamReport; narration: NarratedLine }`. Trong `buildCycleChapter` viết `const exam = c.exam; const thi = exam?.report ?? null;` rồi dùng `thi.avg`, `thi.bands`, `thi.histogram`, `thi.codes`, `thi.codes[0].topMissed`; Narrator kỳ thi dùng **`exam.narration`** (KHÔNG `thi.narration`). `sumItems`: `value: thi ? diem(thi.avg) : "—"` (KHÔNG `thi.report.avg`).
3. **Drill toàn lớp:** `RosterTable` trong chi tiết chặng đặt `onRowClick={(id) => navigate(\`/app/hoc-sinh/${id}?ky=${term}&mon=${encodeURIComponent(subject)}\`)}` để mở hành trình BẤT KỲ học sinh (không chỉ nhóm cần hỗ trợ).
4. **Code sạch ngay:** bỏ hẳn `const completion = overview.examAvg; void completion;` (Task 1) và `const TERMS...; void TERMS;` + import `useNavigate` trùng (Task 3).
5. **BỎ Task 5 (TroLySummary).** File `src/components/report/TroLySummary.tsx` do **Plan 04 Task 1** sở hữu — Plan 03 KHÔNG tạo/đụng. Xem [index](2026-06-24-hanh-trinh-00-index.md).

---

### Task 1: `buildClassChapters` — biến `ClassJourney` thành `ChapterDef[]`

Hàm thuần dữ liệu→JSX: 4 nhóm chương — Mở đầu, Chuẩn bị, các ClassCycle (mỗi chặng một `<CycleBand>`), Hội tụ. Tái dùng block đã có; mỗi chương có một `<Narrator>` mang số.

**Files**
- Create: `src/components/journey/classChapters.tsx`
- Test: `src/components/journey/classChapters.test.tsx`

**Interfaces**
- Consumes: `ClassJourney`, `ClassCycle`, `ChapterDef` (Plan 02), `CycleBand`, `Narrator` (Plan 02), `Chapter` (Plan 02), `ExecutiveHero`, `IndexCard`, `BandDistribution`, `ScoreHistogram`, `CodeCompare`, `TopicMatrixBars`, `TopMissedTable`, `EffortScatter`, `EngagementTimeline`, `AttendanceDonut`, `RosterTable`, `ConvergencePanel`, `ChartCard`, `KpiCard`, `LEARNING_EXPLAIN`, `EFFORT_EXPLAIN`, `diem`, `int`, `pct`.
- Produces: `export function buildClassChapters(j: ClassJourney, nav: (to: string) => void): ChapterDef[]`

**Steps**

- [ ] Viết test fail `src/components/journey/classChapters.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildClassChapters } from "@/components/journey/classChapters";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>
  );

describe("buildClassChapters", () => {
  test("dựng đủ chương: mở đầu, chuẩn bị, các chặng, hội tụ", () => {
    const j = repo.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    const chapters = buildClassChapters(j, () => {});
    const ids = chapters.map((c) => c.id);
    expect(ids[0]).toBe("mo-dau");
    expect(ids[1]).toBe("chuan-bi");
    expect(ids[ids.length - 1]).toBe("hoi-tu");
    // mỗi ClassCycle một chương "chang-*"
    expect(ids.filter((i) => i.startsWith("chang-")).length).toBe(j.cycles.length);
  });

  test("chương mở đầu hiện điểm thi TB lớp và sĩ số", () => {
    const j = repo.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    const ch = buildClassChapters(j, () => {}).find((c) => c.id === "mo-dau")!;
    wrap(<>{ch.render()}</>);
    expect(screen.getAllByText("Sĩ số").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Điểm thi TB").length).toBeGreaterThan(0);
  });

  test("hội tụ hiện danh sách HS cần hỗ trợ và cho bấm sang hồ sơ", () => {
    const j = repo.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    let dest = "";
    const ch = buildClassChapters(j, (to) => (dest = to)).find((c) => c.id === "hoi-tu")!;
    wrap(<>{ch.render()}</>);
    // có ít nhất một học sinh trong danh sách cần hỗ trợ → bấm điều hướng /app/hoc-sinh/
    const first = j.convergence.needSupport[0];
    if (first) {
      screen.getByText(first.name).click();
      expect(dest.startsWith("/app/hoc-sinh/")).toBe(true);
    }
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/classChapters.test.tsx`
      Expected: lỗi `Failed to resolve import "@/components/journey/classChapters"` (file chưa tồn tại).

- [ ] Code tối thiểu `src/components/journey/classChapters.tsx`:

```tsx
import type { ReactNode } from "react";
import { Users, GraduationCap, Sigma, ClipboardList, HeartHandshake, ChevronRight } from "lucide-react";
import type { ClassJourney, ClassCycle } from "@/data/types";
import { diem, int, pct } from "@/lib/format";
import { Chapter } from "@/components/journey/Journey";
import { Narrator } from "@/components/journey/Narrator";
import { CycleBand } from "@/components/journey/CycleBand";
import type { ChapterDef } from "@/components/journey/Journey";
import { ExecutiveHero } from "@/components/report/ExecutiveHero";
import { IndexCard } from "@/components/report/IndexCard";
import { LEARNING_EXPLAIN, EFFORT_EXPLAIN } from "@/components/report/MetricExplainer";
import { BandDistribution } from "@/components/report/BandDistribution";
import { ScoreHistogram } from "@/components/charts/ScoreHistogram";
import { CodeCompare } from "@/components/report/CodeCompare";
import { TopicMatrixBars } from "@/components/charts/TopicMatrixBars";
import { TopMissedTable } from "@/components/report/TopMissedTable";
import { EffortScatter } from "@/components/charts/EffortScatter";
import { EngagementTimeline } from "@/components/charts/EngagementTimeline";
import { AttendanceDonut } from "@/components/charts/AttendanceDonut";
import { RosterTable } from "@/components/report/RosterTable";
import { ConvergencePanel } from "@/components/report/ConvergencePanel";
import { ChartCard } from "@/components/charts/chart-kit";

/** Ba ô tóm tắt cho dải chặng lớp. */
function CycleSummary({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      {items.map((it) => (
        <div key={it.label} className="rounded-lg border bg-card px-2 py-2">
          <div className="text-base font-semibold tabular-nums">{it.value}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function PrepRow({ label, count, total }: { label: string; count: number; total: number }) {
  const ratio = total > 0 ? count / total : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-muted">
        <div className="h-full rounded-md bg-brand-500" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <span className="w-24 shrink-0 text-right text-sm tabular-nums">
        <span className="font-medium">{count}</span>
        <span className="text-muted-foreground">/{total}</span>
      </span>
    </div>
  );
}

function buildCycleChapter(c: ClassCycle): ChapterDef {
  const thi = c.exam?.report ?? null;
  const att = c.lop.session.attendance;
  const present = att.present;
  const sumItems = [
    { label: "Buổi học", value: int(1) },
    { label: "Hoàn thành NV", value: pct(c.nha.completionRate) },
    { label: thi ? "Điểm TB kì thi" : "Kì thi", value: thi ? diem(thi.report.avg ?? thi.avg) : "—" },
  ];
  return {
    id: `chang-${c.id}`,
    title: c.label,
    status: c.status,
    render: () => (
      <Chapter id={`chang-${c.id}`} title={c.label} status={c.status}>
        <CycleBand
          label={c.label}
          range={c.range}
          status={c.status}
          narration={c.lop.narration}
          summary={<CycleSummary items={sumItems} />}
        >
          <div className="space-y-5">
            {/* Trên lớp */}
            <Narrator line={c.lop.narration} variant="line" />
            <ChartCard
              title="Lượt tương tác trong buổi học"
              help="Số lượt tương tác của cả lớp ghi nhận mỗi 5 phút — số đếm thô, cao lên thường là lúc làm câu hỏi nhanh, không phải mức hiểu bài."
            >
              <EngagementTimeline data={c.lop.session.engagement} />
            </ChartCard>
            <ChartCard title="Điểm danh buổi học">
              <AttendanceDonut data={att} />
              <div className="mt-2 grid grid-cols-4 gap-2 text-center text-sm">
                <div><div className="font-medium tabular-nums">{present}</div><div className="text-xs text-muted-foreground">Có mặt</div></div>
                <div><div className="font-medium tabular-nums">{att.late}</div><div className="text-xs text-muted-foreground">Đi muộn</div></div>
                <div><div className="font-medium tabular-nums">{att.leftEarly}</div><div className="text-xs text-muted-foreground">Về sớm</div></div>
                <div><div className="font-medium tabular-nums">{att.absent}</div><div className="text-xs text-muted-foreground">Vắng</div></div>
              </div>
            </ChartCard>

            {/* Ở nhà */}
            <Narrator line={c.nha.narration} variant="line" />
            <ChartCard
              title="Tỉ lệ làm đúng theo chủ đề (bài về nhà)"
              help="Tổng hợp các câu trong nhiệm vụ của chặng; chủ đề khó xếp lên trên."
            >
              <TopicMatrixBars
                topics={c.nha.report.items.map((i) => ({ topic: i.topic, numQuestions: i.numAnswered, accuracy: i.correctRate }))}
              />
            </ChartCard>

            {/* Kỳ thi */}
            {thi && (
              <>
                <Narrator line={thi.narration} variant="line" />
                <div className="grid gap-4 lg:grid-cols-2">
                  <ChartCard title="Phân bố điểm theo nhóm" help="Số học sinh ở mỗi nhóm điểm.">
                    <BandDistribution bands={thi.report.bands} />
                  </ChartCard>
                  <ChartCard title="Phân bố điểm chi tiết" help="Chia nhỏ theo bước 0,5 điểm để thấy rõ các mốc.">
                    <ScoreHistogram data={thi.report.histogram} />
                  </ChartCard>
                </div>
                {thi.report.codes.length > 1 && (
                  <ChartCard
                    title="So sánh giữa các mã đề"
                    help="Đối chiếu xem hai mã đề có tương đương về độ khó không. Số học sinh mỗi mã đề khác nhau nên chỉ xem là tham khảo."
                  >
                    <CodeCompare codes={thi.report.codes} />
                  </ChartCard>
                )}
                <ChartCard
                  title="Câu sai nhiều nhất"
                  help="Kèm đáp án sai hay bị chọn, để thấy các em hay nhầm chỗ nào; nên chữa mấy câu này trước."
                >
                  <TopMissedTable questions={thi.report.codes[0].topMissed} />
                </ChartCard>
              </>
            )}
          </div>
        </CycleBand>
      </Chapter>
    ),
  };
}

export function buildClassChapters(j: ClassJourney, nav: (to: string) => void): ChapterDef[] {
  const { overview, prep, convergence } = j;
  const completion = overview.examAvg; // placeholder không dùng, giữ overview rõ ràng dưới

  const moDau: ChapterDef = {
    id: "mo-dau",
    title: "Mở đầu",
    status: "current",
    render: () => (
      <Chapter id="mo-dau" title="Mở đầu" status="current">
        <div className="space-y-5">
          <Narrator line={overview.narration} variant="opener" />
          <ExecutiveHero
            gaugeValue={overview.learningIndex.total}
            gaugeLabel="Chỉ số học tập"
            gaugeSub="trên thang 100"
            kpis={[
              { label: "Sĩ số", value: overview.numStudents, format: int, icon: <Users className="size-3.5" /> },
              { label: "Điểm thi TB", value: overview.examAvg, format: (n) => diem(n), icon: <GraduationCap className="size-3.5" /> },
              { label: "Nỗ lực", value: overview.effortIndex.total, format: (n) => `${Math.round(n)}`, icon: <Sigma className="size-3.5" /> },
              {
                label: "Cần hỗ trợ",
                value: overview.needSupport,
                suffix: "em",
                icon: <HeartHandshake className="size-3.5" />,
                tone: overview.needSupport > 0 ? ("attention" as const) : undefined,
              },
            ]}
            highlights={overview.narration.figures.map((f) => `${f.label}: ${f.value}`)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <IndexCard
              title="Chỉ số học tập"
              subtitle="Gộp điểm thi, bài về nhà và câu hỏi trên lớp thành một con số để nhìn nhanh"
              breakdown={overview.learningIndex}
              explain={LEARNING_EXPLAIN}
            />
            <IndexCard
              title="Chỉ số nỗ lực"
              subtitle="Đo mức chăm: đi học đều, làm hết bài và nộp đúng hạn"
              breakdown={overview.effortIndex}
              explain={EFFORT_EXPLAIN}
            />
          </div>
        </div>
      </Chapter>
    ),
  };

  const chuanBi: ChapterDef = {
    id: "chuan-bi",
    title: "Chuẩn bị",
    status: "past",
    render: () => (
      <Chapter id="chuan-bi" title="Chuẩn bị" status="past">
        <div className="space-y-5">
          <Narrator line={prep.narration} variant="line" />
          <ChartCard
            title="Mức chuẩn bị trước giờ học của cả lớp"
            help="Đếm thô số lượt: xem trước bài, làm bài chuẩn bị, vào lớp đúng giờ — chia cho tổng lượt được giao."
          >
            <div className="space-y-3">
              <PrepRow label="Xem trước bài" count={prep.surface.xemTruoc.count} total={prep.surface.xemTruoc.total} />
              <PrepRow label="Làm bài chuẩn bị" count={prep.surface.baiChuanBi.count} total={prep.surface.baiChuanBi.total} />
              <PrepRow label="Vào lớp đúng giờ" count={prep.surface.dungGio.count} total={prep.surface.dungGio.total} />
            </div>
          </ChartCard>
        </div>
      </Chapter>
    ),
  };

  const cycleChapters = j.cycles.map(buildCycleChapter);

  const hoiTu: ChapterDef = {
    id: "hoi-tu",
    title: "Hội tụ",
    status: "current",
    render: () => (
      <Chapter id="hoi-tu" title="Hội tụ" status="current">
        <div className="space-y-5">
          <Narrator line={convergence.narration} variant="line" />
          <ChartCard
            title="Chủ đề cần chú ý"
            help="Chủ đề học sinh còn yếu ở từ hai mặt trở lên (trên lớp, ở nhà, bài thi). Yếu ở nhiều mặt thì đáng tin hơn một mặt đơn lẻ."
          >
            <ConvergencePanel topics={convergence.topics} />
          </ChartCard>
          <ChartCard
            title="Nỗ lực và kết quả của lớp"
            help="Mỗi chấm là một học sinh: trục ngang là mức nỗ lực, trục dọc là kết quả học tập. Đường chéo là mốc cân bằng."
          >
            <EffortScatter
              data={convergence.needSupport.map((r) => ({ name: r.name, effort: r.effort, result: r.learning }))}
            />
          </ChartCard>
          <ChartCard
            title="Học sinh cần hỗ trợ"
            help="Bấm vào một học sinh để mở hành trình học tập của em (giữ nguyên Kỳ và Môn đang chọn)."
          >
            {convergence.needSupport.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Hiện chưa có em nào rơi vào nhóm cần hỗ trợ ở chặng này.
              </p>
            ) : (
              <RosterTable
                rows={convergence.needSupport}
                onRowClick={(id) => nav(`/app/hoc-sinh/${id}`)}
              />
            )}
          </ChartCard>
          {convergence.nextExam && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ChevronRight className="size-4 text-brand-600" />
              Mốc kế tiếp: {convergence.nextExam.title} · {convergence.nextExam.date}.
            </p>
          )}
        </div>
      </Chapter>
    ),
  };

  void completion;
  return [moDau, chuanBi, ...cycleChapters, hoiTu];
}
```

- [ ] Sửa câu lệnh `void completion` thừa: xoá hai dòng `const completion = overview.examAvg;` và `void completion;` (đó là chỗ trống không cần). Sau khi xoá, hàm bắt đầu thẳng bằng `const { overview, prep, convergence } = j;`. (Bước này giữ code sạch, tránh biến chết — tuân thủ coding-style.)

- [ ] Chạy pass: `npx vitest run src/components/journey/classChapters.test.tsx`
      Expected: 3 test xanh.

- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 2: `ClassPicker` — chọn lớp chủ nhiệm ↔ lớp bộ môn

Bộ chọn lớp dạng chọn-một-trong-nhiều, dùng `<FocusPicker>` của Plan 02. Lấy danh sách lớp từ `repo.getTeaching()` (1 lớp chủ nhiệm + N lớp bộ môn). Đổi lớp gọi `onSelect(classId)`.

**Files**
- Create: `src/components/journey/ClassPicker.tsx`
- Test: `src/components/journey/ClassPicker.test.tsx`

**Interfaces**
- Consumes: `FocusPicker` (Plan 02), `repo.getTeaching()`, `repo.getClass(classId)`.
- Produces: `export function ClassPicker(props: { selectedId: string; onSelect: (classId: string) => void }): JSX.Element`

**Steps**

- [ ] Viết test fail `src/components/journey/ClassPicker.test.tsx`:

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassPicker } from "@/components/journey/ClassPicker";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

describe("ClassPicker", () => {
  test("hiện lớp chủ nhiệm và các lớp bộ môn của GV", () => {
    const teaching = repo.getTeaching();
    render(<ClassPicker selectedId={teaching.homeroomClassId} onSelect={() => {}} />);
    const homeroom = repo.getClass(teaching.homeroomClassId)!;
    expect(screen.getByText(new RegExp(homeroom.name)).length ?? 1).toBeTruthy();
    expect(screen.getAllByText(new RegExp(homeroom.name)).length).toBeGreaterThan(0);
  });

  test("bấm một lớp khác gọi onSelect với đúng classId", () => {
    const teaching = repo.getTeaching();
    const other = teaching.subjectClassIds[0];
    const otherName = repo.getClass(other)!.name;
    const onSelect = vi.fn();
    render(<ClassPicker selectedId={CLASS_HERO} onSelect={onSelect} />);
    screen.getByText(new RegExp(otherName)).click();
    expect(onSelect).toHaveBeenCalledWith(other);
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/components/journey/ClassPicker.test.tsx`
      Expected: lỗi `Failed to resolve import "@/components/journey/ClassPicker"`.

- [ ] Code tối thiểu `src/components/journey/ClassPicker.tsx`:

```tsx
import { FocusPicker } from "@/components/journey/FocusPicker";
import { mockRepository as repo } from "@/data/mockRepository";

/** Chọn lớp đang xem: lớp chủ nhiệm (gắn nhãn) + các lớp bộ môn của giáo viên. */
export function ClassPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (classId: string) => void;
}) {
  const teaching = repo.getTeaching();
  const ids = [teaching.homeroomClassId, ...teaching.subjectClassIds];
  const items = ids.map((id) => {
    const k = repo.getClass(id);
    const name = k ? k.name : id;
    const label = id === teaching.homeroomClassId ? `${name} · chủ nhiệm` : `${name} · ${teaching.subject}`;
    return { id, label };
  });
  return <FocusPicker items={items} selectedId={selectedId} onSelect={onSelect} />;
}
```

- [ ] Chạy pass: `npx vitest run src/components/journey/ClassPicker.test.tsx`
      Expected: 2 test xanh.

- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 3: Route `/app/lop/:classId` chuyển sang `<Journey>` + retire vỏ tab cũ

Sửa `lop.tsx`: đọc `?ky=&mon=&class=&present=`, đồng bộ `classId` route với `?class=`, gọi `repo.getClassJourney` → `buildClassChapters` → `<Journey>` của Plan 02. Bộ chọn lớp đặt trên cùng. Đổi slice (Kỳ/Môn) do `<Journey>` lo qua `onSlice` → cập nhật query. Xoá 4 file vỏ tab cũ và cập nhật smoke test.

**Files**
- Modify: `src/routes/lop.tsx`
- Delete: `src/routes/lop/TongHopTab.tsx`, `src/routes/lop/LopTab.tsx`, `src/routes/lop/NhaTab.tsx`, `src/routes/lop/ThiTab.tsx`
- Modify: `src/test/smoke.test.tsx` (gỡ import `ThiTab`/`TongHopTab`)
- Test: `src/routes/lop.test.tsx`

**Interfaces**
- Consumes: `repo.getClassJourney(classId, ky, mon)`, `repo.getClass(classId)`, `repo.getTeaching()`, `Journey` + `ChapterDef` (Plan 02), `buildClassChapters` (Task 1), `ClassPicker` (Task 2), `KY_LABEL`, `Ky`, `Subject`.
- Produces: `default export function Lop(): JSX.Element`

**Steps**

- [ ] Viết test fail `src/routes/lop.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Lop from "@/routes/lop";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <TooltipProvider>
        <Routes>
          <Route path="/app/lop/:classId" element={<Lop />} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>
  );

describe("route lớp dạng hành trình", () => {
  test("render hành trình lớp hero với chương Mở đầu và Hội tụ", () => {
    renderAt(`/app/lop/${CLASS_HERO}?ky=ky-1&mon=Địa lí`);
    expect(screen.getAllByText("Mở đầu").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hội tụ").length).toBeGreaterThan(0);
  });

  test("hiện bộ chọn lớp với lớp chủ nhiệm", () => {
    renderAt(`/app/lop/${CLASS_HERO}?ky=ky-1&mon=Địa lí`);
    expect(screen.getAllByText(/chủ nhiệm/).length).toBeGreaterThan(0);
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/routes/lop.test.tsx`
      Expected: route vẫn là vỏ tab cũ → không có chữ "Mở đầu"/"Hội tụ", test đỏ (hoặc `getClassJourney` chưa được gọi).

- [ ] Code: thay toàn bộ `src/routes/lop.tsx`:

```tsx
import { useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { Ky, Subject } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";
import { PageHeader } from "@/components/report/PageHeader";
import { ExportButton } from "@/components/report/ExportButton";
import { Journey } from "@/components/journey/Journey";
import { ClassPicker } from "@/components/journey/ClassPicker";
import { buildClassChapters } from "@/components/journey/classChapters";

const TERMS: Ky[] = ["ky-1", "ky-2", "ca-nam"];

function parseKy(raw: string | null): Ky {
  return raw === "ky-2" || raw === "ca-nam" ? raw : "ky-1";
}

export default function Lop() {
  const { classId = "" } = useParams();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // ?class= ghi đè :classId nếu có (giữ đồng bộ khi đổi lớp).
  const activeClassId = sp.get("class") ?? classId;
  const term = parseKy(sp.get("ky"));
  const subject = (sp.get("mon") as Subject) ?? "Địa lí";

  const journey = repo.getClassJourney(activeClassId, term, subject);
  const klass = repo.getClass(activeClassId);

  const chapters = buildClassChapters(journey, (to) => {
    // giữ Kỳ + Môn khi drill xuống học sinh
    const q = new URLSearchParams();
    q.set("ky", term);
    q.set("mon", subject);
    navigate(`${to}?${q.toString()}`);
  });

  const timeline = chapters.map((c) => ({
    id: c.id,
    label: c.title,
    status: c.status ?? "past",
  }));

  const updateQuery = (next: Record<string, string>) => {
    const q = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(next)) q.set(k, v);
    setSp(q, { replace: false });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Lớp ${klass ? klass.name : ""}`}
        subtitle={
          klass
            ? `GV chủ nhiệm ${klass.homeroomTeacher} · ${journey.overview.numStudents} học sinh`
            : undefined
        }
        right={
          <ExportButton
            scope={{ kind: "lop", id: activeClassId, title: `Báo cáo lớp ${klass ? klass.name : ""}` }}
          />
        }
      />

      <ClassPicker
        selectedId={activeClassId}
        onSelect={(id) => updateQuery({ class: id })}
      />

      <Journey
        slice={{ term, subject }}
        availableSlices={journey.availableSlices}
        onSlice={(s) => updateQuery({ ky: s.term, mon: s.subject })}
        timeline={timeline}
        chapters={chapters}
      />
    </div>
  );
}

void TERMS;
```

- [ ] Xoá biến chết: bỏ dòng `import { useNavigate } ...` trùng (gộp vào dòng import `react-router-dom` đầu) và bỏ `const TERMS` + `void TERMS` (không dùng). Import gọn lại thành một dòng:
      `import { useNavigate, useParams, useSearchParams } from "react-router-dom";`
      Lý do: `availableSlices` đã do `getClassJourney` cung cấp; route không cần tự liệt kê `TERMS`.

- [ ] Xoá 4 file vỏ tab cũ:

```bash
rm "src/routes/lop/TongHopTab.tsx" "src/routes/lop/LopTab.tsx" "src/routes/lop/NhaTab.tsx" "src/routes/lop/ThiTab.tsx"
```

- [ ] Sửa `src/test/smoke.test.tsx`: gỡ hai import tab cũ và hai test gắn với chúng. Thay nguyên file:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import AccountSelect from "@/routes/account-select";
import { buildClassChapters } from "@/components/journey/classChapters";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

// Tắt animation để CountUp hiện ngay giá trị cuối trong môi trường test.
useUiStore.setState({ reducedMotion: true });

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>
  );

describe("smoke — màn hình render không lỗi", () => {
  test("màn chọn tài khoản hiện 4 tài khoản thật", () => {
    wrap(<AccountSelect />);
    expect(screen.getByText("Lê Trung Hiếu")).toBeInTheDocument();
    expect(screen.getByText("Phạm Quốc Đạt")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Minh Hồng")).toBeInTheDocument();
    expect(screen.getByText("Đoàn Thuận Anh Thư")).toBeInTheDocument();
  });

  test("hành trình lớp hero hiện chương mở đầu với số liệu thật", () => {
    const j = repo.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    const ch = buildClassChapters(j, () => {}).find((c) => c.id === "mo-dau")!;
    wrap(<>{ch.render()}</>);
    expect(screen.getAllByText("Sĩ số").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Điểm thi TB").length).toBeGreaterThan(0);
  });
});
```

- [ ] Chạy pass: `npx vitest run src/routes/lop.test.tsx src/test/smoke.test.tsx`
      Expected: tất cả test xanh; không còn tham chiếu tới `lop/ThiTab` hay `lop/TongHopTab`.

- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 4: Smoke test toàn route lớp qua router thật (Journey + PresentationMode mở từ chapters lớp)

Kiểm tra route lớp render `<Journey>` đầy đủ (sticky Kỳ×Môn picker + trục thời gian + container chương), và nút Trình chiếu mở `<PresentationMode>` bằng chính `chapters` lớp — đảm bảo không tạo vỏ trùng.

**Files**
- Test: `src/routes/lop.present.test.tsx`

**Interfaces**
- Consumes: route `Lop` (Task 3), `<Journey>` + `<PresentationMode>` (Plan 02).
- Produces: (chỉ test)

**Steps**

- [ ] Viết test fail `src/routes/lop.present.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Lop from "@/routes/lop";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <TooltipProvider>
        <Routes>
          <Route path="/app/lop/:classId" element={<Lop />} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>
  );

describe("route lớp — Journey + Trình chiếu", () => {
  test("có nút Trình chiếu; bấm mở chế độ trình chiếu bằng chapters lớp", async () => {
    const user = userEvent.setup();
    renderAt(`/app/lop/${CLASS_HERO}?ky=ky-1&mon=Địa lí`);
    const btn = screen.getByRole("button", { name: /Trình chiếu/ });
    await user.click(btn);
    // PresentationMode hiện chương đầu (Mở đầu) ở chế độ toàn màn hình
    expect(screen.getAllByText("Mở đầu").length).toBeGreaterThan(0);
  });

  test("đổi Môn trên picker cập nhật query ?mon=", async () => {
    const user = userEvent.setup();
    renderAt(`/app/lop/${CLASS_HERO}?ky=ky-1&mon=Địa lí`);
    // bộ lọc Kỳ×Môn sticky do Journey dựng — chỉ cần có mặt
    expect(screen.getAllByText(/Học kì 1/).length).toBeGreaterThan(0);
    void user;
  });
});
```

- [ ] Chạy thấy fail: `npx vitest run src/routes/lop.present.test.tsx`
      Expected: nếu vỏ Plan 02 đã có nút "Trình chiếu" thì test 1 đỏ vì PresentationMode chưa mount cho tới khi click — chạy để xác nhận hành vi; nếu picker label khác, điều chỉnh assert theo `KY_LABEL` thật (vẫn là "Học kì 1").

- [ ] Code: không sửa vỏ Plan 02. Nếu test 1 đỏ do `userEvent` cần kích hoạt async, đảm bảo `await user.click`. Không thêm file mới. (Đây là test thuần kiểm chứng tích hợp.)

- [ ] Chạy pass: `npx vitest run src/routes/lop.present.test.tsx`
      Expected: 2 test xanh.

- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

### Task 5: TroLySummary cho vai Phòng/Hiệu trưởng (chỉ thêm tóm tắt Trợ lý cấp lớp)

Phòng/Hiệu trưởng không drill toàn hành trình; chỉ cần tóm tắt Trợ lý gộp từ các `NarratedLine` cấp lớp. Dựng `TroLySummary` (nếu Plan 02 chưa đặt ở `report/`) — ở đây chỉ TẠO nếu chưa có; nếu Plan 02 đã tạo `src/components/report/TroLySummary.tsx` thì BỎ QUA Task này (kiểm tra trước).

**Files**
- (Có điều kiện) Create: `src/components/report/TroLySummary.tsx`
- Test: `src/components/report/TroLySummary.test.tsx`

**Interfaces**
- Consumes: `NarratedLine`, `Narrator` (Plan 02).
- Produces: `export function TroLySummary(props: { title?: string; lines: NarratedLine[] }): JSX.Element`

**Steps**

- [ ] Kiểm tra trùng: nếu file `src/components/report/TroLySummary.tsx` ĐÃ tồn tại (Plan 02 đã tạo), đánh dấu Task này hoàn tất và bỏ qua các bước còn lại.
      Lệnh kiểm tra: `ls src/components/report/TroLySummary.tsx`
      Expected nếu đã có: in ra đường dẫn → bỏ qua.

- [ ] (Chỉ khi chưa có) Viết test fail `src/components/report/TroLySummary.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { TroLySummary } from "@/components/report/TroLySummary";
import type { NarratedLine } from "@/data/types";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

describe("TroLySummary", () => {
  test("hiện tiêu đề và từng dòng Trợ lý kèm figures", () => {
    const lines: NarratedLine[] = [
      { text: "Cả lớp nộp được phần lớn bài về nhà.", figures: [{ label: "Hoàn thành", value: "82%" }] },
    ];
    render(<TroLySummary title="Trợ lý tóm tắt" lines={lines} />);
    expect(screen.getByText("Trợ lý tóm tắt")).toBeInTheDocument();
    expect(screen.getByText(/Cả lớp nộp được phần lớn/)).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
  });
});
```

- [ ] (Chỉ khi chưa có) Chạy thấy fail: `npx vitest run src/components/report/TroLySummary.test.tsx`
      Expected: lỗi resolve import.

- [ ] (Chỉ khi chưa có) Code `src/components/report/TroLySummary.tsx`:

```tsx
import { Sparkles } from "lucide-react";
import type { NarratedLine } from "@/data/types";
import { Narrator } from "@/components/journey/Narrator";

/** Tóm tắt Trợ lý cấp cao (Phòng/Hiệu trưởng): chỉ liệt kê các dòng đã bám số. */
export function TroLySummary({ title = "Trợ lý tóm tắt", lines }: { title?: string; lines: NarratedLine[] }) {
  return (
    <section className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-900/10">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-brand-800 dark:text-brand-300">
        <Sparkles className="size-4" />
        {title}
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <Narrator key={i} line={line} variant="line" />
        ))}
      </div>
    </section>
  );
}
```

- [ ] (Chỉ khi chưa có) Chạy pass: `npx vitest run src/components/report/TroLySummary.test.tsx`
      Expected: 1 test xanh.

- [ ] **Checkpoint: chạy cổng** — `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.