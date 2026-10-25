// services/leadsReportApi.ts
import axiosInstance from "@/lib/axioInstance";
import { baseApi } from "@/lib/commonApi";

// ─── Types ────────────────────────────────────────────────────────────

export interface MonthlyEnquiryRecord {
  month: number;
  day: number;
  total: number;
}

export interface LeadCountRecord {
  date: string;
  leadCount: number;
}

export interface MonthlyEnquiryResponse {
  success: boolean;
  year: number;
  data: MonthlyEnquiryRecord[];
}

export interface LeadCountByDateResponse {
  success: boolean;
  year: number;
  totalLeads: number;
  totalDays: number;
  avgLeadsPerDay: number;
  data: LeadCountRecord[];
}

export interface DayRecord {
  day: number;
  leads: number;
  booked: number;
}

export interface AdviserDistributionRecord {
  adviser_id: number;
  adviser_name: string;
  total_leads: number;
  total_booked: number;
  avg_leads_per_day: number;
  cntb_percentage: number;
  days: DayRecord[];
}

export interface TeamTotal {
  total_leads: number;
  total_booked: number;
  days: DayRecord[];
}

export interface LeadDistributionResponse {
  success: boolean;
  month: number;
  year: number;
  advisorId: number | null;
  totalDaysInMonth: number;
  data: AdviserDistributionRecord[];
  teamTotal: TeamTotal;
}

export interface LeadDistributionParams {
  month?: number;
  year?: number;
  advisorId?: string | number | null;
  regionId?: string;
  zoneId?: string;
  cityId?: string;
}

// ✅ merged into a single definition (was duplicated before, causing a
// "Duplicate identifier 'StatusWiseReportParams'" TS error)
export interface StatusWiseReportParams {
  month?: number;
  year?: number;
  regionId?: string;
  zoneId?: string;
  cityId?: string;
}

export interface StatusWiseReportItem {
  adviser_name: string;
  blank: number;
  kyc: number;
  rfq: number;
  lost: number;
  book: number;
  total: number;
  con: string;
}

export interface StatusWiseReportResponse {
  success: boolean;
  month: number;
  year: number;
  data: StatusWiseReportItem[];
  teamTotal: {
    blank: number;
    kyc: number;
    rfq: number;
    lost: number;
    book: number;
    total: number;
  };
}

export interface TimeEnquiryRecord {
  month: number;
  day: number;
  hour: number;
  total: number;
}

export interface TimeEnquiryResponse {
  success: boolean;
  year?: number;
  data: TimeEnquiryRecord[];
}

export interface MonthlyReportTwoRecord {
  month: string; // "JAN", "FEB", etc.
  year: number;
  dates: Record<number, number>; // { 1: 0, 2: 3, ... 31: 0 }
}

export interface MonthlyReportTwoDayRecord {
  date: string;
  day?: number ;
  month?: number | string;
  year?: number;
  total?: number;
  [key: string]: any;
}

export interface AgingReportItem {
  lead_id: number;
  customer_name: string;
  customerPhone: string;
  new_time: string;
  rfq_time: string | null;
  aging: string;
  website_gac_id?: number | null;
  website_name?: string | null;
  lead_name?: string | null;
  website_phone?: string | null;
  lead_phone?: string | null;
  website_city?: string | null;
  website_time?: string | null;
  lead_time?: string | null;
}

export interface AgingReportResponse {
  success: boolean;
  data: AgingReportItem[];
}

export interface AgingReportParams {
  year?: number;
  regionId?: string;
  zoneId?: string;
  cityId?: string;
  cityIds?: number[];
}

export interface PickupMonthSummary {
  total: number;
  activeDays: number;
  avg: number;
}

export interface MonthlyReportTwoParams {
  year?: number;
  cityIds?: number[];
  regionId?: string | number;
  zoneId?: string | number;
  cityId?: string | number;
}

// ✅ single definition (was duplicated before). Added `cityIds` so the
// return value of getMonthlyReportTwoApi actually matches its declared type.
export interface MonthlyReportTwoResponse {
  success: boolean;
  year: number | "all";
  rows: MonthlyReportTwoDayRecord[];
  pickupMonthSummary: Record<string, PickupMonthSummary>;
  cityIds: number[];
}
interface MonthlyEnquiryRaw {
  success: boolean;
  data: MonthlyEnquiryRecord[] | { year?: number; data: MonthlyEnquiryRecord[] };
}

