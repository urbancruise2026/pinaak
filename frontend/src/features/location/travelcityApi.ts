import axiosInstance from "@/lib/axioInstance";
import { travelcity } from "@/types/types";

// ✅ GET ALL CITIES
export const getAllCitiesApi = async (): Promise<travelcity[]> => {
  try {
    const response = await axiosInstance.get("/travelcity");

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Error fetching cities:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ✅ GET CITY BY ID
export const getCityByIdApi = async (
  id: number | string,
): Promise<travelcity> => {
  try {
    const response = await axiosInstance.get(`/travelcity/${id}`);

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Error fetching city:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

// ✅ GET CITY NAMES ONLY
export const getCityNamesApi = async (): Promise<
  Pick<travelcity, "id" | "uuid" | "cityName">[]
> => {
  try {
    const response = await axiosInstance.get("/travelcity/names");

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Error fetching city names:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch city names",
    );
  }
};
