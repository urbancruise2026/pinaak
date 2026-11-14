import { hrmsPool, pool } from "../../config/mySqlDB.js";
import { WORK_START, WORK_END } from "./ivr.constants.js";
import { normalizePhone } from "./ivr.utils.js";

// All DATETIME columns are IST wall-clock. Never use NOW() for them (the DB
// session is forced to UTC) - pass IST strings from ivr.utils.js instead.
const FMT = "%Y-%m-%d %H:%i:%s";
const fmt = (col) => `DATE_FORMAT(${col}, '${FMT}')`;

// SUM()/COALESCE(SUM()) come back from mysql2 as DECIMAL strings ("5").
// Convert every numeric-looking value to a real number for the API.
const numberify = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k,
      typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) && /^-?\d+(\.\d+)?$/.test(v)
        ? Number(v)
        : v,
    ]),
  );

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
       direction = VALUES(direction),
       source = VALUES(source),
       call_type = VALUES(call_type),
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
    const [ins] = await pool.query(
      `INSERT IGNORE INTO ivr_agents (ivr_name, staff_id, staff_name) VALUES (?, ?, ?)`,
      [name, staff?.id ?? null, staff?.name ?? null],
    );
    if (ins.insertId && staff?.id) await addLoginMap(staff.id, ins.insertId);
  }
};

