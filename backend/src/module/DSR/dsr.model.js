import { pool, hrmsPool } from "../../config/mySqlDB.js";

export const createDsr = async (payload) => {
  const {
    leadId,
    customerId,
    advisorId,
    telesales,
    dsrDate,
    fullName,
    bookingId,
    dsrVehicles,
    dsrCategory,
    vehNo,
    driver,
    vendorName,
    customerRate,
    customerToll,
    parkTax,
    gstAmt,
    total,
    tds,
    remainingAmount,
    vendorRate,
    vendorToll,
    vendorParkTax,
    customerToVendor,
    outstanding,
    paymentStatus,
    balanceAmount,
    rate,
    pay,
    finalBalance,
    before,
    final,
    gst,
    remarksTS,
    remarksMIS,
    feedbackByOfcs,
    feedbackByCustomer,
    googleRating,
    mobileAppRating,
    remarksbyAccounts,
    refundCancelShare,
    customer_amount,
    vendor_amount,
  } = payload;

  if (!leadId) throw new Error("Lead ID is required");
  if (!customerId) throw new Error("Customer ID is required");
  if (!dsrDate) throw new Error("DSR Date is required");

  // JSON fields
  const customerAmountValue =
    typeof customer_amount === "string"
      ? customer_amount
      : JSON.stringify(customer_amount || []);

  const vendorAmountValue =
    typeof vendor_amount === "string"
      ? vendor_amount
      : JSON.stringify(vendor_amount || []);

  try {
    const columns = [
      "lead_id",
      "customer_id",
      "advisor_id",
      "telesales",
      "dsr_date",
      "full_name",
      "bookingId",
      "dsr_vehicles",
      "dsr_category",
      "veh_no",
      "driver",
      "vendor_name",
      "customer_rate",
      "customer_toll",
      "park_tax",
      "gst_amt",
      "total",
      "tds",
      "remaining_amount",
      "vendor_rate",
      "vendor_toll",
      "vendor_park_tax",
      "customer_to_vendor",
      "outstanding",
      "payment_status",
      "balance_amount",
      "rate",
      "pay",
      "final_balance",
      "before_amt",
      "final_amt",
      "gst",
      "remarks_ts",
      "remarks_mis",
      "remarksbyAccounts",
      "refundCancelShare",
      "feedbackByOfcs",
      "feedbackByCustomer",
      "googleRating",
      "mobileAppRating",
      "customer_amount",
      "vendor_amount",
    ];

    const values = [
      leadId,
      customerId,
      advisorId ?? null,
      telesales ?? null,
      dsrDate,
      fullName ?? null,
      bookingId ?? null,
      dsrVehicles ?? null,
      dsrCategory ?? null,
      vehNo ?? null,
      driver ?? null,
      vendorName ?? null,
      customerRate ?? null,
      customerToll ?? null,
      parkTax ?? null,
      gstAmt ?? null,
      total ?? null,
      tds ?? null,
      remainingAmount ?? null,
      vendorRate ?? null,
      vendorToll ?? null,
      vendorParkTax ?? null,
      customerToVendor ?? null,
      outstanding ?? null,
      paymentStatus ?? null,
      balanceAmount ?? null,
      rate ?? null,
      pay ?? null,
      finalBalance ?? null,
      before ?? null,
      final ?? null,
      gst ?? null,
      remarksTS ?? null,
      remarksMIS ?? null,
      remarksbyAccounts ?? null,
      refundCancelShare ?? null,
      feedbackByOfcs ?? null,
      feedbackByCustomer ?? null,
      googleRating ?? null,
      mobileAppRating ?? null,
      customerAmountValue,
      vendorAmountValue,
    ];

    const placeholders = values.map(() => "?").join(", ");

    const query = `
      INSERT INTO dsrs (
        ${columns.join(", ")}
      )
      VALUES (${placeholders})
    `;

    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      throw new Error("DSR creation failed");
    }
    return {
      success: true,
      dsrId: result.insertId,
    };
  } catch (error) {
    console.error("createDsr error:", error);
    throw error;
  }
};
export const getDsrByLeadId = async (leadId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id FROM dsrs WHERE lead_id = ? LIMIT 1`,
      [leadId],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getDsrByLeadId error:", error);
    throw error;
  }
};

export const getAllDsrModel = async (
  advisorId,
  page,
  limit,
  cityIds,
  search,
  month,
  year,
  status,
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
        whereClause += ` AND d.advisor_id IN (${placeholders})`;
        values.push(...advisorId);
      } else {
        whereClause += ` AND 1 = 0`;
      }
    } else if (advisorId) {
      whereClause += ` AND d.advisor_id = ?`;
      values.push(Number(advisorId));
    } else {
      whereClause += ` AND d.advisor_id IS NOT NULL`;
    }

    // ── Month / Year filter ───────────────────────
    if (selectedMonth) {
      whereClause += ` 
        AND MONTH(d.created_at) = ? 
        AND YEAR(d.created_at) = ?
      `;
      values.push(selectedMonth, selectedYear);
    } else {
      whereClause += ` AND YEAR(d.created_at) = ?`;
      values.push(selectedYear);
    }

    // ── City filter ───────────────────────────────
    if (cityIds && cityIds.length > 0) {
      const placeholders = cityIds.map(() => "?").join(",");
      whereClause += ` AND l.city_id IN (${placeholders})`;
      values.push(...cityIds);
    }

    // ── Search filter ─────────────────────────────
    if (search && search.trim()) {
      const like = `%${search.trim()}%`;

      whereClause += ` AND (
        CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) LIKE ?
        OR c.customerPhone LIKE ?
        OR c.customerEmail LIKE ?
        OR d.veh_no LIKE ?
        OR d.bookingId LIKE ?
        OR d.vendor_name LIKE ?
        OR d.driver LIKE ?
      )`;

      values.push(like, like, like, like, like, like, like);
    }

    // ── Status filter ─────────────────────────────
    if (status && status.trim()) {
      whereClause += ` AND UPPER(d.payment_status) = ?`;
      values.push(status.trim().toUpperCase());
    }

    // ── Main query ────────────────────────────────
    const query = `
      SELECT
        d.*,

        CONCAT_WS(
          ' ',
          c.firstName,
          c.middleName,
          c.lastName
        ) AS fullName,

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

        l.pickupDateTime,
        l.dropDateTime,
        l.pickupcity,
        l.dropcity,
        l.itinerary,
        l.pickupAddress,
        l.dropAddress,
        l.occasion,
        l.days,
        l.passengerTotal

      FROM dsrs d
      LEFT JOIN customers c
        ON c.id = d.customer_id
      LEFT JOIN leads l
        ON l.id = d.lead_id

      ${whereClause}

      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [dsrs] = await pool.query(query, [...values, limitNumber, offset]);

    // ── Parse JSON fields ─────────────────────────
    const parsedDsrs = dsrs.map((dsr) => ({
      ...dsr,

      customer_amount:
        typeof dsr.customer_amount === "string"
          ? JSON.parse(dsr.customer_amount || "[]")
          : dsr.customer_amount || [],

      vendor_amount:
        typeof dsr.vendor_amount === "string"
          ? JSON.parse(dsr.vendor_amount || "[]")
          : dsr.vendor_amount || [],
    }));

    // ── Total count ───────────────────────────────
    const countQuery = `
      SELECT COUNT(*) as total
      FROM dsrs d
      LEFT JOIN customers c
        ON c.id = d.customer_id
      LEFT JOIN leads l
        ON l.id = d.lead_id
      ${whereClause}
    `;

    const [countResult] = await pool.query(countQuery, values);

    const statusList = ["PAID", "UNPAID", "PARTIAL"];
    const statusCountWhereClause =
      status && status.trim()
        ? whereClause.replace(` AND UPPER(d.payment_status) = ?`, "")
        : whereClause;

    const statusCountValues =
      status && status.trim() ? values.slice(0, -1) : values;

    const statusQuery = `
      SELECT
        d.payment_status AS status,
        COUNT(*) as count
      FROM dsrs d
      LEFT JOIN customers c
        ON c.id = d.customer_id
      LEFT JOIN leads l
        ON l.id = d.lead_id
      ${statusCountWhereClause}
      GROUP BY d.payment_status
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

    const totalDsr = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    // ── Monthly stats ─────────────────────────────
    let monthlyStatsWhereClause = `WHERE d.created_at IS NOT NULL`;
    let monthlyStatsValues = [];
    if (Array.isArray(advisorId)) {
      if (advisorId.length > 0) {
        const placeholders = advisorId.map(() => "?").join(",");
        monthlyStatsWhereClause += ` AND d.advisor_id IN (${placeholders})`;
        monthlyStatsValues.push(...advisorId);
      } else {
        monthlyStatsWhereClause += ` AND 1 = 0`;
      }
    } else if (advisorId) {
      monthlyStatsWhereClause += ` AND d.advisor_id = ?`;

      monthlyStatsValues.push(Number(advisorId));
    } else {
      monthlyStatsWhereClause += ` AND d.advisor_id IS NOT NULL`;
    }
    monthlyStatsWhereClause += ` AND YEAR(d.created_at) = ?`;
    monthlyStatsValues.push(selectedYear);
    const [monthlyStats] = await pool.query(
      `
        SELECT
          DATE_FORMAT(
            d.created_at,
            '%Y-%m'
          ) AS month,

          MONTHNAME(
            d.created_at
          ) AS monthName,

          YEAR(
            d.created_at
          ) AS year,

          COUNT(*) AS dsrCount

        FROM dsrs d
        ${monthlyStatsWhereClause}

        GROUP BY
          DATE_FORMAT(
            d.created_at,
            '%Y-%m'
          ),
          MONTHNAME(
            d.created_at
          ),
          YEAR(
            d.created_at
          )

        ORDER BY month ASC
        `,
      monthlyStatsValues,
    );

    // ── Advisor names ─────────────────────────────
    const uniqueAdvisorIds = [
      ...new Set(
        parsedDsrs.map((d) => d.advisor_id).filter((id) => id != null),
      ),
    ];

    let advisorMap = {};

    if (uniqueAdvisorIds.length > 0) {
      try {
        const placeholders = uniqueAdvisorIds.map(() => "?").join(",");

        const [advisors] = await hrmsPool.query(
          `
            SELECT
              id,
              aliasName
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

    const dsrList = parsedDsrs.map((dsr) => ({
      ...dsr,
      advisorShortName: advisorMap[dsr.advisor_id]?.aliasName ?? null,
    }));

    return {
      dsrList,
      total: countResult[0].total,
      page: pageNumber,
      totalPages: Math.ceil(countResult[0].total / limitNumber),
      hasNextPage: pageNumber < Math.ceil(countResult[0].total / limitNumber),
      selectedMonth,
      selectedYear,
      selectedStatus: status ? status.trim().toUpperCase() : null,
      statusCounts,
      totalDsr,
      monthlyStats,
    };
  } catch (error) {
    console.error("getAllDsrModel error:", error);
    throw error;
  }
};
