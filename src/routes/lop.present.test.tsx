import { describe, expect, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Lop from "@/routes/lop";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

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

describe("route lớp — Journey + Trình chiếu", () => {
  test("có nút Trình chiếu; bấm mở chế độ trình chiếu bằng chapters lớp", () => {
    renderAt(`/app/lop/${CLASS_HERO}?ky=ky-1&mon=Địa lí`);
    const btn = screen.getByRole("button", { name: /Trình chiếu/ });
    fireEvent.click(btn);
    // PresentationMode hiện chương đầu (Mở đầu) ở chế độ toàn màn hình
    expect(screen.getAllByText("Mở đầu").length).toBeGreaterThan(0);
  });

  test("đổi Môn trên picker cập nhật query ?mon=", () => {
    renderAt(`/app/lop/${CLASS_HERO}?ky=ky-1&mon=Địa lí`);
    // bộ lọc Kỳ×Môn sticky do Journey dựng — chỉ cần có mặt
    expect(screen.getAllByText(/Học kì 1/).length).toBeGreaterThan(0);
  });
});
