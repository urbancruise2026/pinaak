import { hrmsPool, pool } from "../../config/mySqlDB.js";
import { generateUUID } from "../../utils/uuid.js";

export const LEAD_TABLE = "leads";
const safe = (value) => (value === undefined ? null : value);

export const LEAD_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  CUSTOMER_ID: "customer_id", // ✅ ADDED
  DATE: "date",
  ENQUIRY_TIME: "enquiryTime",
  FIRST_NAME: "firstName",
  MIDDLE_NAME: "middleName",
  LAST_NAME: "lastName",
  PHONE: "customerPhone",
  EMAIL: "customerEmail",
  COMPANY_NAME: "companyName",
  SOURCE: "source",
  ADDRESS: "address",
  PRESALES_ID: "presales_id",
  STATUS: "status",
  CUSTOMER_TYPE: "customerType",
  CUSTOMER_CATEGORY_TYPE: "customerCategoryType",
  SERVICE_TYPE: "serviceType",
  VEHICLE_vehicle2: "vehicle2",
  VEHICLE_TYPE: "vehicles",
  VEHICLE_vehicle3: "vehicle3",
  REQUIREMENT_VEHICLE: "requirementVehicle",
  OCCASION_TYPE: "occasion",
  PICKUP_DATETIME: "pickupDateTime",
  DROP_DATETIME: "dropDateTime",
  DAYS: "days",
  PICKUP_ADDRESS: "pickupAddress",
  DROP_ADDRESS: "dropAddress",
  MULTIPLE_PICKUP: "multiplepickup",
  MULTIPLE_DROP: "multipledrop",
  PASSENGER_TOTAL: "passengerTotal",
  PETS_NUMBER: "petsNumber",
  PETS_NAMES: "petsNames",
  KM: "km",
  SMALL_BAGGAGE: "smallBaggage",
  MEDIUM_BAGGAGE: "mediumBaggage",
  LARGE_BAGGAGE: "largeBaggage",
  AIRPORT_BAGGAGE: "airportBaggage",
  TOTAL_BAGGAGE: "totalBaggage",
  ITINERARY: "itinerary",
  TRIP_TYPE: "tripType",
  REMARKS: "remarks",
  MESSAGE: "message",
  DROP_CITY: "dropcity",
  PICKUP_CITY: "pickupcity",
  LOST_REASON: "lost_reason",
  ALTERNATE_PHONE: "alternatePhone",
  COUNTRY_NAME: "countryName",
  CITY_ID: "city_id",
  CITY: "city",
  CUSTOMER_CITY: "customerCity",
  VEHICLE1QUANTITY: "vehicle1Quantity",
  VEHICLE2QUANTITY: "vehicle2Quantity",
  VEHICLE3QUANTITY: "vehicle3Quantity",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
  LIVE_OR_EXPIRY: "liveorexpiry",
};

