import { hrmsPool, pool } from "../../config/mySqlDB.js";

export const findTravelAdvisorsByCityId = async (cityId) => {
  if (!cityId) throw new Error("City ID is required");

  try {
    const [rows] = await hrmsPool.execute(
      `SELECT 
         u.id,
         u.aliasName,
         u.middleName,
         u.lastName,
         u.is_online
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       INNER JOIN sub_department sd ON u.subDepartment_id = sd.id
       INNER JOIN access_control ac ON ac.employee_id = u.id
       INNER JOIN access_control_cities acc ON acc.access_control_id = ac.id
       WHERE acc.city_id = ?
       AND LOWER(sd.subDepartment_name) = 'tele-sales'
       AND LOWER(r.role_name) = 'travel advisor'
       AND u.is_active = 1`,
      [cityId],
    );

    return rows.map((user) => ({
      id: user.id,
      fullName: [user.aliasName].filter(Boolean).join(" "),
      is_online: user.is_online,
    }));
  } catch (error) {
    console.error("findTravelAdvisorsByCityId error:", error);
    throw error;
  }
};

export const assignTravelAdvisorToLead = async (leadId, travelAdvisorId) => {
  if (!leadId) throw new Error("Lead ID is required");
  if (!travelAdvisorId) throw new Error("Travel Advisor ID is required");

  try {
    const [result] = await pool.execute(
      `UPDATE leads SET advisor_id = ? WHERE id = ?`,
      [travelAdvisorId, leadId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Lead not found");
    }

    return { success: true, leadId, travelAdvisorId };
  } catch (error) {
    console.error("assignTravelAdvisorToLead error:", error);
    throw error;
  }
};

export const getLeadsByAdvisorId = async (
  advisorId,
  page,
  limit,
  cityIds,
  search,
  month,
  year,
  status,
  ageFilter,
  daysFilter,
  paxFilter,
  liveorexpiry,
) => {
  try {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const now = new Date();

    const selectedMonth = month ? parseInt(month, 10) : null;

    const selectedYear = year ? parseInt(year, 10) : now.getFullYear();

    /* =====================================================
       BASE WHERE CLAUSE
    ====================================================== */

    let whereClause = `
      WHERE
        (l.unwanted_status IS NULL OR l.unwanted_status != 'unwanted')
        AND NOT EXISTS (
          SELECT 1
          FROM swap_leads sl
          WHERE sl.lead_id = l.id
        )
    `;

    let values = [];

    /* =====================================================
       ADVISOR FILTER
    ====================================================== */

    if (Array.isArray(advisorId)) {
      if (advisorId.length > 0) {
        const placeholders = advisorId.map(() => "?").join(",");

        whereClause += `
          AND l.advisor_id IN (${placeholders})
        `;

        values.push(...advisorId);
      } else {
        whereClause += ` AND 1 = 0`;
      }
    } else if (advisorId) {
      whereClause += ` AND l.advisor_id = ?`;
      values.push(Number(advisorId));
    } else {
      whereClause += ` AND l.advisor_id IS NOT NULL`;
    }

    /* =====================================================
       AGE FILTER
       SUPPORTS MULTIPLE CHECKBOX SELECTION
       
       Example:
       ["0-5", "11-15", "31-60"]
    ====================================================== */

    if (ageFilter) {
      let selectedAgeFilters = [];

      if (Array.isArray(ageFilter)) {
        selectedAgeFilters = ageFilter
          .map((age) => String(age).trim())
          .filter(Boolean);
      } else if (typeof ageFilter === "string") {
        /*
          If frontend sends:
          "0-5,11-15,31-60"
        */
        selectedAgeFilters = ageFilter
          .split(",")
          .map((age) => age.trim())
          .filter(Boolean);
      }

      if (selectedAgeFilters.length > 0) {
        const ageConditions = [];

        selectedAgeFilters.forEach((age) => {
          switch (age) {
            case "0-5":
              ageConditions.push(`DATEDIFF(CURDATE(), l.date) BETWEEN 0 AND 5`);
              break;

            case "6-10":
              ageConditions.push(
                `DATEDIFF(CURDATE(), l.date) BETWEEN 6 AND 10`,
              );
              break;

            case "11-15":
              ageConditions.push(
                `DATEDIFF(CURDATE(), l.date) BETWEEN 11 AND 15`,
              );
              break;

            case "16-30":
              ageConditions.push(
                `DATEDIFF(CURDATE(), l.date) BETWEEN 16 AND 30`,
              );
              break;

            case "31-60":
              ageConditions.push(
                `DATEDIFF(CURDATE(), l.date) BETWEEN 31 AND 60`,
              );
              break;

            case "60+":
              ageConditions.push(`DATEDIFF(CURDATE(), l.date) >= 60`);
              break;

            default:
              break;
          }
        });

        /*
          Multiple selected age ranges
          should work with OR.
        */

        if (ageConditions.length > 0) {
          whereClause += `
            AND (
              ${ageConditions.join(" OR ")}
            )
          `;
        }
      }
    }

    /* =====================================================
       DAYS FILTER
    ====================================================== */

    if (daysFilter) {
      const selectedDaysFilter = Array.isArray(daysFilter)
        ? daysFilter
        : [daysFilter];

      const daysConditions = [];

      selectedDaysFilter.forEach((day) => {
        const value = String(day).trim();

        if (
          ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(value)
        ) {
          daysConditions.push(`l.days = ${Number(value)}`);
        } else if (value === "11-15") {
          daysConditions.push(`l.days BETWEEN 11 AND 15`);
        } else if (value === "16-30") {
          daysConditions.push(`l.days BETWEEN 16 AND 30`);
        } else if (value === "31-60") {
          daysConditions.push(`l.days BETWEEN 31 AND 60`);
        } else if (value === "60+") {
          daysConditions.push(`l.days > 60`);
        }
      });

      if (daysConditions.length > 0) {
        whereClause += `
          AND (
            ${daysConditions.join(" OR ")}
          )
        `;
      }
    }

    /* =====================================================
       PAX FILTER
    ====================================================== */

    if (paxFilter) {
      const selectedPaxFilters = Array.isArray(paxFilter)
        ? paxFilter.map((p) => String(p).trim()).filter(Boolean)
        : [];

      const paxConditions = [];

      selectedPaxFilters.forEach((pax) => {
        switch (pax) {
          case "1-4":
            paxConditions.push(`l.passengerTotal BETWEEN 1 AND 4`);
            break;
          case "5-7":
            paxConditions.push(`l.passengerTotal BETWEEN 5 AND 7`);
            break;
          case "8-13":
            paxConditions.push(`l.passengerTotal BETWEEN 8 AND 13`);
            break;
          case "14-20":
            paxConditions.push(`l.passengerTotal BETWEEN 14 AND 20`);
            break;
          case "21-30":
            paxConditions.push(`l.passengerTotal BETWEEN 21 AND 30`);
            break;
          case "31-40":
            paxConditions.push(`l.passengerTotal BETWEEN 31 AND 40`);
            break;
          case "41-50":
            paxConditions.push(`l.passengerTotal BETWEEN 41 AND 50`);
            break;
          case "51-60":
            paxConditions.push(`l.passengerTotal BETWEEN 51 AND 60`);
            break;
          case "60+":
            paxConditions.push(`l.passengerTotal > 60`);
            break;
          default:
            break;
        }
      });

      if (paxConditions.length > 0) {
        whereClause += `
      AND (
        ${paxConditions.join(" OR ")}
      )
    `;
      }
    }

    /* =====================================================
       MONTH / YEAR FILTER
    ====================================================== */

    if (selectedMonth) {
      whereClause += `
        AND MONTH(l.pickupDateTime) = ?
        AND YEAR(l.pickupDateTime) = ?
      `;

      values.push(selectedMonth, selectedYear);
    } else {
      whereClause += `
        AND YEAR(l.pickupDateTime) = ?
      `;

      values.push(selectedYear);
    }

    /* =====================================================
       CITY FILTER
    ====================================================== */

    if (cityIds && cityIds.length > 0) {
      const placeholders = cityIds.map(() => "?").join(",");

      whereClause += `
        AND l.city_id IN (${placeholders})
      `;

      values.push(...cityIds);
    }

    /* =====================================================
       SEARCH FILTER
    ====================================================== */

    if (search && search.trim()) {
      const like = `%${search.trim()}%`;

      whereClause += `
        AND (
          CONCAT_WS(
            ' ',
            c.firstName,
            c.middleName,
            c.lastName
          ) LIKE ?

          OR c.customerEmail LIKE ?

          OR c.customerPhone LIKE ?

          OR c.alternatePhone LIKE ?
        )
      `;

      values.push(like, like, like, like);
    }

    /* =====================================================
       STATUS FILTER
    ====================================================== */

    if (status && status.trim()) {
      whereClause += `
        AND UPPER(l.status) = ?
      `;

      values.push(status.trim().toUpperCase());
    }

    /* =====================================================
       LIVE / EXPIRY FILTER
    ====================================================== */

    if (liveorexpiry && liveorexpiry.trim() && liveorexpiry !== "All") {
      const liveExpiryValue = liveorexpiry.trim().toUpperCase();

      if (liveExpiryValue === "LIVE") {
        whereClause += `
          AND l.pickupDateTime > NOW()
        `;
      } else if (liveExpiryValue === "EXPIRY") {
        whereClause += `
          AND l.pickupDateTime <= NOW()
        `;
      }
    }

    /* =====================================================
       MAIN LEADS QUERY
    ====================================================== */

    const query = `
      SELECT
        l.*,

        c.uuid AS customer_uuid,

        DATEDIFF(
          CURDATE(),
          l.date
        ) AS aged,

        CASE
          WHEN l.pickupDateTime <= NOW()
          THEN 'EXPIRY'
          ELSE 'LIVE'
        END AS liveorexpiry,

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
        c.pincode

      FROM leads l

      LEFT JOIN customers c
        ON l.customer_id = c.id

      ${whereClause}

      ORDER BY l.created_at DESC

      LIMIT ?
      OFFSET ?
    `;

    const [leads] = await pool.query(query, [...values, limitNumber, offset]);

    /* =====================================================
       COUNT QUERY
    ====================================================== */

    const countQuery = `
      SELECT COUNT(*) AS total

      FROM leads l

      LEFT JOIN customers c
        ON l.customer_id = c.id

      ${whereClause}
    `;

    const [countResult] = await pool.query(countQuery, values);

    /* =====================================================
       STATUS COUNTS
    ====================================================== */

    const statusList = ["NEW", "RFQ", "KYC", "HOT", "VEH-N", "LOST", "BOOK"];

    const statusCountWhereClause =
      status && status.trim()
        ? whereClause.replace(` AND UPPER(l.status) = ?`, "")
        : whereClause;

    const statusCountValues =
      status && status.trim() ? values.slice(0, -1) : values;

    const statusQuery = `
      SELECT
        l.status,
        COUNT(*) AS count

      FROM leads l

      LEFT JOIN customers c
        ON l.customer_id = c.id

      ${statusCountWhereClause}

      GROUP BY l.status
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

    const totalLeads = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    /* =====================================================
       MONTHLY STATS
    ====================================================== */

    let monthlyStatsWhereClause = `
      WHERE pickupDateTime IS NOT NULL

      AND (
        unwanted_status IS NULL
        OR unwanted_status != 'unwanted'
      )
    `;

    let monthlyStatsValues = [];

    if (Array.isArray(advisorId)) {
      if (advisorId.length > 0) {
        const placeholders = advisorId.map(() => "?").join(",");

        monthlyStatsWhereClause += `
          AND advisor_id IN (${placeholders})
        `;

        monthlyStatsValues.push(...advisorId);
      } else {
        monthlyStatsWhereClause += `
          AND 1 = 0
        `;
      }
    } else if (advisorId) {
      monthlyStatsWhereClause += `
        AND advisor_id = ?
      `;

      monthlyStatsValues.push(Number(advisorId));
    } else {
      monthlyStatsWhereClause += `
        AND advisor_id IS NOT NULL
      `;
    }

    monthlyStatsWhereClause += `
      AND YEAR(pickupDateTime) = ?
    `;

    monthlyStatsValues.push(selectedYear);

    const [monthlyStats] = await pool.query(
      `
        SELECT
          DATE_FORMAT(
            pickupDateTime,
            '%Y-%m'
          ) AS month,

          MONTHNAME(
            pickupDateTime
          ) AS monthName,

          YEAR(
            pickupDateTime
          ) AS year,

          COUNT(*) AS leadCount

        FROM leads

        ${monthlyStatsWhereClause}

        GROUP BY
          DATE_FORMAT(
            pickupDateTime,
            '%Y-%m'
          ),
          MONTHNAME(
            pickupDateTime
          ),
          YEAR(
            pickupDateTime
          )

        ORDER BY month ASC
      `,
      monthlyStatsValues,
    );

    /* =====================================================
       ADVISOR / PRESALES USERS
    ====================================================== */

    const advisorIds = leads
      .map((l) => l.advisor_id)
      .filter((id) => id != null);

    const presalesIds = leads
      .map((l) => l.presales_id)
      .filter((id) => id != null);

    const allUserIds = [...new Set([...advisorIds, ...presalesIds])];

    let userMap = {};

    if (allUserIds.length > 0) {
      try {
        const placeholders = allUserIds.map(() => "?").join(",");

        const [users] = await hrmsPool.query(
          `
              SELECT
                id,
                aliasName,
                firstName,
                middleName,
                lastName,
                shortName

              FROM users

              WHERE id IN (${placeholders})
            `,
          allUserIds,
        );

        users.forEach((u) => {
          userMap[u.id] = u;
        });
      } catch (err) {
        console.error("hrmsPool user fetch failed:", err.message);
      }
    }

    /* =====================================================
       GET USER NAME
    ====================================================== */

    const getName = (userId, type) => {
      const user = userMap[userId];

      if (!user) return null;

      const first =
        type === "advisor" ? user.aliasName || "" : user.shortName || "";

      return `${first}`.trim() || null;
    };

    /* =====================================================
       CITY NAMES
    ====================================================== */

    const leadCityIds = leads
      .map((l) => l.city_id)
      .filter((id) => id !== null && id !== undefined);

    const uniqueCityIds = [...new Set(leadCityIds)];

    let cityMap = {};

    if (uniqueCityIds.length > 0) {
      try {
        const placeholders = uniqueCityIds.map(() => "?").join(",");

        const [cities] = await hrmsPool.query(
          `
              SELECT
                id,
                city_name

              FROM city

              WHERE id IN (${placeholders})
            `,
          uniqueCityIds,
        );

        cities.forEach((c) => {
          cityMap[c.id] = c.city_name;
        });
      } catch (err) {
        console.error("hrmsPool city fetch failed:", err.message);
      }
    }

    /* =====================================================
       GET CITY NAME
    ====================================================== */

    const getCityName = (cityId) => {
      if (cityId === null || cityId === undefined) {
        return null;
      }

      return cityMap[cityId] || null;
    };

    /* =====================================================
       ADD NAMES TO LEADS
    ====================================================== */

    const leadsWithNames = leads.map((lead) => ({
      ...lead,

      advisorFullName: getName(lead.advisor_id, "advisor"),

      presalesFullName: getName(lead.presales_id, "presales"),

      cityName: getCityName(lead.city_id),
    }));

    /* =====================================================
       FINAL RESPONSE
    ====================================================== */

    const total = countResult[0].total;

    const totalPages = Math.ceil(total / limitNumber);

    return {
      leads: leadsWithNames,

      total,

      page: pageNumber,

      totalPages,

      hasNextPage: pageNumber < totalPages,

      selectedMonth,

      selectedYear,

      selectedStatus: status ? status.trim().toUpperCase() : null,

      statusCounts,

      totalLeads,

      monthlyStats,
    };
  } catch (error) {
    console.error("getLeadsByAdvisorId error:", error);

    throw error;
  }
};

export const getLeadStatusCountByPresalesId = async (presalesId) => {
  const [rows] = await pool.query(
    `SELECT 
      COUNT(*) AS totalLeads,
      SUM(status = 'NEW') AS new,
      SUM(status = 'KYC') AS kyc,
      SUM(status = 'RFQ') AS rfq,
      SUM(status = 'HOT') AS hot,
      SUM(status = 'VEH-N') AS veh_n,
      SUM(status = 'LOST') AS lost,
      SUM(status = 'BOOK') AS book
    FROM leads
    WHERE presales_id = ?`,
    [presalesId],
  );

  const data = rows[0];

  return {
    totalLeads: data.totalLeads,
    statusCount: {
      NEW: data.new || 0,
      KYC: data.kyc || 0,
      RFQ: data.rfq || 0,
      HOT: data.hot || 0,
      "VEH-N": data.veh_n || 0,
      LOST: data.lost || 0,
      BOOK: data.book || 0,
    },
  };
};

export const swapTravelAdvisorForLead = async (
  leadId,
  travelAdvisorId,
  swappedBy,
) => {
  if (!leadId) throw new Error("Lead ID is required");
  if (!travelAdvisorId) throw new Error("Travel Advisor ID is required");

  const [leadRows] = await pool.execute(
    `SELECT advisor_id FROM leads WHERE id = ?`,
    [leadId],
  );

  if (!leadRows.length) {
    throw new Error("Lead not found");
  }

  const oldAdvisorId = leadRows[0].advisor_id;

  const [result] = await pool.execute(
    `UPDATE leads SET advisor_id = ? WHERE id = ?`,
    [travelAdvisorId, leadId],
  );

  if (result.affectedRows === 0) {
    throw new Error("Lead update failed");
  }

  await pool.execute(
    `
    INSERT INTO swap_leads
    (
      lead_id,
      old_advisor_id,
      new_advisor_id,
      swapped_by,
      swapped_at
    )
    VALUES (?, ?, ?, ?, NOW())
    `,
    [leadId, oldAdvisorId, travelAdvisorId, swappedBy],
  );

  return {
    success: true,
    leadId,
    oldAdvisorId,
    newAdvisorId: travelAdvisorId,
  };
};

export const getSwapLeadsByAdvisorId = async (
  advisorId,
  page = 1,
  limit = 50,
  cityIds = [],
  search = "",
  month = null,
  year = null,
  status = null,
  ageFilter = null,
  daysFilter = null,
  paxFilter = null,
  liveorexpiry = null,
) => {
  // ─── Sanitize advisorId: supports single id, array of ids, or none ────
  let advisorFilterType = "none"; // "single" | "array" | "none"
  let safeAdvisorId = null;
  let safeAdvisorIds = [];

  if (Array.isArray(advisorId)) {
    safeAdvisorIds = advisorId
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id) && Number.isFinite(id));
    advisorFilterType = safeAdvisorIds.length > 0 ? "array" : "none";
  } else if (
    advisorId !== null &&
    advisorId !== undefined &&
    advisorId !== ""
  ) {
    const n = Number(advisorId);
    if (Number.isNaN(n)) {
      throw new Error("Advisor ID must be numeric");
    }
    safeAdvisorId = n;
    advisorFilterType = "single";
  }
  // else: "none" -> City Manager (zero advisors resolved, or explicit null) —
  // no single-advisor filter, cityIds scopes it instead

  const safeCityIds = Array.isArray(cityIds)
    ? cityIds
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id) && Number.isFinite(id))
    : [];

  const safeLimit = Math.max(1, parseInt(limit, 10) || 50);
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const now = new Date();

  const parsedYear = parseInt(year, 10);
  const selectedYear =
    year !== null && year !== undefined && !Number.isNaN(parsedYear)
      ? parsedYear
      : now.getFullYear();

  const parsedMonth = parseInt(month, 10);
  const selectedMonth =
    month !== null && month !== undefined && !Number.isNaN(parsedMonth)
      ? parsedMonth
      : null;

  // ─── Base WHERE ──────────────────────────────────────────────────────
  let whereClause = `WHERE (l.unwanted_status IS NULL OR l.unwanted_status != 'unwanted')`;
  let values = [];

  if (advisorFilterType === "single") {
    whereClause += ` AND sl.new_advisor_id = ?`;
    values.push(safeAdvisorId);
  } else if (advisorFilterType === "array") {
    const ph = safeAdvisorIds.map(() => "?").join(",");
    whereClause += ` AND sl.new_advisor_id IN (${ph})`;
    values.push(...safeAdvisorIds);
  }
  // "none" -> City Manager: no advisor restriction at all

  if (safeCityIds.length > 0) {
    const ph = safeCityIds.map(() => "?").join(",");
    whereClause += ` AND l.city_id IN (${ph})`;
    values.push(...safeCityIds);
  }

  if (selectedMonth) {
    whereClause += ` AND MONTH(l.pickupDateTime) = ? AND YEAR(l.pickupDateTime) = ?`;
    values.push(selectedMonth, selectedYear);
  } else {
    whereClause += ` AND YEAR(l.pickupDateTime) = ?`;
    values.push(selectedYear);
  }

  if (status && status.trim()) {
    whereClause += ` AND UPPER(l.status) = ?`;
    values.push(status.trim().toUpperCase());
  }

  if (search && search.trim()) {
    const like = `%${search.trim()}%`;
    whereClause += ` AND (
      CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) LIKE ?
      OR c.customerPhone LIKE ?
      OR c.customerEmail LIKE ?
      OR c.alternatePhone LIKE ?
    )`;
    values.push(like, like, like, like);
  }

  if (ageFilter) {
    const selectedAgeFilter = Array.isArray(ageFilter)
      ? ageFilter.map((a) => String(a).trim()).filter(Boolean)
      : [];

    const ageMap = {
      "0-5": `l.age BETWEEN 0 AND 5`,
      "6-10": `l.age BETWEEN 6 AND 10`,
      "11-15": `l.age BETWEEN 11 AND 15`,
      "16-30": `l.age BETWEEN 16 AND 30`,
      "31-60": `l.age BETWEEN 31 AND 60`,
      "60+": `l.age > 60`,
    };

    const ageConditions = selectedAgeFilter
      .map((a) => ageMap[a])
      .filter(Boolean);

    if (ageConditions.length > 0) {
      whereClause += `
      AND (
        ${ageConditions.join(" OR ")}
      )
    `;
    }
  }

  if (daysFilter) {
    const selectedDaysFilter = Array.isArray(daysFilter)
      ? daysFilter.map((d) => String(d).trim()).filter(Boolean)
      : [];

    const daysConditions = [];

    selectedDaysFilter.forEach((day) => {
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(day)) {
        daysConditions.push(`l.days = ${Number(day)}`);
      } else if (day === "11-15") {
        daysConditions.push(`l.days BETWEEN 11 AND 15`);
      } else if (day === "16-30") {
        daysConditions.push(`l.days BETWEEN 16 AND 30`);
      } else if (day === "31-60") {
        daysConditions.push(`l.days BETWEEN 31 AND 60`);
      } else if (day === "60+") {
        daysConditions.push(`l.days > 60`);
      }
    });

    if (daysConditions.length > 0) {
      whereClause += `
      AND (
        ${daysConditions.join(" OR ")}
      )
    `;
    }
  }

  if (paxFilter) {
    const selectedPaxFilter = Array.isArray(paxFilter)
      ? paxFilter.map((p) => String(p).trim()).filter(Boolean)
      : [];

    const paxMap = {
      "1-4": `l.passengerTotal BETWEEN 1 AND 4`,
      "5-7": `l.passengerTotal BETWEEN 5 AND 7`,
      "8-13": `l.passengerTotal BETWEEN 8 AND 13`,
      "14-20": `l.passengerTotal BETWEEN 14 AND 20`,
      "21-30": `l.passengerTotal BETWEEN 21 AND 30`,
      "31-40": `l.passengerTotal BETWEEN 31 AND 40`,
      "41-50": `l.passengerTotal BETWEEN 41 AND 50`,
      "51-60": `l.passengerTotal BETWEEN 51 AND 60`,
      "60+": `l.passengerTotal > 60`,
    };

    const paxConditions = selectedPaxFilter
      .map((p) => paxMap[p])
      .filter(Boolean);

    if (paxConditions.length > 0) {
      whereClause += `
      AND (
        ${paxConditions.join(" OR ")}
      )
    `;
    }
  }

  if (liveorexpiry && liveorexpiry !== "All") {
    if (liveorexpiry.toUpperCase() === "LIVE") {
      whereClause += ` AND l.pickupDateTime > NOW()`;
    } else if (liveorexpiry.toUpperCase() === "EXPIRY") {
      whereClause += ` AND l.pickupDateTime <= NOW()`;
    }
  }

  const [rows] = await pool.execute(
    `
    SELECT
      sl.id AS swap_id,
      sl.lead_id,
      sl.old_advisor_id,
      sl.new_advisor_id,
      sl.swapped_by,
      sl.swapped_at,
      l.*,
      DATEDIFF(CURDATE(), l.date) AS aged,
      CASE WHEN l.pickupDateTime <= NOW() THEN 'EXPIRY' ELSE 'LIVE' END AS liveorexpiry,
      CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS fullName,
      c.firstName, c.middleName, c.lastName,
      c.customerPhone, c.customerEmail,
      c.alternatePhone, c.companyName,
      c.customerType, c.customerCategoryType,
      c.countryName, c.customerCity,
      c.address, c.date_of_birth, c.anniversary,
      c.gender, c.state, c.pincode

    FROM swap_leads sl
    INNER JOIN leads l ON l.id = sl.lead_id
    LEFT JOIN customers c ON c.id = l.customer_id
    ${whereClause}
    ORDER BY sl.swapped_at DESC
    LIMIT ${safeLimit} OFFSET ${offset}
    `,
    values,
  );

  const [countResult] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM swap_leads sl
     INNER JOIN leads l ON l.id = sl.lead_id
     LEFT JOIN customers c ON c.id = l.customer_id
     ${whereClause}`,
    values,
  );

  const statusCountWhere = status?.trim()
    ? whereClause.replace(` AND UPPER(l.status) = ?`, "")
    : whereClause;
  const statusCountValues = status?.trim() ? values.slice(0, -1) : values;

  const [statusResult] = await pool.execute(
    `SELECT l.status, COUNT(*) as count
     FROM swap_leads sl
     INNER JOIN leads l ON l.id = sl.lead_id
     LEFT JOIN customers c ON c.id = l.customer_id
     ${statusCountWhere}
     GROUP BY l.status`,
    statusCountValues,
  );

  const statusList = ["NEW", "RFQ", "KYC", "HOT", "VEH-N", "LOST", "BOOK"];
  const statusCounts = Object.fromEntries(statusList.map((s) => [s, 0]));
  statusResult.forEach(({ status: s, count }) => {
    const key = (s || "").toUpperCase();
    if (key in statusCounts) statusCounts[key] = parseInt(count, 10);
  });
  const totalLeads = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // ─── Monthly Stats ─────────────────────────────────────────────────────
  let monthlyWhere = `WHERE YEAR(l.pickupDateTime) = ?`;
  let monthlyValues = [selectedYear];

  if (advisorFilterType === "single") {
    monthlyWhere += ` AND sl.new_advisor_id = ?`;
    monthlyValues.push(safeAdvisorId);
  } else if (advisorFilterType === "array") {
    const ph = safeAdvisorIds.map(() => "?").join(",");
    monthlyWhere += ` AND sl.new_advisor_id IN (${ph})`;
    monthlyValues.push(...safeAdvisorIds);
  }

  if (safeCityIds.length > 0) {
    const ph = safeCityIds.map(() => "?").join(",");
    monthlyWhere += ` AND l.city_id IN (${ph})`;
    monthlyValues.push(...safeCityIds);
  }

  const [monthlyStats] = await pool.execute(
    `SELECT 
       DATE_FORMAT(l.pickupDateTime, '%Y-%m') AS month,
       MONTHNAME(l.pickupDateTime) AS monthName,
       YEAR(l.pickupDateTime) AS year,
       COUNT(*) AS leadCount
     FROM swap_leads sl
     INNER JOIN leads l ON l.id = sl.lead_id
     ${monthlyWhere}
     GROUP BY DATE_FORMAT(l.pickupDateTime, '%Y-%m'), MONTHNAME(l.pickupDateTime), YEAR(l.pickupDateTime)
     ORDER BY month ASC`,
    monthlyValues,
  );

  // ─── Name & City resolution (hrmsPool) — mirrors getLeadsByAdvisorId ───
  const advisorIdsForNames = rows
    .flatMap((r) => [
      r.advisor_id,
      r.old_advisor_id,
      r.new_advisor_id,
      r.swapped_by,
    ])
    .filter((id) => id != null);
  const presalesIdsForNames = rows
    .map((r) => r.presales_id)
    .filter((id) => id != null);
  const allUserIds = [
    ...new Set([...advisorIdsForNames, ...presalesIdsForNames]),
  ];

  let userMap = {};
  if (allUserIds.length > 0) {
    try {
      const placeholders = allUserIds.map(() => "?").join(",");
      const [users] = await hrmsPool.query(
        `SELECT id, aliasName, firstName, middleName, lastName, shortName FROM users WHERE id IN (${placeholders})`,
        allUserIds,
      );
      users.forEach((u) => {
        userMap[u.id] = u;
      });
    } catch (err) {
      console.error("hrmsPool user fetch failed (swap):", err.message);
    }
  }

  const getName = (userId, type) => {
    const user = userMap[userId];
    if (!user) return null;
    const first =
      type === "advisor" ? user.aliasName || "" : user.shortName || "";
    return `${first} `.trim() || null;
  };

  const leadCityIds = rows
    .map((r) => r.city_id)
    .filter((id) => id !== null && id !== undefined);
  const uniqueCityIds = [...new Set(leadCityIds)];
  let cityMap = {};

  if (uniqueCityIds.length > 0) {
    try {
      const placeholders = uniqueCityIds.map(() => "?").join(",");
      const [cities] = await hrmsPool.query(
        `SELECT id, city_name FROM city WHERE id IN (${placeholders})`,
        uniqueCityIds,
      );
      cities.forEach((c) => {
        cityMap[c.id] = c.city_name;
      });
    } catch (err) {
      console.error("hrmsPool city fetch failed (swap):", err.message);
    }
  }

  const getCityName = (cityId) => {
    if (cityId === null || cityId === undefined) return null;
    return cityMap[cityId] || null;
  };

  const leadsWithNames = rows.map((lead) => ({
    ...lead,
    advisorFullName: getName(lead.advisor_id, "advisor"),
    presalesFullName: getName(lead.presales_id, "presales"),
    oldAdvisorName: getName(lead.old_advisor_id, "advisor"),
    newAdvisorName: getName(lead.new_advisor_id, "advisor"),
    swappedByName: getName(lead.swapped_by, "advisor"),
    cityName: getCityName(lead.city_id),
  }));

  return {
    leads: leadsWithNames,
    total: countResult[0].total,
    page: safePage,
    totalPages: Math.ceil(countResult[0].total / safeLimit),
    hasNextPage: safePage < Math.ceil(countResult[0].total / safeLimit),
    selectedMonth,
    selectedYear,
    selectedStatus: status ? status.trim().toUpperCase() : null,
    statusCounts,
    totalLeads,
    monthlyStats,
  };
};

