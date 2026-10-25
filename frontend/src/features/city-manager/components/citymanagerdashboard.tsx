"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Coins,
  FileText,
  Flame,
  IndianRupee,
  Layers,
  MoreHorizontal,
  Plane,
  RefreshCw,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMyAssignedLeads } from "@/features/user/accessSlice";
import { getTodayFollowups } from "@/features/leads/lead_followupsSlice";
import { MONTH_OPTIONS } from "../../leads/types/LeadsTable/leadstabledata";
import type { LeadRecord } from "@/types/types";
import StatusLeadsTable from "./StatusLeadsTable";
import AdvisorFollowupStats from "./AdvisorFollowup";
import HighPaxLeadsTable from "./HighPaxLeadsTable";
import LongDurationLeadsTable from "./LongDurationLeadsTable";
import { CARD, CardHeader, SELECT_CLS, STATUS_META } from "./dashboardShared";

const PLAN_TONES = {
  blue: { card: "border-blue-100 bg-gradient-to-br from-blue-50 via-blue-50/70 to-white", circle: "bg-blue-200 text-blue-700", btn: "bg-blue-100 text-blue-700", dot: "bg-blue-500", deco: "text-blue-300" },
  green: { card: "border-emerald-100 bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-white", circle: "bg-emerald-200 text-emerald-700", btn: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", deco: "text-emerald-300" },
  amber: { card: "border-amber-100 bg-gradient-to-br from-amber-50 via-amber-50/70 to-white", circle: "bg-amber-300 text-amber-800", btn: "bg-amber-100 text-amber-700", dot: "bg-amber-500", deco: "text-amber-300" },
  violet: { card: "border-violet-100 bg-gradient-to-br from-violet-50 via-violet-50/70 to-white", circle: "bg-violet-400 text-white", btn: "bg-violet-100 text-violet-700", dot: "bg-violet-500", deco: "text-violet-300" },
  rose: { card: "border-rose-100 bg-gradient-to-br from-rose-50 via-rose-50/70 to-white", circle: "bg-rose-400 text-white", btn: "bg-rose-100 text-rose-700", dot: "bg-rose-500", deco: "text-rose-300" },
} as const;

function PlanCard({
  tone,
  icon: Icon,
  deco: Deco,
  title,
  value,
  sub,
  cta,
  onClick,
}: {
  tone: keyof typeof PLAN_TONES;
  icon: typeof Users;
  deco: typeof Users;
  title: string;
  value: string | number;
  sub: string;
  cta: string;
  onClick?: () => void;
}) {
  const t = PLAN_TONES[tone];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${t.card}`}
    >
      <MoreHorizontal
        size={16}
        aria-hidden
        className="absolute right-4 top-4 text-slate-400"
      />
      <div className={`grid h-12 w-12 place-items-center rounded-full ${t.circle}`}>
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-3xl font-bold leading-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>

      <Deco
        size={72}
        strokeWidth={1.25}
        aria-hidden
        className={`pointer-events-none absolute -bottom-1 right-3 opacity-60 ${t.deco}`}
      />

      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        title={onClick ? undefined : "Coming soon"}
        className={`relative mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${t.btn}`}
      >
        <span className={`grid h-5 w-5 place-items-center rounded-full text-white ${t.dot}`}>
          <ArrowRight size={12} />
        </span>
        {cta}
      </button>
    </div>
  );
}

const STATUS_ICON: Record<string, typeof Users> = {
  NEW: UserPlus,
  KYC: FileText,
  RFQ: ClipboardList,
  HOT: Flame,
  "VEH-N": Car,
  LOST: XCircle,
  BOOK: CheckCircle2,
};

function StatusTile({
  label,
  count,
  pct,
  bg,
  text,
  dot,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  count: number;
  pct: number;
  bg: string;
  text: string;
  dot: string;
  icon: typeof Users;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-28 flex-col justify-between overflow-hidden rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? "shadow-md ring-2 ring-blue-500 ring-offset-2" : "shadow-sm"
      }`}
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, #FFFFFF 120%)`,
        borderColor: `${dot}33`,
        color: text,
      }}
    >
      <span className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        <span
          className="grid h-7 w-7 place-items-center rounded-full"
          style={{ backgroundColor: `${dot}26`, color: dot }}
        >
          <Icon size={14} />
        </span>
      </span>
      <span>
        <span className="block text-2xl font-bold leading-none">{count}</span>
        <span className="mt-2 flex items-center gap-2">
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-black/5">
            <span
              className="block h-full rounded-full"
              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: dot }}
            />
          </span>
          <span className="text-[11px] font-semibold opacity-80">
            {pct.toFixed(1)}%
          </span>
        </span>
      </span>
    </button>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { assignedLeads } = useSelector(
    (state: RootState) => state.travelAdvisor,
  );

  const {
    leads: liveLeads,
    total: liveTotal,
    totalPages: liveTotalPages,
    statusCounts: liveStatusCounts,
    monthlyStats: liveMonthlyStats,
    loading: liveLoading,
    zonesAdvisors,
  } = assignedLeads;

  const { todayFollowups = [], loading: todayFollowupsLoading } = useSelector(
    (state: RootState) => state.followUp,
  );

  const cityIds = useMemo<number[]>(() => {
    const user = currentUser as any;
    const rawCityIds =
      user?.city_ids ?? user?.cityIds ?? user?.cities_ids ?? [];

    if (Array.isArray(rawCityIds)) {
      return rawCityIds
        .map((id: unknown) => Number(id))
        .filter((id: number) => Number.isFinite(id));
    }
    const singleCityId =
      user?.city_id ?? user?.cityId ?? user?.cityID ?? user?.city?.id;

    if (
      singleCityId !== undefined &&
      singleCityId !== null &&
      singleCityId !== ""
    ) {
      const parsed = Number(singleCityId);
      if (Number.isFinite(parsed)) return [parsed];
    }
    return [];
  }, [currentUser]);

  const todayFollowupCount = useMemo(
    () => (Array.isArray(todayFollowups) ? todayFollowups.length : 0),
    [todayFollowups],
  );

  const [liveStatusFilter, setLiveStatusFilter] = useState<string>("All");
  const [liveSelectedMonth, setLiveSelectedMonth] = useState<string | null>(
    null,
  );
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null,
  );
  const [tablePage, setTablePage] = useState(1);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (!cityIds.length) {
      console.warn(
        "City Manager: cityIds not found, today followups not fetched.",
      );
      return;
    }
    dispatch(getTodayFollowups({ cityIds } as any));
  }, [dispatch, cityIds]);

  useEffect(() => {
    dispatch(
      fetchMyAssignedLeads({
        page: tablePage,
        status: liveStatusFilter !== "All" ? liveStatusFilter : undefined,
        month: liveSelectedMonth ? parseInt(liveSelectedMonth) : null,
        advisorId: selectedAdvisorId ?? undefined,
      }),
    );
  }, [dispatch, tablePage, liveStatusFilter, liveSelectedMonth, selectedAdvisorId]);

  useEffect(() => {
    setTablePage(1);
  }, [liveStatusFilter, liveSelectedMonth, selectedAdvisorId]);

  const liveTotalCount = useMemo(
    () =>
      Object.values(liveStatusCounts || {}).reduce(
        (sum, value) => sum + Number(value || 0),
        0,
      ),
    [liveStatusCounts],
  );

