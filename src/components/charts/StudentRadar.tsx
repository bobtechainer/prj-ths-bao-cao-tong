import {
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip,
} from "recharts";
import { CHART, ChartTooltip } from "./chart-kit";

export function StudentRadar({
  data,
  height = 260,
}: {
  data: { axis: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <PolarGrid stroke={CHART.grid} />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: CHART.axis }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip content={(p) => <ChartTooltip {...p} />} />
        <Radar name="Điểm" dataKey="value" stroke={CHART.brand} fill={CHART.brand} fillOpacity={0.3} isAnimationActive />
      </RadarChart>
    </ResponsiveContainer>
  );
}