export const findCitiesByZoneIds = async (zoneId) => {
  const [rows] = await hrmsPool.execute(
    `SELECT id, city_name FROM city WHERE zone_id = ?`,
    [zoneId],
  );

  return rows;
};

export const getHighPaxLeads = async (
  page,
  limit,
  paxThreshold = 6,
  cityIds,
  advisorId,
) => {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 20;
  const offset = (pageNumber - 1) * limitNumber;

  // ✅ paxThreshold hamesha number ho (galti se array/string aa jaye to bhi safe)
  const threshold = Number.isFinite(Number(paxThreshold))
    ? Number(paxThreshold)
    : 6;

  let whereClause = `
    WHERE (l.unwanted_status IS NULL OR l.unwanted_status != 'unwanted')
    AND l.passengerTotal > ?
  `;
  const values = [threshold];

  // ✅ Array.isArray check — pehle non-array aa jata to crash hota
  if (Array.isArray(cityIds) && cityIds.length > 0) {
    const safeCityIds = cityIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));

    if (safeCityIds.length > 0) {
      const placeholders = safeCityIds.map(() => "?").join(",");
      whereClause += ` AND l.city_id IN (${placeholders})`;
      values.push(...safeCityIds);
    }
  }

  if (advisorId && Number(advisorId) > 0) {
    whereClause += ` AND l.advisor_id = ?`;
    values.push(Number(advisorId));
  }

  // ✅ l.id aur l.created_at add kiye
  const leadsQuery = `
    SELECT 
      l.id,
      l.city_id,
      l.advisor_id,
      CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS customerName,
      l.passengerTotal AS pax,
      l.status,
      l.created_at,
      l.pickupDateTime,
      l.dropDateTime
    FROM leads l
    LEFT JOIN customers c ON l.customer_id = c.id
    ${whereClause}
    ORDER BY l.passengerTotal DESC, l.created_at DESC
    LIMIT ? OFFSET ?
  `;

  // ✅ count me customers JOIN ki zarurat nahi (whereClause sirf l.* use karta hai)
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM leads l
    ${whereClause}
  `;

  const [[leads], [countResult]] = await Promise.all([
    pool.query(leadsQuery, [...values, limitNumber, offset]),
    pool.query(countQuery, values),
  ]);

  const total = parseInt(countResult?.[0]?.total ?? 0, 10);

  const uniqueCityIds = [
    ...new Set(
      leads
        .map((l) => l.city_id)
        .filter((id) => id !== null && id !== undefined),
    ),
  ];

  let cityMap = {};
  if (uniqueCityIds.length > 0) {
    try {
      const placeholders = uniqueCityIds.map(() => "?").join(",");
      const [cities] = await hrmsPool.query(
        `SELECT id, city_name
         FROM city
         WHERE id IN (${placeholders})`,
        uniqueCityIds,
      );
      cities.forEach((c) => {
        cityMap[c.id] = c.city_name;
      });
    } catch (err) {
      console.error("hrmsPool city fetch failed:", err.message);
    }
  }

  const getCityName = (cityId) => {
    if (cityId === null || cityId === undefined) return null;
    return cityMap[cityId] || null;
  };

  const uniqueAdvisorIds = [
    ...new Set(
      leads
        .map((l) => l.advisor_id)
        .filter((id) => id !== null && id !== undefined),
    ),
  ];

  let advisorMap = {};
  if (uniqueAdvisorIds.length > 0) {
    try {
      const placeholders = uniqueAdvisorIds.map(() => "?").join(",");
      const [users] = await hrmsPool.query(
        `SELECT id, aliasName, firstName, middleName, lastName, shortName
         FROM users
         WHERE id IN (${placeholders})`,
        uniqueAdvisorIds,
      );
      users.forEach((u) => {
        advisorMap[u.id] = u;
      });
    } catch (err) {
      console.error("hrmsPool advisor fetch failed:", err.message);
    }
  }

  const getAdvisorName = (id) => {
    const user = advisorMap[id];
    if (!user) return null;

    const alias = (user.aliasName || "").trim();
    if (alias) return alias;

    const full = [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return full || (user.shortName || "").trim() || null;
  };

  const leadsFinal = leads.map(({ city_id, advisor_id, ...rest }) => ({
    ...rest,
    cityName: getCityName(city_id),
    advisorFullName: getAdvisorName(advisor_id),
  }));

  return {
    leads: leadsFinal,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber) || 1,
    paxThreshold: threshold,
  };
};

export const getLongDurationLeads = async (
  page,
  limit,
  daysThreshold = 5,
  cityIds,
  advisorId,
) => {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 20;
  const offset = (pageNumber - 1) * limitNumber;

  let whereClause = `
    WHERE (l.unwanted_status IS NULL OR l.unwanted_status != 'unwanted')
    AND l.days > ?
  `;

  const values = [daysThreshold];

  if (cityIds && cityIds.length > 0) {
    const placeholders = cityIds.map(() => "?").join(",");

    whereClause += `
      AND l.city_id IN (${placeholders})
    `;

    values.push(...cityIds);
  }

  if (advisorId && Number(advisorId) > 0) {
    whereClause += `
      AND l.advisor_id = ?
    `;

    values.push(Number(advisorId));
  }

  const leadsQuery = `
    SELECT
      l.id,
      l.city_id,
      l.advisor_id,
      CONCAT_WS(
        ' ',
        c.firstName,
        c.middleName,
        c.lastName
      ) AS customerName,
      l.days,
      l.status,
      l.pickupDateTime,
      l.dropDateTime
    FROM leads l
    LEFT JOIN customers c
      ON l.customer_id = c.id
    ${whereClause}
    ORDER BY l.id DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM leads l
    LEFT JOIN customers c
      ON l.customer_id = c.id
    ${whereClause}
  `;

  const leadQueryValues = [...values, limitNumber, offset];

  const [[leads], [countResult]] = await Promise.all([
    pool.query(leadsQuery, leadQueryValues),

    pool.query(countQuery, values),
  ]);

  const total = parseInt(countResult[0].total, 10);

  /* =====================================================
     CITY NAMES
  ====================================================== */

  const leadCityIds = leads
    .map((l) => l.city_id)
    .filter((id) => id !== null && id !== undefined);

  const uniqueCityIds = [...new Set(leadCityIds)];

  const cityMap = {};

  if (uniqueCityIds.length > 0) {
    try {
      const placeholders = uniqueCityIds.map(() => "?").join(",");

      const [cities] = await hrmsPool.query(
        `
            SELECT id, city_name
            FROM city
            WHERE id IN (${placeholders})
          `,
        uniqueCityIds,
      );

      cities.forEach((c) => {
        cityMap[c.id] = c.city_name;
      });
    } catch (err) {
      console.error("hrmsPool city fetch failed:", err.message);
    }
  }

  const getCityName = (cityId) => {
    if (cityId === null || cityId === undefined) {
      return null;
    }

    return cityMap[cityId] || null;
  };

  /* =====================================================
     ADVISOR NAMES
  ====================================================== */

  const leadAdvisorIds = leads
    .map((l) => l.advisor_id)
    .filter((id) => id !== null && id !== undefined);

  const uniqueAdvisorIds = [...new Set(leadAdvisorIds)];

  const advisorMap = {};

  if (uniqueAdvisorIds.length > 0) {
    try {
      const placeholders = uniqueAdvisorIds.map(() => "?").join(",");

      const [users] = await hrmsPool.query(
        `
            SELECT
              id,
              aliasName,
              firstName,
              middleName,
              lastName,
              shortName
            FROM users
            WHERE id IN (${placeholders})
          `,
        uniqueAdvisorIds,
      );

      users.forEach((u) => {
        advisorMap[u.id] = u;
      });
    } catch (err) {
      console.error("hrmsPool advisor fetch failed:", err.message);
    }
  }

  const getAdvisorName = (advisorId) => {
    const user = advisorMap[advisorId];

    if (!user) return null;

    return (user.aliasName || "").trim() || null;
  };

  /* =====================================================
     FINAL MERGE
  ====================================================== */

  const leadsFinal = leads.map(({ city_id, advisor_id, ...rest }) => ({
    ...rest,
    cityName: getCityName(city_id),
    advisorFullName: getAdvisorName(advisor_id),
  }));

  return {
    leads: leadsFinal,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
    daysThreshold,
  };
};
