import axiosInstance from "@/lib/axioInstance";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── CREATE RATE QUOTATION ───────────────────────────────
export const createRateQuotationApi = async (data: Record<string, any>) => {
  try {
    const response = await axiosInstance.post<ApiResponse<any>>(
      "/rate/create",
      data,
    );
    return response.data.data;
  } catch (error: any) {
    const apiError = error.response?.data;
    throw new Error(
      apiError?.error ||
        apiError?.message ||
        apiError?.details ||
        error.message ||
        "Failed to create Rate Quotation",
    );
  }
};

// ─── GET RATE BY LEAD ID ───────────────────────────────
export const getRateQuotationByLeadIdApi = async (leadId: string) => {
  try {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/rate/${leadId}`,
    );
    return response.data.data;
  } catch (error: any) {
    const apiError = error.response?.data;
    throw new Error(
      apiError?.error ||
        apiError?.message ||
        apiError?.details ||
        error.message ||
        "Failed to fetch Rate Quotation",
    );
  }
};

// ─── GET ALL RATE QUOTATIONS ───────────────────────────────
export const getAllRateQuotationApi = async (params: Record<string, any>) => {
  try {
    const response = await axiosInstance.get<ApiResponse<any>>("/rate/all", {
      // ✅ /getAll → /all
      params,
    });
    return response.data.data;
  } catch (error: any) {
    const apiError = error.response?.data;
    throw new Error(
      apiError?.error ||
        apiError?.message ||
        apiError?.details ||
        error.message ||
        "Failed to fetch Rate Quotations",
    );
  }
};
