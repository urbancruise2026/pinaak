import { pool, hrmsPool } from "../../config/mySqlDB.js";

const safe = (v) => (v === undefined ? null : v);

export const createRateQuotationModel = async (payload) => {
  const { leadId, customerId, vehicles, advisorId } = payload;

  if (!leadId) throw new Error("Lead ID is required");
  if (!customerId) throw new Error("Customer ID is required");
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    throw new Error("At least one vehicle is required");
  }

  const vehiclesValue =
    typeof vehicles === "string" ? vehicles : JSON.stringify(vehicles || []);

  const query = `
    INSERT INTO rate_quotations (
      lead_id,
      customer_id,
      vehicles,
      advisor_id
    )
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    safe(leadId),
    safe(customerId),
    safe(vehiclesValue),
    advisorId ? Number(advisorId) : null, // Ensure it's properly formatted
  ];


  const [result] = await pool.execute(query, values);

  if (!result.affectedRows) {
    throw new Error("Rate quotation creation failed");
  }

  return {
    success: true,
    quotationId: result.insertId,
  };
};

export const getRateQuotationByLeadId = async (leadId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM rate_quotations WHERE lead_id = ? LIMIT 1`,
    [leadId],
  );

  if (!rows.length) return null;

  const quotation = rows[0];

  return {
    ...quotation,
    vehicles:
      typeof quotation.vehicles === "string"
        ? JSON.parse(quotation.vehicles || "[]")
        : quotation.vehicles || [],
  };
};

