import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { buildStudentOverview } from "@/data/mock/overview";
import { STUDENT_HERO } from "@/data/mock/world";
import { buildOverviewChapters } from "./overviewChapters";

useUiStore.setState({ reducedMotion: true });

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>
  );

describe("buildOverviewChapters", () => {
  test("returns exactly 3 chapters: mo-dau, cac-mon, hoi-tu", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const chapters = buildOverviewChapters(ov, vi.fn());
    expect(chapters.map((c) => c.id)).toEqual(["mo-dau", "cac-mon", "hoi-tu"]);
  });

  test("mo-dau chapter renders overallLearningIndex narrator text", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const chapters = buildOverviewChapters(ov, vi.fn());
    const moDau = chapters.find((c) => c.id === "mo-dau")!;
    wrap(<>{moDau.render()}</>);
    // The narrator text from narrateOverviewMoDau contains overallLearningIndex
    // Use getAllByText to find all occurrences (ProgressRing + Narrator)
    expect(
      screen.getAllByText(new RegExp(String(ov.overallLearningIndex))).length
    ).toBeGreaterThanOrEqual(1);
  });

  test("cac-mon chapter shows all 8 subject names", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const chapters = buildOverviewChapters(ov, vi.fn());
    const cacMon = chapters.find((c) => c.id === "cac-mon")!;
    wrap(<>{cacMon.render()}</>);
    for (const entry of ov.subjects) {
      expect(screen.getByText(entry.subject)).toBeInTheDocument();
    }
  });

  test("cac-mon drill row calls nav with correct URL including subject name", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const nav = vi.fn();
    const chapters = buildOverviewChapters(ov, nav);
    const cacMon = chapters.find((c) => c.id === "cac-mon")!;
    wrap(<>{cacMon.render()}</>);

    // Click the first subject row
    const firstSubject = ov.subjects[0].subject;
    fireEvent.click(screen.getByText(firstSubject).closest("[data-subject]")!);

    expect(nav).toHaveBeenCalledWith(
      expect.stringContaining(`mon=${encodeURIComponent(firstSubject)}`)
    );
  });

  test("hoi-tu chapter mentions weakest subject in narrator text", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const chapters = buildOverviewChapters(ov, vi.fn());
    const hoiTu = chapters.find((c) => c.id === "hoi-tu")!;
    wrap(<>{hoiTu.render()}</>);
    // Use getAllByText to find all occurrences (Narrator text + figure badge)
    expect(
      screen.getAllByText(new RegExp(ov.weakest.subject)).length
    ).toBeGreaterThanOrEqual(1);
  });
});
