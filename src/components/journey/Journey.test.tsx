import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useUiStore } from "@/stores/uiStore";
import { Journey } from "./Journey";

useUiStore.setState({ reducedMotion: true });

const chapters = [
  { id: "mo-dau", title: "Mở đầu", status: "past" as const, render: () => <div>Khúc mở đầu</div> },
  { id: "hoi-tu", title: "Hội tụ", status: "upcoming" as const, render: () => <div>Khúc hội tụ</div> },
];
const timeline = [
  { id: "mo-dau", label: "Mở đầu", status: "past" as const },
  { id: "hoi-tu", label: "Hội tụ", status: "upcoming" as const },
];

describe("Journey", () => {
  test("render picker, timeline, các chương; nút Trình chiếu mở overlay", () => {
    render(
      <Journey
        slice={{ term: "ky-1", subject: "Địa lí" }}
        availableSlices={{ terms: ["ky-1", "ky-2"], subjects: ["Địa lí", "Lịch sử"] }}
        onSlice={() => {}}
        timeline={timeline}
        chapters={chapters}
      />
    );
    expect(screen.getByText("Khúc mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Khúc hội tụ")).toBeInTheDocument();
    // timeline labels (xuất hiện cả ở rail + chương → dùng getAllByText)
    expect(screen.getAllByText("Mở đầu").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Trình chiếu/ }));
    expect(screen.getByText(/Chương 1\/2/)).toBeInTheDocument();
  });

  test("đổi slice gọi onSlice", () => {
    const onSlice = vi.fn();
    render(
      <Journey
        slice={{ term: "ky-1", subject: "Địa lí" }}
        availableSlices={{ terms: ["ky-1", "ca-nam"], subjects: ["Địa lí"] }}
        onSlice={onSlice}
        timeline={timeline}
        chapters={chapters}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Cả năm" }));
    expect(onSlice).toHaveBeenCalledWith({ term: "ca-nam", subject: "Địa lí" });
  });
});
