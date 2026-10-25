import { hrmsPool, pool } from "../../config/mySqlDB.js";

export const getMonthlyEnquiry = async (year, cityIds = []) => {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) return [];

    let whereClause = `WHERE enquiryTime IS NOT NULL`;
    let values = [];
    if (year) {
      whereClause += ` AND YEAR(enquiryTime) = ?`;
      values.push(year);
    }
    if (cityIds && cityIds.length > 0) {
      const placeholders = cityIds.map(() => "?").join(",");
      whereClause += ` AND city_id IN (${placeholders})`;
      values.push(...cityIds);
    }

    const query = `
      SELECT 
        MONTH(enquiryTime) AS month,
        DAY(enquiryTime)   AS day,
        COUNT(id)          AS total
      FROM leads
      ${whereClause}
      GROUP BY MONTH(enquiryTime), DAY(enquiryTime)
      ORDER BY month, day
    `;

    const [rows] = await pool.execute(query, values);

    const monthMap = {};
    rows.forEach((row) => {
      const m = row.month;
      if (!monthMap[m]) monthMap[m] = { days: 0, total: 0 };
      monthMap[m].days += 1;
      monthMap[m].total += Number(row.total);
    });

    const result = rows.map((row) => {
      const { days, total } = monthMap[row.month];
      const avg = days > 0 ? Math.round(total / days) : 0;
      return { ...row, avg };
    });

    return result;
  } catch (error) {
    console.error("❌ Model Error:", error.message);
    throw error;
  }
};

export const getLeadCountByDateForYear = async (
  year = new Date().getFullYear(),
) => {
  try {
    const [result] = await pool.execute(
      `SELECT 
        DATE(enquiryTime) as date,
        COUNT(*) as leadCount
       FROM leads
       WHERE 
        YEAR(enquiryTime) = ?
       GROUP BY DATE(enquiryTime)
       ORDER BY DATE(enquiryTime) ASC`,
      [year],
    );

    if (result.length === 0) {
      return { success: true, year, avgLeadsPerDay: 0, data: [] };
    }

    const totalLeads = result.reduce((sum, row) => sum + row.leadCount, 0);
    const totalDays = result.length;
    const avgLeadsPerDay = parseFloat((totalLeads / totalDays).toFixed(2));

    return {
      success: true,
      year,
      totalLeads,
      totalDays,
      avgLeadsPerDay,
      data: result.map((row) => ({
        date: row.date,
        leadCount: row.leadCount,
      })),
    };
  } catch (error) {
    console.error("getLeadCountByDateForYear error:", error);
    throw error;
  }
};

