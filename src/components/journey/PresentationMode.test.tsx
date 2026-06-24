import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useUiStore } from "@/stores/uiStore";
import { PresentationMode } from "./PresentationMode";

useUiStore.setState({ reducedMotion: true });

const chapters = [
  { id: "c1", title: "Chương 1", render: () => <div>Nội dung 1</div> },
  { id: "c2", title: "Chương 2", render: () => <div>Nội dung 2</div> },
];

describe("PresentationMode", () => {
  test("đóng thì không render gì", () => {
    const { container } = render(
      <PresentationMode chapters={chapters} open={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("mở hiện chương đầu; nút › sang chương sau; Esc gọi onClose", () => {
    const onClose = vi.fn();
    render(<PresentationMode chapters={chapters} open onClose={onClose} />);
    expect(screen.getByText("Nội dung 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chương sau" }));
    expect(screen.getByText("Nội dung 2")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("mở tại initialIndex", () => {
    render(<PresentationMode chapters={chapters} open onClose={() => {}} initialIndex={1} />);
    expect(screen.getByText("Nội dung 2")).toBeInTheDocument();
  });
});
