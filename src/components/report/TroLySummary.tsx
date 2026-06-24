import { Sparkles } from "lucide-react";
import type { NarratedLine } from "@/data/types";
import { Narrator } from "@/components/journey/Narrator";
import { Reveal } from "@/components/motion";

interface TroLySummaryProps {
  lines: NarratedLine[];
  title?: string;
}

export function TroLySummary({ lines, title = "Trợ lý tóm tắt" }: TroLySummaryProps) {
  if (lines.length === 0) return null;

  return (
    <Reveal>
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 dark:bg-brand-900/10">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
          <Sparkles className="size-4" />
          {title}
        </div>
        <div className="space-y-3">
          {lines.map((line, i) => (
            <Narrator key={i} line={line} variant="line" />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
