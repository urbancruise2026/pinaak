import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const IST_TIMEZONE = "+05:30";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: IST_TIMEZONE,
  waitForConnections: true,
  connectionLimit: 15, // 100 se ghatakar realistic number par
  queueLimit: 30, // 0 nahi — bounded queue
  connectTimeout: 10000, // 10 sec mein connect na ho to fail
  idleTimeout: 60000, // idle connections release ho jayein
  maxIdle: 10,
});

export const hrmsPool = mysql.createPool({
  host: process.env.HRMS_DB_HOST,
  user: process.env.HRMS_DB_USER,
  password: process.env.HRMS_DB_PASSWORD,
  database: process.env.HRMS_DB_NAME,
  timezone: IST_TIMEZONE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 20,
  connectTimeout: 10000,
  idleTimeout: 60000,
  maxIdle: 5,
});

// Pinaak Connection Test
export const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Pinaak MySQL Connected Successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ Pinaak MySQL Connection Failed:", err.message);
    throw err;
  }
};

// ✅ HRMS Connection Test (Naya)
export const connectHRMSMySQL = async () => {
  try {
    const connection = await hrmsPool.getConnection();
    console.log("✅ HRMS MySQL Connected Successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ HRMS MySQL Connection Failed:", err.message);
    throw err;
  }
};