export const getAllRateQuotationModel = async (
  advisorId,
  page,
  limit,
  search,
  month,
  year,
  status, // Added status parameter
) => {
  try {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const now = new Date();
    const selectedMonth = month ? parseInt(month, 10) : null;
    const selectedYear = year ? parseInt(year, 10) : now.getFullYear();

    let whereClause = `WHERE 1=1`;
    let values = [];

    // ── Advisor filter ─────────────────────────────
    if (Array.isArray(advisorId)) {
      if (advisorId.length > 0) {
        const placeholders = advisorId.map(() => "?").join(",");
        whereClause += ` AND rq.advisor_id IN (${placeholders})`;
        values.push(...advisorId);
      } else {
        whereClause += ` AND 1 = 0`;
      }
    } else if (advisorId) {
      whereClause += ` AND rq.advisor_id = ?`;
      values.push(Number(advisorId));
    } else {
      whereClause += ` AND rq.advisor_id IS NOT NULL`;
    }

    // ── Month / Year filter ───────────────────────
    if (selectedMonth) {
      whereClause += ` 
        AND MONTH(rq.created_at) = ? 
        AND YEAR(rq.created_at) = ?
      `;
      values.push(selectedMonth, selectedYear);
    } else {
      whereClause += ` AND YEAR(rq.created_at) = ?`;
      values.push(selectedYear);
    }

    // ── Search filter ─────────────────────────────
    if (search && search.trim()) {
      const like = `%${search.trim()}%`;

      whereClause += ` AND (
        rq.lead_id LIKE ?
        OR rq.customer_id LIKE ?
        OR rq.id LIKE ?
        OR CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) LIKE ?
        OR c.customerPhone LIKE ?
        OR c.customerEmail LIKE ?
      )`;

      values.push(like, like, like, like, like, like);
    }

    // ── Status filter (assuming rate_quotations has a status field) ──
    // If you don't have a status field, you can remove this or add one
    if (status && status.trim()) {
      whereClause += ` AND UPPER(rq.status) = ?`;
      values.push(status.trim().toUpperCase());
    }

    // ── Main query ────────────────────────────────
    const query = `
      SELECT
        rq.*,
        c.firstName,
        c.middleName,
        c.lastName,
        c.customerPhone,
        c.customerEmail,
        c.companyName,
        c.customerType,
        c.customerCategoryType,
        c.alternatePhone,
        c.countryName,
        c.customerCity,
        c.address,
        c.date_of_birth,
        c.anniversary,
        c.gender,
        c.state,
        c.pincode,
        CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS fullName
      FROM rate_quotations rq
      LEFT JOIN customers c ON c.id = rq.customer_id
      ${whereClause}
      ORDER BY rq.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [...values, limitNumber, offset]);

    // ── Parse JSON fields ─────────────────────────
    const parsedRows = rows.map((item) => ({
      ...item,
      vehicles:
        typeof item.vehicles === "string"
          ? JSON.parse(item.vehicles || "[]")
          : item.vehicles || [],
    }));

    // ── Total count ───────────────────────────────
    const countQuery = `
      SELECT COUNT(*) as total
      FROM rate_quotations rq
      LEFT JOIN customers c ON c.id = rq.customer_id
      ${whereClause}
    `;

    const [countResult] = await pool.query(countQuery, values);

    // ── Status counts (if you have status field) ──
    // Define your status list based on rate_quotations table
    const statusList = ["APPROVED", "PENDING", "REJECTED", "DRAFT"]; // Adjust based on your actual statuses

    const statusCountWhereClause =
      status && status.trim()
        ? whereClause.replace(` AND UPPER(rq.status) = ?`, "")
        : whereClause;

    const statusCountValues =
      status && status.trim() ? values.slice(0, -1) : values;

    const statusQuery = `
      SELECT
        rq.status,
        COUNT(*) as count
      FROM rate_quotations rq
      LEFT JOIN customers c ON c.id = rq.customer_id
      ${statusCountWhereClause}
      GROUP BY rq.status
    `;

    const [statusResult] = await pool.query(statusQuery, statusCountValues);

    const statusCounts = {};

    statusList.forEach((s) => {
      statusCounts[s] = 0;
    });

    statusResult.forEach((s) => {
      const key = (s.status || "").toUpperCase();
      if (Object.prototype.hasOwnProperty.call(statusCounts, key)) {
        statusCounts[key] = parseInt(s.count, 10);
      }
    });

    const totalRateQuotations = Object.values(statusCounts).reduce(
      (a, b) => a + b,
      0,
    );

    // ── Monthly stats ─────────────────────────────
    let monthlyStatsWhereClause = `WHERE rq.created_at IS NOT NULL`;
    let monthlyStatsValues = [];

    if (Array.isArray(advisorId)) {
      if (advisorId.length > 0) {
        const placeholders = advisorId.map(() => "?").join(",");
        monthlyStatsWhereClause += ` AND rq.advisor_id IN (${placeholders})`;
        monthlyStatsValues.push(...advisorId);
      } else {
        monthlyStatsWhereClause += ` AND 1 = 0`;
      }
    } else if (advisorId) {
      monthlyStatsWhereClause += ` AND rq.advisor_id = ?`;
      monthlyStatsValues.push(Number(advisorId));
    } else {
      monthlyStatsWhereClause += ` AND rq.advisor_id IS NOT NULL`;
    }

    monthlyStatsWhereClause += ` AND YEAR(rq.created_at) = ?`;
    monthlyStatsValues.push(selectedYear);

    const [monthlyStats] = await pool.query(
      `
        SELECT
          DATE_FORMAT(rq.created_at, '%Y-%m') AS month,
          MONTHNAME(rq.created_at) AS monthName,
          YEAR(rq.created_at) AS year,
          COUNT(*) AS rateQuotationCount
        FROM rate_quotations rq
        ${monthlyStatsWhereClause}
        GROUP BY DATE_FORMAT(rq.created_at, '%Y-%m'), MONTHNAME(rq.created_at), YEAR(rq.created_at)
        ORDER BY month ASC
      `,
      monthlyStatsValues,
    );

    // ── Advisor names ─────────────────────────────
    const uniqueAdvisorIds = [
      ...new Set(
        parsedRows.map((r) => r.advisor_id).filter((id) => id != null),
      ),
    ];

    let advisorMap = {};

    if (uniqueAdvisorIds.length > 0) {
      try {
        const placeholders = uniqueAdvisorIds.map(() => "?").join(",");
        const [advisors] = await hrmsPool.query(
          `
            SELECT id, aliasName
            FROM users
            WHERE id IN (${placeholders})
          `,
          uniqueAdvisorIds,
        );
        advisors.forEach((a) => {
          advisorMap[a.id] = a;
        });
      } catch (err) {
        console.error("hrmsPool advisor fetch failed:", err.message);
      }
    }

    const rateList = parsedRows.map((rate) => ({
      ...rate,
      advisorShortName: advisorMap[rate.advisor_id]?.aliasName ?? null,
    }));

    return {
      rateList,
      total: countResult[0].total,
      page: pageNumber,
      totalPages: Math.ceil(countResult[0].total / limitNumber),
      hasNextPage: pageNumber < Math.ceil(countResult[0].total / limitNumber),
      selectedMonth,
      selectedYear,
      selectedStatus: status ? status.trim().toUpperCase() : null,
      statusCounts,
      totalRateQuotations,
      monthlyStats,
    };
  } catch (error) {
    console.error("getAllRateQuotationModel error:", error);
    throw error;
  }
};
