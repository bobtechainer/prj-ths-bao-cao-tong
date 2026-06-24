import type { BandRow, HistBin } from "@/data/types";
import { num } from "./format";

export function mean(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

/** Chuẩn hoá điểm về 0..100 theo thang (10 hoặc 100). */
export function normalize(value: number, scale: 10 | 100): number {
  return (value / scale) * 100;
}

const VN_BANDS_10: { label: string; lo: number; hi: number }[] = [
  { label: "Dưới 5", lo: -Infinity, hi: 5 },
  { label: "5 – 6.49", lo: 5, hi: 6.5 },
  { label: "6.5 – 7.99", lo: 6.5, hi: 8 },
  { label: "8 – 8.99", lo: 8, hi: 9 },
  { label: "9 trở lên", lo: 9, hi: Infinity },
];

/** Phân nhóm điểm theo dải chuẩn Việt Nam (thang 10). scale 100 sẽ quy về 10. */
export function toBands(scores: number[], scale: 10 | 100 = 10): BandRow[] {
  const xs = scale === 100 ? scores.map((s) => s / 10) : scores;
  const total = xs.length || 1;
  return VN_BANDS_10.map((b) => {
    const count = xs.filter((s) => s >= b.lo && s < b.hi).length;
    return { label: b.label, count, ratio: count / total };
  });
}

/** Histogram bins đều theo step (vd 0.5) trên [0, max]. Nhãn kiểu "0 – 0,49". */
export function histogram(scores: number[], step = 0.5, max = 10): HistBin[] {
  const n = Math.round(max / step);
  const bins: HistBin[] = [];
  for (let i = 0; i < n; i++) {
    const lo = i * step;
    const isLast = i === n - 1;
    const hi = isLast ? max : lo + step - 0.01;
    bins.push({ bin: `${num(lo, 2)} – ${num(hi, 2)}`, count: 0 });
  }
  for (const s of scores) {
    const idx = Math.min(n - 1, Math.max(0, Math.floor(s / step)));
    bins[idx].count++;
  }
  return bins;
}
