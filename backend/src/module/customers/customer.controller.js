// import { ApiError } from "../../utils/ApiError.js";
// import { ApiResponse } from "../../utils/ApiResponse.js";
// import { asyncHandler } from "../../utils/asyncHandler.js";
// import {
//   insertCustomer,
//   getCustomers,
//   findCustomerByUUID,
//   findCustomerByPhone,
//   findCustomerByEmail,
//   updateCustomer,
//   deleteCustomer,
//   searchCustomers,
// } from "./customer.model.js";

// const createCustomer = asyncHandler(async (req, res) => {
//   const data = req.body;

//   if (!data.firstName || !data.lastName || !data.phone) {
//     throw new ApiError(
//       400,
//       "First name, last name and phone are required fields",
//     );
//   }

//   // Duplicate check removed → now duplicates allowed
//   const newCustomer = await insertCustomer(data);

//   if (!newCustomer) {
//     throw new ApiError(400, "Customer could not be created");
//   }

//   res
//     .status(201)
//     .json(new ApiResponse(201, newCustomer, "Customer created successfully"));
// });

// const listCustomers = asyncHandler(async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 14;

//   const customersData = await getCustomers(page, limit);

//   res
//     .status(200)
//     .json(
//       new ApiResponse(200, customersData, "Customers fetched successfully"),
//     );
// });

// const getCustomerById = asyncHandler(async (req, res) => {
//   const { uuid } = req.params;

//   if (!uuid) {
//     throw new ApiError(400, "Customer UUID is required");
//   }

//   const customer = await findCustomerByUUID(uuid);

//   if (!customer) {
//     throw new ApiError(404, "Customer not found");
//   }

//   res
//     .status(200)
//     .json(new ApiResponse(200, customer, "Customer fetched successfully"));
// });

// const updateCustomerById = asyncHandler(async (req, res) => {
//   const { uuid } = req.params;
//   const data = req.body;

//   if (!uuid) {
//     throw new ApiError(400, "Customer UUID is required");
//   }

//   const existingCustomer = await findCustomerByUUID(uuid);
//   if (!existingCustomer) {
//     throw new ApiError(404, "Customer not found");
//   }

//   // Update directly (duplicate allowed)
//   const updated = await updateCustomer(uuid, data);

//   if (!updated) {
//     throw new ApiError(
//       400,
//       "Customer could not be updated or no changes provided",
//     );
//   }

//   const updatedCustomer = await findCustomerByUUID(uuid);

//   res
//     .status(200)
//     .json(
//       new ApiResponse(200, updatedCustomer, "Customer updated successfully"),
//     );
// });

// const deleteCustomerById = asyncHandler(async (req, res) => {
//   const { uuid } = req.params;

//   if (!uuid) {
//     throw new ApiError(400, "Customer UUID is required");
//   }

//   const existingCustomer = await findCustomerByUUID(uuid);
//   if (!existingCustomer) {
//     throw new ApiError(404, "Customer not found");
//   }

//   const deleted = await deleteCustomer(uuid);

//   if (!deleted) {
//     throw new ApiError(400, "Customer could not be deleted");
//   }

//   res
//     .status(200)
//     .json(new ApiResponse(200, null, "Customer deleted successfully"));
// });

// const searchCustomersByTerm = asyncHandler(async (req, res) => {
//   const { q } = req.query;
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 14;

//   if (!q) {
//     return listCustomers(req, res);
//   }

//   const customersData = await searchCustomers(q, page, limit);

//   res
//     .status(200)
//     .json(
//       new ApiResponse(200, customersData, "Customers searched successfully"),
//     );
// });

// const getCustomerByPhoneNumber = asyncHandler(async (req, res) => {
//   const { phone } = req.params;

//   if (!phone) {
//     throw new ApiError(400, "Phone number is required");
//   }

//   const customer = await findCustomerByPhone(phone);

//   if (!customer) {
//     throw new ApiError(404, "Customer not found with this phone number");
//   }

//   res
//     .status(200)
//     .json(new ApiResponse(200, customer, "Customer fetched successfully"));
// });

// const getCustomerByEmailAddress = asyncHandler(async (req, res) => {
//   const { email } = req.params;

//   if (!email) {
//     throw new ApiError(400, "Email is required");
//   }

//   const customer = await findCustomerByEmail(email);

//   if (!customer) {
//     throw new ApiError(404, "Customer not found with this email");
//   }

//   res
//     .status(200)
//     .json(new ApiResponse(200, customer, "Customer fetched successfully"));
// });

// export {
//   createCustomer,
//   listCustomers,
//   getCustomerById,
//   updateCustomerById,
//   deleteCustomerById,
//   searchCustomersByTerm,
//   getCustomerByPhoneNumber,
//   getCustomerByEmailAddress,
// };
