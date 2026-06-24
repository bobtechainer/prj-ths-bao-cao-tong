import { toPng } from "html-to-image";

function bg(): string {
  if (typeof window === "undefined") return "#ffffff";
  const c = getComputedStyle(document.body).backgroundColor;
  return c && c !== "rgba(0, 0, 0, 0)" ? c : "#ffffff";
}

/** Chụp một node DOM thành PNG dataURL (nét gấp đôi). */
export async function captureNode(el: HTMLElement): Promise<string> {
  return toPng(el, { pixelRatio: 2, cacheBust: true, backgroundColor: bg() });
}

/** Chụp mọi thẻ biểu đồ đang hiển thị trên màn (theo data-chart-title). */
export async function captureVisibleCharts(): Promise<{ title: string; dataUrl: string }[]> {
  if (typeof document === "undefined") return [];
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-chart-title]")).filter(
    (n) => n.getAttribute("data-chart-title") && n.offsetParent !== null
  );
  const out: { title: string; dataUrl: string }[] = [];
  for (const n of nodes) {
    try {
      const dataUrl = await toPng(n, { pixelRatio: 2, cacheBust: true, backgroundColor: bg() });
      out.push({ title: n.getAttribute("data-chart-title") || "", dataUrl });
    } catch {
      /* bỏ qua node chụp lỗi */
    }
  }
  return out;
}

export function stripDataUrl(dataUrl: string): string {
  const i = dataUrl.indexOf(",");
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
}
