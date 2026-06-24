# Trường học số · Insight — Báo cáo tổng — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully clickable demo report app ("Trường học số · Insight") that combines in-class (SmartClass), home (Nhiệm vụ) and exam (Thi) student data into a multi-level, multi-role analytics report with easy-to-read charts, impressive animation, and true Excel/PDF export.

**Architecture:** Vite SPA. A `ReportRepository` interface backed by a mock data layer (real Sơn Tây exam data + seeded generated data) feeds pure-logic modules (`metrics`, `indices`, `insights`) and React screens. Routing is nested by scope (Phòng → Trường → Lớp → Học sinh) behind an account-select gate. Charts and "report blocks" are leaf components reused across screens. One export service shapes the same data objects into ExcelJS workbooks and jsPDF documents.

**Tech Stack:** Vite 7, React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix), Recharts 3, framer-motion 12, React Router 7, Zustand (+immer), ExcelJS, jsPDF, html-to-image, file-saver, Be Vietnam Pro (offline font), Vitest.

## Global Constraints

- **Design system:** MobiFone Untitled UI. Style ONLY via copied tokens/semantic roles + shadcn primitives. NO hex literals in UI code, NO `bg-[#..]`/`text-[#..]` arbitrary colors, NO default Tailwind palette colors for UI. Brand blue `#237BD3` (primary), accent red `#E30613` (only "cần hỗ trợ"/below threshold), warning orange `#FFA23A` (mid). Radius 8px controls, soft shadows, 4px grid.
- **Charts dễ xem:** ≤5 series, direct value labels where space allows, bars sorted (hardest-first), banded good→bad color ramp, no 3D, no dual-axis, short caption marking "ý nghĩa thật" vs "tham khảo".
- **Copy:** Vietnamese, humanized teacher voice (fact → meaning in class → one practical next step). Mix "nên/có thể/phù hợp để/để ý thêm", not every line "Cần". "cần theo dõi/hỗ trợ" not "yếu/kém". No emoji in product UI, no excessive bold, no sales tone. Sentence case. Address "em/lớp/giáo viên".
- **Data:** mock only, no network. Hero class uses REAL Sơn Tây numbers (108 HS, TB 7.86, median 8). Median computed client-side. Seeded generation (no runtime randomness that changes between loads).
- **Accounts (exact names):** Đoàn Thuận Anh Thư (Phòng GD), Phạm Quốc Đạt (Hiệu trưởng Sơn Tây), Nguyễn Minh Hồng (GV Địa, chủ nhiệm 12 Văn), Lê Trung Hiếu (HS 12 Văn, parent/student view).
- **Motion:** impressive but readable; entry-only animation; respect `prefers-reduced-motion` (disable all).
- **Gates before "done":** `npx tsc --noEmit` clean, `npm run test` (vitest) pass, `npm run build` succeeds, hero flow clickable end-to-end.
- **No dead ends:** every breadcrumb, tab, heatmap cell, table row, filter is clickable; no blank screens; links only render where the target exists.

---

## File Structure

```
prj-ths-bao-cao-tong/
  index.html, package.json, vite.config.ts, tailwind.config.ts, postcss.config.js, tsconfig*.json, vitest.config.ts
  src/
    main.tsx, App.tsx, router.tsx
    styles/styles.css, styles/untitled/*           # copied tokens
    data/types.ts, repository.ts, mockRepository.ts
    data/mock/{sontay.real.ts, accounts.ts, schools.ts, classes.ts, students.ts, exams.ts, missions.ts, smartclass.ts, generate.ts}
    lib/{metrics.ts, indices.ts, insights.ts, format.ts}
    lib/export/{chartImage.ts, excel.ts, pdf.ts, exportService.ts}
    stores/uiStore.ts
    components/ui/*                                 # shadcn primitives
    components/motion/{Reveal,CountUp,Stagger,PageTransition,Confetti,AnimatedGradient}.tsx
    components/charts/{AttendanceDonut,EngagementTimeline,ScoreHistogram,ItemAnalysisBar,CodeCompareBar,DistractorBar,TopicMatrixBars,StudentRadar,Heatmap,EffortScatter,CompletionStacked,TrendLine,Sparkline}.tsx
    components/report/{KpiCard,IndexCard,BandDistribution,RosterTable,ConvergencePanel,InsightCallout,TopMissedTable,CodeCompare,StudentHeader}.tsx
    components/layout/{AppShell,TopBar,FilterBar,ScopeBreadcrumb,RoleBadge,UserMenu,Sidebar}.tsx
    routes/{account-select,app-shell,phong,truong,lop,hoc-sinh,print}.tsx
    routes/lop/{TongHopTab,LopTab,NhaTab,ThiTab}.tsx
  docs/superpowers/{specs,plans}/...
```

