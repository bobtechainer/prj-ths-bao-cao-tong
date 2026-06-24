# Vai trò trên + Xuất + Hoàn thiện Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Thực thi từng Task theo đúng thứ tự, mỗi Step là một checkbox (- [ ]) phải tick xong trước khi sang Step kế. Viết test FAIL trước, chạy thấy FAIL, viết code tối thiểu, chạy PASS, rồi "Checkpoint: chạy cổng". Không bỏ qua checkpoint.

## Goal
Hoàn thiện vai trò Phòng/Hiệu trưởng (chỉ thêm tóm tắt Trợ lý bám số — KHÔNG dựng full hành trình), nâng cấp xuất PDF in hành trình dạng dài (bung hết chặng, ẩn picker/PresentationMode khi in, tái dùng cơ chế rasterize `.report-page`), giữ nguyên Excel, và dọn dẹp mã mồ côi (DistractorBar, import Confetti chưa dùng, chữ "demo"). Cổng cuối phải xanh.

## Architecture
- `TroLySummary` là một block thuần hiển thị danh sách `NarratedLine` (text + figures cạnh nhau), gắn vào đầu `phong.tsx` và `truong.tsx`. Nội dung do route tự dựng bằng `narrate.ts` (Plan 01) từ số liệu sẵn có trên trang — KHÔNG gọi `getStudentJourney/getClassJourney`.
- PDF: mở rộng `ReportDocument` thêm hai nhánh in dạng dài cho `kind:"hoc-sinh"` và `kind:"lop"` dựa trên `StudentJourney`/`ClassJourney` (Plan 01). Mỗi chặng là một (hoặc vài) `.report-page` đầy đủ — không có picker, không có nút Trình chiếu, không scroll-snap (DOM in tĩnh, tách biệt với `Journey` trên màn hình). `pdf.ts` giữ nguyên cơ chế render offscreen + rasterize từng `.report-page`.
- Excel (`src/lib/export/excel.ts`) GIỮ NGUYÊN, không đụng.
- Dọn: gỡ `DistractorBar.tsx` (mồ côi), gỡ mọi import `Confetti` không dùng, quét toàn `src/` đảm bảo không còn chữ "demo".

## Tech Stack
Vite7 + React19 + TS + Tailwind4 + shadcn/Radix + Recharts3 + framer-motion12 + React Router 7 + Zustand(+immer) + Vitest. Alias `@` = `src`. Root: `c:/Trường học số - source code/prj-ths-bao-cao-tong/`. KHÔNG phải git repo.

## Global Constraints
- Chỉ token MobiFone qua biến CSS / lớp Tailwind (brand/warning/success/error/blue-light/indigo). KHÔNG hex thô trong UI Tailwind. Riêng `ReportDocument.tsx` là DOM in tĩnh đã dùng hằng màu nội bộ (`INK`,`MUTED`,`BRAND`,`NAVY`,`LINE`,`#F1F5F9`); CHỈ tái dùng các hằng/màu ĐÃ CÓ ở đó, TUYỆT ĐỐI KHÔNG thêm hex mới (không `#F8FAFC` hay hex lạ).
- Font Be Vietnam Pro. Câu chữ theo skill "humanized" (giọng giáo viên, không sáo rỗng, không "AI phân tích cho thấy"). KHÔNG dùng chữ "demo/minh hoạ".
- Dẫn chứng số liệu: chỉ bịa SỐ THÔ (đếm buổi/lượt/điểm). Mọi tỉ lệ/chỉ số hiển thị phải truy input→output. MỖI câu Trợ lý (NarratedLine) phải mang figures hiển thị ngay cạnh.
- Mọi chuyển động tôn trọng prefers-reduced-motion (đã có hook `useReduced()` + `reducedMotion` trong uiStore).
- Cổng phải xanh: `npx tsc --noEmit`; `npx vitest run`; `npx vite build`.

---

## ⚠️ Sửa bắt buộc (review) — đọc trước khi code

1. **Plan 04 là CHỦ SỞ HỮU DUY NHẤT của `src/components/report/TroLySummary.tsx`** (Task 1). Plan 03 đã bỏ Task tạo file này. Title mặc định: "Trợ lý tóm tắt".
2. **`ClassCyclePage` (Task 5):** `s.attendance` là `AttendanceBreakdown` (object), `s.engagement` là `EngagementPoint[]` (mảng) — KHÔNG truyền thẳng vào `int`/`pct`. Dùng `int(s.attendance.present)` và `pct(s.attendance.present / (s.attendance.present + s.attendance.absent))` (code mẫu Task 5 đã sửa theo đây).
3. **Lát in PDF** cố định `term:"ca-nam", subject:"Địa lí"` là CHỦ Ý (bản tổng năm), không nhất thiết khớp lát đang xem trên màn hình. Xem [index](2026-06-24-hanh-trinh-00-index.md).

---

### Task 1: TroLySummary — block tóm tắt Trợ lý bám số

**Files**
- Create: `src/components/report/TroLySummary.tsx`
- Test: `src/components/report/__tests__/TroLySummary.test.tsx`

**Interfaces**
- Consumes: `NarratedLine` từ `@/data/types` (Plan 01 đã thêm `export interface NarratedLine { text:string; figures:{label:string;value:string}[] }`).
- Produces: `export function TroLySummary({ lines, title }: { lines: NarratedLine[]; title?: string }): JSX.Element`.

Steps:

