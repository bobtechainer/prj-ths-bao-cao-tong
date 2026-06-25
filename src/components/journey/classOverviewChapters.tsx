import type { ClassOverview, UpcomingExam } from "@/data/types";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { ChartCard } from "@/components/charts/chart-kit";
import type { ChapterDef } from "./types-journey";
import { Narrator } from "./Narrator";
import { SubjectComparisonBars } from "./SubjectComparisonBars";
import {
  narrateClassOverviewMoDau, narrateClassOverviewCacMon, narrateClassOverviewHoiTu,
} from "@/lib/narrate";
import { OFFICIAL_EXAM, DEMO_NOW } from "@/data/mock/world";
import { statusOf } from "@/lib/cycles";

function resolveNextExam(): UpcomingExam | null {
  return statusOf(OFFICIAL_EXAM.date, DEMO_NOW) === "upcoming" ? OFFICIAL_EXAM : null;
}

export function buildClassOverviewChapters(
  ov: ClassOverview,
  nav: (path: string) => void
): ChapterDef[] {
  const nextExam = resolveNextExam();
  const drillUrl = (subject: string) =>
    `/app/lop/${ov.klass.id}?role=bm&mon=${encodeURIComponent(subject)}`;

  return [
    {
      id: "mo-dau",
      title: "Mở đầu",
      render: () => (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border bg-card p-5 shadow-sm">
            <ProgressRing value={ov.overallLearningIndex} label="Học tập TB" hideValue />
          </div>
          <Narrator line={narrateClassOverviewMoDau(ov)} variant="opener" />
        </div>
      ),
    },
    {
      id: "cac-mon",
      title: "Các môn",
      render: () => (
        <div className="space-y-4">
          <Narrator line={narrateClassOverviewCacMon(ov)} />
          <ChartCard title="Điểm trung bình các môn" description="Nhấn một môn để xem hành trình lớp theo môn đó.">
            <SubjectComparisonBars
              entries={ov.subjects.map((s) => ({ subject: s.subject, latestExamScore: s.examAvg }))}
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
          <Narrator line={narrateClassOverviewHoiTu(ov, nextExam)} />
          {ov.weakest.weakTopics.length > 0 && (
            <ChartCard title={`Chủ đề lớp nên ôn — ${ov.weakest.subject}`}>
              <ul className="space-y-1.5 text-sm">
                {ov.weakest.weakTopics.filter((t) => t.confirmed).slice(0, 5).map((t) => (
                  <li key={t.topic} className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-warning-500" aria-hidden />
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
