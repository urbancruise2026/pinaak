import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAllCitiesModel,
  getAllRegionsModel,
  getZonesByRegionModel,
} from "./zone.model.js";

const getAllRegionsController = asyncHandler(async (req, res) => {
  const regions = await getAllRegionsModel();

  if (!regions || regions.length === 0) {
    throw new ApiError(404, "No regions found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, regions, "Regions fetched successfully"));
});

const getZonesByRegionController = asyncHandler(async (req, res) => {
  const { regionId } = req.params;

  const zones = await getZonesByRegionModel(regionId);

  if (!zones || zones.length === 0) {
    throw new ApiError(404, "No zones found for this region");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, zones, "Zones fetched successfully"));
});

const getCitiesByZoneController = asyncHandler(async (req, res) => {
  const { zoneId } = req.params;

  const cities = await getCitiesByZoneModel(zoneId);

  if (!cities || cities.length === 0) {
    throw new ApiError(404, "No cities found for this zone");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cities, "Cities fetched successfully"));
});
export {
  getAllRegionsController,
  getZonesByRegionController,
  getCitiesByZoneController,
};
