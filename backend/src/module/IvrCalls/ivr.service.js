import {
  MYOPERATOR_BASE_URL,
  BACKFILL_DAYS,
  SYNC_INTERVAL_MS,
  EVENT_MAP,
  STATUS_MAP,
} from "./ivr.constants.js";
import {
  formatIST,
  istStringToUnix,
  nowIST,
  parseCallTime,
  parseDuration,
  splitAgents,
  toInt,
} from "./ivr.utils.js";
import { ApiError } from "../../utils/ApiError.js";
import * as model from "./ivr.model.js";
import { ensureAgents, getLatestCallTime, upsertCalls } from "./ivr.model.js";

/* ------------------------------------------------------------------ */
/* MyOperator client                                                   */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 100; // API maximum

const requireToken = () => {
  // Strip whitespace / accidental quotes from .env values.
  const token = String(process.env.MYOPERATOR_TOKEN ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
  if (!token) throw new ApiError(500, "MYOPERATOR_TOKEN is not configured");
  return token;
};

// POST /search. Token goes in the query string (per MyOperator docs).
// NOTE: body encoding (JSON) and response shape must be confirmed against a
// real response - use GET /ivr/debug/sample for that.
export const fetchLogsPage = async ({ fromUnix, toUnix, logFrom = 0, pageSize = PAGE_SIZE, filters }) => {
  const token = requireToken();
  const url = `${MYOPERATOR_BASE_URL}/search?token=${encodeURIComponent(token)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    // Docs: "token query/body param" - send it in both places.
    body: JSON.stringify({
      token,
      from: String(fromUnix),
      to: String(toUnix),
      log_from: String(logFrom),
      page_size: String(pageSize),
      ...(filters ? { filters: String(filters) } : {}),
    }),
    signal: AbortSignal.timeout(30000),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError(502, `MyOperator returned non-JSON (HTTP ${res.status})`);
  }

  if (!res.ok || json?.status === "error") {
    throw new ApiError(502, `MyOperator error: ${json?.message || json?.code || res.status}`);
  }
  return json;
};

/* ------------------------------------------------------------------ */
/* Normalizing a log entry                                             */
/* ------------------------------------------------------------------ */

// Pull the array of log entries out of a response whatever its nesting.
export const extractEntries = (json) => {
  const d = json?.data ?? json;
  const candidates = [d?.hits, d?.hits?.hits, d?.logs, d?.data, d?.results, d];
  for (const c of candidates) if (Array.isArray(c)) return c;
  const nested = Object.values(d && typeof d === "object" ? d : {}).find(Array.isArray);
  return nested || [];
};

const get = (obj, ...keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

// additional_parameters: [{ky:"unique_id", vl:"cb8..."}] -> { unique_id: "cb8..." }
const paramsOf = (o) =>
  Array.isArray(o?.additional_parameters)
    ? Object.fromEntries(o.additional_parameters.map((p) => [p?.ky, p?.vl]))
    : {};

// log_details = one entry per ring/dial leg:
//   { action: "received" | "missed", received_by: [{name}], transfered_to: [{name}] }
// (for outgoing calls "received_by" is the agent leg that was rung first)
const agentsFromLegs = (o) => {
  const missed = new Set();
  const received = new Set();
  const transferred = new Set();
  const legs = Array.isArray(o?.log_details) ? o.log_details : [];
  for (const leg of legs) {
    const names = (Array.isArray(leg?.received_by) ? leg.received_by : [])
      .map((p) => String(p?.name ?? "").trim())
      .filter(Boolean);
    const action = String(leg?.action ?? "").toLowerCase();
    if (action === "received") names.forEach((n) => received.add(n));
    else if (action === "missed") names.forEach((n) => missed.add(n));
    for (const t of Array.isArray(leg?.transfered_to) ? leg.transfered_to : []) {
      const n = String(t?.name ?? "").trim();
      if (n) transferred.add(n);
    }
  }
  return { missed: [...missed], received: [...received], transferred: [...transferred] };
};

// Real /search entry (confirmed from a live response):
//   { _source: { caller_number, start_time (unix s), duration "HH:MM:SS",
//                type, event, status, department_name, filename,
//                additional_parameters:[{ky:"unique_id",vl}], _dsp:[], _us:[] } }
// event / status are numeric codes -> see EVENT_MAP / STATUS_MAP.
export const normalizeEntry = (entry) => {
  const o = entry?._source ?? entry;
  const params = paramsOf(o);

  const phone = get(o, "caller_number", "caller_number_raw", "Phone", "phone");
  const startRaw = get(o, "start_time", "Timestamp", "timestamp", "call_time");
  const callTime = parseCallTime(startRaw);
  const uid =
    get(params, "unique_id") ??
    get(o, "UID", "uid", "unique_id") ??
    (phone && startRaw ? `${phone}|${startRaw}` : undefined);
  if (!uid || !phone || !callTime) return null;

  const rawEvent = get(o, "event", "Event", "direction");
  const rawStatus = get(o, "status", "Response", "response");
  const direction =
    EVENT_MAP[rawEvent] ??
    (typeof rawEvent === "string" && Number.isNaN(Number(rawEvent))
      ? rawEvent.trim().toLowerCase()
      : `event_${rawEvent ?? "unknown"}`);
  const response =
    STATUS_MAP[rawStatus] ??
    (typeof rawStatus === "string" && Number.isNaN(Number(rawStatus))
      ? rawStatus.trim().toLowerCase()
      : `status_${rawStatus ?? "unknown"}`);

  // Agents come from log_details (one entry per ring/dial leg). Panel-export
  // style fields are still honoured if present.
  const legs = agentsFromLegs(o);
  const uniq = (arr) => [...new Set(arr)];
  const missedAgents = uniq([...legs.missed, ...splitAgents(get(o, "Missed By", "missed_by"))]);
  const receivedAgents = uniq([...legs.received, ...splitAgents(get(o, "Received By", "received_by"))]);
  const transferredAgents = uniq([...legs.transferred, ...splitAgents(get(o, "Transferred To", "transferred_to"))]);

  return {
    uid: String(uid),
    source: get(o, "source", "Source") != null ? String(get(o, "source", "Source")) : null,
    callType: get(o, "type", "Type") != null ? String(get(o, "type", "Type")) : null,
    phone: String(phone).trim(),
    callTime,
    via: get(o, "department_name", "Via", "via") ?? null,
    direction,
    response,
    missedBy: missedAgents.join(", ") || null,
    receivedBy: receivedAgents.join(", ") || null,
    transferredTo: transferredAgents.join(", ") || null,
    durationSec: parseDuration(get(o, "duration", "Duration (in seconds)", "duration_sec")),
    recordingFile: get(o, "filename", "recording", "recording_file") ?? null,
    rawJson: JSON.stringify(entry),
    missedAgents,
    receivedAgents,
    transferredAgents,
  };
};

/* ------------------------------------------------------------------ */
/* Sync                                                                */
/* ------------------------------------------------------------------ */

let syncing = false;

// from / to: IST "YYYY-MM-DD HH:mm:ss" (optional). Default = since the latest
// stored call (minus 1h overlap) or BACKFILL_DAYS on first run.
export const syncIvrLogs = async ({ from, to } = {}) => {
  if (syncing) return { skipped: true, reason: "sync already running" };
  syncing = true;

  try {
    let fromStr = from;
    if (!fromStr) {
      const latest = await getLatestCallTime();
      fromStr = latest
        ? formatIST(new Date((istStringToUnix(latest) - 3600) * 1000))
        : formatIST(new Date(Date.now() - BACKFILL_DAYS * 86400000));
    }
    const toStr = to || nowIST();

    const fromUnix = istStringToUnix(fromStr);
    const toUnix = istStringToUnix(toStr);

    let logFrom = 0;
    let fetched = 0;
    let saved = 0;
    let skippedEntries = 0;
    let skippedSample = null; // first entry we could not map, for debugging

    for (let guard = 0; guard < 200; guard++) {
      const json = await fetchLogsPage({ fromUnix, toUnix, logFrom });
      const entries = extractEntries(json);
      if (!entries.length) break;

      const calls = [];
      for (const e of entries) {
        const n = normalizeEntry(e);
        if (n) calls.push(n);
        else {
          skippedEntries++;
          if (!skippedSample) {
            skippedSample = {
              topLevelKeys: Object.keys(e ?? {}),
              entry: JSON.stringify(e).slice(0, 2500),
            };
          }
        }
      }
      fetched += entries.length;

      if (calls.length) {
        await ensureAgents(calls.flatMap((c) => [...c.missedAgents, ...c.receivedAgents, ...c.transferredAgents]));
        saved += await upsertCalls(calls);
      }

      if (entries.length < PAGE_SIZE) break;
      logFrom += PAGE_SIZE;
    }

    return { from: fromStr, to: toStr, fetched, saved, skippedEntries, skippedSample };
  } finally {
    syncing = false;
  }
};

// Call once from server.js after the DB is connected.
export const startIvrSyncJob = () => {
  if (!process.env.MYOPERATOR_TOKEN) {
    console.warn("⚠️ MYOPERATOR_TOKEN not set - IVR sync job not started");
    return null;
  }
  const run = () =>
    syncIvrLogs().catch((err) => console.error("IVR sync failed:", err.message));
  run();
  setInterval(
    () => breakWatchdog().catch((err) => console.error("IVR break watchdog failed:", err.message)),
    60000,
  );
  return setInterval(run, SYNC_INTERVAL_MS);
};

/* ------------------------------------------------------------------ */
/* Calibration (super-admin debug): learn what the numeric codes mean   */
/* ------------------------------------------------------------------ */

const maskPhones = (str) =>
  str.replace(/("caller_number(?:_raw)?":")([^"]+)(")/g, (m, a, b, c) => `${a}${b.slice(0, -6)}XXXXXX${c}`);

const hasAgentInfo = (e) => {
  const o = e?._source ?? e;
  return (
    (Array.isArray(o?._us) && o._us.length > 0) ||
    (Array.isArray(o?._dsp) && o._dsp.some((d) => d?.name || d?._ag)) ||
    (Array.isArray(o?.log_details) && o.log_details.length > 0)
  );
};

export const fetchFilters = async () => {
  const token = requireToken();
  const res = await fetch(`${MYOPERATOR_BASE_URL}/filters?token=${encodeURIComponent(token)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });
  return res.json();
};

