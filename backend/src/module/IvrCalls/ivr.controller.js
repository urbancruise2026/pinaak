import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  DIRECTIONS,
  FOLLOWUP_STATUS,
  HOURS_FILTERS,
  WORK_START,
  WORK_END,
} from "./ivr.constants.js";
import { isValidDate, nowIST, todayIST, toInt } from "./ivr.utils.js";
import { accessLevel, canManage } from "./ivr.access.js";
import {
  beginBreak,
  calibrateCodes,
  fetchLogsPage,
  finishBreak,
  getMyBreakState,
  listMyOperatorUsers,
  setReceiveCalls,
  syncIvrLogs,
  syncMyOperatorUsers,
} from "./ivr.service.js";
import * as model from "./ivr.model.js";

/* ---------------------------- helpers ---------------------------- */

const staffName = (u) =>
  u.fullName || u.shortName || [u.firstName, u.lastName].filter(Boolean).join(" ") || `Staff ${u.id}`;

// Reads and validates the shared date/agent/hours filters from req.query.
const readFilters = (q) => {
  const today = todayIST();
  const from = q.from || today;
  const to = q.to || from;
  if (!isValidDate(from) || !isValidDate(to)) {
    throw new ApiError(400, "from/to must be YYYY-MM-DD");
  }
  if (from > to) throw new ApiError(400, "from must not be after to");

  const hours = q.hours || "all";
  if (!HOURS_FILTERS.includes(hours)) throw new ApiError(400, "Invalid hours filter");

  const direction = q.direction || undefined;
  if (direction && !DIRECTIONS.includes(direction)) throw new ApiError(400, "Invalid direction");

  return {
    from,
    to,
    hours,
    direction,
    response: q.response ? String(q.response).toLowerCase() : undefined,
    agent: q.agent ? String(q.agent).trim() : undefined,
    search: q.search ? String(q.search).trim() : undefined,
  };
};

const readPaging = (q) => ({
  page: Math.max(toInt(q.page, 1), 1),
  limit: Math.min(Math.max(toInt(q.limit, 25), 1), 100),
});

/* ---------------------------- reports ---------------------------- */

export const getCalls = asyncHandler(async (req, res) => {
  const filters = readFilters(req.query);
  const paging = readPaging(req.query);
  const { total, rows } = await model.getCalls(filters, paging);

  res.json(
    new ApiResponse(
      200,
      {
        items: rows,
        total,
        page: paging.page,
        limit: paging.limit,
        workingHours: { start: WORK_START, end: WORK_END },
      },
      "Calls fetched",
    ),
  );
});

export const getSummary = asyncHandler(async (req, res) => {
  const filters = readFilters(req.query);
  const data = await model.getSummary(filters);
  res.json(new ApiResponse(200, data, "Summary fetched"));
});

/* ------------------------ missed calls --------------------------- */

export const getMissedCalls = asyncHandler(async (req, res) => {
  const filters = readFilters(req.query);
  const paging = readPaging(req.query);

  const status = req.query.status || undefined;
  if (status && !FOLLOWUP_STATUS.includes(status)) throw new ApiError(400, "Invalid status");

  let droppedInIvr;
  if (req.query.droppedInIvr === "true") droppedInIvr = true;
  if (req.query.droppedInIvr === "false") droppedInIvr = false;

  const { total, rows, counts } = await model.getMissedCalls(
    { ...filters, status, droppedInIvr },
    paging,
    nowIST(),
  );

  res.json(
    new ApiResponse(200, { items: rows, total, counts, ...paging }, "Missed calls fetched"),
  );
});

export const updateMissedStatus = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { status, note } = req.body || {};

  if (!FOLLOWUP_STATUS.includes(status)) throw new ApiError(400, "Invalid status");
  if (note && String(note).length > 500) throw new ApiError(400, "Note too long (max 500)");
  if (!(await model.callExists(uid))) throw new ApiError(404, "Call not found");

  await model.setFollowupStatus({
    uid,
    status,
    note: note ? String(note).trim() : null,
    staffId: req.user.id,
    staffName: staffName(req.user),
    nowStr: nowIST(),
  });

  res.json(new ApiResponse(200, { uid, status }, "Status updated"));
});

export const addMissedAttempt = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const note = req.body?.note ? String(req.body.note).trim().slice(0, 500) : null;

  if (!(await model.callExists(uid))) throw new ApiError(404, "Call not found");

  const result = await model.addAttempt({
    uid,
    note,
    staffId: req.user.id,
    staffName: staffName(req.user),
    nowStr: nowIST(),
  });

  res.json(new ApiResponse(200, { uid, ...result }, "Attempt recorded"));
});

export const getMissedAttempts = asyncHandler(async (req, res) => {
  const rows = await model.getAttempts(req.params.uid);
  res.json(new ApiResponse(200, rows, "Attempts fetched"));
});

/* ------------------------- breaks -------------------------------- */

export const getMyBreak = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, await getMyBreakState(req.user.id), "Break state fetched"));
});

export const startMyBreak = asyncHandler(async (req, res) => {
  const reason = req.body?.reason ? String(req.body.reason).trim().slice(0, 255) : null;
  const result = await beginBreak({
    staffId: req.user.id,
    staffName: staffName(req.user),
    agentId: req.body?.agentId,
    reason,
    isManager: canManage(req.user),
  });
  res.status(201).json(new ApiResponse(201, result, result.warning || "Break started"));
});

