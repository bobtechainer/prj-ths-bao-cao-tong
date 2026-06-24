import type { ReactNode } from "react";
import { mockRepository as repo } from "@/data/mockRepository";
import { useUiStore } from "@/stores/uiStore";
import type { ClassReport, ExamCodeReport, QuestionReport, StudentJourney, NarratedLine, StudentCycle } from "@/data/types";
import { KY_LABEL } from "@/data/types";
import type { ExportScope } from "@/lib/export/exportService";
import { diem, int, pct } from "@/lib/format";

const INK = "#0A0A0A";
const MUTED = "#6B7280";
const BRAND = "#237BD3";
const NAVY = "#041F4A";
const LINE = "#E5E7EB";

function rate(v: number) {
  return v >= 0.8 ? "#079455" : v >= 0.65 ? BRAND : v >= 0.5 ? "#FFA23A" : "#F04438";
}
function band(label: string) {
  if (label.startsWith("9")) return "#079455";
  if (label.startsWith("8")) return BRAND;
  if (label.startsWith("6")) return "#84CAF7";
  if (label.startsWith("5")) return "#FFA23A";
  return "#F04438";
}

const A4: React.CSSProperties = { width: 794, minHeight: 1123, padding: 48, boxSizing: "border-box", background: "#fff", color: INK };

function Page({ children, footer }: { children: ReactNode; footer?: string }) {
  return (
    <div className="report-page" style={{ ...A4, position: "relative", fontFamily: "var(--font-sans)" }}>
      {children}
      <div style={{ position: "absolute", left: 48, right: 48, bottom: 24, display: "flex", justifyContent: "space-between", fontSize: 11, color: MUTED, borderTop: `1px solid ${LINE}`, paddingTop: 8 }}>
        <span>Trường học số · {footer ?? "Báo cáo"}</span>
        <span>Hệ thống quản lý kết quả học tập</span>
      </div>
    </div>
  );
}

function H({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: "18px 0 10px" }}>{children}</div>;
}

function NarratorLine({ line }: { line: NarratedLine }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: "10px 12px", background: "#F1F5F9" }}>
      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: INK }}>{line.text}</div>
      {line.figures.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {line.figures.map((f, i) => (
            <span key={i} style={{ fontSize: 11, color: MUTED }}>
              {f.label}: <b style={{ color: NAVY }}>{f.value}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CycleHead({ label, range, status }: { label: string; range: { from: string; to: string }; status: string }) {
  const tag = status === "upcoming" ? "Sắp tới" : status === "current" ? "Đang diễn ra" : "Đã qua";
  const col = status === "upcoming" ? "#FFA23A" : status === "current" ? BRAND : MUTED;
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{label}</div>
      <div style={{ fontSize: 11, color: col, fontWeight: 600 }}>
        {tag} · {range.from} → {range.to}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: "12px 14px", flex: 1 }}>
      <div style={{ fontSize: 11, color: MUTED }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function StaticRing({ value, size = 132, stroke = 14 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const len = 100 * Math.max(0, Math.min(1, value / 100));
  const col = value >= 80 ? "#079455" : value >= 65 ? BRAND : value >= 50 ? "#FFA23A" : "#F04438";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#EEF2F6" strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round" pathLength={100} strokeDasharray={`${len} 100`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: col }}>{Math.round(value)}</div>
          <div style={{ fontSize: 11, color: MUTED }}>/ 100</div>
        </div>
      </div>
    </div>
  );
}

function Bars({ rows }: { rows: { label: string; pct: number; color: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 230, fontSize: 12 }}>{r.label}</div>
          <div style={{ flex: 1, height: 16, background: "#F1F5F9", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: `${r.pct}%`, height: "100%", background: r.color, borderRadius: 6 }} />
          </div>
          <div style={{ width: 42, textAlign: "right", fontSize: 12, fontWeight: 600 }}>{r.pct}%</div>
        </div>
      ))}
    </div>
  );
}

