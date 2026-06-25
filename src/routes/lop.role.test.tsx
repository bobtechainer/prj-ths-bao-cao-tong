import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { CLASS_HERO } from "@/data/mock/world";
import Lop from "./lop";

useUiStore.setState({ reducedMotion: true });
const wrap = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <TooltipProvider>
        <Routes><Route path="/app/lop/:classId" element={<Lop />} /></Routes>
      </TooltipProvider>
    </MemoryRouter>
  );

describe("route lớp — vai chủ nhiệm/bộ môn", () => {
  test("role=cn: badge Chủ nhiệm + chương Các môn", () => {
    wrap(`/app/lop/${CLASS_HERO}?role=cn`);
    expect(screen.getByText(/Chủ nhiệm/)).toBeInTheDocument();
    expect(screen.getAllByText("Các môn").length).toBeGreaterThan(0);
  });

  test("role=bm&mon=Địa lí: badge Bộ môn · Địa lí", () => {
    wrap(`/app/lop/${CLASS_HERO}?role=bm&mon=${encodeURIComponent("Địa lí")}`);
    expect(screen.getByText(/Bộ môn · Địa lí/)).toBeInTheDocument();
  });

  test("12 Văn (cn) có liên kết chéo sang môn Địa lí", () => {
    wrap(`/app/lop/${CLASS_HERO}?role=cn`);
    expect(screen.getByText(/Xem môn Địa lí của tôi/)).toBeInTheDocument();
  });
});
