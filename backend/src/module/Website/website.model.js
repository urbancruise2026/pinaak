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

// ================= HELPERS FOR TRIP BOOKING INSERT =================
// trip_bookings columns (from SHOW COLUMNS):
//   firstName varchar(100) NOT NULL, middleName varchar(100) NULL,
//   lastName varchar(100) NOT NULL (no default), customerPhone varchar(20) NOT NULL,
//   pickup_date / drop_date DATE NOT NULL, passengerTotal / baggageTotal INT NOT NULL

// mysql2 execute() throws on `undefined` -> always send null instead
const toText = (v, maxLen = null) => {
  if (v === undefined || v === null) return null;
  let out;
  if (Array.isArray(v)) out = v.filter(Boolean).join(", "); // multi-select checkboxes
  else if (typeof v === "object") out = JSON.stringify(v);
  else out = String(v).trim();
  if (out === "") return null;
  if (maxLen && out.length > maxLen) out = out.slice(0, maxLen);
  return out;
};

// "Aman Kumar Singh" -> { firstName: "Aman", lastName: "Kumar Singh" }
// "Aman"             -> { firstName: "Aman", lastName: "" }
const splitFullName = (fullName) => {
  const parts = (toText(fullName) || "").split(/\s+/).filter(Boolean);
  const firstName = (parts.shift() || "").slice(0, 100);
  const lastName = parts.join(" ").slice(0, 100);
  return { firstName, lastName };
};

// DATE column -> "YYYY-MM-DD"
const toMySQLDate = (v) => {
  if (!v) return null;
  const str = String(v).trim();

  // Already "YYYY-MM-DD..." -> take the date part as-is (no timezone shift)
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // "DD-MM-YYYY" or "DD/MM/YYYY" (common Indian format)
  const dmy = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }

  // Anything else -> let JS parse it, format in IST
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  const ist = new Date(d.getTime() + 330 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
};

// INT NOT NULL column -> number ("10+", "5 bags", "" -> 10, 5, 0)
const toInt = (v) => {
  if (v === undefined || v === null) return 0;
  const n = parseInt(String(v).replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
};

export const createTripBookingModel = async (data) => {
  const { firstName, lastName } = splitFullName(data.full_name);

  const params = [
    firstName,                                      // firstName  NOT NULL
    lastName,                                       // lastName   NOT NULL ("" if single word)
    toText(data.phone, 20) ?? "",                   // customerPhone varchar(20) NOT NULL
    toText(data.country_code, 10) ?? "+91",         // country_code
    toText(data.email, 200),                        // customerEmail (nullable)
    toText(data.trip_message),                      // message (nullable)
    toText(data.pickup_address) ?? "",              // pickupAddress NOT NULL
    toMySQLDate(data.pickup_date),                  // pickup_date DATE NOT NULL
    toText(data.drop_address) ?? "",                // dropAddress NOT NULL
    toMySQLDate(data.drop_date),                    // drop_date DATE NOT NULL
    toText(data.travel_itinerary),                  // itinerary (nullable)
    toInt(data.passengers),                         // passengerTotal INT NOT NULL
    toInt(data.baggages),                           // baggageTotal INT NOT NULL
    toText(data.vehicle_category, 50),              // vehicle_category varchar(50)
    toText(data.vehicle_model, 100),                // vehicle_model varchar(100)
    toText(data.city, 100) ?? "India",              // city
  ];

  try {
    const [result] = await pool.execute(
      `INSERT INTO trip_bookings
      (
        firstName,
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
        city
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      params,
    );

    return result.insertId;
  } catch (error) {
    // Log the real reason (Unknown column / Incorrect date / Data too long ...)
    console.error(
      "❌ createTripBookingModel failed:",
      error.code,
      error.sqlMessage || error.message,
      "| params:",
      JSON.stringify(params),
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