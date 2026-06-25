import { describe, it, expect } from "vitest";
import { buildClassTree } from "@/lib/teacherTree";
import type { TeacherProfile } from "@/data/types";

const profile: TeacherProfile = {
  teacherId: "son-tay-12-van",
  teacherName: "Nguyễn Minh Hồng",
  homeroomClassIds: ["son-tay-12-van", "son-tay-12-hóa"],
  subjectAssignments: [
    { classId: "son-tay-12-van", subject: "Địa lí" },
    { classId: "son-tay-12-toán", subject: "Địa lí" },
    { classId: "son-tay-12-sinh", subject: "Lịch sử" },
  ],
};

describe("buildClassTree", () => {
  const tree = buildClassTree(profile);

  it("nhóm đầu là Chủ nhiệm, đủ số lớp chủ nhiệm", () => {
    expect(tree[0].key).toBe("chu-nhiem");
    expect(tree[0].leaves.map((l) => l.classId)).toEqual(["son-tay-12-van", "son-tay-12-hóa"]);
  });

  it("lớp chủ nhiệm mà GV cũng dạy môn → alsoTeachesSubject", () => {
    const van = tree[0].leaves.find((l) => l.classId === "son-tay-12-van")!;
    expect(van.alsoTeachesSubject).toBe("Địa lí");
    expect(van.role).toBe("chu-nhiem");
    expect(van.to).toContain("role=cn");
    const hoa = tree[0].leaves.find((l) => l.classId === "son-tay-12-hóa")!;
    expect(hoa.alsoTeachesSubject).toBeUndefined();
  });

  it("nhóm bộ môn theo môn, có 12 Văn trong nhóm Địa lí (xuất hiện ở cả hai nhóm)", () => {
    const dia = tree.find((g) => g.key === "bo-mon:Địa lí")!;
    expect(dia.label).toBe("Bộ môn · Địa lí");
    expect(dia.leaves.map((l) => l.classId)).toEqual(["son-tay-12-van", "son-tay-12-toán"]);
    const vanBm = dia.leaves[0];
    expect(vanBm.role).toBe("bo-mon");
    expect(vanBm.subject).toBe("Địa lí");
    expect(vanBm.to).toContain("role=bm");
    expect(vanBm.to).toContain("mon=");
  });

  it("nhóm bộ môn sắp theo thứ tự SUBJECTS (Lịch sử trước Địa lí)", () => {
    const keys = tree.filter((g) => g.key.startsWith("bo-mon:")).map((g) => g.key);
    expect(keys).toEqual(["bo-mon:Lịch sử", "bo-mon:Địa lí"]);
  });
});
