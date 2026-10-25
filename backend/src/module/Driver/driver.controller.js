import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createDriverModel,
  getAllDriversModel,
  getDriverByIdModel,
  updateDriverModel,
  deleteDriverModel,
} from "./driver.model.js";

// Helper function to format a single driver
const formatDriver = (driver) => {
  if (!driver) return null;

  return {
    id: driver.id,
    personalInfo: {
      firstName: driver.first_name,
      lastName: driver.last_name,
      dateOfBirth: driver.date_of_birth,
      gender: driver.gender,
      email: driver.email,
      phone: driver.phone,
      emergencyContact: driver.emergency_contact,
      bloodGroup: driver.blood_group,
      vendor: driver.vendor,
      vendorState: driver.vendor_state,
      vendorCity: driver.vendor_city,
    },
    addressInfo: {
      permanentAddress: driver.permanent_address,
      permanentCity: driver.permanent_city,
      permanentState: driver.permanent_state,
      permanentPincode: driver.permanent_pincode,
      currentAddress: driver.current_address,
      currentCity: driver.current_city,
      currentState: driver.current_state,
      currentPincode: driver.current_pincode,
    },
    licenseInfo: {
      licenseNumber: driver.license_number,
      licenseType: driver.license_type,
      issuingAuthority: driver.issuing_authority,
      issueDate: driver.issue_date,
      experienceDetails: driver.experience_details,
      expiryDate: driver.expiry_date,
      dlFront: driver.dl_front,
      dlBack: driver.dl_back,
    },
    employmentInfo: {
      employeeId: driver.employee_id,
    },
    documents: {
      aadharCard: driver.aadhar_card,
      panCard: driver.pan_card,
    },
  };
};

// ================= CREATE DRIVER =================
export const createDriverController = asyncHandler(async (req, res) => {
  const data = req.body;

  const result = await createDriverModel(data);

  if (!result?.insertId) {
    throw new ApiError(500, "Failed to create driver");
  }

  const firstName = data?.firstName || data?.personalInfo?.firstName || null;
  const lastName = data?.lastName || data?.personalInfo?.lastName || null;
  const employeeId =
    data?.employeeId || data?.employmentInfo?.employeeId || null;
  const licenseNumber =
    data?.licenseNumber || data?.licenseInfo?.licenseNumber || null;

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        driver: {
          id: result.insertId,
          firstName,
          lastName,
          employeeId,
          licenseNumber,
        },
      },
      "Driver created successfully",
    ),
  );
});

// ================= GET ALL DRIVERS - FIXED =================
export const getAllDriversController = asyncHandler(async (req, res) => {
  const drivers = await getAllDriversModel();

  // Format each driver to nested structure
  const formattedDrivers = drivers.map((driver) => formatDriver(driver));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { drivers: formattedDrivers },
        "Drivers fetched successfully",
      ),
    );
});

// ================= GET DRIVER BY ID =================
export const getDriverByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Driver ID is required");
  }

  const driver = await getDriverByIdModel(id);

  if (!driver) {
    throw new ApiError(404, "Driver not found");
  }

  const formattedDriver = formatDriver(driver);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { driver: formattedDriver },
        "Driver fetched successfully",
      ),
    );
});

// ================= UPDATE DRIVER =================
export const updateDriverController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!id) {
    throw new ApiError(400, "Driver ID is required");
  }

  const result = await updateDriverModel(id, data);

  if (!result?.affectedRows) {
    throw new ApiError(404, "Driver not found or nothing to update");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        driver: {
          id: Number(id),
          firstName: data.personalInfo?.firstName,
          lastName: data.personalInfo?.lastName,
          message: "Driver updated successfully",
        },
      },
      "Driver updated successfully",
    ),
  );
});

// ================= DELETE DRIVER =================
export const deleteDriverController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Driver ID is required");
  }

  const result = await deleteDriverModel(id);

  if (!result?.affectedRows) {
    throw new ApiError(404, "Driver not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Driver deleted successfully"));
});
