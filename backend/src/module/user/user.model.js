import { hrmsPool, pool } from "../../config/mySqlDB.js";
import bcrypt from "bcrypt";
import { generateUUID } from "../../utils/uuid.js";

export const USER_TABLE = "users";

export const findHrmsUserByUserName = async (userName) => {
  try {
    const [rows] = await hrmsPool.execute(
      `SELECT * FROM ${USER_TABLE} WHERE username = ?`,
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
      `SELECT * FROM ${USER_TABLE} WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// Save refresh token to HRMS DB user row
export const saveHrmsRefreshToken = async (userId, refreshToken) => {
  try {
    await hrmsPool.execute(
      `UPDATE ${USER_TABLE} SET refreshToken = ? WHERE id = ?`,
      [refreshToken, userId],
    );
  } catch (error) {
    console.error("saveHrmsRefreshToken error:", error);
    throw error;
  }
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
        r.role_name,
        h.ho_name,
        d.department_name,
        des.subDepartment_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN hos h ON u.ho_id = h.id
      LEFT JOIN sub_department des ON u.subDepartment_id = des.id
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

// GET USERS BY ROLE — reads from HRMS DB (users + roles tables)
export const getUsersByRole = async (role) => {
  try {
    const [rows] = await hrmsPool.execute(
      `SELECT
        u.uuid,
        TRIM(CONCAT_WS(' ', u.firstName, u.middleName, u.lastName)) AS name,
        COALESCE(u.personalEmail, u.officeEmail) AS email,
        u.subDepartment_id AS subDepartment_name,
        r.role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
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

export const updateUserRefreshToken = async (userId, refreshToken) => {
  if (!userId) throw new Error("User ID is required");

  try {
    await hrmsPool.execute(
      `
      UPDATE users 
      SET refreshToken = ?
      WHERE id = ?
      `,
      [refreshToken, userId],
    );
  } catch (error) {
    console.error("updateUserRefreshToken error:", error);
    throw error;
  }
};
