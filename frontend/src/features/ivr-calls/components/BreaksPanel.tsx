"use client";

import React from "react";
import { endMyBreak } from "../ivrSlice";
import { formatMinutes, splitDateTime } from "../ivr.utils";
import { Card, Empty, TH, TableShell, useIvrDispatch, useIvrState, useNotice } from "./shared";

// Break report. Starting / ending your own break is the header button;
// IVR admins can also end anyone's running break here.
const BreaksPanel: React.FC<{ canManage: boolean; onChanged: () => void }> = ({
  canManage,
  onChanged,
}) => {
  const dispatch = useIvrDispatch();
  const notice = useNotice();
  const { breaks, loading } = useIvrState();

  const end = async (agentId: number | null) => {
    if (agentId == null) return;
    try {
      const r = await dispatch(endMyBreak(agentId)).unwrap();
      if (r.warning) notice.error(r.warning);
      else notice.success(`${r.agent} is back`);
      onChanged();
    } catch (e) {
      notice.error(typeof e === "string" ? e : "Failed to end break");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(breaks?.summary ?? []).map((s) => (
          <Card
            key={s.agentId ?? s.agentName}
            label={s.agentName || "Unknown agent"}
            value={formatMinutes(s.totalMinutes)}
            hint={`${s.breaks} break(s), ${s.missedDuringBreak} call(s) missed during break`}
            tone={s.missedDuringBreak > 0 ? "red" : "default"}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <TableShell>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <TH>Agent</TH>
              <TH>Date</TH>
              <TH>Start</TH>
              <TH>End</TH>
              <TH right>Duration</TH>
              <TH right>Missed during break</TH>
              <TH>MyOperator</TH>
              <TH>Pressed by</TH>
              <TH>Reason</TH>
              <TH>{""}</TH>
            </tr>
          </thead>
          <tbody>
            {(breaks?.items ?? []).map((b) => {
              const s = splitDateTime(b.startedAt);
              return (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{b.agentName || "-"}</td>
                  <td className="px-3 py-2">{s.date}</td>
                  <td className="px-3 py-2">{s.time}</td>
                  <td className="px-3 py-2">
                    {b.isOpen ? <span className="text-orange-600">Running</span> : splitDateTime(b.endedAt).time}
                  </td>
                  <td className="px-3 py-2 text-right">{formatMinutes(b.durationMin)}</td>
                  <td className={`px-3 py-2 text-right ${b.missedDuringBreak ? "font-semibold text-red-600" : ""}`}>
                    {b.missedDuringBreak}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span
                      className={
                        b.moState === "blocked" || b.moState === "restored"
                          ? "text-green-700"
                          : b.moState
                            ? "text-red-600"
                            : "text-gray-400"
                      }
                      title={b.moError ?? undefined}
                    >
                      {b.moState ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{b.pressedBy || "-"}</td>
                  <td className="px-3 py-2 text-gray-600">{b.reason || "-"}</td>
                  <td className="px-3 py-2">
                    {canManage && b.isOpen ? (
                      <button
                        type="button"
                        onClick={() => end(b.agentId)}
                        disabled={loading.action}
                        className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        End break
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableShell>
        {(breaks?.items.length ?? 0) === 0 && <Empty loading={loading.breaks} text="No breaks in this range" />}
      </div>
    </div>
  );
};

export default BreaksPanel;
