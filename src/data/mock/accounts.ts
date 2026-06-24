import type { Account } from "@/data/types";
import { CLASS_HERO, SCHOOL_HERO, STUDENT_HERO } from "./world";

export const ACCOUNTS: Account[] = [
  {
    id: "acc-phong",
    name: "Đoàn Thuận Anh Thư",
    role: "phong",
    org: "Phòng GD&ĐT Sơn Tây",
    scopeId: "phong",
    lastLogin: "2026-06-22T07:40:00",
  },
  {
    id: "acc-truong",
    name: "Phạm Quốc Đạt",
    role: "truong",
    org: "THPT Chuyên Sơn Tây",
    scopeId: SCHOOL_HERO,
    lastLogin: "2026-06-23T06:55:00",
  },
  {
    id: "acc-gv",
    name: "Nguyễn Minh Hồng",
    role: "giaovien",
    org: "Giáo viên Địa lí · chủ nhiệm 12 Văn",
    scopeId: CLASS_HERO,
    lastLogin: "2026-06-23T07:10:00",
  },
  {
    id: "acc-hs",
    name: "Lê Trung Hiếu",
    role: "hocsinh",
    org: "Học sinh lớp 12 Văn",
    scopeId: STUDENT_HERO,
    lastLogin: "2026-06-22T20:15:00",
  },
];