export const getPreSalesLeadAssignmentReport = async (cityIds, month, year) => {
  month = month || new Date().getMonth() + 1;
  year = year || new Date().getFullYear();

  const totalDaysInMonth = new Date(year, month, 0).getDate();

  if (!cityIds || cityIds.length === 0) {
    return { success: false, message: "No cities assigned to this user" };
  }
  const cityPlaceholders = cityIds.map(() => "?").join(",");
  const [advisorUsers] = await hrmsPool.execute(
    `SELECT 
     u.id,
     CONCAT_WS(' ', u.aliasName) AS adviser_name
   FROM users u
   INNER JOIN roles r ON u.role_id = r.id
   INNER JOIN access_control ac ON ac.employee_id = u.id
   INNER JOIN access_control_cities acc ON acc.access_control_id = ac.id
   WHERE r.role_name = 'Travel Advisor'
     AND acc.city_id IN (${cityPlaceholders})
     AND u.is_active = 1`,
    cityIds,
  );

  if (!advisorUsers.length) {
    return {
      success: true,
      month,
      year,
      totalDaysInMonth,
      data: [],
      teamTotal: null,
    };
  }

  const advisorIds = advisorUsers.map((u) => u.id);
  const advisorPlaceholders = advisorIds.map(() => "?").join(",");

  // Step 3 — Har adviser ko date-wise kitne leads aaye
  const [leadRows] = await pool.execute(
    `SELECT 
      l.advisor_id,
      DAY(l.enquiryTime) AS day,
      COUNT(l.id) AS total_leads,
      SUM(CASE WHEN l.status = 'Book' THEN 1 ELSE 0 END) AS booked_leads
   FROM leads l
   WHERE 
      MONTH(l.enquiryTime) = ?
      AND YEAR(l.enquiryTime) = ?
      AND l.advisor_id IN (${advisorPlaceholders})
      AND l.city_id IN (${cityPlaceholders})
   GROUP BY 
      l.advisor_id,
      DAY(l.enquiryTime)
   ORDER BY 
      l.advisor_id ASC,
      DAY(l.enquiryTime) ASC`,
    [month, year, ...advisorIds, ...cityIds],
  );

  // Step 4 — Har adviser ka base structure
  const adviserMap = {};
  advisorUsers.forEach((u) => {
    adviserMap[u.id] = {
      adviser_id: u.id,
      adviser_name: u.adviser_name,
      total_leads: 0,
      total_booked: 0,
      active_days: new Set(),
      days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
        day: i + 1,
        leads: 0,
        booked: 0,
      })),
    };
  });

  // Step 5 — Leads data fill karo
  // Step 5 — Leads data fill karo
  const filledDays = {}; // track karo kaunse days mein data aaya

  leadRows.forEach((row) => {
    const adviser = adviserMap[row.advisor_id];
    if (!adviser) return;

    const dayIndex = row.day - 1;
    adviser.days[dayIndex].leads = Number(row.total_leads);
    adviser.days[dayIndex].booked = Number(row.booked_leads);
    adviser.total_leads += Number(row.total_leads);
    adviser.total_booked += Number(row.booked_leads);
    adviser.active_days.add(row.day);
  });

  // Step 6 — Final format
  const data = Object.values(adviserMap).map((adviser) => ({
    adviser_id: adviser.adviser_id,
    adviser_name: adviser.adviser_name,
    total_leads: adviser.total_leads,
    total_booked: adviser.total_booked,
    avg_leads_per_day:
      adviser.active_days.size > 0
        ? parseFloat(
            (adviser.total_leads / adviser.active_days.size).toFixed(2),
          )
        : "-",
    cntb_percentage:
      adviser.total_leads > 0
        ? parseFloat(
            ((adviser.total_booked / adviser.total_leads) * 100).toFixed(1),
          )
        : "-",
    days: adviser.days.map((d) => ({
      day: d.day,
      leads: d.leads === 0 ? "-" : d.leads,
      booked: d.booked === 0 ? "-" : d.booked,
    })),
  }));

  // Step 7 — Team total
  const teamTotal = {
    total_leads: data.reduce((s, a) => s + a.total_leads, 0),
    total_booked: data.reduce((s, a) => s + a.total_booked, 0),
    days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
      day: i + 1,
      leads:
        data.reduce((s, a) => s + (Number(a.days[i].leads) || 0), 0) || "-",
      booked:
        data.reduce((s, a) => s + (Number(a.days[i].booked) || 0), 0) || "-",
    })),
  };

  return {
    success: true,
    month,
    year,
    totalDaysInMonth,
    data,
    teamTotal,
  };
};

