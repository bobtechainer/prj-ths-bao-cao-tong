import { describe, expect, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CycleBand } from "./CycleBand";

describe("CycleBand", () => {
  test("dải gọn hiện label/range/narration + summary; bung children khi bấm", () => {
    render(
      <CycleBand
        label="Chặng 1 · Giữa kì"
        range={{ from: "2026-01-10", to: "2026-03-15" }}
        status="past"
        narration={{ text: "Em làm tốt phần này.", figures: [{ label: "Đúng", value: "82%" }] }}
        summary={<div>Ba ô tóm tắt</div>}
      >
        <div>Chi tiết chặng đầy đủ</div>
      </CycleBand>
    );
    expect(screen.getByText("Chặng 1 · Giữa kì")).toBeInTheDocument();
    expect(screen.getByText("Em làm tốt phần này.")).toBeInTheDocument();
    expect(screen.getByText("Ba ô tóm tắt")).toBeInTheDocument();
    // chi tiết ẩn ban đầu
    expect(screen.queryByText("Chi tiết chặng đầy đủ")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Xem chi tiết chặng/ }));
    expect(screen.getByText("Chi tiết chặng đầy đủ")).toBeInTheDocument();
  });

  test("aria-expanded lật khi bấm toggle", () => {
    render(
      <CycleBand
        label="Chặng 2"
        range={{ from: "2026-03-16", to: "2026-05-30" }}
        status="current"
        narration={{ text: "Đang tiến hành.", figures: [] }}
        summary={<div>Tóm tắt</div>}
      >
        <div>Chi tiết</div>
      </CycleBand>
    );
    const btn = screen.getByRole("button", { name: /Xem chi tiết chặng/ });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("status hiện nhãn chữ (không chỉ màu)", () => {
    render(
      <CycleBand
        label="Chặng 3"
        range={{ from: "2026-06-01", to: "2026-08-01" }}
        status="upcoming"
        narration={{ text: "Sắp bắt đầu.", figures: [] }}
        summary={<div>Tóm tắt</div>}
      >
        <div>Chi tiết</div>
      </CycleBand>
    );
    expect(screen.getByText("Sắp tới")).toBeInTheDocument();
  });
});
