# Báo cáo tổng dạng "Hành trình" — Thiết kế

> Ngày: 2026-06-24 · Trạng thái: đã duyệt khung, chờ review spec → writing-plans
> Bối cảnh: thay cách đọc báo cáo từ "chuyển tab" sang **một mạch kể chuyện bám timeline** (cảm giác cuốn như Spotify Wrapped / nhìn lại), do người dùng cuộn theo. Tái dùng `ReportRepository` + biểu đồ/bảng hiện có.

## 1. Mục tiêu & nguyên tắc

- Người đọc đi theo **một hành trình** thay vì phải tự nhảy tab. Cuộn xuống = tiến tới trong thời gian.
- "Cuốn" đến từ: cấu trúc kể chuyện theo timeline + con số tiêu điểm lớn + chuyển động có chủ đích + một **Trợ lý** dẫn dắt.
- **Giữ nguyên các ràng buộc đã có:**
  - Chỉ token MobiFone (không hex thô); font Be Vietnam Pro; câu chữ theo skill `humanized`; **không** chữ "demo/minh hoạ".
  - **Dẫn chứng số liệu:** chỉ bịa **số thô** (đếm buổi/lượt/điểm); mọi chỉ số/tỉ lệ hiển thị phải truy ra input → output. Mọi câu Trợ lý nói đều phải có con số tương ứng hiển thị ngay cạnh.
  - Mọi chuyển động tôn trọng `prefers-reduced-motion`; không pháo giấy tự động.

## 2. Phạm vi (vai trò)

| Vai trò | Trải nghiệm |
|---|---|
| **Học sinh** | Hành trình đầy đủ (bản cá nhân). |
| **Giáo viên** | Hành trình đầy đủ (bản lớp), drill xuống hành trình từng học sinh. |
| **Hiệu trưởng / Phòng GD&ĐT** | Giữ bảng vận hành hiện có; **thêm phần Trợ lý tóm tắt kể chuyện** ở đầu trang. Không làm full hành trình (họ cần so sánh nhiều đơn vị). |

## 3. Cấu trúc hành trình (chu kỳ theo timeline)

Hành trình **không phải một lượt** mà là **chu kỳ lặp** theo thời gian:

```
Mở đầu → Chuẩn bị → ┌─ Chặng 1: Trên lớp → Ở nhà → Kỳ thi ─┐
                     ├─ Chặng 2: Trên lớp → Ở nhà → Kỳ thi ─┤  (lặp theo timeline)
                     └─ Chặng N: Trên lớp → Ở nhà → Kỳ thi ─┘ → Hội tụ
```

### 3.1. "Chặng" là gì
- Một **chặng** = quãng học **khép lại bằng một bài kiểm tra/kỳ thi**.
- Ranh giới chặng = các mốc kiểm tra/thi trong lát Kỳ×Môn, sắp theo ngày.
- Buổi học (trên lớp) và nhiệm vụ (ở nhà) được **cắt theo ngày** vào đúng chặng giữa hai mốc: chặng *i* gồm các sự kiện có ngày trong `(assessment[i-1].date, assessment[i].date]`, đóng lại bằng `assessment[i]`.
- Đề Sơn Tây thật = **chặng cuối (thi thử)**. Vài chặng trước dựng từ bài kiểm tra trong kỳ (chỉ bịa số thô; tỉ lệ vẫn truy input).

### 3.2. Các chương
| Chương | Học sinh | Giáo viên (lớp) |
|---|---|---|
| **Mở đầu** | Bộ lọc Kỳ×Môn; Trợ lý tóm tắt 2–3 câu; hạng, xu hướng, 2 chỉ số | sĩ số · điểm TB · 2 chỉ số lớp · số cần hỗ trợ + Trợ lý tóm tắt |
| **Chuẩn bị** (1 lần, đầu hành trình) | % buổi xem trước học liệu · nộp bài chuẩn bị trước giờ · vào lớp đúng giờ | cùng 3 tỉ lệ, cấp lớp |
| **Chặng × N — Trên lớp** | chuyên cần · quiz nhanh đúng % · mức tham gia; chọn 1 buổi xem sâu | chuyên cần lớp · quiz · mức tham gia · leaderboard |
| **Chặng × N — Ở nhà** | hoàn thành · đúng hạn · điểm; danh sách nhiệm vụ → drill-down | hoàn thành lớp · đúng hạn · bảng nhiệm vụ |
| **Chặng × N — Kỳ thi** | điểm của em vs TB; chọn đề → chi tiết + link bài làm | phân bố điểm · so mã đề · câu sai nhiều · chủ đề |
| **Hội tụ** | chủ đề **yếu dai dẳng qua nhiều chặng** → việc nên làm (giọng HS) | chủ đề lớp yếu dai dẳng (giọng GV) + danh sách HS cần hỗ trợ → mở hành trình em đó |

