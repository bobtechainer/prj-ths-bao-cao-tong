import type { ReactNode } from "react";
import type { EventStatus } from "@/data/types";
import { Reveal } from "@/components/motion";

/** Một chương trong hành trình: anchor cuộn (snap-start) + hiện dần khi tới. */
export function Chapter({
  id,
  title,
  status,
  children,
}: {
  id: string;
  title: string;
  status?: EventStatus;
  children: ReactNode;
}) {
  return (
    <section id={id} data-status={status} className="scroll-mt-24 py-2">
      <Reveal>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">{title}</h2>
        <div className="space-y-4">{children}</div>
      </Reveal>
    </section>
  );
}
