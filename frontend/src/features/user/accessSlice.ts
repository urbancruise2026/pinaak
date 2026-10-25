import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  AssignedLeadsResponse,
  assignTravelAdvisorApi,
  getMyAssignedLeadsApi,
  getMyLeadStatusCountApi,
  getPresalesLeadStatusCountApi,
  getTravelAdvisorsByCityApi,
  swapTravelAdvisorApi,
  getMySwapLeadsApi,
  ZoneAdvisor,
  getCityByZoneIdApi,
  HighPaxLead,
  getHighPaxLeadsApi,
  getLongDurationLeadsApi,
  HighPaxLeadsResponse,
  LongDurationLeadsResponse,
  LongDurationLead
} from "./accessApi";

import type { LeadRecord } from "@/types/types";

interface HighPaxLeadsState {
  leads: HighPaxLead[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  paxThreshold: number;
  zonesAdvisors: ZoneAdvisor[];
}

interface LongDurationLeadsState {
  leads: LongDurationLead[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  daysThreshold: number;
  zonesAdvisors: ZoneAdvisor[];
}

export interface TravelAdvisor {
  id: number;
  fullName: string;
}

export interface StatusCounts {
  NEW: number;
  KYC: number;
  RFQ: number;
  HOT: number;
  "VEH-N": number;
  LOST: number;
  BOOK: number;
}

interface AssignedLeadsState {
  leads: LeadRecord[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  selectedMonth: number;
  selectedYear: number;
  selectedStatus: string | null;

  statusCounts: StatusCounts;
  totalLeads: number;

  monthlyStats: {
    month: string;
    monthName: string;
    year: number;
    leadCount: number;
  }[];

  zonesAdvisors: ZoneAdvisor[];
}

interface LeadStatusState {
  totalLeads: number;
  statusCount: StatusCounts;
  loading: boolean;
  error: string | null;
}

interface TravelAdvisorState {
  advisors: TravelAdvisor[];
  loading: boolean;
  error: string | null;
  assignLoading: boolean;
  assignSuccess: boolean;
  assignedLeads: AssignedLeadsState;
  swapLeads: AssignedLeadsState;
  leadStatus: LeadStatusState;
  highPaxLeads: HighPaxLeadsState;
  longDurationLeads: LongDurationLeadsState;
  citiesByZone: {
    cities: CityOption[];
    loading: boolean;
    error: string | null;
  };
}

export interface SwapLeadsResponse {
  success: boolean;
  leadId: number;
  travelAdvisorId: number;
}
interface CityOption {
  id: number;
  city_name: string;
}


interface FetchMyAssignedLeadsArgs {
  page?: number;
  cityIds?: number[];
  search?: string;
  month?: number | null;
  year?: number | null;
  status?: string | null;
  advisorId?: number | null;
  regionId?: number | null;
  zoneId?: number | null;
  ageFilter?: string[] | null; // ✅ ADD
  daysFilter?: string[] | null;
  paxFilter?: string[] | null;
  liveorexpiry?: string | null; // ✅ ADD
}

const initialState: TravelAdvisorState = {
  advisors: [],
  loading: false,
  error: null,

  assignLoading: false,
  assignSuccess: false,

  assignedLeads: {
    leads: [],
    loading: false,
    error: null,
    page: 1,
    total: 0,
    totalPages: 1,
    hasNextPage: false,

    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
    selectedStatus: null,

    statusCounts: {
      NEW: 0,
      KYC: 0,
      RFQ: 0,
      HOT: 0,
      "VEH-N": 0,
      LOST: 0,
      BOOK: 0,
    },

    totalLeads: 0,
    monthlyStats: [],
    zonesAdvisors: [],
  },
  highPaxLeads: {
    leads: [],
    loading: false,
    error: null,
    page: 1,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    paxThreshold: 6,
    zonesAdvisors: [],
  },
  longDurationLeads: {
    leads: [],
    loading: false,
    error: null,
    page: 1,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    daysThreshold: 90,
    zonesAdvisors: [],
  },
  swapLeads: {
    leads: [],
    loading: false,
    error: null,
    page: 1,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
    selectedStatus: null,
    statusCounts: {
      NEW: 0,
      KYC: 0,
      RFQ: 0,
      HOT: 0,
      "VEH-N": 0,
      LOST: 0,
      BOOK: 0,
    },
    totalLeads: 0,
    monthlyStats: [],
    zonesAdvisors: [],
  },

  leadStatus: {
    totalLeads: 0,
    statusCount: {
      NEW: 0,
      KYC: 0,
      RFQ: 0,
      HOT: 0,
      "VEH-N": 0,
      LOST: 0,
      BOOK: 0,
    },
    loading: false,
    error: null,
  },

  citiesByZone: {
    cities: [],
    loading: false,
    error: null,
  },
};

export const fetchTravelAdvisors = createAsyncThunk<
  TravelAdvisor[],
  number,
  { rejectValue: string }
>("travelAdvisor/fetchByCity", async (cityId, { rejectWithValue }) => {
  try {
    return await getTravelAdvisorsByCityApi(cityId);
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch advisors");
  }
});

export const assignTravelAdvisor = createAsyncThunk<
  { success: boolean; leadId: number; travelAdvisorId: number },
  { leadId: number; travelAdvisorId: number },
  { rejectValue: string }
>(
  "travelAdvisor/assign",
  async ({ leadId, travelAdvisorId }, { rejectWithValue }) => {
    try {
      return await assignTravelAdvisorApi(leadId, travelAdvisorId);
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to assign advisor");
    }
  },
);

export const swapTravelAdvisor = createAsyncThunk<
  SwapLeadsResponse,
  {
    leadId: number;
    travelAdvisorId: number;
  },
  { rejectValue: string }
>(
  "travelAdvisor/swap",
  async ({ leadId, travelAdvisorId }, { rejectWithValue }) => {
    try {
      const response = await swapTravelAdvisorApi(leadId, travelAdvisorId);

      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to swap advisor");
    }
  },
);

export const fetchMyAssignedLeads = createAsyncThunk<
  AssignedLeadsResponse,
  FetchMyAssignedLeadsArgs,
  { rejectValue: string }
>(
  "access/fetchMyAssignedLeads",
  async (
    {
      page = 1,
      cityIds,
      zoneId,
      regionId,
      search,
      month,
      year,
      advisorId,
      status,
      ageFilter,
      daysFilter,
      paxFilter,
      liveorexpiry, // ✅ ADD
    },
    { rejectWithValue },
  ) => {
    try {
      return await getMyAssignedLeadsApi(page, {
        cityIds,
        zoneId,
        regionId,
        search,
        month,
        year,
        advisorId,
        status,
        ageFilter: ageFilter?.join(","),
        daysFilter: daysFilter?.join(","),
        paxFilter: paxFilter?.join(","),
        liveorexpiry,
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch assigned leads",
      );
    }
  },
);

export const fetchMySwapLeads = createAsyncThunk<
  AssignedLeadsResponse,
  FetchMyAssignedLeadsArgs,
  { rejectValue: string }
>(
  "access/fetchMySwapLeads",
  async (
    {
      page = 1,
      cityIds,
      zoneId,
      search,
      month,
      year,
      advisorId,
      status,
      ageFilter,
      daysFilter,
      paxFilter,
      liveorexpiry,
    },
    { rejectWithValue },
  ) => {
    try {
      return await getMySwapLeadsApi(page, {
        cityIds,
        zoneId,
        search,
        month,
        year,
        advisorId,
        status,
        ageFilter: ageFilter?.join(","),
        daysFilter: daysFilter?.join(","),
        paxFilter: paxFilter?.join(","),
        liveorexpiry,
      });
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch swap leads");
    }
  },
);

export const fetchMyLeadStatusCount = createAsyncThunk<
  { totalLeads: number; statusCount: StatusCounts },
  void,
  { rejectValue: string }
>("travelAdvisor/fetchMyLeadStatusCount", async (_, { rejectWithValue }) => {
  try {
    return await getMyLeadStatusCountApi();
  } catch (error: any) {
    return rejectWithValue(error?.message);
  }
});

//
// 🔹 Presales Lead Status Count
//
export const fetchPresalesLeadStatusCount = createAsyncThunk<
  { totalLeads: number; statusCount: StatusCounts },
  void,
  { rejectValue: string }
>(
  "travelAdvisor/fetchPresalesLeadStatusCount",
  async (_, { rejectWithValue }) => {
    try {
      return await getPresalesLeadStatusCountApi();
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);
export const fetchHighPaxLeads = createAsyncThunk<
  HighPaxLeadsResponse,
  {
    page?: number;
    cityIds?: number[];
    limit? : number;
    advisorId?: number | null;
    paxThreshold?: number | null;
  },
  { rejectValue: string }
>(
  "access/fetchHighPaxLeads",
  async (
   { page = 1, limit, cityIds, advisorId, paxThreshold },
    { rejectWithValue },
  ) => {
    try {
      return await getHighPaxLeadsApi(page, {
        cityIds,
        advisorId,
        paxThreshold,
        limit
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch high pax leads",
      );
    }
  },
);

export const fetchLongDurationLeads = createAsyncThunk<
  LongDurationLeadsResponse,
  {
    page?: number;
    cityIds?: number[];
    advisorId?: number | null;
    daysThreshold?: number | null;
  },
  { rejectValue: string }
>(
  "access/fetchLongDurationLeads",
  async (
    { page = 1, cityIds, advisorId, daysThreshold },
    { rejectWithValue },
  ) => {
    try {
      return await getLongDurationLeadsApi(page, {
        cityIds,
        advisorId,
        daysThreshold,
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch long duration leads",
      );
    }
  },
);

export const fetchCitiesByZone = createAsyncThunk<
  CityOption[],
  number,
  { rejectValue: string }
>("travelAdvisor/fetchCitiesByZone", async (zoneId, { rejectWithValue }) => {
  try {
    return await getCityByZoneIdApi(zoneId);
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch cities");
  }
});

const travelAdvisorSlice = createSlice({
  name: "travelAdvisor",
  initialState,

  reducers: {
    resetAssignState: (state) => {
      state.assignSuccess = false;
    },

    setAssignedStatus: (state, action) => {
      state.assignedLeads.selectedStatus = action.payload;
      state.assignedLeads.page = 1;
    },

    addRealtimeAssignedLead(state, action) {
      const newLead = action.payload;

      if (!newLead?.id) return;

      const exists = state.assignedLeads.leads.some(
        (lead) => String(lead.id) === String(newLead.id),
      );

      if (!exists) {
        state.assignedLeads.leads.unshift(newLead);
        state.assignedLeads.total += 1;
      }
    },

    updateRealtimeAssignedLead(state, action) {
      const updatedLead = action.payload;

      const index = state.assignedLeads.leads.findIndex(
        (lead) => String(lead.id) === String(updatedLead.id),
      );

      if (index !== -1) {
        state.assignedLeads.leads[index] = updatedLead;
      }
    },
  },

  extraReducers: (builder) => {
    builder

      //
      // Fetch Advisors
      //
      .addCase(fetchTravelAdvisors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTravelAdvisors.fulfilled, (state, action) => {
        state.loading = false;
        state.advisors = action.payload;
      })

      .addCase(fetchTravelAdvisors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch advisors";
      })

      //
      // Assign Advisor
      //
      .addCase(assignTravelAdvisor.pending, (state) => {
        state.assignLoading = true;
        state.assignSuccess = false;
      })

      .addCase(assignTravelAdvisor.fulfilled, (state) => {
        state.assignLoading = false;
        state.assignSuccess = true;
      })

      .addCase(assignTravelAdvisor.rejected, (state, action) => {
        state.assignLoading = false;
        state.error = action.payload || "Failed to assign advisor";
      })

      //
      // Swap Advisor
      //
      .addCase(swapTravelAdvisor.pending, (state) => {
        state.assignLoading = true;
        state.assignSuccess = false;
      })

      .addCase(swapTravelAdvisor.fulfilled, (state, action) => {
  state.assignLoading = false;
  state.assignSuccess = true;

  const { leadId } = action.payload;
  for (const key of ["assignedLeads", "swapLeads"] as const) {
    const list = state[key];
    const before = list.leads.length;
    list.leads = list.leads.filter((l) => String(l.id) !== String(leadId));
    if (list.leads.length < before) list.total = Math.max(0, list.total - 1);
  }
})

      .addCase(swapTravelAdvisor.rejected, (state, action) => {
        state.assignLoading = false;
        state.error = action.payload || "Failed to swap advisor";
      })

      //
      // Assigned Leads
      //
      .addCase(fetchMyAssignedLeads.pending, (state) => {
        state.assignedLeads.loading = true;
        state.assignedLeads.error = null;
      })

      .addCase(fetchMyAssignedLeads.fulfilled, (state, action) => {
        const p = action.payload;

        state.assignedLeads.loading = false;
        state.assignedLeads.leads = p.leads;

        state.assignedLeads.page = p.page;
        state.assignedLeads.total = p.total;
        state.assignedLeads.totalPages = p.totalPages;

        state.assignedLeads.hasNextPage = p.hasNextPage;

        state.assignedLeads.selectedMonth = p.selectedMonth;

        state.assignedLeads.selectedYear = p.selectedYear;

        state.assignedLeads.selectedStatus = p.selectedStatus ?? null;

        state.assignedLeads.statusCounts = p.statusCounts;

        state.assignedLeads.totalLeads = p.totalLeads;

        state.assignedLeads.monthlyStats = p.monthlyStats ?? [];

        state.assignedLeads.zonesAdvisors = p.zoneAdvisors ?? [];
      })

      .addCase(fetchMyAssignedLeads.rejected, (state, action) => {
        state.assignedLeads.loading = false;

        state.assignedLeads.error =
          action.payload || "Failed to fetch assigned leads";
      })
      //
      // Cities by Zone
      //
      .addCase(fetchCitiesByZone.pending, (state) => {
        state.citiesByZone.loading = true;
        state.citiesByZone.error = null;
      })

      .addCase(fetchCitiesByZone.fulfilled, (state, action) => {
        state.citiesByZone.loading = false;
        state.citiesByZone.cities = action.payload;
      })

      .addCase(fetchCitiesByZone.rejected, (state, action) => {
        state.citiesByZone.loading = false;
        state.citiesByZone.error = action.payload || "Failed to fetch cities";
      })

      .addCase(fetchMySwapLeads.pending, (state) => {
        state.swapLeads.loading = true; // ✅ assignedLeads → swapLeads
        state.swapLeads.error = null;
      })

      .addCase(fetchMySwapLeads.fulfilled, (state, action) => {
        const p = action.payload;
        state.swapLeads.loading = false; // ✅ assignedLeads → swapLeads
        state.swapLeads.leads = p.leads;
        state.swapLeads.page = p.page;
        state.swapLeads.total = p.total;
        state.swapLeads.totalPages = p.totalPages;
        state.swapLeads.hasNextPage = p.hasNextPage;
        state.swapLeads.statusCounts = p.statusCounts;
        state.swapLeads.totalLeads = p.totalLeads;
        state.swapLeads.monthlyStats = p.monthlyStats ?? [];
        state.swapLeads.zonesAdvisors = p.zoneAdvisors ?? [];
      })

      .addCase(fetchMySwapLeads.rejected, (state, action) => {
        state.swapLeads.loading = false; // ✅ assignedLeads → swapLeads
        state.swapLeads.error = action.payload || "Failed to fetch swap leads";
      })
      .addCase(fetchHighPaxLeads.pending, (state) => {
        state.highPaxLeads.loading = true;
        state.highPaxLeads.error = null;
      })

      .addCase(fetchHighPaxLeads.fulfilled, (state, action) => {
        const p = action.payload;
        state.highPaxLeads.loading = false;
        state.highPaxLeads.leads = p.leads ?? [];
        state.highPaxLeads.page = p.page;
        state.highPaxLeads.total = p.total;
        state.highPaxLeads.totalPages = p.totalPages;
        state.highPaxLeads.hasNextPage = p.hasNextPage;
        state.highPaxLeads.paxThreshold = p.paxThreshold ?? 6;
        state.highPaxLeads.zonesAdvisors = p.zoneAdvisors ?? [];
      })

      .addCase(fetchHighPaxLeads.rejected, (state, action) => {
        state.highPaxLeads.loading = false;
        state.highPaxLeads.error =
          action.payload || "Failed to fetch high pax leads";
      })
      
       .addCase(fetchLongDurationLeads.pending, (state) => {
        state.longDurationLeads.loading = true;
        state.longDurationLeads.error = null;
      })
      .addCase(fetchLongDurationLeads.fulfilled, (state, action) => {
        const p = action.payload;
        state.longDurationLeads.loading = false;
        state.longDurationLeads.leads = p.leads ?? [];
        state.longDurationLeads.page = p.page;
        state.longDurationLeads.total = p.total;
        state.longDurationLeads.totalPages = p.totalPages;
        state.longDurationLeads.hasNextPage = p.hasNextPage;
        state.longDurationLeads.daysThreshold = p.daysThreshold ?? 90;
        state.longDurationLeads.zonesAdvisors = p.zoneAdvisors ?? [];
      })
      .addCase(fetchLongDurationLeads.rejected, (state, action) => {
        state.longDurationLeads.loading = false;
        state.longDurationLeads.error =
          action.payload || "Failed to fetch long duration leads";
      })
      ;
  },
});

export const {
  resetAssignState,
  setAssignedStatus,
  addRealtimeAssignedLead,
  updateRealtimeAssignedLead,
} = travelAdvisorSlice.actions;

export default travelAdvisorSlice.reducer;
