import { hrmsPool, pool } from "../../config/mySqlDB.js";
import { calculateVehicleAging } from "./vehicleManager.service.js";

// =========================================================
// NEW SCHEMA
//
// vendors(id, vender_code, name, short_name, status, ...)   <- existing table
// vehicle_manager(id, code, vendor_id, variant, veh_no, garage,
//                 city_id, reg_date, status, created_at, updated_at)
// vehicle_amenities(vehicle_id, amenity_code)
// vehicle_master(code, seat, category, config, amenities, ...)   <- unchanged
//
// Removed from vehicle_manager: vendor (text), model, city, aging, amenities
// aging  -> vehicleManager.service.js ke calculateVehicleAging se reg_date par calculate (years.months)
// amenities -> vehicle_amenities table (returned as comma string + array)
// city name -> hrms DB (city table) using city_id
// =========================================================

// Common SELECT used everywhere, so the response shape is always the same
const BASE_SELECT = `
  SELECT
    vm.id,
    vm.code,
    vm.vendor_id,
    v.name AS vendor,
    v.vender_code AS vendor_code,
    vm.variant,
    vm.veh_no,
    vm.garage,
    vm.city_id,
    vm.city_id AS city,
    vm.reg_date,
    vm.status,
    vm.created_at,
    vm.updated_at,
    (
      SELECT GROUP_CONCAT(va.amenity_code ORDER BY va.amenity_code SEPARATOR ',')
      FROM vehicle_amenities va
      WHERE va.vehicle_id = vm.id
    ) AS amenities,
    vmst.seat,
    vmst.category,
    vmst.config
  FROM vehicle_manager vm
  JOIN vendors v ON v.id = vm.vendor_id
  LEFT JOIN vehicle_master vmst ON vm.code = vmst.code
`;

// Amenities can come as array ["MOD","SB"] or string "MOD,SB"
const normalizeAmenities = (amenities) => {
  if (!amenities) return [];

  const list = Array.isArray(amenities)
    ? amenities
    : String(amenities).split(",");

  return [...new Set(list.map((a) => String(a).trim()).filter(Boolean))];
};

// vendors table mein same naam ke kai vendor ho sakte hain (name UNIQUE nahi hai),
// isliye vendor sirf vendor_id se resolve hota hai, naam se nahi
const resolveVendorId = async (conn, { vendor_id }) => {
  if (!vendor_id) throw new Error("Valid vendor_id is required");

  const [rows] = await conn.execute(
    `SELECT id FROM vendors WHERE id = ? LIMIT 1`,
    [Number(vendor_id)],
  );

  if (!rows[0]) throw new Error("Valid vendor_id is required");

  return rows[0].id;
};

const replaceAmenities = async (conn, vehicleId, amenities) => {
  await conn.execute(`DELETE FROM vehicle_amenities WHERE vehicle_id = ?`, [
    vehicleId,
  ]);

  const codes = normalizeAmenities(amenities);

  if (codes.length > 0) {
    await conn.query(
      `INSERT IGNORE INTO vehicle_amenities (vehicle_id, amenity_code) VALUES ?`,
      [codes.map((code) => [vehicleId, code])],
    );
  }
};

const attachCityNames = async (rows) => {
  const cityIds = [
    ...new Set(
      rows
        .map((r) => r.city_id)
        .filter((id) => id !== null && id !== undefined && id !== ""),
    ),
  ];

  let cityMap = {};

  if (cityIds.length > 0) {
    const placeholders = cityIds.map(() => "?").join(",");

    const [cityRows] = await hrmsPool.execute(
      `SELECT id, city_name FROM city WHERE id IN (${placeholders})`,
      cityIds,
    );

    cityMap = cityRows.reduce((acc, c) => {
      acc[c.id] = c.city_name;
      return acc;
    }, {});
  }

  return rows.map((row) => ({
    ...row,
    city_name: cityMap[row.city_id] ?? null,
    aging: calculateVehicleAging(row.reg_date),
    amenities_list: row.amenities ? row.amenities.split(",") : [],
  }));
};

