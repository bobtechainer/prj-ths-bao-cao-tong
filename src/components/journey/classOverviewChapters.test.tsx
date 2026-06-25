import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";
import { buildClassOverviewChapters } from "./classOverviewChapters";

useUiStore.setState({ reducedMotion: true });
const wrap = (ui: React.ReactNode) =>
  render(<MemoryRouter><TooltipProvider>{ui}</TooltipProvider></MemoryRouter>);

describe("buildClassOverviewChapters", () => {
  const ov = repo.getClassOverview(CLASS_HERO, "ky-1");

  test("đủ chương mo-dau, cac-mon, hoi-tu", () => {
    const ids = buildClassOverviewChapters(ov, () => {}).map((c) => c.id);
    expect(ids).toEqual(["mo-dau", "cac-mon", "hoi-tu"]);
  });

  test("bấm một môn ở 'Các môn' gọi nav tới hành trình bộ môn", () => {
    const nav = vi.fn();
    const chapters = buildClassOverviewChapters(ov, nav);
    wrap(<>{chapters.find((c) => c.id === "cac-mon")!.render()}</>);
    fireEvent.click(screen.getAllByRole("listitem")[0]);
    expect(nav).toHaveBeenCalledWith(expect.stringMatching(/role=bm&mon=/));
  });
});
