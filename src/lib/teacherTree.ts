import type { TeacherProfile, ClassTreeGroup, ClassTreeLeaf, Subject } from "@/data/types";
import { SUBJECTS } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";

function classNameOf(classId: string): string {
  return repo.getClass(classId)?.name ?? classId;
}

/** Suy cây điều hướng lớp từ hồ sơ giảng dạy. Lớp vừa chủ nhiệm vừa dạy môn xuất hiện ở CẢ hai nhóm. */
export function buildClassTree(profile: TeacherProfile): ClassTreeGroup[] {
  const groups: ClassTreeGroup[] = [];

  // Nhóm Chủ nhiệm
  const homeroomLeaves: ClassTreeLeaf[] = profile.homeroomClassIds.map((classId) => {
    const also = profile.subjectAssignments.find((a) => a.classId === classId)?.subject;
    return {
      classId,
      className: classNameOf(classId),
      role: "chu-nhiem" as const,
      alsoTeachesSubject: also,
      to: `/app/lop/${classId}?role=cn`,
    };
  });
  if (homeroomLeaves.length > 0) {
    groups.push({ key: "chu-nhiem", label: "Chủ nhiệm", leaves: homeroomLeaves });
  }

  // Nhóm Bộ môn · {môn} — gom theo môn, sắp theo thứ tự SUBJECTS
  const bySubject = new Map<Subject, ClassTreeLeaf[]>();
  for (const a of profile.subjectAssignments) {
    const leaf: ClassTreeLeaf = {
      classId: a.classId,
      className: classNameOf(a.classId),
      role: "bo-mon",
      subject: a.subject,
      to: `/app/lop/${a.classId}?role=bm&mon=${encodeURIComponent(a.subject)}`,
    };
    const arr = bySubject.get(a.subject) ?? [];
    arr.push(leaf);
    bySubject.set(a.subject, arr);
  }
  for (const subject of SUBJECTS) {
    const leaves = bySubject.get(subject);
    if (leaves && leaves.length > 0) {
      groups.push({ key: `bo-mon:${subject}`, label: `Bộ môn · ${subject}`, leaves });
    }
  }

  return groups;
}
