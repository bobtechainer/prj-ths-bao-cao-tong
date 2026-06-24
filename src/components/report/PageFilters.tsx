import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const KI_OPTIONS = [
  { value: "hk1", label: "Học kì 1 · 9/2025–1/2026" },
  { value: "hk2", label: "Học kì 2 · 1–5/2026" },
];

/** Thanh lọc đặt TRONG nội dung trang (không ở header). Mỗi trang tự ghép bộ lọc phù hợp. */
export function PageFilters({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <SlidersHorizontal className="size-3.5" />
        Lọc
      </span>
      {children}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  width = 170,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: number;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 w-auto" style={{ minWidth: width }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
