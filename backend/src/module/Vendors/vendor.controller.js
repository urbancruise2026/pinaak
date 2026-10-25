import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createVendorModel,
  updateVendorModel,
  getAllVendorsModel, // ✅ Add this import
  getVendorByIdModel, // ✅ Add this import
} from "./vendor.model.js";

export const createVendorController = asyncHandler(async (req, res) => {
  const data = req.body;


  if (!data.name) {
    throw new ApiError(400, "Name is required");
  }

  const result = await createVendorModel(data);

  if (!result?.insertId) {
    throw new ApiError(500, "Failed to create vendor");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        vendor: {
          id: result.insertId,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          code: data.shortName || null,
          message: "Vendor created successfully",
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
