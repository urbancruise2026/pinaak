import { hrmsPool } from "../../config/mySqlDB.js";

export const getCityIdsByZoneIds = async (zoneIds = []) => {
  if (!zoneIds.length) return [];

  const placeholders = zoneIds.map(() => "?").join(", ");

  const [rows] = await hrmsPool.query(
    `SELECT id FROM city WHERE zone_id IN (${placeholders})`,
    zoneIds,
  );

  return rows.map((row) => row.id); // ✅ rows se id lo
};
