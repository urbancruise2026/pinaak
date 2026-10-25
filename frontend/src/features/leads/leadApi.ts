import axiosInstance from "@/lib/axioInstance";
import type { LeadRecord } from "@/types/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── CREATE LEAD ───────────────────────────────
export const createLeadApi = async (
  leadData: Partial<LeadRecord>,
): Promise<LeadRecord> => {
  try {
    const response = await axiosInstance.post<ApiResponse<LeadRecord>>(
      "/lead",
      leadData,
    );

    return response.data.data;
  } catch (error: any) {
    console.error("Create Lead Error:", error.response?.data || error.message);

    const apiError = error.response?.data;

    const errorMessage =
      apiError?.error ||
      apiError?.message ||
      apiError?.details ||
      error.message ||
      "Failed to create lead";

    throw new Error(errorMessage);
  }
};

// ─── GET LEADS (PAGINATED) ─────────────────────
export interface StatusCounts {
  NEW: number;
  RFQ: number;
  KYC: number;
  HOT: number;
  "VEH-N": number;
  LOST: number;
  BOOK: number;
}

export interface PaginatedLeadsResponse {
  leads: LeadRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  selectedMonth: number;
  selectedYear: number;
  selectedStatus?: string | null;
  statusCounts: StatusCounts;
  totalLeads: number;
}

export interface CheckCustomerResponse {
  isExisting: boolean;
  customer: any;
}

export const getLeadApi = async (
  page: number = 1,
  search: string = "",
  month?: number,
  year?: number,
  status?: string,
  pickupDateTime?: string,
  dropDateTime?: string,
  liveorexpiry?: string,
  ageFilter?: string,
): Promise<PaginatedLeadsResponse> => {
  try {
    const response = await axiosInstance.get("/lead", {
      params: {
        page,
        ...(search && { search }),
        ...(month && { month }),
        ...(year && { year }),
        ...(status && { status }),
        ...(pickupDateTime?.trim() && {
          pickupDateTime: pickupDateTime.trim(),
        }),
        ...(dropDateTime?.trim() && { dropDateTime: dropDateTime.trim() }),
        ...(liveorexpiry?.trim() && { liveorexpiry: liveorexpiry.trim() }),
        ...(ageFilter?.trim() && {
          ageFilter: ageFilter.trim(),
        }),
      },
    });
    const data: PaginatedLeadsResponse = response.data.data;

    return {
      leads: data.leads || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || 14,
      totalPages: data.totalPages || 1,
      selectedMonth: data.selectedMonth,
      selectedYear: data.selectedYear,
      selectedStatus: data.selectedStatus || null,
      statusCounts: data.statusCounts || {
        NEW: 0,
        RFQ: 0,
        KYC: 0,
        HOT: 0,
        "VEH-N": 0,
        LOST: 0,
        BOOK: 0,
      },
      totalLeads: data.totalLeads || 0,
    };
  } catch (error: any) {
    console.error("Get Leads Error:", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch leads";

    throw new Error(errorMessage);
  }
};

// ─── UPDATE LEAD ───────────────────────────────
export const updateLeadApi = async (
  id: string,
  leadData: Partial<LeadRecord>,
): Promise<LeadRecord> => {
  try {
    const response = await axiosInstance.put<ApiResponse<LeadRecord>>(
      `/lead/updatelead/${id}`,
      leadData,
    );

    return response.data.data;
  } catch (error: any) {
    console.error("Update Lead Error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message || error.message || "Failed to update lead",
    );
  }
};

export const checkCustomerPhoneApi = async (
  customerPhone: string,
): Promise<CheckCustomerResponse> => {
  try {
    const response = await axiosInstance.post<
      ApiResponse<CheckCustomerResponse>
    >("/lead/check-phone", { customerPhone });

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Check Customer Phone Error:",
      error.response?.data || error.message,
    );

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to check customer phone";

    throw new Error(errorMessage);
  }
};

// ─── MARK UNWANTED ─────────────────────────────
export const markUnwantedApi = async (
  id: number,
  data: {
    unwanted_status: "wanted" | "unwanted";
    reason?: string;
  },
) => {
  try {
    const response = await axiosInstance.patch(`/lead/unwanted/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("❌ API Error:", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to mark unwanted";

    throw new Error(errorMessage);
  }
};

// ─── GET ALL UNWANTED LEADS ────────────────────
export const getAllUnwantedLeadsApi = async (): Promise<LeadRecord[]> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<LeadRecord[]>>("/lead/unwanted/all");

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Get All Unwanted Leads Error:",
      error.response?.data || error.message,
    );

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch unwanted leads";

    throw new Error(errorMessage);
  }
};

// // ─── REMINDERS ───────────────────────────────
// export interface ReminderPayload {
//   lead_id: number;
//   reminder_datetime: string;
//   message: string;
// }

// export interface Reminder {
//   id: number;
//   lead_id: number;
//   reminder_datetime: string;
//   message: string;
// }

// export const createReminderApi = async (
//   payload: ReminderPayload,
// ): Promise<Reminder> => {
//   try {
//     const response = await axiosInstance.post<ApiResponse<Reminder>>(
//       "/lead/reminder",
//       payload,
//     );

//     return response.data.data;
//   } catch (error: any) {
//     console.error(
//       "Create Reminder Error:",
//       error.response?.data || error.message,
//     );

//     const errorMessage =
//       error.response?.data?.message ||
//       error.response?.data?.error ||
//       error.message ||
//       "Failed to create reminder";

//     throw new Error(errorMessage);
//   }
// };

// export interface AdvisorReminderStat {
//   advisorId: number;
//   advisorName: string;
//   totalReminders: number;
//   pendingReminders: number;
//   shownReminders: number;
// }

// export interface DueReminder {
//   id: number;
//   lead_id: number;
//   reminder_datetime: string;
//   message: string;

//   fullName: string;
//   customerPhone: string;
//   customerEmail: string;

//   pickupDateTime: string;
//   dropDateTime: string;

//   passengerTotal: number;
//   days: number;
// }

// export interface AdvisorReminderDetail {
//   id: number;
//   lead_id: number;
//   message: string;
//   reminder_datetime: string;
//   is_shown: number;
//   created_at: string;
//   fullName: string;
//   customerPhone: string;
//   customerEmail: string;
//   pickupDateTime: string;
//   dropDateTime: string;
//   status: string;
// }

// ─── FOLLOW-UPS ───────────────────────────────
export interface AdvisorFollowupStat {
  advisorId: number;
  advisorName: string;
  totalFollowups: number;
  pendingFollowups: number;
  upcomingFollowups: number;
}

export interface AdvisorFollowupDetail {
  id: string;
  lead_id: number;
  date: string;
  text: string;
  isPending: boolean;
  fullName: string;
  customerPhone: string;
  customerEmail: string;
  status: string;
  pickupDateTime: string;
  dropDateTime: string;
}

export const getAdvisorFollowupStatsApi = async (): Promise<
  AdvisorFollowupStat[]
> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<AdvisorFollowupStat[]>
    >("/lead/followups/advisor-stats");
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch advisor follow-up stats",
    );
  }
};

export const getAdvisorFollowupDetailsApi = async (
  advisorId: number,
): Promise<AdvisorFollowupDetail[]> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<AdvisorFollowupDetail[]>
    >(`/lead/followups/advisor-stats/${advisorId}/details`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch follow-up messages",
    );
  }
};