export const endMyBreak = asyncHandler(async (req, res) => {
  const result = await finishBreak({
    staffId: req.user.id,
    agentId: req.body?.agentId,
    isManager: canManage(req.user),
  });
  res.json(new ApiResponse(200, result, result.warning || "Break ended"));
});

export const getBreakReport = asyncHandler(async (req, res) => {
  const { from, to } = readFilters(req.query);
  const agentId = req.query.agentId ? toInt(req.query.agentId) : undefined;

  const items = await model.getBreaks({ from, to, agentId }, nowIST());

  const byAgent = new Map();
  for (const b of items) {
    const k = b.agentId ?? b.agentName;
    const s = byAgent.get(k) || {
      agentId: b.agentId,
      agentName: b.agentName,
      breaks: 0,
      totalMinutes: 0,
      missedDuringBreak: 0,
    };
    s.breaks += 1;
    s.totalMinutes += b.durationMin;
    s.missedDuringBreak += b.missedDuringBreak;
    byAgent.set(k, s);
  }

  res.json(new ApiResponse(200, { items, summary: [...byAgent.values()] }, "Break report fetched"));
});

/* ------------------------- agents -------------------------------- */

export const getAgents = asyncHandler(async (req, res) => {
  const [agents, staff] = await Promise.all([model.listAgents(), model.getPresalesStaff()]);
  res.json(new ApiResponse(200, { agents, staff }, "Agents fetched"));
});

export const updateAgent = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { staffId, staffName: name, isActive } = req.body || {};
  if (!id) throw new ApiError(400, "Invalid agent id");

  const ok = await model.updateAgent(id, { staffId, staffName: name, isActive });
  if (!ok) throw new ApiError(404, "Agent not found");
  res.json(new ApiResponse(200, null, "Agent updated"));
});

/* --------------------------- sync -------------------------------- */

export const syncNow = asyncHandler(async (req, res) => {
  const { from, to } = req.body || {};
  const result = await syncIvrLogs({
    from: from && isValidDate(from) ? `${from} 00:00:00` : undefined,
    to: to && isValidDate(to) ? `${to} 23:59:59` : undefined,
  });
  res.json(new ApiResponse(200, result, "Sync finished"));
});

// Super-admin only: raw MyOperator response so the field mapping can be
// verified. Token is never returned.
export const debugSample = asyncHandler(async (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  const json = await fetchLogsPage({ fromUnix: now - 86400, toUnix: now, pageSize: 3 });
  res.json(new ApiResponse(200, json, "Raw sample"));
});

// Super-admin only: which numeric event/status codes mean what (see ivr.constants.js).
export const debugCodes = asyncHandler(async (req, res) => {
  const data = await calibrateCodes();
  res.json(new ApiResponse(200, data, "Code calibration"));
});

// Link MyOperator users (uuid) to ivr_agents. Body: { add: ["Teena"] } registers
// agents that have no calls yet.
export const syncMyOperatorUsersCtl = asyncHandler(async (req, res) => {
  const add = Array.isArray(req.body?.add) ? req.body.add : [];
  res.json(new ApiResponse(200, await syncMyOperatorUsers({ add }), "MyOperator users synced"));
});

// Super-admin: raw MyOperator user list (to verify uuid / receive_calls fields).
export const debugMyOperatorUsers = asyncHandler(async (req, res) => {
  const { raw } = await listMyOperatorUsers();
  res.json(new ApiResponse(200, raw, "Raw MyOperator users"));
});

// Super-admin: flip receive_calls for one agent without a break (Postman test).
export const testReceiveCalls = asyncHandler(async (req, res) => {
  const agent = await model.getAgentById(toInt(req.params.id));
  if (!agent) throw new ApiError(404, "Agent not found");
  if (!agent.uuid) throw new ApiError(400, "Agent has no MyOperator uuid - run /agents/sync-myoperator first");
  if (typeof req.body?.enabled !== "boolean") throw new ApiError(400, "enabled (true/false) is required");
  const r = await setReceiveCalls(agent.uuid, req.body.enabled);
  res.json(new ApiResponse(200, { agent: agent.ivrName, enabled: req.body.enabled, myoperator: r }, "receive_calls updated"));
});

/* ------------------- access + admin mapping ----------------------- */

export const getAccess = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { staffId: req.user.id, canManage: canManage(req.user), level: accessLevel(req.user) }, "Access"));
});

export const getAccessMap = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, await model.getAccessMap(), "Access map fetched"));
});

export const putAgentLogins = asyncHandler(async (req, res) => {
  const agentId = toInt(req.params.id);
  const ids = Array.isArray(req.body?.staffIds)
    ? [...new Set(req.body.staffIds.map((n) => toInt(n)).filter((n) => n > 0))]
    : null;
  if (!agentId || !ids) throw new ApiError(400, "agent id and staffIds[] are required");
  if (!(await model.getAgentById(agentId))) throw new ApiError(404, "Agent not found");

  await model.replaceAgentLogins(agentId, ids);
  res.json(new ApiResponse(200, { agentId, staffIds: ids }, "Logins updated"));
});

export const searchStaff = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) return res.json(new ApiResponse(200, [], "Type at least 2 letters"));
  res.json(new ApiResponse(200, await model.searchStaff(q), "Staff found"));
});
