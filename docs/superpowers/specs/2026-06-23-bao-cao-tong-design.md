# Thiết kế: "Trường học số · Insight" — Báo cáo tổng

- **Ngày:** 2026-06-23
- **Loại:** Demo có thể bấm hết (clickable prototype) trông như hệ thống thật đang chạy
- **Thư mục dự án:** `prj-ths-bao-cao-tong/`
- **Tên sản phẩm hiển thị:** Trường học số · Insight

---

## 1. Tổng quan & mục tiêu

Một **báo cáo tổng** gộp ba mặt học tập của học sinh vào một hệ thống xem được theo nhiều cấp và nhiều vai trò:

- **A. Học tại lớp** — dựa trên SmartClass (`prj-ths-smart-class`): điểm danh, mức độ tham gia, quiz/poll tại lớp, game.
- **B. Học tại nhà** — dựa trên module Nhiệm vụ của `gkebook-school-frontend`: trạng thái/tỉ lệ hoàn thành, điểm, phân tích từng câu, thời gian làm bài.
- **C. Qua các kì thi** — dựa trên module Thi của `gkebook-school-frontend`, **bám đúng báo cáo mẫu THPT Sơn Tây — Địa lý** (4 sheet Excel).

**Mục tiêu sản phẩm**
1. Biểu đồ **dễ xem** là ưu tiên số một (ít series, có nhãn số trực tiếp, sắp xếp sẵn, màu theo ngưỡng).
2. **Xuất Excel (.xlsx thật, nhiều sheet) và PDF** — ưu tiên ngang biểu đồ.
3. **Luồng đầy đủ:** mọi nút bấm được, mọi màn đi tới được, không có ngõ cụt.
4. UI/UX + animation **ấn tượng mạnh** ("xịn xò, nguy hiểm một chút"), nhưng không làm rối phần đọc số.
5. Cảm giác **như một hệ thống thật đang vận hành** (có màn chọn tài khoản, đăng nhập/đăng xuất, dữ liệu thật, tên thật).

**Nguyên tắc trung thực về chỉ số:** mỗi chỉ số đều ghi rõ ý nghĩa và cảnh báo. Không gộp những thứ khác bản chất (điểm danh + nói chuyện + điểm thi) thành một con số xếp hạng duy nhất.

---

## 2. Không làm (non-goals)

- Không có backend thật, không gọi API mạng. Mọi dữ liệu là **mock cục bộ** (nhưng đúng hình dạng dữ liệu production).
- Không đăng nhập thật (không mật khẩu, không xác thực). Màn "Chọn tài khoản" chỉ là chọn persona để vào.
- Không tích hợp ETL/đồng bộ dữ liệu giữa SmartClass và gkebook (đây là việc của sản phẩm thật, ghi nhận ở phần "Mở rộng sau").
- Không build bản mobile-native; chỉ web responsive (desktop-first, dùng tốt trên tablet).

---

## 3. Tài khoản & vai trò (màn "Chọn tài khoản")

App **mở ra ở màn Chọn tài khoản** (giống màn chọn hồ sơ của các hệ thống thật). Chọn 1 tài khoản → vào app với đúng phạm vi và màn khởi đầu của vai đó. Trong app, menu người dùng có **Đăng xuất** → quay lại đúng màn Chọn tài khoản. **Không có nút switch nhanh** trên thanh top.

| Tài khoản (tên thật) | Vai trò | Phạm vi | Màn khởi đầu |
|---|---|---|---|
| **Đoàn Thuận Anh Thư** | Chuyên viên Phòng GD&ĐT | Toàn Phòng (nhiều trường) | L0 · Phòng |
| **Phạm Quốc Đạt** | Hiệu trưởng THPT Chuyên Sơn Tây | 1 trường | L1 · Trường |
| **Nguyễn Minh Hồng** | Giáo viên Địa lí · chủ nhiệm 12 Văn | 1 lớp + các lớp dạy | L2 · Lớp |
| **Lê Trung Hiếu** | Học sinh lớp 12 Văn (xem cùng phụ huynh) | 1 học sinh | L3 · Học sinh (giọng nhẹ) |

