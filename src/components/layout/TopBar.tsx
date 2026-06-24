import { Bell, Menu } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenu } from "./UserMenu";

const NOTES = [
  "Lớp 12 Văn vừa có kết quả thi thử Địa lí học kì 1.",
  "Lớp 12 Toán còn 3 bài chưa chấm, thầy cô tranh thủ chấm để trả kịp cho học sinh.",
  "Tuần này cả trường nộp được 1.056/1.200 lượt bài về nhà, tức 88%.",
];

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-card/85 px-4 backdrop-blur md:px-6">
      <button
        onClick={onMenu}
        aria-label="Mở điều hướng"
        className="grid size-9 shrink-0 place-items-center rounded-md hover:bg-muted md:hidden"
      >
        <Menu className="size-5" />
      </button>
      <span className="font-semibold md:hidden">Trường học số</span>
      <div className="min-w-0 flex-1" />

      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Thông báo (${NOTES.length} mục)`}
            className="relative grid size-9 place-items-center rounded-md outline-none hover:bg-muted"
          >
            <Bell className="size-5 text-muted-foreground" />
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-warning-500 px-1 text-[10px] font-semibold leading-4 text-white tabular-nums">
              {NOTES.length}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 space-y-1 overflow-auto p-1">
              {NOTES.map((n, i) => (
                <div key={i} className="rounded-md p-2 text-sm hover:bg-muted">
                  {n}
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserMenu />
      </div>
    </header>
  );
}
