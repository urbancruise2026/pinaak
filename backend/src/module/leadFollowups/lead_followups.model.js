import { hrmsPool, pool } from "../../config/mySqlDB.js";

/**
 * Insert only NEW follow-ups.
 *
 * Agar same:
 *   leads_id
 *   adviser_id
 *   followup_date
 *   remark
 *
 * already database mein exist karta hai,
 * to usko dobara insert nahi karega.
 */
export const insertMultipleLeadFollowups = async (followupsArray) => {
  if (!Array.isArray(followupsArray) || followupsArray.length === 0) {
    return null;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const insertedRows = [];
    const skippedRows = [];

    for (const f of followupsArray) {
      if (!f.leads_id) {
        continue;
      }

      const leadsId = f.leads_id;
      const adviserId = f.adviser_id || null;
      const followupDate = f.followup_date || null;
      const remark = f.remark ? String(f.remark).trim() : "";

      // Required data validation
      if (!followupDate && !remark) {
        continue;
      }

      /**
       * Check whether exactly same follow-up already exists.
       */
      const [existingRows] = await connection.query(
        `
        SELECT id
        FROM lead_followups
        WHERE leads_id = ?
          AND (
            adviser_id = ?
            OR (adviser_id IS NULL AND ? IS NULL)
          )
          AND followup_date = ?
          AND TRIM(COALESCE(remark, '')) = ?
        LIMIT 1
        `,
        [leadsId, adviserId, adviserId, followupDate, remark],
      );

      /**
       * Already exists
       * => DO NOT INSERT AGAIN
       */
      if (existingRows.length > 0) {
        skippedRows.push({
          id: existingRows[0].id,
          leads_id: leadsId,
          followup_date: followupDate,
          remark,
          reason: "Already exists",
        });

        continue;
      }

      /**
       * New follow-up
       * => INSERT
       */
      const [result] = await connection.query(
        `
        INSERT INTO lead_followups
        (
          leads_id,
          adviser_id,
          followup_date,
          remark
        )
        VALUES (?, ?, ?, ?)
        `,
        [leadsId, adviserId, followupDate, remark],
      );

      insertedRows.push({
        id: result.insertId,
        leads_id: leadsId,
        adviser_id: adviserId,
        followup_date: followupDate,
        remark,
      });
    }

    await connection.commit();

    return {
      insertedCount: insertedRows.length,
      skippedCount: skippedRows.length,
      insertedRows,
      skippedRows,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Get all leads
 */
export const getAllLeads = async () => {
  const [leads] = await pool.query(
    `
    SELECT
      leads.id,
      leads.uuid,
      leads.customer_id,

      TRIM(
        CONCAT(
          COALESCE(customers.firstName, ''),
          ' ',
          COALESCE(customers.middleName, ''),
          ' ',
          COALESCE(customers.lastName, '')
        )
      ) AS customer_name,

      leads.advisor_id,
      leads.source,
      leads.status,
      leads.serviceType,
      leads.city_id

    FROM leads

    LEFT JOIN customers
      ON customers.id = leads.customer_id
    `,
  );

  if (leads.length === 0) {
    return [];
  }

  // Advisor IDs
  const advisorIds = [
    ...new Set(leads.map((l) => l.advisor_id).filter(Boolean)),
  ];

  // City IDs
  const cityIds = [...new Set(leads.map((l) => l.city_id).filter(Boolean))];

  let users = [];
  let cities = [];

  /**
   * Get advisors
   */
  if (advisorIds.length > 0) {
    const [rows] = await hrmsPool.query(
      `
      SELECT
        id,
        TRIM(
          CONCAT(
            COALESCE(firstName, ''),
            ' ',
            COALESCE(lastName, '')
          )
        ) AS name

      FROM users

      WHERE id IN (?)
      `,
      [advisorIds],
    );

    users = rows;
  }

  /**
   * Get cities
   */
  if (cityIds.length > 0) {
    const [rows] = await hrmsPool.query(
      `
      SELECT
        id,
        city_name

      FROM city

      WHERE id IN (?)
      `,
      [cityIds],
    );

    cities = rows;
  }

  /**
   * Maps
   */
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const cityMap = new Map(cities.map((c) => [c.id, c.city_name]));

  /**
   * Merge advisor + city
   */
  return leads.map((lead) => ({
    ...lead,

    advisor_name: userMap.get(lead.advisor_id) || null,

    city_name: cityMap.get(lead.city_id) || null,
  }));
};

export const getFollowupsByLeadId = async (leads_id) => {
  const [rows] = await pool.query(
    `
    SELECT 
        lf.followup_date, 
        lf.remark,

        l.status AS current_status, 
        l.lost_reason, 
        l.lostReasonDetails,

        COALESCE(
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', lsh.id,
                        'old_status', lsh.old_status,
                        'new_status', lsh.new_status,
                        'changed_by', lsh.changed_by,
                        'changed_at',
DATE_FORMAT(
    DATE_ADD(lsh.changed_at, INTERVAL 330 MINUTE),
    '%Y-%m-%d %H:%i:%s'
)
                    )
                )
                FROM lead_status_history lsh
                WHERE lsh.lead_id = lf.leads_id
            ),
            JSON_ARRAY()
        ) AS status_history

    FROM lead_followups lf

    JOIN leads l
        ON l.id = lf.leads_id

    WHERE lf.leads_id = ?

    ORDER BY lf.followup_date DESC
    `,
    [leads_id],
  );

  const formattedRows = rows.map((row) => ({
    ...row,
    status_history:
      typeof row.status_history === "string"
        ? JSON.parse(row.status_history)
        : row.status_history,
  }));

  return formattedRows;
};

export const getTodayFollowupsWithDetailsByAdviserId = async (adviser_id) => {
  const [rows] = await pool.query(
    `SELECT 
        lf.id AS followup_id,
        lf.leads_id AS lead_id,
        DATE_FORMAT(lf.followup_date, '%d-%m-%Y %h:%i %p') AS followup_date,
        lf.remark,
        l.customer_id,
        l.pickupDateTime,
        DATE_FORMAT(l.pickupDateTime, '%M') AS pickup_month_name,
        DATE_FORMAT(l.pickupDateTime, '%d %M %Y, %h:%i %p') AS pickup_date_formatted,
        c.firstName,
        c.lastName,
        c.customerPhone
     FROM lead_followups lf
     JOIN leads l ON lf.leads_id = l.id
     JOIN customers c ON l.customer_id = c.id
     WHERE lf.adviser_id = ?
       AND DATE(lf.followup_date) = CURDATE()`,
    [adviser_id],
  );

  return rows;
};
