import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReportDocument } from "@/components/report/ReportDocument";
import { CLASS_HERO } from "@/data/mock/world";

describe("ReportDocument — hành trình lớp in dạng dài", () => {
  test("in hành trình lớp (Mở đầu/Chuẩn bị/Tổng kết) + phụ lục chi tiết học sinh", () => {
    const { container } = render(
      <MemoryRouter>
        <ReportDocument scope={{ kind: "lop", id: CLASS_HERO, title: "" }} />
      </MemoryRouter>
    );
    expect(container.querySelectorAll(".report-page").length).toBeGreaterThan(3);
    expect(screen.getByText("Mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Chuẩn bị")).toBeInTheDocument();
    expect(screen.getByText("Tổng kết")).toBeInTheDocument();
    // phụ lục cũ vẫn còn
    expect(screen.getByText("Chi tiết học sinh")).toBeInTheDocument();
  });
});