Files that change together live together (charts/, report/, lop/ tabs). Each component file = one component + its local types.

---

## Phase 0 — Foundation (sequential; everything depends on it)

### Task 0.1: Scaffold Vite + Tailwind 4 + shadcn + tokens + font

**Files:** Create `package.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `tsconfig.node.json`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/styles.css`; copy `gk-content-forge/src/styles/untitled/*` → `src/styles/untitled/`.

**Interfaces:**
- Produces: working dev server + build; `@/` alias → `src/`; Tailwind 4 reading Untitled tokens; Be Vietnam Pro via `@fontsource/be-vietnam-pro`.

- [ ] Step 1: `npm create vite@latest . -- --template react-ts` in the project folder (folder already has `docs/`; keep it).
- [ ] Step 2: Install deps: `react-router-dom@7 recharts@3 framer-motion zustand immer exceljs jspdf html-to-image file-saver @fontsource/be-vietnam-pro clsx tailwind-merge class-variance-authority lucide-react`; dev: `tailwindcss@4 @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom @types/file-saver`.
- [ ] Step 3: Configure Tailwind 4 via `@tailwindcss/vite` plugin + `@/` alias in `vite.config.ts` and `tsconfig.json` paths.
- [ ] Step 4: Copy the 8 Untitled token CSS files; write `src/styles/styles.css` mirroring gk-content-forge's `:root` semantic-role mapping + `@theme inline` (reuse its mapping verbatim, swap font var to Be Vietnam Pro). Import `@fontsource/be-vietnam-pro` weights 400/500/600/700.
- [ ] Step 5: Add shadcn primitives needed (manually copy from gk-content-forge `src/components/ui/`, adjusting imports): button, card, table, tabs, dialog, sheet, badge, progress, select, dropdown-menu, tooltip, skeleton, breadcrumb, scroll-area, switch, slider, avatar, separator, popover, sonner.
- [ ] Step 6: `App.tsx` renders a placeholder using `<Button>` + `bg-background`/`bg-card` to prove tokens work.
- [ ] Step 7: Verify: `npm run dev` shows styled placeholder; `npm run build` succeeds; `npx tsc --noEmit` clean. Commit.

### Task 0.2: Router + AppShell + account-select gate + logout

**Files:** Create `src/router.tsx`, `src/stores/uiStore.ts`, `src/routes/account-select.tsx`, `src/routes/app-shell.tsx`, `src/components/layout/*`.

**Interfaces:**
- `uiStore`: `{ accountId: string|null, role: Role, scope, filters:{mon,ki,khoi}, theme:'light'|'dark', reducedMotion:boolean, selectAccount(id), logout() }`.
- Routes per spec §4. `account-select` at `/`; `/app/*` guarded — if `accountId==null` redirect to `/`.
- `logout()` clears `accountId` and navigates to `/`.

- [ ] Step 1: `uiStore` with Zustand+immer; `Role = 'phong'|'truong'|'giaovien'|'hocsinh'`.
- [ ] Step 2: `router.tsx` with React Router 7 `createBrowserRouter`; guard wrapper redirects to `/` when no account.
- [ ] Step 3: `AppShell` = `TopBar` (logo, FilterBar slot, notifications mock, UserMenu) + `ScopeBreadcrumb` + optional `Sidebar` + `<Outlet/>` wrapped in `PageTransition`.
- [ ] Step 4: `UserMenu` shows avatar/name/role, Dark mode `Switch`, "Đăng xuất" → `logout()`.
- [ ] Step 5: `account-select` renders 4 account cards (from `data/mock/accounts.ts`, Task 1.x — stub inline for now) → on click `selectAccount` + navigate to role's start route.
- [ ] Step 6: Verify each account routes to its start screen; logout returns to `/`; guard works. Commit.

