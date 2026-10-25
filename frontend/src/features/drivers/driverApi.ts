import axiosInstance from "@/lib/axioInstance";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { DriverFormData, DriverResponse } from "./driver.types";

export type { DriverFormData, DriverResponse };

// Drops null/undefined/"" top-level values; objects (the sections) pass through as-is
const buildJsonPayload = (data: DriverFormData): Partial<DriverFormData> =>
  Object.fromEntries(
    Object.entries(data).filter(([, v]) => typeof v === "object" ? v !== null : v != null && v !== ""),
  );

interface DriverEnvelope {
  data: DriverResponse | { driver: DriverResponse };
}

const unwrap = (body: DriverEnvelope): DriverResponse =>
  "driver" in body.data ? body.data.driver : body.data;

export const createDriverAPI = async (formData: DriverFormData): Promise<DriverResponse> => {
  try {
    const { data } = await axiosInstance.post<DriverEnvelope>("/driver", buildJsonPayload(formData));
    return unwrap(data);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error creating driver"));
  }
};

export const updateDriverAPI = async (id: number, formData: DriverFormData): Promise<DriverResponse> => {
  try {
    const { data } = await axiosInstance.put<DriverEnvelope>(`/driver/${id}`, buildJsonPayload(formData));
    return unwrap(data);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Error updating driver"));
  }
};

export default { createDriverAPI, updateDriverAPI };