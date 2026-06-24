import { toast } from "sonner";

export interface ExportScope {
  kind: "phong" | "truong" | "lop" | "hoc-sinh";
  id: string;
  title: string;
}

export type ExportTarget = "xlsx" | "pdf";

// Phase 6 sẽ thay phần thân bằng ExcelJS / jsPDF thật (lazy-import).
export async function exportReport(scope: ExportScope, target: ExportTarget): Promise<void> {
  if (target === "xlsx") {
    const { exportExcel } = await import("./excel");
    await exportExcel(scope);
  } else {
    const { exportPdf } = await import("./pdf");
    await exportPdf(scope);
  }
  toast.success(`Đã xuất ${target === "xlsx" ? "Excel" : "PDF"}: ${scope.title}`);
}
