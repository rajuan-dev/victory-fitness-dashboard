/**
 * Color-coded retention cohort table.
 * Bands: green > 50, amber 25-50, red < 25 (per the brief).
 */
const bandClass = (pct) => {
  if (pct == null) return "bg-surface-50 text-surface-400";
  if (pct >= 50) return "bg-accent-500/90 text-white";
  if (pct >= 25) return "bg-warm-400/90 text-white";
  if (pct > 0) return "bg-danger-500/85 text-white";
  return "bg-surface-100 text-surface-400";
};

export default function CohortHeatmap({ cohorts = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-md bg-surface-100"
          />
        ))}
      </div>
    );
  }

  if (!cohorts.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-surface-200 bg-surface-50 text-sm text-surface-500">
        Not enough data yet — cohort tracking starts after 7 days of new users.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-surface-500">
            <th className="px-2 py-2 text-left font-semibold">Cohort week</th>
            <th className="px-2 py-2 text-right font-semibold">New users</th>
            <th className="px-2 py-2 text-center font-semibold">Day-7 %</th>
            <th className="px-2 py-2 text-center font-semibold">Day-14 %</th>
            <th className="px-2 py-2 text-center font-semibold">Day-30 %</th>
            <th className="px-2 py-2 text-center font-semibold">Paid Day-30 %</th>
          </tr>
        </thead>
        <tbody>
          {cohorts.map((row) => (
            <tr key={row.weekStart} className="border-t border-surface-100">
              <td className="px-2 py-2 font-mono text-surface-700">
                {row.weekStart}
              </td>
              <td className="px-2 py-2 text-right font-semibold tabular-nums">
                {row.newUsers}
              </td>
              <td className={`px-2 py-2 text-center font-semibold tabular-nums rounded ${bandClass(row.day7Pct)}`}>
                {row.day7Pct == null ? "—" : `${row.day7Pct.toFixed(1)}%`}
              </td>
              <td className={`px-2 py-2 text-center font-semibold tabular-nums rounded ${bandClass(row.day14Pct)}`}>
                {row.day14Pct == null ? "—" : `${row.day14Pct.toFixed(1)}%`}
              </td>
              <td className={`px-2 py-2 text-center font-semibold tabular-nums rounded ${bandClass(row.day30Pct)}`}>
                {row.day30Pct == null ? "—" : `${row.day30Pct.toFixed(1)}%`}
              </td>
              <td className={`px-2 py-2 text-center font-semibold tabular-nums rounded ${bandClass(row.paidDay30Pct)}`}>
                {row.paidDay30Pct == null ? "—" : `${row.paidDay30Pct.toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
