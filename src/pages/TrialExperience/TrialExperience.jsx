import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiCheck,
  FiClock,
  FiMail,
  FiMessageCircle,
  FiPlayCircle,
  FiRefreshCw,
  FiShield,
  FiSliders,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import AnalyticsFilterBar from "../../components/shared/AnalyticsFilterBar";
import FunnelChart from "../../components/analytics/FunnelChart";
import { useAnalyticsFilter } from "../../context/AnalyticsFilterContext";
import { getGoldTrialDashboard } from "../../../services/admin-trial.service";

const trialDays = [
  {
    day: "Day 0",
    title: "Welcome + first taste",
    job: "Instant welcome",
    channels: ["Push", "In-app", "Email"],
    body: "Hi {{name}}, your Gold trial is active. Ask Coach Victor one question right now to get your first win.",
    purpose: "Confirm the exact tier and push the first AI Coach touch immediately.",
    backend: "Partially wired in trial_campaign.py",
  },
  {
    day: "Day 1",
    title: "Get them into Nutrition",
    job: "Nutrition nudge",
    channels: ["Push", "In-app", "Email"],
    body: "Have you set up your meal plan yet? Takes 2 minutes.",
    purpose: "Move users into the Nutrition Planner before it becomes the skipped feature.",
    backend: "Partially wired in trial_campaign.py",
  },
  {
    day: "Day 2",
    title: "Show, do not tell",
    job: "Video message",
    channels: ["Video", "Push", "In-app"],
    body: "Watch your mid-trial Victory Fitness video and choose one feature to try today.",
    purpose: "Show value while there is still enough runway for the user to act.",
    backend: "Video fallback metadata exists; video asset/admin readiness is not exposed.",
  },
  {
    day: "Day 3",
    title: "Reinforce or activate",
    job: "Usage branch",
    channels: ["Push", "In-app", "Email"],
    body: "Engaged users get usage reinforcement. Unengaged users get a first-touch activation prompt.",
    purpose: "Branch from actual AI Coach or Nutrition usage since trial start.",
    backend: "Engagement check exists, but it checks broad existing usage rather than strictly since trial_start_at.",
  },
  {
    day: "Day 4",
    title: "Pre-decision warm-up",
    job: "Usage summary",
    channels: ["Push", "In-app"],
    body: "Tomorrow your trial ends. Here is what you have used so far.",
    purpose: "Factual summary only. No upsell language and no guilt framing.",
    backend: "Message exists; usage summary details are not fully surfaced.",
  },
  {
    day: "Day 5",
    title: "Conversion decision",
    job: "Video + text + email",
    channels: ["Video", "Push", "In-app", "Email"],
    body: "Your Gold trial is complete. Choose the plan that keeps the tools you used.",
    purpose: "Show Silver vs Gold side-by-side with the user's actual usage pre-filled.",
    backend: "Message exists; decision screen and trial_outcome tracking need more explicit backend support.",
  },
];

const readinessRows = [
  {
    item: "trial_tier_granted, trial_start_at, trial_end_at, trial_outcome fields",
    status: "partial",
    note: "Backend uses subscription_started_at for trial-like logic. Dedicated trial fields are not clearly implemented.",
  },
  {
    item: "Gold access during 5-day trial",
    status: "partial",
    note: "Access helpers understand subscription tiers, but explicit temporary Gold entitlement needs confirmation.",
  },
  {
    item: "Day 0-5 scheduled messaging",
    status: "partial",
    note: "trial_campaign.py has Day 0-5 copy and sends notifications/email.",
  },
  {
    item: "Day-3 engaged vs unengaged branch",
    status: "partial",
    note: "Branching exists, but the exact requirement says usage between trial_start_at and now.",
  },
  {
    item: "Day-4 factual usage summary",
    status: "partial",
    note: "Copy exists, but no detailed per-user usage summary payload is exposed to admin.",
  },
  {
    item: "Day-5 Silver vs Gold decision screen",
    status: "missing",
    note: "No dedicated frontend/admin-configurable decision screen found.",
  },
  {
    item: "No silent paid conversion guardrail",
    status: "partial",
    note: "No auto-payment flow was visible here, but this needs backend/payment verification before launch.",
  },
  {
    item: "Dashboard trial_outcome breakdown",
    status: "partial",
    note: "Trial funnel/cohorts exist. Explicit converted_gold/downgraded_silver/lapsed breakdown is not surfaced.",
  },
  {
    item: "Fallback rule for invalid phone or missing video",
    status: "partial",
    note: "Campaign metadata includes fallback hints. Admin alerting for failed video/phone is not complete.",
  },
];

