import { Link, useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { mockRepository as repo } from "@/data/mockRepository";
import { useUiStore } from "@/stores/uiStore";
import { diem } from "@/lib/format";
import { PageHeader } from "@/components/report/PageHeader";
import { BackButton } from "@/components/layout/BackButton";
import { KpiCard } from "@/components/report/KpiCard";
import { QuestionView } from "@/components/report/QuestionView";
import { Reveal } from "@/components/motion";

export default function BaiLam() {
  const { examId = "", key = "" } = useParams();
  const gentle = useUiStore((s) => s.role) === "hocsinh";
  const sub = repo.getStudentExamSubmission(examId, key);
  const paper = repo.getExamPaper(examId);

  return (
    <div className="space-y-5">
      <BackButton />
      <PageHeader
        title={`Bài làm · ${sub.studentName}`}
        subtitle={`${paper.title} · ${paper.subject}`}
        right={
          <Link
            to={`/app/de-thi/${examId}`}
            className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:border-brand-300 hover:text-brand-700"
          >
            <FileText className="size-4" /> Xem đề
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <KpiCard label="Điểm" value={sub.score} format={(n) => diem(n)} />
        <KpiCard label="Số câu đúng" value={sub.correctCount} suffix={`/ ${sub.total}`} />
        <div className="rounded-lg border bg-card p-4 shadow-sm sm:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">{gentle ? "Em làm tốt ở" : "Chủ đề làm tốt"}</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-success-700">
                <span className="size-1.5 shrink-0 rounded-full bg-success-500" />
                {sub.strong}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{gentle ? "Chủ đề nên ôn lại" : "Chủ đề nên chữa trước"}</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-destructive">
                <span className="size-1.5 shrink-0 rounded-full bg-error-500" />
                {sub.weak}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Reveal>
        <h3 className="font-semibold">Chi tiết từng câu</h3>
      </Reveal>
      <QuestionView questions={paper.questions} answers={sub.answers} />
    </div>
  );
}