// Asks MyOperator itself: for each named filter (incoming, missed, voicemail...)
// which (type, event, status) codes come back? Also returns one full sample
// entry per code combination (phone numbers masked).
export const calibrateCodes = async () => {
  const toUnix = Math.floor(Date.now() / 1000);
  const fromUnix = toUnix - 7 * 86400;

  const filtersJson = await fetchFilters();
  const list = extractEntries(filtersJson)
    .map((f) => ({
      id: f?.id ?? f?.filter_id,
      name: String(f?.name ?? f?.label ?? f?.keyword ?? f?.title ?? ""),
      parentId: Number(f?.parent_id ?? f?.parentId ?? 1),
    }))
    .filter((f) => f.id !== undefined);

  const wanted = list
    .filter((f) => f.parentId !== 0 && /incoming|outgoing|missed|answer|connect|voicemail|received|transfer|abandon|busy/i.test(f.name))
    .slice(0, 14);

  const combo = (e) => {
    const o = e?._source ?? e;
    return `type=${o?.type}|event=${o?.event}|status=${o?.status}`;
  };

  const byFilter = {};
  const samples = {};

  const absorb = (entries) => {
    const tally = {};
    for (const e of entries) {
      const k = combo(e);
      tally[k] = (tally[k] || 0) + 1;
      if (!samples[k] || (!hasAgentInfo(samples[k]) && hasAgentInfo(e))) samples[k] = e;
    }
    return tally;
  };

  for (const f of wanted) {
    try {
      const json = await fetchLogsPage({ fromUnix, toUnix, filters: f.id, pageSize: 100 });
      byFilter[`${f.name} (id ${f.id})`] = absorb(extractEntries(json));
    } catch (err) {
      byFilter[`${f.name} (id ${f.id})`] = { error: err.message };
    }
  }

  // Unfiltered page too, so combos without a matching filter are still seen.
  const all = extractEntries(await fetchLogsPage({ fromUnix, toUnix, pageSize: 100 }));
  const unfiltered = absorb(all);

  return {
    filterList: list.map((f) => `${f.id}:${f.name}${f.parentId === 0 ? " [group]" : ""}`),
    byFilter,
    unfiltered,
    samples: Object.fromEntries(
      Object.entries(samples)
        .slice(0, 12)
        .map(([k, e]) => [k, maskPhones(JSON.stringify(e)).slice(0, 2800)]),
    ),
  };
};

