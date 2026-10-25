import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAllCountryCodes,
  getCountries,
  insertCountry,
} from "./country.model.js";

const addCountryCode = asyncHandler(async (req, res) => {
  const { country_name, country_code, phone_code } = req.body;
  if (!country_name || !country_code || !phone_code) {
    throw new ApiError(400, "All fields are required");
  }

  const trimmedName = country_name.trim();
  const trimmedCode = country_code.trim().toUpperCase();
  const trimmedPhone = phone_code.trim();

  if (!trimmedName || !trimmedCode || !trimmedPhone) {
    throw new ApiError(
      400,
      "Fields cannot be empty or contain only whitespace",
    );
  }

  if (!trimmedPhone.startsWith("+") && isNaN(Number(trimmedPhone))) {
    throw new ApiError(400, "Phone code must start with + or be numeric");
  }

  // FIX: message said "2-3 characters" but the check actually allowed 2-4.
  // Message now matches the real condition.
  if (trimmedCode.length < 2 || trimmedCode.length > 4) {
    throw new ApiError(400, "Country code must be 2-4 characters");
  }

  const countryData = {
    country_name: trimmedName,
    country_code: trimmedCode,
    phone_code: trimmedPhone,
  };

  const newCountry = await insertCountry(countryData);

  if (!newCountry) {
    throw new ApiError(404, "New country not found");
  }

  res
    .status(201)
    .json(new ApiResponse(201, newCountry, "Country added successfully"));
});

// FIX: now supports ?page=&limit= query params so a caller can page through
// results instead of always pulling the full table on every hit. Doesn't
// break existing callers — omit the params and it behaves exactly as before.
const getCountryCode = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const country = await getCountries({ page, limit });

  if (!country) {
    throw new ApiError(404, "Country List not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, country, "Get country list successfully"));
});

const AllCountryCodes = asyncHandler(async (req, res) => {
  const countryCodes = await getAllCountryCodes();

  if (!countryCodes) {
    throw new ApiError(404, "Country Codes not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, countryCodes, "Get all country codes successfully"),
    );
});

export { addCountryCode, getCountryCode, AllCountryCodes };
