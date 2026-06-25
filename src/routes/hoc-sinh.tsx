import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Ky, Subject, EventStatus } from "@/data/types";
import { KY_LABEL, SUBJECTS } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";
import { PageHeader } from "@/components/report/PageHeader";
import { ExportButton } from "@/components/report/ExportButton";
import { Journey } from "@/components/journey/Journey";
import { buildStudentChapters } from "@/components/journey/studentChapters";

function parseKy(raw: string | null): Ky {
  return raw === "ky-2" || raw === "ca-nam" || raw === "ky-1" ? raw : "ky-1";
}

function parseMon(raw: string | null): Subject {
  const s = raw ?? "";
  return (SUBJECTS as readonly string[]).includes(s) ? (s as Subject) : "Địa lí";
}

export default function HocSinh() {
  const { studentId = "" } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const term = parseKy(params.get("ky"));
  const subject = parseMon(params.get("mon"));
  const present = params.get("present") === "1";
  const j = repo.getStudentJourney(studentId, term, subject);

  const onSlice = useCallback(
    (next: { term: Ky; subject: Subject }) => {
      const p = new URLSearchParams(params);
      p.set("ky", next.term);
      p.set("mon", next.subject);
      setParams(p, { replace: true });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [params, setParams]
  );

  const chapters = buildStudentChapters(j, (path) => navigate(path));
  const timeline: { id: string; label: string; status: EventStatus }[] = [
    { id: "mo-dau", label: "Mở đầu", status: "past" },
    { id: "chuan-bi", label: "Chuẩn bị", status: "past" },
    ...j.cycles.map((c) => ({ id: `cycle-${c.id}`, label: c.label, status: c.status })),
    {
      id: "hoi-tu",
      label: "Hội tụ",
      status: (j.convergence.nextExam ? "upcoming" : "current") as EventStatus,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hành trình học tập"
        subtitle={`${j.student.name} · ${j.className} · ${KY_LABEL[term]} · ${j.slice.subject}`}
        right={
          <ExportButton
            scope={{ kind: "hoc-sinh", id: studentId, title: `Báo cáo học sinh ${j.student.name}` }}
          />
        }
      />
      <Journey
        slice={j.slice}
        availableSlices={j.availableSlices}
        onSlice={onSlice}
        timeline={timeline}
        chapters={chapters}
        initialPresent={present}
      />
    </div>
  );
}
