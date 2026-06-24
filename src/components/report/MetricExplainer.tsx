import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricExplain {
  purpose: string; // dùng để làm gì
  read: string; // đọc thế nào
  measure: string; // đo bằng gì
}

/** Nút "Chỉ số này là gì?" — mở giải thích humanized: dùng làm gì · đọc thế nào · đo bằng gì. */
export function MetricExplainer({ explain }: { explain: MetricExplain }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
      >
        <HelpCircle className="size-3.5" />
        Chỉ số này là gì?
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <dl className="mt-2 space-y-1.5 rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-foreground/90">
          <div><dt className="inline font-semibold">Dùng để làm gì: </dt><dd className="inline text-muted-foreground">{explain.purpose}</dd></div>
          <div><dt className="inline font-semibold">Đọc thế nào: </dt><dd className="inline text-muted-foreground">{explain.read}</dd></div>
          <div><dt className="inline font-semibold">Đo bằng gì: </dt><dd className="inline text-muted-foreground">{explain.measure}</dd></div>
        </dl>
      )}
    </div>
  );
}

export const LEARNING_EXPLAIN: MetricExplain = {
  purpose:
    "Cho biết kết quả học tập chung của em (hoặc cả lớp), gộp ba nguồn điểm vào một con số để nhìn nhanh thay vì rải rác nhiều chỗ.",
  read: "Thang 0–100: từ 80 là vững, 65–79 khá, 50–64 còn phải cố thêm, dưới 50 thì nên hỗ trợ sớm. Ba thanh bên dưới cho thấy phần nào đang kéo điểm lên hay xuống — phần thấp nhất là chỗ nên chữa trước.",
  measure: "Cân từ ba nguồn: điểm thi và bài về nhà mỗi nguồn 35%, câu hỏi trên lớp 30%; mỗi nguồn đều quy về thang 100 trước khi gộp.",
};

export const EFFORT_EXPLAIN: MetricExplain = {
  purpose:
    "Cho biết mức chăm chỉ — đi học đều, làm bài và nộp đúng hạn — để tách 'siêng' khỏi 'giỏi', không lẫn vào kết quả học tập.",
  read: "Thang 0–100. Nỗ lực cao mà kết quả thấp nghĩa là em chăm nhưng cần đổi cách ôn; nỗ lực thấp mà kết quả cao là đang học dưới sức.",
  measure: "Nặng nhất là chuyên cần — đi học đều chiếm một nửa; còn lại 30% là làm hết bài và 20% là nộp đúng hạn.",
};
