import { pool } from "../../config/mySqlDB.js";

export const getLeadReport = async (month, year) => {
  try {
    const query = `
      SELECT 
        l.id,
        l.uuid,
        l.customer_id,
        l.advisor_id,
        CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS customerFullName,
        c.customerPhone,
        c.customerEmail,
        c.address,
        c.customerCity,
        c.state,
        c.pincode,
        l.source,
        l.presales_id,
        l.status,
        l.serviceType,
        l.pickupAddress,
        l.dropAddress,
        l.pickupDateTime,
        l.dropDateTime,
        l.days,
        l.tripType,
        l.remarks,
        l.lost_reason,
        l.created_at,
        l.updated_at
      FROM leads l
      LEFT JOIN customers c ON l.customer_id = c.id
      WHERE MONTH(l.created_at) = ?
      AND YEAR(l.created_at) = ?
      ORDER BY l.id DESC
    `;

    const [rows] = await pool.execute(query, [month, year]);
    if (!rows.length) return [];

    const userIds = [
      ...new Set(
        rows
          .flatMap((lead) => [lead.advisor_id, lead.presales_id])
          .filter(Boolean),
      ),
    ];

    let userMap = {};

    if (userIds.length > 0) {
      try {
        const placeholders = userIds.map(() => "?").join(",");
        const [users] = await hrmsPool.query(
          `SELECT id, aliasName, firstName, middleName, lastName, shortName
           FROM users
           WHERE id IN (${placeholders})`,
          userIds,
        );
        users.forEach((u) => {
          userMap[u.id] = u;
        });
      } catch (err) {
        console.error("HRMS User Fetch Error:", err.message);
      }
    }

    const finalData = rows.map((lead) => {
      const advisor = userMap[lead.advisor_id];
      const presales = userMap[lead.presales_id];

      return {
        id: lead.id,
        uuid: lead.uuid,
        customer_id: lead.customer_id,
        advisor_id: lead.advisor_id,
        customerFullName: lead.customerFullName,
        customerPhone: lead.customerPhone,
        customerEmail: lead.customerEmail,
        address: lead.address,
        customerCity: lead.customerCity,
        state: lead.state,
        pincode: lead.pincode,
        source: lead.source,
        presales_id: lead.presales_id,
        status: lead.status,
        serviceType: lead.serviceType,
        pickupAddress: lead.pickupAddress,
        dropAddress: lead.dropAddress,
        pickupDateTime: lead.pickupDateTime,
        dropDateTime: lead.dropDateTime,
        days: lead.days,
        tripType: lead.tripType,
        remarks: lead.remarks,
        lost_reason: lead.lost_reason,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        advisorFullName: advisor?.aliasName?.trim() || null,
        presalesFullName: presales?.shortName?.trim() || null,
      };
    });

    return finalData;
  } catch (error) {
    console.error("getLeadReport Error:", error);
    return [];
  }
};
