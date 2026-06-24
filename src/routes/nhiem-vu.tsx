import { useParams } from "react-router-dom";
import { mockRepository as repo } from "@/data/mockRepository";
import { diem } from "@/lib/format";
import { PageHeader } from "@/components/report/PageHeader";
import { BackButton } from "@/components/layout/BackButton";
import { QuestionView } from "@/components/report/QuestionView";
import { Reveal } from "@/components/motion";

export default function NhiemVu() {
  const { missionId = "" } = useParams();
  const d = repo.getMissionDetail(missionId);
  return (
    <div className="space-y-5">
      <BackButton />
      <PageHeader
        title={`Nhiệm vụ · ${d.title}`}
        subtitle={`${d.subject} · ${d.completed}/${d.total} học sinh đã làm · điểm trung bình ${diem(d.avgScore)}`}
      />
      <Reveal>
        <h3 className="font-semibold">{d.questions.length} câu hỏi</h3>
      </Reveal>
      <QuestionView questions={d.questions} />
    </div>
  );
}
