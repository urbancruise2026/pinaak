import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createVehicleManagerModel,
  getAllVehicleManagersModel,
  getVehicleManagerById,
  getVehicleManagerByVehNo,
  getVehicleManagerVendorsModel,
  getVehicleMasterCodesModel,
  getVehicleMasterAmenitiesModel,
  getAllCitiesModel,
  updateVehicleManagerStatusModel,
} from "./vehicleManager.model.js";
import { calculateVehicleAging } from "./vehicleManager.service.js";

const createVehicleManager = asyncHandler(async (req, res) => {
  const payload = req.body;

  const {
    code,
    vendor,
    model,
    variant, // ✅ ADD
    veh_no,
    garage,
    city,
    reg_date,
    amenities,
  } = payload;

  // Required fields
  if (!code || !veh_no) {
    throw new ApiError(400, "code and veh_no are required");
  }

  // Check duplicate vehicle number
  const existingEntry = await getVehicleManagerByVehNo(veh_no);

  if (existingEntry) {
    throw new ApiError(
      409,
      "Vehicle manager entry already exists for this vehicle number",
    );
  }

  const aging = calculateVehicleAging(reg_date);

  const result = await createVehicleManagerModel({
    code,
    vendor,
    model,
    variant, // ✅ ADD
    veh_no,
    garage,
    city,
    reg_date,
    aging,
    amenities,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        result,
        "Vehicle manager entry created successfully",
      ),
    );
});

const getAllCitiesController = asyncHandler(async (req, res) => {
  const cities = await getAllCitiesModel();
  if (!cities || cities.length === 0) {
    throw new ApiError(404, "No cities found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cities, "Cities fetched successfully"));
});

const getVehicleManagerByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "id is required");
  }

  const entry = await getVehicleManagerById(id);

  if (!entry) {
    throw new ApiError(404, "Vehicle manager entry not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, entry, "Vehicle manager entry fetched successfully"),
    );
});

const getAllVehicleManagers = asyncHandler(async (req, res) => {
  const {
    search,
    vendor,
    garage,
    city,
    year,
    seat,
    variant,
    category,
    code, // 👈 destructure to kiya

    page,
    limit,
  } = req.query;

  const result = await getAllVehicleManagersModel({
    search,
    vendor,
    garage,
    city,
    year,
    seat,
    variant,
    category,
    code,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Vehicle manager entries fetched successfully",
      ),
    );
});

const getVehicleMasterCodes = asyncHandler(async (req, res) => {
  const result = await getVehicleMasterCodesModel();

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Vehicle master codes fetched successfully"),
    );
});

// =====================================================
// GET UNIQUE AMENITIES (vehicle_master se, checkbox ke liye)
// =====================================================

const getVehicleMasterAmenities = asyncHandler(async (req, res) => {
  const result = await getVehicleMasterAmenitiesModel();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Vehicle master amenities fetched successfully",
      ),
    );
});

const getVehicleManagerVendors = asyncHandler(async (req, res) => {
  const result = await getVehicleManagerVendorsModel();

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Vendors fetched successfully"));
});

const updateVehicleManagerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const updatedRecord = await updateVehicleManagerStatusModel({ id, status });

  if (!updatedRecord) {
    throw new ApiError(404, "Vehicle manager record not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, "Status updated successfully"));
});

export {
  getVehicleManagerByIdController,
  createVehicleManager,
  getAllVehicleManagers,
  getVehicleMasterCodes,
  getVehicleMasterAmenities,
  getVehicleManagerVendors,
  getAllCitiesController,
  updateVehicleManagerStatus,
};
