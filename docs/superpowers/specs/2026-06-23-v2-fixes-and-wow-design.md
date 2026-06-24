# v2 — Sửa triệt để điều hướng/layout + thêm "wow" + báo cáo thiết kế

Ngày: 2026-06-23 · Iteration trên `prj-ths-bao-cao-tong`.

## Vấn đề người dùng nêu (phải sửa hết)
1. Điều hướng loạn, **đi xong không quay về được**, không thấy breadcrumb.
2. Danh sách học sinh **trải dài không có scroll**.
3. Hồ sơ **Lê Trung Hiếu rỗng dữ liệu**.
4. **Chưa có "wow"** nào.
5. **PDF chỉ là ảnh chụp màn hình**, không thiết kế.
6. **Dropdown quá ngắn**, che chữ.

## Quyết định (đã chốt với người dùng)
- Wow = **Trang điều hành** (trường/lớp) + **Hồ sơ học sinh "học bạ điện tử"** + **biểu đồ chữ ký**.
- Báo cáo = **PDF nhiều trang thiết kế riêng** (bìa + tóm tắt + mục + số trang), Excel giữ nhiều sheet có style.

## A. Điều hướng
- `components/layout/PageNav.tsx`: breadcrumb nổi bật + nút "← Quay lại {cấp trên}" ở đầu vùng nội dung (dùng `buildChain`).
- Sidebar ổn định theo vai (không đổi danh sách gây rối):
  - phong → Tổng quan + danh sách Trường.
  - truong → Tổng quan trường + danh sách Lớp.
  - giaovien → Tổng quan lớp + **danh sách Học sinh của lớp** (bấm vào hồ sơ).
  - hocsinh → Hồ sơ của tôi.
- Cập nhật `scopeNav` cho khớp (giaovien trả về students của lớp chủ nhiệm).

## B. Cuộn & mật độ
- Mọi bảng/list dài bọc trong khung `max-h-[...] overflow-auto` + header dính: RosterTable, chi tiết HS, danh sách nhiệm vụ.
- Lưới dày hơn (2–3 cột) để giảm chiều dài.

## C. Bộ lọc (FilterBar)
- Nhãn đặt ngoài, trigger đủ rộng (`min-w` theo nội dung), `SelectContent` không che chữ. "Đợt 1 · 2025–2026" hiển thị đủ.

## D. Dữ liệu học sinh (types + builders)
- `StudentProfile` thêm: `examHistory: {term,subject,score,classAvg}[]` (3–4 kì), `classHistory: {session,attendance,quizAccuracy}[]`, `missions` (5–6 dòng thật), giữ radar/weakTopics/note.
- Lê Trung Hiếu: hồ sơ giàu, bám chủ đề Địa lí thật (mạnh: Tự nhiên & thiên tai, Kĩ năng biểu đồ; yếu: Ngoại thương & kinh tế, Vùng kinh tế).

## E. Visual primitives (SVG động, tôn trọng reduced-motion)
- `components/charts/RadialGauge.tsx` — vòng cung 0–100, kim/giá trị đếm lên, màu theo ngưỡng.
- `components/charts/ProgressRing.tsx` — vòng tròn tiến độ + nhãn giữa.
- `components/charts/SignatureChart` — cụm vòng (Học tập/Nỗ lực/…) hoặc bullet; dùng ở hero.

## F. Trang điều hành (Tổng quan) — trường & lớp
- Khối hero: gradient brand mảnh, `RadialGauge` chỉ số đầu, hàng KPI đếm số + sparkline, thẻ **"Điểm nhấn"** (rule-based, humanized).
- Dưới hero: lưới data-dense các thẻ hiện có (heatmap/phân bố/chủ đề…).

## G. Hồ sơ học sinh
- Header dossier: avatar + 2 `ProgressRing` (Học tập/Nỗ lực) + trend.
- Radar năng lực · timeline điểm các kì (LineChart) vs TB lớp · chip mạnh/yếu · bảng nhiệm vụ (scroll) · lời nhắn.

## H. Báo cáo in (PDF thiết kế)
- `routes/print.tsx`: layout A4 (`.report-page` mỗi trang ~794×1123px @96dpi):
  - Trang bìa: logo, "BÁO CÁO …", trường/lớp/kì, ngày, người xuất.
  - Tóm tắt điều hành: KPI + 2–3 nhận định.
  - Mục theo mặt: biểu đồ (render trực tiếp trong print route) + bảng.
  - Header/footer + số trang.
- `lib/export/pdf.ts`: mở dữ liệu, render print route ẩn, **chụp từng `.report-page`** ở `pixelRatio: 2–3` → mỗi ảnh = 1 trang PDF khổ A4. Tiếng Việt nét nhờ web font. Không cap dashboard.
- Cơ chế: print route đọc `?scope=&id=`; export tạo iframe/cửa sổ ẩn hoặc mount tạm rồi chụp. Giải pháp đơn giản & chắc: mount print layout vào một container ẩn ngoài màn (offscreen, vẫn có kích thước) trong chính app rồi chụp.

## Nghiệm thu
- Mọi breadcrumb/nút quay lại/sidebar bấm được; không ngõ cụt.
- Danh sách dài đều có scroll.
- Lê Trung Hiếu có dữ liệu đầy đủ.
- Hero + dossier có hiệu ứng vào màn mượt.
- PDF mở ra là tài liệu nhiều trang thiết kế (bìa + mục), không phải ảnh dashboard.
- Dropdown không che chữ.
- `tsc` sạch · test xanh · build xanh · ảnh chụp xác minh từng phần.
