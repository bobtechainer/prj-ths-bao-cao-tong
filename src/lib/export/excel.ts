import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { mockRepository as repo } from "@/data/mockRepository";
import type { ClassReport, ExamReport, PhongOverview, SchoolReport, StudentProfile } from "@/data/types";
import type { ExportScope } from "./exportService";
import { captureVisibleCharts, stripDataUrl } from "./chartImage";

const BRAND = "FF237BD3";
const WHITE = "FFFFFFFF";
const THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFE5E7EB" } },
  left: { style: "thin", color: { argb: "FFE5E7EB" } },
  bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
  right: { style: "thin", color: { argb: "FFE5E7EB" } },
};

type Ws = ExcelJS.Worksheet;

function titleRow(ws: Ws, text: string, span: number, size = 14) {
  const r = ws.addRow([text]);
  ws.mergeCells(r.number, 1, r.number, span);
  const c = ws.getCell(r.number, 1);
  c.font = { bold: true, size, color: { argb: "FF041F4A" } };
  return r;
}
function subRow(ws: Ws, text: string, span: number) {
  const r = ws.addRow([text]);
  ws.mergeCells(r.number, 1, r.number, span);
  ws.getCell(r.number, 1).font = { italic: true, color: { argb: "FF666666" } };
  return r;
}
function table(
  ws: Ws,
  headers: string[],
  rows: (string | number)[][],
  opts?: { pct?: number[]; num?: number[] }
) {
  const hr = ws.addRow(headers);
  hr.eachCell((c) => {
    c.font = { bold: true, color: { argb: WHITE } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
    c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    c.border = THIN;
  });
  for (const r of rows) {
    const row = ws.addRow(r);
    row.eachCell((c, col) => {
      c.border = THIN;
      c.alignment = { vertical: "middle", wrapText: true };
      if (opts?.pct?.includes(col)) c.numFmt = "0.0%";
      if (opts?.num?.includes(col)) c.numFmt = "0.00";
    });
  }
  return hr.number;
}
function widths(ws: Ws, w: number[]) {
  w.forEach((x, i) => (ws.getColumn(i + 1).width = x));
}
function gap(ws: Ws) {
  ws.addRow([]);
}

function examSheets(wb: ExcelJS.Workbook, thi: ExamReport, schoolName: string) {
  // ---- TỔNG HỢP ----
  const ws = wb.addWorksheet("TỔNG HỢP");
  widths(ws, [22, 16, 14, 14]);
  titleRow(ws, `BÁO CÁO KẾT QUẢ ${thi.title.toUpperCase()}`, 4);
  subRow(ws, `${schoolName} · ${thi.term} · toàn đợt`, 4);
  gap(ws);
  table(ws, ["Chỉ số", "Giá trị"], [
    ["Tổng số học sinh", thi.numStudents],
    ["Điểm trung bình", thi.avg],
    ["Điểm trung vị", thi.median],
  ], { num: [2] });
  gap(ws);
  table(
    ws,
    ["Nhóm điểm", "Số học sinh", "Tỉ lệ"],
    thi.bands.map((b) => [b.label, b.count, b.ratio]),
    { pct: [3] }
  );
  gap(ws);
  if (thi.codes.length > 1) {
    table(
      ws,
      ["Mã đề", "Số HS", "Điểm TB", "Trung vị"],
      thi.codes.map((c) => [c.examCode, c.numStudents, c.avg, c.median]),
      { num: [3, 4] }
    );
    gap(ws);
  }
  table(ws, ["Khoảng điểm", "Số HS"], thi.histogram.map((h) => [h.bin, h.count]));

  // ---- Mỗi mã đề ----
  for (const code of thi.codes) {
    const cs = wb.addWorksheet(code.examCode.slice(0, 28));
    widths(cs, [40, 26, 26, 12]);
    titleRow(cs, `BÁO CÁO CHI TIẾT — ${code.examCode}`, 4);
    subRow(cs, `${schoolName} · ${thi.title} · bản dành cho giáo viên`, 4);
    gap(cs);
    table(cs, ["Chỉ số", "Giá trị"], [
      ["Số học sinh", code.numStudents],
      ["Điểm trung bình", code.avg],
      ["Điểm trung vị", code.median],
    ], { num: [2] });
    gap(cs);
    titleRow(cs, "NHẬN ĐỊNH NHANH", 4, 11);
    for (const line of code.insights) subRow(cs, line, 4);
    gap(cs);
    table(
      cs,
      ["Chủ đề", "Số câu", "Tỉ lệ đúng"],
      code.topics.map((t) => [t.topic, t.numQuestions, t.accuracy]),
      { pct: [3] }
    );
    gap(cs);
    table(
      cs,
      ["Câu sai nhiều", "Đáp án đúng", "Lựa chọn sai phổ biến", "Tỉ lệ sai"],
      code.topMissed.map((q) => [q.content, q.correctAnswer, q.commonWrong, q.errorRate]),
      { pct: [4] }
    );
  }

  // ---- Chi tiết học sinh ----
  const ds = wb.addWorksheet("Chi tiết học sinh");
  widths(ds, [24, 16, 10, 14, 34, 34]);
  titleRow(ds, "CHI TIẾT HỌC SINH THEO TỪNG MÃ ĐỀ", 6);
  gap(ds);
  const hr = table(
    ds,
    ["Học sinh", "Mã đề", "Điểm", "Số câu đúng", "Chủ đề làm tốt", "Chủ đề cần hỗ trợ"],
    thi.studentDetail.map((s) => [s.name, s.examCode, s.score, s.correct, s.strong, s.weak]),
    { num: [3] }
  );
  ds.views = [{ state: "frozen", ySplit: hr }];
}

async function chartsSheet(wb: ExcelJS.Workbook) {
  const charts = await captureVisibleCharts();
  if (!charts.length) return;
  const ws = wb.addWorksheet("Biểu đồ");
  widths(ws, [60]);
  let row = 1;
  for (const ch of charts) {
    ws.getCell(row, 1).value = ch.title;
    ws.getCell(row, 1).font = { bold: true, size: 12, color: { argb: "FF041F4A" } };
    row += 1;
    const id = wb.addImage({ base64: stripDataUrl(ch.dataUrl), extension: "png" });
    ws.addImage(id, { tl: { col: 0, row }, ext: { width: 560, height: 300 } });
    row += 17;
  }
}

function classSheets(wb: ExcelJS.Workbook, r: ClassReport, schoolName: string) {
  const ws = wb.addWorksheet("Tổng hợp lớp");
  widths(ws, [28, 14, 12, 12]);
  titleRow(ws, `BÁO CÁO TỔNG HỢP LỚP ${r.klass.name.toUpperCase()}`, 4);
  subRow(ws, `${schoolName} · GV chủ nhiệm ${r.klass.homeroomTeacher}`, 4);
  gap(ws);
  table(ws, ["Chỉ số", "Giá trị / 100"], [
    ["Chỉ số Học tập", r.learningIndex.total],
    ...r.learningIndex.parts.map((p) => [`  • ${p.label}`, p.value] as [string, number]),
    ["Chỉ số Nỗ lực", r.effortIndex.total],
    ...r.effortIndex.parts.map((p) => [`  • ${p.label}`, p.value] as [string, number]),
  ]);
  gap(ws);
  table(
    ws,
    ["Chủ đề cần chú ý", "Lớp", "Nhà", "Thi", "Đúng TB"],
    r.weakTopics.map((t) => [
      t.topic,
      t.surfaces.lop ? "yếu" : "ổn",
      t.surfaces.nha ? "yếu" : "ổn",
      t.surfaces.thi ? "yếu" : "ổn",
      t.accuracyAvg,
    ]),
    { pct: [5] }
  );

  const rs = wb.addWorksheet("Danh sách học sinh");
  widths(rs, [24, 12, 12, 12, 12, 14]);
  const hr = table(
    rs,
    ["Học sinh", "Học tập", "Nỗ lực", "Điểm thi", "Điểm nhà", "Cần hỗ trợ"],
    r.roster.map((x) => [x.name, x.learning, x.effort, x.exam, x.home, x.needSupport ? "Có" : ""]),
    { num: [4, 5] }
  );
  rs.views = [{ state: "frozen", ySplit: hr }];

  const ns = wb.addWorksheet("Học tại nhà");
  widths(ns, [30, 12, 12, 12, 12]);
  table(
    ns,
    ["Nhiệm vụ", "Hoàn thành", "Điểm TB", "Thấp nhất", "Cao nhất"],
    r.nha.missions.map((m) => [m.title, m.completionRate, m.avgScore, m.minScore, m.maxScore]),
    { pct: [2], num: [3, 4, 5] }
  );
}

export async function exportExcel(scope: ExportScope): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Trường học số · Insight";
  let fileBase = "BaoCao";

  if (scope.kind === "lop") {
    const r = repo.getClassReport(scope.id);
    const school = repo.getSchool(repo.getClass(scope.id)?.schoolId ?? "")?.name ?? "";
    classSheets(wb, r, school);
    examSheets(wb, r.thi, school);
    fileBase = `BaoCao_Lop_${r.klass.name.replace(/\s/g, "")}`;
  } else if (scope.kind === "truong") {
    const r: SchoolReport = repo.getSchoolReport(scope.id);
    const ws = wb.addWorksheet("Tổng quan trường");
    widths(ws, [28, 16]);
    titleRow(ws, `BÁO CÁO TRƯỜNG ${r.school.name.toUpperCase()}`, 2);
    gap(ws);
    table(ws, ["Chỉ số", "Giá trị"], [
      ["Số học sinh", r.kpis.numStudents],
      ["Chuyên cần", r.kpis.attendanceRate],
      ["Hoàn thành nhiệm vụ", r.kpis.completionRate],
      ["Điểm thi TB", r.kpis.examAvg],
      ["Điểm trung vị", r.kpis.examMedian],
      ["Tỉ lệ cần hỗ trợ", r.kpis.needSupportPct],
    ]);
    const cs = wb.addWorksheet("Các lớp");
    widths(cs, [16, ...r.classBySubject.length ? Array(8).fill(10) : []]);
    const subs = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí"];
    table(
      cs,
      ["Lớp", ...subs],
      r.classBySubject.map((c) => [c.className, ...subs.map((s) => (c.scores as Record<string, number>)[s] ?? 0)]),
      { num: subs.map((_, i) => i + 2) }
    );
    fileBase = `BaoCao_Truong_${r.school.shortName.replace(/\s/g, "")}`;
  } else if (scope.kind === "phong") {
    const o: PhongOverview = repo.getPhongOverview();
    const ws = wb.addWorksheet("Tổng quan Phòng");
    widths(ws, [30, 12, 12, 14, 14]);
    titleRow(ws, "BÁO CÁO TỔNG QUAN PHÒNG GD&ĐT SƠN TÂY", 5);
    gap(ws);
    table(
      ws,
      ["Trường", "Điểm TB", "Trung vị", "Hoàn thành", "Cần hỗ trợ"],
      o.rows.map((r) => [r.schoolName, r.examAvg, r.median, r.completion, r.needSupportPct]),
      { num: [2, 3], pct: [4, 5] }
    );
    fileBase = "BaoCao_Phong_SonTay";
  } else {
    const p: StudentProfile = repo.getStudentProfile(scope.id);
    const ws = wb.addWorksheet("Hồ sơ học sinh");
    widths(ws, [28, 16]);
    titleRow(ws, `HỒ SƠ HỌC SINH — ${p.student.name.toUpperCase()}`, 2);
    subRow(ws, `${p.className} · ${p.schoolName}`, 2);
    gap(ws);
    table(ws, ["Chỉ số", "Giá trị / 100"], [
      ["Chỉ số Học tập", p.learningIndex.total],
      ["Chỉ số Nỗ lực", p.effortIndex.total],
    ]);
    gap(ws);
    table(
      ws,
      ["Chủ đề cần hỗ trợ", "Đúng TB"],
      p.weakTopics.map((t) => [t.topic, t.accuracyAvg]),
      { pct: [2] }
    );
    fileBase = `BaoCao_HS_${p.student.name.split(" ").pop()}`;
  }

  await chartsSheet(wb);

  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${fileBase}_${stamp}.xlsx`);
}
