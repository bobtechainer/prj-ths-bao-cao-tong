import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/uiStore";

export default function App() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("theme");
    if ((q === "dark" || q === "light") && q !== theme) toggleTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={300}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </TooltipProvider>
  );
}
