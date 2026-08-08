import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Reusable small chart wrapper using Recharts with the brand color palette.
 * Pass `type="bar"` or `type="line"`.
 *
 * Props:
 *   data    — array of { date: string, value: number, [label]: string }
 *   type    — 'bar' | 'line' | 'sparkline'
 *   color   — hex (defaults to brand-500 indigo)
 *   height  — number, defaults to 180
 */
const DEFAULT_COLORS = {
  brand: "#4f46e5",
  accent: "#10b981",
  warm: "#f59e0b",
  danger: "#ef4444",
  surface: "#64748b",
};

export default function MiniBarChart({
  data = [],
  type = "bar",
  color = "brand",
  height = 180,
  yAxisFormatter = (v) => v,
  tooltipFormatter = (v) => v,
  showGrid = true,
}) {
  const stroke = DEFAULT_COLORS[color] || color;

  if (type === "sparkline" || type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          )}
          <XAxis dataKey="date" hide={type === "sparkline"} tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis hide={type === "sparkline"} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={yAxisFormatter} />
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            dot={type === "sparkline" ? false : { r: 3, fill: stroke }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        )}
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={yAxisFormatter} />
        <Tooltip
          formatter={tooltipFormatter}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
          }}
        />
        <Bar dataKey="value" fill={stroke} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}