import {
  CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { AXIS_PROPS, CHART } from "./chart-kit";

export interface EffortPoint {
  name: string;
  effort: number; // 0..100
  result: number; // 0..100
}

function Dot({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as EffortPoint;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-lg">
      <div className="font-medium">{p.name}</div>
      <div className="text-muted-foreground">Nỗ lực {p.effort} · Học tập {p.result}</div>
    </div>
  );
}

export function EffortScatter({ data, height = 300 }: { data: EffortPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 12, right: 16, left: -8, bottom: 8 }}>
        <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
        <XAxis type="number" dataKey="effort" name="Nỗ lực" domain={[0, 100]} {...AXIS_PROPS}
          label={{ value: "Nỗ lực →", position: "insideBottomRight", offset: -4, fontSize: 11, fill: CHART.axis }} />
        <YAxis type="number" dataKey="result" name="Học tập" domain={[0, 100]} {...AXIS_PROPS}
          label={{ value: "Học tập →", angle: -90, position: "insideLeft", fontSize: 11, fill: CHART.axis }} />
        <ZAxis range={[60, 60]} />
        <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke={CHART.axis} strokeDasharray="5 5" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<Dot />} />
        <Scatter data={data} fill={CHART.brand} fillOpacity={0.7} isAnimationActive />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
