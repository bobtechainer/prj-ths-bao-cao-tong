# Giáo viên — Điều hướng lớp & bố cục — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thiết kế lại điều hướng vai Giáo viên thành **cây lớp ở thanh bên** (nhóm theo vai Chủ nhiệm / Bộ môn), với trang lớp **biết vai** (chủ nhiệm = overview tất-cả-môn; bộ môn = hành trình một môn), trên một mô hình giảng dạy tổng quát (nhiều lớp chủ nhiệm, nhiều môn, dạy trong & ngoài lớp chủ nhiệm).

**Architecture:** Tái dùng máy "hành trình" sẵn có. Vai **Chủ nhiệm** dùng *overview chéo môn cấp lớp* (mới — gương `StudentOverview`/`buildOverviewChapters`); vai **Bộ môn** dùng `getClassJourney(classId, term, subject)` + `buildClassChapters` (đã có). Dữ liệu lớp×môn: Địa lí thật, môn khác seeded deterministic. Cây lớp suy ra từ `TeacherProfile`.

**Tech Stack:** Vite 7 + React 19 + TS strict + Tailwind 4 + React Router 7 + Zustand + Vitest. Alias `@` = `src`.

## Global Constraints

- **Dẫn chứng dữ liệu:** chỉ bịa **số thô**; mọi chỉ số (learningIndex/effortIndex/TB/tỉ lệ) **tính từ số thô** qua `learningIndex()`/`effortIndex()`. Không gán thẳng chỉ số.
- **Số thật giữ thật:** `son-tay-12-van` × `Địa lí` = dữ liệu thật hiện có, byte-identical.
- **Deterministic:** chỉ dùng `Rng` (mulberry32). KHÔNG `Math.random`, KHÔNG `Date.now`/`new Date()` không tham số.
- **Mốc thời gian:** `DEMO_NOW="2026-06-10"`, kỳ thi chính thức `2026-06-26`; narration **đúng thì** (chỉ chèn "trước {sự kiện}" khi sự kiện tương lai).
- **/humanized:** giọng giáo viên; không "demo/minh hoạ"; không sales; không emoji trang trí.
- **Token MobiFone:** không hex mới; **vai/trạng thái không chỉ bằng màu** (badge có chữ + chấm/icon); tôn trọng `prefers-reduced-motion`.
- **Không phá vai khác** (Phòng/Hiệu trưởng/Học sinh) và lớp dùng chung; giữ mọi test cũ xanh.
- Đóng mỗi task khi `npx tsc --noEmit` sạch · test liên quan xanh. Cuối plan chạy `npx vitest run` + `npx vite build`.

## File Structure

- `src/data/types.ts` — thêm `TeachingRole`, `SubjectAssignment`, `TeacherProfile`, `ClassTreeLeaf`, `ClassTreeGroup`, `ClassSubjectSlice`, `ClassSubjectEntry`, `ClassOverview`. Bỏ `Teaching`.
- `src/data/mock/world.ts` — thêm `getHongProfile(): TeacherProfile`; bỏ `getHongTeaching`.
- `src/data/mock/builders.ts` — thêm `buildClassSubjectReport(classId, subject)` (Địa lí thật / môn khác seeded) + `classSubjectSlice(classId, term, subject)`.
- `src/data/mock/overview.ts` — thêm `buildClassOverview`/`getClassOverview`.
- `src/data/mock/journey.ts` — `buildClassJourney` tiêu thụ `buildClassSubjectReport`.
- `src/lib/teacherTree.ts` — `buildClassTree(profile)` (thuần, test được).
- `src/lib/narrate.ts` — thêm `narrateClassOverviewMoDau/CacMon/HoiTu`.
- `src/components/journey/classOverviewChapters.tsx` — `buildClassOverviewChapters(ov, nav)`.
- `src/components/journey/SubjectComparisonBars.tsx` — nới prop để dùng chung.
- `src/components/layout/TeacherNav.tsx` — cây lớp (mới).
- `src/components/layout/Sidebar.tsx` — rẽ nhánh: giáo viên → `TeacherNav`.
- `src/lib/sidebarNav.ts` — giáo viên chỉ còn link "Học sinh" (cây lo phần lớp).
- `src/lib/nav.ts` — `roleHome` giáo viên → lớp chủ nhiệm đầu, `?role=cn`.
- `src/routes/lop.tsx` — đọc `?role=`/`?mon=`, rẽ overview/bộ môn, badge vai, liên kết chéo.
- `src/data/repository.ts` + `src/data/mockRepository.ts` — `getTeacherProfile`, `getClassOverview`; bỏ `getTeaching`.
- **Bỏ:** `src/routes/lop-bo-mon.tsx`, route `/app/lop-bo-mon`, `src/components/journey/ClassPicker.tsx` (+ test), `src/routes/lop.present.test.tsx` đã bỏ trước đó.

---

### Task 1: Kiểu dữ liệu hồ sơ giảng dạy + cây lớp

**Files:**
- Modify: `src/data/types.ts` (thêm types sau khối `Teaching`; xoá `Teaching`)
- Test: `src/data/__tests__/teacherTypes.test.ts` (create)

**Interfaces:**
- Produces:
  ```ts
  export type TeachingRole = "chu-nhiem" | "bo-mon";
  export interface SubjectAssignment { classId: string; subject: Subject; }
  export interface TeacherProfile {
    teacherId: string;
    teacherName: string;
    homeroomClassIds: string[];
    subjectAssignments: SubjectAssignment[];
  }
  export interface ClassTreeLeaf {
    classId: string; className: string;
    role: TeachingRole; subject?: Subject; alsoTeachesSubject?: Subject;
    to: string;
  }
  export interface ClassTreeGroup { key: string; label: string; leaves: ClassTreeLeaf[]; }
  ```

- [ ] **Step 1: Viết test biên dịch kiểu (type-only)**

Create `src/data/__tests__/teacherTypes.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import type { TeacherProfile, ClassTreeGroup } from "@/data/types";

describe("teacher types", () => {
  it("TeacherProfile hợp lệ", () => {
    const p: TeacherProfile = {
      teacherId: "son-tay-12-van",
      teacherName: "Nguyễn Minh Hồng",
      homeroomClassIds: ["son-tay-12-van", "son-tay-12-hóa"],
      subjectAssignments: [{ classId: "son-tay-12-van", subject: "Địa lí" }],
    };
    expect(p.homeroomClassIds.length).toBe(2);
    const g: ClassTreeGroup = { key: "chu-nhiem", label: "Chủ nhiệm", leaves: [] };
    expect(g.leaves.length).toBe(0);
  });
});
```

- [ ] **Step 2: Chạy test → FAIL** (`npx vitest run src/data/__tests__/teacherTypes.test.ts`) — lỗi type chưa tồn tại.

- [ ] **Step 3: Thêm types vào `src/data/types.ts`**

Tìm khối:
```ts
// Một giáo viên: 1 lớp chủ nhiệm + nhiều lớp bộ môn (dạy 1 môn).
export interface Teaching {
  teacherName: string;
  subject: Subject;
  homeroomClassId: string;
  subjectClassIds: string[];
}
```
Thay bằng:
```ts
// Hồ sơ giảng dạy giáo viên: nhiều lớp chủ nhiệm + nhiều (lớp × môn) bộ môn.
export type TeachingRole = "chu-nhiem" | "bo-mon";

export interface SubjectAssignment {
  classId: string;
  subject: Subject;
}

export interface TeacherProfile {
  teacherId: string;
  teacherName: string;
  homeroomClassIds: string[];
  subjectAssignments: SubjectAssignment[];
}

export interface ClassTreeLeaf {
  classId: string;
  className: string;
  role: TeachingRole;
  subject?: Subject;            // khi role==="bo-mon"
  alsoTeachesSubject?: Subject; // khi role==="chu-nhiem" và GV cũng dạy môn ở lớp này
  to: string;                   // URL kèm ?role= & ?mon=
}

export interface ClassTreeGroup {
  key: string;   // "chu-nhiem" | "bo-mon:Địa lí" | ...
  label: string; // "Chủ nhiệm" | "Bộ môn · Địa lí"
  leaves: ClassTreeLeaf[];
}
```
> Lưu ý: `Subject` đã khai báo phía dưới trong cùng file (dòng ~116). TS cho phép tham chiếu type khai báo sau trong cùng module — không cần đổi thứ tự.

