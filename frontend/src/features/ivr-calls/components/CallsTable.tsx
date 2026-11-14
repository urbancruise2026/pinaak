"use client";

import React from "react";
import { formatDuration, splitDateTime } from "../ivr.utils";
import { Empty, Pager, TH, TableShell, useIvrState } from "./shared";

interface Props {
  page: number;
  onPage: (p: number) => void;
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

const CallsTable: React.FC<Props> = ({ page, onPage }) => {
  const { calls, loading } = useIvrState();
  const rows = calls?.items ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <TableShell>
        <table className="w-full text-sm">
        <thead>
          <tr>
            <TH>Date</TH>
            <TH>Time</TH>
            <TH>Phone</TH>
            <TH>Direction</TH>
            <TH>Response</TH>
            <TH>Via (IVR route)</TH>
            <TH>Received by</TH>
            <TH>Missed by</TH>
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
                <td className="whitespace-nowrap px-3 py-2 font-mono">{c.phone}</td>
                <td className="px-3 py-2 capitalize">{c.direction}</td>
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
  );
};

export default CallsTable;
