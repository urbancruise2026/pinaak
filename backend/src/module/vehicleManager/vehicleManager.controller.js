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
  updateVehicleManagerModel,
} from "./vehicleManager.model.js";

// NOTE:
// - aging ab DB mein store nahi hota, model query mein reg_date se calculate hota hai
//   (isliye calculateVehicleAging import hata diya)
// - model field hata di gayi hai
// - vendor ke liye vendor_id bhejo (vendor name bhi chalega, model use id mein convert karega)
// - city ke liye city_id bhejo (purana "city" key bhi chalega)
// - amenities array ["MOD","SB"] ya comma string "MOD,SB" dono chalenge

const createVehicleManager = asyncHandler(async (req, res) => {
  const {
    code,
    vendor_id,
    vendor,
    variant,
    veh_no,
    garage,
    city_id,
    city,
    reg_date,
    amenities,
  } = req.body;

  // Required fields
  if (!code || !veh_no) {
    throw new ApiError(400, "code and veh_no are required");
  }

  if (!vendor_id) {
    throw new ApiError(400, "vendor_id is required");
  }

  // reg_date ab NOT NULL hai
  if (!reg_date) {
    throw new ApiError(400, "reg_date is required");
  }

  // Check duplicate vehicle number
  const existingEntry = await getVehicleManagerByVehNo(veh_no);

  if (existingEntry) {
    throw new ApiError(
      409,
      "Vehicle manager entry already exists for this vehicle number",
    );
  }

  let result;

  try {
    result = await createVehicleManagerModel({
      code,
      vendor_id,
      vendor,
      variant,
      veh_no,
      garage,
      city_id: city_id ?? city,
      reg_date,
      amenities,
    });
  } catch (error) {
    if (error.message === "Valid vendor_id is required") {
      throw new ApiError(400, "Selected vendor is invalid");
    }
    throw error;
  }

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

const updateVehicleManager = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    code,
    vendor_id,
    vendor,
    variant,
    veh_no,
    garage,
    city_id,
    city,
    reg_date,
    amenities,
  } = req.body;

  if (!code || !veh_no) {
    throw new ApiError(400, "code and veh_no are required");
  }

  if (!vendor_id) {
    throw new ApiError(400, "vendor_id is required");
  }

  if (!reg_date) {
    throw new ApiError(400, "reg_date is required");
  }

  const current = await getVehicleManagerById(id);
  if (!current) {
    throw new ApiError(404, "Vehicle manager entry not found");
  }

  // veh_no must stay unique, ignoring this same row
  const duplicate = await getVehicleManagerByVehNo(veh_no);
  if (duplicate && Number(duplicate.id) !== Number(id)) {
    throw new ApiError(
      409,
      "Vehicle manager entry already exists for this vehicle number",
    );
  }

  let result;

  try {
    result = await updateVehicleManagerModel(id, {
      code,
      vendor_id,
      vendor,
      variant,
      veh_no,
      garage,
      city_id: city_id ?? city,
      reg_date,
      amenities, // undefined bheji to purani amenities same rahengi
    });
  } catch (error) {
    if (error.message === "Valid vendor_id is required") {
      throw new ApiError(400, "Selected vendor is invalid");
    }
    throw error;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Vehicle manager entry updated successfully",
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
    code,
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

// Ab har vendor ke saath id bhi aati hai: [{ id, name }]
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
  updateVehicleManager,
};
