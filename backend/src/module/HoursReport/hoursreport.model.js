// E:\Pinnak\PINAK_BACKEND\src\module\HoursReport\hoursreport.model.js
import { pool } from "../../config/mySqlDB.js"; // or import pool from ... depending on export

export const getMonthlyEnquiry = async (year) => {
  try {

    // Check if pool is defined
    if (!pool) {
      throw new Error(
        "Database pool is not initialized. Check your DB config.",
      );
    }

    // Optional: test the connection
    const connection = await pool.getConnection();
    connection.release();

    const query = `
      SELECT 
        MONTH(enquiryTime) AS month,
        DAY(enquiryTime) AS day,
        HOUR(enquiryTime) AS hour,
        COUNT(id) AS total
      FROM leads
      WHERE YEAR(enquiryTime) = ?
      GROUP BY MONTH(enquiryTime), DAY(enquiryTime), HOUR(enquiryTime)
      ORDER BY month, day, hour
    `;

    const [rows] = await pool.execute(query, [year]);
    return rows;
  } catch (error) {
    console.error("❌ Model Error:", error.message);
    throw error; // rethrow so controller can handle it
  }
};
