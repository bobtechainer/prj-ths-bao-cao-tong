import { Link, useParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { mockRepository as repo } from "@/data/mockRepository";
import { diem, duration } from "@/lib/format";
import { PageHeader } from "@/components/report/PageHeader";
import { BackButton } from "@/components/layout/BackButton";
import { QuestionView } from "@/components/report/QuestionView";
import { Reveal } from "@/components/motion";

const STATUS: Record<string, string> = {
  todo: "Chưa làm", inprogress: "Đang làm", submitted: "Đã nộp", graded: "Đã chấm",
};

export default function NhiemVuBaiLam() {
  const { missionId = "", studentId = "" } = useParams();
  const d = repo.getMissionDetail(missionId);
  const sub = repo.getStudentMissionSubmission(missionId, studentId);

  return (
    <div className="space-y-5">
      <BackButton />
      <PageHeader
        title={`Bài làm · ${sub.studentName}`}
        subtitle={d.title}
        right={
          <Link
            to={`/app/nhiem-vu/${missionId}`}
            className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:border-brand-300 hover:text-brand-700"
          >
            <ClipboardList className="size-4" /> Xem nhiệm vụ
          </Link>
        }
      />
      <div className="flex flex-wrap gap-6 rounded-lg border bg-card p-4 shadow-sm text-sm">
        <div><span className="text-muted-foreground">Trạng thái: </span><span className="font-medium">{STATUS[sub.status]}</span></div>
        <div><span className="text-muted-foreground">Điểm: </span><span className="font-medium">{sub.score == null ? "—" : diem(sub.score)}</span></div>
        <div><span className="text-muted-foreground">Thời gian làm: </span><span className="font-medium">{sub.durationSec ? duration(sub.durationSec) : "—"}</span></div>
      </div>
      <Reveal>
        <h3 className="font-semibold">Chi tiết từng câu</h3>
      </Reveal>
      <QuestionView questions={d.questions} answers={sub.answers} />
    </div>
  );
}