export const getMonthlyStatusWiseReport = async (
  cityIds,
  month,
  year,
  advisorId = null,
) => {
  month = month || new Date().getMonth() + 1;
  year = year || new Date().getFullYear();

  let advisors = [];

  if (advisorId) {
    const advisorIds = Array.isArray(advisorId) ? advisorId : [advisorId];

    const placeholders = advisorIds.map(() => "?").join(",");

    const [rows] = await hrmsPool.execute(
      `SELECT 
        id,
        CONCAT_WS(' ', aliasName) AS adviser_name
     FROM users
     WHERE id IN (${placeholders})`,
      advisorIds,
    );

    advisors = rows;
  } else {
    // ✅ Manager/Others — city wise advisors
    if (!cityIds || cityIds.length === 0) {
      return { success: false, message: "No cities assigned" };
    }

    const cityPlaceholders = cityIds.map(() => "?").join(",");
    const [rows] = await hrmsPool.execute(
      `SELECT 
          u.id,
          CONCAT_WS(' ', u.aliasName) AS adviser_name
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       INNER JOIN access_control ac ON ac.employee_id = u.id
       INNER JOIN access_control_cities acc ON acc.access_control_id = ac.id
       WHERE r.role_name = 'Travel Advisor'
         AND acc.city_id IN (${cityPlaceholders})
         AND u.is_active = 1`,
      cityIds,
    );
    advisors = rows;
  }

  if (!advisors.length) {
    return { success: true, data: [], teamTotal: {} };
  }

  const advisorIds = advisors.map((a) => a.id);
  const advisorPlaceholders = advisorIds.map(() => "?").join(",");
  const cityPlaceholders = cityIds.map(() => "?").join(",");
  // ---------------- STATUS WISE LEADS ----------------
  let whereCity = "";
  let params = [month, year, ...advisorIds];

  if (cityIds && cityIds.length > 0) {
    const cityPlaceholders = cityIds.map(() => "?").join(",");
    whereCity = `AND l.city_id IN (${cityPlaceholders})`;
    params.push(...cityIds);
  }

  const [rows] = await pool.execute(
    `SELECT
      l.advisor_id,
      l.status,
      COUNT(l.id) AS total
   FROM leads l
   WHERE
      MONTH(l.pickupDateTime) = ?
      AND YEAR(l.pickupDateTime) = ?
      AND l.advisor_id IN (${advisorPlaceholders})
      ${whereCity}
   GROUP BY
      l.advisor_id,
      l.status`,
    params,
  );
  // ---------------- STRUCTURE ----------------
  const map = {};
  advisors.forEach((a) => {
    map[a.id] = {
      adviser_id: a.id,
      adviser_name: a.adviser_name,
      new: 0,
      kyc: 0,
      rfq: 0,
      hot: 0,
      vehn: 0,
      lost: 0,
      book: 0,
      blank: 0,
      total: 0,
    };
  });

  // ---------------- FILL DATA ----------------
  rows.forEach((r) => {
    const a = map[r.advisor_id];
    if (!a) return;

    const status = r.status?.toUpperCase().trim();
    const count = Number(r.total);

    if (status === "NEW") a.new += count;
    else if (status === "KYC") a.kyc += count;
    else if (status === "RFQ") a.rfq += count;
    else if (status === "HOT") a.hot += count;
    else if (status === "VEH-N" || status === "VEHN") a.vehn += count;
    else if (status === "LOST") a.lost += count;
    else if (status === "BOOK") a.book += count;
    else if (status === "BLANK") a.blank += count;

    a.total += count;
  });

  // ---------------- FINAL FORMAT ----------------
  const data = Object.values(map).map((a) => ({
    ...a,
    con: a.total ? ((a.book / a.total) * 100).toFixed(0) + "%" : "0%",
  }));

  // ---------------- TEAM TOTAL ----------------
  const teamTotal = {
    new: data.reduce((s, r) => s + r.new, 0),
    kyc: data.reduce((s, r) => s + r.kyc, 0),
    rfq: data.reduce((s, r) => s + r.rfq, 0),
    hot: data.reduce((s, r) => s + r.hot, 0),
    vehn: data.reduce((s, r) => s + r.vehn, 0),
    lost: data.reduce((s, r) => s + r.lost, 0),
    book: data.reduce((s, r) => s + r.book, 0),
    blank: data.reduce((s, r) => s + r.blank, 0),
    total: data.reduce((s, r) => s + r.total, 0),
  };

  return { success: true, month, year, data, teamTotal };
};

export const getTimeEnquiryReport = async (year) => {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) {
      return [];
    }

    const query = `
      SELECT 
        MONTH(enquiryTime) AS month,
        DAY(enquiryTime) AS day,
        HOUR(enquiryTime) AS hour,
        COUNT(id) AS total
      FROM leads
      WHERE YEAR(enquiryTime) = ?
      GROUP BY MONTH(enquiryTime), DAY(enquiryTime), HOUR(enquiryTime)
      ORDER BY month, day, hour
    `;

    const [rows] = await pool.execute(query, [year]);

    return rows;
  } catch (error) {
    console.error("❌ Time Enquiry Error:", error.message);
    throw error;
  }
};

