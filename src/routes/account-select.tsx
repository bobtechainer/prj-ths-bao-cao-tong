import { useNavigate } from "react-router-dom";
import { mockRepository as repo } from "@/data/mockRepository";
import { useUiStore } from "@/stores/uiStore";
import { ROLE_LABEL, roleHome } from "@/lib/nav";
import { AnimatedGradient, Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { Account, Role } from "@/data/types";

// Tô avatar theo vai trò (cùng hệ màu với RoleBadge) để nhận ra tài khoản nhanh.
const AVATAR_TONE: Record<Role, string> = {
  phong: "bg-brand-50 text-brand-700",
  truong: "bg-warning-50 text-warning-700",
  giaovien: "bg-success-50 text-success-700",
  hocsinh: "bg-blue-light-50 text-blue-light-700",
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 13) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function initials(name: string) {
  const p = name.trim().split(" ");
  return p[p.length - 1][0] ?? "?";
}

function fmtLast(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} · ${String(
    d.getHours()
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AccountSelect() {
  const navigate = useNavigate();
  const selectAccount = useUiStore((s) => s.selectAccount);
  const accounts = repo.getAccounts();

  const enter = (acc: Account) => {
    selectAccount(acc.id);
    navigate(roleHome(acc));
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10">
      <AnimatedGradient />
      <div className="relative w-full max-w-3xl">
        <div className="mb-8 text-center">
          <img src="/logomark.svg" alt="Trường học số" className="mb-4 inline-block size-16 drop-shadow-sm" />
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Trường học số</h1>
          <p className="mt-1 text-muted-foreground">{greeting()}. Chọn tài khoản để tiếp tục.</p>
        </div>

        <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2" gap={0.08}>
          {accounts.map((acc) => (
            <StaggerItem key={acc.id}>
              <button
                onClick={() => enter(acc)}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
              >
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-full text-lg font-semibold transition-colors group-hover:bg-brand-600 group-hover:text-primary-foreground",
                    AVATAR_TONE[acc.role]
                  )}
                >
                  {initials(acc.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{acc.name}</span>
                  <span className="block truncate text-sm text-brand-700">{ROLE_LABEL[acc.role]}</span>
                  <span className="block truncate text-xs text-muted-foreground">{acc.org}</span>
                </span>
                <span className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                  Vào lần trước
                  <br />
                  <span className="font-medium tabular-nums">{fmtLast(acc.lastLogin)}</span>
                </span>
              </button>
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Báo cáo kết quả học tập · Trường học số
        </p>
      </div>
    </div>
  );
}
