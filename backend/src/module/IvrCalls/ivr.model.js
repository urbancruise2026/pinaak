import { hrmsPool, pool } from "../../config/mySqlDB.js";
import { WORK_START, WORK_END } from "./ivr.constants.js";
import { normalizePhone } from "./ivr.utils.js";

// All DATETIME columns are IST wall-clock. Never use NOW() for them (the DB
// session is forced to UTC) - pass IST strings from ivr.utils.js instead.
const FMT = "%Y-%m-%d %H:%i:%s";
const fmt = (col) => `DATE_FORMAT(${col}, '${FMT}')`;

const PRESALES_ROLE_SQL = `(
  LOWER(r.role_name) LIKE '%presale%'
  OR LOWER(r.role_name) LIKE '%pre-sale%'
  OR LOWER(r.role_name) LIKE '%pre sale%'
)`;

/* ------------------------------------------------------------------ */
/* Filters                                                            */
/* ------------------------------------------------------------------ */

// Shared WHERE builder for call_logs alias `c`.
const buildCallFilters = ({
  from,
  to,
  agent,
  direction,
  response,
  hours,
  search,
}) => {
  const where = ["c.call_time BETWEEN ? AND ?"];
  const params = [`${from} 00:00:00`, `${to} 23:59:59`];

  if (direction) {
    where.push("c.direction = ?");
    params.push(direction);
  }
  if (response) {
    where.push("c.response = ?");
    params.push(response);
  }
  if (hours === "working") {
    where.push("TIME(c.call_time) BETWEEN ? AND ?");
    params.push(WORK_START, WORK_END);
  } else if (hours === "non_working") {
    where.push("(TIME(c.call_time) < ? OR TIME(c.call_time) > ?)");
    params.push(WORK_START, WORK_END);
  }
  if (agent) {
    where.push(
      "EXISTS (SELECT 1 FROM ivr_call_agents a WHERE a.call_uid = c.uid AND a.agent_name = ?)",
    );
    params.push(agent);
  }
  const phone = normalizePhone(search);
  if (phone) {
    where.push("c.phone LIKE ?");
    params.push(`%${phone}%`);
  }

  return { where, params };
};

/* ------------------------------------------------------------------ */
/* Sync                                                               */
/* ------------------------------------------------------------------ */

export const getLatestCallTime = async () => {
  const [rows] = await pool.query(
    `SELECT ${fmt("MAX(call_time)")} AS latest FROM ivr_call_logs`,
  );
  return rows[0]?.latest || null;
};

// Bulk upsert one page of normalized calls + their agent rows.
export const upsertCalls = async (calls) => {
  if (!calls.length) return 0;

  const values = calls.map((c) => [
    c.uid,
    c.source,
    c.callType,
    c.phone,
    c.callTime,
    c.via,
    c.direction,
    c.response,
    c.missedBy,
    c.receivedBy,
    c.transferredTo,
    c.durationSec,
    c.recordingFile,
    c.rawJson,
  ]);

  await pool.query(
    `INSERT INTO ivr_call_logs
       (uid, source, call_type, phone, call_time, via, direction, response,
        missed_by, received_by, transferred_to, duration_sec, recording_file, raw_json)
     VALUES ?
     ON DUPLICATE KEY UPDATE
       response = VALUES(response),
       via = VALUES(via),
       missed_by = VALUES(missed_by),
       received_by = VALUES(received_by),
       transferred_to = VALUES(transferred_to),
       duration_sec = VALUES(duration_sec),
       recording_file = VALUES(recording_file),
       raw_json = VALUES(raw_json)`,
    [values],
  );

  // Agent rows are derived data: rebuild them for the uids in this page.
  const uids = calls.map((c) => c.uid);
  await pool.query(`DELETE FROM ivr_call_agents WHERE call_uid IN (?)`, [uids]);

  const agentRows = [];
  for (const c of calls) {
    for (const n of c.missedAgents) agentRows.push([c.uid, n, "missed"]);
    for (const n of c.receivedAgents) agentRows.push([c.uid, n, "received"]);
    for (const n of c.transferredAgents) agentRows.push([c.uid, n, "transferred"]);
  }
  if (agentRows.length) {
    await pool.query(
      `INSERT IGNORE INTO ivr_call_agents (call_uid, agent_name, role) VALUES ?`,
      [agentRows],
    );
  }

  return calls.length;
};

/* ------------------------------------------------------------------ */
/* Agents (MyOperator name -> HRMS staff)                              */
/* ------------------------------------------------------------------ */

// Presales staff from HRMS (used for the mapping dropdown).
export const getPresalesStaff = async () => {
  const [rows] = await hrmsPool.query(
    `SELECT
       u.id,
       TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name)) AS name,
       u.alias_name AS aliasName,
       u.short_name AS shortName
     FROM uc_staff u
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.is_active = 1 AND ${PRESALES_ROLE_SQL}
     ORDER BY name`,
  );
  return rows;
};

