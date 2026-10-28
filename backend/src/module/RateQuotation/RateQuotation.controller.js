import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  createQuotationModel,
  getActiveChargeTemplatesModel,
  getActiveNoteTemplatesModel,
  getRateQuotationByLeadId,
} from "./RateQuotation.model.js";

export const getAllNoteTemplates = asyncHandler(async (req, res) => {
  const result = await getActiveNoteTemplatesModel();
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Note templates fetched successfully"));
});

export const getAllChargeTemplates = asyncHandler(async (req, res) => {
  const result = await getActiveChargeTemplatesModel();
  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Charge templates fetched successfully"),
    );
});

export const createQuotation = asyncHandler(async (req, res) => {
  const data = req.body;

  if (!data.customer_id) {
    throw new ApiError(400, "customer_id is required");
  }

  if (!data.vehicle_options || !data.vehicle_options.length) {
    throw new ApiError(400, "At least one vehicle option is required");
  }

  for (const opt of data.vehicle_options) {
    if (!opt.vehicle_name) {
      throw new ApiError(
        400,
        "vehicle_name is required in every vehicle option",
      );
    }
  }

  if (data.notes?.some((n) => !n.note_text)) {
    throw new ApiError(400, "note_text is required in every note");
  }

  if (data.other_charges?.some((c) => !c.charge_name)) {
    throw new ApiError(400, "charge_name is required in every charge");
  }

  const result = await createQuotationModel(data);

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Quotation created successfully"));
});

export const getRateQuotationByLeadIdController = asyncHandler(
  async (req, res) => {
    const { leadId } = req.params;

    if (!leadId) {
      throw new ApiError(400, "leadId is required");
    }

    const quotation = await getRateQuotationByLeadId(leadId);

    if (!quotation) {
      throw new ApiError(404, "Rate quotation not found for this lead");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, quotation, "Rate quotation fetched successfully"),
      );
  },
);
