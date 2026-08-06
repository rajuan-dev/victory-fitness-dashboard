/* eslint-disable react/prop-types */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function ChartSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-blue-50 p-5 shadow-lg md:p-7 animate-pulse">
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-3">
          <div className="h-7 w-40 rounded bg-slate-200" />
          <div className="h-4 w-52 rounded bg-slate-100" />
        </div>
        <div className="h-11 w-full rounded-xl bg-white md:w-44" />
      </div>
      <div className="h-80 rounded-xl border border-slate-200/60 bg-white" />
    </div>
  );
}

const TotalUsers = ({ summary, isLoading, error }) => {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  const chartData = (summary?.userChart || []).map((item) => ({
    month: item.month,
    appUsers: item.userCount,
    activeUsers: item.activeUserCount ?? 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { month, appUsers, activeUsers } = payload[0].payload;
      return (
        <div className="rounded border bg-white px-3 py-2 text-[#2563eb] shadow">
          <p className="font-semibold">{`Month: ${month}`}</p>
          <p>{`Registered Users: ${appUsers}`}</p>
          <p>{`Active Users: ${activeUsers}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-blue-50 p-5 shadow-lg md:p-7">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
            User Growth
          </h2>
          <p className="mt-1 text-sm text-slate-600">Registered users for the current year</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
            <div className="text-lg font-bold text-slate-900">{summary?.totalUsers || 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Active</div>
            <div className="text-lg font-bold text-emerald-600">{summary?.activeUsers || 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Pending</div>
            <div className="text-lg font-bold text-amber-600">{summary?.pendingUsers || 0}</div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : (
        <div className="h-[22rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis tickLine={false} dataKey="month" />
              <YAxis tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="appUsers"
                fill="#2563eb"
                barSize={30}
                radius={[5, 5, 0, 0]}
                name="Registered Users"
              />
              <Bar
                dataKey="activeUsers"
                fill="#60a5fa"
                barSize={30}
                radius={[5, 5, 0, 0]}
                name="Active Users"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TotalUsers;