export const insertLead = async (data) => {
  try {
    const {
      customer_id,
      date,
      enquiryTime,

      source,
      presales_id,
      status,
      serviceType,
      vehicle2,
      vehicles,
      vehicle3,
      requirementVehicle,
      occasion,
      pickupDateTime,
      dropDateTime,
      days,
      pickupAddress,
      dropAddress,
      multiplepickup,
      multipledrop,
      passengerTotal,
      petsNumber,
      petsNames,
      km,
      smallBaggage,
      mediumBaggage,
      largeBaggage,
      airportBaggage,
      totalBaggage,
      itinerary,
      tripType,
      remarks,
      message,
      dropcity,
      pickupcity,
      lost_reason,
      city_id,
      city,
      vehicle1Quantity,
      vehicle2Quantity,
      vehicle3Quantity,
    } = data;

    const leadUuid = generateUUID();

    // STRING SAFE
    const safe = (v) => (v === "" || v === undefined ? null : v);

    // INTEGER SAFE
    const int = (v) => Number(v) || 0;

    const liveorexpiry =
      pickupDateTime && new Date(pickupDateTime) <= new Date()
        ? "EXPIRY"
        : "LIVE";

    const values = [
      leadUuid,
      int(customer_id),
      safe(date),
      safe(enquiryTime),
      safe(source),
      safe(presales_id),
      safe(status),
      safe(serviceType),
      safe(vehicle2),
      safe(vehicles),
      safe(vehicle3),
      safe(requirementVehicle),
      safe(occasion),
      safe(pickupDateTime),
      safe(dropDateTime),
      int(days),
      safe(pickupAddress),
      safe(dropAddress),
      safe(multiplepickup),
      safe(multipledrop),
      int(passengerTotal),
      int(petsNumber),
      safe(petsNames),
      int(km),
      int(smallBaggage),
      int(mediumBaggage),
      int(largeBaggage),
      int(airportBaggage),
      int(totalBaggage),
      itinerary && Array.isArray(itinerary) ? JSON.stringify(itinerary) : null,
      safe(tripType),
      safe(remarks),
      safe(message),
      safe(dropcity),
      safe(pickupcity),
      safe(lost_reason),
      safe(city_id),
      safe(city),
      int(vehicle1Quantity),
      int(vehicle2Quantity),
      int(vehicle3Quantity),
      liveorexpiry,
    ];

    const sql = `
      INSERT INTO ${LEAD_TABLE} (
        ${LEAD_COLUMNS.UUID},
        ${LEAD_COLUMNS.CUSTOMER_ID},
        ${LEAD_COLUMNS.DATE},
        ${LEAD_COLUMNS.ENQUIRY_TIME},
        ${LEAD_COLUMNS.SOURCE},
        ${LEAD_COLUMNS.PRESALES_ID},
        ${LEAD_COLUMNS.STATUS},
        ${LEAD_COLUMNS.SERVICE_TYPE},
        ${LEAD_COLUMNS.VEHICLE_vehicle2},
        ${LEAD_COLUMNS.VEHICLE_TYPE},
        ${LEAD_COLUMNS.VEHICLE_vehicle3},
        ${LEAD_COLUMNS.REQUIREMENT_VEHICLE},
        ${LEAD_COLUMNS.OCCASION_TYPE},
        ${LEAD_COLUMNS.PICKUP_DATETIME},
        ${LEAD_COLUMNS.DROP_DATETIME},
        ${LEAD_COLUMNS.DAYS},
        ${LEAD_COLUMNS.PICKUP_ADDRESS},
        ${LEAD_COLUMNS.DROP_ADDRESS},
         ${LEAD_COLUMNS.MULTIPLE_PICKUP},
          ${LEAD_COLUMNS.MULTIPLE_DROP},
        ${LEAD_COLUMNS.PASSENGER_TOTAL},
        ${LEAD_COLUMNS.PETS_NUMBER},
        ${LEAD_COLUMNS.PETS_NAMES},
        ${LEAD_COLUMNS.KM},
        ${LEAD_COLUMNS.SMALL_BAGGAGE},
        ${LEAD_COLUMNS.MEDIUM_BAGGAGE},
        ${LEAD_COLUMNS.LARGE_BAGGAGE},
        ${LEAD_COLUMNS.AIRPORT_BAGGAGE},
        ${LEAD_COLUMNS.TOTAL_BAGGAGE},
        ${LEAD_COLUMNS.ITINERARY},
        ${LEAD_COLUMNS.TRIP_TYPE},
        ${LEAD_COLUMNS.REMARKS},
        ${LEAD_COLUMNS.MESSAGE},
        ${LEAD_COLUMNS.DROP_CITY},
        ${LEAD_COLUMNS.PICKUP_CITY},
        ${LEAD_COLUMNS.LOST_REASON},
        ${LEAD_COLUMNS.CITY_ID},
         ${LEAD_COLUMNS.CITY},
        ${LEAD_COLUMNS.VEHICLE1QUANTITY},
        ${LEAD_COLUMNS.VEHICLE2QUANTITY},
        ${LEAD_COLUMNS.VEHICLE3QUANTITY},
        ${LEAD_COLUMNS.LIVE_OR_EXPIRY}
      )
      VALUES (${values.map(() => "?").join(", ")})
    `;

    const [result] = await pool.execute(sql, values);

    return {
      success: true,
      id: result.insertId,
      uuid: leadUuid,
      customer_id,
      status,
      serviceType,
    };
  } catch (error) {
    console.error("Insert Lead Error:", error);
    throw error;
  }
};

