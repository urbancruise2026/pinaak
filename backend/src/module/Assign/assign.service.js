// import { hrmsPool } from "../../config/mySqlDB.js";

// export const findZoneCityRegion = async (req) => {
//   const roleName = req.user.role_name?.toLowerCase();
//   const sub_department = req.user.subDepartment_name?.toLowerCase();

//   let result = {
//     advisorId: null,
//     zoneAdvisors: [],
//     zoneAdvisorIds: [],
//     cityIds: [],
//     accessDenied: false,
//   };

//   if (sub_department === "pre-sales") {
//     if (roleName === "pre-sales executive") {
//       let zoneIds = req.user.zone_ids;

//       let cityIds = req.user.city_ids || [];
//       const paramCityId = req.query.cityId
//         ? parseInt(req.query.cityId, 10)
//         : null;

//       if (paramCityId) {
//         cityIds = [paramCityId];
//       }

//       result.cityIds = cityIds;

//       const { zoneAdvisorIds, zoneAdvisors } =
//         await findAdvisorsByZoneIds(zoneIds);

//       result.zoneAdvisorIds = zoneAdvisorIds;
//       result.zoneAdvisors = zoneAdvisors;

//       return result;
//     }
//   } else if (roleName === "team leader-sales") {
//     // City Manager jaisa hi, bas zone ki jagah city_ids se scope hota hai
//     let cityIds = req.user.city_ids || [];

//     const paramCityId = req.query.cityId
//       ? parseInt(req.query.cityId, 10)
//       : null;

//     if (paramCityId) {
//       if (!cityIds.includes(paramCityId)) {
//         result.accessDenied = true;
//         return result;
//       }
//       cityIds = [paramCityId];
//     }

//     const { zoneAdvisorIds, zoneAdvisors } =
//       await findAdvisorsByCityIds(cityIds);

//     result.cityIds = cityIds;
//     result.zoneAdvisorIds = zoneAdvisorIds;
//     result.zoneAdvisors = zoneAdvisors;

//     // Default: apne saare advisors ka data
//     result.advisorId = zoneAdvisorIds;

//     // Frontend se specific advisor filter
//     const paramAdvisorId = req.query.advisorId
//       ? parseInt(req.query.advisorId, 10)
//       : null;

//     if (paramAdvisorId) {
//       if (!zoneAdvisorIds.includes(paramAdvisorId)) {
//         result.accessDenied = true;
//         return result;
//       }
//       result.advisorId = paramAdvisorId;
//     }

//     return result;
//   } else if (roleName === "travel advisor") {
//     result.advisorId = req.user.id;

//     let cityIds = req.user.city_ids || [];

//     const paramCityId = req.query.cityId
//       ? parseInt(req.query.cityId, 10)
//       : null;

//     if (paramCityId) {
//       if (!cityIds.includes(paramCityId)) {
//         result.accessDenied = true;
//         return result;
//       }
//       cityIds = [paramCityId];
//     }

//     result.cityIds = cityIds;

//     return result;
//   } else if (
//     ["city manager", "seo executive", "seo tl"].includes(
//       roleName?.toLowerCase(),
//     )
//   ) {
//     let zoneIds = req.user.zone_ids;

//     const paramZoneId = req.query.zoneId
//       ? parseInt(req.query.zoneId, 10)
//       : null;

//     if (paramZoneId) {
//       const allowedZones = Array.isArray(req.user.zone_ids)
//         ? req.user.zone_ids
//         : [req.user.zone_ids];

//       if (!allowedZones.includes(paramZoneId)) {
//         result.accessDenied = true;
//         return result;
//       }

//       zoneIds = [paramZoneId];
//     }

//     const { zoneAdvisorIds, zoneAdvisors } =
//       await findAdvisorsByZoneIds(zoneIds);

//     // Zone ki cities
//     let cityIds = await findCitiesByZoneId(zoneIds);

//     // Frontend se city filter
//     const paramCityId = req.query.cityId
//       ? parseInt(req.query.cityId, 10)
//       : null;

//     if (paramCityId) {
//       cityIds = [paramCityId];
//     }

//     result.zoneIds = zoneIds;
//     result.zoneAdvisorIds = zoneAdvisorIds;
//     result.zoneAdvisors = zoneAdvisors;
//     result.cityIds = cityIds;

