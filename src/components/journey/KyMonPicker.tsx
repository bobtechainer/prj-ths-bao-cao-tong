import type { Ky, Subject } from "@/data/types";
import { KY_LABEL } from "@/data/types";
import { cn } from "@/lib/utils";

function Pill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-300 bg-brand-50 text-brand-700"
          : "border-transparent bg-muted/60 text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

export function KyMonPicker({
  term,
  subject,
  terms,
  subjects,
  onChange,
}: {
  term: Ky;
  subject: Subject;
  terms: Ky[];
  subjects: Subject[];
  onChange: (next: { term: Ky; subject: Subject }) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Kỳ</span>
        <div className="flex flex-wrap gap-1.5">
          {terms.map((t) => (
            <Pill
              key={t}
              active={t === term}
              label={KY_LABEL[t]}
              onClick={() => onChange({ term: t, subject })}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Môn</span>
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s) => (
            <Pill
              key={s}
              active={s === subject}
              label={s}
              onClick={() => onChange({ term, subject: s })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
