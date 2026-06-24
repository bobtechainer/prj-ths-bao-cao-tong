import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AttendanceBreakdown } from "@/data/types";
import { CHART, ChartTooltip } from "./chart-kit";

export function AttendanceDonut({ data, height = 220 }: { data: AttendanceBreakdown; height?: number }) {
  const total = data.present + data.absent;
  const rate = total ? Math.round((data.present / total) * 100) : 0;
  const slices = [
    { name: "Có mặt", value: data.present - data.late - data.leftEarly, color: CHART.success },
    { name: "Đi muộn", value: data.late, color: CHART.warning },
    { name: "Về sớm", value: data.leftEarly, color: CHART.brandSoft },
    { name: "Vắng", value: data.absent, color: CHART.error },
  ].filter((s) => s.value > 0);

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive
          >
            {slices.map((s, i) => (
              <Cell key={i} fill={s.color} />
            ))}
          </Pie>
          <Tooltip content={(p) => <ChartTooltip {...p} unit=" HS" />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-foreground">{rate}%</div>
          <div className="text-xs text-muted-foreground">có mặt</div>
        </div>
      </div>
    </div>
  );
}
