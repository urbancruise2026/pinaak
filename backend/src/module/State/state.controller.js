import {
  getAllStates,
  getCitiesByState,
  getStateByCity,
  getAllCities,
} from "./state.model.js";

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const fetchStates = asyncHandler(async (req, res) => {
  const states = await getAllStates();
  return res
    .status(200)
    .json(new ApiResponse(200, states, "States fetched successfully"));
});

const fetchAllCities = asyncHandler(async (req, res) => {
  const cities = await getAllCities();
  return res
    .status(200)
    .json(new ApiResponse(200, cities, "All cities fetched successfully"));
});

// ← YEH NEW CONTROLLER HAI — city se states fetch karta hai
const fetchStatesByCity = asyncHandler(async (req, res) => {
  const { cityName } = req.params;

  if (!cityName) {
    throw new ApiError(400, "City name is required");
  }

  const states = await getStateByCity(decodeURIComponent(cityName));

  if (!states || states.length === 0) {
    throw new ApiError(404, "No states found for this city");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, states, "States fetched successfully"));
});

export { fetchStates, fetchAllCities, fetchStatesByCity };
