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
  getRegionByStateIdModel,
} from "./vendor.model.js";

/* ---------- Validation helpers ---------- */

const isFilled = (v) => v !== undefined && v !== null && v !== "";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;

// bank + garages ki validation (create aur update dono me use hoti hai)
// sirf wahi fields check hoti hain jo body me aayi hain
const validateBankAndGarages = (data) => {
  if (data.companies !== undefined && !Array.isArray(data.companies)) {
    throw new ApiError(400, "companies must be an array");
  }

  // har company ki bank details check karo
  (data.companies ?? []).forEach((c, i) => {
    if (isFilled(c.ifscCode)) {
      c.ifscCode = String(c.ifscCode).trim().toUpperCase();
      if (!IFSC_REGEX.test(c.ifscCode)) {
        throw new ApiError(
          400,
          `Company ${i + 1}: Invalid IFSC code (example: SBIN0001234)`,
        );
      }
    }

    if (isFilled(c.bankAccountNumber)) {
      c.bankAccountNumber = String(c.bankAccountNumber).trim();
      if (!ACCOUNT_NUMBER_REGEX.test(c.bankAccountNumber)) {
        throw new ApiError(
          400,
          `Company ${i + 1}: Bank account number must be 9 to 18 digits`,
        );
      }
    }
  });

  if (data.garages !== undefined && !Array.isArray(data.garages)) {
    throw new ApiError(400, "garages must be an array");
  }
};

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

  // region / vendorCategory zaroori karna ho to ye 2 lines uncomment karo:
  // if (!data.region) throw new ApiError(400, "Region is required");
  // if (!data.vendorCategory) throw new ApiError(400, "Vendor category is required");

  validateBankAndGarages(data);

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
          region: data.region || null,
          vendorCategory: data.vendorCategory || null,
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

  validateBankAndGarages(data);

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
          region: data.region || null,
          vendorCategory: data.vendorCategory || null,
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
    // ApiError (jaise 404) ko 500 me mat badlo
    if (error instanceof ApiError) throw error;
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

export const getRegionByStateIdController = asyncHandler(async (req, res) => {
  const { stateId } = req.params;

  if (!stateId || !/^\d+$/.test(String(stateId))) {
    throw new ApiError(400, "Valid stateId is required");
  }

  const row = await getRegionByStateIdModel(Number(stateId));

  if (!row) {
    throw new ApiError(404, "State not found");
  }

  // frontend ke liye { id, name } format (dropdown wale format jaisa)
  const region = row.region_id
    ? { id: row.region_id, name: row.region_name }
    : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        state: { id: row.state_id, name: row.stateName },
        region,
      },
      "Region fetched successfully",
    ),
  );
});
