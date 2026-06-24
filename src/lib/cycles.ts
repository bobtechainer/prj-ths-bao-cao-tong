import type { EventStatus } from "@/data/types";

/** Quá khứ / hiện tại / tương lai so với "bây giờ", so theo NGÀY (bỏ giờ). */
export function statusOf(date: string, now: string): EventStatus {
  const d = date.slice(0, 10);
  const n = now.slice(0, 10);
  if (d < n) return "past";
  if (d > n) return "upcoming";
  return "current";
}

/**
 * Cắt danh sách sự kiện thành các chặng theo mốc kiểm tra.
 * Chặng k = các sự kiện có date <= boundaries[k] (và > boundaries[k-1]).
 * Trả về đúng boundaries.length chặng (>=1). Sự kiện sau mốc cuối dồn vào chặng cuối.
 */
export function partitionByCycle<T extends { date: string }>(
  events: T[],
  boundaries: string[]
): T[][] {
  const numCycles = Math.max(1, boundaries.length);
  const buckets: T[][] = Array.from({ length: numCycles }, () => []);
  const sorted = [...events].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  for (const ev of sorted) {
    let placed = false;
    for (let k = 0; k < boundaries.length; k++) {
      if (ev.date.slice(0, 10) <= boundaries[k].slice(0, 10)) {
        buckets[k].push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) buckets[numCycles - 1].push(ev);
  }
  return buckets;
}
