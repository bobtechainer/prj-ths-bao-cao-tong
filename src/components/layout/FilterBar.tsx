import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECTS } from "@/data/types";
import { useUiStore } from "@/stores/uiStore";

const KI = ["Đợt 1 · 2025–2026", "Đợt 2 · 2025–2026", "Học kì I", "Cả năm học"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function FilterBar() {
  const filters = useUiStore((s) => s.filters);
  const setFilter = useUiStore((s) => s.setFilter);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Field label="Môn">
        <Select value={filters.mon} onValueChange={(v) => setFilter("mon", v as (typeof SUBJECTS)[number])}>
          <SelectTrigger className="h-9 w-auto min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Kì">
        <Select value={filters.ki} onValueChange={(v) => setFilter("ki", v)}>
          <SelectTrigger className="h-9 w-auto min-w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KI.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Khối">
        <Select value={String(filters.khoi)} onValueChange={(v) => setFilter("khoi", Number(v) as 10 | 11 | 12)}>
          <SelectTrigger className="h-9 w-auto min-w-[96px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 11, 12].map((k) => (
              <SelectItem key={k} value={String(k)}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
