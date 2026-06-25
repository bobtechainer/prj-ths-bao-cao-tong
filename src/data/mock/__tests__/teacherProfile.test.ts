import { describe, it, expect } from "vitest";
import { mockRepository as repo } from "@/data/mockRepository";
import { CLASS_HERO } from "@/data/mock/world";

describe("getTeacherProfile (cô Hồng)", () => {
  const p = repo.getTeacherProfile(CLASS_HERO);

  it("2 lớp chủ nhiệm, có 12 Văn (thật) + 12 Hóa", () => {
    expect(p.homeroomClassIds).toContain("son-tay-12-van");
    expect(p.homeroomClassIds.length).toBe(2);
  });

  it("có assignment Địa lí ở chính lớp chủ nhiệm 12 Văn", () => {
    expect(p.subjectAssignments).toContainEqual({ classId: "son-tay-12-van", subject: "Địa lí" });
  });

  it("dạy 2 môn: Địa lí và Lịch sử", () => {
    const subjects = new Set(p.subjectAssignments.map((a) => a.subject));
    expect(subjects.has("Địa lí")).toBe(true);
    expect(subjects.has("Lịch sử")).toBe(true);
  });
});
