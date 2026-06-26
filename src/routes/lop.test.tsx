import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Lop from "@/routes/lop";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true, role: "giaovien" });

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <TooltipProvider>
        <Routes>
          <Route path="/app/lop/:classId" element={<Lop />} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>
  );

describe("route lớp dạng hành trình", () => {
  test("render không lỗi với lớp hero ở vai chủ nhiệm mặc định", () => {
    renderAt(`/app/lop/${CLASS_HERO}`);
    // Lớp chủ nhiệm → mặc định hiện vai chủ nhiệm với chương Các môn
    expect(screen.getAllByText("Các môn").length).toBeGreaterThan(0);
  });

  test("vai chủ nhiệm hiện badge Chủ nhiệm", () => {
    renderAt(`/app/lop/${CLASS_HERO}?role=cn`);
    expect(screen.getByText(/Chủ nhiệm/)).toBeInTheDocument();
  });

  test("vai bộ môn với ?role=bm&mon=Địa lí hiện hành trình môn Địa lí", () => {
    renderAt(`/app/lop/${CLASS_HERO}?role=bm&mon=Địa lí`);
    expect(screen.getAllByText("Mở đầu").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tổng kết").length).toBeGreaterThan(0);
  });
});
