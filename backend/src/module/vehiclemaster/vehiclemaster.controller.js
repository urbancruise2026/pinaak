import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createVehicleModel,
  getAllVehiclesModel,
  getSeatOptionsModel,
  getVehicleByCode,
  getVehicleById,
  getVehicles,
  getVehicleVariantByCodeModel, 
  updateVehicleModel,
  deleteVehicleModel,
  
} from "./vehiclemaster.model.js";
import { generateVehicleCode } from "./vehiclemaster.service.js";

const getVehicleCodeList = asyncHandler(async (req, res) => {
  const vehicleList = await getVehicles();

  if (!vehicleList || vehicleList.length === 0) {
    throw new ApiError(404, "Vehicle list not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, vehicleList, "Vehicle list fetched successfully"),
    );
});

export const createVehicle = asyncHandler(async (req, res) => {
  const payload = req.body;

  const { seat, category, make, config, model } = payload;

  if (!seat || !category || !make || !config || !model) {
    throw new ApiError(400, "Seat, category, make and config are required");
  }

  const code = generateVehicleCode(seat, category, config, make, model);

  payload.code = code;

  const existingVehicle = await getVehicleByCode(code);
  console.log(" code ", code);
  if (existingVehicle) {
    throw new ApiError(409, "Vehicle already exists with this code");
  }

  const result = await createVehicleModel(payload);

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Vehicle created successfully"));
});


export const getAllVehicles = asyncHandler(async (req, res) => {
  const { search, category, make, seat, variant, page, limit } = req.query;

  const result = await getAllVehiclesModel({
    search,
    category,
    make,
    seat,
    variant,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Vehicles fetched successfully"));
});

export const getSeatOptions = asyncHandler(async (req, res) => {
  const seats = await getSeatOptionsModel();

  return res
    .status(200)
    .json(new ApiResponse(200, seats, "Seat options fetched successfully"));
});

const getVehiclesById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(404, "Vehicle ID is required");
  }

  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vehicle, "Vehicle fetched successfully"));
});


export const updateVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const { seat, category, make, config, model } = payload;

  if (!seat || !category || !make || !config || !model) {
    throw new ApiError(
      400,
      "Seat, category, config, make and model are required",
    );
  }

  const current = await getVehicleById(id);
  if (!current) {
    throw new ApiError(404, "Vehicle not found");
  }

  let code;
  try {
    code = generateVehicleCode(seat, category, config, make, model);
  } catch (err) {
    throw new ApiError(400, err.message); // unknown make/model -> 400, not 500
  }
  payload.code = code;

  // code must stay unique, ignoring this same row
  const duplicate = await getVehicleByCode(code);
  if (duplicate && Number(duplicate.id) !== Number(id)) {
    throw new ApiError(409, "Vehicle already exists with this code");
  }

  const result = await updateVehicleModel(id, payload);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Vehicle updated successfully"));
});


export const deleteVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await deleteVehicleModel(id);
  if (!deleted) {
    throw new ApiError(404, "Vehicle not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Vehicle deleted successfully"));
});

const getVehicleVariantByCodeController = asyncHandler(async (req, res) => {
  const { code } = req.params;


  if (!code) {
    throw new ApiError(400, "Vehicle code is required");
  }

  const vehicle = await getVehicleVariantByCodeModel(code);



  if (!vehicle) {

    throw new ApiError(404, "Vehicle not found");
  }


  return res
    .status(200)
    .json(
      new ApiResponse(200, vehicle, "Vehicle variants fetched successfully"),
    );
});

export {
  getVehicleCodeList,
  getVehiclesById,
  getVehicleVariantByCodeController,
};