- Mỗi thẻ tài khoản: avatar (chữ cái đầu trên nền brand), tên, vai trò, đơn vị, "Lần đăng nhập gần nhất". Hover nổi lên, bấm có hiệu ứng chuyển cảnh mượt vào app.
- Màn này nền gradient động (xem mục Animation), logo MobiFone/Trường học số, dòng chữ chào theo giờ trong ngày (rule-based, ví dụ buổi sáng: "Chào buổi sáng").
- **Lê Trung Hiếu** là học sinh có thật trong dữ liệu lớp 12 Văn; tài khoản này mở thẳng hồ sơ của em với giọng văn dành cho phụ huynh/học sinh (ẩn xếp loại AI gắt, tập trung tiến bộ và việc nên làm).

---

## 4. Kiến trúc thông tin & điều hướng

Ba trục độc lập:
- **Phạm vi (SCOPE):** Phòng → Trường → Khối → Lớp → Học sinh — đi bằng breadcrumb luôn hiển thị + bấm vào ô/hàng để drill xuống.
- **Mặt học tập (SURFACE):** `Tổng hợp · Học tại lớp · Học tại nhà · Qua các kì thi` — tab bên trong mỗi cấp.
- **Bộ lọc toàn cục:** Môn · Kì/Khoảng thời gian · Khối — thanh lọc dính trên cùng, đổi gì thì cập nhật toàn bộ màn đang xem.

### Routes (React Router 7, lồng nhau)
```
/                         → Màn Chọn tài khoản
/app                      → Shell (top bar + breadcrumb + filter + sidebar) [route bảo vệ bởi "đã chọn tài khoản"]
  /app/phong              → L0 · Phòng (so sánh nhiều trường)
  /app/truong/:schoolId   → L1 · Trường (so sánh lớp/khối)
  /app/lop/:classId       → L2 · Lớp
      ?tab=tong-hop|lop|nha|thi   (mặc định tong-hop)
  /app/hoc-sinh/:studentId → L3 · Học sinh
  /app/in/:scope/:id      → Trang in A4 (layout riêng, ẩn nav) — nguồn để chụp PDF
```
- Vai trò quyết định điểm vào và những gì breadcrumb cho phép đi lên. Ví dụ GV không lên được cấp Phòng; Hiệu trưởng không sang trường khác. Nhưng **mọi link hiển thị đều bấm được** trong phạm vi của vai.
- Không có route nào "chưa làm". Nếu một nhánh không thuộc demo thì không hiển thị link tới nó (không để nút chết).

---

## 5. Stack & cấu trúc thư mục

**Stack:** Vite 7 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · Recharts 3 · framer-motion 12 · React Router 7 · Zustand (+ immer) · ExcelJS · jsPDF · html-to-image · file-saver.

**Font:** Be Vietnam Pro (đóng gói offline qua `@fontsource` hoặc file woff2 cục bộ) — đúng fallback chính thức của MobiFone Untitled UI; không phụ thuộc mạng.

```
prj-ths-bao-cao-tong/
  index.html
  package.json  vite.config.ts  tailwind.config.ts  tsconfig*.json
  src/
    main.tsx  App.tsx  router.tsx
    styles/
      styles.css                 # @theme inline + ánh xạ semantic roles (như gk-content-forge)
      untitled/                  # COPY nguyên từ gk-content-forge: colors, brand, typography, spacing, shadows, gradients, fig-tokens
    components/
      ui/                        # shadcn primitives (Button, Card, Table, Tabs, Dialog, Badge, Progress, Select, Tooltip, Sheet, Skeleton, Breadcrumb, DropdownMenu, ScrollArea, Switch, Slider…)
      charts/                    # wrapper Recharts (mục 12)
      report/                    # khối báo cáo tái dùng (KPI card, RosterTable, BandDistribution, IndexCard, ConvergencePanel, InsightCallout, TopMissedTable, TopicMatrixBars, CodeCompare, StudentRadar…)
      layout/                    # AppShell, TopBar, FilterBar, ScopeBreadcrumb, RoleBadge, UserMenu
      motion/                    # Reveal, CountUp, Stagger, PageTransition, Confetti, AnimatedGradient
    routes/
      account-select.tsx
      app-shell.tsx
      phong.tsx  truong.tsx  lop.tsx  hoc-sinh.tsx  print.tsx
      lop/  → TongHopTab.tsx  LopTab.tsx  NhaTab.tsx  ThiTab.tsx
    data/
      types.ts                   # types hình dạng GIỐNG view production
      repository.ts              # interface ReportRepository
      mock/                      # fixtures + generator
        sontay.real.ts           # dữ liệu THẬT trích từ xlsx (108 HS, câu sai, chủ đề…)
        accounts.ts  schools.ts  classes.ts  students.ts  exams.ts  missions.ts  smartclass.ts
        generate.ts              # sinh dữ liệu phụ (các trường/lớp khác) bằng seed cố định
      mockRepository.ts          # cài ReportRepository từ mock
    lib/
      metrics.ts                 # median, mean, stddev, phân dải, chuẩn hoá 0–100
      indices.ts                 # Chỉ số Học tập / Nỗ lực / Hội tụ chủ đề yếu (mục 9)
      insights.ts                # NHẬN ĐỊNH NHANH theo luật (mục 9, giọng humanized)
      format.ts                  # định dạng số/điểm/% kiểu VN
      export/
        excel.ts                 # ExcelJS — workbook nhiều sheet
        pdf.ts                   # jsPDF + html-to-image
        exportService.ts         # export(model, 'xlsx'|'pdf', scope)
        chartImage.ts            # chụp node chart → PNG cho cả Excel & PDF
    stores/
      uiStore.ts                 # role, scope, filter (môn/kì/khối), theme (light/dark), reduced-motion
    docs/superpowers/specs/...
```

