import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { generateVendorId } from "./vender.service.js";
import {
  createVendorModel,
  updateVendorModel,
  getAllVendorsModel,
  getVendorByIdModel,
  deleteVendorModel,
  updateVendorStatusModel,
  getAllAccessCitiesModel,
  updateVendorVerificationModel,
} from "./vendor.model.js";

export const createVendorController = asyncHandler(async (req, res) => {
  const data = req.body;
  console.log("re.body", data);
  if (!data.name) {
    throw new ApiError(400, "Name is required");
  }

  const city = data.personalInfo?.personalCity;
  if (!city) {
    throw new ApiError(400, "City is required");
  }

  const vendorId = await generateVendorId(city);

  const result = await createVendorModel({ ...data, vender_code: vendorId });

  if (!result?.insertId) {
    throw new ApiError(500, "Failed to create vendor");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        vendor: {
          id: result.insertId,
          venderCode: vendorId,
          name: data.name,
          city,
          email: data.email || null,
          phone: data.phone || null,
          code: data.shortName || null,
        },
      },
      "Vendor created successfully",
    ),
  );
});
// ================= UPDATE =================
export const updateVendorController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!id) {
    throw new ApiError(400, "Vendor ID is required");
  }

  const result = await updateVendorModel(id, data);

  if (!result?.affectedRows) {
    throw new ApiError(404, "Vendor not found or nothing to update");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        vendor: {
          id: Number(id),
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          code: data.shortName || null,
          message: "Vendor updated successfully",
        },
      },
      "Vendor updated successfully",
    ),
  );
});

// ================= GET ALL =================
export const getAllVendorsController = asyncHandler(async (req, res) => {
  const vendors = await getAllVendorsModel();

  return res
    .status(200)
    .json(new ApiResponse(200, { vendors }, "Vendors fetched successfully"));
});

// ================= GET BY ID =================
export const getVendorByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Convert to number safely
  const vendorId = Number(id);

  // Validate ID
  if (!vendorId || isNaN(vendorId)) {
    console.error("❌ Invalid Vendor ID:", id);
    throw new ApiError(400, "Invalid Vendor ID");
  }

  try {
    const vendor = await getVendorByIdModel(vendorId);

    if (!vendor) {
      console.error("❌ Vendor not found for ID:", vendorId);
      throw new ApiError(404, "Vendor not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { vendor }, "Vendor fetched successfully"));
  } catch (error) {
    console.error("🔥 Controller Error:", error);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const VENDOR_STATUSES = [
  "applied",
  "approved",
  "rejected",
  "active",
  "inactive",
  "suspended",
  "blocked",
];

export const updateVendorStatusController = asyncHandler(async (req, res) => {
  const { status } = req.body;
  console.log(" req.body;", status);
  if (!VENDOR_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${VENDOR_STATUSES.join(", ")}`,
    );
  }

  const result = await updateVendorStatusModel(req.params.id, status);
  if (!result.affectedRows) throw new ApiError(404, "Vendor not found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id: Number(req.params.id), status },
        `Vendor marked ${status}`,
      ),
    );
});

export const deleteVendorController = asyncHandler(async (req, res) => {
  try {
    const result = await deleteVendorModel(req.params.id);
    if (!result.affectedRows) throw new ApiError(404, "Vendor not found");
  } catch (err) {
    // drivers table is vendor ko refer karti hai
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      throw new ApiError(
        409,
        "This vendor has drivers linked. Remove or reassign them first, or mark the vendor Inactive.",
      );
    }
    throw err;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id: Number(req.params.id) },
        "Vendor deleted successfully",
      ),
    );
});

export const getAllAccessCitiesController = asyncHandler(async (req, res) => {
  const cities = await getAllAccessCitiesModel();

  return res
    .status(200)
    .json(new ApiResponse(200, { cities }, "Cities fetched successfully"));
});
const VERIFICATION_STATUSES = ["pending", "verified", "rejected"];

export const updateVendorVerificationController = asyncHandler(
  async (req, res) => {
    const { verification } = req.body;
    if (!VERIFICATION_STATUSES.includes(verification)) {
      throw new ApiError(
        400,
        `Verification must be one of: ${VERIFICATION_STATUSES.join(", ")}`,
      );
    }

    const result = await updateVendorVerificationModel(
      req.params.id,
      verification,
    );
    if (!result.affectedRows) throw new ApiError(404, "Vendor not found");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { id: Number(req.params.id), verification },
          `Vendor verification marked ${verification}`,
        ),
      );
  },
);