//     // Default sab advisors
//     result.advisorId = zoneAdvisorIds;

//     // Frontend se advisor filter
//     const paramAdvisorId = req.query.advisorId
//       ? parseInt(req.query.advisorId, 10)
//       : null;

//     if (paramAdvisorId) {
//       if (!zoneAdvisorIds.includes(paramAdvisorId)) {
//         result.accessDenied = true;
//         return result;
//       }

//       result.advisorId = paramAdvisorId;
//     }

//     return result;
//   }
//   return result;
// };

import { hrmsPool } from "../../config/mySqlDB.js";

export const findZoneCityRegion = async (req) => {
  const roleName =
    req.user.role_name?.toLowerCase() ||
    (req.user.access_role?.toLowerCase() === "super_admin"
      ? "super_admin"
      : null);

  const sub_department = req.user.subDepartment_name?.toLowerCase();

  let result = {
    advisorId: null,
    zoneAdvisors: [],
    zoneAdvisorIds: [],
    cityIds: [],
    regionIds: [],
    accessDenied: false,
  };

  if (sub_department === "pre-sales") {
    if (roleName === "pre-sales executive") {
      let zoneIds = req.user.zone_ids;

      let cityIds = req.user.city_ids || [];
      const paramCityId = req.query.cityId
        ? parseInt(req.query.cityId, 10)
        : null;

      if (paramCityId) {
        cityIds = [paramCityId];
      }

      result.cityIds = cityIds;

      const { zoneAdvisorIds, zoneAdvisors } =
        await findAdvisorsByZoneIds(zoneIds);

      result.zoneAdvisorIds = zoneAdvisorIds;
      result.zoneAdvisors = zoneAdvisors;

      return result;
    }
  } else if (roleName === "super_admin") {
    const paramRegionId = req.query.regionId
      ? parseInt(req.query.regionId, 10)
      : null;

    console.log(" paramRegionId---------------- ", paramRegionId);

    const paramZoneId = req.query.zoneId
      ? parseInt(req.query.zoneId, 10)
      : null;

    const paramCityId = req.query.cityId
      ? parseInt(req.query.cityId, 10)
      : null;

    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    let regionIds = [];
    let zoneIds = [];
    let cityIds = [];
    console.log("paramRegionId ", paramRegionId);
    // 1) Region select kiya -> uske zones nikalo
    if (paramRegionId) {
      regionIds = [paramRegionId];
      zoneIds = await findZonesByRegionId(regionIds);
    }

    // 2) Zone directly select kiya
    if (paramZoneId) {
      zoneIds = [paramZoneId];
    }

    // 3) Zone se cities nikalo
    if (zoneIds.length > 0) {
      cityIds = await findCitiesByZoneId(zoneIds);
    }
    console.log(" cityIds ", cityIds);
    // 4) City directly select kiya
    if (paramCityId) {
      cityIds = [paramCityId];
    }

    // 5) Advisors nikalo
    let zoneAdvisorIds = [];
    let zoneAdvisors = [];

    if (cityIds.length > 0) {
      const advisorData = await findAdvisorsByCityIds(cityIds);

      zoneAdvisorIds = advisorData.zoneAdvisorIds;
      zoneAdvisors = advisorData.zoneAdvisors;
    } else if (zoneIds.length > 0) {
      const advisorData = await findAdvisorsByZoneIds(zoneIds);

      zoneAdvisorIds = advisorData.zoneAdvisorIds;
      zoneAdvisors = advisorData.zoneAdvisors;
    } else {
      // Koi filter nahi hai -> saare Travel Advisors
      const advisorData = await findAllAdvisors();

      zoneAdvisorIds = advisorData.zoneAdvisorIds;
      zoneAdvisors = advisorData.zoneAdvisors;
    }

    result.regionIds = regionIds;
    result.zoneIds = zoneIds;
    result.cityIds = cityIds;
    result.zoneAdvisorIds = zoneAdvisorIds;
    result.zoneAdvisors = zoneAdvisors;

    // Default: sab advisors
    result.advisorId = zoneAdvisorIds;

    // Specific advisor filter
    if (paramAdvisorId) {
      result.advisorId = paramAdvisorId;
    }

    return result;
  } else if (roleName === "team leader-sales") {
    // City Manager jaisa hi, bas zone ki jagah city_ids se scope hota hai
    let cityIds = req.user.city_ids || [];

    const paramCityId = req.query.cityId
      ? parseInt(req.query.cityId, 10)
      : null;

    if (paramCityId) {
      if (!cityIds.includes(paramCityId)) {
        result.accessDenied = true;
        return result;
      }
      cityIds = [paramCityId];
    }

    const { zoneAdvisorIds, zoneAdvisors } =
      await findAdvisorsByCityIds(cityIds);

    result.cityIds = cityIds;
    result.zoneAdvisorIds = zoneAdvisorIds;
    result.zoneAdvisors = zoneAdvisors;

    // Default: apne saare advisors ka data
    result.advisorId = zoneAdvisorIds;

    // Frontend se specific advisor filter
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        result.accessDenied = true;
        return result;
      }
      result.advisorId = paramAdvisorId;
    }

    return result;
  } else if (roleName === "travel advisor") {
    result.advisorId = req.user.id;

    let cityIds = req.user.city_ids || [];

    const paramCityId = req.query.cityId
      ? parseInt(req.query.cityId, 10)
      : null;

    if (paramCityId) {
      if (!cityIds.includes(paramCityId)) {
        result.accessDenied = true;
        return result;
      }
      cityIds = [paramCityId];
    }

    result.cityIds = cityIds;

    return result;
  } else if (
    ["city manager", "seo executive", "seo tl"].includes(
      roleName?.toLowerCase(),
    )
  ) {
    let zoneIds = req.user.zone_ids;

    const paramZoneId = req.query.zoneId
      ? parseInt(req.query.zoneId, 10)
      : null;

    if (paramZoneId) {
      const allowedZones = Array.isArray(req.user.zone_ids)
        ? req.user.zone_ids
        : [req.user.zone_ids];

      if (!allowedZones.includes(paramZoneId)) {
        result.accessDenied = true;
        return result;
      }

      zoneIds = [paramZoneId];
    }

    const { zoneAdvisorIds, zoneAdvisors } =
      await findAdvisorsByZoneIds(zoneIds);

    // Zone ki cities
    let cityIds = await findCitiesByZoneId(zoneIds);

    // Frontend se city filter
    const paramCityId = req.query.cityId
      ? parseInt(req.query.cityId, 10)
      : null;

    if (paramCityId) {
      cityIds = [paramCityId];
    }

    result.zoneIds = zoneIds;
    result.zoneAdvisorIds = zoneAdvisorIds;
    result.zoneAdvisors = zoneAdvisors;
    result.cityIds = cityIds;

    // Default sab advisors
    result.advisorId = zoneAdvisorIds;

    // Frontend se advisor filter
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        result.accessDenied = true;
        return result;
      }

      result.advisorId = paramAdvisorId;
    }

    return result;
  }
  return result;
};

