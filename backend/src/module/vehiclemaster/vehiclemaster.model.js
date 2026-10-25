import { pool } from "../../config/mySqlDB.js";

export const VEHICLEMASTER_TABLE = "vehiclemaster"; // ✅ correct table name

export const VEHICLEMASTER_COLUMNS = {
  ID: "id",
  NAME: "name",
  CODE: "code",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

export const getVehicles = async () => {
  try {
    const query = `
      SELECT 
        ${VEHICLEMASTER_COLUMNS.CODE},
        ${VEHICLEMASTER_COLUMNS.NAME}
      FROM ${VEHICLEMASTER_TABLE}
      ORDER BY ${VEHICLEMASTER_COLUMNS.ID} DESC
    `;

    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("❌ Error in getVehicles:", error.message);
    throw error;
  }
};

export const getVehicleByCode = async (code) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id FROM vehicle_master WHERE code = ? LIMIT 1`,
      [code],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getVehicleByCode error:", error);
    throw error;
  }
};
// Get vehicle by id
export const getVehicleById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM vehicle_master WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getVehicleById error:", error);
    throw error;
  }
};
// Create vehicle
export const createVehicleModel = async (payload) => {
  try {
    const {
      code,
      seat,
      config,
      category,
      make,
      model,
      variant,
      description,
      amenities,
    } = payload;

    const [result] = await pool.execute(
      `INSERT INTO vehicle_master
        (code, seat, config, category, make, model, variant, description, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        seat,
        config,
        category,
        make,
        model,
        JSON.stringify(variant), // ✅ JSON me store hoga
        description,
        amenities,
      ],
    );

    return {
      id: result.insertId,
      ...payload,
    };
  } catch (error) {
    console.error("createVehicleModel error:", error);
    throw error;
  }
};

// Get all vehicles (with optional search/filter/pagination)
export const getAllVehiclesModel = async ({
  search = "",
  category = "",
  make = "",
  seat = "",
  variant = "",
  page = 1,
  limit = 20,
} = {}) => {
  try {
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM vehicle_master WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM vehicle_master WHERE 1=1`;

    const params = [];
    const countParams = [];

    // ===== SEARCH =====
    if (search) {
      query += `
        AND (
          code LIKE ?
          OR description LIKE ?
          OR amenities LIKE ?
        )
      `;

      countQuery += `
        AND (
          code LIKE ?
          OR description LIKE ?
          OR amenities LIKE ?
        )
      `;

      const likeSearch = `%${search}%`;

      params.push(likeSearch, likeSearch, likeSearch);

      countParams.push(likeSearch, likeSearch, likeSearch);
    }

    // ===== CATEGORY =====
    if (category) {
      const categoryArr = category
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (categoryArr.length > 0) {
        const placeholders = categoryArr.map(() => "?").join(", ");

        query += ` AND category IN (${placeholders})`;
        countQuery += ` AND category IN (${placeholders})`;

        params.push(...categoryArr);
        countParams.push(...categoryArr);
      }
    }

    // ===== MAKE =====
    if (make) {
      query += ` AND make = ?`;
      countQuery += ` AND make = ?`;

      params.push(make);
      countParams.push(make);
    }

    // ===== SEAT =====
    if (seat) {
      const seatArr = seat
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (seatArr.length > 0) {
        const placeholders = seatArr.map(() => "?").join(", ");

        query += ` AND seat IN (${placeholders})`;
        countQuery += ` AND seat IN (${placeholders})`;

        params.push(...seatArr);
        countParams.push(...seatArr);
      }
    }

    // ===== VARIANT JSON =====
    if (variant) {
      const variantArr = variant
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (variantArr.length > 0) {
        const variantConditions = variantArr
          .map(() => `JSON_CONTAINS(variant, JSON_QUOTE(?))`)
          .join(" OR ");

        query += ` AND (${variantConditions})`;
        countQuery += ` AND (${variantConditions})`;

        params.push(...variantArr);
        countParams.push(...variantArr);
      }
    }

    // ===== PAGINATION =====
    query += ` ORDER BY id ASC LIMIT ? OFFSET ?`;

    params.push(Number(limit), Number(offset));

    // ===== EXECUTE =====
    const [rows] = await pool.execute(query, params);

    const [countRows] = await pool.execute(countQuery, countParams);

    return {
      data: rows,
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRows[0].total / Number(limit)),
    };
  } catch (error) {
    console.error("getAllVehiclesModel error:", error);

    throw error;
  }
};

// ✅ NAYA — sirf seat ke distinct DB values ke liye
export const getSeatOptionsModel = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT DISTINCT seat FROM vehicle_master WHERE seat IS NOT NULL AND seat != '' ORDER BY CAST(seat AS UNSIGNED) ASC`,
    );
    return rows.map((r) => r.seat);
  } catch (error) {
    console.error("getSeatOptionsModel error:", error);
    throw error;
  }
};

export const getVehicleVariantByCodeModel = async (code) => {
  try {
    const [rows] = await pool.execute(
      `
        SELECT code, variant
        FROM vehicle_master
        WHERE code = ?
        LIMIT 1
      `,
      [code],
    );

    if (rows.length === 0) {
      return null;
    }

    let variant = rows[0].variant;

    if (typeof variant === "string") {
      variant = variant
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    } else if (!Array.isArray(variant)) {
      variant = [];
    }

    return {
      code: rows[0].code,
      variant,
    };
  } catch (error) {
    console.error("getVehicleVariantByCodeModel error:", error);
    throw error;
  }
};
