import axiosInstance from "@/lib/axioInstance";

import type { VendorFormData } from "./components/vendorComponents/types";

// ─────────────────────────────────────────────
// Vendor Response
// ─────────────────────────────────────────────

export type VendorResponse = VendorFormData & {
  message?: string;
};

// Update payload can contain only fields that are being changed.
// Password is intentionally optional for edit.
export type VendorUpdateData = Partial<VendorFormData>;

// ─────────────────────────────────────────────
// Payload Builder
// ─────────────────────────────────────────────

const isFilled = (v: unknown) => v !== null && v !== undefined && v !== "";

// garages array saaf karta hai:
// - poori khali row hata deta hai
// - id (purani garage) ko waise hi rehne deta hai, taaki backend update kare
const cleanGarages = (garages: VendorFormData["garages"]) =>
  (garages ?? []).filter((g) =>
    [g.garageAddress, g.garageManager, g.garagePhone].some(isFilled),
  );

const buildJsonPayload = (
  data: Partial<VendorFormData>,
): Partial<VendorFormData> => {
  const payload: Partial<VendorFormData> = {};

  Object.keys(data).forEach((key) => {
    const value = data[key as keyof VendorFormData];

    // garages: khali array [] bhi bhejna hai (isse saari garages delete hoti hain)
    if (key === "garages") {
      if (Array.isArray(value)) {
        payload.garages = cleanGarages(value as VendorFormData["garages"]);
      }
      return;
    }

    if (isFilled(value)) {
      (payload as Record<string, unknown>)[key] = value;
    }
  });

  return payload;
};

export type VendorStatus =
  | "applied"
  | "approved"
  | "rejected"
  | "active"
  | "inactive"
  | "suspended"
  | "blocked";

export type VendorVerification = "pending" | "verified" | "rejected";
// ─────────────────────────────────────────────
// CREATE VENDOR
// ─────────────────────────────────────────────

export const createVendorAPI = async (
  formData: VendorFormData,
): Promise<VendorResponse> => {
  try {
    const payload = buildJsonPayload(formData);

    const response = await axiosInstance.post("/vendor", payload);

    return response.data?.data?.vendor || response.data?.data;
  } catch (error: any) {
    console.error(
      "Error creating vendor:",
      error.response?.data || error.message,
    );

    throw new Error(error.response?.data?.message || "Error creating vendor");
  }
};

// ─────────────────────────────────────────────
// UPDATE VENDOR
// ─────────────────────────────────────────────

export const updateVendorAPI = async (
  id: number,
  formData: VendorUpdateData,
): Promise<VendorResponse> => {
  try {
    const payload = buildJsonPayload(formData);

    const response = await axiosInstance.put(`/vendor/${id}`, payload);

    return response.data?.data?.vendor || response.data?.data;
  } catch (error: any) {
    console.error(
      "Error updating vendor:",
      error.response?.data || error.message,
    );

    throw new Error(error.response?.data?.message || "Error updating vendor");
  }
};

// ─────────────────────────────────────────────
// GET ALL VENDORS
// ─────────────────────────────────────────────

export const getAllVendorsAPI = async (): Promise<VendorResponse[]> => {
  try {
    const response = await axiosInstance.get("/vendor");

    const data = response.data;

    if (data?.data?.vendors) {
      return data.data.vendors;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.vendors)) {
      return data.vendors;
    }

    return [];
  } catch (error: any) {
    console.error(
      "Error fetching vendors:",
      error.response?.data || error.message,
    );

    throw new Error(error.response?.data?.message || "Error fetching vendors");
  }
};

// ─────────────────────────────────────────────
// GET VENDOR BY ID
// ─────────────────────────────────────────────

export const getVendorByIdAPI = async (
  id: number,
): Promise<VendorResponse | null> => {
  try {
    const response = await axiosInstance.get(`/vendor/${id}`);

    const data = response.data;

    if (data?.data?.vendor) {
      return data.data.vendor;
    }

    if (data?.data) {
      return data.data;
    }

    if (data?.vendor) {
      return data.vendor;
    }

    return data || null;
  } catch (error: any) {
    console.error(
      "Error fetching vendor:",
      error.response?.data || error.message,
    );

    throw new Error(error.response?.data?.message || "Error fetching vendor");
  }
};

export const updateVendorStatusAPI = async (
  id: number,
  status: VendorStatus,
): Promise<{ id: number; status: VendorStatus }> => {
  try {
    await axiosInstance.patch(`/vendor/${id}/status`, { status });
    return { id, status };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error updating status");
  }
};

export const deleteVendorAPI = async (id: number): Promise<number> => {
  try {
    await axiosInstance.delete(`/vendor/${id}`);
    return id;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error deleting vendor");
  }
};

// ─────────────────────────────────────────────
// City Type
// ─────────────────────────────────────────────

export type CityResponse = {
  id: number;
  city_name: string;
  zone_id: number;
  created_at?: string;
  updated_at?: string;
};

// ─────────────────────────────────────────────
// GET ALL ACCESS CITIES
// ─────────────────────────────────────────────

export const getAllAccessCitiesAPI = async (): Promise<CityResponse[]> => {
  try {
    const response = await axiosInstance.get("/vendor/access-cities");

    const data = response.data;

    if (data?.data?.cities) {
      return data.data.cities;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.cities)) {
      return data.cities;
    }

    return [];
  } catch (error: any) {
    console.error(
      "Error fetching cities:",
      error.response?.data || error.message,
    );

    throw new Error(error.response?.data?.message || "Error fetching cities");
  }
};

// ─────────────────────────────────────────────
// Region Type
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Region by State
// ─────────────────────────────────────────────

export type StateRegionResponse = {
  state: { id: number; name: string };
  region: { id: number; name: string } | null; // region set nahi ho to null
};

// ─────────────────────────────────────────────
// GET REGION BY STATE ID
// ─────────────────────────────────────────────

export const getRegionByStateIdAPI = async (
  stateId: number,
): Promise<StateRegionResponse | null> => {
  try {
    // NOTE: path wahi rakho jahan backend mein route mount kiya hai
    const response = await axiosInstance.get(
      `/vendor/states/${stateId}/region`,
    );

    const data = response.data;

    if (data?.data?.state) {
      return data.data;
    }

    if (data?.state) {
      return data;
    }

    return null;
  } catch (error: any) {
    console.error(
      "Error fetching region by state:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message || "Error fetching region for state",
    );
  }
};

export const updateVendorVerificationAPI = async (
  id: number,
  verification: VendorVerification,
): Promise<{ id: number; verification: VendorVerification }> => {
  try {
    await axiosInstance.patch(`/vendor/${id}/verification`, { verification });
    return { id, verification };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error updating verification",
    );
  }
};
