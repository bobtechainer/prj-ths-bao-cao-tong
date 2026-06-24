import { describe, it, expect } from "vitest";
import { KY_LABEL } from "@/data/types";
import type {
  Ky, EventStatus, PrepSurface, NarratedLine, UpcomingExam,
  CycleSession, StudentCycle, StudentJourney, ClassCycle, ClassJourney,
} from "@/data/types";

describe("journey types", () => {
  it("KY_LABEL phủ đủ 3 kỳ với nhãn tiếng Việt", () => {
    const keys: Ky[] = ["ky-1", "ky-2", "ca-nam"];
    expect(keys.map((k) => KY_LABEL[k])).toEqual(["Học kì 1", "Học kì 2", "Cả năm"]);
  });

  it("các interface ráp được (compile-time, smoke runtime)", () => {
    const status: EventStatus = "current";
    const prep: PrepSurface = {
      xemTruoc: { count: 4, total: 5 },
      baiChuanBi: { count: 3, total: 5 },
      dungGio: { count: 4, total: 5 },
    };
    const line: NarratedLine = { text: "x", figures: [{ label: "a", value: "1" }] };
    const next: UpcomingExam = { title: "Kỳ thi THPT chính thức", date: "2026-06-26" };
    const ses: CycleSession = { session: "Buổi 1", date: "2025-09-10", attendance: 1, quizAccuracy: 0.8 };
    void status; void prep; void line; void next; void ses;
    expect(true).toBe(true);
  });
});