export const listAgents = async () => {
  const [rows] = await pool.query(
    `SELECT id, ivr_name AS ivrName, staff_id AS staffId, staff_name AS staffName,
            is_active AS isActive, myoperator_uuid AS myoperatorUuid
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
  if (staffId && result.affectedRows > 0) await addLoginMap(staffId, id);
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

  return {
    totals: numberify(totals),
    agents: agents.map(({ agentName, ...rest }) => ({ agentName, ...numberify(rest) })),
  };
};

// Incoming missed / voicemail calls with AUTOMATIC follow-up tracking.
// For every missed call we look at later calls to/from the same number:
//   customerCalls/customerConnected = the customer called us again (from this call on)
//   ourAttempts/ourConnected        = our agents called the customer back
// Effective status: green if any later call to/from the number connected (or
// someone marked it connected), orange if we tried (or a manual attempt/trying),
// else red. Manual "connected" still overrides.
export const getMissedCalls = async (
  { from, to, agent, hours, search, status, droppedInIvr },
  { page, limit },
  nowStr,
) => {
  const base = buildCallFilters({ from, to, agent, hours, search });
  const where = [
    ...base.where,
    "c.direction = 'incoming'",
    "c.response IN ('missed','voicemail')",
  ];
  const params = [...base.params];
  if (droppedInIvr === true) where.push("(c.missed_by IS NULL OR c.missed_by = '')");
  if (droppedInIvr === false) where.push("(c.missed_by IS NOT NULL AND c.missed_by <> '')");

  const later = (dir, connectedOnly) =>
    `FROM ivr_call_logs x WHERE x.phone = c.phone AND x.direction = '${dir}'
       AND x.call_time ${dir === "incoming" && !connectedOnly ? ">=" : ">"} c.call_time
       ${connectedOnly ? "AND x.response = 'connected'" : ""}`;

  const cte = `
    WITH base AS (
      SELECT
        c.uid, c.phone, c.call_time AS ct,
        ${fmt("c.call_time")} AS callTime,
        c.via, c.response, c.missed_by AS missedBy, c.duration_sec AS durationSec,
        (c.missed_by IS NULL OR c.missed_by = '') AS droppedInIvr,
        f.status AS manualStatus, f.note, f.updated_by_name AS updatedByName,
        ${fmt("f.updated_at")} AS updatedAt,
        (SELECT COUNT(*) FROM ivr_followup_attempts t WHERE t.call_uid = c.uid) AS manualAttempts,
        (SELECT COUNT(*) ${later("incoming", false)}) AS customerCalls,
        (SELECT COUNT(*) ${later("incoming", true)}) AS customerConnected,
        (SELECT ${fmt("MIN(x.call_time)")} ${later("incoming", true)}) AS customerConnectedAt,
        (SELECT COUNT(*) ${later("outgoing", false)}) AS ourAttempts,
        (SELECT COUNT(*) ${later("outgoing", true)}) AS ourConnected,
        (SELECT ${fmt("MIN(x.call_time)")} ${later("outgoing", true)}) AS ourConnectedAt
      FROM ivr_call_logs c
      LEFT JOIN ivr_missed_followups f ON f.call_uid = c.uid
      WHERE ${where.join(" AND ")}
    ),
    eff AS (
      SELECT base.*,
        CASE
          WHEN manualStatus = 'connected' OR customerConnected > 0 OR ourConnected > 0 THEN 'connected'
          WHEN ourAttempts > 0 OR manualAttempts > 0 OR manualStatus = 'trying' THEN 'trying'
          ELSE 'missed'
        END AS followupStatus
      FROM base
    )`;

  const [[counts]] = await pool.query(
    `${cte}
     SELECT
       COALESCE(SUM(followupStatus = 'missed'), 0)    AS missed,
       COALESCE(SUM(followupStatus = 'trying'), 0)    AS trying,
       COALESCE(SUM(followupStatus = 'connected'), 0) AS connected
     FROM eff`,
    params,
  );
  const numCounts = numberify(counts);
  const total = status ? numCounts[status] : numCounts.missed + numCounts.trying + numCounts.connected;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `${cte}
     SELECT eff.* FROM eff
     ${status ? "WHERE followupStatus = ?" : ""}
     ORDER BY ct DESC
     LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    status ? [...params, status] : params,
  );

  // Per missed agent: were they on a break, or on another call, at that moment?
  const states = {};
  const uids = rows.filter((r) => r.missedBy).map((r) => r.uid);
  if (uids.length) {
    const [busy] = await pool.query(
      `SELECT m.call_uid AS callUid, m.agent_name AS agent, o.direction,
              ${fmt("o.call_time")} AS startedAt, o.duration_sec AS durationSec
         FROM ivr_call_agents m
         JOIN ivr_call_logs c ON c.uid = m.call_uid
         JOIN ivr_call_agents oa ON oa.agent_name = m.agent_name AND oa.role = 'received'
         JOIN ivr_call_logs o ON o.uid = oa.call_uid AND o.uid <> c.uid
              AND o.response = 'connected' AND o.call_time <= c.call_time
              AND DATE_ADD(o.call_time, INTERVAL o.duration_sec SECOND) >= c.call_time
        WHERE m.call_uid IN (?) AND m.role = 'missed'`,
      [uids],
    );
    const [brk] = await pool.query(
      `SELECT m.call_uid AS callUid, m.agent_name AS agent,
              ${fmt("b.started_at")} AS startedAt, ${fmt("b.ended_at")} AS endedAt
         FROM ivr_call_agents m
         JOIN ivr_call_logs c ON c.uid = m.call_uid
         JOIN ivr_agents ag ON ag.ivr_name = m.agent_name
         JOIN ivr_breaks b ON (b.agent_id = ag.id OR (b.agent_id IS NULL AND b.staff_id = ag.staff_id))
              AND b.started_at <= c.call_time AND COALESCE(b.ended_at, ?) >= c.call_time
        WHERE m.call_uid IN (?) AND m.role = 'missed'`,
      [nowStr, uids],
    );
    const key = (u, a) => `${u}|${a.toLowerCase()}`;
    const busyMap = new Map(busy.map((r) => [key(r.callUid, r.agent), r]));
    const brkMap = new Map(brk.map((r) => [key(r.callUid, r.agent), r]));
    for (const r of rows) {
      if (!r.missedBy) continue;
      states[r.uid] = String(r.missedBy)
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
        .map((agentName) => {
          const b = brkMap.get(key(r.uid, agentName));
          if (b) {
            return {
              agent: agentName,
              state: "break",
              detail: `On break ${b.startedAt.slice(11, 16)}-${b.endedAt ? b.endedAt.slice(11, 16) : "running"}`,
            };
          }
          const o = busyMap.get(key(r.uid, agentName));
          if (o) {
            return {
              agent: agentName,
              state: "busy",
              detail: `On another ${o.direction} call (${o.startedAt.slice(11, 16)}, ${Math.round(o.durationSec / 60 * 10) / 10} min)`,
            };
          }
          return { agent: agentName, state: "available", detail: "Free - did not pick up" };
        });
    }
  }

  return {
    total,
    counts: numCounts,
    rows: rows.map(({ ct, ...r }) => ({
      ...r,
      droppedInIvr: Number(r.droppedInIvr),
      manualAttempts: Number(r.manualAttempts),
      customerCalls: Number(r.customerCalls),
      customerConnected: Number(r.customerConnected),
      ourAttempts: Number(r.ourAttempts),
      ourConnected: Number(r.ourConnected),
      durationSec: Number(r.durationSec),
      agentStates: states[r.uid] || [],
    })),
  };
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
/* Agents <-> Pinaak logins                                            */
/* ------------------------------------------------------------------ */

export const addLoginMap = async (staffId, agentId) => {
  await pool.query(`INSERT IGNORE INTO ivr_login_map (staff_id, agent_id) VALUES (?, ?)`, [
    staffId,
    agentId,
  ]);
};

// MyOperator agents this Pinaak login may control (admin-managed).
export const getAgentsForLogin = async (staffId) => {
  const [rows] = await pool.query(
    `SELECT a.id, a.ivr_name AS ivrName, a.myoperator_uuid AS uuid
       FROM ivr_login_map m JOIN ivr_agents a ON a.id = m.agent_id
      WHERE m.staff_id = ? AND a.is_active = 1
      ORDER BY a.ivr_name`,
    [staffId],
  );
  return rows;
};

export const getAgentById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, ivr_name AS ivrName, staff_id AS staffId, myoperator_uuid AS uuid
       FROM ivr_agents WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] || null;
};

