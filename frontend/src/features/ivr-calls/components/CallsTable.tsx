"use client";

import React from "react";
import { formatDuration, splitDateTime } from "../ivr.utils";
import type { CallSort, CallSortKey } from "../ivr.types";
import { CallButton, ContactCell, Empty, LeadCell, Pager, TH, TableShell, useIvrState } from "./shared";

interface Props {
  page: number;
  onPage: (p: number) => void;
  sort: CallSort;
  onSort: (s: CallSort) => void;
}

const responseCls = (r: string) =>
  r === "connected"
    ? "bg-green-100 text-green-700"
    : r === "missed"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

// Customer called and nobody picked up = "Missed"; our agent called and it
// did not connect = "Not connected".
const responseLabel = (direction: string, response: string) =>
  response === "missed" ? (direction === "outgoing" ? "Not connected" : "Missed") : response;

const n = (v: number) => Number(v || 0).toLocaleString("en-IN");

const Box: React.FC<{ label: string; value: number; tone: string; children?: React.ReactNode }> = ({ label, value, tone, children }) => (
  <div className={`min-w-[150px] rounded-xl border px-3 py-2 ${tone}`}>
    <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
    <p className="text-2xl font-extrabold leading-tight">{n(value)}</p>
    {children}
  </div>
);

const CallsTable: React.FC<Props> = ({ page, onPage, sort, onSort }) => {
  const { calls, loading } = useIvrState();
  const rows = calls?.items ?? [];
  const st = calls?.stats;
  const th = (key: CallSortKey, label: string, right = false) => (
    <TH
      right={right}
      active={sort.key === key ? sort.order : null}
      onSort={() => onSort({ key, order: sort.key === key && sort.order === "asc" ? "desc" : "asc" })}
    >
      {label}
    </TH>
  );

  return (
    <div className="space-y-3">
      {st && (
        <div className="flex flex-wrap gap-2">
          <Box label="All calls" value={st.total} tone="border-slate-200 bg-white text-slate-900">
            <p className="text-xs text-amber-700">
              Pending <b>{n(st.pending)}</b> <span className="text-slate-500">(missed + not connected)</span>
            </p>
          </Box>
          <Box label="Connected" value={st.connected} tone="border-emerald-200 bg-emerald-50 text-emerald-800" />
          <Box label="With a lead" value={st.withLead} tone="border-blue-200 bg-blue-50 text-blue-800">
            {st.leadByStatus.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {st.leadByStatus.map((l) => (
                  <span key={l.status} className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                    {l.status} {n(l.count)}
                  </span>
                ))}
              </div>
            )}
          </Box>
        </div>
      )}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <TableShell>
        <table className="w-full text-sm">
        <thead>
          <tr>
            {th("date", "Date")}
            <TH>Time</TH>
            <TH>Customer</TH>
            {th("lead", "Lead")}
            {th("direction", "Direction")}
            {th("response", "Response")}
            {th("department", "Department")}
            {th("receivedBy", "Received by")}
            {th("missedBy", "Missed by")}
            <TH right>Duration</TH>
            <TH>Hours</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const { date, time } = splitDateTime(c.callTime);
            return (
              <tr key={c.uid} className="border-t hover:bg-gray-50">
                <td className="whitespace-nowrap px-3 py-2">{date}</td>
                <td className="whitespace-nowrap px-3 py-2">{time}</td>
                <td className="whitespace-nowrap px-3 py-2"><ContactCell phone={c.phone} contact={c.contact} /><CallButton phone={c.phone} /></td>
                <td className="px-3 py-2"><LeadCell contact={c.contact} /></td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${
                      c.direction === "outgoing" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {c.direction}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${responseCls(c.response)}`}>
                    {responseLabel(c.direction, c.response)}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600">{c.via || "-"}</td>
                <td className="px-3 py-2">{c.receivedBy || "-"}</td>
                <td className="px-3 py-2 text-red-600">{c.missedBy || "-"}</td>
                <td className="px-3 py-2 text-right">{formatDuration(c.durationSec)}</td>
                <td className="px-3 py-2">
                  {c.isWorkingHours ? (
                    <span className="text-xs text-green-700">Working</span>
                  ) : (
                    <span className="text-xs text-gray-500">Off-hours</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </TableShell>
      {rows.length === 0 && <Empty loading={loading.calls} />}
      <Pager page={page} limit={calls?.limit ?? 25} total={calls?.total ?? 0} onChange={onPage} />
    </div>
    </div>
  );
};

export default CallsTable;
