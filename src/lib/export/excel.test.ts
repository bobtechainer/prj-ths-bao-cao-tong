import { describe, expect, test, vi } from "vitest";
import { CLASS_HERO } from "@/data/mock/world";

const { saveAs } = vi.hoisted(() => ({ saveAs: vi.fn() }));
vi.mock("file-saver", () => ({ saveAs }));

import { exportExcel } from "./excel";

describe("xuất Excel", () => {
  test("báo cáo lớp hero dựng workbook và gọi tải xuống với Blob", async () => {
    await exportExcel({ kind: "lop", id: CLASS_HERO, title: "Báo cáo lớp 12 Văn" });
    expect(saveAs).toHaveBeenCalledTimes(1);
    const blob = saveAs.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(2000); // workbook nhiều sheet
    const filename = saveAs.mock.calls[0][1] as string;
    expect(filename).toMatch(/\.xlsx$/);
  });

  test("báo cáo Phòng cũng xuất được", async () => {
    saveAs.mockClear();
    await exportExcel({ kind: "phong", id: "phong", title: "Báo cáo Phòng" });
    expect(saveAs).toHaveBeenCalledTimes(1);
  });
});
