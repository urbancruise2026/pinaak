"use client";

import React from "react";
import { endMyBreak, fetchMyBreak, startMyBreak } from "../ivrSlice";
import { formatMinutes, splitDateTime } from "../ivr.utils";
import { useIvrDispatch, useIvrState, useNotice } from "./shared";

const MO_LABEL: Record<string, { text: string; cls: string }> = {
  blocked: { text: "Calls paused in MyOperator", cls: "bg-green-100 text-green-700" },
  restored: { text: "Calls restored", cls: "bg-green-100 text-green-700" },
  off: { text: "MyOperator NOT updated (sync off on server)", cls: "bg-red-100 text-red-700" },
  not_linked: { text: "MyOperator NOT updated (agent not linked)", cls: "bg-red-100 text-red-700" },
  failed: { text: "MyOperator update FAILED", cls: "bg-red-100 text-red-700" },
  restore_failed: { text: "Restore pending - retrying", cls: "bg-orange-100 text-orange-700" },
};

// Break control shown in the page header on every tab. One Pinaak login can
// control several MyOperator agents (admin-managed mapping), so the agent is
// chosen here when there is more than one.
const BreakButton: React.FC<{ onChanged: () => void }> = ({ onChanged }) => {
  const dispatch = useIvrDispatch();
  const notice = useNotice();
  const { me, loading } = useIvrState();
  const [agentId, setAgentId] = React.useState<number | null>(null);
  const [reason, setReason] = React.useState("");
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    dispatch(fetchMyBreak());
    const t = setInterval(() => {
      dispatch(fetchMyBreak());
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(t);
  }, [dispatch]);

  // keep a valid selection
  React.useEffect(() => {
    if (!me?.agents.length) return;
    if (agentId == null || !me.agents.some((a) => a.id === agentId)) {
      const running = me.agents.find((a) => a.openBreak);
      setAgentId((running ?? me.agents[0]).id);
    }
  }, [me, agentId]);

  if (!me) return null;

  if (me.agents.length === 0) {
    return (
      <span className="rounded bg-amber-100 px-3 py-1.5 text-xs text-amber-800">
        No MyOperator agent is mapped to your login - ask an IVR admin (Agents tab).
      </span>
    );
  }

  const agent = me.agents.find((a) => a.id === agentId) ?? me.agents[0];
  const open = agent.openBreak;
  const runningMin = open
    ? Math.max(0, Math.floor((now - Date.parse(`${open.startedAt.replace(" ", "T")}+05:30`)) / 60000))
    : 0;
  const mo = open?.moState ? MO_LABEL[open.moState] : null;

  const run = async (action: () => Promise<{ warning: string | null }>, ok: string) => {
    try {
      const r = await action();
      if (r.warning) notice.error(r.warning);
      else notice.success(ok);
      onChanged();
    } catch (e) {
      notice.error(typeof e === "string" ? e : "Request failed");
    }
  };

  const start = () =>
    run(
      () => dispatch(startMyBreak({ agentId: agent.id, reason: reason.trim() || undefined })).unwrap(),
      `${agent.name} is on break`,
    ).then(() => setReason(""));
  const end = () => run(() => dispatch(endMyBreak(agent.id)).unwrap(), `${agent.name} is back`);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-1.5">
      {me.agents.length > 1 ? (
        <select
          value={agent.id}
          onChange={(e) => setAgentId(Number(e.target.value))}
          className="rounded border px-2 py-1 text-sm"
          aria-label="Agent"
        >
          {me.agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
              {a.openBreak ? " (on break)" : ""}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-sm font-semibold text-gray-700">{agent.name}</span>
      )}

      {open ? (
        <>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            On break since {splitDateTime(open.startedAt).time} ({formatMinutes(runningMin)}, auto-ends at{" "}
            {me.maxMinutes}m)
          </span>
          {mo && <span className={`rounded-full px-2 py-1 text-xs ${mo.cls}`}>{mo.text}</span>}
          <button
            type="button"
            onClick={end}
            disabled={loading.action}
            className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
          >
            End break
          </button>
        </>
      ) : (
        <>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            maxLength={255}
            className="w-40 rounded border px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={start}
            disabled={loading.action}
            className="rounded bg-orange-500 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
          >
            Start break
          </button>
          {!me.syncEnabled && (
            <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
              MyOperator sync is OFF on the server - a break will only be recorded
            </span>
          )}
          {me.syncEnabled && !agent.linked && (
            <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
              Agent not linked to MyOperator - calls will keep ringing
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default BreakButton;