export const checkCustomerByPhone = async (customerPhone) => {
  try {
    const sql = `
      SELECT id, uuid, customerPhone
      FROM customers
      WHERE RIGHT(REPLACE(REPLACE(customerPhone, ' ', ''), '+91', ''), 10) = ?
      LIMIT 1
    `;

    const [rows] = await pool.execute(sql, [customerPhone]);

    if (rows.length > 0) {
      return rows[0];
    }

    return null;
  } catch (error) {
    console.error("Check Customer Error:", error);
    throw error;
  }
};
export const createCustomers = async (data) => {
  try {
    // Dynamic duplicate check
    let checkSql = `
      SELECT id, uuid, customerPhone, customerEmail, 	address
      FROM customers
      WHERE customerPhone = ?
    `;
    const params = [data.customerPhone];
    if (data.customerEmail) {
      checkSql += ` OR customerEmail = ?`;
      params.push(data.customerEmail);
    }
    checkSql += ` LIMIT 1`;

    const [existing] = await pool.execute(checkSql, params);

    // If customer already exists
    if (existing.length > 0) {
      return {
        success: true,
        isExisting: true,
        message: "Customer already exists",
        customerId: existing[0].id,
        uuid: existing[0].uuid,
        existingCustomer: existing[0],
      };
    }

    // Create new customer
    const customerUuid = generateUUID();
    const insertSql = `
      INSERT INTO customers (
        uuid,
        firstName,
        middleName,
        lastName,
        customerPhone,
        customerEmail,
        companyName,
        customerType,
        customerCategoryType,
        alternatePhone,
        countryName,
        customerCity,
        address,
        date_of_birth,
        anniversary,
        gender,
        state,
        pincode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      customerUuid,
      data.firstName || null,
      data.middleName || null,
      data.lastName || null,
      data.customerPhone || null,
      data.customerEmail || null,
      data.companyName || null,
      data.customerType || null,
      data.customerCategoryType || null,
      data.alternatePhone || null,
      data.countryName || null,
      data.customerCity || null,
      data.address || null,
      data.date_of_birth || null,
      data.anniversary || null,
      data.gender || null,
      data.state || null,
      data.pincode || null,
    ];

    const [result] = await pool.execute(insertSql, values);

    return {
      success: true,
      isExisting: false,
      message: "Customer created successfully",
      customerId: result.insertId,
      uuid: customerUuid,
    };
  } catch (error) {
    console.error("Create Customer Error:", error);
    throw error;
  }
};
export const findLeadByUUID = async (uuid) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${LEAD_TABLE} WHERE ${LEAD_COLUMNS.UUID} = ?`,
      [uuid],
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Find Lead Error:", error);
    throw error;
  }
};

