# Hành trình báo cáo — Bộ kế hoạch (index)

> Spec: `docs/superpowers/specs/2026-06-24-hanh-trinh-bao-cao-design.md`. Bốn plan dưới đây thực thi **tuần tự** (mỗi plan là deliverable test được, phụ thuộc plan trước). Repo KHÔNG dùng git → "Checkpoint" = chạy cổng (`npx tsc --noEmit`; `npx vitest run`; `npx vite build`), không commit.

## Thứ tự & phụ thuộc
1. **[01 — Nền dữ liệu & Trợ lý](2026-06-24-hanh-trinh-01-du-lieu.md)** (8 task) — types journey, ngày/chặng, PrepSurface, `narrate.ts` đúng-thì, `getStudentJourney`/`getClassJourney`. Không UI.
2. **[02 — Vỏ dùng chung + bản Học sinh](2026-06-24-hanh-trinh-02-hoc-sinh.md)** (10 task) — tạo TOÀN BỘ vỏ (`Journey`, `Chapter`, `Narrator`, `CycleBand`, `KyMonPicker`, `FocusPicker`, `TimelineRail`, `PresentationMode`, `ChapterDef`) + `studentChapters` + route học sinh. Phụ thuộc 01.
3. **[03 — Bản Giáo viên (lớp)](2026-06-24-hanh-trinh-03-giao-vien.md)** (5 task) — chỉ `classChapters` + chi tiết lớp + chọn lớp + route lớp; **import vỏ Plan 02, không tạo lại**. Phụ thuộc 01+02.
4. **[04 — Vai trò trên + Xuất + Hoàn thiện](2026-06-24-hanh-trinh-04-cap-tren-xuat.md)** (8 task) — `TroLySummary` cho Phòng/Hiệu trưởng, PDF dạng dài, dọn dẹp. Phụ thuộc 01+03.

## Quyết định chốt từ lượt review (áp dụng khi code)
- **Sở hữu `TroLySummary.tsx`:** **CHỈ Plan 04 Task 1** tạo file `src/components/report/TroLySummary.tsx` (title mặc định "Trợ lý tóm tắt"). **Plan 03 BỎ Task 5** — không tạo file này.
- **Bọc `<Chapter>`:** `Journey` (Plan 02) tự bọc mỗi `ChapterDef` trong `<Chapter id title status>`. Vì vậy **các builder (`studentChapters`, `classChapters`) KHÔNG được tự bọc `<Chapter>`** trong `render()` — trả thẳng nội dung. Không import `Chapter` vào builder.
- **Cuộn-snap (Plan 02 `Journey.tsx`):** để scroll-snap hoạt động, **container phải là vùng cuộn thật**: `overflow-y-auto` + chiều cao giới hạn (vd `h-[calc(100dvh-4rem)]`) cùng `snap-y snap-mandatory`; mỗi `<Chapter>` đặt `snap-start`. Nếu để cuộn ở `body`, snap sẽ không kích hoạt. Khi `reducedMotion` → bỏ snap.
- **Đúng thì xuyên suốt:** trong demo, mọi chặng có dữ liệu đều `past`/`current` (chặng `upcoming` = kỳ thi THPT chính thức, chưa có dữ liệu trên-lớp/ở-nhà). `narrateClassroom`/`narrateHome` dùng thì quá khứ/hiện tại là đúng. Nếu sau này có chặng tương lai mang dữ liệu, truyền thêm `status` để đổi thì.
- **Drill xuống học sinh (Plan 03):** ngoài danh sách "cần hỗ trợ", `RosterTable` trong chi tiết chặng cũng gắn `onRowClick` → `/app/hoc-sinh/:id` (giữ `?ky=&mon=`) để mở hành trình bất kỳ em nào.
- **Lát in PDF:** bản in dùng `term:"ca-nam", subject:"Địa lí"` (bản tổng năm) — CHỦ Ý, không nhất thiết khớp lát Kỳ×Môn đang xem. Nếu sau cần in đúng lát đang xem, mở rộng `ExportScope` thêm `{term,subject}` và truyền từ route.

## Errata bắt buộc
Mỗi plan có khối **"⚠️ Sửa bắt buộc (review)"** ở đầu (Plan 03, Plan 04) hoặc ghi chú tại đây (Plan 01). Đọc trước khi chạy task.

- **Plan 01:** trong `buildStudentJourney`, lấy kỳ thi cuối của chặng bằng `const cExam = (examBuckets[k] ?? []).at(-1) ?? null;` (thay biểu thức off-by-one).
