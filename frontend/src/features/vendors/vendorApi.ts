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

const buildJsonPayload = (
  data: Partial<VendorFormData>,
): Partial<VendorFormData> => {
  const payload: Partial<VendorFormData> = {};

  Object.keys(data).forEach((key) => {
    const value =
      data[key as keyof VendorFormData];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      (
        payload as Record<string, unknown>
      )[key] = value;
    }
  });

  return payload;
};

// ─────────────────────────────────────────────
// CREATE VENDOR
// ─────────────────────────────────────────────

export const createVendorAPI = async (
  formData: VendorFormData,
): Promise<VendorResponse> => {
  try {
    const payload = buildJsonPayload(formData);

    const response = await axiosInstance.post(
      "/vendor",
      payload,
    );

    return (
      response.data?.data?.vendor ||
      response.data?.data
    );
  } catch (error: any) {
    console.error(
      "Error creating vendor:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        "Error creating vendor",
    );
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

    const response = await axiosInstance.put(
      `/vendor/${id}`,
      payload,
    );

    return (
      response.data?.data?.vendor ||
      response.data?.data
    );
  } catch (error: any) {
    console.error(
      "Error updating vendor:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        "Error updating vendor",
    );
  }
};

// ─────────────────────────────────────────────
// GET ALL VENDORS
// ─────────────────────────────────────────────

export const getAllVendorsAPI = async (): Promise<
  VendorResponse[]
> => {
  try {
    const response =
      await axiosInstance.get("/vendor");

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

    throw new Error(
      error.response?.data?.message ||
        "Error fetching vendors",
    );
  }
};

// ─────────────────────────────────────────────
// GET VENDOR BY ID
// ─────────────────────────────────────────────

export const getVendorByIdAPI = async (
  id: number,
): Promise<VendorResponse | null> => {
  try {
    const response =
      await axiosInstance.get(
        `/vendor/${id}`,
      );

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

    throw new Error(
      error.response?.data?.message ||
        "Error fetching vendor",
    );
  }
};

export default {
  createVendorAPI,
  updateVendorAPI,
  getAllVendorsAPI,
  getVendorByIdAPI,
};
