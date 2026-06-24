import { useState } from "react";
import { Play } from "lucide-react";
import type { Ky, Subject, EventStatus } from "@/data/types";
import { useReduced } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { ChapterDef } from "./types-journey";
import { KyMonPicker } from "./KyMonPicker";
import { TimelineRail } from "./TimelineRail";
import { Chapter } from "./Chapter";
import { PresentationMode } from "./PresentationMode";

export type { ChapterDef } from "./types-journey";

/** Vỏ hành trình kể chuyện dùng chung cho cả học sinh và lớp. Nhận chapters đã dựng sẵn. */
export function Journey({
  slice,
  availableSlices,
  onSlice,
  timeline,
  chapters,
}: {
  slice: { term: Ky; subject: Subject };
  availableSlices: { terms: Ky[]; subjects: Subject[] };
  onSlice: (s: { term: Ky; subject: Subject }) => void;
  timeline: { id: string; label: string; status: EventStatus }[];
  chapters: ChapterDef[];
}): JSX.Element {
  const reduced = useReduced();
  const [present, setPresent] = useState(false);
  const activeId = timeline.find((t) => t.status === "current")?.id ?? timeline[0]?.id;

  return (
    <div className="space-y-4">
      {/* Sticky header: KyMonPicker + Trình chiếu button */}
      <div className="sticky top-0 z-30 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 px-3 py-2.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <KyMonPicker
          term={slice.term}
          subject={slice.subject}
          terms={availableSlices.terms}
          subjects={availableSlices.subjects}
          onChange={onSlice}
        />
        <button
          type="button"
          onClick={() => setPresent(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 shadow-sm transition-colors hover:bg-brand-100"
        >
          <Play className="size-3.5" /> Trình chiếu
        </button>
      </div>

      {/* Main layout: sidebar rail + scrollable chapters */}
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* TimelineRail — hidden on small screens, sticky on desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TimelineRail items={timeline} activeId={activeId} />
          </div>
        </aside>

        {/* Scroll-snap container: bounded height, overflow-y-auto, snap on full desktop */}
        <div
          className={cn(
            "h-[calc(100dvh-8rem)] overflow-y-auto space-y-8 pr-1",
            !reduced && "md:snap-y md:snap-mandatory"
          )}
        >
          {chapters.map((c) => (
            <Chapter key={c.id} id={c.id} title={c.title} status={c.status}>
              {c.render()}
            </Chapter>
          ))}
        </div>
      </div>

      {/* Presentation overlay */}
      <PresentationMode chapters={chapters} open={present} onClose={() => setPresent(false)} />
    </div>
  );
}