export const getAgentByStaffId = async (staffId) => {
  const [rows] = await pool.query(
    `SELECT id, ivr_name AS ivrName, staff_id AS staffId, myoperator_uuid AS uuid
       FROM ivr_agents WHERE staff_id = ? AND is_active = 1 LIMIT 1`,
    [staffId],
  );
  return rows[0] || null;
};

export const setAgentUuidByName = async (ivrName, uuid) => {
  const [r] = await pool.query(
    `UPDATE ivr_agents SET myoperator_uuid = ? WHERE LOWER(ivr_name) = LOWER(?)`,
    [uuid, ivrName],
  );
  return r.affectedRows;
};

// Admin screen: every agent with the logins allowed to control it.
export const getAccessMap = async () => {
  const [agents] = await pool.query(
    `SELECT id, ivr_name AS ivrName, (myoperator_uuid IS NOT NULL) AS hasUuid, is_active AS isActive
       FROM ivr_agents ORDER BY ivr_name`,
  );
  const [maps] = await pool.query(`SELECT agent_id AS agentId, staff_id AS staffId FROM ivr_login_map`);
  const names = await getStaffByIds([...new Set(maps.map((m) => m.staffId))]);
  const byId = new Map(names.map((n) => [n.id, n]));
  return agents.map((a) => ({
    ...a,
    hasUuid: Number(a.hasUuid),
    isActive: Number(a.isActive),
    logins: maps
      .filter((m) => m.agentId === a.id)
      .map((m) => ({
        staffId: m.staffId,
        name: byId.get(m.staffId)?.name || `Staff ${m.staffId}`,
        roleName: byId.get(m.staffId)?.roleName || null,
      })),
  }));
};

export const replaceAgentLogins = async (agentId, staffIds) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM ivr_login_map WHERE agent_id = ?`, [agentId]);
    if (staffIds.length) {
      await conn.query(`INSERT IGNORE INTO ivr_login_map (staff_id, agent_id) VALUES ?`, [
        staffIds.map((sid) => [sid, agentId]),
      ]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getStaffByIds = async (ids) => {
  if (!ids.length) return [];
  const [rows] = await hrmsPool.query(
    `SELECT u.id, TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name)) AS name,
            r.role_name AS roleName
       FROM uc_staff u LEFT JOIN roles r ON r.id = u.role_id WHERE u.id IN (?)`,
    [ids],
  );
  return rows;
};

// Any active HRMS employee (admins pick the Pinaak login to map).
export const searchStaff = async (q) => {
  const like = `%${String(q).trim()}%`;
  const [rows] = await hrmsPool.query(
    `SELECT u.id, TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name)) AS name,
            r.role_name AS roleName
       FROM uc_staff u LEFT JOIN roles r ON r.id = u.role_id
      WHERE u.is_active = 1
        AND (CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name) LIKE ?
             OR u.alias_name LIKE ? OR u.short_name LIKE ?)
      ORDER BY name LIMIT 20`,
    [like, like, like],
  );
  return rows;
};

/* ------------------------------------------------------------------ */
/* Breaks (per MyOperator agent)                                       */
/* ------------------------------------------------------------------ */

const OPEN_BREAK_COLS = `b.id, b.agent_id AS agentId, b.staff_id AS staffId, b.staff_name AS staffName,
  ${fmt("b.started_at")} AS startedAt, b.reason, b.mo_state AS moState`;

export const getOpenBreakForAgent = async (agentId) => {
  const [rows] = await pool.query(
    `SELECT ${OPEN_BREAK_COLS} FROM ivr_breaks b
      WHERE b.agent_id = ? AND b.ended_at IS NULL ORDER BY b.id DESC LIMIT 1`,
    [agentId],
  );
  return rows[0] || null;
};

export const getOpenBreaksForAgents = async (agentIds) => {
  if (!agentIds.length) return [];
  const [rows] = await pool.query(
    `SELECT ${OPEN_BREAK_COLS} FROM ivr_breaks b WHERE b.agent_id IN (?) AND b.ended_at IS NULL`,
    [agentIds],
  );
  return rows;
};

export const startBreak = async ({
  agentId,
  agentName,
  staffId,
  staffName,
  reason,
  nowStr,
  moState = null,
  moError = null,
}) => {
  const [result] = await pool.query(
    `INSERT INTO ivr_breaks
       (agent_id, agent_name, staff_id, staff_name, started_at, reason, mo_state, mo_error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [agentId, agentName, staffId, staffName, nowStr, reason ?? null, moState, moError],
  );
  return result.insertId;
};

