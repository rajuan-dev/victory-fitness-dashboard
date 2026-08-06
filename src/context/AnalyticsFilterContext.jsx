import { createContext, useContext, useMemo, useState } from "react";

/**
 * Global filter state for the Analytics & Marketing page.
 * Sections read from this context via useAnalyticsFilter() and re-fetch
 * automatically when the filter changes.
 *
 * Shape:
 *   preset:  'today' | 'this_week' | 'this_year' | 'custom'
 *   from:    ISO date string or null (when preset === 'custom')
 *   to:      ISO date string or null (when preset === 'custom')
 *   market:  'all' | 'ghana' | 'germany' | 'india' | 'other'
 */
const AnalyticsFilterContext = createContext(null);

const DEFAULT_FILTER = {
  preset: "this_week",
  from: null,
  to: null,
  market: "all",
};

export function AnalyticsFilterProvider({ children }) {
  const [filter, setFilter] = useState(DEFAULT_FILTER);

  const value = useMemo(
    () => ({
      ...filter,
      setPreset: (preset) => setFilter((prev) => ({ ...prev, preset })),
      setMarket: (market) => setFilter((prev) => ({ ...prev, market })),
      setCustomRange: (from, to) =>
        setFilter((prev) => ({ ...prev, preset: "custom", from, to })),
      reset: () => setFilter(DEFAULT_FILTER),
    }),
    [filter],
  );

  return (
    <AnalyticsFilterContext.Provider value={value}>
      {children}
    </AnalyticsFilterContext.Provider>
  );
}

export function useAnalyticsFilter() {
  const ctx = useContext(AnalyticsFilterContext);
  if (!ctx) {
    throw new Error(
      "useAnalyticsFilter must be used inside AnalyticsFilterProvider",
    );
  }
  return ctx;
}

export const ANALYTICS_PRESETS = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom" },
];

export const ANALYTICS_MARKETS = [
  { value: "all", label: "All Markets" },
  { value: "ghana", label: "Ghana" },
  { value: "germany", label: "Germany" },
  { value: "india", label: "India" },
  { value: "other", label: "Other" },
];