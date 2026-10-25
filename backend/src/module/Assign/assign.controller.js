import emitToHierarchy from "../../socket/EmitHelpers/socketEmitHelper.js";
import { getIO } from "../../socket/socket.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getLeadById } from "../Leads/lead.model.js";

import {
  assignTravelAdvisorToLead,
  findCitiesByZoneIds,
  findTravelAdvisorsByCityId,
  getHighPaxLeads,
  getLeadsByAdvisorId,
  getLeadStatusCountByPresalesId,
  getLongDurationLeads,
  getSwapLeadsByAdvisorId,
  swapTravelAdvisorForLead,
} from "./assign.model.js";
import { findZoneCityRegion } from "./assign.service.js";

const getTravelAdvisorsByCityId = asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  if (!cityId) {
    throw new ApiError(400, "cityId is required");
  }

  const users = await findTravelAdvisorsByCityId(cityId);

  if (!users || users.length === 0) {
    throw new ApiError(404, "No Travel Advisors found for this city");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Travel Advisors fetched successfully"));
});

const assignTravelAdvisor = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { travelAdvisorId } = req.body;

  if (!travelAdvisorId) {
    throw new ApiError(400, "travelAdvisorId is required");
  }

  const result = await assignTravelAdvisorToLead(leadId, travelAdvisorId);

  if (!result.success) {
    throw new ApiError(404, "Lead not found");
  }

  const fullLead = await getLeadById(leadId);

  try {
    const io = getIO();

    emitToHierarchy({
      io,
      eventName: "leadUpdated",
      lead: fullLead ?? result,
      userIdKey: "advisor_id",
    });

    if (fullLead?.advisor_id) {
      io.to(`user_${fullLead.advisor_id}`).emit(
        "adviserLeadAssigned",
        fullLead,
      );
    }
  } catch (err) {
    console.error("⚠️ Socket emit failed:", err.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Travel Advisor assigned successfully"));
});

const getMyAssignedLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 50;

  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;
  const status = req.query.status || null;

  const normalizeToArray = (value) => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return value.flatMap((v) =>
        typeof v === "string" ? v.split(",").map((s) => s.trim()) : v,
      );
    }
    if (typeof value === "string" && value.includes(",")) {
      return value.split(",").map((s) => s.trim());
    }
    return [value];
  };

  const ageFilter = normalizeToArray(req.query.ageFilter);
  const daysFilter = normalizeToArray(req.query.daysFilter);
  const paxFilter = normalizeToArray(req.query.paxFilter);

  const {
    advisorId: scopeAdvisorId,
    zoneAdvisors,
    zoneAdvisorIds,
    cityIds: scopedCityIds,
    accessDenied,
  } = await findZoneCityRegion(req);

  if (accessDenied) {
    return res.status(403).json(new ApiResponse(403, null, "Access denied"));
  }

  let cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : scopedCityIds;
  let advisorId = scopeAdvisorId;

  const roleName = req.user.role_name?.toLowerCase();
  if (["city manager", "team leader-sales"].includes(roleName)) {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              "Access denied: Advisor is not in your zone",
            ),
          );
      }
      advisorId = paramAdvisorId;
    }
  }

  const {
    leads,
    total,
    totalPages,
    selectedMonth,
    selectedYear,
    selectedStatus,
    statusCounts,
    totalLeads,
    monthlyStats,
  } = await getLeadsByAdvisorId(
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
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        selectedMonth,
        selectedYear,
        selectedStatus,

        selectedAgeFilter: ageFilter || [],
        selectedDaysFilter: daysFilter || [],
        selectedPaxFilter: paxFilter || [],
        statusCounts,
        totalLeads,
        leads,
        monthlyStats,
        zoneAdvisors,
      },
      leads.length
        ? "Assigned leads fetched successfully"
        : "No assigned leads found",
    ),
  );
});

const LeadStatusCountByPresalesId = asyncHandler(async (req, res) => {
  const presaleId = req.user.id;

  const data = await getLeadStatusCountByPresalesId(presaleId);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Lead status count fetched successfully"));
});

export const swapTravelAdvisor = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { travelAdvisorId } = req.body;

  if (!travelAdvisorId) {
    throw new ApiError(400, "travelAdvisorId is required");
  }

  const result = await swapTravelAdvisorForLead(
    leadId,
    travelAdvisorId,
    req.user.id,
  );

  const fullLead = await getLeadById(leadId);

  try {
    const io = getIO();
    emitToHierarchy({
      io,
      eventName: "leadUpdated",
      lead: fullLead ?? result,
      userIdKey: "advisor_id",
    });

    if (fullLead?.advisor_id) {
      io.to(`user_${fullLead.advisor_id}`).emit("adviserLeadswapped", fullLead);
    }
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Travel Advisor swapped successfully"));
});

