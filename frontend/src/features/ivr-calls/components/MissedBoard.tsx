"use client";

import React from "react";
import { changeMissedStatus } from "../ivrSlice";
import type { AgentState, FollowupStatus, MissedRow, MissedTab } from "../ivr.types";
import { STATUS_STYLE, formatDuration, splitDateTime } from "../ivr.utils";
import { Card, ContactCell, Empty, LeadCell, Pager, StatusBadge, TH, TableShell, useIvrDispatch, useIvrState, useNotice } from "./shared";

interface Props {
  page: number;
  onPage: (p: number) => void;
  status: MissedTab;
  onStatus: (s: MissedTab) => void;
  canEdit: boolean;
  onChanged: () => void;
}

const TABS: { key: MissedTab; label: string }[] = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "connected", label: "Completed" },
];

const STATE_CLS: Record<AgentState["state"], string> = {
  break: "bg-orange-100 text-orange-800",
  busy: "bg-blue-100 text-blue-800",
  available: "bg-red-100 text-red-700",
};

const time = (v: string | null) => splitDateTime(v).time;

// "Customer called 2x (1 connected 14:05)" / "We called 3x (1 connected 14:10)"
const Tally: React.FC<{ label: string; total: number; connected: number; at: string | null }> = ({
  label,
  total,
  connected,
  at,
}) => (
  <div className="text-xs">
    <span className="text-gray-500">{label}</span>{" "}
    <span className="font-semibold">{total}x</span>
    {total > 0 &&
      (connected > 0 ? (
        <span className="ml-1 text-green-700">
          {connected} connected{at ? ` (first ${time(at)})` : ""}
        </span>
      ) : (
        <span className="ml-1 text-red-600">none connected</span>
      ))}
  </div>
);

const Row: React.FC<{ row: MissedRow; canEdit: boolean; onChanged: () => void }> = ({
  row,
  canEdit,
  onChanged,
}) => {
  const dispatch = useIvrDispatch();
  const notice = useNotice();
  const [busy, setBusy] = React.useState(false);
  const { date, time: t } = splitDateTime(row.callTime);

  const setStatus = async (status: FollowupStatus) => {
    setBusy(true);
    try {
      await dispatch(changeMissedStatus({ uid: row.uid, status })).unwrap();
      notice.success(status === "connected" ? "Marked connected" : "Manual mark cleared");
      onChanged();
    } catch (e) {
      notice.error(typeof e === "string" ? e : "Failed");
    } finally {
      setBusy(false);
    }
  };

  // how the status was decided
  const auto = row.customerConnected > 0 || row.ourConnected > 0;
  const source =
    row.manualStatus === "connected" && !auto
      ? "marked manually"
      : row.followupStatus === "connected"
        ? row.ourConnected > 0
          ? "we reached the customer"
          : "customer was answered when they called again"
        : row.followupStatus === "trying"
          ? "we tried, not connected yet"
          : "no callback yet";

  return (
    <tr className={`border-t border-l-4 ${STATUS_STYLE[row.followupStatus].badge.split(" ")[2]}`}>
      <td className="whitespace-nowrap px-3 py-2">
        {date} <span className="text-gray-500">{t}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-2"><ContactCell phone={row.phone} contact={row.contact} /></td>
      <td className="px-3 py-2"><LeadCell contact={row.contact} /></td>
      <td className="px-3 py-2 text-gray-600">{row.via || "-"}</td>
      <td className="px-3 py-2">
        {row.droppedInIvr ? (
          <span className="text-xs text-orange-700">Dropped in IVR ({formatDuration(row.durationSec)})</span>
        ) : (
          <div className="flex flex-col gap-1">
            {row.agentStates.map((a) => (
              <span
                key={a.agent}
                title={a.detail}
                className={`inline-block rounded px-2 py-0.5 text-xs ${STATE_CLS[a.state]}`}
              >
                <b>{a.agent}</b>: {a.detail}
              </span>
            ))}
          </div>
        )}
        {row.response === "voicemail" && <div className="text-xs text-gray-500">voicemail left</div>}
      </td>
      <td className="px-3 py-2">
        <Tally label="Customer called" total={row.customerCalls} connected={row.customerConnected} at={row.customerConnectedAt} />
        <Tally label="We called" total={row.ourAttempts} connected={row.ourConnected} at={row.ourConnectedAt} />
      </td>
      <td className="px-3 py-2">
        <StatusBadge status={row.followupStatus} />
        <div className="mt-1 text-xs text-gray-500">{source}</div>
      </td>
      <td className="whitespace-nowrap px-3 py-2">
        {canEdit ? (
          <div className="flex gap-1">
            <button
              type="button"
              disabled={busy || row.manualStatus === "connected"}
              onClick={() => setStatus("connected")}
              className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-40"
            >
              Mark connected
            </button>
            {row.manualStatus === "connected" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setStatus("missed")}
                className="rounded border px-2 py-1 text-xs font-semibold text-gray-700 disabled:opacity-40"
              >
                Clear
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">View only</span>
        )}
      </td>
    </tr>
  );
};

const MissedBoard: React.FC<Props> = ({ page, onPage, status, onStatus, canEdit, onChanged }) => {
  const { missed, loading } = useIvrState();
  const c = missed?.counts;
  const rows = missed?.items ?? [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card label="Pending" value={c?.pending ?? 0} hint="missed + trying" tone="red" />
        <Card label="Completed" value={c?.connected ?? 0} hint="customer reached" tone="green" />
      </div>
      <p className="text-xs text-gray-500">
        Status is automatic. Completed (green): a later call to or from the same number connected. Pending: nobody
        has reached the customer yet (red = no callback yet, orange = we tried, not connected).
      </p>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key || "all"}
            type="button"
            onClick={() => onStatus(tab.key)}
            className={`rounded-full border px-3 py-1 text-sm ${
              status === tab.key ? "bg-gray-900 text-white" : "bg-white text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <TableShell>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <TH>Call time</TH>
              <TH>Customer</TH>
              <TH>Lead</TH>
              <TH>Department</TH>
              <TH>Missed by / why</TH>
              <TH>Follow-up calls</TH>
              <TH>Status</TH>
              <TH>Action</TH>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Row key={r.uid} row={r} canEdit={canEdit} onChanged={onChanged} />
            ))}
          </tbody>
        </table>
      </TableShell>
        {rows.length === 0 && <Empty loading={loading.missed} text="No missed calls" />}
        <Pager page={page} limit={missed?.limit ?? 25} total={missed?.total ?? 0} onChange={onPage} />
      </div>
    </div>
  );
};

export default MissedBoard;
