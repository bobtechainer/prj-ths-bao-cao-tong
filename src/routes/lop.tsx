import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Ky, Subject, TeachingRole } from "@/data/types";
import { SUBJECTS } from "@/data/types";
import { mockRepository as repo } from "@/data/mockRepository";
import { PageHeader } from "@/components/report/PageHeader";
import { ExportButton } from "@/components/report/ExportButton";
import { Journey } from "@/components/journey/Journey";
import { buildClassChapters } from "@/components/journey/classChapters";
import { buildClassOverviewChapters } from "@/components/journey/classOverviewChapters";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

function parseKy(raw: string | null): Ky {
  return raw === "ky-2" || raw === "ca-nam" ? raw : "ky-1";
}
function parseMon(raw: string | null): Subject {
  const s = raw ?? "";
  return (SUBJECTS as readonly string[]).includes(s) ? (s as Subject) : "Địa lí";
}

export default function Lop() {
  const { classId = "" } = useParams();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const activeClassId = sp.get("class") ?? classId;
  const term = parseKy(sp.get("ky"));

  // Vai NGƯỜI XEM: chỉ giáo viên mới thấy badge vai + liên kết "của tôi".
  // Hiệu trưởng (và vai khác) vào lớp từ "Các lớp" → xem trung lập, mặc định tổng quan lớp.
  const viewerRole = useUiStore((s) => s.role);
  const isTeacher = viewerRole === "giaovien";

  const profile = repo.getTeacherProfile(activeClassId);
  // "Lớp chủ nhiệm của tôi" chỉ có nghĩa với giáo viên.
  const isHomeroom = isTeacher && profile.homeroomClassIds.includes(activeClassId);
  // Vai HIỂN THỊ: ?role= thắng; trống → GV: chủ nhiệm khi là lớp mình CN, còn lại bộ môn; vai khác mặc định tổng quan.
  const roleParam = sp.get("role");
  const role: TeachingRole =
    roleParam === "bm" ? "bo-mon"
    : roleParam === "cn" ? "chu-nhiem"
    : isTeacher ? (isHomeroom ? "chu-nhiem" : "bo-mon")
    : "chu-nhiem";

  // Môn cho vai bộ môn: ưu tiên ?mon=; GV suy thêm từ assignment của lớp này.
  const assignedHere = profile.subjectAssignments.find((a) => a.classId === activeClassId)?.subject;
  const subject: Subject = role === "bo-mon"
    ? parseMon(sp.get("mon") ?? (isTeacher ? assignedHere ?? null : null))
    : "Địa lí";

  const klass = repo.getClass(activeClassId);
  // Liên kết chéo "của tôi" chỉ dành cho giáo viên dạy môn ở chính lớp này.
  const alsoTeaches = isTeacher ? assignedHere : undefined;

  const updateQuery = useCallback(
    (next: Record<string, string>) => {
      const q = new URLSearchParams(sp);
      for (const [k, v] of Object.entries(next)) q.set(k, v);
      setSp(q, { replace: false });
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [sp, setSp]
  );

  const goSubjectView = () => updateQuery({ role: "bm", mon: alsoTeaches ?? "Địa lí" });
  const goHomeroomView = () => updateQuery({ role: "cn" });

  // ----- Vai Chủ nhiệm: overview tất cả môn -----
  if (role === "chu-nhiem") {
    const ov = repo.getClassOverview(activeClassId, term);
    const chapters = buildClassOverviewChapters(ov, (path) => navigate(path));
    const timeline = chapters.map((c) => ({
      id: c.id, label: c.title, status: (c.id === "hoi-tu" ? "upcoming" : "past") as const,
    }));
    return (
      <div className="space-y-5">
        <PageHeader
          title={`Lớp ${klass ? klass.name : ""}`}
          subtitle={`${ov.numStudents} học sinh · ${ov.klass.homeroomTeacher}`}
          right={<ExportButton scope={{ kind: "lop", id: activeClassId, title: `Báo cáo lớp ${klass ? klass.name : ""}` }} />}
        />
        {isTeacher && (
          <div className="flex flex-wrap items-center gap-3">
            <RoleBadge role="chu-nhiem" />
            {alsoTeaches && (
              <button type="button" onClick={goSubjectView}
                className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline">
                → Xem môn {alsoTeaches} của tôi ở lớp này
              </button>
            )}
          </div>
        )}
        <Journey
          slice={{ term, subject: "Tất cả môn" }}
          availableSlices={{ terms: ["ky-1", "ky-2", "ca-nam"], subjects: ["Tất cả môn"] }}
          onSlice={(s) => updateQuery({ ky: s.term })}
          timeline={timeline}
          chapters={chapters}
        />
      </div>
    );
  }

  // ----- Vai Bộ môn: hành trình lớp theo môn -----
  const journey = repo.getClassJourney(activeClassId, term, subject);
  const chapters = buildClassChapters(journey, (to) => {
    const q = new URLSearchParams();
    q.set("ky", term);
    q.set("mon", subject);
    navigate(`${to}?${q.toString()}`);
  });
  const timeline = chapters.map((c) => ({ id: c.id, label: c.title, status: c.status ?? ("past" as const) }));
  // Các môn GV dạy ở lớp này (để đổi môn nếu dạy nhiều môn)
  const monsHere = profile.subjectAssignments.filter((a) => a.classId === activeClassId).map((a) => a.subject);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Lớp ${klass ? klass.name : ""}`}
        subtitle={`GV chủ nhiệm ${klass ? klass.homeroomTeacher : ""} · ${journey.overview.numStudents} học sinh`}
        right={<ExportButton scope={{ kind: "lop", id: activeClassId, title: `Báo cáo lớp ${klass ? klass.name : ""}` }} />}
      />
      <div className="flex flex-wrap items-center gap-3">
        {isTeacher ? (
          <RoleBadge role="bo-mon" subject={subject} />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Môn {subject}
          </span>
        )}
        {isTeacher && isHomeroom && (
          <button type="button" onClick={goHomeroomView}
            className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline">
            → Xem toàn lớp (chủ nhiệm)
          </button>
        )}
        {!isTeacher && (
          <button type="button" onClick={goHomeroomView}
            className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline">
            ← Xem tổng quan lớp
          </button>
        )}
      </div>
      <Journey
        slice={{ term, subject }}
        availableSlices={{ terms: journey.availableSlices.terms, subjects: monsHere.length > 1 ? monsHere : [subject] }}
        onSlice={(s) => updateQuery({ ky: s.term, mon: s.subject })}
        timeline={timeline}
        chapters={chapters}
      />
    </div>
  );
}

function RoleBadge({ role, subject }: { role: TeachingRole; subject?: Subject }) {
  const isCn = role === "chu-nhiem";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
      isCn ? "border-success-200 bg-success-50 text-success-700" : "border-brand-200 bg-brand-50 text-brand-700"
    )}>
      <span className={cn("size-1.5 rounded-full", isCn ? "bg-success-500" : "bg-brand-500")} aria-hidden />
      {isCn ? "Chủ nhiệm" : `Bộ môn · ${subject}`}
    </span>
  );
}
