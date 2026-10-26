// models/websiteGac.model.js

import { pool } from "../../config/mySqlDB.js";

// CREATE WEBSITE GAC
export const createWebsiteGac = async ({ name, country_code, phone, city }) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO website_gac
      (name, country_code, phone, city)
      VALUES (?, ?, ?, ?)`,
      [name, country_code, phone, city],
    );

    return {
      id: result.insertId,
      name,
      country_code,
      phone,
      city,
    };
  } catch (error) {
    throw new Error(`createWebsiteGac failed: ${error.message}`);
  }
};

export const getAllWebsiteGac = async (city) => {
  try {
    let query = `
      SELECT
        id,
        name,
        country_code,
        phone,
        city,
        created_at,
        is_read
      FROM website_gac
    `;
    const params = [];

    // city filter (agar "all" nahi hai to WHERE lagao)
    if (city && city.toLowerCase() !== "all") {
      query += ` WHERE LOWER(city) = LOWER(?)`;
      params.push(city);
    }

    query += ` ORDER BY id DESC`;

    const [rows] = await pool.execute(query, params);

    return rows;
  } catch (error) {
    throw new Error(`getAllWebsiteGac failed: ${error.message}`);
  }
};

// Helpers: mysql2 execute() throws on `undefined`, and MySQL strict mode
// rejects ISO strings like "2026-10-30T10:00:00.000Z" for DATETIME columns.
const toNull = (v) => (v === undefined || v === "" ? null : v);

const toText = (v) => {
  if (v === undefined || v === null || v === "") return null;
  if (Array.isArray(v)) return v.filter(Boolean).join(", "); // multi-select checkboxes
  if (typeof v === "object") return JSON.stringify(v);
  return String(v).trim();
};

const toMySQLDateTime = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return toText(v); // let MySQL decide on odd formats
  // Keep it in UTC to match the session time_zone set in mySqlDB.js
  return d.toISOString().slice(0, 19).replace("T", " ");
};

export const createTripBookingModel = async (data) => {
  const params = [
    toText(data.full_name),
    toText(data.phone),
    toText(data.country_code) ?? "+91",
    toNull(toText(data.email)),
    toNull(toText(data.trip_message)),
    toText(data.pickup_address),
    toMySQLDateTime(data.pickup_date),
    toText(data.drop_address),
    toMySQLDateTime(data.drop_date),
    toText(data.travel_itinerary),
    toText(data.passengers),
    toText(data.baggages),
    toText(data.vehicle_category),
    toText(data.vehicle_model),
    toText(data.city),
  ];

  try {
    const [result] = await pool.execute(
      `INSERT INTO trip_bookings
      (
        firstName,
        customerPhone,
        country_code,
        customerEmail,
        message,
        pickupAddress,
        pickup_date,
        dropAddress,
        drop_date,
        itinerary,
        passengerTotal,
        baggageTotal,
        vehicle_category,
        vehicle_model,
        city
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      params,
    );

    return result.insertId;
  } catch (error) {
    // Log the real reason (Unknown column / Incorrect datetime / Data too long ...)
    console.error(
      "❌ createTripBookingModel failed:",
      error.code,
      error.sqlMessage || error.message,
    );
    throw new Error(
      `createTripBookingModel failed: ${error.sqlMessage || error.message}`,
    );
  }
};

// ================= GET ALL TRIP BOOKINGS =================

export const getAllTripBookings = async (city) => {
  try {
    let query = `
  SELECT
    id,
    firstName,
    middleName,
    lastName,
    customerPhone,
    country_code,
    customerEmail,
    message,
    pickupAddress,
    pickup_date,
    dropAddress,
    drop_date,
    itinerary,
    passengerTotal,
    baggageTotal,
    vehicle_category,
    vehicle_model,
    city,
    DATE_ADD(created_at, INTERVAL 330 MINUTE) AS created_at,
    is_read
  FROM trip_bookings
`;
    const params = [];

    // city filter (agar "all" nahi hai to WHERE lagao)
    if (city && city.toLowerCase() !== "all") {
      query += ` WHERE LOWER(city) = LOWER(?)`;
      params.push(city);
    }

    query += ` ORDER BY id DESC`;

    const [rows] = await pool.execute(query, params);

    return rows;
  } catch (error) {
    throw new Error(`getAllTripBookings failed: ${error.message}`);
  }
};

export const markWebsiteGacAsRead = async (id) => {
  try {
    const [result] = await pool.execute(
      `
      UPDATE website_gac
      SET is_read = 1
      WHERE id = ?
      `,
      [id],
    );

    return result;
  } catch (error) {
    throw new Error(`markWebsiteGacAsRead failed: ${error.message}`);
  }
};

export const markTripBookingAsRead = async (id) => {
  try {
    const [result] = await pool.execute(
      `
      UPDATE trip_bookings
      SET is_read = 1
      WHERE id = ?
      `,
      [id],
    );

    return result;
  } catch (error) {
    throw new Error(`markTripBookingAsRead failed: ${error.message}`);
  }
};
