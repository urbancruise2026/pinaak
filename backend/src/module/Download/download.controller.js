import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

import { getLeadReport } from "./download.model.js";

export const getDownloadReport = asyncHandler(async (req, res) => {
  const { type, month, year } = req.query;

  if (!month || !year) {
    throw new ApiError(400, "Month and Year are required");
  }

  let data = [];

  switch (type) {
    case "leads":
      data = await getLeadReport(month, year);
      break;

    default:
      throw new ApiError(400, "Invalid report type");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, `${type} report fetched successfully`));
});
