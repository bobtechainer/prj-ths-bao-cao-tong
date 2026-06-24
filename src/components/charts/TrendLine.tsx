import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CHART, ChartTooltip } from "./chart-kit";

export interface TrendSeries {
  key: string;
  name: string;
  color?: string;
}

export function TrendLine({
  data,
  series,
  xKey = "term",
  domain,
  height = 240,
}: {
  data: Record<string, number | string>[];
  series: TrendSeries[];
  xKey?: string;
  domain?: [number, number];
  height?: number;
}) {
  const palette = [CHART.brand, CHART.warning, CHART.success, CHART.c4, CHART.c5];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="3 3" />
        <XAxis dataKey={xKey} {...AXIS_PROPS} />
        <YAxis domain={domain ?? ["auto", "auto"]} {...AXIS_PROPS} />
        <Tooltip content={(p) => <ChartTooltip {...p} />} />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color ?? palette[i % palette.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
