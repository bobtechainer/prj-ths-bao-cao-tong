import { describe, it, expect } from "vitest";
import { statusOf, partitionByCycle } from "@/lib/cycles";

describe("statusOf", () => {
  it("phân loại quá khứ / hiện tại / tương lai", () => {
    expect(statusOf("2026-06-01", "2026-06-10")).toBe("past");
    expect(statusOf("2026-06-10", "2026-06-10")).toBe("current");
    expect(statusOf("2026-06-26", "2026-06-10")).toBe("upcoming");
  });
});

describe("partitionByCycle", () => {
  const boundaries = ["2025-10-20", "2026-01-08"];

  it("cắt theo mốc: mỗi mốc → một chặng, đúng số chặng", () => {
    const ev = [
      { date: "2025-09-10", id: "a" },
      { date: "2025-10-01", id: "b" },
      { date: "2025-11-05", id: "c" },
      { date: "2026-01-08", id: "d" },
    ];
    const out = partitionByCycle(ev, boundaries);
    expect(out.length).toBe(2);
    expect(out[0].map((x) => x.id)).toEqual(["a", "b"]);
    expect(out[1].map((x) => x.id)).toEqual(["c", "d"]);
  });

  it("sự kiện sau mốc cuối dồn vào chặng cuối", () => {
    const ev = [{ date: "2026-02-01", id: "late" }];
    const out = partitionByCycle(ev, boundaries);
    expect(out[out.length - 1].map((x) => x.id)).toEqual(["late"]);
  });

  it("không có mốc → một chặng chứa tất cả", () => {
    const ev = [{ date: "2025-09-10", id: "a" }];
    expect(partitionByCycle(ev, []).length).toBe(1);
  });
});
