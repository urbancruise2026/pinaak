import crypto from "node:crypto";
import { hrmsPool, pool } from "../../config/mySqlDB.js";
import bcrypt from "bcrypt";
import { generateUUID } from "../../utils/uuid.js";

export const USER_TABLE = "users";

// Refresh tokens are never stored in plain text. auth_sessions keeps only the
// SHA-256 hex digest (char(64)).
export const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

// Login lookup: auth_credentials (username + password_hash) joined with
// uc_staff (profile / role / active flag). `password` is an alias of
// password_hash so existing callers keep working.
export const findHrmsUserByUserName = async (userName) => {
  try {
    const [rows] = await hrmsPool.execute(
      `SELECT
         u.id,
         u.uuid,
         u.role_id,
         u.is_active,
         acr.username,
         acr.password_hash AS password,
         acr.access_role,
         r.role_name,
         r.role_name AS role
       FROM auth_credentials acr
       INNER JOIN uc_staff u ON u.id = acr.staff_id
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE acr.username = ?
       LIMIT 1`,
      [userName],
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const findVendorByUserName = async (userName) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM vendors WHERE username = ?`,
      [userName],
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const findHrmsUserById = async (id) => {
  try {
    const [rows] = await hrmsPool.execute(
      `SELECT
         u.*,
         u.first_name  AS firstName,
         u.middle_name AS middleName,
         u.last_name   AS lastName,
         u.alias_name  AS aliasName,
         u.short_name  AS shortName,
         acr.username,
         acr.access_role,
         acr.is_online
       FROM uc_staff u
       LEFT JOIN auth_credentials acr ON acr.staff_id = u.id
       WHERE u.id = ?`,
      [id],
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// Best-effort audit trail in login_events. Never throws: a logging failure
// must not break login / logout.
export const recordHrmsLoginEvent = async ({
  staffId = null,
  sessionId = null,
  usernameAttempted = null,
  eventType,
  failureReason = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await hrmsPool.execute(
      `INSERT INTO login_events
         (staff_id, session_id, username_attempted, event_type, failure_reason, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        staffId,
        sessionId,
        usernameAttempted,
        eventType,
        failureReason,
        ipAddress ? String(ipAddress).slice(0, 45) : null,
        userAgent ? String(userAgent).slice(0, 512) : null,
      ],
    );
  } catch (error) {
    console.error("recordHrmsLoginEvent error:", error.message);
  }
};

