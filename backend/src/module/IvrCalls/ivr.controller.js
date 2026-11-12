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
import { fetchLogsPage, syncIvrLogs } from "./ivr.service.js";
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
  const open = await model.getOpenBreak(req.user.id);
  res.json(new ApiResponse(200, open, "Current break fetched"));
});

export const startMyBreak = asyncHandler(async (req, res) => {
  if (await model.getOpenBreak(req.user.id)) {
    throw new ApiError(409, "A break is already running");
  }
  const reason = req.body?.reason ? String(req.body.reason).trim().slice(0, 255) : null;

  const id = await model.startBreak({
    staffId: req.user.id,
    staffName: staffName(req.user),
    reason,
    nowStr: nowIST(),
  });
  res.status(201).json(new ApiResponse(201, { id }, "Break started"));
});

export const endMyBreak = asyncHandler(async (req, res) => {
  const ok = await model.endBreak({ staffId: req.user.id, nowStr: nowIST() });
  if (!ok) throw new ApiError(404, "No running break");
  res.json(new ApiResponse(200, null, "Break ended"));
});

export const getBreakReport = asyncHandler(async (req, res) => {
  const { from, to } = readFilters(req.query);
  const staffId = req.query.staffId ? toInt(req.query.staffId) : undefined;
  const nowStr = nowIST();

  const items = await model.getBreaks({ from, to, staffId }, nowStr);

  // Per-staff totals for the summary strip.
  const byStaff = new Map();
  for (const b of items) {
    const s = byStaff.get(b.staffId) || {
      staffId: b.staffId,
      staffName: b.staffName,
      breaks: 0,
      totalMinutes: 0,
      missedDuringBreak: 0,
    };
    s.breaks += 1;
    s.totalMinutes += b.durationMin;
    s.missedDuringBreak += b.missedDuringBreak;
    byStaff.set(b.staffId, s);
  }

  res.json(new ApiResponse(200, { items, summary: [...byStaff.values()] }, "Break report fetched"));
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
