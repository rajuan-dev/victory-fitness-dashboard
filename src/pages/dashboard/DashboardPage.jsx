import { FaChevronDown, FaUsers, FaDumbbell, FaTrophy, FaVideo, FaBolt, FaFlagCheckered } from "react-icons/fa";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import RecentUsers from "./RecentUsers";
import UserAgentChart from "./UserAgentChart";
import { adminApiRequest } from "../../../services/auth.service";

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-md animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-9 w-20 rounded bg-slate-300" />
            </div>
            <div className="h-16 w-16 rounded-2xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white shadow-lg overflow-hidden animate-pulse">
      <div className="grid grid-cols-5 gap-4 bg-blue-600 px-6 py-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-4 rounded bg-blue-400/70" />
        ))}
      </div>
      <div className="space-y-4 px-6 py-5">
        {[...Array(5)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-4 items-center">
            <div className="h-4 w-8 rounded bg-slate-100" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-100" />
            </div>
            <div className="h-4 w-36 rounded bg-slate-100" />
            <div className="h-4 w-16 rounded bg-slate-100" />
            <div className="h-4 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPage() {
  const currentYear = dayjs().year();
  const startYear = 2024;
  const [selectedUserYear, setSelectedUserYear] = useState(currentYear);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [overview, setOverview] = useState({
    totalUsers: 0,
    workoutsThisWeek: 0,
    challengeCompletions: 0,
    activeChallenges: 0,
    readyChallenges: 0,
    vimeoApiStatus: "MISSING",
    userChart: [],
    recentUsers: [],
  });
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoadingOverview(true);
    setOverviewError("");

    adminApiRequest(`/admin/dashboard/overview?year=${selectedUserYear}`)
      .then((data) => {
        if (isMounted) {
          setOverview(data);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setOverviewError(error instanceof Error ? error.message : "Failed to load dashboard overview");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingOverview(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUserYear]);

  const {
    totalUsers = 0,
    workoutsThisWeek = 0,
    challengeCompletions = 0,
    activeChallenges = 0,
    readyChallenges = 0,
    vimeoApiStatus = "MISSING",
    userChart = [],
    recentUsers = [],
  } = overview;

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index,
  );

  const stats = [
    {
      value: totalUsers,
      label: "Total Users",
      icon: FaUsers,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      value: workoutsThisWeek,
      label: "Workouts This Week",
      icon: FaDumbbell,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      value: challengeCompletions,
      label: "Challenge Completions",
      icon: FaTrophy,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      value: activeChallenges,
      label: "Active Challenges",
      icon: FaBolt,
      gradient: "from-cyan-500 to-sky-600",
      bgGradient: "from-cyan-50 to-sky-50",
    },
    {
      value: readyChallenges,
      label: "Ready Challenges",
      icon: FaFlagCheckered,
      gradient: "from-amber-500 to-yellow-600",
      bgGradient: "from-amber-50 to-yellow-50",
    },
    {
      value: vimeoApiStatus,
      label: "Vimeo API Status",
      icon: FaVideo,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
  ];

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6">
      {/* Welcome Section */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-slate-600 text-sm md:text-base mt-1">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
        {overviewError && (
          <p className="mt-3 text-sm font-medium text-red-600">{overviewError}</p>
        )}
      </div>

      {/* Stats Grid */}
      {isLoadingOverview ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`group relative bg-gradient-to-br ${stat.bgGradient} p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/50 overflow-hidden`}
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
                ></div>

                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-slate-600 text-sm md:text-base font-medium mb-2">
                      {stat.label}
                    </p>
                    <p
                      className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1">
        {/* User Growth Chart */}
        {isLoadingOverview ? (
          <ChartSkeleton />
        ) : (
          <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-lg p-5 md:p-7 border border-slate-200/60">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  User Growth
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Track user registration trends
                </p>
              </div>

              <div className="relative w-full md:w-44">
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl flex justify-between items-center bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
                >
                  <span className="text-slate-700 text-sm md:text-base font-semibold">
                    {selectedUserYear}
                  </span>
                  <FaChevronDown
                    className={`text-blue-600 w-4 h-4 transition-transform duration-300 ${isUserOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isUserOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsUserOpen(false)}
                    />
                    <div className="absolute z-30 w-full mt-2 bg-white border-2 border-blue-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {years.map((year) => (
                        <div
                          key={year}
                          onClick={() => {
                            setSelectedUserYear(year);
                            setIsUserOpen(false);
                          }}
                          className={`px-4 py-3 cursor-pointer transition-all text-sm md:text-base ${year === selectedUserYear
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold"
                            : "text-slate-700 hover:bg-blue-50"
                            }`}
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200/60">
              <div className="h-64 md:h-80">
                <UserAgentChart chartData={userChart} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Users Section */}
      <div className="w-full">
        <div className="flex items-center gap-3 mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Recent Joined Users
            </h2>
          </div>
        </div>
        {isLoadingOverview ? (
          <TableSkeleton />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200/60">
            <RecentUsers users={recentUsers} />
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
