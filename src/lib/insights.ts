import type { ExamCodeReport } from "@/data/types";
import { diem, pct } from "./format";

// NHẬN ĐỊNH NHANH theo luật cố định — giọng giáo viên (humanized).
// Mỗi câu: nêu sự việc → khả năng trên lớp → một việc nên làm.
// Không câu nào cũng "Cần"; không phán xét học sinh.

export function examInsights(code: ExamCodeReport, label = "đề này"): string[] {
  const out: string[] = [];

  out.push(`Điểm trung bình ${label} là ${diem(code.avg)} (trên ${code.numStudents} bài).`);

  const hard = code.topMissed.filter((q) => q.correctRate < 0.7).length;
  if (hard > 0) {
    out.push(
      `Có ${hard} câu các em còn làm sai nhiều (đúng dưới 70%), nên chữa kỹ mấy câu này trước.`
    );
  }

  const weakTopics = code.topics.filter((t) => t.accuracy < 0.5);
  for (const t of weakTopics.slice(0, 2)) {
    out.push(
      `Chủ đề ${t.topic} cả lớp mới đúng khoảng ${pct(t.accuracy)} — còn yếu. Buổi ôn tới giáo viên có thể cho làm lại vài câu dạng này để các em quen tay.`
    );
  }

  const hasRepeatedWrong = code.topMissed.some((q) => q.errorRate >= 0.4 && q.commonWrong);
  if (hasRepeatedWrong) {
    out.push(
      `Một số câu có nhiều em cùng chọn sai một đáp án — có thể các em đang hiểu nhầm giống nhau, nên giải thích lại chỗ đó.`
    );
  }

  const midBand = code.bands.find((b) => b.label.startsWith("5"));
  if (midBand && midBand.count > 0) {
    out.push(
      `Có ${midBand.count} em đang ở nhóm 5–6,49 điểm — vừa đủ qua, nên để ý kèm thêm để các em không tụt lại.`
    );
  }

  return out;
}