export const getMonthlyDateWiseStatusReport = async (cityIds, month, year) => {
  month = month || new Date().getMonth() + 1;
  year = year || new Date().getFullYear();

  const totalDaysInMonth = new Date(year, month, 0).getDate();

  if (!cityIds || cityIds.length === 0) {
    return {
      success: false,
      message: "No cities assigned",
    };
  }

  const cityPlaceholders = cityIds.map(() => "?").join(",");

  // ---------------- GET TRAVEL ADVISORS ----------------
  const [advisors] = await hrmsPool.execute(
    `SELECT
        u.id,
        u.aliasName AS adviser_name
     FROM users u
     INNER JOIN roles r
        ON u.role_id = r.id
     INNER JOIN access_control ac
        ON ac.employee_id = u.id
     INNER JOIN access_control_cities acc
        ON acc.access_control_id = ac.id
     WHERE r.role_name = 'Travel Advisor'
       AND acc.city_id IN (${cityPlaceholders})
       AND u.is_active = 1`,
    cityIds,
  );

  if (!advisors.length) {
    return {
      success: true,
      month,
      year,
      data: [],
      teamTotal: {},
    };
  }

  const advisorIds = advisors.map((a) => a.id);
  const advisorPlaceholders = advisorIds.map(() => "?").join(",");

  // ---------------- DATE + STATUS + ADVISOR QUERY ----------------
  const [rows] = await pool.execute(
    `SELECT
      l.advisor_id,
      DAY(l.enquiryTime) AS day,
      l.status,
      COUNT(l.id) AS total
   FROM leads l
   WHERE MONTH(l.enquiryTime) = ?
     AND YEAR(l.enquiryTime) = ?
     AND l.advisor_id IN (${advisorPlaceholders})
     AND l.city_id IN (${cityPlaceholders})
   GROUP BY
     l.advisor_id,
     DAY(l.enquiryTime),
     l.status
   ORDER BY
     l.advisor_id ASC,
     DAY(l.enquiryTime) ASC`,
    [month, year, ...advisorIds, ...cityIds],
  );

  // ---------------- CREATE ADVISOR STRUCTURE ----------------
  const adviserMap = {};

  advisors.forEach((advisor) => {
    adviserMap[advisor.id] = {
      adviser_id: advisor.id,
      adviser_name: advisor.adviser_name,

      totals: {
        new: 0,
        kyc: 0,
        rfq: 0,
        hot: 0,
        vehn: 0,
        lost: 0,
        book: 0,
        blank: 0,
        total: 0,
      },

      days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
        day: i + 1,
        new: 0,
        kyc: 0,
        rfq: 0,
        hot: 0,
        vehn: 0,
        lost: 0,
        book: 0,
        blank: 0,
        total: 0,
      })),
    };
  });

  // ---------------- FILL DATA ----------------
  rows.forEach((r) => {
    const adviser = adviserMap[r.advisor_id];

    if (!adviser) return;

    const dayIndex = r.day - 1;
    const dayData = adviser.days[dayIndex];

    const status = r.status?.toUpperCase()?.trim();

    const count = Number(r.total);

    if (status === "NEW") {
      dayData.new += count;
      adviser.totals.new += count;
    } else if (status === "KYC") {
      dayData.kyc += count;
      adviser.totals.kyc += count;
    } else if (status === "RFQ") {
      dayData.rfq += count;
      adviser.totals.rfq += count;
    } else if (status === "HOT") {
      dayData.hot += count;
      adviser.totals.hot += count;
    } else if (status === "VEH-N" || status === "VEHN") {
      dayData.vehn += count;
      adviser.totals.vehn += count;
    } else if (status === "LOST") {
      dayData.lost += count;
      adviser.totals.lost += count;
    } else if (status === "BOOK") {
      dayData.book += count;
      adviser.totals.book += count;
    } else {
      dayData.blank += count;
      adviser.totals.blank += count;
    }

    dayData.total += count;
    adviser.totals.total += count;
  });

  // ---------------- FINAL DATA ----------------
  const data = Object.values(adviserMap);

  // ---------------- TEAM TOTAL ----------------
  const teamTotal = {
    new: 0,
    kyc: 0,
    rfq: 0,
    hot: 0,
    vehn: 0,
    lost: 0,
    book: 0,
    blank: 0,
    total: 0,
  };

  data.forEach((emp) => {
    Object.keys(teamTotal).forEach((key) => {
      teamTotal[key] += emp.totals[key] || 0;
    });
  });

  return {
    success: true,
    month,
    year,
    totalDaysInMonth,
    data,
    teamTotal,
  };
};

