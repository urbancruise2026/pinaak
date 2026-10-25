import axiosInstance from "@/lib/axioInstance";
import { baseApi } from "@/lib/commonApi";

// ===============================
// Types
// ===============================

export interface Region {
  id: number;
  region_name: string;
}

export interface Zone {
  id: number;
  zone_name: string;
  region_id: number;
}

export interface City {
  id: number;
  city_name: string;
  zone_id: number;
}

export interface RegionResponse {
  success: boolean;
  data: Region[];
}

export interface ZoneResponse {
  success: boolean;
  data: Zone[];
}

export interface CityResponse {
  success: boolean;
  data: City[];
}

// ===============================
// Axios Error Handler
// ===============================

const handleAxiosError = (error: any, context: string): never => {
  console.error(`❌ [${context}] Error:`, {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
  });

  if (error.code === "ECONNABORTED") {
    throw new Error("Request timeout - Server is taking too long");
  }

  if (!error.response) {
    throw new Error(
      `Cannot connect to server at ${baseApi}. Backend running hai ya nahi check karo.`,
    );
  }

  throw new Error(
    error.response?.data?.message ||
      `Server error: ${error.response?.status}`,
  );
};

// ===============================
// Get All Regions
// ===============================

export const getAllRegionsApi = async (): Promise<RegionResponse> => {
  try {
    const { data: res } = await axiosInstance.get<RegionResponse>(
      "/zones/regions",
      {
        timeout: 10000,
      },
    );

    return {
      success: res.success,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getAllRegionsApi");
  }
};

// ===============================
// Get Zones By Region
// ===============================

export const getZonesByRegionApi = async (
  regionId: number,
): Promise<ZoneResponse> => {
  try {
    const { data: res } = await axiosInstance.get<ZoneResponse>(
      `/zones/regions/${regionId}/zones`,
      {
        timeout: 10000,
      },
    );

    return {
      success: res.success,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getZonesByRegionApi");
  }
};

// ===============================
// Get Cities By Zone
// ===============================

export const getCitiesByZoneApi = async (
  zoneId: number,
): Promise<CityResponse> => {
  try {
    const { data: res } = await axiosInstance.get<CityResponse>(
      `/zones/zones/${zoneId}/cities`,
      {
        timeout: 10000,
      },
    );

    return {
      success: res.success,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getCitiesByZoneApi");
  }
};