- [ ] **Step 4: Chạy test → PASS.**

- [ ] **Step 5: Commit**
```bash
git add src/data/types.ts src/data/__tests__/teacherTypes.test.ts
git commit -m "feat(types): TeacherProfile + class tree types, drop Teaching"
```

---

### Task 2: `buildClassTree` (hàm thuần suy cây từ profile)

**Files:**
- Create: `src/lib/teacherTree.ts`
- Test: `src/lib/__tests__/teacherTree.test.ts`

**Interfaces:**
- Consumes: `TeacherProfile`, `ClassTreeGroup`, `ClassTreeLeaf` (Task 1); `repo.getClass(id)` → `Klass | undefined`; `SUBJECTS` từ `@/data/types`.
- Produces: `buildClassTree(profile: TeacherProfile): ClassTreeGroup[]`

- [ ] **Step 1: Viết test**

Create `src/lib/__tests__/teacherTree.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildClassTree } from "@/lib/teacherTree";
import type { TeacherProfile } from "@/data/types";

const profile: TeacherProfile = {
  teacherId: "son-tay-12-van",
  teacherName: "Nguyễn Minh Hồng",
  homeroomClassIds: ["son-tay-12-van", "son-tay-12-hóa"],
  subjectAssignments: [
    { classId: "son-tay-12-van", subject: "Địa lí" },
    { classId: "son-tay-12-toán", subject: "Địa lí" },
    { classId: "son-tay-12-sinh", subject: "Lịch sử" },
  ],
};

describe("buildClassTree", () => {
  const tree = buildClassTree(profile);

  it("nhóm đầu là Chủ nhiệm, đủ số lớp chủ nhiệm", () => {
    expect(tree[0].key).toBe("chu-nhiem");
    expect(tree[0].leaves.map((l) => l.classId)).toEqual(["son-tay-12-van", "son-tay-12-hóa"]);
  });

  it("lớp chủ nhiệm mà GV cũng dạy môn → alsoTeachesSubject", () => {
    const van = tree[0].leaves.find((l) => l.classId === "son-tay-12-van")!;
    expect(van.alsoTeachesSubject).toBe("Địa lí");
    expect(van.role).toBe("chu-nhiem");
    expect(van.to).toContain("role=cn");
    const hoa = tree[0].leaves.find((l) => l.classId === "son-tay-12-hóa")!;
    expect(hoa.alsoTeachesSubject).toBeUndefined();
  });

  it("nhóm bộ môn theo môn, có 12 Văn trong nhóm Địa lí (xuất hiện ở cả hai nhóm)", () => {
    const dia = tree.find((g) => g.key === "bo-mon:Địa lí")!;
    expect(dia.label).toBe("Bộ môn · Địa lí");
    expect(dia.leaves.map((l) => l.classId)).toEqual(["son-tay-12-van", "son-tay-12-toán"]);
    const vanBm = dia.leaves[0];
    expect(vanBm.role).toBe("bo-mon");
    expect(vanBm.subject).toBe("Địa lí");
    expect(vanBm.to).toContain("role=bm");
    expect(vanBm.to).toContain("mon=");
  });

  it("nhóm bộ môn sắp theo thứ tự SUBJECTS (Lịch sử trước Địa lí)", () => {
    const keys = tree.filter((g) => g.key.startsWith("bo-mon:")).map((g) => g.key);
    expect(keys).toEqual(["bo-mon:Lịch sử", "bo-mon:Địa lí"]);
  });
});
```
> `SUBJECTS = ["Toán","Ngữ văn","Tiếng Anh","Vật lí","Hóa học","Sinh học","Lịch sử","Địa lí"]` → "Lịch sử" đứng trước "Địa lí".

- [ ] **Step 2: Chạy test → FAIL** (module chưa tồn tại).

- [ ] **Step 3: Viết `src/lib/teacherTree.ts`**
```ts
import type { TeacherProfile, ClassTreeGroup, ClassTreeLeaf, Subject } from "@/data/types";
import { SUBJECTS } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";

function classNameOf(classId: string): string {
  return repo.getClass(classId)?.name ?? classId;
}

/** Suy cây điều hướng lớp từ hồ sơ giảng dạy. Lớp vừa chủ nhiệm vừa dạy môn xuất hiện ở CẢ hai nhóm. */
export function buildClassTree(profile: TeacherProfile): ClassTreeGroup[] {
  const groups: ClassTreeGroup[] = [];

  // Nhóm Chủ nhiệm
  const homeroomLeaves: ClassTreeLeaf[] = profile.homeroomClassIds.map((classId) => {
    const also = profile.subjectAssignments.find((a) => a.classId === classId)?.subject;
    return {
      classId,
      className: classNameOf(classId),
      role: "chu-nhiem" as const,
      alsoTeachesSubject: also,
      to: `/app/lop/${classId}?role=cn`,
    };
  });
  if (homeroomLeaves.length > 0) {
    groups.push({ key: "chu-nhiem", label: "Chủ nhiệm", leaves: homeroomLeaves });
  }

  // Nhóm Bộ môn · {môn} — gom theo môn, sắp theo thứ tự SUBJECTS
  const bySubject = new Map<Subject, ClassTreeLeaf[]>();
  for (const a of profile.subjectAssignments) {
    const leaf: ClassTreeLeaf = {
      classId: a.classId,
      className: classNameOf(a.classId),
      role: "bo-mon",
      subject: a.subject,
      to: `/app/lop/${a.classId}?role=bm&mon=${encodeURIComponent(a.subject)}`,
    };
    const arr = bySubject.get(a.subject) ?? [];
    arr.push(leaf);
    bySubject.set(a.subject, arr);
  }
  for (const subject of SUBJECTS) {
    const leaves = bySubject.get(subject);
    if (leaves && leaves.length > 0) {
      groups.push({ key: `bo-mon:${subject}`, label: `Bộ môn · ${subject}`, leaves });
    }
  }

  return groups;
}
```

- [ ] **Step 4: Chạy test → PASS.**

- [ ] **Step 5: Commit**
```bash
git add src/lib/teacherTree.ts src/lib/__tests__/teacherTree.test.ts
git commit -m "feat(nav): buildClassTree — suy cây lớp theo vai từ hồ sơ giảng dạy"
```

---

### Task 3: Hồ sơ giảng dạy cô Hồng + repository `getTeacherProfile`

**Files:**
- Modify: `src/data/mock/world.ts` (thay `getHongTeaching` bằng `getHongProfile`)
- Modify: `src/data/repository.ts` (bỏ `getTeaching`, thêm `getTeacherProfile`)
- Modify: `src/data/mockRepository.ts` (wiring)
- Test: `src/data/mock/__tests__/teacherProfile.test.ts`

**Interfaces:**
- Consumes: `TeacherProfile` (Task 1); `getWorld()`, `SCHOOL_HERO`, `CLASS_HERO` (world.ts).
- Produces: `getHongProfile(): TeacherProfile`; `repo.getTeacherProfile(teacherId: string): TeacherProfile`.

- [ ] **Step 1: Viết test**

