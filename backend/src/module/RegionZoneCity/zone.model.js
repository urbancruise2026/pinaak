import { hrmsPool } from "../../config/mySqlDB.js";

export const getAllRegionsModel = async () => {
  try {
    const [rows] = await hrmsPool.execute(
      `SELECT id, region_name FROM regions ORDER BY region_name ASC`,
    );

    return rows;
  } catch (error) {
    console.error("getAllRegionsModel error:", error);
    throw error;
  }
};

export const getZonesByRegionModel = async (regionId) => {
  try {
    const [rows] = await hrmsPool.execute(
      `
      SELECT id, zone_name, region_id
      FROM zones
      WHERE region_id = ?
      ORDER BY zone_name ASC
      `,
      [regionId]
    );

    return rows;
  } catch (error) {
    console.error("getZonesByRegionModel error:", error);
    throw error;
  }
};
export const getAllCitiesModel = async () => {
  try {
    const [rows] = await hrmsPool.execute(
      `
      SELECT 
        id,
        city_name
      FROM city
      ORDER BY city_name ASC
      `,
    );

    return rows;
  } catch (error) {
    console.error("getAllCitiesModel error:", error);
    throw error;
  }
};
