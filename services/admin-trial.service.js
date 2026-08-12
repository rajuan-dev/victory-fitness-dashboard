import { fetchTrialFunnel, fetchUserStats } from "./analytics.service";
import { getTrialCohorts, getTrialDropouts } from "./admin-users.service";

export const getGoldTrialDashboard = async ({ preset = "this_week", market = "all", from, to, signal } = {}) => {
  const [funnel, userStats, cohorts, dropouts] = await Promise.all([
    fetchTrialFunnel({ preset, market, from, to, signal }).catch((error) => ({ error: error.message, steps: [] })),
    fetchUserStats({ preset, market, from, to, signal }).catch((error) => ({ error: error.message })),
    getTrialCohorts({ signal }).catch((error) => ({ error: error.message, cohorts: [] })),
    getTrialDropouts({ signal, limit: 100 }).catch((error) => ({ error: error.message, users: [] })),
  ]);

  return {
    funnel,
    userStats,
    cohorts: Array.isArray(cohorts?.cohorts) ? cohorts.cohorts : [],
    dropouts: Array.isArray(dropouts?.users) ? dropouts.users : [],
    errors: [funnel?.error, userStats?.error, cohorts?.error, dropouts?.error].filter(Boolean),
  };
};