// Unique match on alias / short / first name (presales only), else null.
const autoMatchStaff = async (ivrName) => {
  const key = String(ivrName).trim().toLowerCase();
  const [rows] = await hrmsPool.query(
    `SELECT
       u.id,
       TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name)) AS name
     FROM uc_staff u
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.is_active = 1 AND ${PRESALES_ROLE_SQL}
       AND (LOWER(u.alias_name) = ? OR LOWER(u.short_name) = ? OR LOWER(u.first_name) = ?)`,
    [key, key, key],
  );
  return rows.length === 1 ? rows[0] : null;
};

// Register unseen MyOperator agent names; auto-link when the match is unique.
export const ensureAgents = async (names) => {
  const unique = [...new Set(names)].filter(Boolean);
  if (!unique.length) return;

  const [existing] = await pool.query(
    `SELECT ivr_name FROM ivr_agents WHERE ivr_name IN (?)`,
    [unique],
  );
  const known = new Set(existing.map((r) => r.ivr_name));

  for (const name of unique) {
    if (known.has(name)) continue;
    let staff = null;
    try {
      staff = await autoMatchStaff(name);
    } catch (err) {
      console.error("ivr autoMatchStaff error:", err.message);
    }
    await pool.query(
      `INSERT IGNORE INTO ivr_agents (ivr_name, staff_id, staff_name) VALUES (?, ?, ?)`,
      [name, staff?.id ?? null, staff?.name ?? null],
    );
  }
};

export const listAgents = async () => {
  const [rows] = await pool.query(
    `SELECT id, ivr_name AS ivrName, staff_id AS staffId, staff_name AS staffName,
            is_active AS isActive
       FROM ivr_agents ORDER BY ivr_name`,
  );
  return rows;
};

export const updateAgent = async (id, { staffId, staffName, isActive }) => {
  const [result] = await pool.query(
    `UPDATE ivr_agents
        SET staff_id = ?, staff_name = ?, is_active = COALESCE(?, is_active)
      WHERE id = ?`,
    [staffId ?? null, staffName ?? null, isActive === undefined ? null : isActive ? 1 : 0, id],
  );
  return result.affectedRows > 0;
};

/* ------------------------------------------------------------------ */
/* Reports                                                            */
/* ------------------------------------------------------------------ */

export const getCalls = async (filters, { page, limit }) => {
  const { where, params } = buildCallFilters(filters);
  const offset = (page - 1) * limit;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ivr_call_logs c WHERE ${where.join(" AND ")}`,
    params,
  );

  const [rows] = await pool.query(
    `SELECT
       c.uid,
       c.phone,
       ${fmt("c.call_time")} AS callTime,
       c.via,
       c.direction,
       c.response,
       c.missed_by AS missedBy,
       c.received_by AS receivedBy,
       c.transferred_to AS transferredTo,
       c.duration_sec AS durationSec,
       c.recording_file AS recordingFile,
       (TIME(c.call_time) BETWEEN '${WORK_START}' AND '${WORK_END}') AS isWorkingHours
     FROM ivr_call_logs c
     WHERE ${where.join(" AND ")}
     ORDER BY c.call_time DESC
     LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    params,
  );

  return { total, rows };
};

