import { describe, expect, test, afterEach } from "vitest";
import { buildPrintRoot } from "@/lib/export/pdf";

afterEach(() => {
  document.querySelectorAll("#report-root").forEach((n) => n.remove());
});

describe("pdf — DOM in hành trình dài và sạch", () => {
  test("học sinh: nhiều report-page, không lẫn picker / Trình chiếu", async () => {
    const { container, cleanup } = await buildPrintRoot({ kind: "hoc-sinh", id: "hs-le-trung-hieu", title: "" });
    expect(container.id).toBe("report-root");
    expect(container.querySelectorAll(".report-page").length).toBeGreaterThan(2);
    expect(container.querySelector('[data-journey-picker]')).toBeNull();
    expect(container.querySelector('[data-presentation]')).toBeNull();
    expect(container.textContent || "").not.toContain("Trình chiếu");
    cleanup();
    expect(document.getElementById("report-root")).toBeNull();
  });
});
