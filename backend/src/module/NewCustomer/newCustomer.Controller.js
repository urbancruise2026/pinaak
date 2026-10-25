import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createCustomers } from "../Leads/lead.model.js";
import {
  getAllCustomers,
  getCustomerById,
  searchCustomers,
  updateCustomerById,
} from "./newCustomer.model.js";

export const getAllCustomersController = asyncHandler(async (req, res) => {
  const result = await getAllCustomers();

  return res
    .status(200)
    .json(new ApiResponse(200, result, "All customers fetched successfully"));
});

export const searchCustomerController = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;
  const result = await searchCustomers({ search: search.trim() });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Customers fetched successfully"));
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    throw new ApiError(400, "Invalid customer ID");
  }

  const {
    firstName,
    middleName,
    lastName,
    customerPhone,
    customerEmail,
    companyName,
    customerType,
    customerCategoryType,
    alternatePhone,
    countryName,
    customerCity,
    address,
    date_of_birth,
    anniversary,
    gender,
    state,
    pincode,
  } = req.body;

  if (!firstName || !lastName || !customerPhone) {
    throw new ApiError(
      400,
      "firstName, lastName and customerPhone are required",
    );
  }

  if (customerEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      throw new ApiError(400, "Invalid email format");
    }
  }

  if (customerPhone) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone)) {
      throw new ApiError(400, "Invalid phone number — must be 10 digits");
    }
  }

  const updatedData = await updateCustomerById(Number(id), {
    firstName,
    middleName,
    lastName,
    customerPhone,
    customerEmail,
    companyName,
    customerType,
    customerCategoryType,
    alternatePhone,
    countryName,
    customerCity,
    address,
    date_of_birth,
    anniversary,
    gender,
    state,
    pincode,
  });

  if (!updatedData || updatedData.affectedRows === 0) {
    throw new ApiError(404, "Customer not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Customer updated successfully"));
});

export const createCustomer = asyncHandler(async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    customerPhone,
    customerEmail,
    companyName,
    customerType,
    state,
    pincode,
    gender,
    customerCategoryType,
    alternatePhone,
    countryName,
    customerCity,
    address,
    date_of_birth,
    anniversary,
  } = req.body;

  // Validation
  if (!firstName || !lastName || !customerPhone) {
    throw new ApiError(
      400,
      "firstName, lastName and customerPhone are required",
    );
  }

  if (customerEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      throw new ApiError(400, "Invalid email format");
    }
  }

  if (customerPhone) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone)) {
      throw new ApiError(400, "Invalid phone number — must be 10 digits");
    }
  }

  const result = await createCustomers({
    firstName,
    middleName,
    lastName,
    customerPhone,
    customerEmail,
    companyName,
    customerType,
    customerCategoryType,
    alternatePhone,
    countryName,
    customerCity,
    address,
    date_of_birth,
    anniversary,
    state,
    pincode,
    gender,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Customer created successfully"));
});

export const getCustomerByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await getCustomerById(Number(id));

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer fetched successfully"));
});
