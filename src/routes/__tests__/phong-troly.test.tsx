import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Phong from "@/routes/phong";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

describe("Phong — tóm tắt Trợ lý", () => {
  test("hiện block Trợ lý tóm tắt với figure phần trăm", () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <Phong />
        </TooltipProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("Trợ lý tóm tắt")).toBeInTheDocument();
    // có ít nhất một figure tỉ lệ hoàn thành nhiệm vụ (từ TroLy block)
    expect(screen.getByText("Tỉ lệ HT NV")).toBeInTheDocument();
  });
});