function MissedTable({ qs }: { qs: QuestionReport[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
      <thead>
        <tr style={{ background: BRAND, color: "#fff" }}>
          <th style={{ textAlign: "left", padding: 6 }}>Chủ đề</th>
          <th style={{ textAlign: "left", padding: 6 }}>Đáp án đúng</th>
          <th style={{ textAlign: "left", padding: 6 }}>Sai phổ biến</th>
          <th style={{ textAlign: "right", padding: 6 }}>Tỉ lệ sai</th>
        </tr>
      </thead>
      <tbody>
        {qs.map((q, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${LINE}` }}>
            <td style={{ padding: 6 }}>{q.topic}</td>
            <td style={{ padding: 6, color: "#079455" }}>{q.correctAnswer}</td>
            <td style={{ padding: 6, color: "#F04438" }}>{q.commonWrong}</td>
            <td style={{ padding: 6, textAlign: "right", fontWeight: 600 }}>{pct(q.errorRate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Cover({ title, subtitle, term, ring }: { title: string; subtitle: string; term: string; ring?: number }) {
  const account = useUiStore.getState().account;
  const d = new Date();
  const stamp = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return (
    <Page footer="Báo cáo kết quả học tập">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/logomark.svg" width={36} height={36} alt="" />
        <span style={{ fontSize: 16, fontWeight: 700 }}>Trường học số</span>
      </div>
      <div style={{ marginTop: 180, textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: BRAND, fontWeight: 600 }}>BÁO CÁO KẾT QUẢ HỌC TẬP</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: NAVY, marginTop: 10 }}>{title}</div>
        <div style={{ fontSize: 15, color: MUTED, marginTop: 6 }}>{subtitle}</div>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{term}</div>
        {ring != null && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <StaticRing value={ring} size={150} />
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 48, bottom: 80, fontSize: 12, color: MUTED }}>
        <div>Ngày xuất: {stamp}</div>
        {account && <div>Người xuất: {account.name} · {account.org}</div>}
      </div>
    </Page>
  );
}

function ClassPages({ r }: { r: ClassReport }) {
  const code: ExamCodeReport = r.thi.codes[0];
  const topicRows = code.topics
    .slice()
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((t) => ({ label: `${t.topic} · ${t.numQuestions} câu`, pct: Math.round(t.accuracy * 100), color: rate(t.accuracy) }));

  const detail = r.thi.studentDetail;
  const chunks: typeof detail[] = [];
  for (let i = 0; i < detail.length; i += 28) chunks.push(detail.slice(i, i + 28));

  return (
    <>
      <Page footer="Tổng quan">
        <H>Tóm tắt</H>
        <div style={{ display: "flex", gap: 10 }}>
          <Stat label="Số học sinh" value={int(r.thi.numStudents)} />
          <Stat label="Điểm trung bình" value={diem(r.thi.avg)} />
          <Stat label="Trung vị" value={diem(r.thi.median)} />
          <Stat label="Chỉ số học tập" value={`${r.learningIndex.total}/100`} />
        </div>

        <H>Nhận định nhanh</H>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
          {code.insights.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>

        <H>Phân bố điểm theo nhóm</H>
        <Bars rows={r.thi.bands.map((b) => ({ label: `${b.label} (${b.count} HS)`, pct: Math.round(b.ratio * 100), color: band(b.label) }))} />

        {r.thi.codes.length > 1 && (
          <>
            <H>So sánh giữa các mã đề</H>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: BRAND, color: "#fff" }}>
                  <th style={{ textAlign: "left", padding: 6 }}>Mã đề</th>
                  <th style={{ textAlign: "right", padding: 6 }}>Số HS</th>
                  <th style={{ textAlign: "right", padding: 6 }}>Điểm TB</th>
                  <th style={{ textAlign: "right", padding: 6 }}>Trung vị</th>
                </tr>
              </thead>
              <tbody>
                {r.thi.codes.map((c) => (
                  <tr key={c.examCode} style={{ borderBottom: `1px solid ${LINE}` }}>
                    <td style={{ padding: 6 }}>{c.examCode}</td>
                    <td style={{ padding: 6, textAlign: "right" }}>{c.numStudents}</td>
                    <td style={{ padding: 6, textAlign: "right", fontWeight: 600 }}>{diem(c.avg)}</td>
                    <td style={{ padding: 6, textAlign: "right" }}>{diem(c.median)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Page>

      <Page footer="Phân tích chủ đề">
        <H>Tỉ lệ làm đúng theo chủ đề — {code.examCode}</H>
        <Bars rows={topicRows} />
        <H>Câu sai nhiều nhất — {code.examCode}</H>
        <MissedTable qs={code.topMissed} />
      </Page>

      {chunks.map((chunk, ci) => (
        <Page key={ci} footer={`Chi tiết học sinh (${ci + 1}/${chunks.length})`}>
          {ci === 0 && <H>Chi tiết học sinh</H>}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: BRAND, color: "#fff" }}>
                <th style={{ textAlign: "left", padding: 6 }}>Học sinh</th>
                <th style={{ textAlign: "left", padding: 6 }}>Mã đề</th>
                <th style={{ textAlign: "right", padding: 6 }}>Điểm</th>
                <th style={{ textAlign: "right", padding: 6 }}>Số câu đúng</th>
                <th style={{ textAlign: "left", padding: 6 }}>Chủ đề cần hỗ trợ</th>
              </tr>
            </thead>
            <tbody>
              {chunk.map((s, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${LINE}` }}>
                  <td style={{ padding: 6 }}>{s.name}</td>
                  <td style={{ padding: 6 }}>{s.examCode}</td>
                  <td style={{ padding: 6, textAlign: "right", fontWeight: 600 }}>{diem(s.score)}</td>
                  <td style={{ padding: 6, textAlign: "right" }}>{s.correct}</td>
                  <td style={{ padding: 6, color: MUTED }}>{s.weak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Page>
      ))}
    </>
  );
}

