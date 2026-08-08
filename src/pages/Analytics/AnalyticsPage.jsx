import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaDumbbell, FaTrophy, FaUserPlus, FaUsers } from "react-icons/fa";
import {
  MdCardMembership,
  MdRestaurantMenu,
  MdPsychology,
  MdWhatshot,
  MdLeaderboard,
} from "react-icons/md";
import AnalyticsFilterBar from "../../components/shared/AnalyticsFilterBar";
import StatCard from "../../components/shared/StatCard";
import MiniBarChart from "../../components/shared/MiniBarChart";
import DonutTierChart from "../../components/analytics/DonutTierChart";
import CohortHeatmap from "../../components/analytics/CohortHeatmap";
import FunnelChart from "../../components/analytics/FunnelChart";
import MarketPanel from "../../components/analytics/MarketPanel";
import WinsFeed from "../../components/analytics/WinsFeed";
import { useAnalyticsFilter } from "../../context/AnalyticsFilterContext";
import {
  fetchAccountabilityStats,
  fetchChallengeStats,
  fetchHabitAdoption,
  fetchMarketBreakdown,
  fetchNutritionStats,
  fetchRetentionCohort,
  fetchRevenue,
  fetchTrialFunnel,
  fetchUserStats,
  fetchViralCoefficient,
  fetchWhatsappTracker,
  fetchWorkoutStats,
} from "../../../services/analytics.service";

/**
 * Custom hook that re-fetches whenever the filter changes.
 */
function useAnalyticsQuery(fetcher, refreshKey = "") {
  const filter = useAnalyticsFilter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    fetcher({ ...filter, signal: ac.signal })
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.preset, filter.market, filter.from, filter.to, refreshKey]);

  return { data, loading, error };
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-surface-900">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-surface-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const money = (v, currency = "EUR") =>
  typeof v === "number"
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(v)
    : "—";