/* ------------------------------------------------------------------ */
/* MyOperator users + "receive_calls" (break switch)                    */
/* ------------------------------------------------------------------ */

// Feature switch: only when IVR_BREAK_SYNC=true does a Pinaak break actually
// stop calls ringing in MyOperator.
const breakSyncEnabled = () => String(process.env.IVR_BREAK_SYNC || "").toLowerCase() === "true";
const BREAK_MAX_MIN = Number(process.env.IVR_BREAK_MAX_MIN) || 30;
// Refuse a break when no other linked agent would still receive calls.
const KEEP_ONE_AVAILABLE = String(process.env.IVR_BREAK_KEEP_ONE || "true").toLowerCase() !== "false";

const moCall = async (method, path, { query = {}, body } = {}) => {
  const token = requireToken();
  const qs = new URLSearchParams({ token, ...query }).toString();
  const res = await fetch(`${MYOPERATOR_BASE_URL}${path}?${qs}`, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify({ token, ...body }) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError(502, `MyOperator returned non-JSON (HTTP ${res.status})`);
  }
  if (!res.ok || json?.status === "error") {
    throw new ApiError(502, `MyOperator error: ${json?.message || json?.code || json?.status?.message || res.status}`);
  }
  return json;
};

export const listMyOperatorUsers = async () => {
  const json = await moCall("GET", "/user", { query: { _all: "1", "page-size": "100" } });
  return { raw: json, users: extractEntries(json) };
};