function StudentCyclePage({ c, idx }: { c: StudentCycle; idx: number }) {
  return (
    <Page footer={`Chặng ${idx}: ${c.label}`}>
      <CycleHead label={c.label} range={c.range} status={c.status} />

      <H>Trên lớp</H>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <Stat label="Chuyên cần" value={pct(c.lop.attendanceRate)} />
        <Stat label="Đúng quiz TB" value={pct(c.lop.quizAccuracyAvg)} />
        <Stat label="Số buổi" value={int(c.lop.sessions.length)} />
      </div>
      <NarratorLine line={c.lop.narration} />

      <H>Ở nhà</H>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <Stat label="Hoàn thành" value={pct(c.nha.completionRate)} />
        <Stat label="Đúng hạn" value={pct(c.nha.onTimeRate)} />
        <Stat label="Điểm TB" value={c.nha.avgScore == null ? "—" : diem(c.nha.avgScore)} />
      </div>
      <NarratorLine line={c.nha.narration} />

      {c.exam && (
        <>
          <H>Bài kiểm tra cuối chặng</H>
          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <Stat label="Điểm của em" value={diem(c.exam.score)} />
            <Stat label="TB lớp" value={diem(c.exam.classAvg)} />
            <Stat label="Mốc" value={c.exam.term} />
          </div>
          <NarratorLine line={c.exam.narration} />
        </>
      )}
    </Page>
  );
}

function StudentJourneyPages({ j }: { j: StudentJourney }) {
  return (
    <>
      <Page footer="Mở đầu">
        <H>Mở đầu</H>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <Stat label="Chỉ số học tập" value={`${j.overview.learningIndex.total}/100`} />
          <Stat label="Chỉ số nỗ lực" value={`${j.overview.effortIndex.total}/100`} />
          <Stat label="Hạng trong lớp" value={`${j.overview.rank}/${j.overview.classSize}`} />
        </div>
        <NarratorLine line={j.overview.narration} />

        <H>Chuẩn bị</H>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <Stat label="Xem trước" value={`${j.prep.surface.xemTruoc.count}/${j.prep.surface.xemTruoc.total}`} />
          <Stat label="Bài chuẩn bị" value={`${j.prep.surface.baiChuanBi.count}/${j.prep.surface.baiChuanBi.total}`} />
          <Stat label="Đúng giờ" value={`${j.prep.surface.dungGio.count}/${j.prep.surface.dungGio.total}`} />
        </div>
        <NarratorLine line={j.prep.narration} />
      </Page>

      {j.cycles.map((c, i) => (
        <StudentCyclePage key={c.id} c={c} idx={i + 1} />
      ))}

      <Page footer="Hội tụ">
        <H>Hội tụ</H>
        <NarratorLine line={j.convergence.narration} />
        <H>Chủ đề cần củng cố</H>
        <Bars
          rows={j.convergence.topics.map((t) => ({
            label: t.topic,
            pct: Math.round(t.accuracyAvg * 100),
            color: rate(t.accuracyAvg),
          }))}
        />
        {j.convergence.nextExam && (
          <div style={{ marginTop: 12, fontSize: 12.5, color: MUTED }}>
            Mốc tiếp theo: <b style={{ color: NAVY }}>{j.convergence.nextExam.title}</b> · {j.convergence.nextExam.date}
          </div>
        )}
      </Page>
    </>
  );
}

