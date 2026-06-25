import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { buildStudentOverview } from "@/data/mock/overview";
import { STUDENT_HERO } from "@/data/mock/world";
import { diem } from "@/lib/format";
import { SubjectComparisonBars } from "./SubjectComparisonBars";

describe("SubjectComparisonBars", () => {
  test("renders all subject names", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    render(
      <SubjectComparisonBars
        entries={ov.subjects}
        onDrillSubject={vi.fn()}
      />
    );
    for (const entry of ov.subjects) {
      expect(screen.getByText(entry.subject)).toBeInTheDocument();
    }
  });

  test("shows numeric score (tabular-nums) for each entry that has a score", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    const withScore = ov.subjects.filter((e) => e.latestExamScore !== null);
    render(
      <SubjectComparisonBars
        entries={ov.subjects}
        onDrillSubject={vi.fn()}
      />
    );
    // At least one formatted score visible (e.g. "7,5" in Vietnamese format)
    expect(withScore.length).toBeGreaterThan(0);
    // The first scored entry's value must appear somewhere
    const first = withScore[0];
    const formatted = diem(first.latestExamScore!);
    // Escape comma for regex; use getAllByText to allow multiple occurrences
    const escaped = formatted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expect(screen.getAllByText(new RegExp(escaped, "i")).length).toBeGreaterThanOrEqual(1);
  });

  test("clicking a row calls onDrillSubject with the subject name", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ky-1");
    const onDrill = vi.fn();
    render(
      <SubjectComparisonBars
        entries={ov.subjects}
        onDrillSubject={onDrill}
      />
    );
    // Click the first subject row
    const firstSubject = ov.subjects[0].subject;
    fireEvent.click(screen.getByText(firstSubject).closest("[data-subject]")!);
    expect(onDrill).toHaveBeenCalledWith(firstSubject);
  });

  test("strongest row has aria-label or data-strongest attribute", () => {
    const ov = buildStudentOverview(STUDENT_HERO, "ca-nam");
    render(
      <SubjectComparisonBars
        entries={ov.subjects}
        onDrillSubject={vi.fn()}
      />
    );
    // The row for the first entry (strongest) must be marked
    const rows = document.querySelectorAll("[data-subject]");
    expect(rows[0].getAttribute("data-strongest")).toBe("true");
  });
});