**Tầng dữ liệu đổi được:** mọi màn đọc qua `ReportRepository`. Demo dùng `mockRepository`. Sau này thay bằng Apollo/GraphQL chỉ cần cài lại interface ở một chỗ.

---

## 6. Tầng dữ liệu (mock nhưng đúng hình dạng production)

### 6.1 Dữ liệu THẬT (lớp hero)
Trích sẵn từ `THPT SƠN TÂY _ BÁO CÁO KQ THI THỬ THPT ĐỊA LÝ.xlsx` và nhúng vào `sontay.real.ts`:
- **108 học sinh** (44 ở mã đề gốc 1, 64 ở mã đề gốc 2): họ tên thật, điểm, số câu đúng, "chủ đề làm tốt", "chủ đề cần hỗ trợ".
- **Tổng hợp:** 108 HS · điểm TB 7.86 · trung vị 8; phân bố theo dải (Dưới 5: 1 · 5–6.49: 11 · 6.5–7.99: 39 · 8–8.99: 32 · 9+: 25); histogram chi tiết theo bin 0.5.
- **So sánh 2 mã đề:** mã 1 (44 HS · TB 7.97 · trung vị 8) vs mã 2 (64 HS · TB 7.79 · trung vị 7.875).
- **10 câu sai nhiều nhất mỗi mã đề:** chủ đề, nội dung câu, đáp án đúng, **lựa chọn sai phổ biến**, tỉ lệ sai.
- **Tỉ lệ đúng theo 6 chủ đề** mỗi mã đề (kèm số câu) để dựng "TỈ LỆ ĐÚNG THEO CHỦ ĐỀ THEO MA TRẬN".

Học sinh **Lê Trung Hiếu** được thêm vào lớp 12 Văn của Sơn Tây (mã đề 1) với hồ sơ đầy đủ để demo view Phụ huynh/HS.

### 6.2 Dữ liệu sinh thêm (để có nhiều cấp)
Bằng seed cố định (không random lúc chạy → demo ổn định):
- **Phòng GD** chứa **5 trường** (Sơn Tây là trường hero, dữ liệu thật; 4 trường còn lại sinh hợp lý quanh mức của Sơn Tây).
- Mỗi trường: khối 10/11/12, mỗi khối vài lớp; lớp ~36–42 HS; vài môn (Toán, Văn, Anh, Lí, Hóa, Sinh, Sử, Địa…).
- Mỗi lớp có dữ liệu 3 mặt: SmartClass (vài buổi), Nhiệm vụ (vài bài), một kì thi thử.
- Tên học sinh/giáo viên lấy từ ngân hàng tên Việt thật, không trùng kiểu máy móc.

### 6.3 Types (đúng tên trường như production)
- **C/Thi & B/Nhà:** `MissionReportView` (avg/min/max/stddev, completion_rate, score_distribution, top/lowest_student), `MissionStudentReportView` (total_score, correct/wrong_count, duration, completed_at, category), `MissionQuestionReportView` (correct_rate, hotspots_stats, question_category, difficulty, answered_percent).
- **A/Lớp:** `SessionAnalytics`, `AttendanceRecord`, `EngagementDataPoint`, `QuizAnalytics/QuizResponse`, `LeaderboardEntry`, `StudentCumulativeMetrics`, `ClassCumulativeMetrics`.
- **Median** không có trong view production → `lib/metrics.ts` tự tính client-side từ mảng điểm (ghi chú "tính tại chỗ").

