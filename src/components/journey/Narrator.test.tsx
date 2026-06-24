import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Narrator } from "./Narrator";

describe("Narrator", () => {
  test("hiện text và từng figure label/value cạnh nhau", () => {
    render(
      <Narrator
        line={{
          text: "Em giữ nhịp ổn định qua các chặng.",
          figures: [
            { label: "Hạng", value: "5/42" },
            { label: "Chuyên cần", value: "96%" },
          ],
        }}
      />
    );
    expect(screen.getByText("Em giữ nhịp ổn định qua các chặng.")).toBeInTheDocument();
    expect(screen.getByText("Hạng")).toBeInTheDocument();
    expect(screen.getByText("5/42")).toBeInTheDocument();
    expect(screen.getByText("Chuyên cần")).toBeInTheDocument();
    expect(screen.getByText("96%")).toBeInTheDocument();
  });

  test("variant opener dùng cỡ chữ lớn hơn", () => {
    const { container } = render(
      <Narrator line={{ text: "Mở đầu hành trình.", figures: [] }} variant="opener" />
    );
    expect(container.querySelector("[data-variant='opener']")).not.toBeNull();
  });
});
