import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useUiStore } from "@/stores/uiStore";
import { roleHome } from "@/lib/nav";
import AccountSelect from "@/routes/account-select";
import Phong from "@/routes/phong";
import CacTruong from "@/routes/cac-truong";
import SoSanhMon from "@/routes/so-sanh-mon";
import Truong from "@/routes/truong";
import CacLop from "@/routes/cac-lop";
import LopBoMon from "@/routes/lop-bo-mon";
import DanhSachHocSinh from "@/routes/danh-sach-hoc-sinh";
import Lop from "@/routes/lop";
import HocSinh from "@/routes/hoc-sinh";
import DeThi from "@/routes/de-thi";
import BaiLam from "@/routes/bai-lam";
import NhiemVu from "@/routes/nhiem-vu";
import NhiemVuBaiLam from "@/routes/nhiem-vu-bai-lam";
import Print from "@/routes/print";

function RoleHome() {
  const account = useUiStore((s) => s.account);
  return account ? <Navigate to={roleHome(account)} replace /> : null;
}

export const router = createBrowserRouter([
  { path: "/", element: <AccountSelect /> },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { index: true, element: <RoleHome /> },
      { path: "phong", element: <Phong /> },
      { path: "cac-truong", element: <CacTruong /> },
      { path: "so-sanh-mon", element: <SoSanhMon /> },
      { path: "truong/:schoolId", element: <Truong /> },
      { path: "cac-lop", element: <CacLop /> },
      { path: "lop-bo-mon", element: <LopBoMon /> },
      { path: "danh-sach-hoc-sinh", element: <DanhSachHocSinh /> },
      { path: "lop/:classId", element: <Lop /> },
      { path: "hoc-sinh/:studentId", element: <HocSinh /> },
      { path: "de-thi/:examId", element: <DeThi /> },
      { path: "bai-lam/:examId/:key", element: <BaiLam /> },
      { path: "nhiem-vu/:missionId", element: <NhiemVu /> },
      { path: "nhiem-vu/:missionId/:studentId", element: <NhiemVuBaiLam /> },
    ],
  },
  { path: "/app/in/:scope/:id", element: <Print /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
