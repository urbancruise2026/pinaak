import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getAllLeadsApi,
  getFollowupsByLeadIdApi,
  getTodayFollowupsApi,
  Followup,
  TodayFollowup,
} from "./lead_followupsApi";

/* =========================================================
   LEAD TYPE
========================================================= */

export interface Lead {
  id: number;
  uuid: string;

  customer_id: number;
  fullName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;

  advisor_id: number;
  advisorFullName: string | null;

  source: string | null;
  status: string | null;
  serviceType: string | null;

  city_id: number;
  cityName: string | null;

  enquiryTime: string | null;
}

/* =========================================================
   STATE
========================================================= */

interface LeadState {
  leads: Lead[];

  loading: boolean;
  error: string | null;

  /* Followup modal */
  followups: Followup[];
  followupsLoading: boolean;
  followupsError: string | null;

  /* Today's followups (for notifications) */
  todayFollowups: TodayFollowup[];
  todayFollowupsLoading: boolean;
  todayFollowupsError: string | null;
}
const initialState: LeadState = {
  leads: [],

  loading: false,
  error: null,

  followups: [],
  followupsLoading: false,
  followupsError: null,

  todayFollowups: [],
  todayFollowupsLoading: false,
  todayFollowupsError: null,
};
export const getAllLeads = createAsyncThunk<
  Lead[],
  void,
  { rejectValue: string }
>("leadFollowups/getAllLeads", async (_, { rejectWithValue }) => {
  try {
    const data = await getAllLeadsApi();

    return data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch leads");
  }
});

export const getFollowupsByLeadId = createAsyncThunk<
  Followup[],
  number,
  { rejectValue: string }
>("leadFollowups/getFollowupsByLeadId", async (leadId, { rejectWithValue }) => {
  try {
    const response = await getFollowupsByLeadIdApi(leadId);

    return Array.isArray(response) ? response : [];
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 404) {
      return [];
    }

    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch followups",
    );
  }
});

export const getTodayFollowups = createAsyncThunk<
  TodayFollowup[],
  void,
  { rejectValue: string }
>("leadFollowups/getTodayFollowups", async (_, { rejectWithValue }) => {
  try {
    const response = await getTodayFollowupsApi();

    return Array.isArray(response) ? response : [];
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 404) {
      return [];
    }

    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch today's followups",
    );
  }
});

const leadFollowupsSlice = createSlice({
  name: "leadFollowups",

  initialState,

  reducers: {
    clearFollowups: (state) => {
      state.followups = [];
      state.followupsError = null;
      state.followupsLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAllLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload || [];
      })

      .addCase(getAllLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch leads";

        state.leads = [];
      });
    builder
      .addCase(getFollowupsByLeadId.pending, (state) => {
        state.followupsLoading = true;
        state.followupsError = null;

        // IMPORTANT
        state.followups = [];
      })

      .addCase(getFollowupsByLeadId.fulfilled, (state, action) => {
        state.followupsLoading = false;

        // IMPORTANT
        state.followups = action.payload || [];
      })

      .addCase(getFollowupsByLeadId.rejected, (state, action) => {
        state.followupsLoading = false;

        state.followupsError = action.payload || "Failed to fetch followups";

        // IMPORTANT
        state.followups = [];
      });
    builder
      .addCase(getTodayFollowups.pending, (state) => {
        state.todayFollowupsLoading = true;
        state.todayFollowupsError = null;
      })

      .addCase(getTodayFollowups.fulfilled, (state, action) => {
        state.todayFollowupsLoading = false;
        state.todayFollowups = action.payload || [];
      })

      .addCase(getTodayFollowups.rejected, (state, action) => {
        state.todayFollowupsLoading = false;

        state.todayFollowupsError =
          action.payload || "Failed to fetch today's followups";

        state.todayFollowups = [];
      });
  },
});

export const { clearFollowups } = leadFollowupsSlice.actions;

export default leadFollowupsSlice.reducer;
