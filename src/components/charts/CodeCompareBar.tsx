import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CHART, ChartTooltip } from "./chart-kit";

export interface CodeCompareRow {
  examCode: string;
  avg: number;
  median: number;
  numStudents: number;
}

export function CodeCompareBar({ data, height = 240 }: { data: CodeCompareRow[]; height?: number }) {
  const rows = data.map((d) => ({ ...d, name: `${d.examCode} (${d.numStudents} HS)` }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 4 }} barGap={6}>
        <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="3 3" />
        <XAxis dataKey="name" {...AXIS_PROPS} />
        <YAxis domain={[0, 10]} {...AXIS_PROPS} />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={(p) => <ChartTooltip {...p} unit=" điểm" />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="avg" name="Điểm trung bình" fill={CHART.brand} radius={[4, 4, 0, 0]} isAnimationActive />
        <Bar dataKey="median" name="Trung vị" fill={CHART.warning} radius={[4, 4, 0, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}
