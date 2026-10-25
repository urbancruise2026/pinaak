import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getLeadDistributionApi,
  getMonthlyEnquiryApi,
  LeadDistributionParams,
  MonthlyEnquiryRecord,
  AdviserDistributionRecord,
  getStatusWiseReportApi,
  TimeEnquiryRecord,
  TeamTotal,
  getTimeEnquiryApi,
  getStatusWiseDateReportApi,
  getLongWeekendReportApi,
  getMonthlyReportTwoApi,
  MonthlyReportTwoParams,
  MonthlyReportTwoDayRecord,
  PickupMonthSummary,
  getAgingReportApi,
  AgingReportParams,
  AgingReportItem,
  getWebsiteToLeadAgingReportApi,
} from "./monthlyReportApi";

interface MonthlyEnquiryState {
  data: MonthlyEnquiryRecord[];
  year: number | null;
  loading: boolean;
  error: string | null;

  distribution: {
    data: AdviserDistributionRecord[];
    teamTotal: TeamTotal | null;
    month: number | null;
    year: number | null;
    totalDaysInMonth: number;
    loading: boolean;
    error: string | null;
  };
  statusReport: {
    data: any[];
    teamTotal: any;
    month: number | null;
    year: number | null;
    loading: boolean;
    error: string | null;
  };
  timeEnquiry: {
    data: TimeEnquiryRecord[];
    year: number | null;
    loading: boolean;
    error: string | null;
  };
  statusDateReport: {
    data: any[];
    teamTotal: any;
    month: number | null;
    year: number | null;
    loading: boolean;
    error: string | null;
  };
  longWeekend: {
    data: any[];
    year: number | null;
    loading: boolean;
    error: string | null;
  };
  monthlyReportTwo: {
    data: {
      rows: MonthlyReportTwoDayRecord[]; // ✅ rows अलग
      pickupMonthSummary: Record<string, PickupMonthSummary>; // ✅ summary अलग
    };
    year: number | "all" | null;
    cityIds: number[];
    loading: boolean;
    error: string | null;
  };
  agingReport: {
    data: AgingReportItem[];
    loading: boolean;
    error: string | null;
  };
  websiteToLeadAgingReport: {
    data: AgingReportItem[];
    loading: boolean;
    error: string | null;
  };
}

const initialState: MonthlyEnquiryState = {
  data: [],
  year: null,
  loading: false,
  error: null,

  distribution: {
    data: [],
    teamTotal: null,
    month: null,
    year: null,
    totalDaysInMonth: 0,
    loading: false,
    error: null,
  },
  statusReport: {
    data: [],
    teamTotal: {},
    month: null,
    year: null,
    loading: false,
    error: null,
  },
  timeEnquiry: {
    data: [],
    year: null,
    loading: false,
    error: null,
  },
  statusDateReport: {
    data: [],
    teamTotal: {},
    month: null,
    year: null,
    loading: false,
    error: null,
  },
  longWeekend: {
    data: [],
    year: null,
    loading: false,
    error: null,
  },
  monthlyReportTwo: {
    data: {
      rows: [], // ✅
      pickupMonthSummary: {}, // ✅
    },
    year: null,
    cityIds: [],
    loading: false,
    error: null,
  },
  // ✅ नया
  agingReport: {
    data: [],
    loading: false,
    error: null,
  },

  websiteToLeadAgingReport: {
    data: [],
    loading: false,
    error: null,
  },
};

// ─── Thunks ──────────────────────────────────────────────────────────

export const fetchMonthlyEnquiry = createAsyncThunk(
  "report/fetchMonthlyEnquiry",
  async (
    params: {
      year: number;
      regionId?: string;
      zoneId?: string;
      cityId?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const { year, regionId, zoneId, cityId } = params;
      const result = await getMonthlyEnquiryApi(year, regionId, zoneId, cityId);
      return result;
    } catch (error: any) {
      return rejectWithValue(
        error?.message ?? "Failed to fetch monthly enquiry",
      );
    }
  },
);

