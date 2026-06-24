import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";
import { mockRepository as repo } from "@/data/mockRepository";
import { STUDENT_HERO } from "@/data/mock/world";
import { buildStudentChapters } from "./studentChapters";

useUiStore.setState({ reducedMotion: true });

const wrap = (ui: React.ReactNode) =>
  render(
    <MemoryRouter>
      <TooltipProvider>{ui}</TooltipProvider>
    </MemoryRouter>
  );

describe("buildStudentChapters", () => {
  test("dựng đủ chương Mở đầu, Chuẩn bị, từng chặng, Hội tụ", () => {
    const j = repo.getStudentJourney(STUDENT_HERO, "ky-1", "Địa lí");
    const chapters = buildStudentChapters(j, () => {});
    const ids = chapters.map((c) => c.id);
    expect(ids).toContain("mo-dau");
    expect(ids).toContain("chuan-bi");
    expect(ids).toContain("hoi-tu");
    expect(chapters.filter((c) => c.id.startsWith("cycle-")).length).toBe(j.cycles.length);
  });

  test("chương Mở đầu render được, hiện tên học sinh hoặc chỉ số", () => {
    const j = repo.getStudentJourney(STUDENT_HERO, "ky-1", "Địa lí");
    const chapters = buildStudentChapters(j, () => {});
    const moDau = chapters.find((c) => c.id === "mo-dau")!;
    wrap(<>{moDau.render()}</>);
    expect(screen.getByText(j.overview.narration.text)).toBeInTheDocument();
  });

  test("chương Hội tụ render ConvergencePanel narration", () => {
    const j = repo.getStudentJourney(STUDENT_HERO, "ky-1", "Địa lí");
    const chapters = buildStudentChapters(j, () => {});
    const hoiTu = chapters.find((c) => c.id === "hoi-tu")!;
    wrap(<>{hoiTu.render()}</>);
    expect(screen.getByText(j.convergence.narration.text)).toBeInTheDocument();
  });
});
