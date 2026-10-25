import axiosInstance from "@/lib/axioInstance";
import type { LeadRecord } from "@/types/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
// 🔹 Types (agar already defined nahi hai to add karo)
export interface TravelAdvisor {
  id: number;
  fullName: string;
}

interface AssignResponse {
  success: boolean;
  leadId: number;
  travelAdvisorId: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MonthlyStats {
  month: string;
  monthName: string;
  year: number;
  leadCount: number;
}

export interface ZoneAdvisor {
  name: string;
  id: number;
}

export interface StatusCounts {
  NEW: number;
  RFQ: number;
  KYC: number;
  HOT: number;
  "VEH-N": number;
  LOST: number;
  BOOK: number;
}

export interface AssignedLeadsResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  selectedMonth: number;
  selectedYear: number;
  selectedStatus: string | null;
  statusCounts: StatusCounts;
  totalLeads: number;
  leads: LeadRecord[];
  monthlyStats: MonthlyStats[];
  zoneAdvisors: ZoneAdvisor[]; // ✅ fixed
}
export interface City {
  id: number;
  city_name: string;
}

export interface CityByZoneResponse {
  success: boolean;
  data: City[];
}

export interface SwapLeadsResponse {
  success: boolean;
  leadId: number;
  travelAdvisorId: number;
}
export interface SwapLeadsResponse extends AssignedLeadsResponse {}

export const getTravelAdvisorsByCityApi = async (
  cityId: number,
): Promise<TravelAdvisor[]> => {
  if (!cityId) {
    throw new Error("City ID is required");
  }
  console.log("advisor city id", cityId);
  try {
    const response = await axiosInstance.get(
      `/assign/travel-advisors/${cityId}`,
    );

    const data = response?.data?.data;

    // 🔥 fallback safety
    if (!Array.isArray(data)) return [];

    return data;
  } catch (error: any) {
    console.error(
      "Get Travel Advisors Error:",
      error?.response?.data || error.message,
    );

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to fetch travel advisors";

    throw new Error(errorMessage);
  }
};

// ✅ 2. Assign Travel Advisor to Lead
export const assignTravelAdvisorApi = async (
  leadId: number,
  travelAdvisorId: number,
): Promise<AssignResponse> => {
  if (!leadId) throw new Error("Lead ID is required");
  if (!travelAdvisorId) throw new Error("Travel Advisor ID is required");

  try {
    const response = await axiosInstance.patch<ApiResponse<AssignResponse>>(
      `/assign/assign-travel-advisor/${leadId}`, // ✅ leadId URL mein
      {
        travelAdvisorId,
      },
    );

    const data = response?.data?.data;
    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to assign travel advisor";

    throw new Error(errorMessage);
  }
};

