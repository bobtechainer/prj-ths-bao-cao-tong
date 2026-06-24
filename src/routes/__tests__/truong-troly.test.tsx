import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Truong from "@/routes/truong";
import { SCHOOL_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

describe("Truong — tóm tắt Trợ lý", () => {
  test("hiện block Trợ lý tóm tắt với figure hoàn thành nhiệm vụ", () => {
    render(
      <MemoryRouter initialEntries={[`/app/truong/${SCHOOL_HERO}`]}>
        <TooltipProvider>
          <Routes>
            <Route path="/app/truong/:schoolId" element={<Truong />} />
          </Routes>
        </TooltipProvider>
      </MemoryRouter>
    );
    // Default title — no title prop passed
    expect(screen.getByText("Trợ lý tóm tắt")).toBeInTheDocument();
    // Unique TroLy figure label (NOT reusing ExecutiveHero chip labels verbatim)
    expect(screen.getByText("Tỉ lệ HT NV")).toBeInTheDocument();
  });
});