- [ ] Viết test FAIL `src/components/report/__tests__/TroLySummary.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { TroLySummary } from "@/components/report/TroLySummary";
import type { NarratedLine } from "@/data/types";

const lines: NarratedLine[] = [
  { text: "Toàn ngành nộp được phần lớn bài về nhà.", figures: [{ label: "Hoàn thành", value: "88%" }] },
  { text: "Một trường còn nhiều em cần hỗ trợ.", figures: [{ label: "Cần hỗ trợ", value: "12%" }] },
];

describe("TroLySummary", () => {
  test("hiện tiêu đề mặc định, từng câu kèm figure cạnh nhau", () => {
    render(<TroLySummary lines={lines} />);
    expect(screen.getByText("Trợ lý tổng hợp")).toBeInTheDocument();
    expect(screen.getByText(/Toàn ngành nộp được/)).toBeInTheDocument();
    expect(screen.getByText("Hoàn thành")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText("Cần hỗ trợ")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  test("dùng tiêu đề tùy biến và bỏ qua khi không có dòng nào", () => {
    const { container, rerender } = render(<TroLySummary lines={lines} title="Trợ lý nói nhanh" />);
    expect(screen.getByText("Trợ lý nói nhanh")).toBeInTheDocument();
    rerender(<TroLySummary lines={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] Chạy thấy FAIL: `cd "c:/Trường học số - source code/prj-ths-bao-cao-tong" && npx vitest run src/components/report/__tests__/TroLySummary.test.tsx`. Expected: fail vì `Cannot find module '@/components/report/TroLySummary'`.

- [ ] Viết code tối thiểu `src/components/report/TroLySummary.tsx`:

```tsx
import { Sparkles } from "lucide-react";
import type { NarratedLine } from "@/data/types";
import { Reveal } from "@/components/motion";

interface TroLySummaryProps {
  lines: NarratedLine[];
  title?: string;
}

