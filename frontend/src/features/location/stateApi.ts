import axiosInstance from "@/lib/axioInstance";

export interface City {
  id: number;
  cityName: string;
}

export interface State {
  id: number;
  stateName: string;
}

// ✅ GET ALL STATES
export const getAllStatesApi = async (): Promise<State[]> => {
  try {
    const res = await axiosInstance.get("/state/");
    return res.data.data;
  } catch (error: any) {
    console.error(
      "Error fetching states:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Failed to fetch states");
  }
};

// ✅ GET ALL CITIES
export const getAllCitiesApi = async (): Promise<City[]> => {
  try {
    const res = await axiosInstance.get("/state/allcity");
    return res.data.data;
  } catch (error: any) {
    console.error(
      "Error fetching cities:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Failed to fetch cities");
  }
};

// ✅ GET STATES BY CITY (KEY FUNCTION)
export const getStatesByCityApi = async (
  cityName: string,
): Promise<State[]> => {
  try {
    const res = await axiosInstance.get(
      `/state/states-by-city/${encodeURIComponent(cityName)}`,
    );
    return res.data.data;
  } catch (error: any) {
    console.error(
      "Error fetching states by city:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch states by city",
    );
  }
};