---

## 7. Design system & theming

- **Copy nguyên** các file token từ `gk-content-forge/src/styles/untitled/*` và `styles.css` (ánh xạ semantic roles + `@theme inline`). Tô màu **chỉ qua token**, không hardcode hex (theo skill `mobifone-ui`).
- **Màu thương hiệu:** primary blue `#237BD3` (CTA), accent red `#E30613` (chỉ dùng cho cờ "cần hỗ trợ"/dưới ngưỡng, không trang trí), warning orange `#FFA23A` (mức trung bình).
- **Bảng màu biểu đồ:** `[#237BD3, #E30613, #FFA23A, #041F4A, #666666]`; dải điểm dùng ramp tuần tự **tốt→yếu**: navy/blue (giỏi) → xanh (khá) → cam (trung bình) → đỏ (cần hỗ trợ) để đọc được ngay.
- **Radius/shadow/spacing:** dùng biến CSS có sẵn, grid 4px; card = `bg-card border shadow-sm rounded-lg`; nổi (menu/modal) bỏ border, tăng shadow.
- **Dark mode:** có, bật/tắt ở UserMenu; chuyển mượt; biểu đồ đổi nền/độ tương phản theo theme.
- **Giọng chữ:** câu chữ sentence case, xưng "em/lớp/giáo viên", theo skill `humanized` (mục 14). Số có dấu phân tách, %, đơn vị rõ.

---

## 8. Animation ("xịn xò, nguy hiểm") — tôn trọng `prefers-reduced-motion`

- **Màn Chọn tài khoản:** nền gradient động (chuyển màu chậm theo token brand), thẻ tài khoản trôi vào theo stagger, hover nhấc + đổ bóng, bấm → chuyển cảnh mở rộng vào app.
- **Chuyển màn:** page transition mượt (fade + slide nhẹ) qua framer-motion `AnimatePresence`.
- **Vào màn:** thẻ KPI và biểu đồ **reveal theo cuộn** + stagger; **số đếm lên** (CountUp); **biểu đồ vẽ dần** (Recharts `isAnimationActive` + easing).
- **Tương tác:** hover điểm dữ liệu phóng nhẹ + tooltip mượt; tab đổi có underline trượt; bộ lọc đổi thì số "morph" sang giá trị mới.
- **Cao trào:** **confetti** khi một lớp/HS đạt mốc (ví dụ ≥90% hoàn thành, hoặc điểm TB lớp ≥8) — chỉ bắn 1 lần khi vào màn, có thể tắt.
- **Hero ở cấp Phòng/Trường:** số liệu lớn chạy parallax nhẹ khi cuộn; bản đồ/heatmap fade-in từng ô.
- **Nguyên tắc đọc số:** hiệu ứng chỉ ở lúc *xuất hiện*; khi đang đọc, biểu đồ đứng yên, không nhấp nháy. Mọi animation tắt sạch khi người dùng bật giảm chuyển động.

---

## 9. Chỉ số tổng hợp & nhận định (trung thực)

### 9.1 Hai chỉ số TÁCH RIÊNG (luôn lộ thành phần)
- **Chỉ số Học tập (0–100)** = `0.35 × Thi + 0.35 × Nhà + 0.30 × QuizLớp`, mỗi phần chuẩn hoá 0–100 trên thang điểm. Thiếu mặt nào thì chia lại trọng số và ghi "một phần". **Không** nhét điểm danh/engagement/game/điểm thưởng vào.
- **Chỉ số Nỗ lực (0–100)** = `0.50 × Chuyên cần + 0.30 × Hoàn thành nhiệm vụ + 0.20 × Nộp đúng hạn`.
- Thẻ chỉ số hiển thị **3 thanh thành phần** bên dưới con số tổng; có **slider chỉnh trọng số** (demo) để thấy số đổi theo.

### 9.2 Phân tích GAP (giá trị sư phạm chính)
- Nỗ lực cao + Học tập thấp → gợi ý "đổi cách dạy/ôn"; Nỗ lực thấp + Học tập cao → "đang học dưới sức".
- Scatter cấp lớp: trục X mức tham gia, trục Y kết quả; chỉ dùng để chẩn đoán lớp, không chấm điểm cá nhân.

