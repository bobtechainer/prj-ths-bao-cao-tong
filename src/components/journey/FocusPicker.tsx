import { cn } from "@/lib/utils";

/** Bộ chọn-một-trong-nhiều generic: dùng để chọn lớp ở bản giáo viên (Plan 03) hoặc bất kỳ danh sách focus nào. */
export function FocusPicker({
  items,
  selectedId,
  onSelect,
}: {
  items: { id: string; label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}): JSX.Element {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => {
        const active = it.id === selectedId;
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={active}
            data-selected={active}
            onClick={() => onSelect(it.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-transparent bg-muted/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
