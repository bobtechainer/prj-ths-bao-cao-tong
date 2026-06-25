# Giáo viên — Điều hướng lớp & bố cục (thiết kế)

**Ngày:** 2026-06-25
**Phạm vi:** Vai **Giáo viên** (`role: "giaovien"`) — điều hướng giữa các lớp và bố cục trang lớp. Ba vai còn lại (Phòng / Hiệu trưởng / Học sinh) **không đổi**.

## Mục tiêu

Giáo viên hiện không hiểu "bấm kiểu gì": cùng một báo cáo lớp (`/app/lop/:id`) tới được từ 3 lối (mục menu "Lớp chủ nhiệm", trang "Lớp bộ môn", và bộ chọn lớp trong trang), lớp chủ nhiệm xuất hiện ở cả 3 nơi, các liên kết còn lệch tham số (`?mon=` vs `?subject=`, `?tab=` cũ). Mô hình dữ liệu lại hardcode **1 giáo viên = 1 lớp chủ nhiệm + 1 môn**.

Thiết kế lại để: (1) mô hình hoá đúng thực tế giảng dạy (nhiều lớp chủ nhiệm, dạy bộ môn trong & ngoài lớp chủ nhiệm, nhiều môn); (2) điều hướng một lối rõ ràng bằng **cây lớp ở thanh bên**, luôn biết đang xem **vai nào**.

## Quyết định đã chốt (qua brainstorm)

1. **Dựng đủ ca tổng quát bằng dữ liệu mock.** Địa lí ở lớp 12 Văn dùng số thật; các lớp/môn còn lại seeded ổn định.
2. **Nhóm theo vai trò:** Chủ nhiệm vs Bộ môn (nhóm con theo môn).
3. **Bố cục B — cây lớp ở thanh bên:** bấm thẳng vào lớp, nhóm gập được.
4. **Lớp vừa-chủ-nhiệm-vừa-dạy-môn (12 Văn) xuất hiện ở CẢ hai nhóm.** Bấm dưới Chủ nhiệm → xem toàn diện; bấm dưới Bộ môn·Địa lí → xem riêng môn. Không dùng nút gạt; có một liên kết chéo trong trang.

## Global Constraints (ràng buộc toàn dự án)

- **Dẫn chứng dữ liệu:** chỉ được bịa **điểm/số thô**; mọi chỉ số báo cáo (learningIndex/effortIndex, TB, tỉ lệ…) phải **tính ra từ input**, không gán thẳng. Mọi câu Trợ lý mang `figures` bám số.
- **Số thật giữ thật:** lớp `12 Văn` × môn `Địa lí` = đúng dữ liệu Sơn Tây hiện có, không đổi byte. Phần seeded phải **deterministic** (mulberry32 `Rng`, không `Math.random`, không `Date.now`).
- **Mốc thời gian cố định:** `DEMO_NOW = "2026-06-10"`, kỳ thi chính thức `2026-06-26`; narration **đúng thì** (chỉ chèn "trước {sự kiện}" khi sự kiện ở tương lai).
- **Văn phong /humanized:** giọng giáo viên, không "demo/minh hoạ", không sales, không emoji trang trí.
- **Token MobiFone Untitled UI:** không hex mới ngoài hằng số sẵn có; **trạng thái/vai không chỉ truyền bằng màu** (badge có chữ + chấm/icon); tôn trọng `prefers-reduced-motion`.
- **Không phá vai khác:** route/dữ liệu của Phòng/Hiệu trưởng/Học sinh và lớp dùng chung phải chạy như cũ; toàn bộ test cũ giữ xanh.
- **`tsc --noEmit` sạch · `vitest run` xanh · `vite build` OK** trước khi đóng mỗi task.

---

## Kiến trúc

Tận dụng tối đa máy "hành trình" đã có. Hai vai của trang lớp ánh xạ thẳng vào hai chế độ đã tồn tại ở bản học sinh:

| Vai giáo viên | Tái dùng từ | Nội dung |
|---|---|---|
| **Chủ nhiệm** (toàn diện) | *Overview chéo môn* (như `getStudentOverview` + `buildOverviewChapters`) | Mở đầu → Các môn → Hội tụ ở cấp lớp + chuyên cần / cần-hỗ-trợ |
| **Bộ môn · {môn}** | `getClassJourney(classId, term, subject)` + `buildClassChapters` | Hành trình lớp đúng một môn |

Cây lớp ở thanh bên là **nguồn điều hướng duy nhất** giữa các lớp (thay cho trang "Lớp bộ môn" phẳng + `ClassPicker`).

## Mô hình dữ liệu

### Types mới (`src/data/types.ts`)

```ts
export type TeachingRole = "chu-nhiem" | "bo-mon";

/** Một lần gán dạy bộ môn: (lớp × môn). */
export interface SubjectAssignment {
  classId: string;
  subject: Subject;
}

/** Hồ sơ giảng dạy của một giáo viên. */
export interface TeacherProfile {
  teacherId: string;            // = account.scopeId
  teacherName: string;
  homeroomClassIds: string[];   // lớp chủ nhiệm (0..n)
  subjectAssignments: SubjectAssignment[]; // các (lớp × môn) dạy bộ môn
}
```

