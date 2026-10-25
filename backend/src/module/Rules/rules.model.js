import { hrmsPool, pool } from "../../config/mySqlDB.js";

export const findAdvisorsShiftTimingByZoneIds = async (zoneIds) => {
  try {
    if (!zoneIds || zoneIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 1: Zone -> Access Control IDs
    const placeholders = zoneIds.map(() => "?").join(",");
    const [acRows] = await hrmsPool.query(
      `SELECT DISTINCT access_control_id
       FROM access_control_zones
       WHERE zone_id IN (${placeholders})`,
      zoneIds,
    );

    const accessControlIds = acRows.map((r) => r.access_control_id);

    if (accessControlIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 2: Access Control IDs -> Employee IDs (only role 34 = Travel Advisor)
    const acPlaceholders = accessControlIds.map(() => "?").join(",");
    const [empRows] = await hrmsPool.query(
      `SELECT DISTINCT ac.employee_id
       FROM access_control ac
       INNER JOIN users u ON u.id = ac.employee_id
       WHERE ac.id IN (${acPlaceholders})
         AND u.role_id = 34`,
      accessControlIds,
    );

    const zoneAdvisorIds = empRows.map((r) => r.employee_id);

    if (zoneAdvisorIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 3: Employee IDs -> Advisor Details (name etc.)
    const namePlaceholders = zoneAdvisorIds.map(() => "?").join(",");
    const [advisorUsers] = await hrmsPool.query(
      `SELECT id, aliasName, firstName, middleName, lastName, shiftTiming
       FROM users
       WHERE id IN (${namePlaceholders})
         AND role_id = 34`,
      zoneAdvisorIds,
    );

    const zoneAdvisors = advisorUsers.map((u) => ({
      id: u.id,
      name: `${u.aliasName || ""}`.trim(),
      shiftTiming: u.shiftTiming,
    }));

    return { zoneAdvisorIds, zoneAdvisors };
  } catch (error) {
    console.error("findAdvisorsByZoneIds failed:", error.message);
    return { zoneAdvisorIds: [], zoneAdvisors: [] };
  }
};

export const createRuleEntry = async ({
  type,
  months,
  monthLeads,
  advisorId,
  shiftTiming,
  lead,
  overflow,
}) => {
  const connection = await pool.getConnection();

  try {
    const [result] = await connection.query(
      `INSERT INTO rule_entries
      (
        type,
        months,
        month_leads,
        advisor_id,
        shift_timing,
        lead,
        overflow
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        type,
        JSON.stringify(months),
        JSON.stringify(monthLeads),
        advisorId,
        shiftTiming,
        lead,
        overflow,
      ],
    );

    return { id: result.insertId };
  } finally {
    connection.release();
  }
};

export const getRuleEntries = async ({ advisorIds } = {}) => {
  const whereClauses = [];
  const params = [];

  if (Array.isArray(advisorIds) && advisorIds.length) {
    whereClauses.push(`advisor_id IN (${advisorIds.map(() => "?").join(",")})`);
    params.push(...advisorIds);
  }

  const whereSQL = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";

  const [rows] = await pool.query(
    `SELECT
       id,
       type,
       months,
       month_leads,
       advisor_id AS advisorId,
       shift_timing AS shiftTiming,
       lead,
       overflow
     FROM rule_entries
     ${whereSQL}
     ORDER BY id DESC`,
    params,
  );

  if (rows.length === 0) return [];

  const advisorIdList = [...new Set(rows.map((r) => r.advisorId))].filter(
    (id) => id !== null && id !== undefined,
  );

  let advisorMap = new Map();

  if (advisorIdList.length) {
    const placeholders = advisorIdList.map(() => "?").join(",");

    const [advisorRows] = await hrmsPool.query(
      `SELECT id, aliasName FROM users WHERE id IN (${placeholders})`,
      advisorIdList,
    );

    advisorMap = new Map(advisorRows.map((a) => [a.id, a.aliasName || ""]));
  }

  return rows.map((row) => ({
    ...row,
    advisorName: advisorMap.get(row.advisorId) || "",
    months:
      typeof row.months === "string" ? JSON.parse(row.months) : row.months,
    monthLeads:
      typeof row.month_leads === "string"
        ? JSON.parse(row.month_leads)
        : row.month_leads,
  }));
};
export const updateRuleEntry = async (
  id,
  { type, months, monthLeads, advisorId, shiftTiming, lead, overflow },
) => {
  const [result] = await pool.query(
    `UPDATE rule_entries
     SET
        type = ?,
        months = ?,
        month_leads = ?,
        advisor_id = ?,
        shift_timing = ?,
        lead = ?,
        overflow = ?
     WHERE id = ?`,
    [
      type,
      JSON.stringify(months),
      JSON.stringify(monthLeads),
      advisorId,
      shiftTiming,
      lead,
      overflow,
      id,
    ],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return { id };
};

// DELETE entry
export const deleteRuleEntry = async (id) => {
  const [result] = await pool.query(`DELETE FROM rule_entries WHERE id = ?`, [
    id,
  ]);

  return result.affectedRows > 0;
};
