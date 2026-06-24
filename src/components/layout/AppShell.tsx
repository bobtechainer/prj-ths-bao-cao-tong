import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { PageNav } from "./PageNav";
import { PageTransition } from "@/components/motion";
import { useUiStore } from "@/stores/uiStore";

export function AppShell() {
  const account = useUiStore((s) => s.account);
  const selectAccount = useUiStore((s) => s.selectAccount);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (account) return;
    const as = searchParams.get("as");
    if (as) selectAccount(as);
    else navigate("/", { replace: true });
  }, [account, navigate, searchParams, selectAccount]);

  // đóng drawer + cuộn lên đầu khi đổi trang/đổi tab
  useEffect(() => {
    setMobileOpen(false);
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname, location.search]);

  if (!account) return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div id="report-root" className="mx-auto max-w-[1280px] px-4 py-6 md:px-8">
            <PageNav />
            <PageTransition k={location.pathname + location.search}>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