Create `src/data/mock/__tests__/teacherProfile.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";

describe("getTeacherProfile (cô Hồng)", () => {
  const p = repo.getTeacherProfile(CLASS_HERO);

  it("2 lớp chủ nhiệm, có 12 Văn (thật) + 12 Hóa", () => {
    expect(p.homeroomClassIds).toContain("son-tay-12-van");
    expect(p.homeroomClassIds.length).toBe(2);
  });

  it("có assignment Địa lí ở chính lớp chủ nhiệm 12 Văn", () => {
    expect(p.subjectAssignments).toContainEqual({ classId: "son-tay-12-van", subject: "Địa lí" });
  });

  it("dạy 2 môn: Địa lí và Lịch sử", () => {
    const subjects = new Set(p.subjectAssignments.map((a) => a.subject));
    expect(subjects.has("Địa lí")).toBe(true);
    expect(subjects.has("Lịch sử")).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test → FAIL** (`getTeacherProfile` chưa có).

- [ ] **Step 3: Thay `getHongTeaching` trong `src/data/mock/world.ts`**

Tìm:
```ts
export function getHongTeaching(): Teaching {
  const w = getWorld();
  const subjectClassIds = w.classes
    .filter((c) => c.schoolId === SCHOOL_HERO && c.id !== CLASS_HERO)
    .map((c) => c.id);
  return { teacherName: "Nguyễn Minh Hồng", subject: "Địa lí", homeroomClassId: CLASS_HERO, subjectClassIds };
}
```
Thay bằng:
```ts
export function getHongProfile(): TeacherProfile {
  // Dùng lớp Sơn Tây có sẵn (không tạo lớp mới). Địa lí ở 12 Văn = số thật.
  return {
    teacherId: CLASS_HERO,
    teacherName: "Nguyễn Minh Hồng",
    homeroomClassIds: [CLASS_HERO, "son-tay-12-hóa"],
    subjectAssignments: [
      { classId: CLASS_HERO, subject: "Địa lí" },        // dạy môn trong lớp chủ nhiệm (THẬT)
      { classId: "son-tay-12-toán", subject: "Địa lí" },
      { classId: "son-tay-12-anh", subject: "Địa lí" },
      { classId: "son-tay-12-lí", subject: "Địa lí" },
      { classId: "son-tay-12-sinh", subject: "Lịch sử" }, // demo đa môn (seeded)
    ],
  };
}
```
Cập nhật import đầu world.ts: bỏ `Teaching`, thêm `TeacherProfile` trong dòng `import type { ... } from "@/data/types"` (hoặc dòng types tương ứng).

- [ ] **Step 4: Sửa `src/data/repository.ts`**

Trong import type, bỏ `Teaching`, thêm `TeacherProfile`. Trong interface, thay dòng `getTeaching(): Teaching;` bằng:
```ts
  getTeacherProfile(teacherId: string): TeacherProfile;
```

- [ ] **Step 5: Sửa `src/data/mockRepository.ts`**

Import: đổi `getHongTeaching` → `getHongProfile` trong dòng `from "./mock/world"`. Thay dòng:
```ts
  getTeaching: () => getHongTeaching(),
```
bằng:
```ts
  getTeacherProfile: (_teacherId: string) => getHongProfile(),
```
> Hiện chỉ có một giáo viên hero; tham số `teacherId` để sẵn cho tương lai (luôn trả hồ sơ cô Hồng).

- [ ] **Step 6: Chạy test → PASS** + `npx tsc --noEmit` sạch (sẽ lộ các nơi còn dùng `getTeaching` — Task 7/8 dọn; nếu lỗi ở `LopBoMon`/`ClassPicker`, để nguyên tới Task 8, nhưng nếu tsc chặn thì tạm thời các file đó được xoá ở Task 8 — chạy test file cụ thể ở bước này thay vì tsc toàn bộ nếu cần: `npx vitest run src/data/mock/__tests__/teacherProfile.test.ts`).

- [ ] **Step 7: Commit**
```bash
git add src/data/mock/world.ts src/data/repository.ts src/data/mockRepository.ts src/data/mock/__tests__/teacherProfile.test.ts
git commit -m "feat(data): getTeacherProfile + hồ sơ cô Hồng (2 chủ nhiệm, 2 môn)"
```

---

### Task 4: Dữ liệu lớp × môn seeded (`buildClassSubjectReport`) + hành trình bộ môn theo môn

**Files:**
- Modify: `src/data/mock/builders.ts` (thêm `buildClassSubjectReport`)
- Modify: `src/data/mock/journey.ts` (`buildClassJourney` dùng `buildClassSubjectReport`)
- Test: `src/data/mock/__tests__/classSubject.test.ts`

**Interfaces:**
- Consumes: `buildClassReport(classId)` (Địa lí thật), `SUBJECT_TOPICS` (world.ts), `Rng`, `r1`, `clamp`, `learningIndex`, `effortIndex`, `normalize`, `convergeWeakTopics`, `mean` (đã có trong builders.ts).
- Produces: `buildClassSubjectReport(classId: string, subject: Subject): ClassReport` — `ClassReport` cho (lớp × môn). Địa lí = `buildClassReport` thật; môn khác = biến đổi deterministic (dịch điểm theo seed + đổi `subject`/`weakTopics` sang `SUBJECT_TOPICS[subject]`).

- [ ] **Step 1: Viết test**

Create `src/data/mock/__tests__/classSubject.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildClassSubjectReport } from "@/data/mock/builders";
import { CLASS_HERO } from "@/data/mock/world";

