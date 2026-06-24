import type { QuestionReport } from "@/data/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { pct } from "@/lib/format";

export function TopMissedTable({ questions }: { questions: QuestionReport[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[140px]">Chủ đề</TableHead>
            <TableHead className="min-w-[260px]">Nội dung câu hỏi</TableHead>
            <TableHead className="min-w-[150px]">Đáp án đúng</TableHead>
            <TableHead className="min-w-[150px]">Lựa chọn sai phổ biến</TableHead>
            <TableHead className="text-right">Lớp làm đúng</TableHead>
            <TableHead className="text-right">Tỉ lệ sai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q) => (
            <TableRow key={q.questionId}>
              <TableCell className="align-top text-sm font-medium">{q.topic}</TableCell>
              <TableCell className="align-top text-sm text-muted-foreground">
                <span className="line-clamp-2" title={q.content}>
                  {q.content}
                </span>
              </TableCell>
              <TableCell className="align-top text-sm text-success">{q.correctAnswer}</TableCell>
              <TableCell className="align-top text-sm text-destructive">{q.commonWrong}</TableCell>
              <TableCell className="align-top text-right text-sm tabular-nums">{pct(q.correctRate)}</TableCell>
              <TableCell className="align-top text-right">
                <Badge
                  variant="outline"
                  className={
                    q.errorRate >= 0.4
                      ? "border-error-200 bg-error-50 text-destructive"
                      : "border-warning-200 bg-warning-50 text-warning-700"
                  }
                >
                  {pct(q.errorRate)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
