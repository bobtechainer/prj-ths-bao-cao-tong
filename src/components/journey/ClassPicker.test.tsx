import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassPicker } from "@/components/journey/ClassPicker";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";
import { useUiStore } from "@/stores/uiStore";

useUiStore.setState({ reducedMotion: true });

describe("ClassPicker", () => {
  test("hiện lớp chủ nhiệm và các lớp bộ môn của GV", () => {
    const teaching = repo.getTeaching();
    render(<ClassPicker selectedId={teaching.homeroomClassId} onSelect={() => {}} />);
    const homeroom = repo.getClass(teaching.homeroomClassId)!;
    expect(screen.getByText(new RegExp(homeroom.name)).length ?? 1).toBeTruthy();
    expect(screen.getAllByText(new RegExp(homeroom.name)).length).toBeGreaterThan(0);
  });

  test("bấm một lớp khác gọi onSelect với đúng classId", () => {
    const teaching = repo.getTeaching();
    const other = teaching.subjectClassIds[0];
    const otherName = repo.getClass(other)!.name;
    const onSelect = vi.fn();
    render(<ClassPicker selectedId={CLASS_HERO} onSelect={onSelect} />);
    screen.getByText(new RegExp(otherName)).click();
    expect(onSelect).toHaveBeenCalledWith(other);
  });
});