const statusCountMap = (liveStatusCounts ?? {}) as unknown as Record<string, number>;

const countOf = (key: string) => Number(statusCountMap[key] ?? 0);
  const pctNum = (n: number) =>
    liveTotalCount > 0 ? (n / liveTotalCount) * 100 : 0;
  const livePct = (n: number) => pctNum(n).toFixed(1);

  const liveMonthCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MONTH_OPTIONS.forEach((month) => {
      counts[month.value] = 0;
    });
    (liveMonthlyStats || []).forEach((stat) => {
      const statMonth = String(stat.month).split("-")[1];
      if (statMonth && counts[statMonth] !== undefined) {
        counts[statMonth] += Number(stat.leadCount || 0);
      }
    });
    return counts;
  }, [liveMonthlyStats]);

  const selectedAdvisorName = useMemo(() => {
    if (selectedAdvisorId === null) return null;
    return (
      zonesAdvisors?.find((a) => a.id === selectedAdvisorId)?.name ??
      `Advisor ${selectedAdvisorId}`
    );
  }, [selectedAdvisorId, zonesAdvisors]);

  const selectedMonthLabel = useMemo(() => {
    if (!liveSelectedMonth) return null;
    return (
      MONTH_OPTIONS.find((m) => m.value === liveSelectedMonth)?.label ??
      liveSelectedMonth
    );
  }, [liveSelectedMonth]);

  const handleRefresh = () => {
    dispatch(
      fetchMyAssignedLeads({
        page: tablePage,
        status: liveStatusFilter !== "All" ? liveStatusFilter : undefined,
        month: liveSelectedMonth ? parseInt(liveSelectedMonth) : null,
        advisorId: selectedAdvisorId ?? undefined,
      }),
    );
    if (cityIds.length) dispatch(getTodayFollowups({ cityIds } as any));
  };

  const handleReset = () => {
    setLiveStatusFilter("All");
    setLiveSelectedMonth(null);
    setSelectedAdvisorId(null);
    setTablePage(1);
  };

  const scrollToFollowups = () =>
    document
      .getElementById("advisor-followups")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const hasFilters =
    liveStatusFilter !== "All" ||
    liveSelectedMonth !== null ||
    selectedAdvisorId !== null;

  return (
    <div className="relative min-h-screen space-y-5">
      {/* ─── TODAY! WHAT'S MY PLAN? ─── */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/50 p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl leading-none">👋</span>
              <div>
                <h1 className="text-3xl font-bold leading-tight text-slate-900">
                  Hey {currentUser?.aliasName}
                </h1>
                <p className="text-sm text-slate-500">
                  Let’s make today something new. 🚀
                </p>
              </div>
            </div>
            <h2 className="mt-5 text-base font-bold text-slate-900">
              Today! What&apos;s My Plan?
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900">
            <CalendarDays size={16} />
            Today
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <PlanCard
            tone="blue"
            icon={CalendarDays}
            deco={CalendarCheck}
            title="Today's Follow-ups"
            value={todayFollowupsLoading ? "..." : todayFollowupCount}
            sub={
              todayFollowupCount === 0
                ? "No follow-ups today"
                : todayFollowupCount === 1
                  ? "1 follow-up today"
                  : `${todayFollowupCount} follow-ups today`
            }
            cta="View all follow-ups"
            onClick={scrollToFollowups}
          />
          <PlanCard
            tone="green"
            icon={Plane}
            deco={Plane}
            title="Today's Trip Starts"
            value={0}
            sub="Trips starting today"
            cta="View trips"
          />
          <PlanCard
            tone="amber"
            icon={Bell}
            deco={Bell}
            title="Next Reminder"
            value="No reminder"
            sub="Upcoming reminder"
            cta="View calendar"
          />
          <PlanCard
            tone="violet"
            icon={IndianRupee}
            deco={Coins}
            title="Today's Expense Revenue"
            value="₹0"
            sub="Today's total"
            cta="View details"
          />
          <PlanCard
            tone="rose"
            icon={IndianRupee}
            deco={TrendingUp}
            title="Revenue"
            value="₹0"
            sub="Total revenue"
            cta="View report"
          />
        </div>
      </div>

      {/* ─── STATUS OVERVIEW + FOLLOW-UPS ─── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-sky-50/70 p-5 shadow-sm">
          <CardHeader
            icon={Layers}
            title="Lead Status Overview"
            subtitle="Current status of all leads in the pipeline"
            loading={liveLoading}
            right={
              <div className="flex flex-wrap items-center gap-2">
                {zonesAdvisors && zonesAdvisors.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedAdvisorId ?? ""}
                      onChange={(e) =>
                        setSelectedAdvisorId(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className={SELECT_CLS}
                    >
                      <option value="">All Advisors</option>
                      {zonesAdvisors.map((advisor) => (
                        <option key={advisor.id} value={advisor.id}>
                          {advisor.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                )}

                <div className="relative">
                  <select
                    value={liveSelectedMonth ?? ""}
                    onChange={(e) =>
                      setLiveSelectedMonth(e.target.value || null)
                    }
                    className={SELECT_CLS}
                  >
                    <option value="">All Months</option>
                    {MONTH_OPTIONS.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label} ({liveMonthCounts[month.value] ?? 0})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {hasFilters && (
                  <button
                    onClick={handleReset}
                    className="text-xs font-semibold text-blue-600 underline underline-offset-4 hover:text-blue-900"
                  >
                    Reset
                  </button>
                )}

                <button
                  onClick={handleRefresh}
                  title="Refresh"
                  className="rounded-lg bg-blue-600 p-1.5 text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <RefreshCw
                    size={14}
                    className={
                      liveLoading || todayFollowupsLoading ? "animate-spin" : ""
                    }
                  />
                </button>
              </div>
            }
          />

          {selectedAdvisorId !== null && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-blue-700">
                <Users size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total leads – {selectedAdvisorName}
                  {selectedMonthLabel ? ` (${selectedMonthLabel})` : ""}
                </p>
                <p className="text-2xl font-bold leading-tight text-blue-950">
                  {liveLoading ? "…" : liveTotal}
                </p>
              </div>
            </div>
          )}

          {/* Status tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 2xl:grid-cols-8">
            <StatusTile
              label="Total Leads"
              count={liveTotalCount}
              pct={100}
              bg="#E0E7FF"
              text="#3730A3"
              dot="#6366F1"
              icon={Users}
              active={liveStatusFilter === "All" && showTable}
              onClick={() => {
                setLiveStatusFilter("All");
                setShowTable(true);
              }}
            />

            {STATUS_META.map((s) => (
              <StatusTile
                key={s.key}
                label={s.label}
                count={countOf(s.key)}
                pct={pctNum(countOf(s.key))}
                bg={s.tileBg}
                text={s.tileText}
                dot={s.dot}
                icon={STATUS_ICON[s.key] ?? Users}
                active={liveStatusFilter === s.key}
                onClick={() => {
                  setLiveStatusFilter(liveStatusFilter === s.key ? "All" : s.key);
                  setShowTable(true);
                }}
              />
            ))}
          </div>

          {/* Distribution bar + legend */}
          <div className="mt-5 rounded-2xl border border-slate-100 bg-white/70 p-3.5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Pipeline distribution</span>
              <span>{liveTotalCount} leads</span>
            </div>
            <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100">
              {STATUS_META.map((s) => {
                const w = pctNum(countOf(s.key));
                return w > 0 ? (
                  <div
                    key={s.key}
                    title={`${s.label}: ${countOf(s.key)}`}
                    className="rounded-full"
                    style={{ width: `${w}%`, backgroundColor: s.dot }}
                  />
                ) : null;
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUS_META.map((s) => (
                <span
                  key={s.key}
                  className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.dot }}
                  />
                  {s.label}
                  <span className="text-slate-400">
                    {livePct(countOf(s.key))}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          id="advisor-followups"
          className="min-w-0 scroll-mt-4 [&>div:first-child]:h-full"
        >
          <AdvisorFollowupStats selectedAdvisorId={selectedAdvisorId} />
        </div>
      </div>

      {/* ─── LEADS TABLE (opens from a status tile) ─── */}
      {showTable && (
        <div className={CARD}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">
              {liveStatusFilter === "All"
                ? "All leads"
                : `${liveStatusFilter} leads`}
            </p>
            <button
              onClick={() => setShowTable(false)}
              className="text-xs font-semibold text-slate-500 underline underline-offset-4 hover:text-slate-800"
            >
              Hide table
            </button>
          </div>

          <StatusLeadsTable
            leads={liveLeads as LeadRecord[]}
            loading={liveLoading}
            currentPage={tablePage}
            totalPages={liveTotalPages ?? 1}
            total={liveTotal ?? 0}
            onPageChange={setTablePage}
            visibleColumnKeys={[
              "actions",
              "status",
              "cityName",
              "advisorFullName",
              "fullName",
              "customerPhone",
              "pickupDateTime",
              "dropDateTime",
              "passengerTotal",
            ]}
          />
        </div>
      )}

      {/* ─── PASSENGER + LONG DURATION ─── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="min-w-0">
          <HighPaxLeadsTable
            cityIds={cityIds}
            selectedAdvisorId={selectedAdvisorId}
          />
        </div>
        <div className="min-w-0">
          <LongDurationLeadsTable
            cityIds={cityIds}
            selectedAdvisorId={selectedAdvisorId}
          />
        </div>
      </div>
    </div>
  );
}