export const getSummary = async (filters) => {
  const { where, params } = buildCallFilters(filters);
  const w = where.join(" AND ");

  const [[totals]] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(c.direction = 'incoming'), 0) AS incoming,
       COALESCE(SUM(c.direction = 'outgoing'), 0) AS outgoing,
       COALESCE(SUM(c.direction = 'incoming' AND c.response = 'connected'), 0) AS incomingConnected,
       COALESCE(SUM(c.direction = 'incoming' AND c.response = 'missed'
                    AND c.missed_by IS NOT NULL AND c.missed_by <> ''), 0) AS incomingMissedByAgent,
       COALESCE(SUM(c.direction = 'incoming' AND c.response = 'missed'
                    AND (c.missed_by IS NULL OR c.missed_by = '')), 0) AS droppedInIvr,
       COALESCE(SUM(c.direction = 'incoming' AND c.response = 'voicemail'), 0) AS voicemail,
       COALESCE(SUM(c.direction = 'outgoing' AND c.response = 'connected'), 0) AS outgoingConnected,
       COALESCE(SUM(c.direction = 'outgoing' AND c.response <> 'connected'), 0) AS outgoingNotConnected,
       COALESCE(SUM(CASE WHEN c.response = 'connected' THEN c.duration_sec ELSE 0 END), 0) AS talkSec,
       COALESCE(SUM(TIME(c.call_time) BETWEEN '${WORK_START}' AND '${WORK_END}'), 0) AS workingHoursCalls,
       COALESCE(SUM(TIME(c.call_time) < '${WORK_START}' OR TIME(c.call_time) > '${WORK_END}'), 0) AS nonWorkingHoursCalls
     FROM ivr_call_logs c
     WHERE ${w}`,
    params,
  );

  // Agent-wise: "received" row on an outgoing call = agent's outbound call
  // connected; "missed" row on an outgoing call = outbound attempt failed.
  const [agents] = await pool.query(
    `SELECT
       a.agent_name AS agentName,
       COALESCE(SUM(a.role = 'received' AND c.direction = 'incoming'), 0) AS incomingAnswered,
       COALESCE(SUM(a.role = 'missed'   AND c.direction = 'incoming'), 0) AS incomingMissed,
       COALESCE(SUM(a.role = 'missed'   AND c.direction = 'incoming' AND c.response <> 'connected'), 0)
         AS incomingMissedNobodyAnswered,
       COALESCE(SUM(a.role = 'received' AND c.direction = 'outgoing'), 0) AS outgoingConnected,
       COALESCE(SUM(a.role = 'missed'   AND c.direction = 'outgoing'), 0) AS outgoingNotConnected,
       COALESCE(SUM(CASE WHEN a.role = 'received' THEN c.duration_sec ELSE 0 END), 0) AS talkSec
     FROM ivr_call_agents a
     JOIN ivr_call_logs c ON c.uid = a.call_uid
     WHERE ${w} AND a.role IN ('missed','received')
     GROUP BY a.agent_name
     ORDER BY a.agent_name`,
    params,
  );

  return { totals, agents };
};

// Incoming missed / voicemail calls + manual follow-up state.
export const getMissedCalls = async (
  { from, to, agent, hours, search, status, droppedInIvr },
  { page, limit },
) => {
  const base = buildCallFilters({ from, to, agent, hours, search });
  const where = [
    ...base.where,
    "c.direction = 'incoming'",
    "c.response IN ('missed','voicemail')",
  ];
  const params = [...base.params];

  if (status) {
    where.push("COALESCE(f.status, 'missed') = ?");
    params.push(status);
  }
  if (droppedInIvr === true) where.push("(c.missed_by IS NULL OR c.missed_by = '')");
  if (droppedInIvr === false) where.push("(c.missed_by IS NOT NULL AND c.missed_by <> '')");

  const w = where.join(" AND ");
  const offset = (page - 1) * limit;
  const from_ = `FROM ivr_call_logs c LEFT JOIN ivr_missed_followups f ON f.call_uid = c.uid`;

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${from_} WHERE ${w}`, params);

  const [rows] = await pool.query(
    `SELECT
       c.uid,
       c.phone,
       ${fmt("c.call_time")} AS callTime,
       c.via,
       c.response,
       c.missed_by AS missedBy,
       c.duration_sec AS durationSec,
       (c.missed_by IS NULL OR c.missed_by = '') AS droppedInIvr,
       COALESCE(f.status, 'missed') AS followupStatus,
       f.note,
       f.updated_by_name AS updatedByName,
       ${fmt("f.updated_at")} AS updatedAt,
       (SELECT COUNT(*) FROM ivr_followup_attempts t WHERE t.call_uid = c.uid) AS attemptCount,
       (SELECT ${fmt("MAX(t.attempted_at)")} FROM ivr_followup_attempts t WHERE t.call_uid = c.uid)
         AS lastAttemptAt,
       -- Hint only (does NOT change the status): a later connected outgoing call to this number.
       (SELECT ${fmt("MIN(o.call_time)")} FROM ivr_call_logs o
          WHERE o.phone = c.phone AND o.direction = 'outgoing'
            AND o.response = 'connected' AND o.call_time > c.call_time) AS callbackConnectedAt
     ${from_}
     WHERE ${w}
     ORDER BY c.call_time DESC
     LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    params,
  );

  const [[counts]] = await pool.query(
    `SELECT
       COALESCE(SUM(COALESCE(f.status,'missed') = 'missed'), 0)    AS missed,
       COALESCE(SUM(COALESCE(f.status,'missed') = 'trying'), 0)    AS trying,
       COALESCE(SUM(COALESCE(f.status,'missed') = 'connected'), 0) AS connected
     ${from_}
     WHERE ${base.where.join(" AND ")} AND c.direction = 'incoming'
       AND c.response IN ('missed','voicemail')`,
    base.params,
  );

  return { total, rows, counts };
};

export const callExists = async (uid) => {
  const [rows] = await pool.query(`SELECT uid FROM ivr_call_logs WHERE uid = ? LIMIT 1`, [uid]);
  return rows.length > 0;
};

export const setFollowupStatus = async ({ uid, status, note, staffId, staffName, nowStr }) => {
  await pool.query(
    `INSERT INTO ivr_missed_followups
       (call_uid, status, note, updated_by_staff_id, updated_by_name, connected_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       note = COALESCE(VALUES(note), note),
       updated_by_staff_id = VALUES(updated_by_staff_id),
       updated_by_name = VALUES(updated_by_name),
       connected_at = IF(VALUES(status) = 'connected', VALUES(connected_at), NULL)`,
    [uid, status, note ?? null, staffId, staffName, status === "connected" ? nowStr : null],
  );
};

// Log one callback attempt; flips status to "trying" unless already connected.
export const addAttempt = async ({ uid, note, staffId, staffName, nowStr }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO ivr_followup_attempts (call_uid, staff_id, staff_name, note, attempted_at)
       VALUES (?, ?, ?, ?, ?)`,
      [uid, staffId, staffName, note ?? null, nowStr],
    );

    await conn.query(
      `INSERT INTO ivr_missed_followups
         (call_uid, status, updated_by_staff_id, updated_by_name)
       VALUES (?, 'trying', ?, ?)
       ON DUPLICATE KEY UPDATE
         status = IF(status = 'connected', status, 'trying'),
         updated_by_staff_id = VALUES(updated_by_staff_id),
         updated_by_name = VALUES(updated_by_name)`,
      [uid, staffId, staffName],
    );

    const [[row]] = await conn.query(
      `SELECT COUNT(*) AS attemptCount FROM ivr_followup_attempts WHERE call_uid = ?`,
      [uid],
    );
    const [[f]] = await conn.query(
      `SELECT status FROM ivr_missed_followups WHERE call_uid = ?`,
      [uid],
    );

    await conn.commit();
    return { attemptCount: row.attemptCount, status: f.status };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getAttempts = async (uid) => {
  const [rows] = await pool.query(
    `SELECT id, staff_id AS staffId, staff_name AS staffName, note,
            ${fmt("attempted_at")} AS attemptedAt
       FROM ivr_followup_attempts WHERE call_uid = ? ORDER BY attempted_at DESC`,
    [uid],
  );
  return rows;
};

/* ------------------------------------------------------------------ */
/* Breaks                                                             */
/* ------------------------------------------------------------------ */

export const getOpenBreak = async (staffId) => {
  const [rows] = await pool.query(
    `SELECT id, staff_id AS staffId, staff_name AS staffName,
            ${fmt("started_at")} AS startedAt, reason
       FROM ivr_breaks WHERE staff_id = ? AND ended_at IS NULL
       ORDER BY id DESC LIMIT 1`,
    [staffId],
  );
  return rows[0] || null;
};

export const startBreak = async ({ staffId, staffName, reason, nowStr }) => {
  const [result] = await pool.query(
    `INSERT INTO ivr_breaks (staff_id, staff_name, started_at, reason) VALUES (?, ?, ?, ?)`,
    [staffId, staffName, nowStr, reason ?? null],
  );
  return result.insertId;
};

export const endBreak = async ({ staffId, nowStr }) => {
  const [result] = await pool.query(
    `UPDATE ivr_breaks SET ended_at = ?
      WHERE staff_id = ? AND ended_at IS NULL
      ORDER BY id DESC LIMIT 1`,
    [nowStr, staffId],
  );
  return result.affectedRows > 0;
};

// Breaks with duration and how many incoming calls this agent missed during it.
export const getBreaks = async ({ from, to, staffId }, nowStr) => {
  const params = [nowStr, nowStr, `${from} 00:00:00`, `${to} 23:59:59`];
  let staffClause = "";
  if (staffId) {
    staffClause = "AND b.staff_id = ?";
    params.push(staffId);
  }

  const [rows] = await pool.query(
    `SELECT
       b.id,
       b.staff_id AS staffId,
       b.staff_name AS staffName,
       ${fmt("b.started_at")} AS startedAt,
       ${fmt("b.ended_at")} AS endedAt,
       (b.ended_at IS NULL) AS isOpen,
       b.reason,
       TIMESTAMPDIFF(MINUTE, b.started_at, COALESCE(b.ended_at, ?)) AS durationMin,
       (SELECT COUNT(DISTINCT c.uid)
          FROM ivr_call_logs c
          JOIN ivr_call_agents a ON a.call_uid = c.uid AND a.role = 'missed'
          JOIN ivr_agents ag ON ag.ivr_name = a.agent_name AND ag.staff_id = b.staff_id
         WHERE c.direction = 'incoming'
           AND c.call_time BETWEEN b.started_at AND COALESCE(b.ended_at, ?)) AS missedDuringBreak
     FROM ivr_breaks b
     WHERE b.started_at BETWEEN ? AND ? ${staffClause}
     ORDER BY b.started_at DESC`,
    params,
  );
  return rows;
};
