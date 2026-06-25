import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  test("I-1: evidence link trong CycleBand gọi nav đúng route", () => {
    // Use ca-nam which has cycles with exams
    const j = repo.getStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const nav = vi.fn();
    const chapters = buildStudentChapters(j, nav);

    // Find a cycle chapter that has an exam or missions
    const cycleChapter = chapters.find((c) => c.id.startsWith("cycle-"))!;
    expect(cycleChapter).toBeDefined();

    wrap(<>{cycleChapter.render()}</>);

    // Expand the CycleBand detail section
    fireEvent.click(screen.getByText(/Xem chi tiết/));

    // Find the exam link button or a mission row and click it
    const examBtn = screen.queryByText(/Đề.*bài làm/i) ?? screen.queryByText(/Đề & bài làm/);
    const missionRows = screen.queryAllByRole("row");

    if (examBtn) {
      fireEvent.click(examBtn);
    } else {
      // Click on first mission row (skip the header row)
      const clickableRow = missionRows.find((row) => row.classList.contains("cursor-pointer"));
      expect(clickableRow).toBeDefined();
      fireEvent.click(clickableRow!);
    }

    expect(nav).toHaveBeenCalledWith(
      expect.stringMatching(/^\/app\/(bai-lam|nhiem-vu)\//)
    );
  });

  test("I-2: chương Hội tụ dùng ngôn ngữ học sinh (gentle) — không hiện 'nên chữa trước', hiện 'nên ôn lại'", () => {
    const j = repo.getStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const chapters = buildStudentChapters(j, () => {});
    const hoiTu = chapters.find((c) => c.id === "hoi-tu")!;
    wrap(<>{hoiTu.render()}</>);

    // ConvergencePanel with gentle=true must NOT show teacher phrasing
    expect(screen.queryByText(/nên chữa trước/)).not.toBeInTheDocument();

    // If there are confirmed weak topics, student-voice badge "nên ôn lại" must appear
    const hasConfirmedTopics = j.convergence.topics.some((t) => t.confirmed);
    if (hasConfirmedTopics) {
      // Multiple elements may contain the phrase (narration + badge) — that is fine
      expect(screen.queryAllByText(/nên ôn lại/).length).toBeGreaterThan(0);
    }
  });
});
