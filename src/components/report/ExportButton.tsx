import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { exportReport, type ExportScope, type ExportTarget } from "@/lib/export/exportService";

export function ExportButton({ scope }: { scope: ExportScope }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportTarget | null>(null);

  const run = async (target: ExportTarget) => {
    setBusy(target);
    try {
      await exportReport(scope, target);
      setOpen(false);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="size-4" />
          Xuất báo cáo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất báo cáo</DialogTitle>
          <DialogDescription>{scope.title}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            disabled={!!busy}
            onClick={() => run("xlsx")}
            className="flex flex-col items-center gap-2 rounded-lg border p-5 text-center transition-all hover:border-success-300 hover:bg-success-50 disabled:opacity-60"
          >
            {busy === "xlsx" ? (
              <Loader2 className="size-7 animate-spin text-success" />
            ) : (
              <FileSpreadsheet className="size-7 text-success" />
            )}
            <span className="font-medium">Excel (.xlsx)</span>
            <span className="text-xs text-muted-foreground">Nhiều sheet, có biểu đồ</span>
          </button>
          <button
            disabled={!!busy}
            onClick={() => run("pdf")}
            className="flex flex-col items-center gap-2 rounded-lg border p-5 text-center transition-all hover:border-brand-300 hover:bg-brand-50 disabled:opacity-60"
          >
            {busy === "pdf" ? (
              <Loader2 className="size-7 animate-spin text-brand-600" />
            ) : (
              <FileText className="size-7 text-brand-600" />
            )}
            <span className="font-medium">PDF</span>
            <span className="text-xs text-muted-foreground">Bản in một trang</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