---

## Phase 1 — Data layer

### Task 1.1: Types matching production views

**Files:** Create `src/data/types.ts`.

**Interfaces (Produces — used everywhere):**
```ts
export type Role = 'phong'|'truong'|'giaovien'|'hocsinh'
export interface Account { id:string; name:string; role:Role; org:string; scopeId:string; lastLogin:string }
export interface School { id:string; name:string; isHero?:boolean }
export interface Klass { id:string; schoolId:string; khoi:10|11|12; name:string; homeroomTeacher:string; studentIds:string[] }
export interface Student { id:string; classId:string; name:string; examCode?:string }
export interface ExamResultView { studentId:string; score:number; correct:number; wrong:number; total:number; durationSec:number }
export interface MissionReportView { missionId:string; title:string; avgScore:number; minScore:number; maxScore:number; stddev:number; completionRate:number; completed:number; total:number; scoreDistribution:Record<string,number> }
export interface MissionStudentReportView { missionId:string; studentId:string; totalScore:number; correctCount:number; wrongCount:number; totalQuestions:number; durationSec:number; status:'todo'|'inprogress'|'submitted'|'graded'; attempts:number; late:boolean }
export interface MissionQuestionReportView { questionId:string; topic:string; content:string; correctAnswer:string; correctRate:number; commonWrong:string; commonWrongRate:number; numAnswered:number; difficulty:'de'|'tb'|'kho' }
export interface TopicAccuracy { topic:string; numQuestions:number; accuracy:number }   // 0..1
export interface ExamReport { examCode:string; numStudents:number; avg:number; median:number; bands:BandRow[]; histogram:{bin:string;count:number}[]; topMissed:MissionQuestionReportView[]; topics:TopicAccuracy[]; insights:string[] }
export interface BandRow { label:string; count:number; ratio:number }
export interface SessionAnalytics { sessionId:string; classId:string; durationMin:number; attendance:{present:number;absent:number;late:number;leftEarly:number}; engagement:{t:number;score:number}[]; quizzes:{q:string;accuracy:number}[]; leaderboard:{studentId:string;rank:number;score:number;streak:number}[] }
export interface StudentProfile { student:Student; learningIndex:IndexBreakdown; effortIndex:IndexBreakdown; weakTopics:WeakTopic[]; exams:{ki:string;score:number}[]; missions:MissionStudentReportView[]; radar:{axis:string;value:number}[]; teacherDraftNote:string }
export interface IndexBreakdown { total:number; parts:{label:string;value:number;weight:number}[] }
export interface WeakTopic { topic:string; surfaces:{lop:boolean;nha:boolean;thi:boolean}; confirmed:boolean }
```
- [ ] Step 1: Write `types.ts`. Step 2: `npx tsc --noEmit` clean. Commit.

### Task 1.2: Real Sơn Tây data + repository + generator

**Files:** Create `src/data/mock/sontay.real.ts` (paste extracted JSON: 108 students, 2-code stats, 10 missed/code, 6 topics/code, histograms), `src/data/mock/{accounts,schools,classes,students,exams,missions,smartclass,generate}.ts`, `src/data/repository.ts`, `src/data/mockRepository.ts`.

