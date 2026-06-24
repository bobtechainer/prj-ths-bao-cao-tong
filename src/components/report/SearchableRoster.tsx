import { useState } from "react";
import { Search } from "lucide-react";
import type { ClassRosterRow } from "@/data/types";
import { Input } from "@/components/ui/input";
import { RosterTable } from "./RosterTable";
import { cn } from "@/lib/utils";

/** Danh sách học sinh có tìm kiếm theo tên + lọc "cần hỗ trợ". */
export function SearchableRoster({
  rows,
  onRowClick,
}: {
  rows: ClassRosterRow[];
  onRowClick?: (studentId: string) => void;
}) {
  const [q, setQ] = useState("");
  const [onlyNeed, setOnlyNeed] = useState(false);
  const norm = (s: string) => s.toLowerCase();
  const filtered = rows.filter((r) => norm(r.name).includes(norm(q)) && (!onlyNeed || r.needSupport));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm học sinh theo tên…"
            className="h-9 pl-8"
          />
        </div>
        <button
          onClick={() => setOnlyNeed((v) => !v)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            onlyNeed ? "border-error-200 bg-error-50 text-destructive" : "hover:bg-muted"
          )}
        >
          Cần hỗ trợ
        </button>
        <span className="text-sm text-muted-foreground">{filtered.length} học sinh</span>
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          Không tìm thấy học sinh phù hợp.
        </p>
      ) : (
        <RosterTable rows={filtered} onRowClick={onRowClick} />
      )}
    </div>
  );
}