// ─── Error Handler ───────────────────────────────────────────────────

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
    error.response?.data?.message || `Server error: ${error.response?.status}`,
  );
};

// ─── APIs ────────────────────────────────────────────────────────────

export const getMonthlyEnquiryApi = async (
  year: number,
  regionId?: string,
  zoneId?: string,
  cityId?: string,
): Promise<MonthlyEnquiryResponse> => {
  try {
    const response = await axiosInstance.get<MonthlyEnquiryRaw>("/reports/monthly-enquiry",
      {
        params: {
          year,
          ...(regionId && { regionId }),
          ...(zoneId && { zoneId }),
          ...(cityId && { cityId }),
        },
        timeout: 10000,
      },
    );
    const { success, data: payload } = response.data;
    


return {
  success,
  year: Array.isArray(payload) ? year : (payload.year ?? year),
  data: Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [],
};
  } catch (error) {
    throw handleAxiosError(error, "getMonthlyEnquiryApi");
  }
};

export const getLeadCountByDateApi = async (
  year: number,
): Promise<LeadCountByDateResponse> => {
  try {
    const { data: res } = await axiosInstance.get<LeadCountByDateResponse>(
      "/reports/lead-count-by-date",
      { params: { year }, timeout: 10000 },
    );

    return {
      success: res.success,
      year: res.year ?? year,
      totalLeads: res.totalLeads ?? 0,
      totalDays: res.totalDays ?? 0,
      avgLeadsPerDay: res.avgLeadsPerDay ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getLeadCountByDateApi");
  }
};

export const getLeadDistributionApi = async (
  params: LeadDistributionParams = {},
): Promise<LeadDistributionResponse> => {
  if (
    params.advisorId !== undefined &&
    params.advisorId !== null &&
    !params.advisorId
  )
    throw new Error("Advisor ID is invalid");

  try {
    const response = await axiosInstance.get<{
      data: LeadDistributionResponse;
    }>("/reports/adviser-report", {
      params: {
        ...(params.month !== undefined && { month: params.month }),
        ...(params.year !== undefined && { year: params.year }),
        ...(params.advisorId !== undefined &&
          params.advisorId !== null && { advisorId: params.advisorId }),
        ...(params.regionId && { regionId: params.regionId }),
        ...(params.zoneId && { zoneId: params.zoneId }),
        ...(params.cityId && { cityId: params.cityId }),
      },
      timeout: 15000,
    });

    const res = response?.data?.data;
    if (!res) throw new Error("Invalid response from server");

    const now = new Date();

    return {
      success: res.success,
      month: res.month ?? params.month ?? now.getMonth() + 1,
      year: res.year ?? params.year ?? now.getFullYear(),
      advisorId: params.advisorId != null ? Number(params.advisorId) : null,
      totalDaysInMonth: res.totalDaysInMonth ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
      teamTotal: res.teamTotal ?? {
        total_leads: 0,
        total_booked: 0,
        days: [],
      },
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to fetch lead distribution";

    throw new Error(errorMessage);
  }
};

export const getStatusWiseReportApi = async (
  params: StatusWiseReportParams = {},
): Promise<StatusWiseReportResponse> => {
  try {
    const response = await axiosInstance.get<{
      data: StatusWiseReportResponse;
    }>("/reports/status-wise-report", {
      params: {
        ...(params.month !== undefined && { month: params.month }),
        ...(params.year !== undefined && { year: params.year }),
        ...(params.regionId && { regionId: params.regionId }),
        ...(params.zoneId && { zoneId: params.zoneId }),
        ...(params.cityId && { cityId: params.cityId }),
      },
      timeout: 15000,
    });

    const res = response?.data?.data;

    if (!res) {
      throw new Error("Invalid response from server");
    }

    const now = new Date();

    return {
      success: res.success,
      month: res.month ?? params.month ?? now.getMonth() + 1,
      year: res.year ?? params.year ?? now.getFullYear(),

      data: Array.isArray(res.data) ? res.data : [],

      teamTotal: res.teamTotal ?? {
        blank: 0,
        kyc: 0,
        rfq: 0,
        lost: 0,
        book: 0,
        total: 0,
      },
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to fetch status wise report";

    throw new Error(errorMessage);
  }
};

export const getTimeEnquiryApi = async (
  year: number,
): Promise<TimeEnquiryResponse> => {
  try {
    const { data: res } = await axiosInstance.get<TimeEnquiryResponse>(
      "/reports/time-enquiry",
      { params: { year }, timeout: 10000 },
    );

    return {
      success: res.success,
      year: res.year ?? year,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getTimeEnquiryApi");
  }
};

export const getStatusWiseDateReportApi = async (
  params: {
    month?: number;
    year?: number;
    regionId?: string | number;
    zoneId?: string | number;
    cityId?: string | number;
  } = {},
) => {
  try {
    const response = await axiosInstance.get(
      "/reports/status-wise-date-report",
      {
        params,
      },
    );

    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch date wise report",
    );
  }
};

export const getLongWeekendReportApi = async (
  params: {
    year?: number;
    regionId?: string | number;
    zoneId?: string | number;
    cityId?: string | number;
  } = {},
) => {
  try {
    const response = await axiosInstance.get("/reports/longweekend", {
      params,
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch long weekend report",
    );
  }
};

// ✅ updated API function
export const getMonthlyReportTwoApi = async (
  params: MonthlyReportTwoParams,
): Promise<MonthlyReportTwoResponse> => {
  try {
    const response = await axiosInstance.get<{
      statusCode: number;
      success: boolean;
      message: string;
      data: {
        year: number | "all";
        data: {
          rows: MonthlyReportTwoDayRecord[];
          pickupMonthSummary: Record<string, PickupMonthSummary>;
        };
      };
    }>("/reports/monthlyreporttwo", {
      params: {
        year: params.year,
        cityIds: params.cityIds,
        regionId: params.regionId,
        zoneId: params.zoneId,
        cityId: params.cityId,
      },
      timeout: 10000,
    });

    const res = response.data;
    const payload = res.data;
    const innerData = payload.data;

    return {
      success: res.success,
      year: payload.year ?? params.year ?? "all",
      rows: Array.isArray(innerData?.rows) ? innerData.rows : [],
      pickupMonthSummary: innerData?.pickupMonthSummary ?? {},
      cityIds: Array.isArray(params.cityIds) ? params.cityIds : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getMonthlyReportTwoApi");
  }
};

export const getAgingReportApi = async (
  params: AgingReportParams = {},
): Promise<AgingReportResponse> => {
  try {
    const response = await axiosInstance.get<{
      statusCode: number;
      success: boolean;
      message: string;
      data: AgingReportItem[];
    }>("/reports/aging-report", {
      params: {
        ...(params.year && { year: params.year }),
        ...(params.regionId && { regionId: params.regionId }),
        ...(params.zoneId && { zoneId: params.zoneId }),
        ...(params.cityId && { cityId: params.cityId }),
        ...(params.cityIds &&
          params.cityIds.length > 0 && {
            cityIds: params.cityIds.join(","),
          }),
      },
      timeout: 15000,
    });

    const res = response.data;

    return {
      success: res.success ?? true,

      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getAgingReportApi");
  }
};

export const getWebsiteToLeadAgingReportApi = async (
  params: AgingReportParams = {},
): Promise<AgingReportResponse> => {
  try {
    const response = await axiosInstance.get<{
      statusCode: number;
      success: boolean;
      message: string;
      data: AgingReportItem[];
    }>("/reports/website-to-lead-aging-report", {
      params: {
        ...(params.year && { year: params.year }),
        ...(params.regionId && { regionId: params.regionId }),
        ...(params.zoneId && { zoneId: params.zoneId }),
        ...(params.cityId && { cityId: params.cityId }),
        ...(params.cityIds &&
          params.cityIds.length > 0 && {
            cityIds: params.cityIds.join(","),
          }),
      },
      timeout: 15000,
    });

    const res = response.data;

    return {
      success: res.success ?? true,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getWebsiteToLeadAgingReportApi");
  }
};
