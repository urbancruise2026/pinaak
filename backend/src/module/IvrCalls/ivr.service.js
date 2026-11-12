import {
  MYOPERATOR_BASE_URL,
  BACKFILL_DAYS,
  SYNC_INTERVAL_MS,
} from "./ivr.constants.js";
import {
  formatIST,
  istStringToUnix,
  nowIST,
  parseCallTime,
  splitAgents,
  toInt,
} from "./ivr.utils.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  ensureAgents,
  getLatestCallTime,
  upsertCalls,
} from "./ivr.model.js";

/* ------------------------------------------------------------------ */
/* MyOperator client                                                   */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 100; // API maximum

const requireToken = () => {
  // Strip whitespace / accidental quotes from .env values.
  const token = String(process.env.MYOPERATOR_TOKEN ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!token) throw new ApiError(500, "MYOPERATOR_TOKEN is not configured");
  return token;
};

// POST /search. Token goes in the query string (per MyOperator docs).
// NOTE: body encoding (JSON) and response shape must be confirmed against a
// real response - use GET /ivr/debug/sample for that.
export const fetchLogsPage = async ({ fromUnix, toUnix, logFrom = 0, pageSize = PAGE_SIZE }) => {
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
  return [];
};

const get = (obj, ...keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

// Field names are tolerant on purpose (panel export names + common API names).
export const normalizeEntry = (entry) => {
  const o = entry?._source ?? entry; // search-style wrapper

  const uid = get(o, "UID", "uid", "_id", "unique_id", "id") ?? entry?._id;
  const phone = get(o, "Phone", "phone", "caller_number", "caller_number_raw", "number", "customer_number");
  const callTime = parseCallTime(
    get(o, "Timestamp", "timestamp", "call_time", "start_time", "created_at", "time"),
  );
  if (!uid || !phone || !callTime) return null;

  const direction = String(get(o, "Event", "event", "direction", "call_direction") ?? "")
    .trim()
    .toLowerCase();
  const response = String(get(o, "Response", "response", "status", "call_status") ?? "")
    .trim()
    .toLowerCase();

  const missedBy = String(get(o, "Missed By", "missed_by", "missedBy") ?? "").trim();
  const receivedBy = String(get(o, "Received By", "received_by", "receivedBy") ?? "").trim();
  const transferredTo = String(get(o, "Transferred To", "transferred_to") ?? "").trim();

  return {
    uid: String(uid),
    source: get(o, "Source", "source") ?? null,
    callType: get(o, "Type", "type") ?? null,
    phone: String(phone).trim(),
    callTime,
    via: get(o, "Via", "via") ?? null,
    direction,
    response,
    missedBy: missedBy || null,
    receivedBy: receivedBy || null,
    transferredTo: transferredTo || null,
    durationSec: toInt(get(o, "Duration (in seconds)", "duration", "duration_sec", "call_duration"), 0),
    recordingFile: get(o, "recording", "recording_file", "file") ?? null,
    rawJson: JSON.stringify(entry),
    missedAgents: splitAgents(missedBy),
    receivedAgents: splitAgents(receivedBy),
    transferredAgents: splitAgents(transferredTo),
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

    for (let guard = 0; guard < 200; guard++) {
      const json = await fetchLogsPage({ fromUnix, toUnix, logFrom });
      const entries = extractEntries(json);
      if (!entries.length) break;

      const calls = [];
      for (const e of entries) {
        const n = normalizeEntry(e);
        if (n) calls.push(n);
        else skippedEntries++;
      }
      fetched += entries.length;

      if (calls.length) {
        await ensureAgents(calls.flatMap((c) => [...c.missedAgents, ...c.receivedAgents, ...c.transferredAgents]));
        saved += await upsertCalls(calls);
      }

      if (entries.length < PAGE_SIZE) break;
      logFrom += PAGE_SIZE;
    }

    return { from: fromStr, to: toStr, fetched, saved, skippedEntries };
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
  return setInterval(run, SYNC_INTERVAL_MS);
};