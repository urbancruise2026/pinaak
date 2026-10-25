import axiosInstance from "@/lib/axioInstance";
import { Vehicle } from "@/types/types";

export type VehicleStatus = "Active" | "Suspended" | "Blocked";

export interface UpdateVehicleStatusPayload {
  status: VehicleStatus;
}

export const createVehiclesManagerApi = async (
  vehicleData: Omit<Vehicle, "id">,
): Promise<Vehicle> => {
  try {
    const res = await axiosInstance.post("/vehiclemanager", vehicleData);

    console.log("✅ Vehicle manager created successfully:", res.data?.data);

    return res.data.data;
  } catch (error: any) {
    console.error(
      "❌ Error creating vehicle manager:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message || "Failed to create vehicle manager",
    );
  }
};

export interface GetVehicleManagersParams {
  search?: string;

  vendor?: string;
  garage?: string;

  city?: string;
  code?: string;
  year?: number | string;

  category?: string;
  seat?: string;
  variant?: string;

  page?: number;
  limit?: number;
}

export interface GetVehicleManagersResponse {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =====================================================
// GET ALL VEHICLE MANAGERS
// =====================================================

export const getVehicleManagersApi = async (
  params: GetVehicleManagersParams = {},
): Promise<GetVehicleManagersResponse> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager", {
      params: {
        search: params.search || undefined,

        vendor: params.vendor || undefined,
        garage: params.garage || undefined,

        city: params.city || undefined,
        code: params.code || undefined,
        year: params.year || undefined,

        category: params.category || undefined,
        seat: params.seat || undefined,
        variant: params.variant || undefined,

        page: params.page || 1,
        limit: params.limit || 20,
      },
    });

    return res.data.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching vehicle managers:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message || "Failed to fetch vehicle managers",
    );
  }
};

// =====================================================
// VEHICLE MASTER CODES
// =====================================================

export interface VehicleMasterCode {
  code: string;
  amenities: string | null;
}

export const getVehicleMasterCodesApi = async (): Promise<
  VehicleMasterCode[]
> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager/options/codes");

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching vehicle master codes:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message || "Failed to fetch vehicle master codes",
    );
  }
};

export interface VehicleMasterVariant {
  variant: string;
}

export const getVehicleMasterVariantsApi = async (
  code: string,
): Promise<VehicleMasterVariant[]> => {
  try {
    const res = await axiosInstance.get(`/vehicle/variant/${code}`);

    const variantList: string[] = res.data?.data?.variant || [];

    return variantList.map((v) => ({ variant: v }));
  } catch (error: any) {
    console.error(
      "❌ Error fetching vehicle master variants:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        "Failed to fetch vehicle master variants",
    );
  }
};

export interface VehicleMasterAmenity {
  name: string;
}

export const getVehicleMasterAmenitiesApi = async (): Promise<
  VehicleMasterAmenity[]
> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager/options/amenities");

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching vehicle master amenities:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        "Failed to fetch vehicle master amenities",
    );
  }
};

// =====================================================
// VENDORS
// =====================================================

export interface VehicleManagerVendor {
  name: string;
}

export const getVehicleManagerVendorsApi = async (): Promise<
  VehicleManagerVendor[]
> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager/options/vendors");

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching vendors:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message || "Failed to fetch vendors",
    );
  }
};

// =====================================================
// CITIES
// =====================================================

export interface VehicleCity {
  id: number;
  name: string;
}

interface RawCityFromApi {
  id: number;
  city_name: string;
}

export const getAllCitiesApi = async (): Promise<VehicleCity[]> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager/citys");

    const rawCities: RawCityFromApi[] = res.data?.data || [];

    return rawCities.map((city) => ({
      id: city.id,
      name: city.city_name,
    }));
  } catch (error: any) {
    console.error(
      "❌ Error fetching cities:",
      error?.response?.data || error?.message,
    );

    throw new Error(error?.response?.data?.message || "Failed to fetch cities");
  }
};

// =====================================================
// UPDATE VEHICLE STATUS
// =====================================================

export const updateVehicleStatusApi = async (
  vehicleId: number | string,
  status: VehicleStatus,
): Promise<Vehicle> => {
  try {
    console.log("🚗 Updating vehicle status:", {
      vehicleId,
      status,
    });

    const res = await axiosInstance.patch(
      `/vehiclemanager/updatestatus/${vehicleId}`,
      {
        status,
      },
    );

    console.log("✅ Vehicle status updated:", res.data);

    return res.data?.data;
  } catch (error: any) {
    console.error(
      "❌ Error updating vehicle status:",
      error?.response?.status,
      error?.response?.data,
      error?.message,
    );

    throw new Error(
      error?.response?.data?.message || "Failed to update vehicle status",
    );
  }
};

// =====================================================
// GET VEHICLE MANAGER BY ID
// =====================================================

export const getVehicleManagerByIdApi = async (
  id: number | string,
): Promise<Vehicle> => {
  try {
    const response = await axiosInstance.get(`/vehiclemanager/${id}`);

    return response.data?.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching vehicle manager by id:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        "Failed to fetch vehicle manager details",
    );
  }
};
