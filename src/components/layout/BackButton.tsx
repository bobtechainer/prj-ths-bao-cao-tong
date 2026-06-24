import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export function BackButton({ label = "Quay lại" }: { label?: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-1 rounded-md border bg-card px-2.5 py-1.5 text-sm font-medium shadow-sm transition-colors hover:border-brand-300 hover:text-brand-700"
    >
      <ChevronLeft className="size-4" />
      {label}
    </button>
  );
}
