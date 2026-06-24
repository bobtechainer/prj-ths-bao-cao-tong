import { jsPDF } from "jspdf";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import { ReportDocument } from "@/components/report/ReportDocument";
import type { ExportScope } from "./exportService";

interface PrintRoot {
  container: HTMLDivElement;
  cleanup: () => void;
}

/**
 * Dựng DOM in offscreen cho một scope: container mang id="report-root", bên trong là
 * chuỗi .report-page tĩnh của ReportDocument (hành trình dạng dài, đã bung hết chặng).
 * KHÔNG render picker Kỳ×Môn, nút Trình chiếu hay PresentationMode — đó chỉ tồn tại trên
 * màn hình tương tác, không thuộc bản in.
 */
export async function buildPrintRoot(scope: ExportScope): Promise<PrintRoot> {
  const container = document.createElement("div");
  container.id = "report-root";
  container.style.cssText = "position:fixed; left:-10000px; top:0; width:794px; background:#ffffff; z-index:-1;";
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(createElement(ReportDocument, { scope }));

  // chờ React render + font sẵn sàng
  await new Promise((r) => setTimeout(r, 450));
  try {
    await (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;
  } catch {
    /* noop */
  }

  return {
    container,
    cleanup: () => {
      root.unmount();
      container.remove();
    },
  };
}

/** Dựng tài liệu A4 thiết kế (ẩn ngoài màn), chụp từng trang → PDF nhiều trang. */
export async function exportPdf(scope: ExportScope): Promise<void> {
  const { container, cleanup } = await buildPrintRoot(scope);

  const pages = Array.from(container.querySelectorAll<HTMLElement>(".report-page"));
  const pdf = new jsPDF("p", "mm", "a4");
  for (let i = 0; i < pages.length; i++) {
    const dataUrl = await toPng(pages[i], { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297, undefined, "FAST");
  }

  cleanup();

  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  pdf.save(`BaoCao_${scope.kind}_${stamp}.pdf`);
}
