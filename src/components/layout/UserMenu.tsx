import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useUiStore } from "@/stores/uiStore";
import { ROLE_LABEL } from "@/lib/nav";

function initials(name: string) {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1][0] ?? "?";
}

export function UserMenu() {
  const account = useUiStore((s) => s.account);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const logout = useUiStore((s) => s.logout);
  const navigate = useNavigate();
  if (!account) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted outline-none">
        <span className="grid size-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-primary-foreground">
          {initials(account.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight">{account.name}</span>
          <span className="block text-xs text-muted-foreground leading-tight">{ROLE_LABEL[account.role]}</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="font-medium">{account.name}</div>
          <div className="text-xs font-normal text-muted-foreground">{account.org}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div
          className="flex items-center justify-between px-2 py-1.5 text-sm"
          onClick={(e) => e.preventDefault()}
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            Giao diện tối
          </span>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout();
            navigate("/", { replace: true });
          }}
        >
          <LogOut className="size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