- "Chuẩn bị" là **thói quen vào học**, đặt 1 lần đầu hành trình, **không trộn vào chỉ số điểm** (Chỉ số Học tập giữ 3 nguồn như cũ).
- Mỗi chương mở bằng **1 dòng Trợ lý** bám số của chương đó; có 1 **con số tiêu điểm** cỡ lớn; có link "dẫn chứng".

## 4. Trợ lý AI (offline, bám số, đúng thì)

- Engine mới `narrate.ts`: ghép các con số của chương thành 1–2 câu giọng giáo viên. **Deterministic** (seeded → ổn định mọi lần tải). **Grounded**: không câu nào không có số kèm hiển thị ngay cạnh. Thương hiệu **"Trợ lý Trường học số"** — không bao giờ "AI phân tích cho thấy".
- **Không chatbox, không nhập tự do** — một giọng nhất quán, điềm tĩnh, mở câu đa dạng, không emoji.
- **Bám timeline / đúng thì:**
  - Mỗi sự kiện trong lát cắt mang **ngày + trạng thái** (đã qua / đang / sắp tới) so với **mốc "hiện tại" của demo**.
  - Việc đã qua → kể bằng "đã"; đang diễn ra → "đang".
  - Khuyến nghị **neo vào sự kiện kế tiếp**: chỉ dùng "**chữa/ôn trước [sự kiện]**" khi sự kiện đó **còn ở tương lai**. Chủ đề đã dạy & đã kiểm tra, không còn bài kiểm tra sắp tới → "**nên ôn/củng cố lại**", **không** "chữa trước".
  - **Mốc hiện tại của demo** đặt **sau thi thử, trước kỳ thi THPT chính thức**; kỳ thi chính thức là mốc "sắp tới" để các câu "trước kỳ thi chính thức" có nghĩa.
  - Vai trò: HS "nên ôn lại"; GV "nên chữa trước [kỳ thi kế]".

## 5. Đa bội (Kỳ × Môn) + chọn-một-trong-nhiều

- **Sticky top:** `Kỳ ▾ (Kỳ 1 / Kỳ 2 / Cả năm) × Môn ▾`. Đổi bộ lọc → cả hành trình dựng lại cho lát cắt đó, **cuộn về đầu**, deep-link `?ky=&mon=`.
- **Focus picker (mẫu dùng lại) trong chương:** dải mốc/chip ngang để chọn 1 thực thể, mở chi tiết tại chỗ — *Kỳ thi:* timeline các đề; *Trên lớp:* dải buổi; *Ở nhà:* danh sách nhiệm vụ.
- **Rỗng có duyên:** lát cắt không có dữ liệu (vd môn chưa thi kỳ này) → chương hiện trạng thái rõ ("Kỳ này chưa có bài thi môn …"), không để trống.
- **Nhiều chặng → dải gọn trên trục thời gian dọc** (chính là thanh tiến trình): mỗi chặng tóm tắt 3 ô Trên lớp · Ở nhà · Kỳ thi + dòng Trợ lý; bấm **"Xem chi tiết chặng"** mới bung biểu đồ/bảng đầy đủ.
- **Bối cảnh lớp (GV):** mặc định lớp chủ nhiệm; đổi sang lớp bộ môn qua bộ chọn lớp; Môn đi theo lớp.

## 6. Cách đọc & chuyển động

- **Mặc định:** cuộn dọc, mỗi chương ~cao trọn màn có **scroll-snap** (cảm giác lật slide nhưng vẫn là cuộn) + **trục thời gian dọc** làm thanh tiến trình; reveal khi cuộn; CountUp cho số tiêu điểm.
- **Trình chiếu (▶):** chạy full-screen từng chương, phím ‹ ›, thoát về đúng vị trí cuộn.
- Tất cả chuyển động tôn trọng `prefers-reduced-motion` (tắt snap/reveal, hiện tức thì).

## 7. Kiến trúc & thay đổi mã

