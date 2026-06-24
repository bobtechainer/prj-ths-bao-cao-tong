import {
  Area, AreaChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { EngagementPoint } from "@/data/types";
import { AXIS_PROPS, CHART, ChartTooltip } from "./chart-kit";

export function EngagementTimeline({ data, height = 240 }: { data: EngagementPoint[]; height?: number }) {
  const avg = Math.round(data.reduce((a, p) => a + p.score, 0) / (data.length || 1));
  const markers = data.filter((p) => p.marker);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART.brand} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" tickFormatter={(t) => `${t}′`} {...AXIS_PROPS} />
        <YAxis allowDecimals={false} {...AXIS_PROPS} />
        <Tooltip content={(p) => <ChartTooltip {...p} label={`Phút ${p.label}`} unit=" lượt" />} />
        <ReferenceLine y={avg} stroke={CHART.axis} strokeDasharray="4 4" label={{ value: `TB ${avg}`, fontSize: 11, fill: CHART.axis, position: "right" }} />
        <Area type="monotone" dataKey="score" name="Lượt tương tác" stroke={CHART.brand} strokeWidth={2} fill="url(#engGrad)" isAnimationActive />
        {markers.map((m) => (
          <ReferenceDot key={m.t} x={m.t} y={m.score} r={4} fill={CHART.warning} stroke="white" label={{ value: m.marker, fontSize: 10, fill: CHART.axis, position: "top" }} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