export function ReportDocument({ scope }: { scope: ExportScope }) {
  if (scope.kind === "lop") {
    const r = repo.getClassReport(scope.id);
    const school = repo.getSchool(r.klass.schoolId)?.name ?? "";
    return (
      <>
        <Cover title={`Lớp ${r.klass.name}`} subtitle={school} term={`${r.thi.title} · ${r.thi.term}`} ring={r.learningIndex.total} />
        <ClassPages r={r} />
      </>
    );
  }

  if (scope.kind === "hoc-sinh") {
    const j = repo.getStudentJourney(scope.id, "ca-nam", "Địa lí");
    return (
      <>
        <Cover
          title={j.student.name}
          subtitle={`${j.className} · ${j.schoolName}`}
          term={`Hành trình ${KY_LABEL["ca-nam"]} · môn ${j.slice.subject} · 2025–2026`}
          ring={j.overview.learningIndex.total}
        />
        <StudentJourneyPages j={j} />
      </>
    );
  }

  // truong / phong — bìa + 1 trang tóm tắt
  if (scope.kind === "truong") {
    const r = repo.getSchoolReport(scope.id);
    return (
      <>
        <Cover title={r.school.name} subtitle="Báo cáo toàn trường" term="Năm học 2025–2026" ring={Math.round((r.kpis.examAvg / 10) * 100)} />
        <Page footer="Tổng quan trường">
          <H>Tóm tắt</H>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Stat label="Học sinh" value={int(r.kpis.numStudents)} />
            <Stat label="Điểm thi TB" value={diem(r.kpis.examAvg)} />
            <Stat label="Trung vị" value={diem(r.kpis.examMedian)} />
            <Stat label="Hoàn thành NV" value={pct(r.kpis.completionRate)} />
            <Stat label="Cần hỗ trợ" value={pct(r.kpis.needSupportPct)} />
          </div>
          <H>Chủ đề cần chú ý toàn trường</H>
          <div style={{ fontSize: 13 }}>{r.weakTopics.filter((t) => t.confirmed).map((t) => t.topic).join(", ") || "—"}</div>
        </Page>
      </>
    );
  }

  const o = repo.getPhongOverview();
  return (
    <>
      <Cover title="Phòng GD&ĐT Sơn Tây" subtitle="Báo cáo toàn ngành" term="Năm học 2025–2026" ring={Math.round((o.kpis.examAvg / 10) * 100)} />
      <Page footer="Tổng quan Phòng">
        <H>Tóm tắt</H>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Stat label="Số trường" value={int(o.kpis.numSchools)} />
          <Stat label="Học sinh" value={int(o.kpis.numStudents)} />
          <Stat label="Điểm thi TB" value={diem(o.kpis.examAvg)} />
          <Stat label="Hoàn thành NV" value={pct(o.kpis.completionRate)} />
        </div>
        <H>Xếp hạng trường</H>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: BRAND, color: "#fff" }}>
              <th style={{ textAlign: "left", padding: 6 }}>Trường</th>
              <th style={{ textAlign: "right", padding: 6 }}>Điểm TB</th>
              <th style={{ textAlign: "right", padding: 6 }}>Hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {[...o.rows].sort((a, b) => b.examAvg - a.examAvg).map((row) => (
              <tr key={row.schoolId} style={{ borderBottom: `1px solid ${LINE}` }}>
                <td style={{ padding: 6 }}>{row.schoolName}</td>
                <td style={{ padding: 6, textAlign: "right", fontWeight: 600 }}>{diem(row.examAvg)}</td>
                <td style={{ padding: 6, textAlign: "right" }}>{pct(row.completion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>
    </>
  );
}