### 9.3 Hội tụ chủ đề yếu (triangulation)
- Với mỗi chủ đề, so tỉ lệ đúng ở 3 mặt (quiz lớp / nhiệm vụ / thi). Chủ đề yếu ở **≥2/3 mặt** → "điểm yếu xác nhận", đưa lên đầu danh sách "chủ đề cần hỗ trợ". Hiển thị 3 chấm trạng thái mỗi chủ đề.

### 9.4 NHẬN ĐỊNH NHANH theo luật (giọng humanized, audit được)
Sinh từ số liệu thật bằng luật cố định, ví dụ mẫu câu:
- "Điểm trung bình mã đề 1 là 7,97. Có 5 câu các em còn làm sai nhiều (đúng dưới 70%), nên chữa kỹ mấy câu này trước."
- "Chủ đề Ngoại thương và kinh tế cả lớp làm chưa tốt (đúng khoảng 49%). Khi ôn, giáo viên có thể cho các em làm lại vài câu dạng này."
- "Một số câu có nhiều em cùng chọn sai một đáp án — có thể các em đang hiểu nhầm giống nhau, nên giải thích lại chỗ đó."
- "Lớp có 11 em ở nhóm 5–6,49 điểm. Đây là nhóm nên để ý thêm trong các buổi ôn tới."

Quy tắc viết: bắt đầu bằng *sự việc* → *có thể nghĩa là gì trên lớp* → *một việc nên làm*. Không lạm dụng "cần/ưu tiên", không phán xét học sinh.

---

## 10. Đặc tả từng màn

### 10.1 Màn Chọn tài khoản (`/`)
4 thẻ tài khoản (mục 3), nền gradient động, logo, lời chào theo giờ. Bấm thẻ → vào `/app/...` đúng vai.

### 10.2 AppShell (`/app`)
- **TopBar:** logo · tên hệ thống · (giữa) thanh **bộ lọc toàn cục** (Môn / Kì / Khối) · (phải) chuông thông báo (mock list) · UserMenu (avatar, tên, vai trò, Dark mode, **Đăng xuất** → về `/`).
- **ScopeBreadcrumb:** ngay dưới TopBar, ví dụ `Phòng GD Sơn Tây › THPT Chuyên Sơn Tây › Khối 12 › 12 Văn › Lê Trung Hiếu`. Mỗi crumb bấm được.
- **Sidebar (tuỳ vai):** lối tắt tới các mặt/khu vực; thu gọn được.
- **RoleBadge:** nhãn vai trò hiện tại.

### 10.3 L0 · Phòng (`/app/phong`) — vai Phòng GD
- KPI toàn Phòng: số trường, tổng HS, chuyên cần TB, hoàn thành nhiệm vụ TB, điểm thi TB + trung vị, % HS cần hỗ trợ.
- **Heatmap Trường × chỉ số** (điểm thi TB, hoàn thành %, chuyên cần %, %cần hỗ trợ) — ô màu theo ngưỡng, bấm ô → vào trường.
- Bảng xếp hạng trường (sort được) + bar so sánh điểm TB giữa trường.
- Xu hướng theo kì (line). Drill: bấm trường → L1.

### 10.4 L1 · Trường (`/app/truong/:id`) — vai Hiệu trưởng
- KPI strip trường (sĩ số, chuyên cần, hoàn thành NV, điểm TB+trung vị, %cần hỗ trợ) — có CountUp + sparkline.
- **Heatmap Lớp × Môn** (điểm TB) — bấm ô → vào lớp (theo môn đã chọn).
- Bảng lớp (sort theo từng chỉ số) + **Top chủ đề yếu toàn trường** (hội tụ).
- Xu hướng theo thời gian. Nút **Xuất** (one-pager PDF/Excel cho lãnh đạo). Drill: lớp → L2.

### 10.5 L2 · Lớp (`/app/lop/:id`) — vai Giáo viên (xương sống)
Tab `Tổng hợp · Học tại lớp · Học tại nhà · Qua các kì thi` (mục 3). Drill: bấm hàng học sinh → L3.

