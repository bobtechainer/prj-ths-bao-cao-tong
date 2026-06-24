// PRNG có hạt giống (deterministic) — luôn ra cùng dữ liệu giữa các lần tải.

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Băm chuỗi → số nguyên, để tạo seed ổn định từ id. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class Rng {
  private r: () => number;
  constructor(seed: number | string) {
    this.r = mulberry32(typeof seed === "string" ? hashSeed(seed) : seed);
  }
  next() {
    return this.r();
  }
  range(lo: number, hi: number) {
    return lo + this.r() * (hi - lo);
  }
  int(lo: number, hi: number) {
    return Math.floor(this.range(lo, hi + 1));
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.r() * arr.length)];
  }
  /** Gần chuẩn (Irwin–Hall) quanh mean, lệch sd, kẹp trong [min,max]. */
  gauss(mean: number, sd: number, min = -Infinity, max = Infinity) {
    const g = (this.r() + this.r() + this.r() + this.r() + this.r() + this.r() - 3) / 3;
    return Math.max(min, Math.min(max, mean + g * sd * 1.4142));
  }
  bool(p = 0.5) {
    return this.r() < p;
  }
}