### 7.1. Tầng dữ liệu (view-layer trên repository hiện có)
- **Mặt mới "Chuẩn bị"** (raw, chỉ bịa số thô): per học sinh & per lớp — `xemTruoc {count,total}`, `baiChuanBi {count,total}`, `dungGio {count,total}`; UI hiện 3 tỉ lệ, không tạo chỉ số tổng hợp mới.
- **Ngày tháng:** đảm bảo buổi học (`classHistory`/session), nhiệm vụ (`missions`/`nha`), bài kiểm tra/thi mang `date`; seed sinh **nhiều mốc kiểm tra theo thời gian** để có ≥2–3 chặng/kỳ (chặng cuối = thi thử thật).
- **`DEMO_NOW`:** một hằng số ngày cố định trong seed (KHÔNG dùng đồng hồ thật) đặt **ngay sau ngày thi thử và trước ngày kỳ thi THPT chính thức**; mọi trạng thái "đã/đang/sắp tới" tính theo hằng số này để demo ổn định và các câu "trước kỳ thi chính thức" luôn đúng nghĩa. Kỳ thi THPT chính thức là một mốc "sắp tới" có ngày trong seed (không có dữ liệu kết quả).
- **Assembler mới trong `mockRepository`:**
  - `getStudentJourney(studentId, term, subject) → StudentJourney`
  - `getClassJourney(classId, term, subject) → ClassJourney`
  - Kiểu `JourneyView`: `{ slice:{term,subject}, now, overview, prep, cycles: Cycle[], convergence, recommendations }`; `Cycle = { label, range, status, lop, nha, exam }`.
  - Logic cắt chặng theo ngày + gắn trạng thái timeline.
- **`narrate.ts`:** hàm sinh câu cho từng chương (overview/prep/cycle.lop/nha/exam/convergence), nhận `JourneyView` + role + `now`; trả `{ text, figures }` (figures để UI hiển thị cạnh → đảm bảo dẫn chứng).

### 7.2. Thành phần UI mới
- `<Journey>` — khung: sticky `<KyMonPicker>`, trục thời gian/tiến trình, container scroll-snap, nút trình chiếu.
- `<Chapter>` — section snap + reveal.
- `<CycleBand>` — dải gọn 1 chặng (3 ô + dòng Trợ lý + "Xem chi tiết chặng").
- `<Narrator>` / `<TroLyCard>` — thẻ mở đầu + dòng mỗi chương; hiển thị `figures` kèm câu.
- `<FocusPicker>` — chọn 1-trong-nhiều (đề/buổi/nhiệm vụ).
- `<PresentationMode>` — trình chiếu full-screen các chương.
- `<TroLySummary>` — phần tóm tắt kể chuyện gắn đầu trang Phòng/Hiệu trưởng.

### 7.3. Tái dùng (không vứt đi)
- Biểu đồ/bảng hiện có là **nội dung "chi tiết chặng"**: `ProgressRing`, `IndexCard`, `BandDistribution`, `ScoreHistogram`, `CodeCompare`, `TopicMatrixBars`, `TopMissedTable`, `RosterTable`, `ConvergencePanel`, `EngagementTimeline`, `EffortScatter`, `TrendLine`…
- Tab cũ (`TongHopTab/LopTab/NhaTab/ThiTab`): rút biểu đồ ra dùng lại trong chương; **vỏ tab nghỉ hưu**.
- Trang dẫn chứng (`de-thi`, `bai-lam`, `nhiem-vu`, `nhiem-vu-bai-lam`) **giữ nguyên**; chương link tới.

### 7.4. Định tuyến
- `/app/hoc-sinh/:studentId` → `<Journey kind="student">` (query `?ky=&mon=&present=`).
- `/app/lop/:classId` → `<Journey kind="class">` (query `?ky=&mon=&class=&present=`).
- Trang dẫn chứng & các trang Phòng/Trường giữ route cũ; Phòng/Trường thêm `<TroLySummary>` ở đầu.

## 8. Xuất báo cáo
- **PDF:** in hành trình dạng dài — **bung hết chặng**, bỏ chế độ trình chiếu, dùng layout cuộn (in tự nhiên). Tái dùng cơ chế rasterize hiện có.
- **Excel:** đa sheet **giữ nguyên**.

## 9. Kiểm thử
- Unit test assembler: cắt chặng theo ngày đúng; trạng thái timeline (đã/đang/sắp tới) đúng; lát rỗng trả chương rỗng có nội dung.
- Unit test `narrate.ts`: (a) **mỗi câu có figures kèm** (không câu nào thiếu số); (b) **ổn định** (seeded, gọi 2 lần ra y hệt); (c) **đúng thì** — chủ đề đã kiểm tra & không có mốc sắp tới thì **không** chứa "chữa trước"; có mốc sắp tới thì dùng "trước [mốc]".
- Smoke test render `<Journey>` cho cả student & class không lỗi.
- Cổng: `tsc --noEmit` sạch · `vitest` xanh · `vite build` xanh.

## 10. Ngoài phạm vi (non-goals)
- Không gọi LLM thật; không chatbox hỏi đáp.
- Dữ liệu thật giàu chỉ ở Địa lý; môn khác seeded.
- "Chuẩn bị" đặt 1 lần đầu hành trình (không theo từng chặng).
- Phòng/Hiệu trưởng không có full hành trình (chỉ tóm tắt Trợ lý).