**Interfaces (Produces):**
```ts
export interface ReportRepository {
  getAccounts():Account[]
  getPhongOverview():{ schools:School[]; rows:{schoolId:string;examAvg:number;median:number;completion:number;attendance:number;needSupportPct:number}[]; kpis:Record<string,number> }
  getSchool(id:string):{ school:School; classes:Klass[]; classBySubject:Record<string,Record<string,number>>; weakTopics:WeakTopic[]; kpis:Record<string,number> }
  getClass(id:string):{ klass:Klass; students:Student[]; tongHop:any; lop:SessionAnalytics; nha:{missions:MissionReportView[];items:MissionQuestionReportView[];students:MissionStudentReportView[]}; thi:ExamReport[] }
  getStudent(id:string):StudentProfile
}
```
- [ ] Step 1: Generate `sontay.real.ts` from the extracted JSON files (`/tmp/sontay_students.json`, `/tmp/sontay_report.json`) — re-run the extraction script and write the TS module. Insert **Lê Trung Hiếu** into the 12 Văn / code-1 cohort with a plausible profile.
- [ ] Step 2: `accounts.ts` — 4 accounts (exact names) mapped to scope ids (Phòng, Sơn Tây school, 12 Văn class, Lê Trung Hiếu student).
- [ ] Step 3: `generate.ts` — seeded PRNG (mulberry32 with fixed seed); build 5 schools (Sơn Tây hero=real, 4 generated around its level), classes per khối, students with Vietnamese names from a name bank, per-class smartclass/missions/exam derived deterministically.
- [ ] Step 4: `mockRepository.ts` implements `ReportRepository` from the above; hero class returns real Sơn Tây ExamReport.
- [ ] Step 5: Test (`src/data/mockRepository.test.ts`): assert `getClass(heroClass).thi[0].avg === 7.86`, median 8, 108 students total across codes, topMissed length 10/code. Run vitest → pass. Commit.

---

## Phase 2 — Pure logic (TDD)

### Task 2.1: metrics.ts

**Files:** Create `src/lib/metrics.ts`, `src/lib/metrics.test.ts`.

**Interfaces (Produces):** `mean(n:number[]):number`, `median(n:number[]):number`, `stddev(n:number[]):number`, `toBands(scores:number[], scale:10|100):BandRow[]`, `histogram(scores:number[], step:number):{bin:string;count:number}[]`, `normalize(value:number, scale:10|100):number /*0..100*/`.

- [ ] Step 1: Write failing tests:
```ts
test('median of even count averages middle two', () => { expect(median([7,8,9,10])).toBe(8.5) })
test('toBands buckets VN 0-10 scale', () => { const b=toBands([4.9,5,6.4,7,8.5,9.2],10); expect(b.find(x=>x.label==='Dưới 5')!.count).toBe(1) })
test('histogram step 0.5 labels bins', () => { expect(histogram([0.2,5.1],0.5)[0].bin).toBe('0 – 0,49') })
```
- [ ] Step 2: Run → fail. Step 3: Implement. Step 4: Run → pass. Step 5: Commit.

### Task 2.2: indices.ts

**Files:** Create `src/lib/indices.ts`, `src/lib/indices.test.ts`.

**Interfaces (Produces):**
```ts
export function learningIndex(parts:{thi?:number;nha?:number;quizLop?:number}, weights?:{thi:number;nha:number;quizLop:number}):IndexBreakdown
export function effortIndex(parts:{chuyenCan:number;hoanThanh:number;dungHan:number}):IndexBreakdown
export function convergeWeakTopics(perSurface:{lop:TopicAccuracy[];nha:TopicAccuracy[];thi:TopicAccuracy[]}, threshold?:number):WeakTopic[]
```
- [ ] Step 1: Failing tests: default weights 0.35/0.35/0.30 sum to total; missing surface renormalizes remaining and marks partial; `convergeWeakTopics` flags topic weak in ≥2 surfaces as `confirmed:true`.
- [ ] Step 2 fail → Step 3 implement → Step 4 pass → Step 5 commit.

### Task 2.3: insights.ts (rule-based, humanized)

**Files:** Create `src/lib/insights.ts`, `src/lib/insights.test.ts`.

**Interfaces (Produces):** `examInsights(report:ExamReport):string[]` — deterministic humanized lines.

Rules (each emits a line only if condition holds), humanized voice:
- avg line: `"Điểm trung bình ${maDe} là ${avg}."`
- hard-questions: count questions with correctRate<0.7 → `"Có ${n} câu các em còn làm sai nhiều (đúng dưới 70%), nên chữa kỹ mấy câu này trước."`
- weak-topic: topics with accuracy<0.5 → `"Chủ đề ${t} cả lớp làm chưa tốt (đúng khoảng ${pct}%). Khi ôn, giáo viên có thể cho các em làm lại vài câu dạng này."`
- common-wrong: any question with commonWrongRate high → `"Một số câu có nhiều em cùng chọn sai một đáp án — có thể các em đang hiểu nhầm giống nhau, nên giải thích lại chỗ đó."`
- band note: if band '5 – 6.49' count>0 → `"Lớp có ${n} em ở nhóm 5–6,49 điểm, là nhóm nên để ý thêm trong các buổi ôn tới."`