export const getVehicleManagerByVehNo = async (veh_no) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id FROM vehicle_manager WHERE veh_no = ? LIMIT 1`,
      [veh_no],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getVehicleManagerByVehNo error:", error);
    throw error;
  }
};

export const getVehicleManagerById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `${BASE_SELECT} WHERE vm.id = ? LIMIT 1`,
      [id],
    );

    if (!rows[0]) return null;

    const [vehicle] = await attachCityNames([rows[0]]);

    return {
      ...vehicle,
      status: vehicle.status ?? "Active",
    };
  } catch (error) {
    console.error("getVehicleManagerById error:", error);
    throw error;
  }
};

export const createVehicleManagerModel = async (payload) => {
  const conn = await pool.getConnection();

  try {
    const {
      code,
      vendor_id,
      vendor,
      variant,
      veh_no,
      garage,
      city_id,
      city,
      reg_date,
      amenities,
      status,
    } = payload;

    await conn.beginTransaction();

    const finalVendorId = await resolveVendorId(conn, { vendor_id, vendor });

    const [result] = await conn.execute(
      `INSERT INTO vehicle_manager
        (code, vendor_id, variant, veh_no, garage, city_id, reg_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        finalVendorId,
        variant || null,
        veh_no,
        garage || null,
        city_id || city || null,
        reg_date,
        status || "Active",
      ],
    );

    await replaceAmenities(conn, result.insertId, amenities);

    await conn.commit();

    return await getVehicleManagerById(result.insertId);
  } catch (error) {
    await conn.rollback();
    console.error("createVehicleManagerModel error:", error);
    throw error;
  } finally {
    conn.release();
  }
};

export const updateVehicleManagerModel = async (id, payload) => {
  const conn = await pool.getConnection();

  try {
    const {
      code,
      vendor_id,
      vendor,
      variant,
      veh_no,
      garage,
      city_id,
      city,
      reg_date,
      amenities,
    } = payload;

    await conn.beginTransaction();

    const finalVendorId = await resolveVendorId(conn, { vendor_id, vendor });

    const [result] = await conn.execute(
      `UPDATE vehicle_manager
       SET code = ?, vendor_id = ?, variant = ?, veh_no = ?,
           garage = ?, city_id = ?, reg_date = ?
       WHERE id = ?`,
      [
        code,
        finalVendorId,
        variant || null,
        veh_no,
        garage || null,
        city_id || city || null,
        reg_date,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return null;
    }

    // amenities key aayi hi nahi to purani amenities as-it-is rahengi
    if (amenities !== undefined) {
      await replaceAmenities(conn, id, amenities);
    }

    await conn.commit();

    return await getVehicleManagerById(id);
  } catch (error) {
    await conn.rollback();
    console.error("updateVehicleManagerModel error:", error);
    throw error;
  } finally {
    conn.release();
  }
};

export const getAllVehicleManagersModel = async ({
  search = "",
  vendor = "",
  garage = "",
  city = "",
  year = "",
  seat = "",
  variant = "",
  category = "",
  code = "",
  page = 1,
  limit = 20,
} = {}) => {
  try {
    const offset = (Number(page) - 1) * Number(limit);

    let where = ` WHERE 1=1 `;
    const params = [];

    // "Toyota,Honda" -> ["Toyota", "Honda"]
    const toArray = (val, isNumeric = false) =>
      String(val)
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== "")
        .map((v) => (isNumeric ? Number(v) : v))
        .filter((v) => !isNumeric || !isNaN(v));

    const addInClause = (column, values) => {
      where += ` AND ${column} IN (${values.map(() => "?").join(",")})`;
      params.push(...values);
    };

    // SEARCH
    if (search) {
      where += `
        AND (
          vm.code LIKE ?
          OR v.name LIKE ?
          OR vm.variant LIKE ?
          OR vm.veh_no LIKE ?
          OR vm.garage LIKE ?
          OR vm.reg_date LIKE ?
          OR EXISTS (
            SELECT 1 FROM vehicle_amenities va
            WHERE va.vehicle_id = vm.id AND va.amenity_code LIKE ?
          )
        )
      `;

      const like = `%${search}%`;
      params.push(like, like, like, like, like, like, like);
    }

    // FILTERS
    // vendor filter ab vendor_id (comma separated ids) par chalta hai
    if (vendor) {
      const vendorIds = toArray(vendor, true);
      if (vendorIds.length > 0) addInClause("vm.vendor_id", vendorIds);
    }

    if (garage) {
      const garages = toArray(garage);
      if (garages.length > 0) addInClause("vm.garage", garages);
    }

    if (city) {
      const cities = toArray(city, true);
      if (cities.length > 0) addInClause("vm.city_id", cities);
    }

    if (year) {
      const years = toArray(year, true);
      if (years.length > 0) addInClause("YEAR(vm.reg_date)", years);
    }

    if (code) {
      const codes = toArray(code);
      if (codes.length > 0) addInClause("vm.code", codes);
    }

    if (seat) {
      const seats = toArray(seat);
      if (seats.length > 0) addInClause("vmst.seat", seats);
    }

    if (variant) {
      const variants = toArray(variant);
      if (variants.length > 0) addInClause("vm.variant", variants);
    }

    if (category) {
      const categories = toArray(category);
      if (categories.length > 0) addInClause("vmst.category", categories);
    }

    // COUNT (limit/offset se pehle, taaki params same rahein)
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM vehicle_manager vm
      JOIN vendors v ON v.id = vm.vendor_id
      LEFT JOIN vehicle_master vmst ON vm.code = vmst.code
      ${where}
    `;

    const [countRows] = await pool.query(countQuery, params);

    // MAIN
    const mainQuery = `
      ${BASE_SELECT}
      ${where}
      ORDER BY vm.id ASC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(mainQuery, [
      ...params,
      Number(limit),
      Number(offset),
    ]);

    const data = await attachCityNames(rows);

    const total = Number(countRows[0]?.total || 0);
    const currentPage = Number(page);
    const currentLimit = Number(limit);

    return {
      data,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: currentLimit > 0 ? Math.ceil(total / currentLimit) : 0,
    };
  } catch (error) {
    console.error("getAllVehicleManagersModel error:", error);
    throw error;
  }
};

