import { describe, expect, test } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const SRC = resolve(__dirname, "../..");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

describe("dọn dẹp", () => {
  test("DistractorBar.tsx đã bị gỡ", () => {
    expect(existsSync(join(SRC, "components/charts/DistractorBar.tsx"))).toBe(false);
  });

  test("không còn tham chiếu DistractorBar", () => {
    const hits = walk(SRC).filter((f) => {
      if (/no-orphans\.test\.ts$/.test(f)) return false; // tự loại trừ file test này
      return readFileSync(f, "utf8").includes("DistractorBar");
    });
    expect(hits).toEqual([]);
  });

  test("không có import Confetti thừa (mỗi file import Confetti phải có dùng <Confetti)", () => {
    const offenders = walk(SRC).filter((f) => {
      if (f.endsWith(join("components", "motion", "index.tsx"))) return false; // nơi định nghĩa
      const src = readFileSync(f, "utf8");
      const imported = /\bConfetti\b/.test(src) && /import[^;]*\bConfetti\b[^;]*from/.test(src);
      if (!imported) return false;
      return !/<Confetti\b/.test(src); // import nhưng không render
    });
    expect(offenders).toEqual([]);
  });

  test("không còn chữ demo / minh hoạ trong src", () => {
    const offenders = walk(SRC).filter((f) => {
      // Chỉ quét mã sản phẩm: bỏ qua mọi file test/spec (chúng tham chiếu chữ cấm để kiểm tra sự vắng mặt).
      if (/\.test\.tsx?$/.test(f) || /[\\/]__tests__[\\/]/.test(f)) return false;
      return /\bdemo\b|minh\s*ho[aạ]/i.test(readFileSync(f, "utf8"));
    });
    expect(offenders).toEqual([]);
  });
});
