import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import AccountSelect from "@/routes/account-select";
import { buildClassChapters } from "@/components/journey/classChapters";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO, STUDENT_HERO, SCHOOL_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";
import Phong from "@/routes/phong";
import Truong from "@/routes/truong";
import { ReportDocument } from "@/components/report/ReportDocument";

// Tắt animation để CountUp hiện ngay giá trị cuối trong môi trường test.
useUiStore.setState({ reducedMotion: true });

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>
  );

const wrapWithRoutes = (element: React.ReactElement) =>
  render(
    <MemoryRouter initialEntries={[`/app/truong/${SCHOOL_HERO}`]}>
      <TooltipProvider>
        <Routes>
          <Route path="/app/truong/:schoolId" element={element} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>
  );

describe("smoke — màn hình render không lỗi", () => {
  test("màn chọn tài khoản hiện 4 tài khoản thật", () => {
    wrap(<AccountSelect />);
    expect(screen.getByText("Lê Trung Hiếu")).toBeInTheDocument();
    expect(screen.getByText("Phạm Quốc Đạt")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Minh Hồng")).toBeInTheDocument();
    expect(screen.getByText("Đoàn Thuận Anh Thư")).toBeInTheDocument();
  });

  test("hành trình lớp hero hiện chương mở đầu với số liệu thật", () => {
    const j = repo.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    const ch = buildClassChapters(j, () => {}).find((c) => c.id === "mo-dau")!;
    wrap(<>{ch.render()}</>);
    expect(screen.getAllByText("Sĩ số").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Điểm thi TB").length).toBeGreaterThan(0);
  });

  test("trang Phòng hiện tóm tắt Trợ lý", () => {
    wrap(<Phong />);
    expect(screen.getByText("Trợ lý tóm tắt")).toBeInTheDocument();
  });

  test("trang Trường hiện tóm tắt Trợ lý", () => {
    wrapWithRoutes(<Truong />);
    expect(screen.getByText("Trợ lý tóm tắt")).toBeInTheDocument();
  });

  test("ReportDocument in hành trình học sinh có Tổng kết", () => {
    const { container } = wrap(<ReportDocument scope={{ kind: "hoc-sinh", id: STUDENT_HERO, title: "" }} />);
    expect(within(container).getByText("Tổng kết")).toBeInTheDocument();
    expect(container.querySelectorAll(".report-page").length).toBeGreaterThan(2);
  });

  test("ReportDocument in hành trình lớp có Mở đầu + chi tiết học sinh", () => {
    const { container } = wrap(<ReportDocument scope={{ kind: "lop", id: CLASS_HERO, title: "" }} />);
    expect(within(container).getByText("Mở đầu")).toBeInTheDocument();
    expect(within(container).getByText("Chi tiết học sinh")).toBeInTheDocument();
  });
});
