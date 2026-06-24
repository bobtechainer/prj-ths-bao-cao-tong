import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CHART, ChartTooltip } from "./chart-kit";

export interface CompletionRow {
  title: string;
  completed: number;
  notDone: number;
}

export function CompletionStacked({ data, height }: { data: CompletionRow[]; height?: number }) {
  const h = height ?? Math.max(180, data.length * 40 + 40);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke={CHART.grid} strokeDasharray="3 3" />
        <XAxis type="number" {...AXIS_PROPS} />
        <YAxis type="category" dataKey="title" width={170} {...AXIS_PROPS} />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={(p) => <ChartTooltip {...p} unit=" HS" />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="completed" stackId="a" name="Đã nộp / đã chấm" fill={CHART.success} radius={[4, 0, 0, 4]} isAnimationActive />
        <Bar dataKey="notDone" stackId="a" name="Chưa làm" fill={CHART.warning} radius={[0, 4, 4, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}