**Tab Tổng hợp**
- 2 thẻ chỉ số (Học tập / Nỗ lực) lộ 3 thành phần + slider trọng số.
- Phân bố điểm theo dải (BandDistribution).
- **ConvergencePanel** — top chủ đề yếu hội tụ 3 mặt (3 chấm).
- **RosterTable** — danh sách HS, sort theo từng sub-score; cờ "cần hỗ trợ" (đỏ, dùng tiết chế).
- Scatter tham gia ↔ kết quả (chẩn đoán lớp).

**Tab Học tại lớp (SmartClass)**
- Timeline engagement (area, đánh dấu đỉnh/đáy theo hoạt động) + chú thích "đây là mức độ hoạt động, không phải mức học được".
- Item bar quiz tại lớp (khó nhất lên đầu, có nhãn %).
- Donut điểm danh + RosterTable điểm danh (đi muộn/vắng/về sớm).
- Leaderboard game (badge huy chương) — ghi rõ "mang tính khích lệ".

**Tab Học tại nhà (Nhiệm vụ)**
- Stacked bar trạng thái (Chưa làm/Đang làm/Đã nộp/Đã chấm) theo từng nhiệm vụ + KPI tỉ lệ hoàn thành.
- Histogram điểm + KPI (TB/min/max/độ lệch).
- Item analysis từng câu (correct_rate + **đáp án sai phổ biến** distractor bar).
- Scatter thời gian làm ↔ điểm (gắn cảnh báo "để tab mở làm sai thời gian").
- Bảng nhiệm vụ: số lần làm, nộp muộn, điểm.

**Tab Qua các kì thi** (khớp đúng 4 sheet mẫu)
- KPI: tổng HS, điểm TB, **trung vị** (tính tại chỗ).
- BandDistribution + histogram chi tiết (bin 0.5).
- **CodeCompare** — so sánh 2 mã đề (số HS, TB, trung vị) bằng grouped bar + KPI cặp, hiện N rõ.
- **TopMissedTable** — Top-10 câu sai nhiều nhất/mã đề (chủ đề, nội dung, đáp án đúng, lựa chọn sai phổ biến, tỉ lệ sai) + distractor bar.
- **TopicMatrixBars** — tỉ lệ đúng theo 6 chủ đề, hiện **số câu** kế bên + vạch mục tiêu ma trận.
- **InsightCallout** — NHẬN ĐỊNH NHANH theo luật.
- Bảng chi tiết HS (điểm, số câu đúng, chủ đề làm tốt, chủ đề cần hỗ trợ) — bấm hàng → L3.

### 10.6 L3 · Học sinh (`/app/hoc-sinh/:id`)
- Header: tên, lớp, ảnh đại diện chữ; **2 chỉ số + 3 thành phần** cạnh nhau; mũi tên xu hướng.
- 3 panel (Lớp / Nhà / Thi) dạng tab hoặc xếp dọc:
  - Lớp: lịch sử điểm danh, độ chính xác quiz, radar 4 trục (kiến thức/tham gia/hợp tác/hoạt động) + nhận xét *bản nháp cho giáo viên*.
  - Nhà: danh sách nhiệm vụ (trạng thái/điểm/số lần/thời gian), chip chủ đề mạnh–yếu.
  - Thi: điểm từng kì, chủ đề mạnh/yếu, câu sai tiêu biểu.
- **"Chủ đề cần hỗ trợ — tổng hợp 3 mặt"**: phần kết luận hành động, dùng cho họp phụ huynh.
- **Vai Phụ huynh/HS (Lê Trung Hiếu):** ẩn xếp loại AI gắt, giọng nhẹ, nhấn tiến bộ + 1–2 việc nên làm ở nhà.

### 10.7 Trang in A4 (`/app/in/...`) & Modal Xuất
- Trang in: layout cố định khổ A4, ẩn nav, có trang bìa (tên trường/lớp/kì, ngày), tiêu đề mục — dùng làm nguồn chụp PDF.
- Modal Xuất (mở từ nút Xuất ở mọi cấp): chọn **PDF / Excel**, chọn phạm vi (màn hiện tại / cả lớp / cả trường), với Excel cho chọn sheet. Có trạng thái đang tạo + xong.

---

## 11. Inventory component tái dùng

**UI primitives (shadcn):** Button, Card, Table, Tabs, Dialog, Sheet, Badge, Progress, Select, DropdownMenu, Tooltip, Skeleton, Breadcrumb, ScrollArea, Switch, Slider, Avatar, Separator, Popover, Sonner (toast).