export function TroLySummary({ lines, title = "Trợ lý tổng hợp" }: TroLySummaryProps) {
  if (lines.length === 0) return null;
  return (
    <Reveal>
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-700">
          <Sparkles className="size-4" />
          {title}
        </div>
        <ul className="space-y-2.5">
          {lines.map((line, i) => (
            <li key={i} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <span className="text-sm leading-relaxed text-foreground">{line.text}</span>
              {line.figures.length > 0 && (
                <span className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                  {line.figures.map((f, j) => (
                    <span
                      key={j}
                      className="inline-flex items-baseline gap-1 rounded-md bg-white px-2 py-0.5 text-xs ring-1 ring-brand-100"
                    >
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-semibold tabular-nums text-brand-700">{f.value}</span>
                    </span>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
```

- [ ] Chạy PASS: `npx vitest run src/components/report/__tests__/TroLySummary.test.tsx`. Expected: 2 passed.

- [ ] Checkpoint: chạy cổng — `npx tsc --noEmit` && `npx vitest run` && `npx vite build` (đều xanh).

---

### Task 2: Gắn TroLySummary vào phong.tsx (bám số toàn ngành)

**Files**
- Modify: `src/routes/phong.tsx`
- Test: `src/routes/__tests__/phong-troly.test.tsx`

**Interfaces**
- Consumes: `narrateClassOverview`/`narrate*` KHÔNG dùng ở đây — Phòng dựng `NarratedLine` trực tiếp từ KPI sẵn có (`o.kpis`, `o.rows`). Dùng `pct`,`diem` từ `@/lib/format`.
- Produces: route `phong` render `<TroLySummary>` ngay dưới `<ExecutiveHero>`.

> Lý do dựng `NarratedLine` thủ công thay vì gọi `narrate.ts`: các hàm trong `narrate.ts` (Plan 01) nhận `StudentJourney`/`ClassJourney`/`PrepSurface`, không có hàm cho cấp Phòng/Trường tổng hợp. Phòng/Hiệu trưởng "chỉ thêm tóm tắt", nên dựng line cục bộ là đúng phạm vi. Mỗi line VẪN mang figures bám số thô.

Steps:

- [ ] Viết test FAIL `src/routes/__tests__/phong-troly.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Phong from "@/routes/phong";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

describe("Phong — tóm tắt Trợ lý", () => {
  test("hiện block Trợ lý tổng hợp với figure phần trăm", () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <Phong />
        </TooltipProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("Trợ lý tổng hợp")).toBeInTheDocument();
    // có ít nhất một figure tỉ lệ hoàn thành nhiệm vụ
    expect(screen.getByText("Hoàn thành NV")).toBeInTheDocument();
  });
});
```

- [ ] Chạy thấy FAIL: `npx vitest run src/routes/__tests__/phong-troly.test.tsx`. Expected: fail vì chưa render "Trợ lý tổng hợp".

- [ ] Sửa `src/routes/phong.tsx`. Thêm import:

```tsx
import { TroLySummary } from "@/components/report/TroLySummary";
import type { NarratedLine } from "@/data/types";
```

Ngay sau khối tính `highlights` (trước `return (`), thêm các dòng Trợ lý bám số:

```tsx
  const troLyLines: NarratedLine[] = [
    {
      text: `${bestSchool.schoolName} đang dẫn đầu toàn Phòng về kết quả thi.`,
      figures: [{ label: "Điểm thi TB", value: diem(bestSchool.examAvg) }],
    },
    {
      text: "Trung bình toàn ngành, học sinh đã nộp được phần lớn bài về nhà được giao.",
      figures: [{ label: "Hoàn thành NV", value: pct(o.kpis.completionRate) }],
    },
    {
      text: `${needSchool.schoolName} có tỉ lệ học sinh cần hỗ trợ cao nhất — Phòng nên ghé sớm.`,
      figures: [{ label: "Cần hỗ trợ", value: pct(needSchool.needSupportPct) }],
    },
  ];
```

Trong JSX, ngay SAU `</ExecutiveHero>` (đóng thẻ ExecutiveHero) và TRƯỚC `<Reveal>` của ChartCard "So sánh các trường theo môn", chèn:

```tsx
      <TroLySummary lines={troLyLines} />
```

- [ ] Chạy PASS: `npx vitest run src/routes/__tests__/phong-troly.test.tsx`. Expected: 1 passed.

- [ ] Checkpoint: chạy cổng — `npx tsc --noEmit` && `npx vitest run` && `npx vite build` (đều xanh).

---

### Task 3: Gắn TroLySummary vào truong.tsx (bám số toàn trường)

**Files**
- Modify: `src/routes/truong.tsx`
- Test: `src/routes/__tests__/truong-troly.test.tsx`

**Interfaces**
- Consumes: `r.kpis`, `r.weakTopics`, `classAvgs`/`best`/`weakNames` sẵn có trong route. `diem`,`pct` từ `@/lib/format`, `NarratedLine` từ `@/data/types`.
- Produces: route `truong` render `<TroLySummary>` ngay dưới `<ExecutiveHero>`.

Steps:

- [ ] Viết test FAIL `src/routes/__tests__/truong-troly.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Truong from "@/routes/truong";
import { SCHOOL_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

describe("Truong — tóm tắt Trợ lý", () => {
  test("hiện block Trợ lý tổng hợp với figure hoàn thành", () => {
    render(
      <MemoryRouter initialEntries={[`/app/truong/${SCHOOL_HERO}`]}>
        <TooltipProvider>
          <Routes>
            <Route path="/app/truong/:schoolId" element={<Truong />} />
          </Routes>
        </TooltipProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("Trợ lý tổng hợp")).toBeInTheDocument();
    expect(screen.getByText("Hoàn thành NV")).toBeInTheDocument();
  });
});
```

- [ ] Chạy thấy FAIL: `npx vitest run src/routes/__tests__/truong-troly.test.tsx`. Expected: fail vì chưa render "Trợ lý tổng hợp".

- [ ] Sửa `src/routes/truong.tsx`. Thêm import:

```tsx
import { TroLySummary } from "@/components/report/TroLySummary";
import type { NarratedLine } from "@/data/types";
```

Ngay sau khối tính `highlights` (trước `return (`), thêm:

```tsx
  const troLyLines: NarratedLine[] = [
    {
      text: `Lớp ${best.name} đang có kết quả học tập tốt nhất trường.`,
      figures: [{ label: "Điểm TB", value: diem(best.avg) }],
    },
    {
      text: weakNames.length
        ? `Có chủ đề học sinh sai nhiều ở cả ba mặt — giáo viên bộ môn nên chữa kỹ lại: ${weakNames.join(", ")}.`
        : "Chưa có chủ đề nào học sinh sai nhiều ở cả ba mặt (trên lớp, ở nhà, bài thi).",
      figures: [{ label: "Chủ đề cần chú ý", value: String(weakNames.length) }],
    },
    {
      text: "Toàn trường đã nộp được phần lớn bài về nhà được giao.",
      figures: [{ label: "Hoàn thành NV", value: pct(r.kpis.completionRate) }],
    },
  ];
```

Trong JSX, ngay SAU `</ExecutiveHero>` và TRƯỚC `<Reveal>` của ChartCard "Điểm trung bình theo lớp và môn", chèn:

```tsx
      <TroLySummary lines={troLyLines} />
```

- [ ] Chạy PASS: `npx vitest run src/routes/__tests__/truong-troly.test.tsx`. Expected: 1 passed.

- [ ] Checkpoint: chạy cổng — `npx tsc --noEmit` && `npx vitest run` && `npx vite build` (đều xanh).

---

### Task 4: ReportDocument — nhánh in hành trình dạng dài cho học sinh

**Files**
- Modify: `src/components/report/ReportDocument.tsx`
- Test: `src/components/report/__tests__/ReportDocument-journey.test.tsx`

**Interfaces**
- Consumes: `repo.getStudentJourney(studentId, term, subject)` (Plan 01) trả `StudentJourney` với `overview.narration`, `prep.narration`, `cycles:StudentCycle[]`, `convergence.{topics,nextExam,narration}`. Dùng `diem`,`pct`,`int` từ `@/lib/format`. Dùng `KY_LABEL` từ `@/data/types`.
- Produces: thêm helper in `StudentJourneyPages({ j }: { j: StudentJourney })` và rẽ nhánh `kind:"hoc-sinh"` trong `ReportDocument` để in toàn hành trình (bung hết chặng) thay cho trang tóm tắt 1 trang hiện tại.

> Quy ước: DOM in này TĨNH, tách biệt với `Journey`/`PresentationMode` trên màn hình. KHÔNG render picker, nút Trình chiếu, scroll-snap. Mỗi chặng + phần Mở đầu/Chuẩn bị/Hội tụ là các `.report-page` riêng để `pdf.ts` rasterize. Chỉ tái dùng hằng màu đã có trong file (`INK`,`MUTED`,`BRAND`,`NAVY`,`LINE`,`#F1F5F9`,`#079455`,`#F04438`,`#FFA23A`,`#84CAF7`) — KHÔNG thêm hex mới. Slice in mặc định: `term:"ca-nam"`, `subject:"Địa lí"`.

Steps:

- [ ] Viết test FAIL `src/components/report/__tests__/ReportDocument-journey.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReportDocument } from "@/components/report/ReportDocument";
import { STUDENT_HERO } from "@/data/mock/world";

describe("ReportDocument — hành trình học sinh in dạng dài", () => {
  test("in nhiều trang hành trình, có Mở đầu / Chuẩn bị / Hội tụ và Trợ lý bám số", () => {
    const { container } = render(
      <MemoryRouter>
        <ReportDocument scope={{ kind: "hoc-sinh", id: STUDENT_HERO, title: "" }} />
      </MemoryRouter>
    );
    // mỗi chặng/phần là một .report-page; phải có nhiều hơn 2 trang
    expect(container.querySelectorAll(".report-page").length).toBeGreaterThan(2);
    expect(screen.getByText("Mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Chuẩn bị")).toBeInTheDocument();
    expect(screen.getByText("Hội tụ")).toBeInTheDocument();
    // Trợ lý phần tổng quan có ít nhất một figure
    expect(screen.getAllByText("Chỉ số học tập").length).toBeGreaterThan(0);
  });
});
```

- [ ] Chạy thấy FAIL: `npx vitest run src/components/report/__tests__/ReportDocument-journey.test.tsx`. Expected: fail — nhánh `hoc-sinh` hiện chỉ in 2 trang (Cover + 1 trang), không có "Hội tụ".

- [ ] Sửa `src/components/report/ReportDocument.tsx`.

Thêm import kiểu + label ở đầu file (cạnh import types hiện có):

```tsx
import type { ClassReport, ExamCodeReport, QuestionReport, StudentJourney, NarratedLine, StudentCycle } from "@/data/types";
import { KY_LABEL } from "@/data/types";
```

(thay dòng `import type { ClassReport, ExamCodeReport, QuestionReport } from "@/data/types";` hiện có bằng dòng trên; thêm dòng `import { KY_LABEL }` ngay sau.)

Thêm helper in Trợ lý (đặt sau `function H(...)`):

```tsx
function NarratorLine({ line }: { line: NarratedLine }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: "10px 12px", background: "#F1F5F9" }}>
      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: INK }}>{line.text}</div>
      {line.figures.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {line.figures.map((f, i) => (
            <span key={i} style={{ fontSize: 11, color: MUTED }}>
              {f.label}: <b style={{ color: NAVY }}>{f.value}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CycleHead({ label, range, status }: { label: string; range: { from: string; to: string }; status: string }) {
  const tag = status === "upcoming" ? "Sắp tới" : status === "current" ? "Đang diễn ra" : "Đã qua";
  const col = status === "upcoming" ? "#FFA23A" : status === "current" ? BRAND : MUTED;
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{label}</div>
      <div style={{ fontSize: 11, color: col, fontWeight: 600 }}>
        {tag} · {range.from} → {range.to}
      </div>
    </div>
  );
}
```

Thêm component in từng chặng học sinh + toàn hành trình (đặt trước `export function ReportDocument`):

```tsx
function StudentCyclePage({ c, idx }: { c: StudentCycle; idx: number }) {
  return (
    <Page footer={`Chặng ${idx}: ${c.label}`}>
      <CycleHead label={c.label} range={c.range} status={c.status} />

      <H>Trên lớp</H>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <Stat label="Chuyên cần" value={pct(c.lop.attendanceRate)} />
        <Stat label="Đúng quiz TB" value={pct(c.lop.quizAccuracyAvg)} />
        <Stat label="Số buổi" value={int(c.lop.sessions.length)} />
      </div>
      <NarratorLine line={c.lop.narration} />

      <H>Ở nhà</H>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <Stat label="Hoàn thành" value={pct(c.nha.completionRate)} />
        <Stat label="Đúng hạn" value={pct(c.nha.onTimeRate)} />
        <Stat label="Điểm TB" value={c.nha.avgScore == null ? "—" : diem(c.nha.avgScore)} />
      </div>
      <NarratorLine line={c.nha.narration} />

      {c.exam && (
        <>
          <H>Bài kiểm tra cuối chặng</H>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <Stat label="Điểm của em" value={diem(c.exam.score)} />
            <Stat label="TB lớp" value={diem(c.exam.classAvg)} />
            <Stat label="Mốc" value={c.exam.term} />
          </div>
          <NarratorLine line={c.exam.narration} />
        </>
      )}
    </Page>
  );
}

function StudentJourneyPages({ j }: { j: StudentJourney }) {
  return (
    <>
      <Page footer="Mở đầu">
        <H>Mở đầu</H>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <Stat label="Chỉ số học tập" value={`${j.overview.learningIndex.total}/100`} />
          <Stat label="Chỉ số nỗ lực" value={`${j.overview.effortIndex.total}/100`} />
          <Stat label="Hạng trong lớp" value={`${j.overview.rank}/${j.overview.classSize}`} />
        </div>
        <NarratorLine line={j.overview.narration} />

        <H>Chuẩn bị</H>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <Stat label="Xem trước" value={`${j.prep.surface.xemTruoc.count}/${j.prep.surface.xemTruoc.total}`} />
          <Stat label="Bài chuẩn bị" value={`${j.prep.surface.baiChuanBi.count}/${j.prep.surface.baiChuanBi.total}`} />
          <Stat label="Đúng giờ" value={`${j.prep.surface.dungGio.count}/${j.prep.surface.dungGio.total}`} />
        </div>
        <NarratorLine line={j.prep.narration} />
      </Page>

      {j.cycles.map((c, i) => (
        <StudentCyclePage key={c.id} c={c} idx={i + 1} />
      ))}

      <Page footer="Hội tụ">
        <H>Hội tụ</H>
        <NarratorLine line={j.convergence.narration} />
        <H>Chủ đề cần củng cố</H>
        <Bars
          rows={j.convergence.topics.map((t) => ({
            label: t.topic,
            pct: Math.round(t.accuracyAvg * 100),
            color: rate(t.accuracyAvg),
          }))}
        />
        {j.convergence.nextExam && (
          <div style={{ marginTop: 12, fontSize: 12.5, color: MUTED }}>
            Mốc tiếp theo: <b style={{ color: NAVY }}>{j.convergence.nextExam.title}</b> · {j.convergence.nextExam.date}
          </div>
        )}
      </Page>
    </>
  );
}
```

Thay TOÀN BỘ nhánh `if (scope.kind === "hoc-sinh") { ... }` hiện tại bằng:

```tsx
  if (scope.kind === "hoc-sinh") {
    const j = repo.getStudentJourney(scope.id, "ca-nam", "Địa lí");
    return (
      <>
        <Cover
          title={j.student.name}
          subtitle={`${j.className} · ${j.schoolName}`}
          term={`Hành trình ${KY_LABEL["ca-nam"]} · môn ${j.slice.subject} · 2025–2026`}
          ring={j.overview.learningIndex.total}
        />
        <StudentJourneyPages j={j} />
      </>
    );
  }
```

- [ ] Chạy PASS: `npx vitest run src/components/report/__tests__/ReportDocument-journey.test.tsx`. Expected: 1 passed.

- [ ] Checkpoint: chạy cổng — `npx tsc --noEmit` && `npx vitest run` && `npx vite build` (đều xanh).

---

### Task 5: ReportDocument — nhánh in hành trình dạng dài cho lớp

**Files**
- Modify: `src/components/report/ReportDocument.tsx`
- Test: `src/components/report/__tests__/ReportDocument-classjourney.test.tsx`

**Interfaces**
- Consumes: `repo.getClassJourney(classId, term, subject)` (Plan 01) trả `ClassJourney` với `overview.narration`, `prep.narration`, `cycles:ClassCycle[]` (mỗi cycle có `lop.session:SessionAnalytics`, `nha.report:HomeReport`+`completionRate`, `exam:{report:ExamReport,narration}|null`), `convergence.{topics,needSupport,nextExam,narration}`. Dùng `diem`,`pct`,`int`.
- Produces: helper `ClassJourneyPages({ j }: { j: ClassJourney })` + rẽ nhánh `kind:"lop"` trong `ReportDocument` in toàn hành trình lớp. GIỮ `ClassPages` cũ làm phần phụ lục số liệu thi cuối hành trình (bảng chi tiết HS) — KHÔNG xóa.

> Lưu ý: nhánh `lop` cũ render `<ClassPages r={...} />`. Ta giữ `ClassPages` (nó nhận `ClassReport`) bằng cách lấy `repo.getClassReport(scope.id)` cho phụ lục, đồng thời thêm các trang hành trình phía trước từ `ClassJourney`. KHÔNG thêm hex mới.

Steps:

- [ ] Viết test FAIL `src/components/report/__tests__/ReportDocument-classjourney.test.tsx`:

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReportDocument } from "@/components/report/ReportDocument";
import { CLASS_HERO } from "@/data/mock/world";

describe("ReportDocument — hành trình lớp in dạng dài", () => {
  test("in hành trình lớp (Mở đầu/Chuẩn bị/Hội tụ) + phụ lục chi tiết học sinh", () => {
    const { container } = render(
      <MemoryRouter>
        <ReportDocument scope={{ kind: "lop", id: CLASS_HERO, title: "" }} />
      </MemoryRouter>
    );
    expect(container.querySelectorAll(".report-page").length).toBeGreaterThan(3);
    expect(screen.getByText("Mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Chuẩn bị")).toBeInTheDocument();
    expect(screen.getByText("Hội tụ")).toBeInTheDocument();
    // phụ lục cũ vẫn còn
    expect(screen.getByText("Chi tiết học sinh")).toBeInTheDocument();
  });
});
```

- [ ] Chạy thấy FAIL: `npx vitest run src/components/report/__tests__/ReportDocument-classjourney.test.tsx`. Expected: fail — nhánh `lop` hiện không có "Mở đầu"/"Hội tụ".

- [ ] Sửa `src/components/report/ReportDocument.tsx`.

Cập nhật import kiểu (mở rộng dòng đã sửa ở Task 4):

```tsx
import type { ClassReport, ExamCodeReport, QuestionReport, StudentJourney, NarratedLine, StudentCycle, ClassJourney, ClassCycle } from "@/data/types";
```

Thêm component in từng chặng lớp + toàn hành trình lớp (đặt trước `export function ReportDocument`, sau `StudentJourneyPages`):

```tsx
function ClassCyclePage({ c, idx }: { c: ClassCycle; idx: number }) {
  const s = c.lop.session;
  return (
    <Page footer={`Chặng ${idx}: ${c.label}`}>
      <CycleHead label={c.label} range={c.range} status={c.status} />

      <H>Trên lớp</H>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <Stat label="Sĩ số có mặt" value={int(s.attendance.present)} />
        <Stat label="Chuyên cần" value={pct(s.attendance.present / (s.attendance.present + s.attendance.absent))} />
        <Stat label="Thời lượng" value={`${s.durationMin} phút`} />
      </div>
      <NarratorLine line={c.lop.narration} />

      <H>Ở nhà</H>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <Stat label="Hoàn thành" value={pct(c.nha.completionRate)} />
        <Stat label="Số nhiệm vụ" value={int(c.nha.report.missions.length)} />
        <Stat label="Học sinh" value={int(c.nha.report.students.length)} />
      </div>
      <NarratorLine line={c.nha.narration} />

      {c.exam && (
        <>
          <H>Bài kiểm tra cuối chặng — {c.exam.report.title}</H>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <Stat label="Điểm TB" value={diem(c.exam.report.avg)} />
            <Stat label="Trung vị" value={diem(c.exam.report.median)} />
            <Stat label="Số bài" value={int(c.exam.report.numStudents)} />
          </div>
          <NarratorLine line={c.exam.narration} />
        </>
      )}
    </Page>
  );
}

function ClassJourneyPages({ j }: { j: ClassJourney }) {
  return (
    <>
      <Page footer="Mở đầu">
        <H>Mở đầu</H>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <Stat label="Số học sinh" value={int(j.overview.numStudents)} />
          <Stat label="Điểm thi TB" value={diem(j.overview.examAvg)} />
          <Stat label="Chỉ số học tập" value={`${j.overview.learningIndex.total}/100`} />
          <Stat label="Cần hỗ trợ" value={int(j.overview.needSupport)} />
        </div>
        <NarratorLine line={j.overview.narration} />

        <H>Chuẩn bị</H>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <Stat label="Xem trước" value={`${j.prep.surface.xemTruoc.count}/${j.prep.surface.xemTruoc.total}`} />
          <Stat label="Bài chuẩn bị" value={`${j.prep.surface.baiChuanBi.count}/${j.prep.surface.baiChuanBi.total}`} />
          <Stat label="Đúng giờ" value={`${j.prep.surface.dungGio.count}/${j.prep.surface.dungGio.total}`} />
        </div>
        <NarratorLine line={j.prep.narration} />
      </Page>

      {j.cycles.map((c, i) => (
        <ClassCyclePage key={c.id} c={c} idx={i + 1} />
      ))}

      <Page footer="Hội tụ">
        <H>Hội tụ</H>
        <NarratorLine line={j.convergence.narration} />
        <H>Chủ đề cần củng cố toàn lớp</H>
        <Bars
          rows={j.convergence.topics.map((t) => ({
            label: t.topic,
            pct: Math.round(t.accuracyAvg * 100),
            color: rate(t.accuracyAvg),
          }))}
        />
        <H>Học sinh cần hỗ trợ</H>
        <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
          {j.convergence.needSupport.map((s) => s.name).join(", ") || "—"}
        </div>
        {j.convergence.nextExam && (
          <div style={{ marginTop: 12, fontSize: 12.5, color: MUTED }}>
            Mốc tiếp theo: <b style={{ color: NAVY }}>{j.convergence.nextExam.title}</b> · {j.convergence.nextExam.date}
          </div>
        )}
      </Page>
    </>
  );
}
```

Thay TOÀN BỘ nhánh `if (scope.kind === "lop") { ... }` hiện tại bằng:

```tsx
  if (scope.kind === "lop") {
    const j = repo.getClassJourney(scope.id, "ca-nam", "Địa lí");
    const r = repo.getClassReport(scope.id);
    const school = repo.getSchool(r.klass.schoolId)?.name ?? "";
    return (
      <>
        <Cover
          title={`Lớp ${j.klass.name}`}
          subtitle={school}
          term={`Hành trình ${KY_LABEL["ca-nam"]} · môn ${j.slice.subject} · 2025–2026`}
          ring={j.overview.learningIndex.total}
        />
        <ClassJourneyPages j={j} />
        <ClassPages r={r} />
      </>
    );
  }
```

- [ ] Chạy PASS: `npx vitest run src/components/report/__tests__/ReportDocument-classjourney.test.tsx`. Expected: 1 passed.

- [ ] Checkpoint: chạy cổng — `npx tsc --noEmit` && `npx vitest run` && `npx vite build` (đều xanh).

---

### Task 6: Đảm bảo PDF in hành trình bung hết chặng, ẩn picker/PresentationMode

**Files**
- Modify: `src/lib/export/pdf.ts`
- Test: `src/lib/export/__tests__/pdf-journey.test.ts`

**Interfaces**
- Consumes: `ReportDocument` (đã in hành trình ở Task 4/5). `pdf.ts` render offscreen + rasterize `.report-page`.
- Produces: `pdf.ts` chèn `id="report-root"` lên container offscreen (chuẩn hóa với cơ chế rasterize `#report-root`), bảo đảm KHÔNG có phần tử picker/Trình chiếu lọt vào DOM in. Vì `ReportDocument` (DOM in) hoàn toàn không render `Journey`/`KyMonPicker`/`PresentationMode`, việc "ẩn" được bảo đảm bằng kiến trúc — test xác nhận DOM in chỉ chứa `.report-page` và KHÔNG chứa các marker đó.

> `pdf.ts` hiện đã render `ReportDocument` offscreen rồi rasterize từng `.report-page`. Ta chỉ cần (a) gắn `id="report-root"` vào container để khớp mô tả "rasterize #report-root", và (b) tách hàm `buildPrintRoot` thuần để test khẳng định DOM in dài (nhiều `.report-page`) và sạch (không marker picker/present).

Steps:

- [ ] Viết test FAIL `src/lib/export/__tests__/pdf-journey.test.ts`:

```ts
import { describe, expect, test, afterEach } from "vitest";
import { buildPrintRoot } from "@/lib/export/pdf";

afterEach(() => {
  document.querySelectorAll("#report-root").forEach((n) => n.remove());
});

describe("pdf — DOM in hành trình dài và sạch", () => {
  test("học sinh: nhiều report-page, không lẫn picker / Trình chiếu", async () => {
    const { container, cleanup } = await buildPrintRoot({ kind: "hoc-sinh", id: "hs-le-trung-hieu", title: "" });
    expect(container.id).toBe("report-root");
    expect(container.querySelectorAll(".report-page").length).toBeGreaterThan(2);
    expect(container.querySelector('[data-journey-picker]')).toBeNull();
    expect(container.querySelector('[data-presentation]')).toBeNull();
    expect(container.textContent || "").not.toContain("Trình chiếu");
    cleanup();
    expect(document.getElementById("report-root")).toBeNull();
  });
});
```

- [ ] Chạy thấy FAIL: `npx vitest run src/lib/export/__tests__/pdf-journey.test.ts`. Expected: fail vì `pdf.ts` chưa export `buildPrintRoot`.

- [ ] Sửa `src/lib/export/pdf.ts` — tách `buildPrintRoot` và dùng lại trong `exportPdf`:

```ts
import { jsPDF } from "jspdf";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import { ReportDocument } from "@/components/report/ReportDocument";
import type { ExportScope } from "./exportService";

interface PrintRoot {
  container: HTMLDivElement;
  cleanup: () => void;
}

/**
 * Dựng DOM in offscreen cho một scope: container mang id="report-root", bên trong là
 * chuỗi .report-page tĩnh của ReportDocument (hành trình dạng dài, đã bung hết chặng).
 * KHÔNG render picker Kỳ×Môn, nút Trình chiếu hay PresentationMode — đó chỉ tồn tại trên
 * màn hình tương tác, không thuộc bản in.
 */
export async function buildPrintRoot(scope: ExportScope): Promise<PrintRoot> {
  const container = document.createElement("div");
  container.id = "report-root";
  container.style.cssText = "position:fixed; left:-10000px; top:0; width:794px; background:#ffffff; z-index:-1;";
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(createElement(ReportDocument, { scope }));

  // chờ React render + font sẵn sàng
  await new Promise((r) => setTimeout(r, 450));
  try {
    await (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;
  } catch {
    /* noop */
  }

  return {
    container,
    cleanup: () => {
      root.unmount();
      container.remove();
    },
  };
}

/** Dựng tài liệu A4 thiết kế (ẩn ngoài màn), chụp từng trang → PDF nhiều trang. */
export async function exportPdf(scope: ExportScope): Promise<void> {
  const { container, cleanup } = await buildPrintRoot(scope);

  const pages = Array.from(container.querySelectorAll<HTMLElement>(".report-page"));
  const pdf = new jsPDF("p", "mm", "a4");
  for (let i = 0; i < pages.length; i++) {
    const dataUrl = await toPng(pages[i], { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297, undefined, "FAST");
  }

  cleanup();

  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  pdf.save(`BaoCao_${scope.kind}_${stamp}.pdf`);
}
```

- [ ] Chạy PASS: `npx vitest run src/lib/export/__tests__/pdf-journey.test.ts`. Expected: 1 passed (DOM in học sinh có nhiều `.report-page`, không marker picker/present, cleanup gỡ `#report-root`).

- [ ] Checkpoint: chạy cổng — `npx tsc --noEmit` && `npx vitest run` && `npx vite build` (đều xanh).

---

### Task 7: Dọn dẹp — gỡ DistractorBar mồ côi, import Confetti chưa dùng, chữ "demo"

**Files**
- Delete: `src/components/charts/DistractorBar.tsx`
- Modify (nếu có): bất kỳ file nào còn import `Confetti` mà không dùng (Plan 02/03 có thể để lại); bất kỳ file nào còn chữ "demo"/"minh hoạ".
- Test: `src/test/__tests__/no-orphans.test.ts`

**Interfaces**
- Consumes: không. Đây là task dọn.
- Produces: codebase không còn `DistractorBar`, không còn import `Confetti` thừa, không còn chữ "demo/minh hoạ" trong `src/`.

> Tại thời điểm viết plan: `DistractorBar.tsx` chỉ được khai báo, KHÔNG file nào import (mồ côi → xóa an toàn). `Confetti` chỉ định nghĩa trong `src/components/motion/index.tsx` và export; nếu Plan 02/03 đã import `Confetti` ở `studentChapters`/`classChapters`/`PresentationMode` mà không thực sự render thì gỡ import đó. Không xóa định nghĩa `Confetti` trong `motion/index.tsx` (để export ổn định). Hiện `src/` không có chữ "demo" — test chốt cứng để chặn hồi quy.

Steps:

- [ ] Viết test FAIL `src/test/__tests__/no-orphans.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const SRC = resolve(__dirname, "../..");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

describe("dọn dẹp", () => {
  test("DistractorBar.tsx đã bị gỡ", () => {
    expect(existsSync(join(SRC, "components/charts/DistractorBar.tsx"))).toBe(false);
  });

  test("không còn tham chiếu DistractorBar", () => {
    const hits = walk(SRC).filter((f) => readFileSync(f, "utf8").includes("DistractorBar"));
    expect(hits).toEqual([]);
  });

  test("không có import Confetti thừa (mỗi file import Confetti phải có dùng <Confetti)", () => {
    const offenders = walk(SRC).filter((f) => {
      if (f.endsWith(join("components", "motion", "index.tsx"))) return false; // nơi định nghĩa
      const src = readFileSync(f, "utf8");
      const imported = /\bConfetti\b/.test(src) && /import[^;]*\bConfetti\b[^;]*from/.test(src);
      if (!imported) return false;
      return !/<Confetti\b/.test(src); // import nhưng không render
    });
    expect(offenders).toEqual([]);
  });

  test("không còn chữ demo / minh hoạ trong src", () => {
    const offenders = walk(SRC).filter((f) => {
      if (/no-orphans\.test\.ts$/.test(f)) return false; // tự loại trừ file test này
      return /\bdemo\b|minh\s*ho[aạ]/i.test(readFileSync(f, "utf8"));
    });
    expect(offenders).toEqual([]);
  });
});
```

- [ ] Chạy thấy FAIL: `npx vitest run src/test/__tests__/no-orphans.test.ts`. Expected: test "DistractorBar.tsx đã bị gỡ" và "không còn tham chiếu DistractorBar" FAIL (file còn tồn tại). Các test còn lại có thể đã pass; nếu Plan 02/03 để lại import Confetti thừa hoặc chữ "demo" thì các test đó cũng FAIL.

- [ ] Xóa file mồ côi: `cd "c:/Trường học số - source code/prj-ths-bao-cao-tong" && rm src/components/charts/DistractorBar.tsx` (PowerShell: `Remove-Item -Force "src/components/charts/DistractorBar.tsx"`).

- [ ] Quét và gỡ import `Confetti` thừa: chạy `npx vitest run src/test/__tests__/no-orphans.test.ts`. Nếu test "import Confetti thừa" báo file vi phạm (ví dụ `src/components/journey/PresentationMode.tsx`), mở file đó, xóa định danh `Confetti` khỏi câu `import ... from "@/components/motion"` (giữ các import khác). KHÔNG đụng `src/components/motion/index.tsx`.

- [ ] Quét và gỡ chữ "demo"/"minh hoạ": nếu test "không còn chữ demo / minh hoạ" báo file vi phạm, mở và sửa câu chữ theo giọng giáo viên (skill humanized), KHÔNG để lại "demo/minh hoạ". (Tại thời điểm hiện tại `src/` không chứa các chữ này; bước này phòng hồi quy từ Plan 02/03.)

- [ ] Chạy PASS: `npx vitest run src/test/__tests__/no-orphans.test.ts`. Expected: 4 passed.

- [ ] Checkpoint: chạy cổng — `npx tsc --noEmit` && `npx vitest run` && `npx vite build` (đều xanh).

---

### Task 8: Smoke cuối — hành trình + xuất + vai trò trên cùng xanh

**Files**
- Modify: `src/test/smoke.test.tsx`

**Interfaces**
- Consumes: `Phong`, `Truong`, `ReportDocument`, `repo.getStudentJourney`, `repo.getClassJourney`.
- Produces: bổ sung case smoke cho TroLySummary (phong/truong) và ReportDocument hành trình (học sinh + lớp), bảo đảm không hồi quy.

Steps:

- [ ] Viết bổ sung (FAIL nếu Task 2–5 chưa xong) — thêm vào cuối `describe` trong `src/test/smoke.test.tsx`. Trước hết thêm import ở đầu file (sau các import hiện có):

```tsx
import Phong from "@/routes/phong";
import { ReportDocument } from "@/components/report/ReportDocument";
import { STUDENT_HERO, SCHOOL_HERO } from "@/data/mock/world";
```

Thêm các test:

```tsx
  test("trang Phòng hiện tóm tắt Trợ lý", () => {
    wrap(<Phong />);
    expect(screen.getByText("Trợ lý tổng hợp")).toBeInTheDocument();
  });

  test("ReportDocument in hành trình học sinh có Hội tụ", () => {
    const { container } = wrap(<ReportDocument scope={{ kind: "hoc-sinh", id: STUDENT_HERO, title: "" }} />);
    expect(within(container).getByText("Hội tụ")).toBeInTheDocument();
    expect(container.querySelectorAll(".report-page").length).toBeGreaterThan(2);
  });

  test("ReportDocument in hành trình lớp có Mở đầu + phụ lục chi tiết HS", () => {
    const { container } = wrap(<ReportDocument scope={{ kind: "lop", id: CLASS_HERO, title: "" }} />);
    expect(within(container).getByText("Mở đầu")).toBeInTheDocument();
    expect(within(container).getByText("Chi tiết học sinh")).toBeInTheDocument();
  });
```

> `SCHOOL_HERO` import phòng dùng sau; nếu lint báo unused thì bỏ khỏi câu import. Giữ `STUDENT_HERO` (dùng ở case học sinh).

- [ ] Chạy thấy FAIL trước khi Task 2–5 hoàn tất (nếu chạy độc lập). Sau khi Task 2–7 xong, chạy: `npx vitest run src/test/smoke.test.tsx`. Expected: tất cả case smoke (cũ + 3 mới) passed.

- [ ] Nếu `SCHOOL_HERO` không dùng gây lỗi `tsc` `noUnusedLocals`, sửa import còn: `import { STUDENT_HERO } from "@/data/mock/world";` (CLASS_HERO đã import sẵn ở đầu file gốc).

- [ ] Chạy PASS: `npx vitest run src/test/smoke.test.tsx`. Expected: all passed.

- [ ] Checkpoint cuối cùng (cổng tổng): `npx tsc --noEmit` && `npx vitest run` && `npx vite build` — cả ba phải xanh. Đây là cổng hoàn thành Plan 04.