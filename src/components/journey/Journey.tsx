import { useState, useEffect } from "react";
import type { Ky, SubjectFilter, EventStatus } from "@/data/types";
import type { ChapterDef } from "./types-journey";
import { KyMonPicker } from "./KyMonPicker";
import { TimelineRail } from "./TimelineRail";
import { Chapter } from "./Chapter";

export type { ChapterDef } from "./types-journey";

/** Vỏ hành trình kể chuyện dùng chung cho cả học sinh và lớp. Nhận chapters đã dựng sẵn. */
export function Journey({
  slice,
  availableSlices,
  onSlice,
  timeline,
  chapters,
}: {
  slice: { term: Ky; subject: SubjectFilter };
  availableSlices: { terms: Ky[]; subjects: SubjectFilter[] };
  onSlice: (s: { term: Ky; subject: SubjectFilter }) => void;
  timeline: { id: string; label: string; status: EventStatus }[];
  chapters: ChapterDef[];
}): JSX.Element {
  const [activeId, setActiveId] = useState<string | undefined>(timeline[0]?.id);

  // Scrollspy: observe each chapter section in the viewport (AppShell's <main> is root)
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const ids = timeline.map((t) => t.id);

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting section
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.id);

        if (intersecting.length === 0) return;

        // Pick the one earliest in the timeline order
        const next = ids.find((id) => intersecting.includes(id));
        if (next !== undefined) {
          setActiveId(next);
        }
      },
      {
        root: null, // viewport — AppShell's main scrolls the whole page
        rootMargin: "-15% 0px -75% 0px",
        threshold: 0,
      }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [timeline]);

  return (
    <div className="space-y-4">
      {/* Sticky header: bộ lọc Kỳ × Môn */}
      <div className="sticky top-0 z-30 -mx-1 flex flex-wrap items-center gap-3 rounded-xl border bg-card/95 px-3 py-2.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <KyMonPicker
          term={slice.term}
          subject={slice.subject}
          terms={availableSlices.terms}
          subjects={availableSlices.subjects}
          onChange={onSlice}
        />
      </div>

      {/* Main layout: sidebar rail + chapters flowing in the page (no nested scroller) */}
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* TimelineRail — hidden on small screens, sticky on desktop, clears sticky picker */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TimelineRail items={timeline} activeId={activeId} />
          </div>
        </aside>

        {/* Plain block: flows in AppShell's <main> scroller — no fixed height, no overflow */}
        <div className="space-y-10 md:space-y-12">
          {chapters.map((c) => (
            <Chapter key={c.id} id={c.id} title={c.title} status={c.status}>
              {c.render()}
            </Chapter>
          ))}
        </div>
      </div>
    </div>
  );
}
