import axiosInstance from "@/lib/axioInstance";
import { countryData } from "@/types/types";

// ─── CREATE COUNTRY ───────────────────────────
export const createCountryCodeApi = async (
  formData: countryData,
): Promise<countryData> => {
  try {
    const response = await axiosInstance.post("/country", formData);

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating country:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Error creating country");
  }
};

// ─── GET ALL COUNTRIES ────────────────────────
export const getAllCountriesApi = async (): Promise<countryData[]> => {
  try {
    const response = await axiosInstance.get("/country");

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Error fetching countries:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Error fetching countries",
    );
  }
};

// ─── GET COUNTRY CODES ────────────────────────
export const getCountryByCodeApi = async (): Promise<
  Pick<countryData, "country_code" | "phone_code">
> => {
  try {
    const response = await axiosInstance.get("/country/codes");

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Error fetching country code:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch country code",
    );
  }
};
