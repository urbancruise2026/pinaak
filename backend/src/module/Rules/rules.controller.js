import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { findZoneCityRegion } from "../Assign/assign.service.js";
import {
  findAdvisorsShiftTimingByZoneIds,
  createRuleEntry,
  getRuleEntries,
  updateRuleEntry,
  deleteRuleEntry,
} from "./rules.model.js";

const getAdviserbyzones = asyncHandler(async (req, res) => {
  const zoneIds = req.user.zone_ids || [];

  if (!zoneIds || !Array.isArray(zoneIds) || zoneIds.length === 0) {
    throw new ApiError(400, "Zone IDs not found for this user");
  }

  const { zoneAdvisorIds, zoneAdvisors } =
    await findAdvisorsShiftTimingByZoneIds(zoneIds);

  if (zoneAdvisors.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { zoneAdvisors: [] },
          "No advisors found for given zones",
        ),
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, zoneAdvisors, "Advisors fetched successfully"));
});

const createEntry = asyncHandler(async (req, res) => {
  const { type, months, monthLeads, advisorId, shiftTiming, lead, overflow } =
    req.body;

  if (!type || !advisorId || !Array.isArray(months) || months.length === 0) {
    throw new ApiError(400, "Required fields missing: type, advisorId, months");
  }

  const entry = await createRuleEntry({
    type,
    months,
    monthLeads,
    advisorId,
    shiftTiming,
    lead: lead || 0,
    overflow,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, entry, "Entry created successfully"));
});

const getEntries = asyncHandler(async (req, res) => {
  const { advisorId, zoneAdvisorIds, accessDenied } =
    await findZoneCityRegion(req);

  if (accessDenied) {
    return res.status(403).json(new ApiResponse(403, [], "Access denied"));
  }

  // Advisor scope: agar single advisorId hai to array bana do, agar array hai to wahi use karo
  let advisorScope = null;
  if (Array.isArray(advisorId)) {
    advisorScope = advisorId;
  } else if (advisorId) {
    advisorScope = [advisorId];
  } else if (Array.isArray(zoneAdvisorIds) && zoneAdvisorIds.length) {
    advisorScope = zoneAdvisorIds;
  }

  const entries = await getRuleEntries({
    advisorIds: advisorScope,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, entries, "Entries fetched successfully"));
});

const updateEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { type, months, monthLeads, advisorId, shiftTiming, lead, overflow } =
    req.body;

  if (!type || !advisorId || !Array.isArray(months) || months.length === 0) {
    throw new ApiError(400, "Required fields missing: type, advisorId, months");
  }

  const updated = await updateRuleEntry(id, {
    type,
    months,
    monthLeads,
    advisorId,
    shiftTiming,
    lead: lead || 0,
    overflow,
  });

  if (!updated) {
    throw new ApiError(404, "Entry not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Entry updated successfully"));
});

const deleteEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await deleteRuleEntry(id);

  if (!deleted) {
    throw new ApiError(404, "Entry not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Entry deleted successfully"));
});

export { getAdviserbyzones, createEntry, getEntries, updateEntry, deleteEntry };

// UPDATE entry