const outcomeCards = [
  { label: "Converted to Gold", valueKey: "convertedGold", fallback: 0, tone: "gold" },
  { label: "Downgraded to Silver", valueKey: "downgradedSilver", fallback: 0, tone: "navy" },
  { label: "Lapsed", valueKey: "lapsed", fallback: 0, tone: "danger" },
];

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function StatusPill({ status }) {
  const config = {
    done: "border-[#1A7A4A]/20 bg-[#1A7A4A]/10 text-[#1A7A4A]",
    partial: "border-[#C9943A]/25 bg-[#C9943A]/10 text-[#8a611d]",
    missing: "border-rose-200 bg-rose-50 text-rose-700",
  }[status] || "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span className={cx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide", config)}>
      {status}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, caption, tone = "navy" }) {
  const toneMap = {
    navy: "bg-[#0D2B45] text-white",
    gold: "bg-[#C9943A] text-[#0D0D0D]",
    green: "bg-[#1A7A4A] text-white",
    ivory: "bg-[#F7F3EE] text-[#0D2B45] border border-[#0D2B45]/10",
    danger: "bg-rose-600 text-white",
  };
  return (
    <div className={cx("rounded-lg p-4 shadow-sm", toneMap[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
          <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
        </div>
        {Icon ? <Icon className="h-5 w-5 opacity-75" /> : null}
      </div>
      {caption ? <p className="mt-3 text-xs leading-relaxed opacity-80">{caption}</p> : null}
    </div>
  );
}

function SectionShell({ title, eyebrow, children, action }) {
  return (
    <section className="rounded-lg border border-[#0D2B45]/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.22em] text-[#B5651D]">{eyebrow}</p> : null}
          <h2 className="mt-1 text-lg font-black text-[#0D2B45]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function TrialDayCard({ item, active }) {
  return (
    <article
      className={cx(
        "rounded-lg border p-4 transition-all",
        active ? "border-[#C9943A] bg-[#C9943A]/10 shadow-sm" : "border-[#0D2B45]/10 bg-[#F7F3EE]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B5651D]">{item.day}</p>
          <h3 className="mt-1 text-base font-black text-[#0D2B45]">{item.title}</h3>
          <p className="text-sm font-semibold text-slate-500">{item.job}</p>
        </div>
        <FiClock className="h-5 w-5 text-[#C9943A]" />
      </div>
      <p className="mt-4 rounded-md bg-white p-3 text-sm leading-relaxed text-slate-700">{item.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.channels.map((channel) => (
          <span key={channel} className="rounded-full border border-[#0D2B45]/10 bg-white px-2.5 py-1 text-xs font-bold text-[#0D2B45]">
            {channel}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">{item.purpose}</p>
      <p className="mt-2 text-xs font-semibold text-[#8a611d]">{item.backend}</p>
    </article>
  );
}

export default function TrialExperience() {
  const filter = useAnalyticsFilter();
  const [data, setData] = useState({ funnel: { steps: [] }, userStats: {}, cohorts: [], dropouts: [], errors: [] });
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("engaged");
  const [activeDay, setActiveDay] = useState(3);

  const currentMessage = useMemo(() => {
    if (selectedBranch === "engaged") {
      return "You've already sent {{ai_message_count}} messages to your coach - keep going.";
    }
    return "You've got 2 days left to try your AI Coach - ask it one question right now.";
  }, [selectedBranch]);

  const load = () => {
    const controller = new AbortController();
    setLoading(true);
    getGoldTrialDashboard({ ...filter, signal: controller.signal })
      .then(setData)
      .finally(() => setLoading(false));
    return () => controller.abort();
  };

  useEffect(() => load(), [filter.preset, filter.market, filter.from, filter.to]);

  const funnelSteps = data.funnel?.steps || [];
  const completedTrials = Number(data.userStats?.completedTrials || data.userStats?.trialCompleted || 0);
  const conversionRate = Number(data.userStats?.trialConversionRate || 0);

  return (
    <div className="min-h-screen space-y-6 bg-[#F7F3EE] pb-8 text-[#0D0D0D]">
      <header className="overflow-hidden rounded-lg bg-[#0D2B45] text-white shadow-xl">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.45fr_0.8fr] lg:p-8">
          <div>
            <p className="inline-flex rounded-full border border-[#C9943A]/40 bg-[#C9943A]/15 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[#F7F3EE]">
              Section 19
            </p>
            <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-normal sm:text-4xl">
              5-Day Gold Trial Experience
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#F7F3EE]/80 sm:text-base">
              Admin operating view for undecided sign-ups: full Gold access, Day 0-5 messaging, Day-3 branch logic, Day-5 decision framing, and conversion outcomes.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Try Gold free for 5 days", "No silent conversion", "Usage-based Day 3", "Silver is paid"].map((label) => (
                <span key={label} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#F7F3EE]">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C9943A]">Backend check</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-white/80">Trial campaign job</span>
                <StatusPill status="partial" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-white/80">Trial analytics</span>
                <StatusPill status="partial" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-white/80">Admin editor endpoints</span>
                <StatusPill status="missing" />
              </div>
            </div>
            {data.errors?.length ? (
              <div className="mt-4 rounded-md bg-rose-500/15 p-3 text-xs text-rose-50">
                {data.errors[0]}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <AnalyticsFilterBar />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FiZap} label="Trial offer" value="Gold" caption="Only for undecided sign-ups after onboarding or 'I'm not sure'." tone="gold" />
        <MetricCard icon={FiClock} label="Entitlement window" value="5 days" caption="trial_end_at must equal trial_start_at plus 5 days." tone="navy" />
        <MetricCard icon={FiBarChart2} label="Trial conversion" value={`${conversionRate.toFixed(1)}%`} caption={`${completedTrials || 0} completed trials in current analytics response.`} tone="green" />
        <MetricCard icon={FiShield} label="Launch risk" value="Partial" caption="Backend has campaign pieces, but dedicated trial schema/editor is incomplete." tone="ivory" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.85fr]">
        <SectionShell title="Entitlement Rules" eyebrow="19.1 What the trial unlocks">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              "subscriptions.trial_tier_granted = gold",
              "trial_start_at set per user",
              "trial_end_at = start + 5 days",
              "plan remains null until active choice",
              "Unlimited AI Coach chat",
              "Full Nutrition Planner and AI meal plans",
              "Challenge creation during trial",
              "Workouts, Challenges, Silver Community always available",
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-3 rounded-md border border-[#0D2B45]/10 bg-[#F7F3EE] p-3">
                <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1A7A4A]" />
                <span className="text-sm font-semibold text-[#0D2B45]">{rule}</span>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Live Trial Funnel"
          eyebrow="Dashboard analytics"
          action={
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-md border border-[#0D2B45]/10 bg-[#F7F3EE] px-3 py-2 text-xs font-bold text-[#0D2B45] hover:bg-white"
            >
              <FiRefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
          }
        >
          <FunnelChart steps={funnelSteps} />
        </SectionShell>
      </div>

      <SectionShell title="Day-By-Day Messaging Sequence" eyebrow="19.2 campaign design">
        <div className="mb-4 flex flex-wrap gap-2">
          {trialDays.map((item, index) => (
            <button
              key={item.day}
              type="button"
              onClick={() => setActiveDay(index)}
              className={cx(
                "rounded-md px-3 py-2 text-xs font-black uppercase tracking-wide",
                activeDay === index ? "bg-[#0D2B45] text-white" : "bg-white text-[#0D2B45] ring-1 ring-[#0D2B45]/10",
              )}
            >
              {item.day}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {trialDays.map((item, index) => (
            <TrialDayCard key={item.day} item={item} active={activeDay === index} />
          ))}
        </div>
      </SectionShell>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionShell title="Day-3 Branch Logic" eyebrow="19.3 engagement decision">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#F7F3EE] p-1">
            {[
              ["engaged", "Engaged"],
              ["unengaged", "Unengaged"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedBranch(key)}
                className={cx(
                  "rounded-md px-3 py-2 text-sm font-black",
                  selectedBranch === key ? "bg-[#0D2B45] text-white shadow-sm" : "text-[#0D2B45]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[#C9943A]/25 bg-[#C9943A]/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B5651D]">Message preview</p>
            <p className="mt-2 text-lg font-black text-[#0D2B45]">{currentMessage}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Rule: engaged means 1+ AI session or 1+ meal logged since trial start. Unengaged means zero AI sessions and zero meals logged.
            </p>
          </div>
        </SectionShell>

        <SectionShell title="Day-5 Decision Screen Spec" eyebrow="19.2 conversion push">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[#0D2B45]/15 bg-[#F7F3EE] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0D2B45]">Victory Silver</p>
              <p className="mt-2 text-3xl font-black text-[#0D2B45]">EUR 199/year</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Full workout library</li>
                <li>Challenges</li>
                <li>Silver community</li>
              </ul>
            </div>
            <div className="rounded-lg border-2 border-[#C9943A] bg-[#0D2B45] p-4 text-white shadow-md">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9943A]">Victory Gold</p>
              <p className="mt-2 text-3xl font-black">Keep Gold</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>AI Coach usage pre-filled</li>
                <li>Nutrition Planner usage pre-filled</li>
                <li>Challenge creation retained</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            Guardrail: trial must never silently convert anyone to paid without explicit Day-5 action.
          </div>
        </SectionShell>
      </div>

      <SectionShell title="Backend Completion Check" eyebrow="implementation readiness">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#0D2B45]/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Requirement</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {readinessRows.map((row) => (
                <tr key={row.item} className="border-b border-[#0D2B45]/5">
                  <td className="py-3 pr-4 font-semibold text-[#0D2B45]">{row.item}</td>
                  <td className="py-3 pr-4"><StatusPill status={row.status} /></td>
                  <td className="py-3 text-slate-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionShell title="Trial Outcome Breakdown" eyebrow="19.4 cohort tracking">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {outcomeCards.map((card) => (
              <MetricCard
                key={card.label}
                label={card.label}
                value={data.userStats?.[card.valueKey] ?? card.fallback}
                caption="Needs explicit trial_outcome backend field for launch accuracy."
                tone={card.tone}
              />
            ))}
          </div>
        </SectionShell>

        <SectionShell title="Recent Trial Dropouts" eyebrow="activation watchlist">
          <div className="space-y-3">
            {data.dropouts.length ? data.dropouts.slice(0, 5).map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#0D2B45]/10 bg-[#F7F3EE] p-3">
                <div>
                  <p className="font-black text-[#0D2B45]">{user.fullName}</p>
                  <p className="text-xs text-slate-500">{user.email} - {user.signupSource || "unknown source"}</p>
                </div>
                <div className="flex gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[#0D2B45]">{user.coachMessages || 0} coach messages</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[#0D2B45]">{user.nutritionPlanCreated ? "Nutrition used" : "No nutrition"}</span>
                </div>
              </div>
            )) : (
              <div className="rounded-md border border-dashed border-[#0D2B45]/20 bg-[#F7F3EE] p-6 text-center text-sm font-semibold text-slate-500">
                No dropouts returned by the backend yet.
              </div>
            )}
          </div>
        </SectionShell>
      </div>

      <SectionShell title="Admin Actions Needed Before Launch" eyebrow="frontend-ready, backend-needed">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            [FiSliders, "Expose trial settings API", "Admin should edit messages, video URLs, channel fallback rules, and active/inactive state."],
            [FiMessageCircle, "Track exact engagement window", "Day-3 branch must count AI and nutrition only between trial_start_at and send time."],
            [FiMail, "Day-5 decision payload", "Backend should provide per-user usage data for the Silver vs Gold decision screen."],
            [FiPlayCircle, "Video readiness check", "Day 2 and Day 5 video messages need asset status and fallback visibility."],
            [FiUsers, "Outcome model", "Store converted_gold, downgraded_silver, or lapsed after the Day-5 decision."],
            [FiAlertTriangle, "Failure alerts", "Invalid phone/video/email fallback should notify admins instead of failing silently."],
          ].map(([Icon, title, body]) => (
            <div key={title} className="rounded-lg border border-[#0D2B45]/10 bg-[#F7F3EE] p-4">
              <Icon className="h-5 w-5 text-[#B5651D]" />
              <h3 className="mt-3 font-black text-[#0D2B45]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}
