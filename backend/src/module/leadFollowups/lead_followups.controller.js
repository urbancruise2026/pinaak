import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
  getAllLeads,
  getFollowupsByLeadId,
  getTodayFollowupsWithDetailsByAdviserId,
} from "./lead_followups.model.js";

const getAllLeadsController = asyncHandler(async (req, res) => {
  const leads = await getAllLeads();

  if (!leads || leads.length === 0) {
    throw new ApiError(404, "No leads found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, leads, "Leads fetched successfully"));
});

const getFollowupsByLeadIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "leads_id is required");
  }

  const followups = await getFollowupsByLeadId(id);

  if (!followups || followups.length === 0) {
    throw new ApiError(404, "No followups found for this lead");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        followups,
        "Followups and status history fetched successfully",
      ),
    );
});

const getTodayFollowupCount = asyncHandler(async (req, res) => {
  const adviser_id = req.user.id;

  if (!adviser_id) {
    throw new ApiError(404, "Adviser ID is required");
  }

  const todayFollowups =
    await getTodayFollowupsWithDetailsByAdviserId(adviser_id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalFollowups: todayFollowups.length,
        followups: todayFollowups,
      },
      "Today's followups fetched successfully",
    ),
  );
});

export {
  getAllLeadsController,
  getFollowupsByLeadIdController,
  getTodayFollowupCount,
};