const userUuid = (u) => u?.uuid ?? u?.id ?? u?._id;
const userName = (u) => String(u?.name ?? u?.user_name ?? "").trim();

export const setReceiveCalls = (uuid, enabled) =>
  moCall("PUT", "/user", { body: { uuid, receive_calls: enabled ? 1 : 2 } });

// Reads MyOperator users, stores their uuid on matching ivr_agents rows.
// `add` = extra names to register as agents even if they have no calls yet.
export const syncMyOperatorUsers = async ({ add = [] } = {}) => {
  const { users } = await listMyOperatorUsers();
  const addSet = new Set(add.map((n) => String(n).trim().toLowerCase()));

  const toRegister = users.map(userName).filter((n) => n && addSet.has(n.toLowerCase()));
  if (toRegister.length) await ensureAgents(toRegister);

  const linked = [];
  const unmatched = [];
  for (const u of users) {
    const name = userName(u);
    const uuid = userUuid(u);
    if (!name || !uuid) continue;
    const n = await model.setAgentUuidByName(name, uuid);
    (n > 0 ? linked : unmatched).push({ name, uuid });
  }
  return { totalUsers: users.length, linked, unmatched };
};

// Which MyOperator agent does this login mean? A Pinaak login may control
// several agents (admin-managed mapping). IVR admins may act for any agent.
const resolveAgent = async ({ staffId, agentId, isManager, preferOpenBreak = false }) => {
  const mine = await model.getAgentsForLogin(staffId);

  if (agentId) {
    const found = mine.find((a) => a.id === Number(agentId));
    if (found) return found;
    if (isManager) {
      const any = await model.getAgentById(Number(agentId));
      if (any) return any;
    }
    throw new ApiError(403, "This login is not allowed to control that agent");
  }
  if (mine.length === 1) return mine[0];
  if (mine.length === 0) {
    throw new ApiError(
      400,
      "No MyOperator agent is mapped to your login. Ask an IVR admin to map it (Agents tab).",
    );
  }
  if (preferOpenBreak) {
    const open = await model.getOpenBreaksForAgents(mine.map((a) => a.id));
    if (open.length === 1) return mine.find((a) => a.id === open[0].agentId);
  }
  throw new ApiError(400, "Choose which agent this break is for");
};