describe("buildClassSubjectReport", () => {
  it("Địa lí ở 12 Văn = đúng report thật (subject Địa lí)", () => {
    const r = buildClassSubjectReport(CLASS_HERO, "Địa lí");
    expect(r.subject).toBe("Địa lí");
    expect(r.roster.length).toBeGreaterThan(0);
  });

  it("môn khác: subject đổi đúng, deterministic (2 lần y hệt)", () => {
    const a = buildClassSubjectReport("son-tay-12-toán", "Lịch sử");
    const b = buildClassSubjectReport("son-tay-12-toán", "Lịch sử");
    expect(a.subject).toBe("Lịch sử");
    expect(a.thi.avg).toBe(b.thi.avg);
    expect(a.roster.map((x) => x.exam)).toEqual(b.roster.map((x) => x.exam));
  });

  it("chỉ số lớp tính ra (0..100), không NaN", () => {
    const r = buildClassSubjectReport("son-tay-12-sinh", "Lịch sử");
    expect(r.learningIndex.total).toBeGreaterThanOrEqual(0);
    expect(r.learningIndex.total).toBeLessThanOrEqual(100);
    expect(Number.isNaN(r.effortIndex.total)).toBe(false);
  });

  it("weakTopics thuộc bộ chủ đề của môn", () => {
    const r = buildClassSubjectReport("son-tay-12-sinh", "Lịch sử");
    // chỉ kiểm tra có ít nhất 1 chủ đề và là chuỗi không rỗng
    expect(r.weakTopics.length).toBeGreaterThan(0);
    expect(r.weakTopics.every((t) => typeof t.topic === "string" && t.topic.length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test → FAIL** (chưa có `buildClassSubjectReport`).

- [ ] **Step 3: Thêm `buildClassSubjectReport` vào `src/data/mock/builders.ts`**

Thêm (sau `buildClassReport`, dùng các helper đã có trong file: `learningIndex`, `effortIndex`, `normalize`, `mean`, `r1`, `clamp`, `Rng`, `toBands`, `convergeWeakTopics`; và `SUBJECT_TOPICS` import từ `./world`):
```ts
/**
 * ClassReport cho (lớp × môn).
 * - Địa lí: đúng report thật (buildClassReport).
 * - Môn khác: biến đổi deterministic — dịch điểm thô theo seed (lớp+môn), giữ cấu trúc,
 *   đổi nhãn môn + weakTopics sang bộ chủ đề của môn. Chỉ số TÍNH lại từ số thô.
 */
export function buildClassSubjectReport(classId: string, subject: Subject): ClassReport {
  const base = buildClassReport(classId);
  if (subject === "Địa lí") return base;

  const rng = new Rng("class-subj-" + classId + "-" + subject);
  const shift = rng.gauss(0, 0.6, -1.4, 1.4); // dịch điểm thô theo môn (deterministic)

  const roster: ClassRosterRow[] = base.roster.map((row, i) => {
    const rr = new Rng("csr-" + classId + "-" + subject + "-" + i);
    const exam = r1(clamp(row.exam + shift + rr.gauss(0, 0.3, -1, 1), 0, 10));
    const home = r1(clamp(row.home + shift * 0.7 + rr.gauss(0, 0.3, -1, 1), 0, 10));
    const quizLop = clamp(rr.gauss(72, 12, 20, 100), 20, 100);
    const learning = learningIndex({ thi: normalize(exam, 10), nha: normalize(home, 10), quizLop }).total;
    const effort = effortIndex({
      chuyenCan: row.attendance * 100,
      hoanThanh: rr.bool(0.82) ? 95 : 68,
      dungHan: rr.bool(0.85) ? 100 : 60,
    }).total;
    return { ...row, exam, home, learning, effort, needSupport: exam < 6.5 || learning < 60 };
  });

  const classExamAvg = mean(roster.map((x) => x.exam));
  const classHomeAvg = mean(roster.map((x) => x.home));
  const classQuiz = mean(base.lop.quizzes.map((q) => q.accuracy)) * 100;
  const classAttendance =
    base.lop.attendance.present / (base.lop.attendance.present + base.lop.attendance.absent);
  const classCompletion = mean(base.nha.missions.map((m) => m.completionRate));
  const onTimeRate = base.nha.students.filter((s) => !s.late).length / base.nha.students.length;

  const learningIdx = learningIndex({
    thi: normalize(classExamAvg, 10), nha: normalize(classHomeAvg, 10), quizLop: classQuiz,
  });
  const effortIdx = effortIndex({
    chuyenCan: classAttendance * 100, hoanThanh: classCompletion * 100, dungHan: onTimeRate * 100,
  });

  // weakTopics theo bộ chủ đề của môn (deterministic), cấu trúc giữ như slice seeded học sinh
  const topics = SUBJECT_TOPICS[subject];
  const tShuffle = [...topics];
  for (let k = tShuffle.length - 1; k > 0; k--) {
    const j = rng.int(0, k);
    [tShuffle[k], tShuffle[j]] = [tShuffle[j], tShuffle[k]];
  }
  const weakTopics: WeakTopic[] = tShuffle.slice(0, 3).map((topic, i) => {
    const wr = new Rng("cw-" + classId + "-" + subject + "-" + i);
    const accLop = clamp(wr.gauss(0.55, 0.1, 0.2, 0.95), 0.2, 0.95);
    const accNha = clamp(wr.gauss(0.7, 0.1, 0.3, 0.98), 0.3, 0.98);
    const accThi = clamp(wr.gauss(0.52, 0.1, 0.2, 0.9), 0.2, 0.9);
    const surfaces = { lop: accLop < 0.6, nha: accNha < 0.6, thi: accThi < 0.6 };
    const n = Number(surfaces.lop) + Number(surfaces.nha) + Number(surfaces.thi);
    return { topic, surfaces, confirmed: n >= 2, accuracyAvg: (accLop + accNha + accThi) / 3 };
  });

  const examScores = roster.map((x) => x.exam);
  const avg = r1(classExamAvg);
  const sortedScores = [...examScores].sort((a, b) => a - b);
  const median = r1(sortedScores[Math.floor(sortedScores.length / 2)] ?? avg);

  return {
    ...base,
    subject,
    learningIndex: learningIdx,
    effortIndex: effortIdx,
    bands: toBands(examScores, 10),
    weakTopics,
    roster,
    effortVsResult: roster.map((x) => ({ studentId: x.studentId, name: x.name, effort: x.effort, result: x.learning })),
    thi: { ...base.thi, avg, median },
  };
}
```
> Kiểm tra đầu builders.ts đã import `SUBJECT_TOPICS` từ `./world`; nếu chưa, thêm vào dòng import world. `WeakTopic`, `ClassRosterRow`, `ClassReport`, `Subject` đã có trong import types của builders.ts (kiểm tra, thêm nếu thiếu).

- [ ] **Step 4: `buildClassJourney` dùng report theo môn — `src/data/mock/journey.ts`**

Trong import từ `./builders`, thêm `buildClassSubjectReport`. Tìm trong `buildClassJourney`:
```ts
  const report = buildClassReport(classId);
```
Thay bằng:
```ts
  const report = buildClassSubjectReport(classId, subject);
```
> Phần còn lại của `buildClassJourney` dùng `report.subject`, `report.thi`, `report.lop`, `report.nha`, `report.roster` — không đổi. Vì `report.subject` giờ = `subject` truyền vào, nhãn môn hiển thị đúng.

- [ ] **Step 5: Chạy test → PASS** (`npx vitest run src/data/mock/__tests__/classSubject.test.ts`).

- [ ] **Step 6: Commit**
```bash
git add src/data/mock/builders.ts src/data/mock/journey.ts src/data/mock/__tests__/classSubject.test.ts
git commit -m "feat(data): buildClassSubjectReport (Địa lí thật / môn khác seeded), hành trình bộ môn theo môn"
```

---

### Task 5: Overview chéo môn cấp lớp (`getClassOverview`) + narrate

**Files:**
- Modify: `src/data/types.ts` (`ClassSubjectEntry`, `ClassOverview`)
- Modify: `src/data/mock/overview.ts` (`buildClassOverview`/`getClassOverview`)
- Modify: `src/lib/narrate.ts` (`narrateClassOverviewMoDau/CacMon/HoiTu`)
- Modify: `src/data/repository.ts` + `src/data/mockRepository.ts` (`getClassOverview`)
- Test: `src/data/mock/__tests__/classOverview.test.ts`, `src/lib/__tests__/narrateClassOverview.test.ts`

**Interfaces:**
- Consumes: `buildClassSubjectReport` (Task 4), `SUBJECTS`, `buildClassReport` (cho chuyên cần + cần hỗ trợ thật), `mean`, `DEMO_NOW`.
- Produces:
  ```ts
  export interface ClassSubjectEntry {
    subject: Subject; examAvg: number | null;
    learningIndex: number; effortIndex: number; weakTopics: WeakTopic[];
  }
  export interface ClassOverview {
    kind: "class-overview"; slice: { term: Ky; subject: "Tất cả môn" }; now: string;
    klass: Klass; schoolName: string; numStudents: number;
    subjects: ClassSubjectEntry[]; overallLearningIndex: number;
    attendanceRate: number; needSupport: number;
    strongest: ClassSubjectEntry; weakest: ClassSubjectEntry;
    availableSlices: { terms: Ky[]; subjects: string[] };
  }
  ```
  `getClassOverview(classId: string, term: Ky): ClassOverview`;
  `narrateClassOverviewMoDau(ov)`, `narrateClassOverviewCacMon(ov)`, `narrateClassOverviewHoiTu(ov, nextExam)` → `NarratedLine`.

- [ ] **Step 1: Thêm types vào `src/data/types.ts`** (sau `StudentOverview`):
```ts
export interface ClassSubjectEntry {
  subject: Subject;
  examAvg: number | null;
  learningIndex: number;
  effortIndex: number;
  weakTopics: WeakTopic[];
}

export interface ClassOverview {
  kind: "class-overview";
  slice: { term: Ky; subject: "Tất cả môn" };
  now: string;
  klass: Klass;
  schoolName: string;
  numStudents: number;
  subjects: ClassSubjectEntry[];   // sorted strong→weak by examAvg (null last)
  overallLearningIndex: number;
  attendanceRate: number;          // chuyên cần toàn lớp (subject-agnostic, từ report thật)
  needSupport: number;             // số em cần hỗ trợ (theo kết quả tổng hợp lớp)
  strongest: ClassSubjectEntry;
  weakest: ClassSubjectEntry;
  availableSlices: { terms: Ky[]; subjects: string[] };
}
```

- [ ] **Step 2: Viết test overview**

Create `src/data/mock/__tests__/classOverview.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getClassOverview } from "@/data/mock/overview";
import { SUBJECTS } from "@/data/types";
import { CLASS_HERO } from "@/data/mock/world";

describe("getClassOverview", () => {
  const ov = getClassOverview(CLASS_HERO, "ky-1");

  it("đủ 8 môn, sắp mạnh→yếu theo examAvg", () => {
    expect(ov.subjects.length).toBe(SUBJECTS.length);
    const scored = ov.subjects.map((s) => s.examAvg ?? -Infinity);
    for (let i = 1; i < scored.length; i++) expect(scored[i - 1]).toBeGreaterThanOrEqual(scored[i]);
  });

  it("overallLearningIndex = trung bình learningIndex các môn", () => {
    const m = Math.round(ov.subjects.reduce((a, s) => a + s.learningIndex, 0) / ov.subjects.length);
    expect(ov.overallLearningIndex).toBe(m);
  });

  it("có chuyên cần + cần hỗ trợ ở cấp lớp", () => {
    expect(ov.attendanceRate).toBeGreaterThan(0);
    expect(ov.needSupport).toBeGreaterThanOrEqual(0);
  });

  it("strongest/weakest đúng đầu/cuối", () => {
    expect(ov.strongest).toBe(ov.subjects[0]);
    expect(ov.weakest).toBe(ov.subjects[ov.subjects.length - 1]);
  });

  it("deterministic (2 lần y hệt avg)", () => {
    const a = getClassOverview("son-tay-12-toán", "ky-1");
    const b = getClassOverview("son-tay-12-toán", "ky-1");
    expect(a.subjects.map((s) => s.examAvg)).toEqual(b.subjects.map((s) => s.examAvg));
  });
});
```

- [ ] **Step 3: Viết `buildClassOverview`/`getClassOverview` trong `src/data/mock/overview.ts`**

Thêm import:
```ts
import type { ClassOverview, ClassSubjectEntry, Klass } from "@/data/types";
import { buildClassReport, buildClassSubjectReport } from "./builders";
import { getWorld } from "./world";
```
Thêm:
```ts
export function buildClassOverview(classId: string, term: Ky): ClassOverview {
  const world = getWorld();
  const klass = world.classById.get(classId) as Klass;
  const schoolName = world.schoolById.get(klass.schoolId)?.name ?? "";

  const base = buildClassReport(classId); // chuyên cần + cần hỗ trợ THẬT (subject-agnostic)
  const attendanceRate =
    base.lop.attendance.present / (base.lop.attendance.present + base.lop.attendance.absent);
  const needSupport = base.roster.filter((r) => r.needSupport).length;

  const subjects: ClassSubjectEntry[] = SUBJECTS.map((subject) => {
    const r = buildClassSubjectReport(classId, subject);
    return {
      subject,
      examAvg: r.thi.avg,
      learningIndex: r.learningIndex.total,
      effortIndex: r.effortIndex.total,
      weakTopics: r.weakTopics,
    };
  });

  const sorted = [...subjects].sort((a, b) => (b.examAvg ?? -Infinity) - (a.examAvg ?? -Infinity));
  const overallLearningIndex = Math.round(mean(sorted.map((e) => e.learningIndex)));

  return {
    kind: "class-overview",
    slice: { term, subject: "Tất cả môn" },
    now: DEMO_NOW,
    klass,
    schoolName,
    numStudents: klass.studentIds.length,
    subjects: sorted,
    overallLearningIndex,
    attendanceRate,
    needSupport,
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
    availableSlices: { terms: ["ky-1", "ky-2", "ca-nam"], subjects: ["Tất cả môn", ...SUBJECTS] },
  };
}

const classOverviewCache = new Map<string, ClassOverview>();
export function getClassOverview(classId: string, term: Ky): ClassOverview {
  const key = `${classId}|${term}`;
  if (!classOverviewCache.has(key)) classOverviewCache.set(key, buildClassOverview(classId, term));
  return classOverviewCache.get(key)!;
}
```

- [ ] **Step 4: Viết test narrate**

Create `src/lib/__tests__/narrateClassOverview.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { narrateClassOverviewMoDau, narrateClassOverviewCacMon, narrateClassOverviewHoiTu } from "@/lib/narrate";
import type { ClassOverview, UpcomingExam } from "@/data/types";

const ov: ClassOverview = {
  kind: "class-overview",
  slice: { term: "ky-1", subject: "Tất cả môn" },
  now: "2026-06-10",
  klass: { id: "c", schoolId: "s", khoi: 12, name: "12 Văn", focus: "Văn", homeroomTeacher: "Cô Hồng", studentIds: ["a", "b"] },
  schoolName: "Sơn Tây",
  numStudents: 42,
  subjects: [
    { subject: "Vật lí", examAvg: 7.6, learningIndex: 78, effortIndex: 80, weakTopics: [] },
    { subject: "Địa lí", examAvg: 6.2, learningIndex: 64, effortIndex: 70,
      weakTopics: [{ topic: "Vùng kinh tế", surfaces: { lop: true, nha: false, thi: true }, confirmed: true, accuracyAvg: 0.48 }] },
  ],
  overallLearningIndex: 71,
  attendanceRate: 0.96,
  needSupport: 6,
  strongest: { subject: "Vật lí", examAvg: 7.6, learningIndex: 78, effortIndex: 80, weakTopics: [] },
  weakest: { subject: "Địa lí", examAvg: 6.2, learningIndex: 64, effortIndex: 70, weakTopics: [] },
  availableSlices: { terms: ["ky-1", "ky-2", "ca-nam"], subjects: ["Tất cả môn"] },
};
const NEXT: UpcomingExam = { title: "Kỳ thi THPT chính thức", date: "2026-06-26" };

describe("narrate class overview", () => {
  it("mỗi câu có figure mang số", () => {
    for (const l of [narrateClassOverviewMoDau(ov), narrateClassOverviewCacMon(ov), narrateClassOverviewHoiTu(ov, NEXT)]) {
      expect(l.figures.length).toBeGreaterThan(0);
      for (const f of l.figures) expect(/\d/.test(f.value)).toBe(true);
      expect(l.text.length).toBeGreaterThan(0);
    }
  });
  it("ĐÚNG THÌ: nextExam=null không có 'trước'", () => {
    expect(narrateClassOverviewHoiTu(ov, null).text).not.toContain("trước Kỳ thi");
  });
  it("nextExam!=null có 'trước {title}'", () => {
    expect(narrateClassOverviewHoiTu(ov, NEXT).text).toContain("trước " + NEXT.title);
  });
});
```

- [ ] **Step 5: Thêm narrate vào `src/lib/narrate.ts`**

Bổ sung `ClassOverview` vào import type. Thêm:
```ts
export function narrateClassOverviewMoDau(ov: ClassOverview): NarratedLine {
  const text = `Lớp ${ov.klass.name} có ${int(ov.numStudents)} em, chuyên cần ${pct(ov.attendanceRate)}. Tính chung các môn, chỉ số học tập trung bình ${ov.overallLearningIndex}; mạnh nhất đang là ${ov.strongest.subject}.`;
  return line(text, [
    { label: "Sĩ số", value: int(ov.numStudents) },
    { label: "Học tập TB", value: String(ov.overallLearningIndex) },
    { label: "Cần hỗ trợ", value: int(ov.needSupport) },
  ]);
}

export function narrateClassOverviewCacMon(ov: ClassOverview): NarratedLine {
  const s = ov.strongest, w = ov.weakest;
  const sPart = s.examAvg !== null ? ` ${diem(s.examAvg)}` : "";
  const wPart = w.examAvg !== null ? ` ${diem(w.examAvg)}` : "";
  const text = `Cả lớp nhỉnh nhất ở ${s.subject}${sPart}; còn ${w.subject}${wPart} là môn nên để ý kèm thêm trong kỳ này.`;
  return line(text, [
    { label: `Cao nhất · ${s.subject}`, value: s.examAvg !== null ? diem(s.examAvg) : "—" },
    { label: `Cần để ý · ${w.subject}`, value: w.examAvg !== null ? diem(w.examAvg) : "—" },
  ]);
}

export function narrateClassOverviewHoiTu(ov: ClassOverview, nextExam: UpcomingExam | null): NarratedLine {
  const names = ov.weakest.weakTopics.filter((t) => t.confirmed).slice(0, 3).map((t) => t.topic).join(", ");
  const action = nextExam
    ? `nên ôn lại ${ov.weakest.subject} trước ${nextExam.title}`
    : `nên dành thêm thời gian cho ${ov.weakest.subject}`;
  const topicPart = names ? ` Mấy chủ đề lớp còn hay sai: ${names}.` : "";
  const text = `Cả lớp ${action}.${topicPart}`;
  const figures: { label: string; value: string }[] = [{ label: "Môn cần để ý", value: ov.weakest.subject }];
  if (ov.weakest.examAvg !== null) figures.push({ label: "Điểm TB", value: diem(ov.weakest.examAvg) });
  if (nextExam) figures.push({ label: nextExam.title, value: nextExam.date });
  return line(text, figures);
}
```

- [ ] **Step 6: Wiring repository** — `src/data/repository.ts` thêm vào interface:
```ts
  getClassOverview(classId: string, term: Ky): ClassOverview;
```
(thêm `ClassOverview` vào import type). `src/data/mockRepository.ts`: import `getClassOverview` từ `./mock/overview`; thêm method:
```ts
  getClassOverview: (classId: string, term: Ky) => getClassOverview(classId, term),
```

- [ ] **Step 7: Chạy test** (`npx vitest run src/data/mock/__tests__/classOverview.test.ts src/lib/__tests__/narrateClassOverview.test.ts`) → PASS.

- [ ] **Step 8: Commit**
```bash
git add src/data/types.ts src/data/mock/overview.ts src/lib/narrate.ts src/data/repository.ts src/data/mockRepository.ts src/data/mock/__tests__/classOverview.test.ts src/lib/__tests__/narrateClassOverview.test.ts
git commit -m "feat(data): class overview chéo môn + narrate (chủ nhiệm toàn diện)"
```

---

### Task 6: Chương overview lớp + nới `SubjectComparisonBars`

**Files:**
- Modify: `src/components/journey/SubjectComparisonBars.tsx` (nới prop type)
- Create: `src/components/journey/classOverviewChapters.tsx`
- Test: `src/components/journey/classOverviewChapters.test.tsx`

**Interfaces:**
- Consumes: `ClassOverview` (Task 5), `narrateClassOverview*` (Task 5), `SubjectComparisonBars`, `ProgressRing`, `ChartCard`, `Narrator`, `ChapterDef`, `OFFICIAL_EXAM`/`DEMO_NOW`/`statusOf`.
- Produces: `buildClassOverviewChapters(ov: ClassOverview, nav: (path: string) => void): ChapterDef[]`.

- [ ] **Step 1: Nới prop `SubjectComparisonBars`** — `src/components/journey/SubjectComparisonBars.tsx`

Đổi:
```ts
import type { SubjectEntry } from "@/data/types";
...
interface Props {
  entries: SubjectEntry[];
  onDrillSubject: (subject: string) => void;
}
```
thành:
```ts
/** Chỉ cần subject + điểm; dùng chung cho overview học sinh (latestExamScore) lẫn lớp (examAvg). */
export interface ComparableSubject {
  subject: string;
  latestExamScore: number | null;
}
interface Props {
  entries: ComparableSubject[];
  onDrillSubject: (subject: string) => void;
}
```
> Phần thân component không đổi (chỉ đọc `entry.subject` + `entry.latestExamScore`). Bỏ import `SubjectEntry` nếu không còn dùng.

- [ ] **Step 2: Viết test**

Create `src/components/journey/classOverviewChapters.test.tsx`:
```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";
import { buildClassOverviewChapters } from "./classOverviewChapters";

useUiStore.setState({ reducedMotion: true });
const wrap = (ui: React.ReactNode) =>
  render(<MemoryRouter><TooltipProvider>{ui}</TooltipProvider></MemoryRouter>);

describe("buildClassOverviewChapters", () => {
  const ov = repo.getClassOverview(CLASS_HERO, "ky-1");

  test("đủ chương mo-dau, cac-mon, hoi-tu", () => {
    const ids = buildClassOverviewChapters(ov, () => {}).map((c) => c.id);
    expect(ids).toEqual(["mo-dau", "cac-mon", "hoi-tu"]);
  });

  test("bấm một môn ở 'Các môn' gọi nav tới hành trình bộ môn", () => {
    const nav = vi.fn();
    const chapters = buildClassOverviewChapters(ov, nav);
    wrap(<>{chapters.find((c) => c.id === "cac-mon")!.render()}</>);
    fireEvent.click(screen.getAllByRole("listitem")[0]);
    expect(nav).toHaveBeenCalledWith(expect.stringMatching(/role=bm&mon=/));
  });
});
```

- [ ] **Step 3: Viết `src/components/journey/classOverviewChapters.tsx`**
```tsx
import type { ClassOverview, UpcomingExam } from "@/data/types";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { ChartCard } from "@/components/charts/chart-kit";
import type { ChapterDef } from "./types-journey";
import { Narrator } from "./Narrator";
import { SubjectComparisonBars } from "./SubjectComparisonBars";
import {
  narrateClassOverviewMoDau, narrateClassOverviewCacMon, narrateClassOverviewHoiTu,
} from "@/lib/narrate";
import { OFFICIAL_EXAM, DEMO_NOW } from "@/data/mock/world";
import { statusOf } from "@/lib/cycles";

function resolveNextExam(): UpcomingExam | null {
  return statusOf(OFFICIAL_EXAM.date, DEMO_NOW) === "upcoming" ? OFFICIAL_EXAM : null;
}

export function buildClassOverviewChapters(
  ov: ClassOverview,
  nav: (path: string) => void
): ChapterDef[] {
  const nextExam = resolveNextExam();
  const drillUrl = (subject: string) =>
    `/app/lop/${ov.klass.id}?role=bm&mon=${encodeURIComponent(subject)}`;

  return [
    {
      id: "mo-dau",
      title: "Mở đầu",
      render: () => (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border bg-card p-5 shadow-sm">
            <ProgressRing value={ov.overallLearningIndex} label="Học tập TB" hideValue />
          </div>
          <Narrator line={narrateClassOverviewMoDau(ov)} variant="opener" />
        </div>
      ),
    },
    {
      id: "cac-mon",
      title: "Các môn",
      render: () => (
        <div className="space-y-4">
          <Narrator line={narrateClassOverviewCacMon(ov)} />
          <ChartCard title="Điểm trung bình các môn" description="Nhấn một môn để xem hành trình lớp theo môn đó.">
            <SubjectComparisonBars
              entries={ov.subjects.map((s) => ({ subject: s.subject, latestExamScore: s.examAvg }))}
              onDrillSubject={(subject) => nav(drillUrl(subject))}
            />
          </ChartCard>
        </div>
      ),
    },
    {
      id: "hoi-tu",
      title: "Hội tụ",
      render: () => (
        <div className="space-y-4">
          <Narrator line={narrateClassOverviewHoiTu(ov, nextExam)} />
          {ov.weakest.weakTopics.length > 0 && (
            <ChartCard title={`Chủ đề lớp nên ôn — ${ov.weakest.subject}`}>
              <ul className="space-y-1.5 text-sm">
                {ov.weakest.weakTopics.filter((t) => t.confirmed).slice(0, 5).map((t) => (
                  <li key={t.topic} className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-warning-500" aria-hidden />
                    <span>{t.topic}</span>
                    <span className="ml-auto tabular-nums text-muted-foreground text-xs">
                      {Math.round(t.accuracyAvg * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </ChartCard>
          )}
        </div>
      ),
    },
  ];
}
```
> Đối chiếu `overviewChapters.tsx` (bản học sinh) để khớp props `ProgressRing`/`ChartCard`/`Narrator` — cùng API.

- [ ] **Step 4: Chạy test → PASS** + đảm bảo `overviewChapters.tsx` (học sinh) vẫn biên dịch với `SubjectComparisonBars` mới (nó truyền `ov.subjects` kiểu `SubjectEntry[]` — vẫn thoả `ComparableSubject` vì có `subject` + `latestExamScore`). Chạy `npx tsc --noEmit`.

- [ ] **Step 5: Commit**
```bash
git add src/components/journey/SubjectComparisonBars.tsx src/components/journey/classOverviewChapters.tsx src/components/journey/classOverviewChapters.test.tsx
git commit -m "feat(journey): chương overview lớp (chủ nhiệm) + nới SubjectComparisonBars dùng chung"
```

---

### Task 7: Trang lớp biết vai + landing + dọn param

**Files:**
- Modify: `src/routes/lop.tsx`
- Modify: `src/lib/nav.ts` (`roleHome` giáo viên + breadcrumb `?role=cn`)
- Test: `src/routes/lop.role.test.tsx` (create)

**Interfaces:**
- Consumes: `repo.getClassOverview`, `repo.getClassJourney`, `repo.getTeacherProfile`, `buildClassOverviewChapters`, `buildClassChapters`, `Journey`, `PageHeader`, `ExportButton`.

- [ ] **Step 1: Viết test**

Create `src/routes/lop.role.test.tsx`:
```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { CLASS_HERO } from "@/data/mock/world";
import Lop from "./lop";

useUiStore.setState({ reducedMotion: true });
const wrap = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <TooltipProvider>
        <Routes><Route path="/app/lop/:classId" element={<Lop />} /></Routes>
      </TooltipProvider>
    </MemoryRouter>
  );

describe("route lớp — vai chủ nhiệm/bộ môn", () => {
  test("role=cn: badge Chủ nhiệm + chương Các môn", () => {
    wrap(`/app/lop/${CLASS_HERO}?role=cn`);
    expect(screen.getByText(/Chủ nhiệm/)).toBeInTheDocument();
    expect(screen.getAllByText("Các môn").length).toBeGreaterThan(0);
  });

  test("role=bm&mon=Địa lí: badge Bộ môn · Địa lí", () => {
    wrap(`/app/lop/${CLASS_HERO}?role=bm&mon=${encodeURIComponent("Địa lí")}`);
    expect(screen.getByText(/Bộ môn · Địa lí/)).toBeInTheDocument();
  });

  test("12 Văn (cn) có liên kết chéo sang môn Địa lí", () => {
    wrap(`/app/lop/${CLASS_HERO}?role=cn`);
    expect(screen.getByText(/Xem môn Địa lí của tôi/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Chạy test → FAIL.**

- [ ] **Step 3: Viết lại `src/routes/lop.tsx`**
```tsx
import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Ky, Subject, TeachingRole } from "@/data/types";
import { SUBJECTS } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";
import { PageHeader } from "@/components/report/PageHeader";
import { ExportButton } from "@/components/report/ExportButton";
import { Journey } from "@/components/journey/Journey";
import { buildClassChapters } from "@/components/journey/classChapters";
import { buildClassOverviewChapters } from "@/components/journey/classOverviewChapters";
import { cn } from "@/lib/utils";

function parseKy(raw: string | null): Ky {
  return raw === "ky-2" || raw === "ca-nam" ? raw : "ky-1";
}
function parseMon(raw: string | null): Subject {
  const s = raw ?? "";
  return (SUBJECTS as readonly string[]).includes(s) ? (s as Subject) : "Địa lí";
}

export default function Lop() {
  const { classId = "" } = useParams();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const activeClassId = sp.get("class") ?? classId;
  const term = parseKy(sp.get("ky"));
  const profile = repo.getTeacherProfile(activeClassId);
  const isHomeroom = profile.homeroomClassIds.includes(activeClassId);
  // Vai mặc định: lớp chủ nhiệm → cn; còn lại → bm
  const role: TeachingRole = sp.get("role") === "bm" ? "bo-mon" : sp.get("role") === "cn" ? "chu-nhiem" : isHomeroom ? "chu-nhiem" : "bo-mon";

  // Môn cho vai bộ môn: ưu tiên ?mon=, nếu không suy từ assignment của lớp này
  const assignedHere = profile.subjectAssignments.find((a) => a.classId === activeClassId)?.subject;
  const subject: Subject = role === "bo-mon" ? parseMon(sp.get("mon") ?? assignedHere ?? null) : "Địa lí";

  const klass = repo.getClass(activeClassId);
  const alsoTeaches = profile.subjectAssignments.find((a) => a.classId === activeClassId)?.subject;

  const updateQuery = useCallback(
    (next: Record<string, string>) => {
      const q = new URLSearchParams(sp);
      for (const [k, v] of Object.entries(next)) q.set(k, v);
      setSp(q, { replace: false });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [sp, setSp]
  );

  const goSubjectView = () => updateQuery({ role: "bm", mon: alsoTeaches ?? "Địa lí" });
  const goHomeroomView = () => updateQuery({ role: "cn" });

  // ----- Vai Chủ nhiệm: overview tất cả môn -----
  if (role === "chu-nhiem") {
    const ov = repo.getClassOverview(activeClassId, term);
    const chapters = buildClassOverviewChapters(ov, (path) => navigate(path));
    const timeline = chapters.map((c) => ({
      id: c.id, label: c.title, status: (c.id === "hoi-tu" ? "upcoming" : "past") as const,
    }));
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Lớp ${klass ? klass.name : ""}`}
          subtitle={`${ov.numStudents} học sinh · ${ov.klass.homeroomTeacher}`}
          right={<ExportButton scope={{ kind: "lop", id: activeClassId, title: `Báo cáo lớp ${klass ? klass.name : ""}` }} />}
        />
        <div className="flex flex-wrap items-center gap-3">
          <RoleBadge role="chu-nhiem" />
          {alsoTeaches && (
            <button type="button" onClick={goSubjectView}
              className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline">
              → Xem môn {alsoTeaches} của tôi ở lớp này
            </button>
          )}
        </div>
        <Journey
          slice={{ term, subject: "Tất cả môn" }}
          availableSlices={{ terms: ["ky-1", "ky-2", "ca-nam"], subjects: ["Tất cả môn"] }}
          onSlice={(s) => updateQuery({ ky: s.term })}
          timeline={timeline}
          chapters={chapters}
        />
      </div>
    );
  }

  // ----- Vai Bộ môn: hành trình lớp theo môn -----
  const journey = repo.getClassJourney(activeClassId, term, subject);
  const chapters = buildClassChapters(journey, (to) => {
    const q = new URLSearchParams();
    q.set("ky", term);
    q.set("mon", subject);
    navigate(`${to}?${q.toString()}`);
  });
  const timeline = chapters.map((c) => ({ id: c.id, label: c.title, status: c.status ?? ("past" as const) }));
  // Các môn GV dạy ở lớp này (để đổi môn nếu dạy nhiều môn)
  const monsHere = profile.subjectAssignments.filter((a) => a.classId === activeClassId).map((a) => a.subject);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Lớp ${klass ? klass.name : ""}`}
        subtitle={`GV chủ nhiệm ${klass ? klass.homeroomTeacher : ""} · ${journey.overview.numStudents} học sinh`}
        right={<ExportButton scope={{ kind: "lop", id: activeClassId, title: `Báo cáo lớp ${klass ? klass.name : ""}` }} />}
      />
      <div className="flex flex-wrap items-center gap-3">
        <RoleBadge role="bo-mon" subject={subject} />
        {isHomeroom && (
          <button type="button" onClick={goHomeroomView}
            className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline">
            → Xem toàn lớp (chủ nhiệm)
          </button>
        )}
      </div>
      <Journey
        slice={{ term, subject }}
        availableSlices={{ terms: journey.availableSlices.terms, subjects: monsHere.length > 1 ? monsHere : [subject] }}
        onSlice={(s) => updateQuery({ ky: s.term, mon: s.subject })}
        timeline={timeline}
        chapters={chapters}
      />
    </div>
  );
}

function RoleBadge({ role, subject }: { role: TeachingRole; subject?: Subject }) {
  const isCn = role === "chu-nhiem";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
      isCn ? "border-success-200 bg-success-50 text-success-700" : "border-brand-200 bg-brand-50 text-brand-700"
    )}>
      <span className={cn("size-1.5 rounded-full", isCn ? "bg-success-500" : "bg-brand-500")} aria-hidden />
      {isCn ? "Chủ nhiệm" : `Bộ môn · ${subject}`}
    </span>
  );
}
```
> `Journey` props `slice.subject` là `SubjectFilter` (đã nới ở phần học sinh) nên `"Tất cả môn"` hợp lệ. `availableSlices.subjects` kiểu `SubjectFilter[]`.

- [ ] **Step 4: Sửa `src/lib/nav.ts`** — đổi landing + breadcrumb cho khớp `?role=`:

`roleHome`:
```ts
    case "giaovien":
      return `/app/lop/${acc.scopeId}?role=cn`;
```
Trong `buildChain`, hai chỗ `to: \`/app/lop/${cls.id}?tab=tong-hop\`` đổi thành `to: \`/app/lop/${cls.id}?role=cn\``.

- [ ] **Step 5: Chạy test → PASS** (`npx vitest run src/routes/lop.role.test.tsx`). Cập nhật test cũ nếu vỡ: `src/routes/lop.test.tsx` (đổi kỳ vọng từ `?tab=` / mặc định Địa lí sang vai chủ nhiệm); `src/routes/lop.present.test.tsx` đã bị xoá trước đó. Sửa các assertion liên quan trong `lop.test.tsx` để khớp vai chủ nhiệm (ví dụ kỳ vọng "Các môn" thay vì một môn).

- [ ] **Step 6: Commit**
```bash
git add src/routes/lop.tsx src/lib/nav.ts src/routes/lop.role.test.tsx src/routes/lop.test.tsx
git commit -m "feat(route): trang lớp biết vai (chủ nhiệm overview / bộ môn) + landing + dọn param"
```

---

### Task 8: Cây lớp ở thanh bên + dọn trang/picker cũ

**Files:**
- Create: `src/components/layout/TeacherNav.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/lib/sidebarNav.ts`
- Modify: `src/router.tsx` (bỏ route `/app/lop-bo-mon`)
- Delete: `src/routes/lop-bo-mon.tsx`, `src/components/journey/ClassPicker.tsx` (+ `ClassPicker.test.tsx` nếu có)
- Test: `src/components/layout/TeacherNav.test.tsx`

**Interfaces:**
- Consumes: `repo.getTeacherProfile`, `buildClassTree` (Task 2), `useUiStore` (account), `react-router NavLink`/`useLocation`.

- [ ] **Step 1: Viết test**

Create `src/components/layout/TeacherNav.test.tsx`:
```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TeacherNav } from "./TeacherNav";
import { CLASS_HERO } from "@/data/mock/world";

const wrap = (path: string) =>
  render(<MemoryRouter initialEntries={[path]}><TeacherNav teacherId={CLASS_HERO} /></MemoryRouter>);

describe("TeacherNav", () => {
  test("hiện nhóm Chủ nhiệm + Bộ môn theo môn", () => {
    wrap("/app/lop/" + CLASS_HERO + "?role=cn");
    expect(screen.getByText("Chủ nhiệm")).toBeInTheDocument();
    expect(screen.getByText(/Bộ môn · Địa lí/)).toBeInTheDocument();
  });

  test("12 Văn xuất hiện ở cả nhóm chủ nhiệm lẫn bộ môn", () => {
    wrap("/app/lop/" + CLASS_HERO + "?role=cn");
    // tên lớp xuất hiện >= 2 lần (một ở mỗi nhóm)
    expect(screen.getAllByText("12 Văn").length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Viết `src/components/layout/TeacherNav.tsx`**
```tsx
import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen } from "lucide-react";
import { mockRepository as repo } from "@/data/mockRepository";
import { buildClassTree } from "@/lib/teacherTree";
import { cn } from "@/lib/utils";

/** Cây lớp của giáo viên: nhóm Chủ nhiệm / Bộ môn·{môn}, leaf là lớp. */
export function TeacherNav({ teacherId, onNavigate }: { teacherId: string; onNavigate?: () => void }) {
  const location = useLocation();
  const tree = buildClassTree(repo.getTeacherProfile(teacherId));
  const here = location.pathname + location.search;

  return (
    <div className="space-y-3">
      {tree.map((group) => (
        <div key={group.key}>
          <div className="px-3 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {group.label}
          </div>
          <div className="space-y-0.5">
            {group.leaves.map((leaf) => {
              const Icon = leaf.role === "chu-nhiem" ? Home : BookOpen;
              const active = here.startsWith(leaf.to) || here === leaf.to;
              return (
                <NavLink
                  key={leaf.role + leaf.classId + (leaf.subject ?? "")}
                  to={leaf.to}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                    active ? "bg-brand-50 font-medium text-brand-700" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{leaf.className}</span>
                  {leaf.alsoTeachesSubject && (
                    <span className="ml-auto text-[10px] text-muted-foreground">+{leaf.alsoTeachesSubject}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Sửa `src/lib/sidebarNav.ts`** — giáo viên chỉ còn "Học sinh" (cây lo phần lớp):
```ts
    case "giaovien":
      return [
        { label: "Học sinh", to: "/app/danh-sach-hoc-sinh", icon: "students", active: (p) => startsAny(p, ["/app/danh-sach-hoc-sinh", "/app/hoc-sinh"]) },
      ];
```

- [ ] **Step 4: Sửa `src/components/layout/Sidebar.tsx`** — rẽ nhánh cây cho giáo viên.

Trong `NavBody`, sau khi lấy `account` và trước `return`, thêm import `TeacherNav` ở đầu file:
```tsx
import { TeacherNav } from "./TeacherNav";
```
Đổi thân `NavBody`:
```tsx
function NavBody({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const account = useUiStore((s) => s.account);
  if (!account) return null;
  const sections = sidebarSections(account);

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {account.role === "giaovien" && (
        <div className="mb-2">
          <TeacherNav teacherId={account.scopeId} onNavigate={onNavigate} />
        </div>
      )}
      {sections.map((s) => {
        const Icon = ICON[s.icon];
        const isActive = s.active(location.pathname);
        return (
          <Link key={s.label} to={s.to} onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-brand-50 text-brand-700" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
            <Icon className="size-4 shrink-0" />
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 5: Bỏ trang/picker cũ.**

Xoá file + route:
```bash
git rm src/routes/lop-bo-mon.tsx src/components/journey/ClassPicker.tsx
```
(Nếu có `src/components/journey/ClassPicker.test.tsx` hoặc `FocusPicker` chỉ dùng bởi ClassPicker → kiểm tra `grep -rn "ClassPicker\|FocusPicker" src`; `FocusPicker` vẫn có thể dùng nơi khác (KyMonPicker?) — chỉ xoá những gì không còn ai dùng.)

Trong `src/router.tsx`: xoá import `LopBoMon` và `<Route path="lop-bo-mon" ... />`.

- [ ] **Step 6: Chạy `npx tsc --noEmit`** → sửa mọi tham chiếu còn lại tới `getTeaching`/`ClassPicker`/`LopBoMon`. `grep -rn "getTeaching\|lop-bo-mon\|ClassPicker" src` phải trống (trừ lịch sử git).

- [ ] **Step 7: Chạy test → PASS** (`npx vitest run src/components/layout/TeacherNav.test.tsx`).

- [ ] **Step 8: Commit**
```bash
git add -A
git commit -m "feat(nav): cây lớp giáo viên ở thanh bên; bỏ trang Lớp bộ môn + ClassPicker"
```

---

### Task 9: Cổng cuối — gates + dọn

**Files:** không tạo mới; chạy toàn bộ kiểm thử.

- [ ] **Step 1:** `npx tsc --noEmit` → sạch.
- [ ] **Step 2:** `npx vitest run` → toàn bộ xanh (sửa các test cũ còn nhắc `getTeaching`/`?tab=`/`Lớp bộ môn`/`ClassPicker` cho khớp thiết kế mới; không nới lỏng kỳ vọng vô cớ).
- [ ] **Step 3:** `npx vite build` → OK.
- [ ] **Step 4: Kiểm thử tay nhanh** (ghi lại, không tự đoán): chạy dev, đăng nhập `?as=acc-gv`, kiểm: cây lớp hiện 2 nhóm; 12 Văn ở cả hai nhóm; vào 12 Văn (cn) thấy overview + liên kết chéo; bấm sang Địa lí thấy hành trình môn + badge; 12 Hóa (cn) không có liên kết chéo; 12 Sinh (Lịch sử) hành trình môn seeded khác Địa lí.
- [ ] **Step 5: Commit** (nếu có sửa test)
```bash
git add -A
git commit -m "test: cập nhật test cho điều hướng giáo viên mới; gates xanh"
```

---

## Self-Review

**Spec coverage:** Mô hình dữ liệu (T1,T3) · cây theo vai (T2,T8) · bố cục B thanh bên (T8) · 12 Văn ở cả hai nhóm (T2,T8) · vai chủ nhiệm = overview tất-cả-môn (T5,T6,T7) · vai bộ môn theo môn (T4,T7) · liên kết chéo + badge (T7) · bỏ trang Lớp bộ môn + ClassPicker + dọn param (T7,T8) · provenance Địa lí thật/môn khác seeded (T4,T5) · landing (T7) · test (mỗi task) → đủ.

**Placeholder scan:** không có TBD/“tương tự Task N”; mọi bước có code thật.

**Type consistency:** `TeacherProfile`/`SubjectAssignment`/`TeachingRole`/`ClassTree*`/`ClassOverview`/`ClassSubjectEntry` định nghĩa ở T1/T5 và dùng nhất quán; `buildClassSubjectReport` trả `ClassReport`; `SubjectComparisonBars` nới sang `ComparableSubject` (T6) tương thích cả `SubjectEntry` (học sinh) lẫn map lớp; route dùng `?role=cn|bm` + `?mon=` đồng bộ với `buildClassTree` (T2) và `nav.ts` (T7).
