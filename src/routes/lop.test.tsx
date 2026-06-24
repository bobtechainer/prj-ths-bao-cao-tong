import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("route lớp dạng hành trình", () => {
  test("render hành trình lớp hero với chương Mở đầu và Hội tụ", () => {
    renderAt(`/app/lop/${CLASS_HERO}?ky=ky-1&mon=Địa lí`);
    expect(screen.getAllByText("Mở đầu").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hội tụ").length).toBeGreaterThan(0);
  });

  test("hiện bộ chọn lớp với lớp chủ nhiệm", () => {
    renderAt(`/app/lop/${CLASS_HERO}?ky=ky-1&mon=Địa lí`);
    expect(screen.getAllByText(/chủ nhiệm/).length).toBeGreaterThan(0);
  });
});