**Motion:** `Reveal` (scroll-trigger), `CountUp`, `Stagger`, `PageTransition`, `Confetti`, `AnimatedGradient`.

**Report blocks:**
- `KpiCard` (số lớn + CountUp + sparkline + trend +/−, màu theo ngưỡng)
- `IndexCard` (chỉ số 0–100 + 3 thanh thành phần + slider trọng số)
- `BandDistribution` (dải điểm: count + %)
- `RosterTable` (TanStack-style sort, cờ cần hỗ trợ, bấm hàng drill)
- `ConvergencePanel` (chủ đề yếu, 3 chấm 3 mặt)
- `InsightCallout` (nhận định rule-based)
- `TopMissedTable` (+ distractor bar)
- `TopicMatrixBars` (bar + số câu + vạch ma trận)
- `CodeCompare` (2 mã đề)
- `StudentRadar` (4 trục)
- `Heatmap` (lớp×môn, trường×chỉ số)
- `AttendanceDonut`, `EngagementTimeline`, `CompletionStacked`, `ScoreHistogram`, `EffortScatter`, `Leaderboard`

---

## 12. Inventory biểu đồ (Recharts 3) — ưu tiên dễ xem

| Biểu đồ | Dùng ở | Ghi chú dễ xem |
|---|---|---|
| KPI + sparkline | mọi cấp | số đếm lên, trend màu |
| Donut điểm danh | Lớp/Lớp | tâm hiện tỉ lệ %, ≤4 lát |
| Area engagement | Lớp/Lớp | 1 series, đánh dấu đỉnh/đáy |
| Histogram dải điểm | Nhà, Thi | ramp tốt→yếu, nhãn count+% |
| Bar item-analysis ngang | Lớp, Nhà, Thi | sort khó nhất lên đầu, nhãn % |
| Grouped bar 2 mã đề | Thi | hiện N, ≤2 nhóm |
| Distractor bar | Nhà, Thi | đáp án đúng xanh, sai phổ biến đỏ |
| Topic bar + vạch ma trận | Thi | số câu cạnh bar |
| Radar 4 trục | Học sinh | nhãn rõ từng trục |
| Heatmap | Phòng, Trường | màu ngưỡng, bấm ô drill |
| Scatter tham gia↔kết quả | Lớp | chỉ cấp lớp, có đường xu hướng |
| Stacked bar hoàn thành | Nhà | thứ tự trạng thái cố định |
| Line xu hướng theo kì | Phòng, Trường | ≤5 đường |

Quy ước chung: không 3D, không trục kép, không hơn 5 series; luôn có nhãn số trực tiếp khi đủ chỗ; tooltip gọn; chú thích ngắn dưới biểu đồ "có ý nghĩa thật" vs "tham khảo".

---

## 13. Xuất Excel & PDF (ưu tiên #1)

**Nguồn dữ liệu duy nhất:** cả biểu đồ trên màn lẫn file xuất đều đọc từ cùng object model → số không bao giờ lệch.

### 13.1 Excel (.xlsx — ExcelJS)
Phần Thi tái tạo đúng workbook mẫu Sơn Tây:
- **Sheet "TỔNG HỢP":** tiêu đề + trường/đợt; KPI (tổng HS, TB, trung vị); bảng phân bố dải (count + %); so sánh 2 mã đề; bảng câu sai nhiều nhất; histogram chi tiết; **nhúng ảnh** biểu đồ phân bố.
- **Sheet "MÃ ĐỀ GỐC 1" / "MÃ ĐỀ GỐC 2":** KPI; NHẬN ĐỊNH NHANH (text rule-based); phân bố; tỉ lệ đúng theo chủ đề (chủ đề / số câu / tỉ lệ); histogram.
- **Sheet "Chi tiết học sinh":** mỗi HS một dòng (Học sinh, Điểm, Số câu đúng, Chủ đề làm tốt, Chủ đề cần hỗ trợ), tách theo mã đề.
- Với báo cáo tổng (cấp lớp/trường): thêm các sheet "Tổng hợp", "Học tại lớp", "Học tại nhà".
- Định dạng: header có nền brand + chữ trắng, freeze panes hàng tiêu đề, định dạng số (1 chữ số thập phân cho điểm, % cho tỉ lệ), độ rộng cột tự co, tô màu ngưỡng cho ô điểm.
- Tải bằng `file-saver`, tên file: `BaoCao_<Trường>_<Lớp/Kì>_<yyyy-mm-dd>.xlsx`.

