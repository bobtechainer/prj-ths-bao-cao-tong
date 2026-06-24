import { Check, AlertCircle } from "lucide-react";
import type { WeakTopic } from "@/data/types";
import { pct } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLS = [
  { key: "lop", label: "Trên lớp" },
  { key: "nha", label: "Ở nhà" },
  { key: "thi", label: "Bài thi" },
] as const;

function StatusCell({ weak }: { weak: boolean }) {
  return (
    <td className="px-2 py-2 text-center">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
          weak ? "bg-error-50 font-semibold text-destructive" : "bg-success-50 font-medium text-success-700"
        )}
      >
        {weak ? <AlertCircle className="size-3" /> : <Check className="size-3" />}
        {weak ? "Sai nhiều" : "Ổn"}
      </span>
    </td>
  );
}

export function ConvergencePanel({ topics, gentle }: { topics: WeakTopic[]; gentle?: boolean }) {
  if (topics.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        {gentle
          ? "Hiện chưa thấy chủ đề nào em làm sai nhiều ở từ hai nơi trở lên."
          : "Hiện chưa thấy chủ đề nào các em làm sai nhiều ở từ hai nơi trở lên."}
      </p>
    );
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {gentle ? (
          <>
            Những chủ đề em còn làm sai nhiều, nhìn từ lúc học trên lớp, làm bài ở nhà và bài thi. Chủ đề sai nhiều ở từ
            hai cột trở lên thì em nên ôn lại trước.
          </>
        ) : (
          <>
            Những chủ đề các em còn làm sai nhiều, đối chiếu giữa lúc học trên lớp, làm bài ở nhà và bài thi. Chủ đề sai
            nhiều ở từ hai cột trở lên thì nên chữa lại trước.
          </>
        )}
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Chủ đề</th>
              {COLS.map((c) => (
                <th key={c.key} className="px-2 py-2 text-center font-medium">{c.label}</th>
              ))}
              <th className="px-3 py-2 text-right font-medium">Đúng TB</th>
            </tr>
          </thead>
          <tbody>
            {topics.slice(0, 6).map((t) => (
              <tr key={t.topic} className={cn("border-b last:border-0", t.confirmed && "bg-error-50/40")}>
                <td className={cn("px-3 py-2 font-medium", t.confirmed && "border-l-2 border-destructive")}>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {t.topic}
                    {t.confirmed && (
                      <span className="rounded-full border border-error-200 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
                        {gentle ? "nên ôn lại" : "nên chữa trước"}
                      </span>
                    )}
                  </span>
                </td>
                {COLS.map((c) => (
                  <StatusCell key={c.key} weak={t.surfaces[c.key]} />
                ))}
                <td className="px-3 py-2 text-right font-medium tabular-nums">{pct(t.accuracyAvg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
