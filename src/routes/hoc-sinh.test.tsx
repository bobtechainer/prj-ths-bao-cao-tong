import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { STUDENT_HERO } from "@/data/mock/world";
import HocSinh from "./hoc-sinh";

useUiStore.setState({ reducedMotion: true });

const wrap = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <TooltipProvider>
        <Routes>
          <Route path="/app/hoc-sinh/:studentId" element={<HocSinh />} />
        </Routes>
      </TooltipProvider>
    </MemoryRouter>
  );

describe("route học sinh — hành trình render không lỗi", () => {
  test("render vỏ Journey với picker và chương Mở đầu", () => {
    wrap(`/app/hoc-sinh/${STUDENT_HERO}?ky=ky-1&mon=Địa lí`);
    expect(screen.getAllByText("Mở đầu").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tổng kết").length).toBeGreaterThan(0);
    // KyMonPicker pill môn Địa lí có mặt
    expect(screen.getAllByText("Địa lí").length).toBeGreaterThan(0);
  });
});