`Teaching` cũ (1 chủ nhiệm + 1 môn) bị **thay thế**; mọi nơi đang dùng `getTeaching()` chuyển sang `getTeacherProfile(teacherId)`.

### Cây điều hướng (suy ra từ profile)

```ts
export interface ClassTreeLeaf {
  classId: string;
  className: string;            // "12 Văn"
  role: TeachingRole;
  subject?: Subject;            // có khi role==="bo-mon"
  alsoTeachesSubject?: Subject; // có khi role==="chu-nhiem" và GV cũng dạy môn ở lớp này → hiện dấu "+{môn}"
  to: string;                   // URL đầy đủ kèm ?role= & ?mon=
}

export interface ClassTreeGroup {
  key: string;                  // "chu-nhiem" | "bo-mon:Địa lí" | ...
  label: string;                // "Chủ nhiệm" | "Bộ môn · Địa lí"
  leaves: ClassTreeLeaf[];
}
```

`buildClassTree(profile)` trả về: 1 nhóm **Chủ nhiệm** (mỗi `homeroomClassId` một leaf; nếu lớp đó cũng có `SubjectAssignment` của GV thì set `alsoTeachesSubject`) + N nhóm **Bộ môn · {môn}** (gom `subjectAssignments` theo `subject`, sắp theo thứ tự `SUBJECTS`). Lớp 12 Văn vì vừa chủ nhiệm vừa có assignment Địa lí nên **xuất hiện ở cả hai nhóm** (một leaf chủ nhiệm + một leaf bộ môn).

### Hồ sơ demo cô Hồng (`src/data/mock/world.ts`)

Dùng **các lớp Sơn Tây có sẵn** (tất cả khối 12, focus: Văn/Toán/Anh/Lí/Hóa/Sinh — id dạng `son-tay-12-<focus>`, riêng hero là `son-tay-12-van`). **Không tạo lớp mới**; chỉ gán vai/môn để demo ca tổng quát.

```
teacherId   = account "acc-gv".scopeId   (= CLASS_HERO hiện tại)
teacherName = "Nguyễn Minh Hồng"
homeroomClassIds   = [ "son-tay-12-van", "son-tay-12-hóa" ]   // 12 Văn (thật) + 12 Hóa (chủ nhiệm thuần, seeded)
subjectAssignments = [
  { "son-tay-12-van",  "Địa lí" },   // dạy môn TRONG lớp chủ nhiệm — số THẬT
  { "son-tay-12-toán", "Địa lí" },
  { "son-tay-12-anh",  "Địa lí" },
  { "son-tay-12-lí",   "Địa lí" },
  { "son-tay-12-sinh", "Lịch sử" },  // demo đa môn — lớp không chủ nhiệm, môn seeded
]
```

Suy ra cây: **Chủ nhiệm** = {12 Văn (+Địa lí), 12 Hóa}; **Bộ môn · Địa lí** = {12 Văn, 12 Toán, 12 Anh, 12 Lí}; **Bộ môn · Lịch sử** = {12 Sinh}. 12 Văn ở **cả hai** nhóm; 12 Hóa là chủ nhiệm thuần (cô không dạy môn ở đó → không có dấu "+môn"). Mọi (lớp × môn) ngoài (12 Văn × Địa lí) đi qua đường **seeded**.

### Dữ liệu lớp × môn seeded

- **Bộ môn:** mở rộng `getClassJourney(classId, term, subject)` để môn ≠ Địa lí dùng đường seeded (song song `buildStudentSubjectSlice` đã có cho học sinh) — chỉ bịa điểm thô, chỉ số tính ra, weakTopics theo `SUBJECT_TOPICS`.
- **Chủ nhiệm (overview lớp):** thêm `getClassOverview(classId, term)` — bản lớp của overview chéo môn: với mỗi môn trong `SUBJECTS` lấy lát lớp × môn, xếp mạnh→yếu, tính `overallLearningIndex` (trung bình các môn), kèm **chuyên cần** và **danh sách cần hỗ trợ** ở cấp lớp. Cấu trúc gương `StudentOverview`/`SubjectEntry`.

## Điều hướng — cây lớp (thanh bên)

- `sidebarSections(account)` cho `giaovien` đổi từ 3 mục phẳng sang: **cây lớp** (các nhóm gập được từ `buildClassTree`) + mục **Học sinh** (giữ).
- Component mới `ClassTree` (trong `src/components/layout/` hoặc cạnh sidebar): render nhóm có thể gập/mở, mỗi leaf là `NavLink`; leaf đang xem tô sáng (`aria-current`), nhóm hiện số lượng; leaf chủ nhiệm có dấu "+{môn}" khi `alsoTeachesSubject`.
- Thanh bên dài: nhóm Bộ môn của môn không phải môn chính có thể mặc định gập; nhóm Chủ nhiệm và nhóm môn chính mở sẵn.
- **Landing** (`nav.ts roleHome`): `giaovien` → lớp chủ nhiệm đầu tiên ở vai Chủ nhiệm (`/app/lop/<homeroom[0]>?role=cn`).

