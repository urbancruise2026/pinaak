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

  // Saari cities mein sabse bada number (BAHOW00013 -> 13)
  const [rows] = await connection.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING(vender_code, 6) AS UNSIGNED)), 0) AS maxNum
     FROM vendors
     WHERE vender_code REGEXP '^BA[A-Z]{3}[0-9]{5}$'
     FOR UPDATE`,
  );

  const nextNumber = Number(rows[0].maxNum) + 1;

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
};
export const getStateCitiesByZone = async (req, res) => {
  try {
    const { zoneId } = req.params;

    if (!zoneId || isNaN(Number(zoneId))) {
      return res.status(400).json({
        success: false,
        message: "Valid zoneId is required",
      });
    }

    const [rows] = await hrmsPool.query(
      `SELECT
          c.id AS cityId,
          c.city_name AS cityName,
          c.zone_id AS zoneId,
          s.id AS stateId,
          s.stateName
       FROM city c
       LEFT JOIN state s ON s.id = c.state_id
       WHERE c.zone_id = ?
       ORDER BY s.stateName, c.city_name`,
      [zoneId],
    );

    return res.status(200).json({
      success: true,
      message: "State and cities fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("getStateCitiesByZone error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
