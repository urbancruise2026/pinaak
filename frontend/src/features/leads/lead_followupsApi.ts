import axiosInstance from "@/lib/axioInstance";

export interface Followup {
  followup_date: string | null;
  remark: string | null;
}

interface TodayFollowupCountResponse {
  totalFollowups: number;
}

export const getAllLeadsApi = async () => {
  try {
    const res = await axiosInstance.get("/followup");

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching leads:",
      error?.response?.data || error?.message || error,
    );

    throw new Error(error?.response?.data?.message || "Failed to fetch leads");
  }
};

export const getFollowupsByLeadIdApi = async (
  leadId: number | string,
): Promise<Followup[]> => {
  try {
    const res = await axiosInstance.get(`/followup/${leadId}`);

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching followups:",
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
};

export interface TodayFollowup {
  followup_id: number;
  lead_id: number;
  followup_date: string;
  remark: string | null;
  customer_id: number;
  firstName: string | null;
  lastName: string | null;
  customerPhone: string | null;
  pickup_month_name? : string;
}

export const getTodayFollowupsApi = async (): Promise<TodayFollowup[]> => {
  try {
    const res = await axiosInstance.get(`/followup/today`);
    return res.data?.data?.followups || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching today's followups:",
      error?.response?.data || error?.message || error,
    );
    throw error;
  }
};