export const getLeads = async (
  page,
  limit,
  cityIds,
  search,
  presalesId,
  month,
  year,
  status,
  pickupDateTime,
  dropDateTime,
  liveorexpiry,
  ageFilter,
) => {
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const offset = (pageNumber - 1) * limitNumber;

  const now = new Date();
  const selectedMonth = month ? parseInt(month, 10) : null;
  const selectedYear = year ? parseInt(year, 10) : now.getFullYear();

  let whereClause = `WHERE (l.unwanted_status IS NULL OR l.unwanted_status != 'unwanted')`;
  let values = [];

  if (presalesId && Number(presalesId) > 0) {
    whereClause += ` AND l.presales_id = ?`;
    values.push(presalesId);
  }

  if (selectedMonth) {
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 1);
    whereClause += ` AND l.created_at >= ? AND l.created_at < ?`;
    values.push(startDate, endDate);
  }

  if (cityIds && cityIds.length > 0) {
    const placeholders = cityIds.map(() => "?").join(",");
    whereClause += ` AND l.city_id IN (${placeholders})`;
    values.push(...cityIds);
  }

  if (search && search.trim()) {
    const like = `%${search.trim()}%`;
    whereClause += ` AND (
      CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) LIKE ?
      OR c.customerEmail LIKE ?
      OR c.customerPhone LIKE ?
      OR c.alternatePhone LIKE ?
    )`;
    values.push(like, like, like, like);
  }

  let statusWhereClause = "";
  if (status && status.trim()) {
    statusWhereClause = ` AND l.status = ?`;
    whereClause += statusWhereClause;
    values.push(status.trim().toUpperCase());
  }

  if (liveorexpiry && liveorexpiry.trim()) {
    if (liveorexpiry.trim().toUpperCase() === "LIVE") {
      whereClause += ` AND l.pickupDateTime > NOW()`;
    } else if (liveorexpiry.trim().toUpperCase() === "EXPIRY") {
      whereClause += ` AND l.pickupDateTime <= NOW()`;
    }
  }

  if (ageFilter) {
    switch (ageFilter) {
      case "0-5":
        whereClause += ` AND DATEDIFF(CURDATE(), l.date) BETWEEN 0 AND 5`;
        break;

      case "6-10":
        whereClause += ` AND DATEDIFF(CURDATE(), l.date) BETWEEN 6 AND 10`;
        break;

      case "11+":
        whereClause += ` AND DATEDIFF(CURDATE(), l.date) >= 11`;
        break;
    }
  }

  if (pickupDateTime && dropDateTime) {
    whereClause += ` AND DATE(l.pickupDateTime) BETWEEN ? AND ?`;
    values.push(pickupDateTime, dropDateTime);
  } else if (pickupDateTime) {
    whereClause += ` AND DATE(l.pickupDateTime) >= ?`;
    values.push(pickupDateTime);
  } else if (dropDateTime) {
    whereClause += ` AND DATE(l.pickupDateTime) <= ?`;
    values.push(dropDateTime);
  }

  const statusCountWhereClause = statusWhereClause
    ? whereClause.replace(statusWhereClause, "")
    : whereClause;

  const statusCountValues =
    status && status.trim() ? values.slice(0, -1) : values;

  const leadsQuery = `
    SELECT 
      l.id,
      l.uuid,
      l.customer_id,
      l.advisor_id,
      l.presales_id,
      l.status,
      l.source,
      l.city_id,
      l.city,
      l.unwanted_status,
      l.created_at,
      l.updated_at,
      l.date,
      l.enquiryTime,
      l.serviceType,
      l.occasion,
      l.tripType,
      l.days,
      l.pickupDateTime,
      l.dropDateTime,
      l.pickupAddress,
      l.dropAddress,
      l.pickupcity,
      l.dropcity,
      l.multiplepickup,
      l.multipledrop,
      l.km,
      l.passengerTotal,
      l.petsNumber,
      l.petsNames,
      l.smallBaggage,
      l.mediumBaggage,
      l.largeBaggage,
      l.airportBaggage,
      l.totalBaggage,
      l.itinerary,
      l.vehicles,
      l.vehicle2,
      l.vehicle3,
      l.vehicle1Quantity,
      l.vehicle2Quantity,
      l.vehicle3Quantity,
      l.requirementVehicle,
      l.remarks,
      l.message,
      l.lost_reason,
      l.lostReasonDetails,
        DATEDIFF(CURDATE(), l.date) AS aged,

CASE
  WHEN l.pickupDateTime <= NOW()
  THEN 'EXPIRY'
  ELSE 'LIVE'
END AS liveorexpiry,
      c.uuid AS customer_uuid,
      CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS fullName,
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
    LEFT JOIN customers c ON l.customer_id = c.id
    ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const combinedCountQuery = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN l.status = 'NEW'   THEN 1 ELSE 0 END) AS new_count,
      SUM(CASE WHEN l.status = 'RFQ'   THEN 1 ELSE 0 END) AS rfq_count,
      SUM(CASE WHEN l.status = 'KYC'   THEN 1 ELSE 0 END) AS kyc_count,
      SUM(CASE WHEN l.status = 'HOT'   THEN 1 ELSE 0 END) AS hot_count,
      SUM(CASE WHEN l.status = 'VEH-N' THEN 1 ELSE 0 END) AS vehn_count,
      SUM(CASE WHEN l.status = 'LOST'  THEN 1 ELSE 0 END) AS lost_count,
      SUM(CASE WHEN l.status = 'BOOK'  THEN 1 ELSE 0 END) AS book_count
    FROM leads l
    LEFT JOIN customers c ON l.customer_id = c.id
    ${statusCountWhereClause}
  `;

  const [[leads], [countResult]] = await Promise.all([
    pool.query(leadsQuery, [...values, limitNumber, offset]),
    pool.query(combinedCountQuery, statusCountValues),
  ]);

  const row = countResult[0];
  const statusCounts = {
    NEW: parseInt(row.new_count, 10) || 0,
    RFQ: parseInt(row.rfq_count, 10) || 0,
    KYC: parseInt(row.kyc_count, 10) || 0,
    HOT: parseInt(row.hot_count, 10) || 0,
    "VEH-N": parseInt(row.vehn_count, 10) || 0,
    LOST: parseInt(row.lost_count, 10) || 0,
    BOOK: parseInt(row.book_count, 10) || 0,
  };

  const totalLeads = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const advisorIds = leads
    .map((l) => l.advisor_id)
    .filter((id) => id !== null && id !== undefined);

  const presalesIds = leads
    .map((l) => l.presales_id)
    .filter((id) => id !== null && id !== undefined);

  const allUserIds = [...new Set([...advisorIds, ...presalesIds])];
  let userMap = {};

  if (allUserIds.length > 0) {
    try {
      const placeholders = allUserIds.map(() => "?").join(",");
      const [users] = await hrmsPool.query(
        `SELECT id, aliasName, firstName, middleName, lastName, shortName
         FROM users
         WHERE id IN (${placeholders})`,
        allUserIds,
      );
      users.forEach((u) => {
        userMap[u.id] = u;
      });
    } catch (err) {
      console.error("hrmsPool user fetch failed:", err.message);
    }
  }

  const getName = (userId, type) => {
    const user = userMap[userId];
    if (!user) return null;
    const name =
      type === "advisor" ? user.aliasName || "" : user.shortName || "";
    return name.trim() || null;
  };

  // Fetch city names from hrmsPool using city_id present in leads
  const leadCityIds = leads
    .map((l) => l.city_id)
    .filter((id) => id !== null && id !== undefined);

  const uniqueCityIds = [...new Set(leadCityIds)];
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

  // ── Follow-ups batch fetch (lead_followups table se, sab leads ke liye ek saath) ──
  const leadIds = leads.map((l) => l.id).filter(Boolean);
  const followupsMap = {};

  if (leadIds.length > 0) {
    try {
      const placeholders = leadIds.map(() => "?").join(",");
      const [followupRows] = await pool.query(
        `SELECT id, leads_id, adviser_id, 
          DATE_FORMAT(followup_date, '%Y-%m-%d') AS followup_date,
          remark, created_at
   FROM lead_followups
   WHERE leads_id IN (${placeholders})
   ORDER BY followup_date DESC, created_at DESC`,
        leadIds,
      );

      followupRows.forEach((f) => {
        if (!followupsMap[f.leads_id]) {
          followupsMap[f.leads_id] = [];
        }
        followupsMap[f.leads_id].push(f);
      });
    } catch (err) {
      console.error("lead_followups batch fetch failed:", err.message);
    }
  }

  const getFollowups = (leadId) => followupsMap[leadId] || [];

  const leadsWithNames = leads.map((lead) => ({
    ...lead,
    advisorFullName: getName(lead.advisor_id, "advisor"),
    presalesFullName: getName(lead.presales_id, "presales"),
    cityName: getCityName(lead.city_id),
    follow_ups: getFollowups(lead.id), // ✅ naya table se attach
  }));

  return {
    leads: leadsWithNames,
    total: parseInt(row.total, 10),
    page: pageNumber,
    totalPages: Math.ceil(parseInt(row.total, 10) / limitNumber),
    selectedMonth,
    selectedYear,
    selectedStatus: status ? status.trim().toUpperCase() : null,
    statusCounts,
    totalLeads,
  };
};

