import { pool } from "../../config/mySqlDB.js";

export const generateVendorId = async (city, connection = pool) => {
  if (!city || !city.trim()) {
    throw new Error("City is required to generate vendor ID");
  }

  const cityCode = city
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  const prefix = `BA${cityCode}`;

  const [rows] = await connection.query(
    `SELECT vender_code
     FROM vendors
     WHERE vender_code LIKE ?
     ORDER BY vender_code DESC
     LIMIT 1
     FOR UPDATE`,
    [`${prefix}%`],
  );

  let nextNumber = 1;

  if (rows.length > 0) {
    const lastNumber = parseInt(rows[0].vender_code.slice(prefix.length), 10);

    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
};
