import axiosInstance from "@/lib/axioInstance";

import type {
  ChargeTemplate,
  NoteTemplate,
} from "../rate-quotation/components/rateQuotationFormComponents/types";

export type { ChargeTemplate, NoteTemplate };

export interface CreateQuotationVehicle {
  sr_no?: number;
  vehicle_manager_id?: number | null;
  vehicle_number?: string | null;
  vehicle_name?: string | null;
  seats?: number | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  price?: number;
  remarks?: string | null;
}

export interface CreateQuotationVehicleOption {
  sr_no?: number;
  vehicle_manager_id?: number | null;
  seats?: number | null;
  vehicle_name: string;
  category_name?: string | null;
  no_of_vehicles?: number;
  description?: string | null;
  discounted_price?: number;

  vehicles?: CreateQuotationVehicle[];
}

export interface CreateQuotationNote {
  note_text: string;
  sort_order?: number;
}

export interface CreateQuotationCharge {
  charge_name: string;
  charge_detail?: string | null;
  is_included?: boolean;
  sort_order?: number;
}

export interface CreateQuotationPayload {
  customer_id: number | string;
  lead_id?: number | string | null;

  quote_date?: string | null;
  valid_till?: string | null;

  travel_detail?: string | null;

  pickup_location?: string | null;
  pickup_time?: string | null;

  drop_location?: string | null;
  drop_time?: string | null;

  travel_from?: string | null;
  travel_to?: string | null;

  total_days?: number | null;
  trip_type?: string | null;
  pax?: number | null;

  remarks?: string | null;
  offer_text?: string | null;

  status?: string;

  notes?: CreateQuotationNote[];

  other_charges?: CreateQuotationCharge[];

  vehicle_options: CreateQuotationVehicleOption[];
}

export interface CreateQuotationResponse {
  id: number;
  quote_no: string;
}
export const getChargeTemplates = async (): Promise<ChargeTemplate[]> => {
  try {
    const res = await axiosInstance.get("/rate_quotation/charges");

    return res.data.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching charge templates:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message || "Failed to fetch charge templates",
    );
  }
};

export const getNoteTemplates = async (): Promise<NoteTemplate[]> => {
  try {
    const res = await axiosInstance.get("/rate_quotation/notes");

    return res.data.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching note templates:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message || "Failed to fetch note templates",
    );
  }
};

export const getRateQuotationByLeadIdApi = async (leadId: string) => {
  try {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/rate/${leadId}`,
    );
    return response.data.data;
  } catch (error: any) {
    const apiError = error.response?.data;
    throw new Error(
      apiError?.error ||
        apiError?.message ||
        apiError?.details ||
        error.message ||
        "Failed to fetch Rate Quotation",
    );
  }
};

export const createRateQuotationApi = async (
  payload: CreateQuotationPayload,
): Promise<CreateQuotationResponse> => {
  try {
    const response = await axiosInstance.post<{
      data: CreateQuotationResponse;
      message?: string;
      success?: boolean;
      statusCode?: number;
    }>("/rate_quotation", payload);

    return response.data.data;
  } catch (error: any) {
    const apiError = error.response?.data;

    console.error(
      "❌ Error creating Rate Quotation:",
      apiError || error.message,
    );

    throw new Error(
      apiError?.error ||
        apiError?.message ||
        apiError?.details ||
        error.message ||
        "Failed to create Rate Quotation",
    );
  }
};
