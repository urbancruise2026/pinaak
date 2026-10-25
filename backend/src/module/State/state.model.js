import { pool } from "../../config/mySqlDB.js";

export const getAllStates = async () => {
  const [rows] = await pool.query(
    `SELECT id, stateName FROM states ORDER BY stateName`,
  );
  return rows;
};

export const getCitiesByState = async (stateId) => {
  const [rows] = await pool.query(
    `SELECT id, cityName FROM statecities WHERE state_id = ? ORDER BY cityName`,
    [stateId],
  );
  return rows;
};

export const getStateByCity = async (cityName) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT s.id, s.stateName
     FROM states s
     JOIN statecities c ON s.id = c.state_id
     WHERE c.cityName = ?
     ORDER BY s.stateName`,
    [cityName],
  );
  return rows; // ← array return karo, single row nahi
};

export const getAllCities = async () => {
  const [rows] = await pool.query(
    `SELECT id, cityName FROM statecities ORDER BY cityName`,
  );
  return rows;
};
