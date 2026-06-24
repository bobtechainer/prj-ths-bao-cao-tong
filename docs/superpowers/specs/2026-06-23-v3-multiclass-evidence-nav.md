# v3 — Đa lớp + Dẫn chứng + Điều hướng ổn định + Lọc theo trang

Ngày 2026-06-23 · iteration trên `prj-ths-bao-cao-tong`. Đã chốt với người dùng.

## Quyết định người dùng
- Dẫn chứng **đầy đủ**: mọi điểm số → Đề thi + Bài làm của HS (cả thi & nhiệm vụ).
- Heatmap → **bảng so sánh sắp xếp được** (ô = số + thanh, hàng bấm mở, rõ affordance).
- Dữ liệu **phong phú**: GV bộ môn 5–6 lớp, ~40 HS/lớp, đề ~40 câu, bài làm từng câu.
- Điều hướng **ổn định** (navigation-consistency): sidebar cố định, danh sách thành trang, có switcher.

## A. Sửa nhanh
- Vai trò "Học sinh" (bỏ "/ Phụ huynh").
- Kì = Học kì 1 (9/2025–1/2026) / Học kì 2 (1–5/2026).
- Bỏ thanh trọng số ở Chỉ số học tập.
- Cuộn lên đầu khi đổi tab/đổi trang (`ScrollToTop`).
- `cursor-pointer` ở thẻ tài khoản + mọi ô/hàng bấm được.
- `MetricExplainer`: nút "Chỉ số này là gì?" → giải thích humanized (dùng làm gì · đọc thế nào · đo bằng gì).

## B. Mô hình đa lớp (gkebook: homeroom vs subject)
- `Class.type: 'homeroom'`; `Teaching { teacherId, subject, classIds[] }`.
- GV Nguyễn Minh Hồng: chủ nhiệm 12 Văn + dạy Địa lí 6 lớp (12 Văn/Toán/Anh/Lí/Hóa/Sinh).
- Lớp chủ nhiệm → báo cáo đầy đủ 4 mặt. Lớp bộ môn → báo cáo theo môn (`/app/lop/:id?subject=Địa lí`).
- HS: homeroom + học nhiều môn → hồ sơ thêm bảng kết quả theo môn + danh sách lớp.

## C. Dẫn chứng (routes mới)
- `/app/de-thi/:examId` — Đề thi: ma trận + ~40 câu (chủ đề, nội dung, lựa chọn, đáp án đúng, % đúng).
- `/app/bai-lam/:examId/:studentId` — Bài làm HS: đáp án từng câu (đúng/sai, em chọn gì), điểm, chủ đề mạnh/yếu.
- `/app/nhiem-vu/:missionId` (+ `/:studentId`) — nhiệm vụ + bài làm.
- Mọi điểm trong bảng/biểu đồ → link tới các trang này. "Lịch sử bài về nhà" mỗi dòng link tới nhiệm vụ + bài làm.
- Data: ngân hàng câu hỏi theo chủ đề thật (nhúng 10 câu sai thật Sơn Tây), bài làm từng câu của mỗi HS khớp điểm.

## D. Điều hướng ổn định
- Sidebar **cố định theo vai** (không đổi khi drill): Phòng[Tổng quan·Các trường·So sánh môn] · Hiệu trưởng[Tổng quan·Các lớp·Học sinh·So sánh môn] · GV[Tổng quan·Lớp chủ nhiệm·Lớp bộ môn·Học sinh] · HS[Hồ sơ].
- Trang danh sách: `Các lớp`, `Học sinh`, `So sánh theo môn`, `Các trường` — có tìm kiếm/lọc.
- Switcher trên trang chi tiết: dropdown đổi lớp/HS + "‹ trước · sau ›".
- Breadcrumb + nút Quay lại (đã có) ở đầu nội dung; back trình duyệt chuẩn.

## E. Lọc theo trang (bỏ filter ở topbar)
- `PageFilters` cục bộ mỗi trang: Phòng(Kì·Khối) · Trường(Kì·Khối·Môn) · Lớp(Kì[+Môn nếu chủ nhiệm]).
- `SearchableRoster`: tìm theo tên + sắp xếp + lọc "cần hỗ trợ".

## F. Heatmap → ComparisonTable
- Rows=lớp/trường, cols=môn; ô = số + thanh màu; sort theo cột; hover hiện "Mở"+cursor; bấm mở (kèm môn); có chú thích thang màu.

## Pha thực hiện (verify từng pha)
1. Data model: types đa lớp + ngân hàng câu hỏi + bài làm + missions giàu + repository.
2. Điều hướng ổn định: sidebar cố định + ScrollToTop + bỏ topbar filter + list pages khung.
3. Trang danh sách (Các lớp/Học sinh/So sánh môn/Các trường) + SearchableRoster + ComparisonTable + PageFilters.
4. Dẫn chứng: 4 routes + wiring link từ mọi điểm.
5. Sửa nhanh: role, kì, bỏ slider, cursor, MetricExplainer, switcher.
6. Verify: gates + ảnh chụp mọi màn + thử drill/back/switch + đề/bài làm.

## Nghiệm thu
- Menu trái đứng yên ở mọi cấp; drill/đi ngang/quay lại mượt.
- Mọi điểm số bấm ra đề + bài làm; không trang chết.
- Lọc/tìm kiếm theo trang; bảng so sánh rõ bấm được.
- Chỉ số có giải thích humanized; bỏ trọng số.
- `tsc` sạch · test xanh · build xanh.
