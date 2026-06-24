import type { Role } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";

export interface NavItem {
  label: string;
  to: string;
  active: boolean;
}
export interface ScopeNav {
  up?: { label: string; to: string };
  groupTitle: string;
  items: NavItem[];
}

/** Danh sách điều hướng cho sidebar: anh em cùng cấp của mục đang xem, theo quyền của vai trò. */
export function scopeNav(pathname: string, role: Role): ScopeNav {
  const mStudent = pathname.match(/\/app\/hoc-sinh\/([^/?]+)/);
  const mClass = pathname.match(/\/app\/lop\/([^/?]+)/);
  const mSchool = pathname.match(/\/app\/truong\/([^/?]+)/);

  if (mStudent) {
    const id = decodeURIComponent(mStudent[1]);
    if (role === "hocsinh") {
      return { groupTitle: "Cá nhân", items: [{ label: "Hồ sơ học tập", to: pathname, active: true }] };
    }
    const prof = repo.getStudentProfile(id);
    const cls = repo.getClass(prof.student.classId);
    const students = cls ? repo.getStudentsOfClass(cls.id) : [];
    return {
      up: cls ? { label: `Lớp ${cls.name}`, to: `/app/lop/${cls.id}?tab=tong-hop` } : undefined,
      groupTitle: cls ? `Học sinh lớp ${cls.name}` : "Học sinh",
      items: students.map((s) => ({ label: s.name, to: `/app/hoc-sinh/${s.id}`, active: s.id === id })),
    };
  }

  if (mClass) {
    const id = decodeURIComponent(mClass[1]);
    const cls = repo.getClass(id);
    const school = cls ? repo.getSchool(cls.schoolId) : undefined;
    // Giáo viên: sidebar là danh sách học sinh của lớp (thao tác chính của GV).
    if (role === "giaovien" && cls) {
      return {
        groupTitle: `Học sinh lớp ${cls.name}`,
        items: repo.getStudentsOfClass(cls.id).map((s) => ({ label: s.name, to: `/app/hoc-sinh/${s.id}`, active: false })),
      };
    }
    const classes = cls ? repo.getClassesOfSchool(cls.schoolId) : [];
    return {
      up: school && (role === "phong" || role === "truong") ? { label: school.name, to: `/app/truong/${school.id}` } : undefined,
      groupTitle: school ? `Lớp · ${school.shortName}` : "Lớp",
      items: classes.map((c) => ({ label: `Lớp ${c.name}`, to: `/app/lop/${c.id}?tab=tong-hop`, active: c.id === id })),
    };
  }

  if (mSchool) {
    const id = decodeURIComponent(mSchool[1]);
    // Hiệu trưởng: sidebar liệt kê các lớp của trường để nhảy nhanh.
    if (role === "truong") {
      const sch = repo.getSchool(id);
      return {
        groupTitle: sch ? `Lớp · ${sch.shortName}` : "Lớp",
        items: repo.getClassesOfSchool(id).map((c) => ({ label: `Lớp ${c.name}`, to: `/app/lop/${c.id}?tab=tong-hop`, active: false })),
      };
    }
    return {
      up: { label: "Phòng GD&ĐT Sơn Tây", to: "/app/phong" },
      groupTitle: "Trường",
      items: repo.getSchools().map((s) => ({ label: s.name, to: `/app/truong/${s.id}`, active: s.id === id })),
    };
  }

  // L0 — Phòng
  return {
    groupTitle: "Trường",
    items: repo.getSchools().map((s) => ({ label: s.name, to: `/app/truong/${s.id}`, active: false })),
  };
}