export const getAllCitiesModel = async () => {
  try {
    const [rows] = await hrmsPool.execute(
      `SELECT id, city_name FROM city ORDER BY city_name ASC`,
    );

    return rows;
  } catch (error) {
    console.error("getAllCitiesModel error:", error);
    throw error;
  }
};

export const getVehicleMasterCodesModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT code, amenities
      FROM vehicle_master
      WHERE code IS NOT NULL
        AND code != ''
      ORDER BY code ASC
    `);

    return rows;
  } catch (error) {
    console.error("getVehicleMasterCodesModel error:", error);
    throw error;
  }
};

export const getVehicleMasterAmenitiesModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT amenities
      FROM vehicle_master
      WHERE amenities IS NOT NULL
        AND amenities != ''
    `);

    const amenitiesSet = new Set();

    rows.forEach((row) => {
      if (row.amenities) {
        row.amenities
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
          .forEach((a) => amenitiesSet.add(a));
      }
    });

    return Array.from(amenitiesSet)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name }));
  } catch (error) {
    console.error("getVehicleMasterAmenitiesModel error:", error);
    throw error;
  }
};

// Dropdown: value = id, label = name (duplicate naam alag dikhane ke liye vender_code bhi)
// Sirf active vendors. Pending/approved bhi chahiye to status wali line hata do
export const getVehicleManagerVendorsModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, vender_code, name, short_name
      FROM vendors
      WHERE name IS NOT NULL
        AND name != ''
        AND status = 'active'
      ORDER BY name ASC, id ASC
    `);

    return rows;
  } catch (error) {
    console.error("getVehicleManagerVendorsModel error:", error);
    throw error;
  }
};

export const updateVehicleManagerStatusModel = async ({ id, status }) => {
  try {
    if (!id) throw new Error("id is required");
    if (!status) throw new Error("status is required");

    const [result] = await pool.execute(
      `UPDATE vehicle_manager SET status = ? WHERE id = ?`,
      [status, id],
    );

    if (result.affectedRows === 0) return null;

    return await getVehicleManagerById(id);
  } catch (error) {
    console.error("updateVehicleManagerStatusModel error:", error);
    throw error;
  }
};
