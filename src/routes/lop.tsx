import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Ky, Subject } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";
import { PageHeader } from "@/components/report/PageHeader";
import { ExportButton } from "@/components/report/ExportButton";
import { Journey } from "@/components/journey/Journey";
import { ClassPicker } from "@/components/journey/ClassPicker";
import { buildClassChapters } from "@/components/journey/classChapters";

function parseKy(raw: string | null): Ky {
  return raw === "ky-2" || raw === "ca-nam" ? raw : "ky-1";
}

export default function Lop() {
  const { classId = "" } = useParams();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // ?class= ghi đè :classId nếu có (giữ đồng bộ khi đổi lớp).
  const activeClassId = sp.get("class") ?? classId;
  const term = parseKy(sp.get("ky"));
  const subject = (sp.get("mon") as Subject) ?? "Địa lí";

  const journey = repo.getClassJourney(activeClassId, term, subject);
  const klass = repo.getClass(activeClassId);

  const chapters = buildClassChapters(journey, (to) => {
    // giữ Kỳ + Môn khi drill xuống học sinh
    const q = new URLSearchParams();
    q.set("ky", term);
    q.set("mon", subject);
    navigate(`${to}?${q.toString()}`);
  });

  const timeline = chapters.map((c) => ({
    id: c.id,
    label: c.title,
    status: c.status ?? ("past" as const),
  }));

  const updateQuery = useCallback(
    (next: Record<string, string>) => {
      const q = new URLSearchParams(sp);
      for (const [k, v] of Object.entries(next)) q.set(k, v);
      setSp(q, { replace: false });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [sp, setSp]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Lớp ${klass ? klass.name : ""}`}
        subtitle={
          klass
            ? `GV chủ nhiệm ${klass.homeroomTeacher} · ${journey.overview.numStudents} học sinh`
            : undefined
        }
        right={
          <ExportButton
            scope={{ kind: "lop", id: activeClassId, title: `Báo cáo lớp ${klass ? klass.name : ""}` }}
          />
        }
      />

      <ClassPicker
        selectedId={activeClassId}
        onSelect={(id) => updateQuery({ class: id })}
      />

      <Journey
        slice={{ term, subject }}
        availableSlices={journey.availableSlices}
        onSlice={(s) => updateQuery({ ky: s.term, mon: s.subject })}
        timeline={timeline}
        chapters={chapters}
      />
    </div>
  );
}
