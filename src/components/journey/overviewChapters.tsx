import type { StudentOverview, UpcomingExam } from "@/data/types";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { ChartCard } from "@/components/charts/chart-kit";
import type { ChapterDef } from "./types-journey";
import { Narrator } from "./Narrator";
import { SubjectComparisonBars } from "./SubjectComparisonBars";
import {
  narrateOverviewMoDau,
  narrateOverviewCacMon,
  narrateOverviewHoiTu,
} from "@/lib/narrate";
import { OFFICIAL_EXAM, DEMO_NOW } from "@/data/mock/world";
import { statusOf } from "@/lib/cycles";

function resolveNextExam(): UpcomingExam | null {
  return statusOf(OFFICIAL_EXAM.date, DEMO_NOW) === "upcoming" ? OFFICIAL_EXAM : null;
}

export function buildOverviewChapters(
  ov: StudentOverview,
  nav: (path: string) => void
): ChapterDef[] {
  const nextExam = resolveNextExam();
  const { student, slice } = ov;

  function drillUrl(subject: string): string {
    return `/app/hoc-sinh/${student.id}?ky=${slice.term}&mon=${encodeURIComponent(subject)}`;
  }

  return [
    {
      id: "mo-dau",
      title: "Mở đầu",
      render: () => (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border bg-card p-5 shadow-sm">
            {/* hideValue: the numeric value is conveyed through the Narrator text below */}
            <ProgressRing
              value={ov.overallLearningIndex}
              label="Học tập TB"
              hideValue
            />
          </div>
          <Narrator line={narrateOverviewMoDau(ov)} variant="opener" />
        </div>
      ),
    },
    {
      id: "cac-mon",
      title: "Các môn",
      render: () => (
        <div className="space-y-4">
          <Narrator line={narrateOverviewCacMon(ov)} />
          <ChartCard
            title="Điểm các môn"
            description="Nhấn vào một môn để xem hành trình chi tiết."
          >
            <SubjectComparisonBars
              entries={ov.subjects}
              onDrillSubject={(subject) => nav(drillUrl(subject))}
            />
          </ChartCard>
        </div>
      ),
    },
    {
      id: "hoi-tu",
      title: "Hội tụ",
      render: () => (
        <div className="space-y-4">
          <Narrator line={narrateOverviewHoiTu(ov, nextExam)} />
          {ov.weakest.weakTopics.length > 0 && (
            <ChartCard title="Chủ đề cần chú ý">
              <ul className="space-y-1.5 text-sm">
                {ov.weakest.weakTopics
                  .filter((t) => t.confirmed)
                  .slice(0, 5)
                  .map((t) => (
                    <li key={t.topic} className="flex items-center gap-2">
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-warning-500"
                        aria-hidden
                      />
                      <span>{t.topic}</span>
                      <span className="ml-auto tabular-nums text-muted-foreground text-xs">
                        {Math.round(t.accuracyAvg * 100)}%
                      </span>
                    </li>
                  ))}
              </ul>
            </ChartCard>
          )}
        </div>
      ),
    },
  ];
}
