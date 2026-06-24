import type { ExamCodeReport } from "@/data/types";
import { CodeCompareBar } from "@/components/charts/CodeCompareBar";
import { diem } from "@/lib/format";

export function CodeCompare({ codes }: { codes: ExamCodeReport[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <CodeCompareBar data={codes.map((c) => ({ examCode: c.examCode, avg: c.avg, median: c.median, numStudents: c.numStudents }))} />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Mã đề</th>
              <th className="px-3 py-2 text-right font-medium">Số HS</th>
              <th className="px-3 py-2 text-right font-medium">Điểm TB</th>
              <th className="px-3 py-2 text-right font-medium">Trung vị</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.examCode} className="border-b last:border-0">
                <td className="px-3 py-2">{c.examCode}</td>
                <td className="px-3 py-2 text-right tabular-nums">{c.numStudents}</td>
                <td className="px-3 py-2 text-right font-medium tabular-nums">{diem(c.avg)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{diem(c.median)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-3 py-2 text-xs text-muted-foreground">
          Số học sinh mỗi mã đề khác nhau, nên chênh lệch điểm trung bình chỉ nên xem là tham khảo, chưa kết luận đề nào khó hơn.
        </p>
      </div>
    </div>
  );
}
