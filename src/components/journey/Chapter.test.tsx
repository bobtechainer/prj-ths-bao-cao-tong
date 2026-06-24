import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { useUiStore } from "@/stores/uiStore";
import { Chapter } from "./Chapter";

useUiStore.setState({ reducedMotion: true });

describe("Chapter", () => {
  test("render id làm anchor + tiêu đề + nội dung", () => {
    const { container } = render(
      <Chapter id="chang-1" title="Chặng 1" status="current">
        <p>Nội dung chặng</p>
      </Chapter>
    );
    const section = container.querySelector("#chang-1");
    expect(section).not.toBeNull();
    expect(section?.getAttribute("data-status")).toBe("current");
    expect(screen.getByText("Chặng 1")).toBeInTheDocument();
    expect(screen.getByText("Nội dung chặng")).toBeInTheDocument();
  });
});
