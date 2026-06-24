import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KyMonPicker } from "./KyMonPicker";

describe("KyMonPicker", () => {
  test("đổi kỳ giữ nguyên môn", () => {
    const onChange = vi.fn();
    render(
      <KyMonPicker
        term="ky-1"
        subject="Địa lí"
        terms={["ky-1", "ky-2", "ca-nam"]}
        subjects={["Địa lí", "Lịch sử"]}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Cả năm" }));
    expect(onChange).toHaveBeenCalledWith({ term: "ca-nam", subject: "Địa lí" });
  });

  test("đổi môn giữ nguyên kỳ", () => {
    const onChange = vi.fn();
    render(
      <KyMonPicker
        term="ky-1"
        subject="Địa lí"
        terms={["ky-1", "ky-2"]}
        subjects={["Địa lí", "Lịch sử"]}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Lịch sử" }));
    expect(onChange).toHaveBeenCalledWith({ term: "ky-1", subject: "Lịch sử" });
  });
});
