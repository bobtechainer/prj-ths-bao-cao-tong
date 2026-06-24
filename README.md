# Trường học số · Insight — Báo cáo tổng

Demo báo cáo tổng hợp kết quả học tập của học sinh, gộp ba mặt: **học tại lớp** (SmartClass),
**học tại nhà** (nhiệm vụ) và **qua các kì thi**. Bản demo chạy được đầy đủ luồng, mọi nút bấm được,
mọi màn đi tới được; dữ liệu phần thi thử Địa lí là **số liệu thật** của THPT Chuyên Sơn Tây.

## Chạy thử

```bash
npm install
npm run dev      # mở http://localhost:5174
```

Các lệnh khác: `npm run build` (đóng gói), `npm run test` (vitest), `npm run preview` (xem bản build).

## Tài khoản demo

Mở app ra **màn Chọn tài khoản**. Chọn một tài khoản để vào; trong app, menu người dùng có **Đăng xuất**
để quay lại màn chọn.

| Tài khoản | Vai trò | Vào màn |
|---|---|---|
| Đoàn Thuận Anh Thư | Phòng GD&ĐT | Tổng quan toàn ngành (so sánh các trường) |
| Phạm Quốc Đạt | Hiệu trưởng | Báo cáo trường THPT Chuyên Sơn Tây |
| Nguyễn Minh Hồng | Giáo viên (chủ nhiệm 12 Văn) | Báo cáo lớp 12 Văn |
| Lê Trung Hiếu | Học sinh / Phụ huynh | Hồ sơ học tập của em (giọng nhẹ) |

**Luồng demo nên đi:** Phạm Quốc Đạt → trường Sơn Tây → bấm ô lớp 12 Văn → tab **Qua các kì thi**
(thấy đúng số liệu thật: 108 HS · TB 7,86 · trung vị 8 · 2 mã đề · câu sai nhiều nhất) → bấm một học sinh
→ hồ sơ → **Xuất báo cáo** (Excel hoặc PDF).

## Tính năng chính

- **Bốn mặt báo cáo ở cấp lớp:** Tổng hợp · Học tại lớp · Học tại nhà · Qua các kì thi.
- **Hai chỉ số tách riêng** (không gộp ẩu): Chỉ số Học tập (chỉ từ điểm, lộ 3 thành phần, có chỉnh trọng số)
  và Chỉ số Nỗ lực (hành vi). Kèm view **hội tụ chủ đề yếu** (yếu ở ≥2 mặt mới gắn "cần chú ý").
- **Bám báo cáo mẫu Sơn Tây:** phân bố điểm, histogram, so sánh 2 mã đề, top câu sai + lựa chọn sai phổ biến,
  tỉ lệ đúng theo chủ đề, nhận định nhanh (sinh theo luật, giọng giáo viên).
- **Xuất Excel** (nhiều sheet, có style + nhúng ảnh biểu đồ) và **PDF** (bản in nhiều trang).
- Biểu đồ ưu tiên dễ xem; animation tôn trọng `prefers-reduced-motion`; có giao diện tối.

## Kiến trúc

- **Stack:** Vite + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Recharts 3 + framer-motion +
  React Router 7 + Zustand. Xuất file: ExcelJS, jsPDF, html-to-image.
- **Design system:** MobiFone Untitled UI (token copy từ `gk-content-forge`); tô màu chỉ qua token.
- **Tầng dữ liệu** đứng sau `ReportRepository` (`src/data/repository.ts`). Bản demo dùng `mockRepository`
  (dữ liệu thật Sơn Tây + dữ liệu sinh thêm bằng seed cố định). Đổi sang GraphQL chỉ cần thay repository.

```
src/
  data/        types, repository, mock (sontay.real.ts, world, builders, accounts)
  lib/         metrics, indices, insights (rule-based), format, export (excel/pdf)
  components/  ui (shadcn), charts, report (khối báo cáo), layout, motion
  routes/      account-select, phong, truong, lop (+4 tab), hoc-sinh, print
  stores/      uiStore (vai trò, bộ lọc, giao diện)
```

Tài liệu thiết kế & kế hoạch: `docs/superpowers/specs/` và `docs/superpowers/plans/`.
