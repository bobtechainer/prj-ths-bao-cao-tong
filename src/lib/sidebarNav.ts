import type { Account } from "@/data/types";

export type IconKey =
  | "overview" | "schools" | "compare" | "classes" | "students" | "homeroom" | "subjects" | "me";

export interface SideSection {
  label: string;
  to: string;
  icon: IconKey;
  active: (pathname: string) => boolean;
}

const startsAny = (p: string, prefixes: string[]) => prefixes.some((x) => p === x || p.startsWith(x + "/") || p.startsWith(x + "?") || p === x);

/** Điều hướng CỐ ĐỊNH theo vai — không đổi khi đi sâu (chỉ tô sáng mục đang xem). */
export function sidebarSections(account: Account): SideSection[] {
  switch (account.role) {
    case "phong":
      return [
        { label: "Tổng quan", to: "/app/phong", icon: "overview", active: (p) => p === "/app/phong" },
        { label: "Các trường", to: "/app/cac-truong", icon: "schools", active: (p) => startsAny(p, ["/app/cac-truong", "/app/truong"]) },
        { label: "So sánh theo môn", to: "/app/so-sanh-mon", icon: "compare", active: (p) => p.startsWith("/app/so-sanh-mon") },
      ];
    case "truong":
      return [
        { label: "Tổng quan trường", to: `/app/truong/${account.scopeId}`, icon: "overview", active: (p) => p.startsWith("/app/truong/") },
        { label: "Các lớp", to: "/app/cac-lop", icon: "classes", active: (p) => startsAny(p, ["/app/cac-lop", "/app/lop"]) },
        { label: "Học sinh", to: "/app/danh-sach-hoc-sinh", icon: "students", active: (p) => startsAny(p, ["/app/danh-sach-hoc-sinh", "/app/hoc-sinh"]) },
        { label: "So sánh theo môn", to: "/app/so-sanh-mon", icon: "compare", active: (p) => p.startsWith("/app/so-sanh-mon") },
      ];
    case "giaovien":
      return [
        { label: "Học sinh", to: "/app/danh-sach-hoc-sinh", icon: "students", active: (p) => startsAny(p, ["/app/danh-sach-hoc-sinh", "/app/hoc-sinh"]) },
      ];
    case "hocsinh":
      return [
        { label: "Hồ sơ của tôi", to: `/app/hoc-sinh/${account.scopeId}`, icon: "me", active: (p) => p.startsWith("/app/hoc-sinh/") },
      ];
  }
}