### 13.2 PDF (jsPDF + html-to-image)
- Render trang in A4 riêng (mục 10.7), chụp ở `pixelRatio: 2` cho nét.
- Trang bìa + tiêu đề mục bằng text jsPDF (chọn/đọc được), ảnh biểu đồ nhúng dưới mỗi mục; tự ngắt trang theo chiều dọc.
- Tên file: `BaoCao_<...>_<yyyy-mm-dd>.pdf`.

### 13.3 Export service
`exportService.export(model, target, scope)` — lazy-import ExcelJS/jsPDF để nhẹ bundle; trả tiến trình cho modal.

---

## 14. Câu chữ (theo skill `humanized`)

- Nhãn: "Học tại lớp", "Học tại nhà", "Qua các kì thi", "Chủ đề cần hỗ trợ", "Chuyên cần", "Nộp đúng hạn".
- Nhận định: bắt đầu bằng sự việc, nói khả năng trên lớp, gợi một việc nên làm; trộn "nên / có thể / phù hợp để / để ý thêm"; không câu nào cũng "Cần".
- Học sinh điểm thấp: dùng "cần theo dõi/hỗ trợ", không gọi "yếu/kém" trừ khi trích dải điểm.
- Tín hiệu rời tab/thời gian bất thường: gọi là "tín hiệu để theo dõi", không khẳng định gian lận.
- Không emoji trong UI sản phẩm, không bôi đậm thừa, không giọng quảng cáo.

---

## 15. Tiêu chí nghiệm thu & luồng hero

**Luồng hero (phải mượt tuyệt đối):**
`Chọn tài khoản (Phạm Quốc Đạt – Hiệu trưởng)` → `L1 Trường Sơn Tây` → bấm ô heatmap `12 Văn` → `L2 tab Qua các kì thi` (thấy đúng số liệu thật: TB 7,86 · trung vị 8 · 2 mã đề · top câu sai) → bấm HS `Lê Trung Hiếu` → `L3` → **Xuất PDF** và **Xuất Excel** thành công.

**Nghiệm thu chung:**
- Mở app ra màn Chọn tài khoản; chọn mỗi tài khoản vào đúng màn khởi đầu; Đăng xuất quay lại Chọn tài khoản.
- Mọi breadcrumb, tab, ô heatmap, hàng bảng, nút lọc đều bấm được; không có nút chết, không màn trắng.
- Số trên màn = số trong file xuất; lớp hero khớp file Excel gốc.
- Excel mở được, đúng 4 sheet phần Thi, có style + ảnh chart; PDF nét, có bìa + mục.
- Dark mode hoạt động; `prefers-reduced-motion` tắt animation.
- `npx tsc --noEmit` sạch; `npm run build` chạy được.

---

## 16. Phân pha thực hiện (writing-plans sẽ chi tiết hoá)

1. Scaffold Vite + Tailwind 4 + shadcn + copy token MobiFone; AppShell + router + màn Chọn tài khoản + đăng xuất.
2. Tầng dữ liệu: types + repository + nhúng dữ liệu thật Sơn Tây + generator nhiều cấp.
3. `lib/metrics`, `lib/indices`, `lib/insights` (rule-based, humanized) + test cho phần tính toán.
4. Bộ biểu đồ + report blocks (KpiCard, IndexCard, BandDistribution, TopMissedTable, TopicMatrixBars, CodeCompare, ConvergencePanel, RosterTable, Heatmap, Radar…).
5. Các màn L0/L1/L2(4 tab)/L3 + drill-down + bộ lọc toàn cục.
6. Animation (motion components, page transition, count-up, reveal, confetti, gradient) + dark mode + reduced-motion.
7. Export: trang in A4 + chartImage + excel.ts + pdf.ts + exportService + modal Xuất.
8. Polish UI/UX, kiểm tra luồng hero, build sạch.

---

## 17. Mở rộng sau (ngoài demo)

- Đồng bộ dữ liệu thật SmartClass + gkebook về một kho; thống nhất **taxonomy chủ đề** giữa hai hệ (điều kiện để "hội tụ chủ đề yếu" chạy thật).
- Thêm field median + insight ở backend view; precompute "chủ đề mạnh/yếu theo HS".
- Phân quyền thật, đăng nhập thật, audit log.