// Create a login session in auth_sessions (replaces users.refreshToken) and
// stamp auth_credentials.last_login_at. Session expiry matches the 7d JWT.
export const saveHrmsRefreshToken = async (
  userId,
  refreshToken,
  { ipAddress = null, userAgent = null } = {},
) => {
  const connection = await hrmsPool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO auth_sessions
         (staff_id, refresh_token_hash, ip_address, user_agent, last_used_at, expires_at)
       VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [
        userId,
        hashRefreshToken(refreshToken),
        ipAddress ? String(ipAddress).slice(0, 45) : null,
        userAgent ? String(userAgent).slice(0, 512) : null,
      ],
    );

    await connection.execute(
      `UPDATE auth_credentials SET last_login_at = NOW() WHERE staff_id = ?`,
      [userId],
    );

    await connection.commit();
    return { sessionId: result.insertId };
  } catch (error) {
    await connection.rollback();
    console.error("saveHrmsRefreshToken error:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// Logout: revoke the session that owns this refresh token, or every active
// session of the staff member when no token is given.
export const revokeHrmsSessions = async (
  staffId,
  refreshToken = null,
  reason = "logout",
) => {
  if (!staffId) throw new Error("User ID is required");

  try {
    if (refreshToken) {
      await hrmsPool.execute(
        `UPDATE auth_sessions
            SET revoked_at = NOW(), revoked_reason = ?
          WHERE staff_id = ? AND refresh_token_hash = ? AND revoked_at IS NULL`,
        [reason, staffId, hashRefreshToken(refreshToken)],
      );
    } else {
      await hrmsPool.execute(
        `UPDATE auth_sessions
            SET revoked_at = NOW(), revoked_reason = ?
          WHERE staff_id = ? AND revoked_at IS NULL`,
        [reason, staffId],
      );
    }
  } catch (error) {
    console.error("revokeHrmsSessions error:", error);
    throw error;
  }
};

// Online / offline flag now lives in auth_credentials.is_online
export const setHrmsUserOnline = async (staffId, isOnline) => {
  await hrmsPool.execute(
    `UPDATE auth_credentials SET is_online = ? WHERE staff_id = ?`,
    [isOnline ? 1 : 0, staffId],
  );
};

export const saveVendorRefreshToken = async (userId, refreshToken) => {
  try {
    await pool.execute(`UPDATE vendors SET refreshToken = ? WHERE id = ?`, [
      refreshToken,
      userId,
    ]);
  } catch (error) {
    console.error("saveHrmsRefreshToken error:", error);
    throw error;
  }
};

export const USER_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  NAME: "name",
  EMAIL: "email",
  PASSWORD: "password",
  CITY: "city",
  ROLE: "role",
  SUB_DEPARTMENT: "subDepartment_name",
  IS_ACTIVE: "is_active",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

// INSERT USER
export const insertUser = async ({
  name,
  email,
  password,
  city,
  role,
  subDepartment_name,
}) => {
  try {
    const [existing] = await pool.execute(
      `SELECT ${USER_COLUMNS.ID} FROM ${USER_TABLE} WHERE ${USER_COLUMNS.EMAIL} = ?`,
      [email],
    );

    if (existing.length > 0) {
      return null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userUuid = generateUUID();

    const subDepartment = subDepartment_name ?? null;

    const sql = `
      INSERT INTO ${USER_TABLE} 
      (${USER_COLUMNS.UUID}, ${USER_COLUMNS.NAME}, ${USER_COLUMNS.EMAIL}, ${USER_COLUMNS.PASSWORD}, ${USER_COLUMNS.CITY}, ${USER_COLUMNS.ROLE}, ${USER_COLUMNS.SUB_DEPARTMENT})
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      userUuid,
      name,
      email,
      hashedPassword,
      city,
      role,
      subDepartment,
    ]);

    return {
      id: result.insertId,
      uuid: userUuid,
      name,
      email,
      city,
      role,
      subDepartment_name: subDepartment,
    };
  } catch (error) {
    console.error("Insert User Error:", error);
    throw error;
  }
};

// FIND USER BY EMAIL
export const findUserByEmail = async (email) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${USER_TABLE} WHERE ${USER_COLUMNS.EMAIL} = ?`,
      [email],
    );

    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// FIND USER BY UUID
export const findUserByUUID = async (uuid) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${USER_TABLE} WHERE ${USER_COLUMNS.UUID} = ?`,
      [uuid],
    );

    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const findUserById = async (id) => {
  if (!id) throw new Error("User ID is required");

  try {
    const [rows] = await hrmsPool.execute(
      `
      SELECT
        u.*,
        u.first_name  AS firstName,
        u.middle_name AS middleName,
        u.last_name   AS lastName,
        u.alias_name  AS aliasName,
        u.short_name  AS shortName,
        u.sub_department_id AS subDepartment_id,
        r.role_name,
        h.ho_name,
        d.department_name,
        des.subDepartment_name,
        acr.username,
        acr.access_role,
        acr.is_online,
        ct.personal_email AS personalEmail,
        ct.office_email   AS officeEmail,
        ct.mobile,
        emp.branch_id,
        emp.designation,
        emp.grade,
        emp.shift_timing  AS shiftTiming
      FROM uc_staff u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN hos h ON u.ho_id = h.id
      LEFT JOIN sub_department des ON u.sub_department_id = des.id
      LEFT JOIN auth_credentials acr ON acr.staff_id = u.id
      LEFT JOIN uc_staff_contacts ct ON ct.staff_id = u.id
      LEFT JOIN uc_staff_employment emp ON emp.staff_id = u.id
      WHERE u.id = ?
      `,
      [id],
    );

    const user = rows[0];
    if (!user) return null;

    // Get access control data (regions, zones, cities)
    let accessData = {
      region_ids: [],
      region_names: [],
      zone_ids: [],
      zone_names: [],
      city_ids: [],
      city_names: [],
    };

    try {
      const [acRows] = await hrmsPool.execute(
        `SELECT ac.id, ac.subdepartment_id, sd.subDepartment_name
         FROM access_control ac
         LEFT JOIN sub_department sd ON ac.subdepartment_id = sd.id
         WHERE ac.employee_id = ?`,
        [id],
      );

      if (acRows.length > 0) {
        const acId = acRows[0].id;

        // Get regions
        const [regionRows] = await hrmsPool.execute(
          `SELECT r.id, r.region_name 
           FROM access_control_regions acr
           JOIN regions r ON acr.region_id = r.id
           WHERE acr.access_control_id = ?`,
          [acId],
        );
        accessData.region_ids = regionRows.map((r) => r.id);
        accessData.region_names = regionRows.map((r) => r.region_name);

        // Get zones
        const [zoneRows] = await hrmsPool.execute(
          `SELECT z.id, z.zone_name 
           FROM access_control_zones acz
           JOIN zones z ON acz.zone_id = z.id
           WHERE acz.access_control_id = ?`,
          [acId],
        );
        accessData.zone_ids = zoneRows.map((z) => z.id);
        accessData.zone_names = zoneRows.map((z) => z.zone_name);

        // Get cities
        const [cityRows] = await hrmsPool.execute(
          `SELECT c.id, c.city_name 
           FROM access_control_cities acc
           JOIN city c ON acc.city_id = c.id
           WHERE acc.access_control_id = ?`,
          [acId],
        );
        accessData.city_ids = cityRows.map((c) => c.id);
        accessData.city_names = cityRows.map((c) => c.city_name);
      }
    } catch (acError) {
      console.error("Error fetching access control data:", acError);
    }

    return {
      ...user, // ✅ saare columns aa jayenge

      // extra mapped fields (clean naming ke liye)
      role: user.role_name || null,
      department: user.department_name || null,
      subDepartment: user.subDepartment_name || null,

      fullName: [user.shortName].filter(Boolean).join(" "),

      isActive: Boolean(user.is_active),

      // Access control data
      region_ids: accessData.region_ids,
      region_names: accessData.region_names,
      zone_ids: accessData.zone_ids,
      zone_names: accessData.zone_names,
      city_ids: accessData.city_ids,
      city_names: accessData.city_names,
    };
  } catch (error) {
    console.error("findUserById error:", error);
    throw error;
  }
};

// SAVE REFRESH TOKEN
export const saveRefreshToken = async (userId, refreshToken) => {
  await pool.execute(
    `UPDATE ${USER_TABLE} SET refreshToken = ? WHERE ${USER_COLUMNS.ID} = ?`,
    [refreshToken, userId],
  );
};

// GET USERS BY ROLE — reads from HRMS DB (uc_staff + roles + uc_staff_contacts)
export const getUsersByRole = async (role) => {
  try {
    const [rows] = await hrmsPool.execute(
      `SELECT
        u.uuid,
        TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name)) AS name,
        COALESCE(ct.personal_email, ct.office_email) AS email,
        u.sub_department_id AS subDepartment_name,
        r.role_name
       FROM uc_staff u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN uc_staff_contacts ct ON ct.staff_id = u.id
       WHERE LOWER(r.role_name) = LOWER(?)`,
      [role],
    );
    return rows;
  } catch (error) {
    console.error("getUsersByRole error:", error);
    throw error;
  }
};

// SALES USERS WRAPPER
export const getSalesUsers = () => getUsersByRole("sales");

// UPDATE USER
export const updateUserById = async (
  id,
  { name, email, password, city, role, subDepartment_name },
) => {
  try {
    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const subDepartment = subDepartment_name ?? null;

    const sql = `
      UPDATE ${USER_TABLE}
      SET 
        ${USER_COLUMNS.NAME} = ?,
        ${USER_COLUMNS.EMAIL} = ?,
        ${USER_COLUMNS.PASSWORD} = COALESCE(?, ${USER_COLUMNS.PASSWORD}),
        ${USER_COLUMNS.CITY} = ?,
        ${USER_COLUMNS.ROLE} = ?,
        ${USER_COLUMNS.SUB_DEPARTMENT} = ?,
        ${USER_COLUMNS.UPDATED_AT} = NOW()
      WHERE ${USER_COLUMNS.ID} = ?
    `;

    const [result] = await pool.execute(sql, [
      name,
      email,
      hashedPassword,
      city,
      role,
      subDepartment,
      id,
    ]);

    if (result.affectedRows === 0) {
      return null;
    }

    return await findUserById(id);
  } catch (error) {
    console.error("updateUserById error:", error);
    throw error;
  }
};

// Kept for backward compatibility. Passing null (logout) revokes the staff
// member's active sessions; passing a token creates a new session for it.
export const updateUserRefreshToken = async (userId, refreshToken) => {
  if (!userId) throw new Error("User ID is required");

  if (!refreshToken) {
    return revokeHrmsSessions(userId, null, "logout");
  }
  return saveHrmsRefreshToken(userId, refreshToken);
};
