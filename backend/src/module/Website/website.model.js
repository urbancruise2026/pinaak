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

export const createTripBookingModel = async (data) => {
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
    [
      data.full_name,
      data.phone,
      data.country_code,
      data.email,
      data.trip_message,
      data.pickup_address,
      data.pickup_date,
      data.drop_address,
      data.drop_date,
      data.travel_itinerary,
      data.passengers,
      data.baggages,
      data.vehicle_category,
      data.vehicle_model,
      data.city, // 🆕 city value add ki
    ],
  );

  return result.insertId;
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