export const fetchLeadDistribution = createAsyncThunk(
  "report/fetchLeadDistribution",
  async (params: LeadDistributionParams = {}, { rejectWithValue }) => {
    try {
      return await getLeadDistributionApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchStatusWiseReport = createAsyncThunk(
  "report/fetchStatusWiseReport",
  async (
    params: {
      month?: number;
      year?: number;
      regionId?: string;
      zoneId?: string;
      cityId?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      return await getStatusWiseReportApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTimeEnquiry = createAsyncThunk(
  "report/fetchTimeEnquiry",
  async (year: number, { rejectWithValue }) => {
    try {
      return await getTimeEnquiryApi(year);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchStatusWiseDateReport = createAsyncThunk(
  "report/fetchStatusWiseDateReport",
  async (
    params: {
      month?: number;
      year?: number;
      regionId?: string | number;
      zoneId?: string | number;
      cityId?: string | number;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      return await getStatusWiseDateReportApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchLongWeekendReport = createAsyncThunk(
  "report/fetchLongWeekendReport",
  async (
    params: {
      year?: number;
      regionId?: string | number;
      zoneId?: string | number;
      cityId?: string | number;
    },
    { rejectWithValue },
  ) => {
    try {
      return await getLongWeekendReportApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchMonthlyReportTwo = createAsyncThunk(
  "report/fetchMonthlyReportTwo",
  async (params: MonthlyReportTwoParams, { rejectWithValue }) => {
    try {
      return await getMonthlyReportTwoApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchAgingReport = createAsyncThunk(
  "report/fetchAgingReport",
  async (params: AgingReportParams = {}, { rejectWithValue }) => {
    try {
      return await getAgingReportApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchWebsiteToLeadAgingReport = createAsyncThunk(
  "report/fetchWebsiteToLeadAgingReport",

  async (params: AgingReportParams = {}, { rejectWithValue }) => {
    try {
      return await getWebsiteToLeadAgingReportApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────────

const monthlyReportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    resetMonthlyEnquiry: () => initialState,
    resetTimeEnquiry: (state) => {
      state.timeEnquiry = {
        data: [],
        year: null,
        loading: false,
        error: null,
      };
    },
    resetAllTimeEnquiry: (state) => {
      state.timeEnquiry.data = [];
      state.timeEnquiry.year = null;
      state.timeEnquiry.error = null;
    },
    resetMonthlyReportTwo: (state) => {
      state.monthlyReportTwo = {
        data: {
          rows: [], // ✅
          pickupMonthSummary: {}, // ✅
        },
        year: null,
        cityIds: [],
        loading: false,
        error: null,
      };
    },
    // ✅ नया reset reducer
    resetAgingReport: (state) => {
      state.agingReport = {
        data: [],
        loading: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Monthly
      .addCase(fetchMonthlyEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyEnquiry.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.year = action.payload.year;
      })
      .addCase(fetchMonthlyEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Distribution
      .addCase(fetchLeadDistribution.pending, (state) => {
        state.distribution.loading = true;
        state.distribution.error = null;
      })
      .addCase(fetchLeadDistribution.fulfilled, (state, action) => {
        state.distribution.loading = false;
        state.distribution.data = action.payload.data;
        state.distribution.teamTotal = action.payload.teamTotal;
        state.distribution.month = action.payload.month;
        state.distribution.year = action.payload.year;
        state.distribution.totalDaysInMonth = action.payload.totalDaysInMonth;
      })
      .addCase(fetchLeadDistribution.rejected, (state, action) => {
        state.distribution.loading = false;
        state.distribution.error = action.payload as string;
      })

      // Status Report
      .addCase(fetchStatusWiseReport.pending, (state) => {
        state.statusReport.loading = true;
        state.statusReport.error = null;
      })
      .addCase(fetchStatusWiseReport.fulfilled, (state, action) => {
        state.statusReport.loading = false;
        state.statusReport.data = action.payload.data;
        state.statusReport.teamTotal = action.payload.teamTotal;
        state.statusReport.month = action.payload.month;
        state.statusReport.year = action.payload.year;
      })
      .addCase(fetchStatusWiseReport.rejected, (state, action) => {
        state.statusReport.loading = false;
        state.statusReport.error = action.payload as string;
      })

      // Time Enquiry
      .addCase(fetchTimeEnquiry.pending, (state) => {
        state.timeEnquiry.loading = true;
        state.timeEnquiry.error = null;
      })
      .addCase(fetchTimeEnquiry.fulfilled, (state, action) => {
        state.timeEnquiry.loading = false;
        state.timeEnquiry.data = action.payload.data;
        state.timeEnquiry.year = action.payload.year ?? null;
      })
      .addCase(fetchTimeEnquiry.rejected, (state, action) => {
        state.timeEnquiry.loading = false;
        state.timeEnquiry.error = action.payload as string;
      })

      // Status Date Report
      .addCase(fetchStatusWiseDateReport.pending, (state) => {
        state.statusDateReport.loading = true;
        state.statusDateReport.error = null;
      })
      .addCase(fetchStatusWiseDateReport.fulfilled, (state, action) => {
        state.statusDateReport.loading = false;
        state.statusDateReport.data = action.payload.data;
        state.statusDateReport.teamTotal = action.payload.teamTotal;
        state.statusDateReport.month = action.payload.month;
        state.statusDateReport.year = action.payload.year;
      })
      .addCase(fetchStatusWiseDateReport.rejected, (state, action) => {
        state.statusDateReport.loading = false;
        state.statusDateReport.error = action.payload as string;
      })

      // Long Weekend Report
      .addCase(fetchLongWeekendReport.pending, (state) => {
        state.longWeekend.loading = true;
        state.longWeekend.error = null;
      })
      .addCase(fetchLongWeekendReport.fulfilled, (state, action) => {
        state.longWeekend.loading = false;
        state.longWeekend.data = action.payload.data;
        state.longWeekend.year = action.payload.year;
      })
      .addCase(fetchLongWeekendReport.rejected, (state, action) => {
        state.longWeekend.loading = false;
        state.longWeekend.error = action.payload as string;
      })

      .addCase(fetchAgingReport.pending, (state) => {
        state.agingReport.loading = true;
        state.agingReport.error = null;
      })
      .addCase(fetchAgingReport.fulfilled, (state, action) => {
        state.agingReport.loading = false;

        state.agingReport.data = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
      })
      .addCase(fetchAgingReport.rejected, (state, action) => {
        state.agingReport.loading = false;
        state.agingReport.error = action.payload as string;
      })

      .addCase(fetchWebsiteToLeadAgingReport.pending, (state) => {
        state.websiteToLeadAgingReport.loading = true;
        state.websiteToLeadAgingReport.error = null;
      })

      .addCase(fetchWebsiteToLeadAgingReport.fulfilled, (state, action) => {
        state.websiteToLeadAgingReport.loading = false;

        state.websiteToLeadAgingReport.data = Array.isArray(
          action.payload?.data,
        )
          ? action.payload.data
          : [];
      })

      .addCase(fetchWebsiteToLeadAgingReport.rejected, (state, action) => {
        state.websiteToLeadAgingReport.loading = false;

        state.websiteToLeadAgingReport.error =
          (action.payload as string) ||
          "Failed to fetch website to lead aging report";
      })

      // Monthly Report Two
      .addCase(fetchMonthlyReportTwo.pending, (state) => {
        state.monthlyReportTwo.loading = true;
        state.monthlyReportTwo.error = null;
      })
      .addCase(fetchMonthlyReportTwo.fulfilled, (state, action) => {
        state.monthlyReportTwo.loading = false;
        state.monthlyReportTwo.data = {
          rows: action.payload.rows, // ✅
          pickupMonthSummary: action.payload.pickupMonthSummary, // ✅
        };
        state.monthlyReportTwo.year = action.payload.year;
        state.monthlyReportTwo.cityIds = action.payload.cityIds ?? [];
      })
      .addCase(fetchMonthlyReportTwo.rejected, (state, action) => {
        state.monthlyReportTwo.loading = false;
        state.monthlyReportTwo.error = action.payload as string;
      });
  },
});

export const {
  resetMonthlyEnquiry,
  resetTimeEnquiry,
  resetAllTimeEnquiry,
  resetMonthlyReportTwo,
  resetAgingReport,
} = monthlyReportSlice.actions;

export default monthlyReportSlice.reducer;
