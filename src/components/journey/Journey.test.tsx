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

  test("chapters container không phải nested scroll region (không có overflow-y-auto hoặc h-[calc()", () => {
    const { container } = render(
      <Journey
        slice={{ term: "ky-1", subject: "Địa lí" }}
        availableSlices={{ terms: ["ky-1"], subjects: ["Địa lí"] }}
        onSlice={() => {}}
        timeline={timeline}
        chapters={chapters}
      />
    );
    // The chapters wrapper must NOT have fixed-height overflow-y-auto (nested scroller)
    const allDivs = container.querySelectorAll("div");
    for (const div of allDivs) {
      const cls = div.className ?? "";
      // Must not have both overflow-y-auto AND a calc height on the same element
      expect(
        cls.includes("overflow-y-auto") && cls.includes("h-[calc("),
        `Found nested scroll container with class: "${cls}"`
      ).toBe(false);
    }
  });

  test("rail renders với activeId mặc định là timeline[0].id khi không có 'current'", () => {
    render(
      <Journey
        slice={{ term: "ky-1", subject: "Địa lí" }}
        availableSlices={{ terms: ["ky-1"], subjects: ["Địa lí"] }}
        onSlice={() => {}}
        timeline={timeline}
        chapters={chapters}
      />
    );
    // The first timeline item should be active (aria-current="location") since none is "current"
    const nav = screen.getByRole("navigation", { name: /Trục thời gian/ });
    const activeLinks = nav.querySelectorAll('a[aria-current="location"]');
    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0].getAttribute("href")).toBe(`#${timeline[0].id}`);
  });

  test("rail anchors có href='#<id>' cho mỗi mục timeline", () => {
    render(
      <Journey
        slice={{ term: "ky-1", subject: "Địa lí" }}
        availableSlices={{ terms: ["ky-1"], subjects: ["Địa lí"] }}
        onSlice={() => {}}
        timeline={timeline}
        chapters={chapters}
      />
    );
    const nav = screen.getByRole("navigation", { name: /Trục thời gian/ });
    const links = nav.querySelectorAll("a[href]");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("#mo-dau");
    expect(hrefs).toContain("#hoi-tu");
  });
});