export const endBreakById = async (id, nowStr) => {
  await pool.query(`UPDATE ivr_breaks SET ended_at = ? WHERE id = ? AND ended_at IS NULL`, [nowStr, id]);
};

export const updateBreakMo = async (id, moState, moError = null) => {
  await pool.query(`UPDATE ivr_breaks SET mo_state = ?, mo_error = ? WHERE id = ?`, [
    moState,
    moError ? String(moError).slice(0, 255) : null,
    id,
  ]);
};

// Other linked agents who would still receive calls if this one goes on break.
export const countOtherAvailableAgents = async (agentId) => {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS n FROM ivr_agents a
      WHERE a.is_active = 1 AND a.myoperator_uuid IS NOT NULL AND a.id <> ?
        AND NOT EXISTS (SELECT 1 FROM ivr_breaks b WHERE b.agent_id = a.id AND b.ended_at IS NULL)`,
    [agentId],
  );
  return Number(row.n);
};

export const getOpenBreaksStartedBefore = async (cutoffStr) => {
  const [rows] = await pool.query(
    `SELECT id, agent_id AS agentId, staff_id AS staffId, mo_state AS moState
       FROM ivr_breaks WHERE ended_at IS NULL AND started_at < ?`,
    [cutoffStr],
  );
  return rows;
};

export const getBreaksPendingRestore = async () => {
  const [rows] = await pool.query(
    `SELECT id, agent_id AS agentId, staff_id AS staffId FROM ivr_breaks
      WHERE mo_state = 'restore_failed' AND ended_at IS NOT NULL`,
  );
  return rows;
};

// Breaks with duration and how many incoming calls the agent missed during it.
export const getBreaks = async ({ from, to, agentId }, nowStr) => {
  const params = [nowStr, nowStr, `${from} 00:00:00`, `${to} 23:59:59`];
  let agentClause = "";
  if (agentId) {
    agentClause = "AND b.agent_id = ?";
    params.push(agentId);
  }

  const [rows] = await pool.query(
    `SELECT
       b.id,
       b.agent_id AS agentId,
       COALESCE(b.agent_name, b.staff_name) AS agentName,
       b.staff_name AS pressedBy,
       ${fmt("b.started_at")} AS startedAt,
       ${fmt("b.ended_at")} AS endedAt,
       (b.ended_at IS NULL) AS isOpen,
       b.reason,
       b.mo_state AS moState,
       b.mo_error AS moError,
       TIMESTAMPDIFF(MINUTE, b.started_at, COALESCE(b.ended_at, ?)) AS durationMin,
       (SELECT COUNT(DISTINCT c.uid)
          FROM ivr_call_logs c
          JOIN ivr_call_agents a ON a.call_uid = c.uid AND a.role = 'missed'
           AND a.agent_name = COALESCE(b.agent_name,
                 (SELECT ivr_name FROM ivr_agents WHERE staff_id = b.staff_id ORDER BY id LIMIT 1))
         WHERE c.direction = 'incoming'
           AND c.call_time BETWEEN b.started_at AND COALESCE(b.ended_at, ?)) AS missedDuringBreak
     FROM ivr_breaks b
     WHERE b.started_at BETWEEN ? AND ? ${agentClause}
     ORDER BY b.started_at DESC`,
    params,
  );
  return rows.map((r) => ({
    ...r,
    isOpen: Number(r.isOpen),
    durationMin: Number(r.durationMin),
    missedDuringBreak: Number(r.missedDuringBreak),
  }));
};
