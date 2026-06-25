import { describe, it, expect } from "vitest";
import type { TeacherProfile, ClassTreeGroup } from "@/data/types";

describe("teacher types", () => {
  it("TeacherProfile hợp lệ", () => {
    const p: TeacherProfile = {
      teacherId: "son-tay-12-van",
      teacherName: "Nguyễn Minh Hồng",
      homeroomClassIds: ["son-tay-12-van", "son-tay-12-hóa"],
      subjectAssignments: [{ classId: "son-tay-12-van", subject: "Địa lí" }],
    };
    expect(p.homeroomClassIds.length).toBe(2);
    const g: ClassTreeGroup = { key: "chu-nhiem", label: "Chủ nhiệm", leaves: [] };
    expect(g.leaves.length).toBe(0);
  });
});
