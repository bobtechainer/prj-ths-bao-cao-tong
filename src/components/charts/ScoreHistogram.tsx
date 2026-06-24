import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistBin } from "@/data/types";
import { AXIS_PROPS, CHART, ChartTooltip } from "./chart-kit";

function binColor(bin: string): string {
  const lead = parseFloat(bin.replace(",", "."));
  if (lead < 5) return CHART.error;
  if (lead < 6.5) return CHART.warning;
  if (lead < 8) return CHART.brandSoft;
  if (lead < 9) return CHART.brand;
  return CHART.success;
}

export function ScoreHistogram({ data, height = 240 }: { data: HistBin[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 28 }}>
        <XAxis dataKey="bin" interval={0} angle={-45} textAnchor="end" height={48} {...AXIS_PROPS} />
        <YAxis allowDecimals={false} {...AXIS_PROPS} />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={(p) => <ChartTooltip {...p} unit=" HS" />} />
        <Bar dataKey="count" name="Số HS" radius={[3, 3, 0, 0]} isAnimationActive>
          {data.map((d, i) => (
            <Cell key={i} fill={binColor(d.bin)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