export const updateLeadUnwantedStatus = async (leadId, status) => {
  try {
    // validation
    if (!leadId) {
      throw new Error("leadId is required");
    }

    if (!["wanted", "unwanted"].includes(status)) {
      throw new Error("Invalid status value");
    }

    const [result] = await pool.execute(
      `UPDATE leads 
       SET unwanted_status = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, leadId],
    );

    return result;
  } catch (error) {
    console.error("updateLeadUnwantedStatus error:", error);
    throw error;
  }
};

export const getAllUnwantedLeadsModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.*,

        c.uuid AS customer_uuid,
        TRIM(CONCAT_WS(' ', c.firstName, c.middleName, c.lastName)) AS fullName,
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

      WHERE l.unwanted_status = 'unwanted'
      ORDER BY l.updated_at DESC
    `);

    return rows;
  } catch (error) {
    console.error("getAllUnwantedLeadsModel error:", error);
    throw error;
  }
};

export const updateLeadById = async (leadId, data) => {
  if (!leadId) throw new Error("Lead ID is required");

  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  const sanitizedData = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
      sanitizedData[key] = JSON.stringify(value); // Array → '["jhv","hgg"]'
    } else {
      sanitizedData[key] = value;
    }
  }

  const sanitizedFields = Object.keys(sanitizedData);
  const setClause = sanitizedFields.map((key) => `\`${key}\` = ?`).join(", ");
  const values = [...Object.values(sanitizedData), leadId];
  const [result] = await pool.query(
    `UPDATE leads SET ${setClause} WHERE id = ?`,
    values,
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query(`SELECT * FROM leads WHERE id = ?`, [leadId]);
  return rows[0];
};