// State for the break button: agents this login controls + running breaks.
export const getMyBreakState = async (staffId) => {
  const agents = await model.getAgentsForLogin(staffId);
  const open = await model.getOpenBreaksForAgents(agents.map((a) => a.id));
  return {
    syncEnabled: breakSyncEnabled(),
    maxMinutes: BREAK_MAX_MIN,
    agents: agents.map((a) => ({
      id: a.id,
      name: a.ivrName,
      linked: Boolean(a.uuid),
      openBreak: open.find((b) => b.agentId === a.id) || null,
    })),
  };
};

// Break start: switch the agent off in MyOperator (if enabled + linked).
export const beginBreak = async ({ staffId, staffName, agentId, reason, isManager = false }) => {
  const agent = await resolveAgent({ staffId, agentId, isManager });
  if (await model.getOpenBreakForAgent(agent.id)) {
    throw new ApiError(409, `${agent.ivrName} already has a break running`);
  }

  let moState = "off";
  let moError = null;
  let warning = null;

  if (!breakSyncEnabled()) {
    warning =
      "Break recorded only. MyOperator is NOT updated because IVR_BREAK_SYNC is not 'true' on the server.";
  } else if (!agent.uuid) {
    moState = "not_linked";
    warning = `Break recorded, but ${agent.ivrName} is not linked to a MyOperator user - calls will keep ringing.`;
  } else {
    if (KEEP_ONE_AVAILABLE && (await model.countOtherAvailableAgents(agent.id)) === 0) {
      throw new ApiError(409, "No other agent would be left receiving calls - break not allowed");
    }
    try {
      await setReceiveCalls(agent.uuid, false);
      moState = "blocked";
    } catch (err) {
      moState = "failed";
      moError = err.message;
      warning = "Break recorded, but MyOperator was not updated - calls will keep ringing.";
    }
  }

  const id = await model.startBreak({
    agentId: agent.id,
    agentName: agent.ivrName,
    staffId,
    staffName,
    reason,
    nowStr: nowIST(),
    moState,
    moError,
  });
  return { id, agent: agent.ivrName, moState, warning, autoEndMinutes: BREAK_MAX_MIN };
};

// Put the agent back in MyOperator after a break (only if we blocked them).
const restoreAgent = async (breakId, agentId, staffId, moState) => {
  if (!breakSyncEnabled() || !["blocked", "restore_failed"].includes(moState)) {
    return { moState, warning: null };
  }
  const agent = agentId ? await model.getAgentById(agentId) : await model.getAgentByStaffId(staffId);
  if (!agent?.uuid) return { moState: "not_linked", warning: null };
  try {
    await setReceiveCalls(agent.uuid, true);
    await model.updateBreakMo(breakId, "restored");
    return { moState: "restored", warning: null };
  } catch (err) {
    await model.updateBreakMo(breakId, "restore_failed", err.message);
    return {
      moState: "restore_failed",
      warning: "Break ended, but MyOperator could not be restored - retrying automatically every minute.",
    };
  }
};

export const finishBreak = async ({ staffId, agentId, isManager = false }) => {
  const agent = await resolveAgent({ staffId, agentId, isManager, preferOpenBreak: true });
  const open = await model.getOpenBreakForAgent(agent.id);
  if (!open) throw new ApiError(404, `${agent.ivrName} has no running break`);
  await model.endBreakById(open.id, nowIST());
  const r = await restoreAgent(open.id, agent.id, staffId, open.moState);
  return { agent: agent.ivrName, ...r };
};

// Every minute: end over-long breaks, retry failed restores.
export const breakWatchdog = async () => {
  const cutoff = formatIST(new Date(Date.now() - BREAK_MAX_MIN * 60000));
  for (const b of await model.getOpenBreaksStartedBefore(cutoff)) {
    await model.endBreakById(b.id, nowIST());
    await restoreAgent(b.id, b.agentId, b.staffId, b.moState);
  }
  for (const b of await model.getBreaksPendingRestore()) {
    await restoreAgent(b.id, b.agentId, b.staffId, "restore_failed");
  }
};