export default function AnalyticsPage() {
  const [revenueGranularity, setRevenueGranularity] = useState("daily");
  const userStats = useAnalyticsQuery(fetchUserStats);
  const workoutStats = useAnalyticsQuery(fetchWorkoutStats);
  const challengeStats = useAnalyticsQuery(fetchChallengeStats);
  const nutritionStats = useAnalyticsQuery(fetchNutritionStats);
  const revenueStats = useAnalyticsQuery(
    (params) => fetchRevenue({ ...params, granularity: revenueGranularity }),
    revenueGranularity,
  );
  const accountability = useAnalyticsQuery(fetchAccountabilityStats);
  const habit = useAnalyticsQuery(fetchHabitAdoption);
  const funnel = useAnalyticsQuery(fetchTrialFunnel);
  const viral = useAnalyticsQuery(fetchViralCoefficient);
  const whatsapp = useAnalyticsQuery(fetchWhatsappTracker);

  const cohort = useAnalyticsQuery(fetchRetentionCohort);
  const marketBreakdown = useAnalyticsQuery(fetchMarketBreakdown);

  return (
    <div className="space-y-6" id="intelligence-dashboard">
      <header className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-950 via-brand-800 to-accent-800 px-5 py-6 text-white shadow-lg sm:px-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-200">
          Live intelligence layer
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Intelligence &amp; Marketing Dashboard
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-brand-100">
          Product engagement, retention, revenue, and organic growth in one
          decision view. Every section follows the filters below.
        </p>
      </header>
      <AnalyticsFilterBar />

      {/* =================== 18.9 Marketing widgets (always visible) =================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Trial Funnel"
          subtitle={
            funnel.data?.largestDropOff
              ? `Biggest drop-off: ${funnel.data.largestDropOff}`
              : "Drop-off between each step"
          }
          action={<span id="trial-funnel" />}
        >
          <FunnelChart steps={funnel.data?.steps || []} />
        </SectionCard>

        <SectionCard
          title="Viral Coefficient"
          subtitle={viral.data?.sublabel || "Rolling 30 days"}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p
                className={`text-5xl font-extrabold tabular-nums ${
                  viral.data?.color === "green"
                    ? "text-accent-600"
                    : viral.data?.color === "amber"
                    ? "text-warm-600"
                    : "text-danger-500"
                }`}
              >
                {viral.data?.current?.toFixed(2) ?? "—"}
              </p>
              <p className="mt-1 text-xs text-surface-500">
                {viral.data?.color === "green"
                  ? "Your community is growing itself. Save this number for investors."
                  : viral.data?.color === "amber"
                  ? "Almost there — optimise invite flow."
                  : "Below 0.5 — focus on invites & sharing."}
              </p>
            </div>
            <div className="w-full sm:w-1/2">
              <MiniBarChart
                data={viral.data?.sparkline || []}
                type="sparkline"
                color="accent"
                height={70}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="WhatsApp Share Tracker"
          subtitle="Organic growth heartbeat"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                Today
              </p>
              <p className="text-2xl font-bold tabular-nums text-surface-900">
                {whatsapp.data?.todayCount ?? 0}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                This week
              </p>
              <p className="text-2xl font-bold tabular-nums text-surface-900">
                {whatsapp.data?.thisWeekCount ?? 0}
              </p>
              <p className="text-[11px] font-semibold text-accent-600">
                {whatsapp.data?.thisWeekChangePct?.toFixed(1) ?? 0}% vs last
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                Market split
              </p>
              <p className="text-xs text-surface-700">
                🇬🇭 {whatsapp.data?.marketSplit?.ghana ?? 0} · 🇩🇪{" "}
                {whatsapp.data?.marketSplit?.germany ?? 0} · 🇮🇳{" "}
                {whatsapp.data?.marketSplit?.india ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <MiniBarChart
              data={whatsapp.data?.dailySeries || []}
              color="accent"
              height={140}
            />
          </div>
        </SectionCard>

        <SectionCard title="Daily Wins" subtitle="Real-time social proof">
          <WinsFeed />
        </SectionCard>
      </div>

      {/* =================== 18.2 User Statistics =================== */}
      <SectionCard title="User Statistics" subtitle="Acquisition, retention, and top performers">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total registered"
            value={userStats.data?.totalRegistered?.toLocaleString() ?? 0}
            changePct={userStats.data?.totalRegisteredChangePct}
            tone="brand"
            icon={<FaUsers />}
            loading={userStats.loading}
          />
          <StatCard
            label="New users"
            value={userStats.data?.newUsers?.toLocaleString() ?? 0}
            changePct={userStats.data?.newUsersChangePct}
            tone="accent"
            icon={<FaUserPlus />}
            loading={userStats.loading}
          />
          <StatCard
            label="Active users"
            value={userStats.data?.activeUsers?.toLocaleString() ?? 0}
            changePct={userStats.data?.activeUsersChangePct}
            tone="accent"
            icon={<MdWhatshot />}
            loading={userStats.loading}
          />
          <StatCard
            label="Trial → paid"
            value={`${userStats.data?.trialConversionRate?.toFixed(1) ?? 0}%`}
            colorBand={userStats.data?.trialConversionColor}
            tone="warm"
            loading={userStats.loading}
          />
          <StatCard
            label="Churned"
            value={userStats.data?.churnedUsers?.toLocaleString() ?? 0}
            changePct={userStats.data?.churnedChangePct}
            tone="danger"
            loading={userStats.loading}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
              Users by tier
            </h3>
            <ul className="space-y-1.5">
              {(userStats.data?.usersByTier || []).map((t) => (
                <li key={t.tier} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: t.color || "#94a3b8" }}
                    aria-hidden
                  />
                  <span className="flex-1 text-sm text-surface-700">{t.tier}</span>
                  <span className="text-sm font-semibold tabular-nums">{t.count}</span>
                </li>
              ))}
              {!userStats.data?.usersByTier?.length && !userStats.loading && (
                <li className="text-xs text-surface-400">No tier data yet.</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
              Top 10 users
            </h3>
            <ol className="space-y-1 text-sm">
              {(userStats.data?.top10Users || []).map((u) => (
                <li key={u.userId}>
                  <Link
                    to={`/user-details?userId=${encodeURIComponent(u.userId)}`}
                    className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-1 py-1.5 transition hover:bg-brand-50"
                  >
                    <span className="text-xs font-bold text-surface-400">#{u.rank}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-surface-800">{u.name}</span>
                      <span className="block text-[10px] text-surface-500">{u.tier || "None"} · {u.workouts || 0} workouts</span>
                    </span>
                    <span className="font-semibold tabular-nums">{u.points} pts</span>
                  </Link>
                </li>
              ))}
              {!userStats.data?.top10Users?.length && !userStats.loading && (
                <li className="text-xs text-surface-400">
                  Award points to populate this leaderboard.
                </li>
              )}
            </ol>
          </div>
        </div>

      </SectionCard>

      {/* =================== 18.3 Workout Statistics =================== */}
      <SectionCard title="Workout Statistics" subtitle="Engagement & completion quality">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Completed"
            value={workoutStats.data?.totalCompleted?.toLocaleString() ?? 0}
            changePct={workoutStats.data?.totalCompletedChangePct}
            tone="brand"
            icon={<FaDumbbell />}
            loading={workoutStats.loading}
          />
          <StatCard
            label="Completion rate"
            value={`${workoutStats.data?.completionRate?.toFixed(1) ?? 0}%`}
            colorBand={workoutStats.data?.completionRateColor}
            tone="accent"
            loading={workoutStats.loading}
          />
          <StatCard
            label="AI-generated workouts"
            value={workoutStats.data?.aiGeneratedWorkouts?.toLocaleString() ?? 0}
            tone="warm"
            loading={workoutStats.loading}
          />
        </div>

        {workoutStats.data?.topWorkout && (
          <div className="mt-4 rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-accent-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">
              Top workout of the period
            </p>
            <p className="mt-1 text-lg font-bold text-surface-900">
              {workoutStats.data.topWorkout.title}
            </p>
            <p className="text-xs text-surface-600">
              {workoutStats.data.topWorkout.count} completions · avg{" "}
              {Math.round(workoutStats.data.topWorkout.avgDurationSeconds / 60)} min
            </p>
          </div>
        )}
      </SectionCard>

      {/* =================== 18.4 Challenge Statistics =================== */}
      <SectionCard title="Challenge Statistics" subtitle="Viral mechanics & A/B results">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <StatCard
            label="Invites sent"
            value={challengeStats.data?.invitesSent?.toLocaleString() ?? 0}
            changePct={challengeStats.data?.invitesSentChangePct}
            tone="brand"
            icon={<FaTrophy />}
            loading={challengeStats.loading}
          />
          <StatCard
            label="Invite → register"
            value={`${challengeStats.data?.inviteConversionRate?.toFixed(1) ?? 0}%`}
            tone="accent"
            loading={challengeStats.loading}
          />
          <StatCard
            label="A/B variants"
            value={challengeStats.data?.abTestResult?.length ?? 0}
            tone="warm"
            sublabel={
              (challengeStats.data?.abTestResult || [])
                .map((v) => `${v.variant.toUpperCase()}: ${v.total ? ((v.acceptances / v.total) * 100).toFixed(1) : 0}%`)
                .join(" · ") || "No variants yet"
            }
            loading={challengeStats.loading}
          />
        </div>

        {challengeStats.data?.mostPopular && (
          <div className="mt-4 rounded-xl border border-warm-200 bg-warm-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-700">
              Most popular challenge
            </p>
            <p className="mt-1 text-lg font-bold text-surface-900">
              {challengeStats.data.mostPopular.title}
            </p>
            <p className="text-xs text-surface-600">
              {challengeStats.data.mostPopular.participants} participants ·{" "}
              {challengeStats.data.mostPopular.completionRate?.toFixed(1) ?? "—"}% completed
            </p>
          </div>
        )}
      </SectionCard>

      {/* =================== 18.5 Nutrition =================== */}
      <SectionCard title="Nutrition Statistics" subtitle="AI plans and adherence">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard
            label="AI meal plans generated"
            value={nutritionStats.data?.aiMealPlans?.toLocaleString() ?? 0}
            changePct={nutritionStats.data?.aiMealPlansChangePct}
            tone="accent"
            icon={<MdRestaurantMenu />}
            loading={nutritionStats.loading}
          />
          <StatCard
            label="Protein target hit"
            value={`${nutritionStats.data?.proteinTargetHitRate?.toFixed(1) ?? 0}%`}
            tone="warm"
            loading={nutritionStats.loading}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {["Ghana", "Germany", "India"].map((m) => {
            const food = nutritionStats.data?.mostLoggedByMarket?.[m];
            return (
              <div
                key={m}
                className="rounded-xl border border-surface-200 bg-surface-50 p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                  Top food in {m}
                </p>
                <p className="mt-1 text-base font-bold text-surface-900">
                  {food?.foodName ?? "—"}
                </p>
                <p className="text-xs text-surface-500">
                  {food ? `${food.count} logs` : "Awaiting data"}
                </p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* =================== 18.6 Revenue =================== */}
      <SectionCard
        title="Revenue Statistics"
        subtitle="MRR, ARPU, and trend"
        action={
          <div className="inline-flex rounded-lg border border-surface-200 bg-surface-50 p-1">
            {["daily", "weekly", "monthly"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRevenueGranularity(option)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                  revenueGranularity === option
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-surface-500 hover:text-surface-800"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="MRR (EUR)"
            value={money(revenueStats.data?.mrr?.eur, "EUR")}
            tone="brand"
            icon={<MdCardMembership />}
            loading={revenueStats.loading}
          />
          <StatCard
            label="MRR (GHS)"
            value={money(revenueStats.data?.mrr?.ghs, "GHS")}
            tone="warm"
            loading={revenueStats.loading}
          />
          <StatCard
            label="MRR (INR)"
            value={money(revenueStats.data?.mrr?.inr, "INR")}
            tone="accent"
            loading={revenueStats.loading}
          />
          <StatCard
            label="ARPU"
            value={money(revenueStats.data?.arpu, "EUR")}
            tone="accent"
            loading={revenueStats.loading}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
              Revenue by tier
            </h3>
            <DonutTierChart data={revenueStats.data?.revenueByTier || []} />
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
              MRR trend ({revenueStats.data?.trendGranularity || "weekly"})
            </h3>
            <MiniBarChart
              data={revenueStats.data?.mrrTrend || []}
              color="brand"
              height={220}
              tooltipFormatter={(v) =>
                new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(Number(v))
              }
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { market: "GH", label: "Ghana revenue", currency: "GHS" },
            { market: "DE", label: "Germany revenue", currency: "EUR" },
            { market: "IN", label: "India revenue", currency: "INR" },
          ].map((item) => {
            const revenue = (revenueStats.data?.revenueByMarket || []).find(
              (row) => row.market === item.market,
            );
            return (
              <div
                key={item.market}
                className="rounded-xl border border-surface-200 bg-surface-50 p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-surface-900">
                  {money(revenue?.amount ?? 0, item.currency)}
                </p>
                <p className="text-[11px] text-surface-500">Selected period</p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* =================== 18.7 Accountability Adoption =================== */}
      <SectionCard
        title="Accountability Adoption"
        subtitle="New active accountability pairs"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard
            label="New pairs"
            value={accountability.data?.newAccountabilityPairs?.toLocaleString() ?? 0}
            changePct={accountability.data?.newPairsChangePct}
            tone="warm"
            loading={accountability.loading}
          />
        </div>
      </SectionCard>

      {/* =================== 18.8 Habit Engine =================== */}
      <SectionCard
        title="Habit Engine Adoption"
        subtitle="Gold-tier personalisation metrics"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Identity statement"
            value={habit.data?.identityStatementSet?.toLocaleString() ?? 0}
            sublabel={`${habit.data?.identityStatementPct?.toFixed(1) ?? 0}% of eligible`}
            tone="brand"
            icon={<MdPsychology />}
            loading={habit.loading}
          />
          <StatCard
            label="Workout unlock"
            value={habit.data?.workoutUnlockSet?.toLocaleString() ?? 0}
            sublabel={`${habit.data?.workoutUnlockPct?.toFixed(1) ?? 0}% of eligible`}
            tone="accent"
            icon={<FaDumbbell />}
            loading={habit.loading}
          />
          <StatCard
            label="If-then trigger"
            value={habit.data?.ifThenTriggerSet?.toLocaleString() ?? 0}
            sublabel={`${habit.data?.ifThenTriggerPct?.toFixed(1) ?? 0}% of eligible`}
            tone="warm"
            icon={<MdLeaderboard />}
            loading={habit.loading}
          />
        </div>

        {habit.data?.retentionComparison && (
          <div className="mt-4 rounded-xl border border-accent-200 bg-accent-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-700">
              30-day retention comparison
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-surface-600">Habit users</p>
                <p className="text-xl font-bold tabular-nums text-accent-700">
                  {habit.data.retentionComparison.habitRetainedPct?.toFixed(1) ?? "—"}%
                </p>
              </div>
              <div>
                <p className="text-xs text-surface-600">Non-habit users</p>
                <p className="text-xl font-bold tabular-nums text-surface-700">
                  {habit.data.retentionComparison.nonHabitRetainedPct?.toFixed(1) ?? "—"}%
                </p>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* =================== 18.10 Retention Cohort =================== */}
      <SectionCard
        title="Retention Cohort Table"
        subtitle="Day-7 retention > 45% for 4 weeks = scale marketing"
      >
        <CohortHeatmap
          cohorts={cohort.data?.cohorts || []}
          loading={cohort.loading}
        />
      </SectionCard>

      {/* =================== 18.11 Market Breakdown =================== */}
      <SectionCard
        title="Market Breakdown"
        subtitle="30-second decision tool for marketing budget"
      >
        <MarketPanel
          markets={marketBreakdown.data?.markets || []}
          loading={marketBreakdown.loading}
        />
      </SectionCard>
    </div>
  );
}