export const getMySwapLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 50;

  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;
  const status = req.query.status || null;
  const ageFilter = req.query.ageFilter || null;
  const daysFilter = req.query.daysFilter || null;
  const paxFilter = req.query.paxFilter || null;
  const liveorexpiry = req.query.liveorexpiry || null;

  const {
    advisorId: scopeAdvisorId,
    zoneAdvisors,
    zoneAdvisorIds,
    cityIds: scopedCityIds,
    accessDenied,
  } = await findZoneCityRegion(req);

  if (accessDenied) {
    return res.status(403).json(new ApiResponse(403, null, "Access denied"));
  }

  let cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : scopedCityIds;

  let advisorId = scopeAdvisorId;

  const roleName = req.user.role_name?.toLowerCase();
  // 🔧 FIX: "team leader-sales" pehle yahan missing tha, isliye team leader ka
  // advisorId-override kaam nahi karta tha aur scope bhi properly enforce nahi hota tha.
  if (["city manager", "team leader-sales"].includes(roleName)) {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              "Access denied: Advisor not in your zone",
            ),
          );
      }
      advisorId = paramAdvisorId;
    }
  }

  const data = await getSwapLeadsByAdvisorId(
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
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...data,
        zoneAdvisors,
      },
      data.leads.length ? "Swap leads fetched" : "No swap leads found",
    ),
  );
});

export const getcityByZoneId = asyncHandler(async (req, res) => {
  const zoneId = Number(req.query.zoneId);

  if (!zoneId) {
    return res.status(400).json(new ApiError(400, "zoneId is required"));
  }

  const cities = await findCitiesByZoneIds(zoneId);

  const cityData = cities.map((city) => ({
    id: city.id,
    city_name: city.city_name,
  }));

  return res
    .status(201)
    .json(new ApiResponse(201, cityData, "get successfully citys"));
});

const getHighPaxAssignedLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);

  // ✅ default ab 100
  const paxThreshold = req.query.paxThreshold
    ? parseInt(req.query.paxThreshold, 10)
    : 100;

  const {
    advisorId: scopeAdvisorId,
    zoneAdvisors,
    zoneAdvisorIds,
    cityIds: scopedCityIds,
    accessDenied,
  } = await findZoneCityRegion(req);

  if (accessDenied) {
    return res.status(403).json(new ApiResponse(403, null, "Access denied"));
  }

  let cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : scopedCityIds;
  let advisorId = scopeAdvisorId;

  const roleName = req.user.role_name?.toLowerCase();
  if (["city manager", "team leader-sales"].includes(roleName)) {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              "Access denied: Advisor is not in your zone",
            ),
          );
      }
      advisorId = paramAdvisorId;
    }
  }

  const {
    leads,
    total,
    page: currentPage,
    totalPages,
    paxThreshold: appliedThreshold,
  } = await getHighPaxLeads(page, limit, paxThreshold, cityIds, advisorId);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page: currentPage,
        limit,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        paxThreshold: appliedThreshold,
        leads,
        zoneAdvisors,
      },
      leads.length
        ? "High pax leads fetched successfully"
        : "No high pax leads found",
    ),
  );
});

const getLongDurationAssignedLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);

  const limit = Math.max(1, parseInt(req.query.limit) || 10);

  const daysThreshold = req.query.daysThreshold
    ? parseInt(req.query.daysThreshold, 10)
    : 5;

  const {
    advisorId: scopeAdvisorId,
    zoneAdvisors,
    zoneAdvisorIds,
    cityIds: scopedCityIds,
    accessDenied,
  } = await findZoneCityRegion(req);

  if (accessDenied) {
    return res.status(403).json(new ApiResponse(403, null, "Access denied"));
  }

  let cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : scopedCityIds;

  let advisorId = scopeAdvisorId;

  const roleName = req.user.role_name?.toLowerCase();

  if (["city manager", "team leader-sales"].includes(roleName)) {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              "Access denied: Advisor is not in your zone",
            ),
          );
      }

      advisorId = paramAdvisorId;
    }
  }

  const {
    leads,
    total,
    page: currentPage,
    totalPages,
  } = await getLongDurationLeads(
    page,
    limit,
    daysThreshold,
    cityIds,
    advisorId,
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page: currentPage,
        limit,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        daysThreshold,
        leads,
        zoneAdvisors,
      },
      leads.length
        ? "Long duration leads fetched successfully"
        : "No long duration leads found",
    ),
  );
});

export { getLongDurationAssignedLeads };

export {
  getTravelAdvisorsByCityId,
  assignTravelAdvisor,
  getMyAssignedLeads,
  LeadStatusCountByPresalesId,
  getHighPaxAssignedLeads,
};