export const getLongWeekendReport = async (year, cityIds = []) => {
  try {
    const parsedYear = parseInt(year);
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      throw new Error(`Invalid year: ${year}`);
    }

    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) return [];

    const hasCityFilter = Array.isArray(cityIds) && cityIds.length > 0;

    const query = `
      SELECT 
        MONTH(pickupDateTime) AS month,
        DAY(pickupDateTime)   AS day,
        COUNT(id)             AS total
      FROM leads
      WHERE YEAR(pickupDateTime) = ?
      ${hasCityFilter ? `AND city_id IN (${cityIds.map(() => "?").join(", ")})` : ""}
      GROUP BY MONTH(pickupDateTime), DAY(pickupDateTime)
      ORDER BY month, day
    `;

    const params = hasCityFilter ? [parsedYear, ...cityIds] : [parsedYear];
    const [rows] = await pool.execute(query, params);

    const monthMap = {};

    rows.forEach((row) => {
      const m = row.month;
      if (!monthMap[m]) {
        monthMap[m] = { days: 0, total: 0 };
      }
      monthMap[m].days += 1;
      monthMap[m].total += Number(row.total);
    });

    const result = rows.map((row) => {
      const { days, total } = monthMap[row.month];
      const avg = days > 0 ? Math.round(total / days) : 0;
      return { ...row, avg };
    });

    return result;
  } catch (error) {
    console.error("❌ Model Error:", error.message);
    throw error;
  }
};
export const getMonthlyReportTwo = async (year, cityIds = []) => {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) return [];

    const monthNames = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let whereClause = `WHERE enquiryTime IS NOT NULL`;
    let values = [];

    if (year) {
      whereClause += ` AND YEAR(enquiryTime) = ?`;
      values.push(year);
    }
    if (cityIds && cityIds.length > 0) {
      const placeholders = cityIds.map(() => "?").join(",");
      whereClause += ` AND city_id IN (${placeholders})`;
      values.push(...cityIds);
    }

    const totalQuery = `
      SELECT 
        MONTH(enquiryTime) AS month,
        DAY(enquiryTime)   AS day,
        COUNT(id)          AS total
      FROM leads
      ${whereClause}
      GROUP BY MONTH(enquiryTime), DAY(enquiryTime)
      ORDER BY month, day
    `;

    const pickupQuery = `
      SELECT 
        MONTH(enquiryTime)    AS month,
        DAY(enquiryTime)      AS day,
        MONTH(pickupDateTime) AS pickupMonth,
        COUNT(id)             AS pickupCount
      FROM leads
      ${whereClause}
        AND pickupDateTime IS NOT NULL
      GROUP BY MONTH(enquiryTime), DAY(enquiryTime), MONTH(pickupDateTime)
      ORDER BY month, day, pickupMonth
    `;

    // ✅ New query — har pickup month ka total active days or total count
    const pickupMonthSummaryQuery = `
      SELECT
        MONTH(pickupDateTime)               AS pickupMonth,
        DAY(enquiryTime)                    AS enquiryDay,
        COUNT(id)                           AS pickupCount
      FROM leads
      ${whereClause}
        AND pickupDateTime IS NOT NULL
      GROUP BY MONTH(pickupDateTime), DAY(enquiryTime)
      ORDER BY pickupMonth, enquiryDay
    `;

    const [[totalRows], [pickupRows], [pickupSummaryRows]] = await Promise.all([
      pool.execute(totalQuery, values),
      pool.execute(pickupQuery, [...values]),
      pool.execute(pickupMonthSummaryQuery, [...values]),
    ]);

    // pickupMap — day wise counts
    const pickupMap = {};
    pickupRows.forEach((row) => {
      const key = `${row.month}-${row.day}`;
      if (!pickupMap[key]) pickupMap[key] = {};
      const monthName = monthNames[row.pickupMonth];
      pickupMap[key][monthName] = Number(row.pickupCount);
    });

    // ✅ pickupMonthSummary — har pickup month ka total or avg
    // { "Jun": { total: 10, activeDays: 1, avg: 10 }, "Aug": { total: 1, activeDays: 1, avg: 1 } }
    const pickupMonthSummary = {};
    pickupSummaryRows.forEach((row) => {
      const monthName = monthNames[row.pickupMonth];
      if (!pickupMonthSummary[monthName]) {
        pickupMonthSummary[monthName] = { total: 0, activeDays: 0 };
      }
      pickupMonthSummary[monthName].total += Number(row.pickupCount);
      pickupMonthSummary[monthName].activeDays += 1;
    });

    // avg calculate karo
    Object.keys(pickupMonthSummary).forEach((monthName) => {
      const { total, activeDays } = pickupMonthSummary[monthName];
      pickupMonthSummary[monthName].avg =
        activeDays > 0 ? Math.round(total / activeDays) : 0;
    });

    const result = totalRows.map((row) => {
      const key = `${row.month}-${row.day}`;
      return {
        month: monthNames[row.month],
        day: row.day,
        total: Number(row.total),
        pickupMonthCounts: pickupMap[key] || {},
      };
    });

    return {
      rows: result,
      // ✅ { "Jun": { total: 10, activeDays: 1, avg: 10 }, "Aug": { total: 1, activeDays: 1, avg: 1 } }
      pickupMonthSummary,
    };
  } catch (error) {
    console.error("❌ Model Error:", error.message);
    throw error;
  }
};

