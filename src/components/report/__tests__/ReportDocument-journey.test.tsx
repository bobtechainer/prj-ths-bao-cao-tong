import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReportDocument } from "@/components/report/ReportDocument";
import { STUDENT_HERO } from "@/data/mock/world";

describe("ReportDocument — hành trình học sinh in dạng dài", () => {
  test("in nhiều trang hành trình, có Mở đầu / Chuẩn bị / Hội tụ và Trợ lý bám số", () => {
    const { container } = render(
      <MemoryRouter>
        <ReportDocument scope={{ kind: "hoc-sinh", id: STUDENT_HERO, title: "" }} />
      </MemoryRouter>
    );
    // mỗi chặng/phần là một .report-page; phải có nhiều hơn 2 trang
    expect(container.querySelectorAll(".report-page").length).toBeGreaterThan(2);
    expect(screen.getByText("Mở đầu")).toBeInTheDocument();
    expect(screen.getByText("Chuẩn bị")).toBeInTheDocument();
    expect(screen.getByText("Hội tụ")).toBeInTheDocument();
    // Trợ lý phần tổng quan có ít nhất một figure
    expect(screen.getAllByText("Chỉ số học tập").length).toBeGreaterThan(0);
  });
});
