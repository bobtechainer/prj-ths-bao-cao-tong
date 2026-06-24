import {
  Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { TopicAccuracy } from "@/data/types";
import { AXIS_PROPS, CHART, ChartTooltip, rateColor } from "./chart-kit";

/** Tỉ lệ đúng theo chủ đề; có số câu cạnh nhãn và vạch mục tiêu ma trận. */
export function TopicMatrixBars({
  topics,
  target = 70,
  height,
}: {
  topics: TopicAccuracy[];
  target?: number;
  height?: number;
}) {
  const data = [...topics]
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((t) => ({ label: `${t.topic} · ${t.numQuestions} câu`, pct: Math.round(t.accuracy * 100), rate: t.accuracy }));
  const h = height ?? Math.max(180, data.length * 36 + 24);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, left: 8, bottom: 4 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis type="category" dataKey="label" width={230} {...AXIS_PROPS} />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={(p) => <ChartTooltip {...p} unit="% đúng" />} />
        <ReferenceLine x={target} stroke={CHART.axis} strokeDasharray="4 4" label={{ value: `Mục tiêu ${target}%`, fontSize: 10, fill: CHART.axis, position: "top" }} />
        <Bar dataKey="pct" name="Tỉ lệ đúng" radius={[0, 4, 4, 0]} isAnimationActive>
          {data.map((d, i) => (
            <Cell key={i} fill={rateColor(d.rate)} />
          ))}
          <LabelList dataKey="pct" position="right" formatter={(v: any) => `${v}%`} className="fill-muted-foreground" style={{ fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
