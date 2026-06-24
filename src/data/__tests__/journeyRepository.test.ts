import { describe, it, expect } from "vitest";
import { mockRepository } from "@/data/mockRepository";
import { STUDENT_HERO, CLASS_HERO } from "@/data/mock/world";

describe("repository journey wiring", () => {
  it("getStudentJourney trả StudentJourney đúng lát", () => {
    const j = mockRepository.getStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    expect(j.kind).toBe("student");
    expect(j.slice).toEqual({ term: "ca-nam", subject: "Địa lí" });
  });

  it("getClassJourney trả ClassJourney đúng lát", () => {
    const j = mockRepository.getClassJourney(CLASS_HERO, "ky-1", "Địa lí");
    expect(j.kind).toBe("class");
    expect(j.slice).toEqual({ term: "ky-1", subject: "Địa lí" });
  });

  it("cache theo key: cùng key trả cùng tham chiếu, khác key thì khác", () => {
    const a = mockRepository.getStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const b = mockRepository.getStudentJourney(STUDENT_HERO, "ca-nam", "Địa lí");
    const c = mockRepository.getStudentJourney(STUDENT_HERO, "ky-1", "Địa lí");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
