import { useParams } from "react-router-dom";
import { mockRepository as repo } from "@/data/mockRepository";
import { diem } from "@/lib/format";
import { PageHeader } from "@/components/report/PageHeader";
import { BackButton } from "@/components/layout/BackButton";
import { ChartCard } from "@/components/charts/chart-kit";
import { QuestionView } from "@/components/report/QuestionView";
import { Reveal } from "@/components/motion";

export default function DeThi() {
  const { examId = "" } = useParams();
  const paper = repo.getExamPaper(examId);
  return (
    <div className="space-y-5">
      <BackButton />
      <PageHeader
        title={`Đề thi · ${paper.title}`}
        subtitle={`${paper.subject} · ${paper.term} · ${paper.numStudents} học sinh · điểm trung bình ${diem(paper.avg)}`}
      />
      <Reveal>
        <ChartCard title="Ma trận đề" help="Số câu hỏi theo từng chủ đề.">
          <div className="flex flex-wrap gap-2">
            {paper.matrix.map((m) => (
              <span key={m.topic} className="rounded-full border bg-muted px-3 py-1 text-sm">
                {m.topic} · {m.count} câu
              </span>
            ))}
          </div>
        </ChartCard>
      </Reveal>
      <Reveal>
        <h3 className="font-semibold">{paper.questions.length} câu hỏi</h3>
      </Reveal>
      <QuestionView questions={paper.questions} />
    </div>
  );
}
