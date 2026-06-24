import { Lightbulb } from "lucide-react";

export function InsightCallout({ lines, title = "Vài điều đáng để ý" }: { lines: string[]; title?: string }) {
  if (!lines.length) return null;
  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-800 dark:bg-brand-900/15">
      <div className="mb-2 flex items-center gap-2 font-medium text-brand-800 dark:text-brand-200">
        <Lightbulb className="size-4" />
        {title}
      </div>
      <ul className="space-y-1.5">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground/90">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-500" />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
