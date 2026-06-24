import { Check, X } from "lucide-react";
import type { AnswerCell, ExamQuestion } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { pct } from "@/lib/format";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D", "E"];

/** Hiển thị danh sách câu hỏi; nếu có answers thì tô đáp án của học sinh (đúng/sai). */
export function QuestionView({
  questions,
  answers,
}: {
  questions: ExamQuestion[];
  answers?: AnswerCell[];
}) {
  const byId = new Map((answers ?? []).map((a) => [a.questionId, a]));
  return (
    <div className="space-y-3">
      {questions.map((q) => {
        const a = byId.get(q.id);
        return (
          <div
            key={q.id}
            className={cn(
              "rounded-lg border bg-card p-4 shadow-sm",
              a && (a.correct ? "border-l-4 border-l-success-300" : "border-l-4 border-l-error-300")
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Câu {q.order}</span>
                <Badge variant="outline" className="text-muted-foreground">{q.topic}</Badge>
                {a && (
                  <Badge
                    variant="outline"
                    className={a.correct ? "border-success-200 bg-success-50 text-success-700" : "border-error-200 bg-error-50 text-destructive"}
                  >
                    {a.correct ? "Đúng" : "Sai"}
                  </Badge>
                )}
              </div>
              <span className="shrink-0 text-[13px] text-muted-foreground">
                Lớp làm đúng <span className="font-medium tabular-nums text-foreground">{pct(q.correctRate)}</span>
              </span>
            </div>
            <div className="font-medium">{q.content}</div>
            <ul className="mt-2.5 space-y-1.5">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctIndex;
                const isChosen = a && a.chosenIndex === i;
                const wrongChosen = isChosen && !isCorrect;
                return (
                  <li
                    key={i}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
                      isCorrect && "border-success-200 bg-success-50",
                      wrongChosen && "border-error-200 bg-error-50"
                    )}
                  >
                    <span className="font-medium text-muted-foreground">{LETTERS[i]}.</span>
                    <span className="flex-1">{opt}</span>
                    {isChosen && <span className="text-xs text-muted-foreground">em chọn</span>}
                    {isCorrect && <Check className="size-4 text-success" />}
                    {wrongChosen && <X className="size-4 text-destructive" />}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
