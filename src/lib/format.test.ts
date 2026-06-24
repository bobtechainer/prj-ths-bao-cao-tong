import { describe, expect, test } from "vitest";
import { diem, pct, int, num, duration } from "./format";

describe("format", () => {
  test("diem dùng dấu phẩy thập phân", () => {
    expect(diem(7.86)).toBe("7,86");
    expect(diem(8)).toBe("8");
    expect(diem(7.5)).toBe("7,5");
  });
  test("pct nhân 100 và thêm %", () => {
    expect(pct(0.6364)).toBe("63,6%");
    expect(pct(1)).toBe("100%");
  });
  test("int ngăn nghìn bằng dấu chấm", () => {
    expect(int(1234)).toBe("1.234");
    expect(int(108)).toBe("108");
  });
  test("num xử lý null", () => {
    expect(num(null)).toBe("—");
  });
  test("duration ra m:ss", () => {
    expect(duration(95)).toBe("1:35");
    expect(duration(5)).toBe("0:05");
  });
});
