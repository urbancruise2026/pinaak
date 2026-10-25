"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, X, ChevronDown, ChevronRight } from "lucide-react";
import {
  getAdvisorFollowupStatsApi,
  getAdvisorFollowupDetailsApi,
  AdvisorFollowupStat,
  AdvisorFollowupDetail,
} from "@/features/leads/leadApi";
import { CARD, CardHeader, SELECT_CLS } from "./dashboardShared";

interface AdvisorFollowupStatsProps {
  selectedAdvisorId: number | null;
}

type FollowupFilter = "all" | "due" | "upcoming";

const DONUT_COLORS = [
  "#4F6EF7",
  "#5FA8F5",
  "#F9A8C9",
  "#6FC7B1",
  "#B8E3B0",
  "#A5B4FC",
  "#FDBA74",
  "#C4B5FD",
];

const FILTER_LABEL: Record<FollowupFilter, string> = {
  all: "Total Follow-ups",
  due: "Due Follow-ups",
  upcoming: "Upcoming Follow-ups",
};

const RADIUS = 15.9155; // circumference = 100, so dash values are percentages

export default function AdvisorFollowupStats({
  selectedAdvisorId,
}: AdvisorFollowupStatsProps) {
  const [followupStats, setFollowupStats] = useState<AdvisorFollowupStat[]>([]);
  const [followupStatsLoading, setFollowupStatsLoading] = useState(false);
  const [followupStatsError, setFollowupStatsError] = useState<string | null>(
    null,
  );
  const [followupFilter, setFollowupFilter] = useState<FollowupFilter>("all");

  const [openFollowupAdvisor, setOpenFollowupAdvisor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [followupDetails, setFollowupDetails] = useState<
    AdvisorFollowupDetail[]
  >([]);
  const [followupDetailsLoading, setFollowupDetailsLoading] = useState(false);
  const [followupDetailsError, setFollowupDetailsError] = useState<
    string | null
  >(null);

  const [expandedLeads, setExpandedLeads] = useState<Set<number>>(new Set());

  const toggleExpand = (leadId: number) => {
    setExpandedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  // ─── Fetch advisor-wise follow-up stats ───
  useEffect(() => {
    let cancelled = false;

    const fetchFollowupStats = async () => {
      setFollowupStatsLoading(true);
      setFollowupStatsError(null);
      try {
        const data = await getAdvisorFollowupStatsApi();
        if (!cancelled) setFollowupStats(data);
      } catch (err: any) {
        if (!cancelled)
          setFollowupStatsError(err.message || "Failed to load follow-ups");
      } finally {
        if (!cancelled) setFollowupStatsLoading(false);
      }
    };

    fetchFollowupStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleViewFollowups = async (
    advisorId: number,
    advisorName: string,
  ) => {
    setOpenFollowupAdvisor({ id: advisorId, name: advisorName });
    setFollowupDetailsLoading(true);
    setFollowupDetailsError(null);
    try {
      const data = await getAdvisorFollowupDetailsApi(advisorId);
      setFollowupDetails(data);
    } catch (err: any) {
      setFollowupDetailsError(err.message || "Failed to load follow-ups");
      setFollowupDetails([]);
    } finally {
      setFollowupDetailsLoading(false);
    }
  };

  const closeFollowupModal = () => {
    setOpenFollowupAdvisor(null);
    setFollowupDetails([]);
    setFollowupDetailsError(null);
    setExpandedLeads(new Set());
  };

  const filteredFollowupStats = useMemo(() => {
    if (selectedAdvisorId === null) return followupStats;
    return followupStats.filter((r) => r.advisorId === selectedAdvisorId);
  }, [followupStats, selectedAdvisorId]);

  // Rows sorted by the selected metric, each with a stable donut colour
  const rows = useMemo(() => {
    const valueOf = (r: AdvisorFollowupStat) =>
      followupFilter === "due"
        ? r.pendingFollowups
        : followupFilter === "upcoming"
          ? r.upcomingFollowups
          : r.totalFollowups;

    return filteredFollowupStats
      .map((r) => ({ ...r, value: valueOf(r) }))
      .sort((a, b) => b.value - a.value)
      .map((r, i) => ({ ...r, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [filteredFollowupStats, followupFilter]);

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + r.value, 0),
    [rows],
  );

  const segments = useMemo(() => {
    let acc = 0;
    return rows
      .filter((r) => r.value > 0)
      .map((r) => {
        const pct = (r.value / total) * 100;
        const seg = { id: r.advisorId, color: r.color, pct, offset: acc };
        acc += pct;
        return seg;
      });
  }, [rows, total]);

  // Legend split into columns of 5 (like the design)
  const columns = useMemo(() => {
    const out: (typeof rows)[] = [];
    for (let i = 0; i < rows.length; i += 5) out.push(rows.slice(i, i + 5));
    return out;
  }, [rows]);

  const groupedFollowups = useMemo(() => {
    const groups: Record<
      number,
      {
        lead_id: number;
        fullName: string;
        customerPhone: string;
        status: string;
        entries: AdvisorFollowupDetail[];
        pendingCount: number;
      }
    > = {};

    followupDetails.forEach((f) => {
      if (!groups[f.lead_id]) {
        groups[f.lead_id] = {
          lead_id: f.lead_id,
          fullName: f.fullName,
          customerPhone: f.customerPhone,
          status: f.status,
          entries: [],
          pendingCount: 0,
        };
      }
      groups[f.lead_id].entries.push(f);
      if (f.isPending) groups[f.lead_id].pendingCount += 1;
    });

    Object.values(groups).forEach((g) =>
      g.entries.sort((a, b) => (a.date < b.date ? 1 : -1)),
    );

    return Object.values(groups);
  }, [followupDetails]);

  return (
    <>
      <div className={CARD}>
        <CardHeader
          icon={ListChecks}
          title="Follow-ups by Advisor"
          subtitle="Lead follow-ups set by each advisor"
          loading={followupStatsLoading}
          right={
            <div className="relative">
              <select
                value={followupFilter}
                onChange={(e) =>
                  setFollowupFilter(e.target.value as FollowupFilter)
                }
                className={SELECT_CLS}
              >
                <option value="all">All Follow-ups</option>
                <option value="due">Due</option>
                <option value="upcoming">Upcoming</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          }
        />

        {followupStatsError && (
          <p className="mb-3 text-sm text-red-600">{followupStatsError}</p>
        )}

        {!followupStatsLoading &&
          !followupStatsError &&
          rows.length === 0 && (
            <p className="mb-3 text-sm text-slate-500">
              No follow-ups found.
            </p>
          )}

        {rows.length > 0 && (
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Donut */}
            <div className="relative h-44 w-44 shrink-0">
              <svg viewBox="0 0 42 42" className="h-full w-full -rotate-0">
                <circle
                  cx="21"
                  cy="21"
                  r={RADIUS}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="5"
                />
                {segments.map((s) => {
                  const dash = Math.max(s.pct - 0.8, 0);
                  return (
                    <circle
                      key={s.id}
                      cx="21"
                      cy="21"
                      r={RADIUS}
                      fill="none"
                      stroke={s.color}
                      strokeWidth="5"
                      strokeDasharray={`${dash} ${100 - dash}`}
                      strokeDashoffset={25 - s.offset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="max-w-[5.5rem] text-[11px] leading-tight text-slate-500">
                  {FILTER_LABEL[followupFilter]}
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {total}
                </span>
              </div>
            </div>

            {/* Legend / advisor list */}
            <div className="grid w-full flex-1 grid-cols-1 gap-x-6 sm:grid-cols-2">
              {columns.map((col, ci) => (
                <div key={ci} className="divide-y divide-slate-100">
                  {col.map((a) => (
                    <button
                      key={a.advisorId}
                      onClick={() =>
                        handleViewFollowups(a.advisorId, a.advisorName)
                      }
                      title={`View ${a.advisorName}'s follow-ups`}
                      className="flex w-full items-center gap-2 py-2.5 text-left text-sm hover:bg-slate-50"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: a.color }}
                      />
                      <span className="flex-1 truncate font-medium text-slate-700">
                        {a.advisorName}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {a.value}
                      </span>
                      <span
                        className={`w-14 text-right text-xs font-semibold ${
                          a.pendingFollowups > 0
                            ? "text-orange-600"
                            : "text-emerald-600"
                        }`}
                      >
                        +{a.pendingFollowups} due
                      </span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── FOLLOW-UP DETAILS MODAL ─── */}
      {openFollowupAdvisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">
                Follow-ups: {openFollowupAdvisor.name}
              </h3>
              <button
                onClick={closeFollowupModal}
                className="rounded-md p-1.5 hover:bg-slate-100"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto px-5 py-4">
              {followupDetailsLoading && (
                <p className="text-sm text-slate-500">Loading…</p>
              )}

              {followupDetailsError && (
                <p className="text-sm text-red-600">{followupDetailsError}</p>
              )}

              {!followupDetailsLoading &&
                !followupDetailsError &&
                groupedFollowups.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No follow-ups found.
                  </p>
                )}

              {groupedFollowups.map((g) => {
                const isOpen = expandedLeads.has(g.lead_id);
                return (
                  <div
                    key={g.lead_id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <button
                      onClick={() => toggleExpand(g.lead_id)}
                      className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-slate-100"
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-900">
                          {g.fullName || "Unknown Customer"}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                          {g.customerPhone && <span>📞 {g.customerPhone}</span>}
                          {g.status && <span>Status: {g.status}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          {g.entries.length} follow-up
                          {g.entries.length > 1 ? "s" : ""}
                        </span>
                        {g.pendingCount > 0 && (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                            {g.pendingCount} due
                          </span>
                        )}
                        <ChevronDown
                          size={16}
                          className={`text-slate-500 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="space-y-2 border-t border-slate-200 px-4 pb-3 pt-3">
                        {g.entries.map((f) => (
                          <div
                            key={f.id}
                            className={`rounded-lg border p-2.5 ${
                              f.isPending
                                ? "border-orange-200 bg-orange-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                📅 {f.date}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  f.isPending
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {f.isPending ? "Due" : "Upcoming"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800">{f.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}