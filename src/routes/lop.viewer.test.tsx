import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { CLASS_HERO } from "@/data/mock/world";
import Lop from "./lop";

// Người xem là Hiệu trưởng (không phải giáo viên) — vào lớp từ "Các lớp".
useUiStore.setState({ reducedMotion: true, role: "truong" });

const wrap = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <TooltipProvider>
        <Routes>
          <Route path="/app/lop/:classId" element={<Lop />} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>
  );

describe("route lớp — người xem KHÔNG phải giáo viên (Hiệu trưởng)", () => {
  test("mặc định: tổng quan lớp (Các môn), KHÔNG badge Chủ nhiệm, KHÔNG liên kết 'của tôi'", () => {
    wrap(`/app/lop/${CLASS_HERO}`);
    expect(screen.getAllByText("Các môn").length).toBeGreaterThan(0);
    expect(screen.queryByText("Chủ nhiệm")).toBeNull();
    expect(screen.queryByText(/của tôi/)).toBeNull();
  });

  test("role=bm: chip môn trung lập + link 'Xem tổng quan lớp', KHÔNG badge 'Bộ môn ·'", () => {
    wrap(`/app/lop/${CLASS_HERO}?role=bm&mon=${encodeURIComponent("Địa lí")}`);
    expect(screen.getByText("Môn Địa lí")).toBeInTheDocument();
    expect(screen.getByText(/Xem tổng quan lớp/)).toBeInTheDocument();
    expect(screen.queryByText(/Bộ môn ·/)).toBeNull();
  });
});
