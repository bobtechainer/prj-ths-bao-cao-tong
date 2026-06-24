import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineRail } from "./TimelineRail";

describe("TimelineRail", () => {
  test("hiện nhãn từng mốc và đánh dấu mốc đang xem", () => {
    render(
      <TimelineRail
        items={[
          { id: "mo-dau", label: "Mở đầu", status: "past" },
          { id: "chang-1", label: "Chặng 1", status: "current" },
          { id: "hoi-tu", label: "Hội tụ", status: "upcoming" },
        ]}
        activeId="chang-1"
      />
    );
    expect(screen.getByText("Mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Chặng 1")).toBeInTheDocument();
    expect(screen.getByText("Hội tụ")).toBeInTheDocument();
    const active = screen.getByText("Chặng 1").closest("[data-active]");
    expect(active?.getAttribute("data-active")).toBe("true");
  });

  test("active item has aria-current='location'", () => {
    render(
      <TimelineRail
        items={[
          { id: "mo-dau", label: "Mở đầu", status: "past" },
          { id: "chang-1", label: "Chặng 1", status: "current" },
        ]}
        activeId="chang-1"
      />
    );
    const activeAnchor = screen.getByText("Chặng 1").closest("a");
    expect(activeAnchor?.getAttribute("aria-current")).toBe("location");
  });

  test("statuses render with distinct data-status attributes", () => {
    const { container } = render(
      <TimelineRail
        items={[
          { id: "mo-dau", label: "Mở đầu", status: "past" },
          { id: "chang-1", label: "Chặng 1", status: "current" },
          { id: "hoi-tu", label: "Hội tụ", status: "upcoming" },
        ]}
        activeId="chang-1"
      />
    );
    expect(container.querySelectorAll('li[data-status="past"]')).toHaveLength(1);
    expect(container.querySelectorAll('li[data-status="current"]')).toHaveLength(1);
    expect(container.querySelectorAll('li[data-status="upcoming"]')).toHaveLength(1);
  });
});
