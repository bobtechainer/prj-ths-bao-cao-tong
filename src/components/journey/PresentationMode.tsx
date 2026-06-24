import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useReduced } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { ChapterDef } from "./types-journey";

/** Trình chiếu full-screen từng chương. Phím ‹ › chuyển, Esc thoát. Reduced-motion-aware. */
export function PresentationMode({
  chapters,
  open,
  onClose,
  initialIndex = 0,
}: {
  chapters: ChapterDef[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}) {
  const reduced = useReduced();
  const [idx, setIdx] = useState(initialIndex);

  useEffect(() => {
    if (open) setIdx(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, chapters.length - 1));
      else if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, chapters.length]);

  if (!open || chapters.length === 0) return null;
  const safeIdx = Math.max(0, Math.min(idx, chapters.length - 1));
  const ch = chapters[safeIdx];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ch.title}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground tabular-nums">
            Chương {safeIdx + 1}/{chapters.length}
          </p>
          <h2 className="truncate text-lg font-semibold tracking-tight">{ch.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Thoát trình chiếu"
          className="grid size-9 place-items-center rounded-lg border bg-card shadow-sm hover:border-brand-300 hover:text-brand-700"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className={cn("mx-auto max-w-4xl", !reduced && "animate-in fade-in")}>{ch.render()}</div>
      </div>

      <footer className="flex items-center justify-between border-t px-6 py-3">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(i - 1, 0))}
          disabled={safeIdx === 0}
          aria-label="Chương trước"
          className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
        >
          <ChevronLeft className="size-4" /> Trước
        </button>
        <div className="flex gap-1.5">
          {chapters.map((c, i) => (
            <span
              key={c.id}
              className={cn(
                "size-1.5 rounded-full",
                i === safeIdx ? "bg-brand-600" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIdx((i) => Math.min(i + 1, chapters.length - 1))}
          disabled={safeIdx === chapters.length - 1}
          aria-label="Chương sau"
          className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:border-brand-300 hover:text-brand-700 disabled:opacity-40"
        >
          Sau <ChevronRight className="size-4" />
        </button>
      </footer>
    </div>
  );
}
