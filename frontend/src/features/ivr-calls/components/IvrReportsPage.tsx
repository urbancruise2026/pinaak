"use client";

import React from "react";
import { BarChart3, Coffee, PhoneCall, PhoneMissed, Users } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { resolveRole } from "@/lib/roles";
import {
  clearIvrError,
  fetchAccess,
  fetchAgents,
  fetchBreakReport,
  fetchCalls,
  fetchMissed,
  fetchSummary,
  runSync,
} from "../ivrSlice";
import type { FollowupStatus, IvrFilters } from "../ivr.types";
import { canManageIvr, defaultFilters, ivrAccessLevel } from "../ivr.utils";
import AgentsPanel from "./AgentsPanel";
import BreakButton from "./BreakButton";
import BreaksPanel from "./BreaksPanel";
import CallsTable from "./CallsTable";
import FiltersBar from "./FiltersBar";
import MissedBoard from "./MissedBoard";
import SummaryPanel from "./SummaryPanel";
import { NoticeProvider, useIvrDispatch, useIvrState, useNotice } from "./shared";

type Tab = "summary" | "missed" | "calls" | "breaks" | "agents";

const TABS: { key: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "summary", label: "Summary", Icon: BarChart3 },
  { key: "missed", label: "Missed calls", Icon: PhoneMissed },
  { key: "calls", label: "All calls", Icon: PhoneCall },
  { key: "breaks", label: "Breaks", Icon: Coffee },
  { key: "agents", label: "Agents", Icon: Users },
];

const Inner: React.FC = () => {
  const dispatch = useIvrDispatch();
  const toast = useNotice();
  const { agents, error, loading, lastSync, missed, access } = useIvrState();

  const currentUser = useSelector((s: RootState) => s.user.currentUser);
  const raw = (currentUser as any) ?? {};
  const userId: number | null = Number(raw?.id ?? raw?.data?.id) || null;
  const role = resolveRole(currentUser);
  const u = raw?.data ?? raw;
  // role + department + sub-department text, e.g. "pre-sales executive sales pre-sales"
  const deptText = [u?.role_name, u?.access_role, u?.role, u?.department_name, u?.department, u?.subDepartment_name, u?.subDepartment]
    .filter(Boolean)
    .join(" ");
  const localLevel = ivrAccessLevel(role, userId, deptText);
  const allowed = localLevel !== "none";
  // backend answer wins once loaded; local rule while loading
  const level = access?.level ?? localLevel;
  const limited = level === "limited";
  // Same people who can view can mark calls (backend enforces the same rule).
  const canEdit = allowed;
  // IVR admin: the backend answer wins, local rule is the fallback while loading.
  const canManage = access?.canManage ?? canManageIvr(role, userId);

  const [tab, setTab] = React.useState<Tab>("missed");
  const visibleTabs = TABS.filter((t) => (limited ? t.key === "missed" || t.key === "calls" : t.key !== "agents" || canManage));
  const [filters, setFilters] = React.useState<IvrFilters>(defaultFilters);
  const [callsPage, setCallsPage] = React.useState(1);
  const [missedPage, setMissedPage] = React.useState(1);
  const [missedStatus, setMissedStatus] = React.useState<FollowupStatus | "">("");

  // agent dropdown list (names as MyOperator reports them)
  React.useEffect(() => {
    if (allowed) {
      dispatch(fetchAgents());
      dispatch(fetchAccess());
    }
  }, [allowed, dispatch]);

  const reload = React.useCallback(() => {
    if (!allowed) return;
    if (tab === "summary") dispatch(fetchSummary(filters));
    if (tab === "calls") dispatch(fetchCalls({ filters, page: callsPage }));
    if (tab === "missed") dispatch(fetchMissed({ filters, page: missedPage, status: missedStatus }));
    if (tab === "breaks") dispatch(fetchBreakReport(filters));
  }, [allowed, tab, filters, callsPage, missedPage, missedStatus, dispatch]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  // refresh the active tab every 60s while the page is open
  React.useEffect(() => {
    const t = setInterval(reload, 60000);
    return () => clearInterval(t);
  }, [reload]);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearIvrError());
    }
  }, [error, dispatch, toast]);

  const onFilters = (next: IvrFilters) => {
    setCallsPage(1);
    setMissedPage(1);
    setFilters(next);
  };

  const sync = async () => {
    try {
      const r = await dispatch(runSync()).unwrap();
      toast.success(r.skipped ? "Sync already running" : `Synced ${r.saved ?? 0} calls`);
      reload();
      dispatch(fetchAgents());
    } catch (e) {
      toast.error(typeof e === "string" ? e : "Sync failed");
    }
  };

  if (!allowed) {
    return <div className="p-8 text-center text-gray-600">You do not have access to IVR reports.</div>;
  }

  const agentNames = (agents?.agents ?? []).filter((a) => a.isActive).map((a) => a.ivrName);
  const redCount = missed?.counts.missed ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* fixed heading: title, actions, filters, tabs */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 pt-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-slate-900">IVR Call Reports</h1>
            <p className="text-xs text-slate-500">
              Times are IST. Working hours 10:00 - 21:30.
              {lastSync && !lastSync.skipped && ` Last manual sync: ${lastSync.saved ?? 0} calls.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BreakButton onChanged={reload} />
            {!limited && (
            <button
              type="button"
              onClick={sync}
              disabled={loading.sync}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.sync ? "Syncing..." : "Sync now"}
            </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <FiltersBar
            value={filters}
            agents={agentNames}
            showDirection={tab === "calls" || tab === "summary"}
            onChange={onFilters}
          />
        </div>

        <div className="mt-3 flex gap-1">
          {visibleTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold ${
                tab === t.key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
              {t.key === "missed" && redCount > 0 && (
                <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{redCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4">
      {tab === "summary" && !limited && <SummaryPanel />}
      {tab === "missed" && (
        <MissedBoard
          page={missedPage}
          onPage={setMissedPage}
          status={missedStatus}
          onStatus={(s) => {
            setMissedPage(1);
            setMissedStatus(s);
          }}
          canEdit={canEdit}
          onChanged={reload}
        />
      )}
      {tab === "calls" && <CallsTable page={callsPage} onPage={setCallsPage} />}
      {tab === "breaks" && !limited && <BreaksPanel canManage={canManage} onChanged={reload} />}
      {tab === "agents" && canManage && <AgentsPanel />}
      </div>
    </div>
  );
};

const IvrReportsPage: React.FC = () => (
  <NoticeProvider>
    <Inner />
  </NoticeProvider>
);

export default IvrReportsPage;