- [ ] Step 1: Failing test asserts lines for the real code-1 report (avg 7,97; 5 hard questions). Step 2 fail → 3 implement → 4 pass → 5 commit.

### Task 2.4: format.ts

**Files:** Create `src/lib/format.ts`, `src/lib/format.test.ts`.
**Interfaces:** `diem(n)` → "7,9"; `pct(r)` → "63,6%"; `int(n)` with thousands sep.
- [ ] TDD: `diem(7.86)==='7,86'`, `pct(0.6364)==='63,6%'`. fail→impl→pass→commit.

---

## Phase 3 — Charts (parallelizable; each one file, reads tokens + Recharts 3)

Common rules from Global Constraints. Each chart accepts `{ data, title?, height?, caption? }` and uses `var(--chart-1..5)` / semantic tokens, `ResponsiveContainer`, entry-only animation, value labels where space allows.

### Task 3.1–3.13: one task per chart component
For each of: `AttendanceDonut`, `EngagementTimeline`, `ScoreHistogram` (banded ramp), `ItemAnalysisBar` (sorted hardest-first, % labels), `CodeCompareBar` (≤2 groups, show N), `DistractorBar` (correct=success, wrong=error), `TopicMatrixBars` (bar + numQuestions label + matrix target marker), `StudentRadar` (4 axes), `Heatmap` (CSS grid, threshold colors, cell click), `EffortScatter` (trend line, class-level only), `CompletionStacked` (fixed status order), `TrendLine` (≤5 lines), `Sparkline`:
- [ ] Step 1: Build the component with realistic prop types. Step 2: Render in a temporary `/sandbox` route with mock props; eyeball readability + token colors. Step 3: `npx tsc --noEmit`. Step 4: Commit.

(Charts have no unit tests — verified by build + visual sandbox. EXPLICITLY: chart correctness is visual; logic that feeds them is tested in Phase 2.)

---

## Phase 4 — Report blocks & motion

### Task 4.1: motion components
`Reveal` (IntersectionObserver + framer-motion, respects reducedMotion), `CountUp`, `Stagger`, `PageTransition` (AnimatePresence), `Confetti` (one-shot, cancellable), `AnimatedGradient`.
- [ ] Build each; verify reducedMotion disables; commit.

### Task 4.2–4.10: report blocks
`KpiCard`, `IndexCard` (3 part bars + weight `Slider` that recomputes via `learningIndex`), `BandDistribution`, `RosterTable` (sortable, row click → student, "cần hỗ trợ" badge in error token), `ConvergencePanel` (3-dot per topic), `InsightCallout`, `TopMissedTable` (+inline DistractorBar), `CodeCompare`, `StudentHeader`.
- [ ] Each: build, render in sandbox with repo data, tsc clean, commit.

---

## Phase 5 — Screens & navigation

### Task 5.1: account-select (final)
Wire to `repo.getAccounts()`, animated gradient bg, time-of-day greeting (rule-based), card stagger, click → role start route. Commit.

### Task 5.2: L0 Phòng
KPIs + `Heatmap` (school×metric, cell→school) + ranking table + `TrendLine`. Commit.

### Task 5.3: L1 Trường
KPI strip (CountUp+Sparkline) + `Heatmap` (class×subject, cell→class) + class table + school weak topics + `TrendLine` + Xuất button. Commit.