export const getAgingReport = async (year, cityIds = []) => {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) return [];

    let whereClause = `WHERE 1=1`;
    const values = [];

    if (year) {
      whereClause += ` AND YEAR(l.created_at) = ?`;
      values.push(year);
    }

    if (cityIds && cityIds.length > 0) {
      const placeholders = cityIds.map(() => "?").join(",");
      whereClause += ` AND l.city_id IN (${placeholders})`;
      values.push(...cityIds);
    }

    const query = `
      SELECT
          l.id AS lead_id,

          CONCAT(
              IFNULL(c.firstName,''),
              ' ',
              IFNULL(c.lastName,'')
          ) AS customer_name,

          c.customerPhone,

          DATE_FORMAT(
              DATE_ADD(l.created_at, INTERVAL 330 MINUTE),
              '%d %b %Y, %h:%i %p'
          ) AS new_time,

          DATE_FORMAT(
              DATE_ADD(
                  (
                      SELECT h.changed_at
                      FROM lead_status_history h
                      WHERE h.lead_id = l.id
                        AND h.new_status = 'RFQ'
                      ORDER BY h.changed_at ASC
                      LIMIT 1
                  ),
                  INTERVAL 330 MINUTE
              ),
              '%d %b %Y, %h:%i %p'
          ) AS rfq_time,

          TIMESTAMPDIFF(
              MINUTE,
              l.created_at,
              (
                  SELECT h.changed_at
                  FROM lead_status_history h
                  WHERE h.lead_id = l.id
                    AND h.new_status='RFQ'
                  ORDER BY h.changed_at ASC
                  LIMIT 1
              )
          ) AS total_minutes

      FROM leads l
      LEFT JOIN customers c
          ON c.id = l.customer_id

      ${whereClause}

      ORDER BY l.created_at DESC
    `;

    const [rows] = await pool.execute(query, values);

    return rows.map((row) => {
      let aging = "-";

      if (row.total_minutes !== null) {
        const days = Math.floor(row.total_minutes / (60 * 24));
        const hours = Math.floor((row.total_minutes % (60 * 24)) / 60);
        const minutes = row.total_minutes % 60;

        aging = `${days} Days ${hours} Hours ${minutes} Minutes`;
      }

      return {
        ...row,
        aging,
      };
    });
  } catch (error) {
    console.error("❌ Aging Report Error:", error.message);
    throw error;
  }
};

