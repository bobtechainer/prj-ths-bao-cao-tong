import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { TroLySummary } from "@/components/report/TroLySummary";
import type { NarratedLine } from "@/data/types";

const lines: NarratedLine[] = [
  { text: "Toàn ngành nộp được phần lớn bài về nhà.", figures: [{ label: "Hoàn thành", value: "88%" }] },
  { text: "Một trường còn nhiều em cần hỗ trợ.", figures: [{ label: "Cần hỗ trợ", value: "12%" }] },
];

describe("TroLySummary", () => {
  test("hiện tiêu đề mặc định, từng câu kèm figure cạnh nhau", () => {
    render(<TroLySummary lines={lines} />);
    expect(screen.getByText("Trợ lý tóm tắt")).toBeInTheDocument();
    expect(screen.getByText(/Toàn ngành nộp được/)).toBeInTheDocument();
    expect(screen.getByText("Hoàn thành")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText("Cần hỗ trợ")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  test("dùng tiêu đề tùy biến và bỏ qua khi không có dòng nào", () => {
    const { container, rerender } = render(<TroLySummary lines={lines} title="Trợ lý nói nhanh" />);
    expect(screen.getByText("Trợ lý nói nhanh")).toBeInTheDocument();
    rerender(<TroLySummary lines={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
