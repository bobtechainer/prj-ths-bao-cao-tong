import { useParams } from "react-router-dom";
import { ReportDocument } from "@/components/report/ReportDocument";
import type { ExportScope } from "@/lib/export/exportService";

// Xem trước bản in A4 (cũng là nội dung dùng để xuất PDF).
export default function Print() {
  const { scope = "lop", id = "" } = useParams();
  const reportScope: ExportScope = { kind: scope as ExportScope["kind"], id, title: "" };
  return (
    <div className="flex min-h-dvh flex-col items-center gap-6 bg-neutral-600 py-8">
      <ReportDocument scope={reportScope} />
    </div>
  );
}
