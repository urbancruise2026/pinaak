import {
  getAgingReport,
  getLeadCountByDateForYear,
  getLongWeekendReport,
  getMonthlyDateWiseStatusReport,
  getMonthlyEnquiry,
  getMonthlyReportTwo,
  getMonthlyStatusWiseReport,
  getPreSalesLeadAssignmentReport,
  getTimeEnquiryReport,
  getWebsiteToLeadAgingReport,
} from "./report.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { hrmsPool } from "../../config/mySqlDB.js";
import { getCityIdsByZoneIds } from "./report.service.js";
import { findZoneCityRegion } from "../Assign/assign.service.js";

export const monthlyEnquiryReport = asyncHandler(async (req, res) => {
  const year = req.query.year ? parseInt(req.query.year) : null;
  if (year !== null && (isNaN(year) || year < 2000 || year > 2100)) {
    throw new ApiError(400, "Invalid year parameter");
  }

  const { cityIds: scopedCityIds } = await findZoneCityRegion(req);

  const cityIds =
    scopedCityIds?.length > 0 ? scopedCityIds : req.user?.city_ids || [];

  const data = await getMonthlyEnquiry(year, cityIds);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { year: year ?? "all", data: data || [] },
        "Monthly enquiry report fetched successfully",
      ),
    );
});

export const getLeadCountByAdviserForMonthController = asyncHandler(
  async (req, res) => {
    const { month, year } = req.query;

    const { cityIds } = await findZoneCityRegion(req);

    const data = await getPreSalesLeadAssignmentReport(
      cityIds,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );

    return res.status(200).json(new ApiResponse(200, data, "Success"));
  },
);

export const getMonthlyStatusWiseReportController = asyncHandler(
  async (req, res) => {
    const { month, year } = req.query;

    const { advisorId: scopeAdvisorId = null, cityIds = [] } =
      await findZoneCityRegion(req);

    const result = await getMonthlyStatusWiseReport(
      cityIds,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
      scopeAdvisorId,
    );

    return res.status(200).json(new ApiResponse(200, result, "Success"));
  },
);

export const timeEnquiryReport = async (req, res) => {
  try {
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year parameter",
      });
    }

    const data = await getTimeEnquiryReport(year);

    res.json({
      success: true,
      year,
      data: data || [],
    });
  } catch (error) {
    console.error("❌ Time Enquiry Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

export const getMonthlyDateWiseStatusReportController = asyncHandler(
  async (req, res) => {
    const { month, year } = req.query;

    const { cityIds } = await findZoneCityRegion(req);

    const result = await getMonthlyDateWiseStatusReport(
      cityIds,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const longWeekendReport = asyncHandler(async (req, res) => {
  const year = req.query.year
    ? parseInt(req.query.year)
    : new Date().getFullYear();

  if (isNaN(year) || year < 2000 || year > 2100) {
    throw new ApiError(400, "Invalid year parameter");
  }
  const { cityIds } = await findZoneCityRegion(req);

  const data = await getLongWeekendReport(year, cityIds);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { year, data: data || [] },
        "Long weekend report fetched successfully",
      ),
    );
});

export const monthlyreporttwo = asyncHandler(async (req, res) => {
  const year = req.query.year ? parseInt(req.query.year) : null;

  if (year !== null && (isNaN(year) || year < 2000 || year > 2100)) {
    throw new ApiError(400, "Invalid year parameter");
  }

  const { cityIds } = await findZoneCityRegion(req);

  const data = await getMonthlyReportTwo(year, cityIds);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { year: year ?? "all", data: data || [] },
        "Monthly report two fetched successfully",
      ),
    );
});

export const getAgingReportController = asyncHandler(async (req, res) => {
  const year = req.query.year
    ? parseInt(req.query.year)
    : new Date().getFullYear();

  if (isNaN(year) || year < 2000 || year > 2100) {
    throw new ApiError(400, "Invalid year parameter");
  }

  const { cityIds: scopedCityIds } = await findZoneCityRegion(req);

  const cityIds =
    scopedCityIds?.length > 0 ? scopedCityIds : req.user?.city_ids || [];

  const data = await getAgingReport(year, cityIds);

  return res
    .status(200)
    .json(
      new ApiResponse(200, data || [], "Aging report fetched successfully"),
    );
});

export const getWebsiteToLeadAgingReportController = asyncHandler(
  async (req, res) => {
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

    if (isNaN(year) || year < 2000 || year > 2100) {
      throw new ApiError(400, "Invalid year parameter");
    }

    const { cityIds: scopedCityIds } = await findZoneCityRegion(req);

    const cityIds =
      scopedCityIds?.length > 0 ? scopedCityIds : req.user?.city_ids || [];

    const data = await getWebsiteToLeadAgingReport(year, cityIds);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          data || [],
          "Website to Lead aging report fetched successfully",
        ),
      );
  },
);
