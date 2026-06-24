// Định dạng số kiểu Việt Nam: dấu thập phân là dấu phẩy, ngăn nghìn là dấu chấm.

export function num(n: number | null | undefined, frac = 2): string {
  if (n == null || Number.isNaN(n)) return "—";
  const neg = n < 0;
  const abs = Math.abs(n);
  const rounded = frac == null ? abs : Number(abs.toFixed(frac));
  const [intPart, fracPart] = String(rounded).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "-" : "") + grouped + (fracPart ? "," + fracPart : "");
}

/** Điểm số, mặc định tối đa 2 chữ số thập phân: 7.86 → "7,86", 8 → "8". */
export const diem = (n: number | null | undefined, frac = 2): string => num(n, frac);

/** Tỉ lệ 0..1 → phần trăm: 0.6364 → "63,6%". */
export const pct = (r: number | null | undefined, frac = 1): string =>
  r == null || Number.isNaN(r) ? "—" : num(r * 100, frac) + "%";

/** Số nguyên có ngăn nghìn: 1234 → "1.234". */
export const int = (n: number | null | undefined): string => num(n, 0);

/** Giây → "m:ss" hoặc "h:mm:ss". */
export function duration(sec: number | null | undefined): string {
  if (sec == null || Number.isNaN(sec)) return "—";
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`;
}