export const updateCustomerById = async (customerId, data) => {
  if (!customerId) throw new Error("Customer ID is required");

  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  // ✅ Same sanitization
  const sanitizedData = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
      sanitizedData[key] = JSON.stringify(value);
    } else {
      sanitizedData[key] = value;
    }
  }

  const sanitizedFields = Object.keys(sanitizedData);
  const setClause = sanitizedFields.map((key) => `\`${key}\` = ?`).join(", ");
  const values = [...Object.values(sanitizedData), customerId];

  const [result] = await pool.query(
    `UPDATE customers SET ${setClause} WHERE id = ?`,
    values,
  );

  if (result.affectedRows === 0) return null;

  const [rows] = await pool.query(`SELECT * FROM customers WHERE id = ?`, [
    customerId,
  ]);
  return rows[0];
};

export const getLeadById = async (id) => {
  try {
    const query = `
      SELECT 
        l.*,
        c.uuid AS customer_uuid,
        CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS fullName,
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
      LEFT JOIN customers c ON l.customer_id = c.id
      WHERE l.id = ?
      LIMIT 1
    `;

    const [rows] = await pool.execute(query, [id]);

    if (!rows || rows.length === 0) return null;

    const lead = rows[0];

    // Itinerary parse
    if (lead.itinerary && typeof lead.itinerary === "string") {
      try {
        lead.itinerary = JSON.parse(lead.itinerary);
      } catch {
        lead.itinerary = [];
      }
    }

    // ── Presales name fetch (hrmsPool se) ──
    const userIds = [lead.advisor_id, lead.presales_id].filter(Boolean);

    if (userIds.length > 0) {
      try {
        const placeholders = userIds.map(() => "?").join(",");
        const [users] = await hrmsPool.query(
          `SELECT id, aliasName, firstName, middleName, lastName, shortName
           FROM users
           WHERE id IN (${placeholders})`,
          userIds,
        );

        const userMap = {};
        users.forEach((u) => {
          userMap[u.id] = u;
        });

        const getUser = (userId, type) => {
          const user = userMap[userId];
          if (!user) return null;
          return type === "advisor"
            ? (user.aliasName || "").trim() || null
            : (user.shortName || "").trim() || null;
        };

        lead.advisorFullName = getUser(lead.advisor_id, "advisor");
        lead.presalesFullName = getUser(lead.presales_id, "presales");
      } catch (err) {
        console.error("hrmsPool fetch failed in getLeadById:", err.message);
        lead.advisorFullName = null;
        lead.presalesFullName = null;
      }
    }

    // ── Follow-ups fetch (lead_followups table se) ──
    try {
      const [followups] = await pool.query(
        `SELECT id, leads_id, adviser_id, followup_date, remark, created_at
         FROM lead_followups
         WHERE leads_id = ?
         ORDER BY followup_date DESC, created_at DESC`,
        [lead.id],
      );

      lead.follow_ups = followups || [];
    } catch (err) {
      console.error("Followups fetch failed in getLeadById:", err.message);
      lead.follow_ups = [];
    }

    return lead;
  } catch (error) {
    console.error("getLeadById Error:", error);
    return null;
  }
};

