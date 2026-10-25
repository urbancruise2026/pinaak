import { pool } from "../../config/mySqlDB.js";

export const getAnnualReportData = async (year) => {
  try {

    const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

    // -----------------------------
    // DAYS QUERY
    // -----------------------------
    const daysQuery = `
    SELECT 
      MONTH(enquiryTime) AS month,
      SUM(CASE WHEN days <= 1 THEN 1 ELSE 0 END) AS day1,
      SUM(CASE WHEN days BETWEEN 2 AND 3 THEN 1 ELSE 0 END) AS day2_3,
      SUM(CASE WHEN days BETWEEN 4 AND 5 THEN 1 ELSE 0 END) AS day4_5,
      SUM(CASE WHEN days BETWEEN 6 AND 7 THEN 1 ELSE 0 END) AS day6_7,
      SUM(CASE WHEN days BETWEEN 8 AND 10 THEN 1 ELSE 0 END) AS day8_10,
      SUM(CASE WHEN days > 10 THEN 1 ELSE 0 END) AS day_gt_10,
      COUNT(id) AS total
    FROM leads
    WHERE YEAR(enquiryTime) = ?
    GROUP BY MONTH(enquiryTime)
    `;

    // -----------------------------
    // SOURCE QUERY (FIXED)
    // -----------------------------
    const sourceQuery = `
    SELECT 
      MONTH(enquiryTime) AS month,
      SUM(CASE WHEN source='Call' THEN 1 ELSE 0 END) AS call_count,
      SUM(CASE WHEN source='WA' THEN 1 ELSE 0 END) AS wa_count,
      SUM(CASE WHEN source='GAC' THEN 1 ELSE 0 END) AS gac_count,
      SUM(CASE WHEN source='GAQ' THEN 1 ELSE 0 END) AS gaq_count,
      SUM(CASE WHEN source='Email' THEN 1 ELSE 0 END) AS email_count,
      SUM(CASE WHEN source='REF-C' THEN 1 ELSE 0 END) AS ref_count,
      SUM(CASE WHEN source='REP-C' THEN 1 ELSE 0 END) AS repc_count,
      SUM(CASE WHEN source='META' THEN 1 ELSE 0 END) AS meta_count,
      COUNT(id) AS total
    FROM leads
    WHERE YEAR(enquiryTime) = ?
    GROUP BY MONTH(enquiryTime)
    `;

    // -----------------------------
    // PAX QUERY
    // -----------------------------
    const paxQuery = `
    SELECT 
      MONTH(enquiryTime) AS month,
      SUM(CASE WHEN passengerTotal BETWEEN 6 AND 7 THEN 1 ELSE 0 END) AS pax_6_7,
      SUM(CASE WHEN passengerTotal BETWEEN 8 AND 10 THEN 1 ELSE 0 END) AS pax_8_10,
      SUM(CASE WHEN passengerTotal BETWEEN 11 AND 13 THEN 1 ELSE 0 END) AS pax_11_13,
      SUM(CASE WHEN passengerTotal BETWEEN 14 AND 20 THEN 1 ELSE 0 END) AS pax_14_20,
      SUM(CASE WHEN passengerTotal BETWEEN 21 AND 30 THEN 1 ELSE 0 END) AS pax_21_30,
      SUM(CASE WHEN passengerTotal BETWEEN 31 AND 40 THEN 1 ELSE 0 END) AS pax_31_40,
      SUM(CASE WHEN passengerTotal BETWEEN 41 AND 50 THEN 1 ELSE 0 END) AS pax_41_50,
      SUM(CASE WHEN passengerTotal > 50 THEN 1 ELSE 0 END) AS pax_gt_50,
      COUNT(id) AS total
    FROM leads
    WHERE YEAR(enquiryTime) = ?
    GROUP BY MONTH(enquiryTime)
    `;

    const [daysRows] = await pool.execute(daysQuery, [year]);
    const [sourceRows] = await pool.execute(sourceQuery, [year]);
    const [paxRows] = await pool.execute(paxQuery, [year]);

    const daysData = months.map((month) => {
      const r = daysRows.find((x) => x.month === month) || {};
      return [
        r.day1 || 0,
        r.day2_3 || 0,
        r.day4_5 || 0,
        r.day6_7 || 0,
        r.day8_10 || 0,
        r.day_gt_10 || 0,
        r.total || 0,
      ];
    });

    const sourceData = months.map((month) => {
      const r = sourceRows.find((x) => x.month === month) || {};
      return [
        r.call_count || 0,
        r.wa_count || 0,
        r.gac_count || 0,
        r.gaq_count || 0,
        r.email_count || 0,
        r.ref_count || 0,
        r.repc_count || 0,
        r.meta_count || 0,
        r.total || 0,
      ];
    });

    const paxData = months.map((month) => {
      const r = paxRows.find((x) => x.month === month) || {};
      return [
        r.pax_6_7 || 0,
        r.pax_8_10 || 0,
        r.pax_11_13 || 0,
        r.pax_14_20 || 0,
        r.pax_21_30 || 0,
        r.pax_31_40 || 0,
        r.pax_41_50 || 0,
        r.pax_gt_50 || 0,
        r.total || 0,
      ];
    });

    return { daysData, sourceData, paxData };
  } catch (error) {
    console.error("❌ Annual Report Model Error:", error);
    throw error;
  }
};
