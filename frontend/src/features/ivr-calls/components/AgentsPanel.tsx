"use client";

import React from "react";
import { getStaffSearch } from "../ivrApi";
import { fetchAccessMap, linkMyOperatorUsers, saveAgentLogins } from "../ivrSlice";
import type { AccessMapAgent, StaffHit } from "../ivr.types";
import { Empty, TH, useIvrDispatch, useIvrState, useNotice } from "./shared";

type Login = { staffId: number; name: string; roleName: string | null };

const sameIds = (a: Login[], b: Login[]) =>
  a.length === b.length && a.every((x) => b.some((y) => y.staffId === x.staffId));

// One MyOperator agent and the Pinaak logins allowed to control it
// (start / end its break). Needed because people share Pinaak logins.
const AgentRow: React.FC<{ agent: AccessMapAgent }> = ({ agent }) => {
  const dispatch = useIvrDispatch();
  const notice = useNotice();
  const { loading } = useIvrState();
  const [logins, setLogins] = React.useState<Login[]>(agent.logins);
  const [q, setQ] = React.useState("");
  const [hits, setHits] = React.useState<StaffHit[]>([]);

  // reset edits when the saved mapping changes
  React.useEffect(() => setLogins(agent.logins), [agent.logins]);

  React.useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setHits(await getStaffSearch(q.trim()));
      } catch {
        setHits([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const add = (h: StaffHit) => {
    if (!logins.some((l) => l.staffId === h.id)) {
      setLogins([...logins, { staffId: h.id, name: h.name, roleName: h.roleName }]);
    }
    setQ("");
    setHits([]);
  };

  const dirty = !sameIds(logins, agent.logins);

  const save = async () => {
    try {
      await dispatch(saveAgentLogins({ agentId: agent.id, staffIds: logins.map((l) => l.staffId) })).unwrap();
      notice.success(`${agent.ivrName}: logins saved`);
    } catch (e) {
      notice.error(typeof e === "string" ? e : "Failed to save");
    }
  };

  return (
    <tr className="border-t align-top">
      <td className="px-3 py-3 font-medium">{agent.ivrName}</td>
      <td className="px-3 py-3">
        {agent.hasUuid ? (
          <span className="text-green-700">Linked</span>
        ) : (
          <span className="text-red-600">Not linked</span>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {logins.length === 0 && <span className="text-xs text-orange-600">No login can control this agent</span>}
          {logins.map((l) => (
            <span key={l.staffId} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs">
              {l.name} <span className="text-gray-400">#{l.staffId}</span>
              <button
                type="button"
                aria-label={`Remove ${l.name}`}
                onClick={() => setLogins(logins.filter((x) => x.staffId !== l.staffId))}
                className="ml-1 text-gray-500 hover:text-red-600"
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="relative w-64">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Add Pinaak login (type a name)"
            className="w-full rounded border px-2 py-1.5 text-sm"
          />
          {hits.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded border bg-white shadow">
              {hits.map((h) => (
                <li key={h.id}>
                  <button type="button" onClick={() => add(h)} className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50">
                    {h.name} <span className="text-xs text-gray-400">#{h.id} {h.roleName ?? ""}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || loading.map}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Save
        </button>
      </td>
    </tr>
  );
};

// IVR admins only (super admin, admin, SEO TL, staff 62).
const AgentsPanel: React.FC = () => {
  const dispatch = useIvrDispatch();
  const notice = useNotice();
  const { accessMap, loading } = useIvrState();
  const [extra, setExtra] = React.useState("");

  React.useEffect(() => {
    dispatch(fetchAccessMap());
  }, [dispatch]);

  const link = async () => {
    const add = extra
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    try {
      const r = await dispatch(linkMyOperatorUsers(add)).unwrap();
      notice.success(`Linked ${r.linked.length} agent(s); ${r.unmatched.length} MyOperator user(s) not added`);
      setExtra("");
    } catch (e) {
      notice.error(typeof e === "string" ? e : "Failed to link");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">New MyOperator agent names to add (comma separated, optional)</label>
          <input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="e.g. Prema"
            className="w-72 rounded border px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={link}
          disabled={loading.map}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Link MyOperator users
        </button>
        <p className="text-xs text-gray-500">
          Reads your MyOperator users and saves their ids so a break can pause calls.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <TH>MyOperator agent</TH>
              <TH>MyOperator user</TH>
              <TH>Pinaak logins that can control it</TH>
              <TH>{""}</TH>
            </tr>
          </thead>
          <tbody>
            {(accessMap ?? []).map((a) => (
              <AgentRow key={a.id} agent={a} />
            ))}
          </tbody>
        </table>
        {(accessMap?.length ?? 0) === 0 && <Empty loading={loading.map} text="No agents yet - run a sync first" />}
      </div>
    </div>
  );
};

export default AgentsPanel;