export const getMyAssignedLeadsApi = async (
  page: number = 1,
  filters?: {
    cityIds?: number[];
    regionId?: number | null;
    zoneId?: number | null;
    search?: string;
    month?: number | null;
    year?: number | null;
    advisorId?: number | null;
    ageFilter?: string | null;
    daysFilter?: string | null;
    paxFilter?: string | null;
    liveorexpiry?: string | null; // ✅ ADD

    status?: string | null; // ✅ add kiya
  },
): Promise<AssignedLeadsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", String(page));

    if (filters?.cityIds && filters.cityIds.length > 0) {
      params.append("cityIds", filters.cityIds.join(","));
    }

    if (filters?.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    if (filters?.month != null) {
      params.append("month", String(filters.month));
    }

    if (filters?.year != null) {
      params.append("year", String(filters.year));
    }

    if (filters?.advisorId != null) {
      params.append("advisorId", String(filters.advisorId));
    }
    if (filters?.regionId != null) {
      params.append("regionId", String(filters.regionId));
    }

    if (filters?.zoneId != null) {
      params.append("zoneId", String(filters.zoneId));
    }

    if (filters?.status != null) {
      params.append("status", filters.status);
    }

    if (filters?.ageFilter != null) {
      params.append("ageFilter", filters.ageFilter);
    }
    if (filters?.daysFilter != null) {
      params.append("daysFilter", filters.daysFilter);
    }
    if (filters?.paxFilter != null) {
      params.append("paxFilter", filters.paxFilter);
    }

    if (filters?.liveorexpiry && filters.liveorexpiry !== "All") {
      params.append("liveorexpiry", filters.liveorexpiry); // ✅
    }

    const response = await axiosInstance.get(
      `/assign/myleads?${params.toString()}`,
    );

    const data: AssignedLeadsResponse = response?.data?.data;
    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

export const swapTravelAdvisorApi = async (
  leadId: number,
  travelAdvisorId: number,
): Promise<SwapLeadsResponse> => {
  if (!leadId) throw new Error("Lead ID is required");
  if (!travelAdvisorId) throw new Error("Travel Advisor ID is required");

  try {
    const response = await axiosInstance.patch<ApiResponse<SwapLeadsResponse>>(
      `/assign/swap-travel-advisor/${leadId}`, // ✅ leadId URL mein
      {
        travelAdvisorId, // ✅ sirf advisorId body mein
      },
    );

    const data = response?.data?.data;
    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to assign travel advisor";

    throw new Error(errorMessage);
  }
};

export const getMySwapLeadsApi = async (
  page: number = 1,
  filters?: {
    cityIds?: number[];
    regionId?: number | null;
    zoneId?: number | null;
    search?: string;
    month?: number | null;
    year?: number | null;
    advisorId?: number | null;
    status?: string | null;
    ageFilter?: string | null;
    daysFilter?: string | null;
    paxFilter?: string | null;
    liveorexpiry?: string | null;
  },
): Promise<SwapLeadsResponse> => {
  try {
    const params = new URLSearchParams();

    params.append("page", String(page));

    if (filters?.cityIds?.length) {
      params.append("cityIds", filters.cityIds.join(","));
    }
    if (filters?.regionId != null) {
      params.append("regionId", String(filters.regionId));
    }

    if (filters?.zoneId != null) {
      params.append("zoneId", String(filters.zoneId));
    }

    if (filters?.search?.trim()) {
      params.append("search", filters.search.trim());
    }

    if (filters?.month != null) {
      params.append("month", String(filters.month));
    }

    if (filters?.year != null) {
      params.append("year", String(filters.year));
    }

    if (filters?.advisorId != null) {
      params.append("advisorId", String(filters.advisorId));
    }

    if (filters?.status != null) {
      params.append("status", filters.status);
    }

    if (filters?.ageFilter != null) {
      params.append("ageFilter", filters.ageFilter);
    }

    if (filters?.daysFilter != null) {
      params.append("daysFilter", filters.daysFilter);
    }

    if (filters?.paxFilter != null) {
      params.append("paxFilter", filters.paxFilter);
    }

    if (filters?.liveorexpiry && filters.liveorexpiry !== "All") {
      params.append("liveorexpiry", filters.liveorexpiry);
    }

    const response = await axiosInstance.get(
      `/assign/swap-leads?${params.toString()}`,
    );

    const data: SwapLeadsResponse = response?.data?.data;

    if (!data) {
      throw new Error("Invalid response from server");
    }

    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

export const getMyLeadStatusCountApi = async () => {
  try {
    const response = await axiosInstance.get(`/assign/leads/status-count`);

    const data = response?.data?.data;
    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

export const getPresalesLeadStatusCountApi = async () => {
  try {
    const response = await axiosInstance.get(
      `/assign/leads/status-count-by-presales`,
    );

    const data = response?.data?.data;
    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};
export const getCityByZoneIdApi = async (zoneId: number): Promise<City[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<City[]>>(
      "/assign/cities-by-zone",
      { params: { zoneId }, timeout: 10000 },
    );
    const data = response.data?.data;
    if (!data) throw new Error("Invalid response from server");
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch cities"));
  }
};

export interface HighPaxLead {
  id: number;
  customerName: string | null;
  pax: number;
  status: string;
  created_at: string | null;
  pickupDateTime: string | null;
  dropDateTime: string | null;
  cityName: string | null;
  advisorFullName: string | null;
}

export interface HighPaxLeadsResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  paxThreshold: number;
  leads: HighPaxLead[];
  zoneAdvisors: ZoneAdvisor[];
}

export const getHighPaxLeadsApi = async (
  page: number = 1,
  filters?: {
    limit?: number; // ✅ add
    cityIds?: number[];
    advisorId?: number | null;
    paxThreshold?: number | null;
  },
): Promise<HighPaxLeadsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(filters?.limit ?? 10)); // ✅ add

    if (filters?.cityIds?.length) {
      params.append("cityIds", filters.cityIds.join(","));
    }
    if (filters?.advisorId != null) {
      params.append("advisorId", String(filters.advisorId));
    }
    if (filters?.paxThreshold != null) {
      params.append("paxThreshold", String(filters.paxThreshold));
    }

    const response = await axiosInstance.get(
      `/assign/maxpax?${params.toString()}`,
    );

    const data: HighPaxLeadsResponse = response?.data?.data;
    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch high pax leads",
    );
  }
};

export interface LongDurationLead {
  id?: number;
  customerName: string | null;
  days: number;
  status: string;
  pickupDateTime: string | null;
  dropDateTime: string | null;
  cityName: string | null;
  advisorFullName: string | null;
}

export interface LongDurationLeadsResponse {
  leads: LongDurationLead[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  daysThreshold: number;
  zoneAdvisors?: ZoneAdvisor[];
}

export const getLongDurationLeadsApi = async (
  page: number = 1,
  filters?: {
    limit?: number;
    cityIds?: number[];
    advisorId?: number | null;
    daysThreshold?: number | null;
  },
): Promise<LongDurationLeadsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", String(filters?.limit ?? 10));
    params.append("page", String(page));

    if (filters?.cityIds?.length) {
      params.append("cityIds", filters.cityIds.join(","));
    }
    if (filters?.advisorId != null) {
      params.append("advisorId", String(filters.advisorId));
    }
    if (filters?.daysThreshold != null) {
      params.append("daysThreshold", String(filters.daysThreshold));
    }

    const response = await axiosInstance.get(
      `/assign/long-duration?${params.toString()}`,
    );

    const data: LongDurationLeadsResponse = response?.data?.data;
    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch long duration leads",
    );
  }
};
