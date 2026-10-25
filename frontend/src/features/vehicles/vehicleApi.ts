import axiosInstance from "@/lib/axioInstance";
import { Vehicle } from "@/types/types";

export interface PaginatedVehicles {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getVehiclesApi = async (): Promise<Vehicle[]> => {
  try {
    const res = await axiosInstance.get("/vehicle");
    return res.data.data;
  } catch (error: any) {
    console.error("❌ Error fetching vehicles:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch vehicles");
  }
};

export const createvehiclesApi = async (vehicleData: Omit<Vehicle, "id">): Promise<Vehicle> => {
  try {
    const res = await axiosInstance.post("/vehicle", vehicleData);
    return res.data.data;
  } catch (error: any) {
    console.error("❌ Error creating vehicle:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to create vehicle");
  }
};

export const getAllVehiclesApi = async (params?: {
  search?: string;
  category?: string;
  make?: string;
  seat?: string; // ✅ add kiya
  variant?: string; // ✅ add kiya
  page?: number;
  limit?: number;
}): Promise<PaginatedVehicles> => {
  try {
    const res = await axiosInstance.get("/vehicle/getall", { params });
    return res.data.data;
  } catch (error: any) {
    console.error("❌ Error fetching all vehicles:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch all vehicles");
  }
};

export const getSeatOptionsApi = async (): Promise<string[]> => {
  try {
    const res = await axiosInstance.get("/vehicle/seat-options");
    return res.data.data;
  } catch (error: any) {
    console.error("❌ Error fetching seat options:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch seat options");
  }
};


export const getVehicleByIdApi = async (
  id: string
): Promise<Vehicle> => {
  try {
    const response = await axiosInstance.get<{
      statusCode: number;
      data: Vehicle;
      message: string;
      success: boolean;
    }>(`/vehicle/${id}`);

    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch vehicle"
    );
  }
};