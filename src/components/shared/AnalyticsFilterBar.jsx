import { DatePicker, Segmented, Select } from "antd";
import dayjs from "dayjs";
import {
  ANALYTICS_MARKETS,
  ANALYTICS_PRESETS,
  useAnalyticsFilter,
} from "../../context/AnalyticsFilterContext";

const { RangePicker } = DatePicker;

/**
 * Global filter bar for the Analytics page.
 * - Preset (Today / This Week / This Year / Custom)
 * - Market (All Markets / Ghana / Germany / India / Other)
 * - When preset === 'custom', a date RangePicker is shown
 */
export default function AnalyticsFilterBar() {
  const { preset, market, from, to, setPreset, setMarket, setCustomRange } =
    useAnalyticsFilter();

  const customValue =
    preset === "custom" && from && to ? [dayjs(from), dayjs(to)] : null;

  return (
    <div className="sticky top-0 z-20 mb-6 rounded-2xl border border-surface-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Period
          </span>
          <Segmented
            value={preset}
            onChange={setPreset}
            options={ANALYTICS_PRESETS}
            size="middle"
          />
        </div>

        {preset === "custom" && (
          <RangePicker
            value={customValue}
            onChange={(range) => {
              if (!range || !range[0] || !range[1]) return;
              setCustomRange(
                range[0].format("YYYY-MM-DD"),
                range[1].format("YYYY-MM-DD"),
              );
            }}
            size="middle"
          />
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Market
          </span>
          <Select
            value={market}
            onChange={setMarket}
            options={ANALYTICS_MARKETS}
            size="middle"
            style={{ minWidth: 160 }}
          />
        </div>
      </div>
    </div>
  );
}