### Task 5.4: L2 Lớp shell + 4 tabs
- `lop.tsx` tab router (`?tab=`).
- `TongHopTab`: 2 `IndexCard` + `BandDistribution` + `ConvergencePanel` + `RosterTable` + `EffortScatter`.
- `LopTab`: `EngagementTimeline` + `ItemAnalysisBar` + `AttendanceDonut` + attendance roster + leaderboard.
- `NhaTab`: `CompletionStacked` + `ScoreHistogram` + per-question `ItemAnalysisBar`/`DistractorBar` + duration `EffortScatter` + mission table.
- `ThiTab`: KPIs (avg, median) + `BandDistribution` + `ScoreHistogram` + `CodeCompare` + `TopMissedTable` + `TopicMatrixBars` + `InsightCallout` + per-student table (row→student).
- [ ] Build each tab against hero class real data; verify numbers match Excel source; row clicks drill to L3. Commit per tab.

### Task 5.5: L3 Học sinh
`StudentHeader` (2 indices + parts + trend) + 3 surface panels + "Chủ đề cần hỗ trợ — tổng hợp 3 mặt" + parent/student tone when role==='hocsinh' (hide AI grade, gentle copy). Commit.

### Task 5.6: FilterBar + breadcrumb wiring
Global filters (môn/kì/khối) re-scope current screen; breadcrumb crumbs clickable per role. Commit.

---

## Phase 6 — Export

### Task 6.1: chartImage.ts + exportService skeleton
`captureNode(el):Promise<string /*png dataURL*/>` via html-to-image (pixelRatio 2); `exportService.export(model, 'xlsx'|'pdf', scope)` lazy-imports excel/pdf. Commit.

### Task 6.2: excel.ts (ExcelJS, TDD on data shaping)
- Pure helper `buildExamWorkbookModel(report):WorkbookModel` (rows per sheet) is unit-tested (median, bands, topMissed rows, per-code topics). Then `writeExcel(model)` styles: brand header fill, white text, freeze header row, number formats (`0.0` điểm, `0.0%` tỉ lệ), autofit, threshold cell colors, embed chart PNGs via `worksheet.addImage`.
- Sheets for Thi: `TỔNG HỢP`, `MÃ ĐỀ GỐC 1`, `MÃ ĐỀ GỐC 2`, `Chi tiết học sinh`; plus `Tổng hợp/Học tại lớp/Học tại nhà` for class report.
- [ ] TDD `buildExamWorkbookModel`; then implement writer; download via file-saver `BaoCao_<...>.xlsx`. Verify opens with 4 sheets + images. Commit.

### Task 6.3: pdf.ts + print route
`print.tsx` A4 layout (cover + section headers, hidden nav). `writePdf`: jsPDF text cover/headers + embedded chart images, vertical pagination. Filename `BaoCao_<...>.pdf`. Commit.

### Task 6.4: Export modal
Dialog from any Xuất button: choose PDF/Excel, scope, (Excel) sheets, progress + done toast. Commit.

---

## Phase 7 — Polish & verify

- [ ] Task 7.1: Dark mode pass on every screen + chart; reduced-motion pass.
- [ ] Task 7.2: Walk hero flow (Phạm Quốc Đạt → Sơn Tây → 12 Văn → Thi tab → Lê Trung Hiếu → export PDF+Excel); fix dead ends.
- [ ] Task 7.3: Confetti milestones, empty/edge states, loading skeletons.
- [ ] Task 7.4: Final gates: `npx tsc --noEmit`, `npm run test`, `npm run build`. Screenshot hero flow. Commit.

---

## Self-Review

- **Spec coverage:** account-select+logout (0.2,5.1), 4 roles/scopes (1.1,1.2,5.x), 4 surfaces (5.4), real Sơn Tây data (1.2), 2 indices + slider + convergence (2.2,4.2,5.4), rule-based humanized insights (2.3), 13 charts (3.x), Excel 4-sheet + PDF (6.x), dark mode + animation + reduced-motion (4.1,7.1), hero flow (7.2). Covered.
- **Placeholders:** none — chart visual-verification is an explicit, intentional choice (not a TODO).
- **Type consistency:** screens consume the `ReportRepository` shape and `types.ts` names used throughout; `learningIndex`/`effortIndex` signatures reused by `IndexCard`.
- **Note:** Charts are verified visually + by the tested logic feeding them; pure logic and Excel data-shaping carry real unit tests (meets the spirit of the testing requirement for a demo UI).
