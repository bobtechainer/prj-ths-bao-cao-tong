import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import AccountSelect from "@/routes/account-select";
import { buildClassChapters } from "@/components/journey/classChapters";
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

  test("hành trình lớp hero hiện chương mở đầu với số liệu thật", () => {
    const j = repo.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    const ch = buildClassChapters(j, () => {}).find((c) => c.id === "mo-dau")!;
    wrap(<>{ch.render()}</>);
    expect(screen.getAllByText("Sĩ số").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Điểm thi TB").length).toBeGreaterThan(0);
  });
});
