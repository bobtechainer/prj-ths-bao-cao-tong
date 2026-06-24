import type { IndexBreakdown, TopicAccuracy, WeakTopic } from "@/data/types";

export const DEFAULT_LEARNING_WEIGHTS = { thi: 0.35, nha: 0.35, quizLop: 0.3 };
export const DEFAULT_EFFORT_WEIGHTS = { chuyenCan: 0.5, hoanThanh: 0.3, dungHan: 0.2 };

const LEARNING_LABELS: Record<string, string> = {
  thi: "Bài thi",
  nha: "Bài về nhà",
  quizLop: "Trên lớp",
};
const EFFORT_LABELS: Record<string, string> = {
  chuyenCan: "Chuyên cần",
  hoanThanh: "Hoàn thành",
  dungHan: "Đúng hạn",
};

function buildIndex(
  parts: Record<string, number | undefined>,
  weights: Record<string, number>,
  labels: Record<string, string>
): IndexBreakdown {
  const present = Object.keys(weights).filter((k) => parts[k] != null);
  const sumW = present.reduce((a, k) => a + weights[k], 0) || 1;
  const partList = present.map((k) => ({
    label: labels[k] ?? k,
    value: Math.round(parts[k] as number),
    weight: weights[k] / sumW,
  }));
  const total = partList.reduce((a, p) => a + p.value * p.weight, 0);
  return {
    total: Math.round(total),
    parts: partList,
    partial: present.length < Object.keys(weights).length || undefined,
  };
}

/** Chỉ số Học tập (chỉ từ điểm). value mỗi phần đã chuẩn hoá 0..100. */
export function learningIndex(
  parts: { thi?: number; nha?: number; quizLop?: number },
  weights = DEFAULT_LEARNING_WEIGHTS
): IndexBreakdown {
  return buildIndex(parts, weights, LEARNING_LABELS);
}

/** Chỉ số Nỗ lực (hành vi). value mỗi phần 0..100. */
export function effortIndex(
  parts: { chuyenCan: number; hoanThanh: number; dungHan: number },
  weights = DEFAULT_EFFORT_WEIGHTS
): IndexBreakdown {
  return buildIndex(parts, weights, EFFORT_LABELS);
}

/** Hội tụ chủ đề yếu: yếu (đúng < threshold) ở >= 2 mặt → confirmed. */
export function convergeWeakTopics(
  perSurface: { lop: TopicAccuracy[]; nha: TopicAccuracy[]; thi: TopicAccuracy[] },
  threshold = 0.6
): WeakTopic[] {
  const byTopic = new Map<string, { lop?: number; nha?: number; thi?: number }>();
  const add = (arr: TopicAccuracy[], key: "lop" | "nha" | "thi") => {
    for (const t of arr) {
      const e = byTopic.get(t.topic) ?? {};
      e[key] = t.accuracy;
      byTopic.set(t.topic, e);
    }
  };
  add(perSurface.lop, "lop");
  add(perSurface.nha, "nha");
  add(perSurface.thi, "thi");

  const out: WeakTopic[] = [];
  for (const [topic, acc] of byTopic) {
    const surfaces = {
      lop: acc.lop != null && acc.lop < threshold,
      nha: acc.nha != null && acc.nha < threshold,
      thi: acc.thi != null && acc.thi < threshold,
    };
    const weakCount = Number(surfaces.lop) + Number(surfaces.nha) + Number(surfaces.thi);
    const vals = [acc.lop, acc.nha, acc.thi].filter((v): v is number => v != null);
    out.push({
      topic,
      surfaces,
      confirmed: weakCount >= 2,
      accuracyAvg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
    });
  }
  return out
    .filter((w) => w.surfaces.lop || w.surfaces.nha || w.surfaces.thi)
    .sort((a, b) => Number(b.confirmed) - Number(a.confirmed) || a.accuracyAvg - b.accuracyAvg);
}
