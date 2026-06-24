import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FocusPicker } from "./FocusPicker";

describe("FocusPicker", () => {
  test("chọn một mục gọi onSelect với id", () => {
    const onSelect = vi.fn();
    render(
      <FocusPicker
        items={[
          { id: "a", label: "Lớp 12 Văn" },
          { id: "b", label: "Lớp 12 Sử" },
        ]}
        selectedId="a"
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Lớp 12 Sử" }));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  test("đánh dấu mục đang chọn", () => {
    render(
      <FocusPicker
        items={[{ id: "a", label: "Lớp 12 Văn" }]}
        selectedId="a"
        onSelect={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "Lớp 12 Văn" }).getAttribute("aria-pressed")).toBe("true");
  });
});