export const getWebsiteToLeadAgingReport = async (year) => {
  try {
    const startDate = `${year}-01-01 00:00:00`;
    const endDate = `${Number(year) + 1}-01-01 00:00:00`;

    console.log("========================================");
    console.log("🌐 WEBSITE TO LEAD AGING REPORT");
    console.log("📅 Year:", year);
    console.log("📅 Start Date:", startDate);
    console.log("📅 End Date:", endDate);
    console.log("🏙️ City Filter: DISABLED");
    console.log("📊 Showing TOTAL DATABASE DATA");
    console.log("========================================");

    /*
     * ============================================================
     * STEP 1
     * Total Website Records
     * ============================================================
     */

    const [websiteCount] = await pool.execute(
      `
        SELECT COUNT(*) AS total
        FROM website_gac
        WHERE created_at >= ?
          AND created_at < ?
      `,
      [startDate, endDate],
    );

    console.log("🌐 Website records:", websiteCount);

    /*
     * ============================================================
     * STEP 2
     * Website -> Customer phone matching
     *
     * City filter intentionally NOT used.
     * ============================================================
     */

    const [phoneMatchCount] = await pool.execute(
      `
        SELECT COUNT(DISTINCT w.id) AS total
        FROM website_gac w

        INNER JOIN customers c
          ON
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      COALESCE(c.customerPhone, ''),
                      ' ',
                      ''
                    ),
                    '-',
                    ''
                  ),
                  '+',
                  ''
                ),
                '(',
                ''
              ),
              ')',
              ''
            )
            =
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      COALESCE(w.phone, ''),
                      ' ',
                      ''
                    ),
                    '-',
                    ''
                  ),
                  '+',
                  ''
                ),
                '(',
                ''
              ),
              ')',
              ''
            )

        WHERE w.created_at >= ?
          AND w.created_at < ?
      `,
      [startDate, endDate],
    );

    console.log("📞 Website → Customer phone matches:", phoneMatchCount);

    /*
     * ============================================================
     * STEP 3
     * Website -> Customer -> Lead
     *
     * NO CITY FILTER
     * ============================================================
     */

    const [customerLeadCount] = await pool.execute(
      `
        SELECT COUNT(DISTINCT w.id) AS total

        FROM website_gac w

        INNER JOIN customers c
          ON
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      COALESCE(c.customerPhone, ''),
                      ' ',
                      ''
                    ),
                    '-',
                    ''
                  ),
                  '+',
                  ''
                ),
                '(',
                ''
              ),
              ')',
              ''
            )
            =
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      COALESCE(w.phone, ''),
                      ' ',
                      ''
                    ),
                    '-',
                    ''
                  ),
                  '+',
                  ''
                ),
                '(',
                ''
              ),
              ')',
              ''
            )

        INNER JOIN leads l
          ON l.customer_id = c.id

        WHERE w.created_at >= ?
          AND w.created_at < ?
      `,
      [startDate, endDate],
    );

    console.log("👤 Website → Customer → Lead matches:", customerLeadCount);

    /*
     * ============================================================
     * STEP 4
     * Lead must be created AFTER website enquiry
     *
     * NO CITY FILTER
     * ============================================================
     */

    const [afterWebsiteCount] = await pool.execute(
      `
        SELECT COUNT(DISTINCT w.id) AS total

        FROM website_gac w

        INNER JOIN customers c
          ON
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      COALESCE(c.customerPhone, ''),
                      ' ',
                      ''
                    ),
                    '-',
                    ''
                  ),
                  '+',
                  ''
                ),
                '(',
                ''
              ),
              ')',
              ''
            )
            =
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      COALESCE(w.phone, ''),
                      ' ',
                      ''
                    ),
                    '-',
                    ''
                  ),
                  '+',
                  ''
                ),
                '(',
                ''
              ),
              ')',
              ''
            )

        INNER JOIN leads l
          ON l.customer_id = c.id

        WHERE w.created_at >= ?
          AND w.created_at < ?

          AND l.created_at >= w.created_at
      `,
      [startDate, endDate],
    );

    console.log("⏱️ Lead created AFTER website enquiry:", afterWebsiteCount);

    console.log("========================================");
    console.log("🚀 Executing MAIN Website To Lead query...");
    console.log("========================================");

    /*
     * ============================================================
     * MAIN QUERY
     *
     * IMPORTANT:
     * No cityIds
     * No cityCondition
     *
     * It will return ALL matching database records.
     * ============================================================
     */

    const query = `
      WITH matched_leads AS (

        SELECT

          w.id AS website_gac_id,

          l.id AS lead_id,

          l.customer_id,

          l.created_at AS lead_created_at,

          ROW_NUMBER() OVER (
            PARTITION BY w.id
            ORDER BY l.created_at ASC
          ) AS rn

        FROM website_gac w

        INNER JOIN customers c
          ON
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      COALESCE(c.customerPhone, ''),
                      ' ',
                      ''
                    ),
                    '-',
                    ''
                  ),
                  '+',
                  ''
                ),
                '(',
                ''
              ),
              ')',
              ''
            )
            =
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      COALESCE(w.phone, ''),
                      ' ',
                      ''
                    ),
                    '-',
                    ''
                  ),
                  '+',
                  ''
                ),
                '(',
                ''
              ),
              ')',
              ''
            )

        INNER JOIN leads l
          ON l.customer_id = c.id

        WHERE

          w.created_at >= ?
          AND w.created_at < ?

          AND l.created_at >= w.created_at
      )

      SELECT

        w.id AS website_gac_id,

        ml.lead_id AS lead_id,

        w.name AS website_name,

        CONCAT(
          IFNULL(c.firstName, ''),
          ' ',
          IFNULL(c.lastName, '')
        ) AS lead_name,

        w.phone AS website_phone,

        c.customerPhone AS lead_phone,

        w.city AS website_city,

        DATE_FORMAT(
          DATE_ADD(
            w.created_at,
            INTERVAL 330 MINUTE
          ),
          '%d %b %Y, %h:%i %p'
        ) AS website_time,

        DATE_FORMAT(
          DATE_ADD(
            ml.lead_created_at,
            INTERVAL 330 MINUTE
          ),
          '%d %b %Y, %h:%i %p'
        ) AS lead_time,

        TIMESTAMPDIFF(
          MINUTE,
          w.created_at,
          ml.lead_created_at
        ) AS total_minutes

      FROM website_gac w

      INNER JOIN matched_leads ml
        ON ml.website_gac_id = w.id
        AND ml.rn = 1

      INNER JOIN customers c
        ON c.id = ml.customer_id

      WHERE
        w.created_at >= ?
        AND w.created_at < ?

      ORDER BY w.created_at DESC
    `;

    const finalValues = [startDate, endDate, startDate, endDate];

    console.log("📊 Query Values:", finalValues);

    const [rows] = await pool.execute(query, finalValues);

    console.log("📊 Website To Lead Aging Rows:", rows.length);

    /*
     * ============================================================
     * FORMAT AGING
     * ============================================================
     */

    const result = rows.map((row) => {
      let aging = "-";

      if (row.total_minutes !== null && row.total_minutes !== undefined) {
        const totalMinutes = Number(row.total_minutes);

        const days = Math.floor(totalMinutes / 1440);

        const hours = Math.floor((totalMinutes % 1440) / 60);

        const minutes = totalMinutes % 60;

        aging = `${days} Days ${hours} Hours ${minutes} Minutes`;
      }

      return {
        ...row,
        aging,
      };
    });

    console.log("📊 Final Report Data Count:", result.length);

    console.log("📊 Final Report Data:", result);

    console.log("========================================");
    console.log("✅ WEBSITE TO LEAD AGING REPORT DONE");
    console.log("========================================");

    return result;
  } catch (error) {
    console.error("❌ Website GAC To Lead Aging Report Error:", error);

    throw error;
  }
};
