import { describe, expect, test } from "vitest";
import { mockRepository as repo } from "./mockRepository";
import { CLASS_HERO } from "./mock/world";
import { REAL_STUDENTS } from "./mock/sontay.real";

describe("mockRepository — lớp hero khớp dữ liệu thật Sơn Tây", () => {
  test("4 tài khoản tên thật", () => {
    const names = repo.getAccounts().map((a) => a.name);
    expect(names).toContain("Lê Trung Hiếu");
    expect(names).toContain("Phạm Quốc Đạt");
    expect(names).toHaveLength(4);
  });

  test("kì thi hero: 108 HS, TB 7,86, trung vị 8", () => {
    const thi = repo.getClassReport(CLASS_HERO).thi;
    expect(thi.numStudents).toBe(108);
    expect(thi.avg).toBeCloseTo(7.86, 2);
    expect(thi.median).toBe(8);
    expect(thi.subject).toBe("Địa lí");
  });

  test("2 mã đề với số liệu thật", () => {
    const codes = repo.getClassReport(CLASS_HERO).thi.codes;
    expect(codes).toHaveLength(2);
    const c1 = codes.find((c) => c.examCode === "MÃ ĐỀ GỐC 1")!;
    const c2 = codes.find((c) => c.examCode === "MÃ ĐỀ GỐC 2")!;
    expect(c1.numStudents).toBe(44);
    expect(c1.avg).toBe(7.97);
    expect(c2.numStudents).toBe(64);
    expect(c1.topMissed).toHaveLength(10);
  });

  test("dữ liệu thật có đúng 108 học sinh", () => {
    expect(REAL_STUDENTS).toHaveLength(108);
  });

  test("hồ sơ Lê Trung Hiếu dựng được", () => {
    const p = repo.getStudentProfile("hs-le-trung-hieu");
    expect(p.student.name).toBe("Lê Trung Hiếu");
    expect(p.learningIndex.parts.length).toBeGreaterThan(0);
    expect(p.teacherDraftNote.length).toBeGreaterThan(10);
  });

  test("phòng có 5 trường", () => {
    expect(repo.getPhongOverview().rows).toHaveLength(5);
  });
});
