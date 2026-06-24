import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { StudentProfile } from "@/data/types";
import { IndexCard } from "./IndexCard";

function initials(name: string) {
  const p = name.trim().split(" ");
  return p[p.length - 1][0] ?? "?";
}

export function StudentHeader({ profile, gentle }: { profile: StudentProfile; gentle?: boolean }) {
  const Trend =
    profile.trend === "up" ? ArrowUpRight : profile.trend === "down" ? ArrowDownRight : ArrowRight;
  const trendText =
    profile.trend === "up" ? "Đang tiến bộ" : profile.trend === "down" ? "Cần theo dõi thêm" : "Giữ nhịp ổn định";
  const trendTone =
    profile.trend === "up" ? "text-success" : profile.trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-lg border bg-card p-5 shadow-sm">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-600 text-xl font-semibold text-primary-foreground">
          {initials(profile.student.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold">{profile.student.name}</h1>
          <p className="text-sm text-muted-foreground">
            {profile.className} · {profile.schoolName}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 text-sm font-medium ${trendTone}`}>
          <Trend className="size-4" />
          {trendText}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <IndexCard
          title="Chỉ số học tập"
          subtitle={gentle ? "Kết quả học tập của em" : "Từ điểm thi, bài về nhà và câu hỏi trên lớp"}
          breakdown={profile.learningIndex}
        />
        <IndexCard
          title="Chỉ số nỗ lực"
          subtitle={gentle ? "Mức chuyên cần và chăm chỉ" : "Chuyên cần, hoàn thành và nộp đúng hạn"}
          breakdown={profile.effortIndex}
        />
      </div>
    </div>
  );
}