export const findRegionsByCountryId = async (countryId) => {
  try {
    const [rows] = await hrmsPool.query(
      `SELECT id FROM region WHERE country_id = ?`,
      [countryId],
    );
    return rows.map((row) => row.id);
  } catch (error) {
    console.error("findRegionsByCountryId failed:", error.message);
    return [];
  }
};

export const findZonesByRegionId = async (regionIds) => {
  try {
    const ids = Array.isArray(regionIds) ? regionIds : [regionIds];
    if (ids.length === 0) return [];

    const [rows] = await hrmsPool.query(
      `SELECT id FROM zone WHERE region_id IN (?)`,
      [ids],
    );
    return rows.map((row) => row.id);
  } catch (error) {
    console.error("findZonesByRegionId failed:", error.message);
    return [];
  }
};

export const findCitiesByZoneId = async (zoneIds) => {
  try {
    const ids = Array.isArray(zoneIds) ? zoneIds : [zoneIds];

    const [rows] = await hrmsPool.query(
      `SELECT id FROM city WHERE zone_id IN (?)`,
      [ids],
    );

    return rows.map((row) => row.id);
  } catch (error) {
    throw error;
  }
};

export const findAdvisorsByZoneIds = async (zoneIds) => {
  try {
    if (!zoneIds || zoneIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 1: Zone -> Access Control IDs
    const placeholders = zoneIds.map(() => "?").join(",");
    const [acRows] = await hrmsPool.query(
      `SELECT DISTINCT access_control_id
       FROM access_control_zones
       WHERE zone_id IN (${placeholders})`,
      zoneIds,
    );

    const accessControlIds = acRows.map((r) => r.access_control_id);

    if (accessControlIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 2: Access Control IDs -> Employee IDs (only role 34 = Travel Advisor)
    const acPlaceholders = accessControlIds.map(() => "?").join(",");
    const [empRows] = await hrmsPool.query(
      `SELECT DISTINCT ac.employee_id
       FROM access_control ac
       INNER JOIN users u ON u.id = ac.employee_id
       WHERE ac.id IN (${acPlaceholders})
         AND u.role_id = 34`,
      accessControlIds,
    );

    const zoneAdvisorIds = empRows.map((r) => r.employee_id);

    if (zoneAdvisorIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 3: Employee IDs -> Advisor Details (name etc.)
    const namePlaceholders = zoneAdvisorIds.map(() => "?").join(",");
    const [advisorUsers] = await hrmsPool.query(
      `SELECT id, aliasName, firstName, middleName, lastName
       FROM users
       WHERE id IN (${namePlaceholders})
         AND role_id = 34`,
      zoneAdvisorIds,
    );

    const zoneAdvisors = advisorUsers.map((u) => ({
      id: u.id,
      name: `${u.aliasName || ""}`.trim(),
    }));

    return { zoneAdvisorIds, zoneAdvisors };
  } catch (error) {
    console.error("findAdvisorsByZoneIds failed:", error.message);
    return { zoneAdvisorIds: [], zoneAdvisors: [] };
  }
};

export const findAdvisorsByCityIds = async (cityIds) => {
  try {
    if (!cityIds || cityIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 1: City -> Access Control IDs
    const placeholders = cityIds.map(() => "?").join(",");
    const [acRows] = await hrmsPool.query(
      `SELECT DISTINCT access_control_id
       FROM access_control_cities
       WHERE city_id IN (${placeholders})`,
      cityIds,
    );

    const accessControlIds = acRows.map((r) => r.access_control_id);

    if (accessControlIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 2: Access Control IDs -> Employee IDs (only role 34 = Travel Advisor)
    const acPlaceholders = accessControlIds.map(() => "?").join(",");
    const [empRows] = await hrmsPool.query(
      `SELECT DISTINCT ac.employee_id
       FROM access_control ac
       INNER JOIN users u ON u.id = ac.employee_id
       WHERE ac.id IN (${acPlaceholders})
         AND u.role_id = 34`,
      accessControlIds,
    );

    const zoneAdvisorIds = empRows.map((r) => r.employee_id);

    if (zoneAdvisorIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 3: Employee IDs -> Advisor Details
    const namePlaceholders = zoneAdvisorIds.map(() => "?").join(",");
    const [advisorUsers] = await hrmsPool.query(
      `SELECT id, aliasName, firstName, middleName, lastName
       FROM users
       WHERE id IN (${namePlaceholders})
         AND role_id = 34`,
      zoneAdvisorIds,
    );

    const zoneAdvisors = advisorUsers.map((u) => ({
      id: u.id,
      name: `${u.aliasName || ""}`.trim(),
    }));

    return { zoneAdvisorIds, zoneAdvisors };
  } catch (error) {
    console.error("findAdvisorsByCityIds failed:", error.message);
    return { zoneAdvisorIds: [], zoneAdvisors: [] };
  }
};

export const findAllAdvisors = async () => {
  try {
    const [advisorUsers] = await hrmsPool.query(
      `SELECT id, aliasName, firstName, middleName, lastName
       FROM users
       WHERE role_id = 34`,
    );

    const zoneAdvisorIds = advisorUsers.map((u) => u.id);
    const zoneAdvisors = advisorUsers.map((u) => ({
      id: u.id,
      name: `${u.aliasName || ""}`.trim(),
    }));

    return { zoneAdvisorIds, zoneAdvisors };
  } catch (error) {
    console.error("findAllAdvisors failed:", error.message);
    return { zoneAdvisorIds: [], zoneAdvisors: [] };
  }
};
