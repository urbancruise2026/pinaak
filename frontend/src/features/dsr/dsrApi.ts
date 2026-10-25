import axiosInstance from "@/lib/axioInstance";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── CREATE DSR ───────────────────────────────────────────────────────────────

export const createDsrApi = async (dsrData: Record<string, any>) => {
  try {
    console.log("Create DSR Payload:", dsrData);
    const response = await axiosInstance.post<ApiResponse<any>>(
      "/dsr/create",
      dsrData,
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Create DSR Error:", error.response?.data || error.message);
    const apiError = error.response?.data;
    throw new Error(
      apiError?.error ||
        apiError?.message ||
        apiError?.details ||
        error.message ||
        "Failed to create DSR",
    );
  }
};

// ─── UPDATE DSR ───────────────────────────────────────────────────────────────
export const updateDsrApi = async (
  id: string,
  dsrData: Record<string, any>,
) => {
  try {
    console.log("Update DSR Payload:", { id, data: dsrData });
    const response = await axiosInstance.put<ApiResponse<any>>(
      `/dsr/${id}`,
      dsrData,
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Update DSR Error:", error.response?.data || error.message);
    const apiError = error.response?.data;
    throw new Error(
      apiError?.error ||
        apiError?.message ||
        apiError?.details ||
        error.message ||
        "Failed to update DSR",
    );
  }
};

// ─── GET DSR BY ID ───────────────────────────────────────────────────────────────
export const getDsrByIdApi = async (id: string) => {
  try {
    const response = await axiosInstance.get<ApiResponse<any>>(`/dsr/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Get DSR By ID Error:",
      error.response?.data || error.message,
    );
    const apiError = error.response?.data;
    throw new Error(
      apiError?.error ||
        apiError?.message ||
        apiError?.details ||
        error.message ||
        "Failed to fetch DSR details",
    );
  }
};

// ─── GET ALL DSR ───────────────────────────────────────────────────────────────
export const getAllDsrApi = async (params: Record<string, any>) => {
  try {
    const response = await axiosInstance.get<ApiResponse<any>>("/dsr/getAll", {
      params,
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Get All DSR Error:", error.response?.data || error.message);
    const apiError = error.response?.data;
    throw new Error(
      apiError?.error ||
        apiError?.message ||
        apiError?.details ||
        error.message ||
        "Failed to fetch DSR list",
    );
  }
};
