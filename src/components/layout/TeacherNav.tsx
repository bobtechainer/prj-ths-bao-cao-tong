import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen } from "lucide-react";
import { mockRepository as repo } from "@/data/mockRepository";
import { buildClassTree } from "@/lib/teacherTree";
import { cn } from "@/lib/utils";

/** Cây lớp của giáo viên: nhóm Chủ nhiệm / Bộ môn·{môn}, leaf là lớp. */
export function TeacherNav({ teacherId, onNavigate }: { teacherId: string; onNavigate?: () => void }) {
  const location = useLocation();
  const tree = buildClassTree(repo.getTeacherProfile(teacherId));
  const here = location.pathname + location.search;

  return (
    <div className="space-y-3">
      {tree.map((group) => (
        <div key={group.key}>
          <div className="px-3 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {group.label}
          </div>
          <div className="space-y-0.5">
            {group.leaves.map((leaf) => {
              const Icon = leaf.role === "chu-nhiem" ? Home : BookOpen;
              const active = here.startsWith(leaf.to) || here === leaf.to;
              return (
                <NavLink
                  key={leaf.role + leaf.classId + (leaf.subject ?? "")}
                  to={leaf.to}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                    active ? "bg-brand-50 font-medium text-brand-700" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{leaf.className}</span>
                  {leaf.alsoTeachesSubject && (
                    <span className="ml-auto text-[10px] text-muted-foreground">+{leaf.alsoTeachesSubject}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
