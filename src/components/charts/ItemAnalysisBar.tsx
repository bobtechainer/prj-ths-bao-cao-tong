import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, ChartTooltip, rateColor } from "./chart-kit";

export interface ItemRow {
  label: string;
  rate: number; // 0..1 (tỉ lệ đúng)
}

/** Bar ngang, khó nhất (tỉ lệ đúng thấp) lên đầu. */
export function ItemAnalysisBar({ items, height }: { items: ItemRow[]; height?: number }) {
  const data = [...items].sort((a, b) => a.rate - b.rate).map((d) => ({ ...d, pct: Math.round(d.rate * 100) }));
  const h = height ?? Math.max(160, data.length * 34 + 24);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis type="category" dataKey="label" width={180} {...AXIS_PROPS} />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={(p) => <ChartTooltip {...p} unit="% đúng" />} />
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