## Trang lớp (`src/routes/lop.tsx`)

Đọc `?role=` (`cn` | `bm`, mặc định suy từ lớp: là homeroom → `cn`, không → `bm`) và `?mon=` (Subject, chỉ dùng khi `bm`; bỏ `?subject=` và `?tab=`).

- **`role=cn`:** `getClassOverview(classId, term)` → `buildClassOverviewChapters(...)` (bản lớp của `buildOverviewChapters`). Badge **"Chủ nhiệm"** (xanh lá + chấm). Nếu GV cũng dạy môn ở lớp này: liên kết chéo "→ Xem môn {môn} của tôi ở lớp này" (sang `role=bm&mon=`).
- **`role=bm`:** `getClassJourney(classId, term, subject)` → `buildClassChapters(...)` như hiện tại. Badge **"Bộ môn · {môn}"** (xanh dương + chấm). Nếu lớp này GV cũng chủ nhiệm: liên kết chéo "→ Xem toàn lớp (chủ nhiệm)".
- `<Journey>` giữ nguyên (đã bỏ trình chiếu, đã có scrollspy + cây thời gian). Bộ lọc Kỳ/Môn trong trang: vai `bm` cho đổi Kỳ (và đổi môn nếu GV dạy lớp đó nhiều môn); vai `cn` chỉ đổi Kỳ (môn = tất cả).

## Thành phần thêm / sửa / bỏ

**Thêm:** `TeacherProfile`/`SubjectAssignment`/`TeachingRole`/`ClassTree*` types; `getTeacherProfile`, `buildClassTree`, `getClassOverview`, đường seeded lớp×môn; component `ClassTree`; `buildClassOverviewChapters`; badge vai + liên kết chéo trong `lop.tsx`.

**Sửa:** `sidebarNav.ts` (cây thay 3 mục phẳng), `lop.tsx` (2 vai + param), `nav.ts` (landing), repository (`getTeacherProfile` thay `getTeaching`), `mockRepository`.

**Bỏ:** `src/routes/lop-bo-mon.tsx` + route `/app/lop-bo-mon`; `ClassPicker` (cây lo việc đổi lớp) — gỡ khỏi `lop.tsx` và xoá file + test nếu không nơi nào khác dùng.

## Data flow

`account (acc-gv)` → `getTeacherProfile(scopeId)` → `buildClassTree` → **ClassTree** (thanh bên). Bấm leaf → `/app/lop/:id?role=&mon=` → `lop.tsx` chọn nhánh `cn`/`bm` → assembler tương ứng → `buildClass(Overview)Chapters` → `<Journey>`.

## Error handling / biên

- `classId` không thuộc profile (gõ URL tay): vẫn render lớp theo `role`/`mon` truyền vào (không chặn), nhưng cây chỉ tô sáng khi khớp; thiếu dữ liệu → trạng thái rỗng lịch sự.
- `role=bm` thiếu `mon` hợp lệ → suy môn đầu tiên GV dạy ở lớp đó; nếu lớp không phải lớp GV dạy môn → fallback môn mặc định "Địa lí".
- Hồ sơ không có lớp chủ nhiệm → landing vào lớp bộ môn đầu tiên.

## Kiểm thử

- **buildClassTree:** đúng nhóm/đếm; 12 Văn có ở cả nhóm Chủ nhiệm (leaf `alsoTeachesSubject="Địa lí"`) lẫn nhóm Bộ môn·Địa lí; nhóm môn sắp theo `SUBJECTS`; URL leaf đúng `?role=`/`?mon=`.
- **getTeacherProfile:** hồ sơ cô Hồng đúng (2 chủ nhiệm, 5 assignment, 2 môn).
- **Seeded provenance:** lớp×môn ≠ (12 Văn×Địa lí) deterministic (gọi 2 lần ra y hệt); chỉ số tính ra (không gán thẳng); (12 Văn×Địa lí) byte-identical số thật.
- **getClassOverview:** cấu trúc bản lớp đúng; `overallLearningIndex` = trung bình môn; mạnh/yếu xếp đúng; có chuyên cần + cần-hỗ-trợ.
- **Route lop.tsx:** `role=cn` ra overview + badge "Chủ nhiệm" + liên kết chéo (khi có); `role=bm&mon=` ra hành trình môn + badge "Bộ môn · {môn}"; param `?subject=`/`?tab=` không còn.
- **Sidebar:** `giaovien` render cây; leaf đang xem `aria-current`.
- **Hồi quy:** tất cả test hiện có xanh; vai khác không đổi.

## Ngoài phạm vi (YAGNI)

- Không sửa Phòng/Hiệu trưởng/Học sinh.
- Không làm chỉnh-sửa hồ sơ giảng dạy (read-only, từ fixture).
- Không thêm chế độ trình chiếu (đã bỏ).
- Không phân quyền thật/đăng nhập thật — vẫn chọn tài khoản qua `?as=`.
