import { describe, expect, test } from "vitest";
import { mean, median, stddev, toBands, histogram, normalize } from "./metrics";

describe("metrics", () => {
  test("median lẻ và chẵn", () => {
    expect(median([7, 8, 9, 10])).toBe(8.5);
    expect(median([1, 2, 3])).toBe(2);
  });
  test("mean", () => {
    expect(mean([5, 7, 9])).toBe(7);
  });
  test("stddev 0 khi ít hơn 2 phần tử", () => {
    expect(stddev([5])).toBe(0);
  });
  test("normalize về 0..100", () => {
    expect(normalize(8, 10)).toBe(80);
    expect(normalize(80, 100)).toBe(80);
  });
  test("toBands phân nhóm thang 10", () => {
    const b = toBands([4.9, 5, 6.4, 7, 8.5, 9.2], 10);
    expect(b.find((x) => x.label === "Dưới 5")!.count).toBe(1);
    expect(b.find((x) => x.label === "5 – 6.49")!.count).toBe(2);
    expect(b.find((x) => x.label === "9 trở lên")!.count).toBe(1);
  });
  test("histogram step 0.5 đặt nhãn bin", () => {
    const h = histogram([0.2, 5.1], 0.5);
    expect(h[0].bin).toBe("0 – 0,49");
    expect(h[0].count).toBe(1);
    expect(h.find((x) => x.bin === "5 – 5,49")!.count).toBe(1);
    expect(h[h.length - 1].bin).toBe("9,5 – 10");
  });
});
