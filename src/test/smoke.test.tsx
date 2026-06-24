import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import AccountSelect from "@/routes/account-select";
import { ThiTab } from "@/routes/lop/ThiTab";
import { TongHopTab } from "@/routes/lop/TongHopTab";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

// Tắt animation để CountUp hiện ngay giá trị cuối trong môi trường test.
useUiStore.setState({ reducedMotion: true });

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
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

  test("tab Thi của lớp hero hiện số liệu thật Sơn Tây", () => {
    const report = repo.getClassReport(CLASS_HERO);
    wrap(<ThiTab report={report} />);
    expect(screen.getByText("7,86")).toBeInTheDocument(); // điểm TB thật
    expect(screen.getByText(/Câu sai nhiều nhất/)).toBeInTheDocument();
    expect(screen.getAllByText(/Thi thử THPT môn Địa lí/).length).toBeGreaterThan(0);
  });

  test("tab Tổng hợp render hai chỉ số + danh sách HS", () => {
    const report = repo.getClassReport(CLASS_HERO);
    const { container } = wrap(<TongHopTab report={report} />);
    expect(screen.getAllByText("Chỉ số học tập").length).toBeGreaterThan(0);
    expect(screen.getByText("Chỉ số nỗ lực")).toBeInTheDocument();
    expect(within(container).getAllByText(/Cần hỗ trợ|Ổn định/).length).toBeGreaterThan(0);
  });
});
