import { describe, it, expect } from "vitest";
import { buildClassJourney } from "@/data/mock/journey";
import { buildClassReport } from "@/data/mock/builders";
import { CLASS_HERO, DEMO_NOW } from "@/data/mock/world";
import { statusOf } from "@/lib/cycles";

describe("buildClassJourney", () => {
  it("convergence.topics = report.weakTopics thật", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    const report = buildClassReport(CLASS_HERO);
    expect(j.convergence.topics).toEqual(report.weakTopics);
  });

  it("needSupport = các roster needSupport", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    const report = buildClassReport(CLASS_HERO);
    expect(j.convergence.needSupport).toEqual(report.roster.filter((r) => r.needSupport));
    expect(j.overview.needSupport).toBe(report.roster.filter((r) => r.needSupport).length);
  });

  it("cycle.exam.narration là bản LỚP (figures có 'trung vị' và 'số bài', không so avg với chính nó)", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    const withExam = j.cycles.find((c) => c.exam !== null);
    expect(withExam).toBeTruthy();
    const labels = withExam!.exam!.narration.figures.map((f) => f.label.toLowerCase());
    expect(labels.some((l) => l.includes("trung vị"))).toBe(true);
    expect(labels.some((l) => l.includes("bài"))).toBe(true);
    expect(withExam!.exam!.narration.text).not.toContain("so với trung bình");
  });

  it("trạng thái chặng đúng + kind='class' + now=DEMO_NOW", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    expect(j.kind).toBe("class");
    expect(j.now).toBe(DEMO_NOW);
    for (const c of j.cycles) expect(c.status).toBe(statusOf(c.range.to, DEMO_NOW));
  });

  it("chỉ chặng cuối có exam", () => {
    const j = buildClassJourney(CLASS_HERO, "ca-nam", "Địa lí");
    const withExam = j.cycles.filter((c) => c.exam !== null);
    expect(withExam.length).toBe(1);
    expect(j.cycles[j.cycles.length - 1].exam).not.toBeNull();
  });
});
