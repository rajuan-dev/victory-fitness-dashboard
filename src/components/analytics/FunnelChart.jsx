import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * 6-step trial funnel using Recharts BarChart with graduated widths.
 * Drop-off rendered as a sub-bar (lighter) so each step shows
 * how many users proceeded vs how many dropped off.
 */
const FUNNEL_COLORS = [
  "#312e81",
  "#4338ca",
  "#4f46e5",
  "#6366f1",
  "#818cf8",
  "#a5b4fc",
];

export default function FunnelChart({ steps = [] }) {
  if (!steps.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-surface-200 bg-surface-50 text-sm text-surface-500">
        Funnel data will appear once users begin the trial flow.
      </div>
    );
  }

  const data = steps.map((s, i) => ({
    step: s.label.length > 14 ? `${s.label.slice(0, 12)}…` : s.label,
    full: s.label,
    reached: s.count,
    dropped: Math.max(0, (steps[i - 1]?.count ?? s.count) - s.count),
    dropPct: s.dropOffPct,
    color: FUNNEL_COLORS[Math.min(i, FUNNEL_COLORS.length - 1)],
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="step"
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={110}
          />
          <Tooltip
            formatter={(value, _name, ctx) => [
              `${value.toLocaleString()} (${ctx.payload.full})`,
              "Reached",
            ]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          />
          <Bar dataKey="reached" radius={[0, 6, 6, 0]} stackId="funnel">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={`rounded-lg border p-2 text-center ${
              s.dropOffPct > 30
                ? "border-danger-200 bg-danger-50"
                : s.dropOffPct > 15
                ? "border-warm-200 bg-warm-50"
                : "border-surface-200 bg-surface-50"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-500">
              Step {i + 1}
            </p>
            <p className="truncate text-[11px] font-semibold text-surface-700" title={s.label}>
              {s.label}
            </p>
            <p className="mt-1 text-base font-bold tabular-nums text-surface-900">
              {s.count.toLocaleString()}
            </p>
            {i > 0 && (
              <p
                className={`text-[10px] font-semibold ${
                  s.dropOffPct > 30
                    ? "text-danger-600"
                    : s.dropOffPct > 15
                    ? "text-warm-700"
                    : "text-surface-500"
                }`}
              >
                ↓ {s.dropOffPct.toFixed(1)}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}