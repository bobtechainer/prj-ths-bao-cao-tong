import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { buildClassChapters } from "@/components/journey/classChapters";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>
  );

describe("buildClassChapters", () => {
  test("dựng đủ chương: mở đầu, chuẩn bị, các chặng, hội tụ", () => {
    const j = repo.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    const chapters = buildClassChapters(j, () => {});
    const ids = chapters.map((c) => c.id);
    expect(ids[0]).toBe("mo-dau");
    expect(ids[1]).toBe("chuan-bi");
    expect(ids[ids.length - 1]).toBe("hoi-tu");
    // mỗi ClassCycle một chương "chang-*"
    expect(ids.filter((i) => i.startsWith("chang-")).length).toBe(j.cycles.length);
  });

  test("chương mở đầu hiện điểm thi TB lớp và sĩ số", () => {
    const j = repo.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    const ch = buildClassChapters(j, () => {}).find((c) => c.id === "mo-dau")!;
    wrap(<>{ch.render()}</>);
    expect(screen.getAllByText("Sĩ số").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Điểm thi TB").length).toBeGreaterThan(0);
  });

  test("hội tụ hiện danh sách HS cần hỗ trợ và cho bấm sang hồ sơ", () => {
    const j = repo.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    let dest = "";
    const ch = buildClassChapters(j, (to) => (dest = to)).find((c) => c.id === "hoi-tu")!;
    wrap(<>{ch.render()}</>);
    // có ít nhất một học sinh trong danh sách cần hỗ trợ → bấm điều hướng /app/hoc-sinh/
    const first = j.convergence.needSupport[0];
    if (first) {
      screen.getByText(first.name).click();
      expect(dest.startsWith("/app/hoc-sinh/")).toBe(true);
    }
  });
});
