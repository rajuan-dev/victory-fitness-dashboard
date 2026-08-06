import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const TIER_COLORS = {
  NONE: "#94a3b8",
  SILVER: "#cbd5e1",
  GOLD: "#fbbf24",
  PLATINUM: "#818cf8",
  INNER_CIRCLE: "#34d399",
};

export default function DonutTierChart({ data = [], height = 240 }) {
  const items = (data || []).map((d) => ({
    name: d.tier || "NONE",
    value: Number(d.amount || 0),
    color: TIER_COLORS[d.tier] || d.color || "#94a3b8",
  }));
  const total = items.reduce((acc, x) => acc + x.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-xl border border-dashed border-surface-200 bg-surface-50 text-sm text-surface-500">
        No revenue yet in this period
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={items}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            stroke="#ffffff"
            strokeWidth={2}
          >
            {items.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(Number(value))
            }
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="flex flex-col justify-center gap-2">
        {items.map((item) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          return (
            <li key={item.name} className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: item.color }}
                aria-hidden
              />
              <span className="flex-1 text-sm font-medium text-surface-700">
                {item.name}
              </span>
              <span className="text-xs font-semibold text-surface-500 tabular-nums">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}