import { describe, expect, test } from "vitest";
import { learningIndex, effortIndex, convergeWeakTopics } from "./indices";

describe("indices", () => {
  test("learningIndex trọng số mặc định", () => {
    const idx = learningIndex({ thi: 80, nha: 80, quizLop: 80 });
    expect(idx.total).toBe(80);
    expect(idx.parts).toHaveLength(3);
    expect(idx.partial).toBeUndefined();
  });

  test("learningIndex thiếu một mặt thì chia lại trọng số + đánh dấu partial", () => {
    const idx = learningIndex({ thi: 80, nha: 60 });
    expect(idx.total).toBe(70);
    expect(idx.partial).toBe(true);
    expect(idx.parts.every((p) => Math.abs(p.weight - 0.5) < 1e-9)).toBe(true);
  });

  test("effortIndex tính đúng", () => {
    const idx = effortIndex({ chuyenCan: 90, hoanThanh: 80, dungHan: 70 });
    expect(idx.total).toBe(83);
  });

  test("convergeWeakTopics gắn confirmed khi yếu ở >=2 mặt", () => {
    const w = convergeWeakTopics({
      lop: [{ topic: "X", numQuestions: 3, accuracy: 0.4 }],
      nha: [{ topic: "X", numQuestions: 3, accuracy: 0.5 }],
      thi: [
        { topic: "X", numQuestions: 3, accuracy: 0.8 },
        { topic: "Y", numQuestions: 2, accuracy: 0.9 },
      ],
    });
    const x = w.find((t) => t.topic === "X")!;
    expect(x.confirmed).toBe(true);
    expect(w.find((t) => t.topic === "Y")).toBeUndefined();
  });
});