// ─── FOLLOW-UP STATS (advisor-wise, from leads.follow_ups JSON) ───────────
export const getAdvisorFollowupStats = async (cityIds = []) => {
  try {
    let where = `
      WHERE lf.adviser_id IS NOT NULL
        AND lf.followup_date IS NOT NULL
    `;

    const values = [];

    if (cityIds && cityIds.length > 0) {
      const placeholders = cityIds.map(() => "?").join(",");
      where += ` AND l.city_id IN (${placeholders})`;
      values.push(...cityIds);
    }

    const [rows] = await pool.query(
      `
      SELECT
        lf.id,
        lf.leads_id,
        lf.adviser_id,
        lf.followup_date,
        lf.remark
      FROM lead_followups lf
      INNER JOIN leads l
        ON l.id = lf.leads_id
      ${where}
      `,
      values,
    );

    // IST date
    const todayStr = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const grouped = {};

    rows.forEach((row) => {
      const advisorId = Number(row.adviser_id);

      if (!advisorId) return;

      if (!grouped[advisorId]) {
        grouped[advisorId] = {
          total: 0,
          pending: 0,
          upcoming: 0,
        };
      }

      grouped[advisorId].total += 1;

      if (!row.followup_date) return;

      /*
       * followup_date database se DATE/DATETIME dono form me aa sakti hai.
       * Sirf date part compare kar rahe hain.
       */
      const followupDate = String(row.followup_date).slice(0, 10);

      if (followupDate <= todayStr) {
        grouped[advisorId].pending += 1;
      } else {
        grouped[advisorId].upcoming += 1;
      }
    });

    const advisorIds = Object.keys(grouped).map((id) => Number(id));

    let userMap = {};

    if (advisorIds.length > 0) {
      try {
        const placeholders = advisorIds.map(() => "?").join(",");

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
          advisorIds,
        );

        users.forEach((u) => {
          userMap[u.id] = u;
        });
      } catch (err) {
        console.error("hrmsPool user fetch failed:", err.message);
      }
    }

    return advisorIds.map((advisorId) => ({
      advisorId,

      advisorName:
        (userMap[advisorId]?.aliasName || "").trim() || `Advisor ${advisorId}`,

      totalFollowups: grouped[advisorId].total,

      pendingFollowups: grouped[advisorId].pending,

      upcomingFollowups: grouped[advisorId].upcoming,
    }));
  } catch (error) {
    console.error("getAdvisorFollowupStats error:", error);

    throw error;
  }
};

export const getAdvisorFollowupDetails = async (advisorId) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        lf.id AS followup_id,
        lf.leads_id AS lead_id,
        lf.adviser_id,
        lf.followup_date,
        lf.remark,
        lf.created_at,
        l.status,
        l.pickupDateTime,
        l.dropDateTime,
        CONCAT_WS(
          ' ',
          c.firstName,
          c.middleName,
          c.lastName
        ) AS fullName,
        c.customerPhone,
        c.customerEmail
      FROM lead_followups lf
      INNER JOIN leads l
        ON l.id = lf.leads_id
      LEFT JOIN customers c
        ON c.id = l.customer_id
      WHERE lf.adviser_id = ?
        AND lf.followup_date IS NOT NULL
      ORDER BY lf.followup_date DESC, lf.id DESC
      `,
      [advisorId],
    );

    const todayStr = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    const flattened = rows.map((row) => {
      const followupDate = String(row.followup_date || "").slice(0, 10);
      return {
        id: row.followup_id,
        followupId: row.followup_id,
        lead_id: row.lead_id,
        adviser_id: row.adviser_id,
        date: row.followup_date,
        text: row.remark,
        remark: row.remark,
        isPending: !!followupDate && followupDate <= todayStr,
        fullName: row.fullName,
        customerPhone: row.customerPhone,
        customerEmail: row.customerEmail,
        status: row.status,
        pickupDateTime: row.pickupDateTime,
        dropDateTime: row.dropDateTime,
        createdAt: row.created_at,
      };
    });
    return flattened;
  } catch (error) {
    console.error("getAdvisorFollowupDetails error:", error);
    throw error;
  }
};

export const insertLeadStatusHistory = async ({
  lead_id,
  old_status,
  new_status,
  changed_by,
}) => {
  const [result] = await pool.query(
    `INSERT INTO lead_status_history
     (lead_id, old_status, new_status, changed_by)
     VALUES (?, ?, ?, ?)`,
    [lead_id, old_status, new_status, changed_by],
  );

  return result;
};

export const getRfqTimeByLeadId = async (leadId) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        l.created_at,
        h.changed_at AS rfq_at,
        TIMESTAMPDIFF(MINUTE, l.created_at, h.changed_at) AS rfq_minutes
      FROM leads l
      INNER JOIN lead_status_history h 
        ON h.lead_id = l.id AND h.new_status = 'RFQ'
      WHERE l.id = ?
      ORDER BY h.changed_at ASC
      LIMIT 1
      `,
      [leadId],
    );

    if (!rows.length) return null;
    const { created_at, rfq_at, rfq_minutes } = rows[0];
    const hours = Math.floor(rfq_minutes / 60);
    const minutes = rfq_minutes % 60;
    return {
      created_at,
      rfq_at,
      rfq_minutes,
      formatted: `${hours} Hours ${minutes} Minutes`,
    };
  } catch (error) {
    console.error("getRfqTimeByLeadId error:", error);
    throw error;
  }
};
