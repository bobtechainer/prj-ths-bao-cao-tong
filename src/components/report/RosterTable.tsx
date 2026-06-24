import { useState } from "react";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import type { ClassRosterRow } from "@/data/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { diem, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

type SortKey = "name" | "learning" | "effort" | "exam" | "home" | "attendance";

const COLS: { key: SortKey; label: string; num?: boolean }[] = [
  { key: "name", label: "Học sinh" },
  { key: "learning", label: "Học tập", num: true },
  { key: "effort", label: "Nỗ lực", num: true },
  { key: "exam", label: "Điểm thi", num: true },
  { key: "home", label: "Điểm nhà", num: true },
  { key: "attendance", label: "Chuyên cần", num: true },
];

export function RosterTable({
  rows,
  onRowClick,
}: {
  rows: ClassRosterRow[];
  onRowClick?: (studentId: string) => void;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "learning", dir: -1 });
  const sorted = [...rows].sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    if (typeof av === "string" || typeof bv === "string")
      return String(av).localeCompare(String(bv)) * sort.dir;
    return ((av as number) - (bv as number)) * sort.dir;
  });
  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: key === "name" ? 1 : -1 }));

  const tone = (v: number) => (v >= 80 ? "text-success" : v >= 65 ? "text-foreground" : v >= 50 ? "text-warning-700" : "text-destructive");

  return (
    <div className="max-h-[480px] overflow-auto rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            {COLS.map((c) => (
              <TableHead
                key={c.key}
                onClick={() => toggle(c.key)}
                className={cn("cursor-pointer select-none whitespace-nowrap", c.num && "text-right")}
              >
                <span className={cn("inline-flex items-center gap-1", c.num && "flex-row-reverse")}>
                  {c.label}
                  <ArrowUpDown className={cn("size-3", sort.key === c.key ? "text-foreground" : "text-muted-foreground/40")} />
                </span>
              </TableHead>
            ))}
            <TableHead className="text-right">Tình trạng</TableHead>
            <TableHead className="w-8" aria-hidden />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow
              key={r.studentId}
              onClick={() => onRowClick?.(r.studentId)}
              className={cn(onRowClick && "group cursor-pointer transition-colors hover:bg-muted/60")}
            >
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className={cn("text-right tabular-nums font-medium", tone(r.learning))}>
                <span className="inline-flex items-center justify-end gap-1.5">
                  {r.learning < 50 && <span className="size-1.5 rounded-full bg-current" />}
                  <span className={cn(r.learning < 50 && "font-semibold")}>{r.learning}</span>
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">{r.effort}</TableCell>
              <TableCell className="text-right tabular-nums">{diem(r.exam)}</TableCell>
              <TableCell className="text-right tabular-nums">{diem(r.home)}</TableCell>
              <TableCell className="text-right tabular-nums">{pct(r.attendance)}</TableCell>
              <TableCell className="text-right">
                {r.needSupport ? (
                  <Badge variant="outline" className="border-error-200 bg-error-50 text-destructive">
                    Cần hỗ trợ
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Bình thường</span>
                )}
              </TableCell>
              <TableCell className="pr-3 text-right">
                {onRowClick && (
                  <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
