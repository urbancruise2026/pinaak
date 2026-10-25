import { pool } from "../../config/mySqlDB.js";

export const COUNTRY_TABLE = "countries";

export const COUNTRY_COLUMNS = {
  ID: "id",
  NAME: "country_name",
  CODE: "country_code",
  PHONE: "phone_code",
  CREATED_AT: "created_at",
};

export const insertCountry = async (data) => {
  const { country_name, country_code, phone_code } = data;

  const sql = `
    INSERT INTO ${COUNTRY_TABLE} 
    (${COUNTRY_COLUMNS.NAME}, ${COUNTRY_COLUMNS.CODE}, ${COUNTRY_COLUMNS.PHONE})
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    country_name,
    country_code,
    phone_code,
  ]);

  return { id: result.insertId, ...data, created_at: new Date() };
};

// NOTE: was doing SELECT * with no LIMIT on every call — fine for a small
// countries table, but added optional pagination so it never becomes a
// problem if the table grows or this pattern gets copied to bigger tables.
export const getCountries = async ({ page, limit } = {}) => {
  if (page && limit) {
    const offset = (Number(page) - 1) * Number(limit);
    const sql = `SELECT * FROM ${COUNTRY_TABLE} ORDER BY ${COUNTRY_COLUMNS.NAME} ASC LIMIT ? OFFSET ?`;
    const [rows] = await pool.execute(sql, [Number(limit), offset]);
    return rows;
  }

  const sql = `SELECT * FROM ${COUNTRY_TABLE} ORDER BY ${COUNTRY_COLUMNS.NAME} ASC`;
  const [rows] = await pool.execute(sql);
  return rows;
};

export const getCountryById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${COUNTRY_TABLE} WHERE ${COUNTRY_COLUMNS.ID} = ?`,
    [id],
  );
  return rows[0] || null;
};

export const findCountryByCode = async (countryCode) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${COUNTRY_TABLE} WHERE ${COUNTRY_COLUMNS.CODE} = ?`,
    [countryCode],
  );
  return rows[0] || null;
};

export const getAllCountryCodes = async () => {
  const [rows] = await pool.execute(
    `SELECT 
       ${COUNTRY_COLUMNS.CODE},
       ${COUNTRY_COLUMNS.PHONE}
     FROM ${COUNTRY_TABLE}`,
  );
  return rows;
};
