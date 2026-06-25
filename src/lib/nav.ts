import type { Account, Role } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";

export const ROLE_LABEL: Record<Role, string> = {
  phong: "Phòng GD&ĐT",
  truong: "Hiệu trưởng",
  giaovien: "Giáo viên",
  hocsinh: "Học sinh",
};

const ROLE_LEVEL: Record<Role, number> = { phong: 0, truong: 1, giaovien: 2, hocsinh: 3 };

export function roleHome(acc: Account): string {
  switch (acc.role) {
    case "phong":
      return "/app/phong";
    case "truong":
      return `/app/truong/${acc.scopeId}`;
    case "giaovien":
      return `/app/lop/${acc.scopeId}?role=cn`;
    case "hocsinh":
      return `/app/hoc-sinh/${acc.scopeId}`;
  }
}

export interface Crumb {
  label: string;
  to?: string;
  level: number;
}

/** Chuỗi breadcrumb theo phạm vi, lọc theo quyền của vai trò. */
export function buildChain(pathname: string, role: Role): Crumb[] {
  const lvl = ROLE_LEVEL[role];
  const phong: Crumb = { label: "Phòng GD&ĐT Sơn Tây", to: "/app/phong", level: 0 };
  let school: Crumb | undefined;
  let khoi: Crumb | undefined;
  let klass: Crumb | undefined;
  let student: Crumb | undefined;
  let currentLevel = 0;

  const mStudent = pathname.match(/\/app\/hoc-sinh\/([^/?]+)/);
  const mClass = pathname.match(/\/app\/lop\/([^/?]+)/);
  const mSchool = pathname.match(/\/app\/truong\/([^/?]+)/);

  if (mStudent) {
    const prof = repo.getStudentProfile(decodeURIComponent(mStudent[1]));
    const cls = repo.getClass(prof.student.classId);
    const sch = cls ? repo.getSchool(cls.schoolId) : undefined;
    if (sch) school = { label: sch.name, to: `/app/truong/${sch.id}`, level: 1 };
    if (cls) {
      khoi = { label: `Khối ${cls.khoi}`, level: 1.5 };
      klass = { label: cls.name, to: `/app/lop/${cls.id}?role=cn`, level: 2 };
    }
    student = { label: prof.student.name, level: 3 };
    currentLevel = 3;
  } else if (mClass) {
    const cls = repo.getClass(decodeURIComponent(mClass[1]));
    const sch = cls ? repo.getSchool(cls.schoolId) : undefined;
    if (sch) school = { label: sch.name, to: `/app/truong/${sch.id}`, level: 1 };
    if (cls) {
      khoi = { label: `Khối ${cls.khoi}`, level: 1.5 };
      klass = { label: cls.name, level: 2 };
    }
    currentLevel = 2;
  } else if (mSchool) {
    const sch = repo.getSchool(decodeURIComponent(mSchool[1]));
    if (sch) school = { label: sch.name, level: 1 };
    currentLevel = 1;
  } else {
    currentLevel = 0;
  }

  const all = [phong, school, khoi, klass, student].filter((c): c is Crumb => !!c);
  return all
    .filter((c) => c.level >= lvl)
    .map((c) => (c.level === currentLevel ? { ...c, to: undefined } : c));
}
