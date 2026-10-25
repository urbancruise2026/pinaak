import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { hrmsPool } from "../../config/mySqlDB.js"; // ✅ Fix 1: Import hrmsPool

import {
  createRateQuotationModel,
  getAllRateQuotationModel,
  getRateQuotationByLeadId,
} from "./rate.model.js";

// ─────────────────────────────
// CREATE RATE QUOTATION
// ─────────────────────────────
export const createRateQuotation = asyncHandler(async (req, res) => {
  const { leadId, customerId, vehicles } = req.body;

  const advisorId = req.user?.id || null;

  if (!leadId || !customerId) {
    throw new ApiError(400, "leadId and customerId are required");
  }

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    throw new ApiError(400, "At least one vehicle is required");
  }

  const existing = await getRateQuotationByLeadId(leadId);

  if (existing) {
    throw new ApiError(409, "Rate quotation already exists for this lead");
  }

  const result = await createRateQuotationModel({
    leadId,
    customerId,
    vehicles,
    advisorId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Rate quotation created successfully"));
});

// ─────────────────────────────
// GET ALL RATE QUOTATIONS
// ─────────────────────────────
export const getAllRateQuotations = asyncHandler(async (req, res) => {
  // ✅ Fix 2: Export the function + rename to match routes
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 50;

  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;
  const status = req.query.status || null;

  const roleName = req.user.role_name?.toLowerCase();
  let advisorId = null;
  let zoneAdvisors = [];

  if (roleName === "travel advisor") {
    advisorId = req.user.id;
  } else if (roleName === "city manager") {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    const zoneIds = req.user.zone_ids;
    let zoneAdvisorIds = [];

    if (zoneIds && zoneIds.length > 0) {
      try {
        const placeholders = zoneIds.map(() => "?").join(",");

        const [acRows] = await hrmsPool.query(
          `SELECT DISTINCT access_control_id
           FROM access_control_zones
           WHERE zone_id IN (${placeholders})`,
          zoneIds,
        );

        const accessControlIds = acRows.map((r) => r.access_control_id);

        if (accessControlIds.length > 0) {
          const acPlaceholders = accessControlIds.map(() => "?").join(",");

          const [empRows] = await hrmsPool.query(
            `SELECT DISTINCT ac.employee_id
             FROM access_control ac
             INNER JOIN users u ON u.id = ac.employee_id
             WHERE ac.id IN (${acPlaceholders})
               AND u.role_id = 34`,
            accessControlIds,
          );

          zoneAdvisorIds = empRows.map((r) => r.employee_id);
        }

        if (zoneAdvisorIds.length > 0) {
          const namePlaceholders = zoneAdvisorIds.map(() => "?").join(",");
          const [advisorUsers] = await hrmsPool.query(
            `SELECT id, aliasName, firstName, middleName, lastName
             FROM users
             WHERE id IN (${namePlaceholders})
               AND role_id = 34`,
            zoneAdvisorIds,
          );

          zoneAdvisors = advisorUsers.map((u) => ({
            id: u.id,
            name: `${u.aliasName || u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim(),
          }));
        }
      } catch (err) {
        console.error(
          "Zone advisor fetch failed (Rate Quotation):",
          err.message,
        );
      }
    }

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        // ✅ Fix 3: Now accessible here
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
    } else {
      advisorId = zoneAdvisorIds;
    }
  }

  const {
    rateList,
    total,
    totalPages,
    selectedMonth,
    selectedYear,
    selectedStatus,
    statusCounts,
    totalRateQuotations,
    monthlyStats,
  } = await getAllRateQuotationModel(
    advisorId,
    page,
    limit,
    search,
    month,
    year,
    status,
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
        statusCounts,
        totalRateQuotations,
        rateList,
        monthlyStats,
        zoneAdvisors,
      },
      rateList.length
        ? "Rate quotations fetched successfully"
        : "No rate quotations found",
    ),
  );
});
