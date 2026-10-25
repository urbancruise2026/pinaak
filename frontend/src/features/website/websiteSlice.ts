import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

import {
  createTripBookingApi,
  createWebsiteGacApi,
  CreateWebsiteGacPayload,
  CreateTripBookingPayload,
  getWebsiteGacApi,
  getTripBookingsApi,
  TripBookingRecord,
  WebsiteGacRecord,
  markWebsiteGacReadApi,
  markTripBookingReadApi,
} from "./websiteApi";

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────

interface WebsiteGacState {
  data: WebsiteGacRecord[];
  tripBookings: TripBookingRecord[];

  count: number;
  tripBookingCount: number;

  loading: boolean;
  creating: boolean;

  createSuccess: boolean;
  tripBookingSuccess: boolean;

  error: string | null;

  booking: TripBookingRecord | null;

  selected: {
    data: WebsiteGacRecord | TripBookingRecord | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: WebsiteGacState = {
  data: [],
  tripBookings: [],

  count: 0,
  tripBookingCount: 0,

  loading: false,
  creating: false,

  createSuccess: false,
  tripBookingSuccess: false,

  error: null,

  booking: null,

  selected: {
    data: null,
    loading: false,
    error: null,
  },
};

// ─────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────

export const createWebsiteGacThunk = createAsyncThunk(
  "websiteGac/create",
  async (payload: CreateWebsiteGacPayload, { rejectWithValue }) => {
    try {
      return await createWebsiteGacApi(payload);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const getWebsiteGacThunk = createAsyncThunk(
  "websiteGac/getAll",
  async (city: string | undefined, { rejectWithValue }) => {
    try {
      return await getWebsiteGacApi(city);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// CREATE TRIP BOOKING
export const createTripBookingThunk = createAsyncThunk(
  "websiteGac/createTripBooking",
  async (payload: CreateTripBookingPayload, { rejectWithValue }) => {
    try {
      return await createTripBookingApi(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create trip booking");
    }
  },
);

// GET ALL TRIP BOOKINGS
export const getTripBookingsThunk = createAsyncThunk(
  "websiteGac/getTripBookings",
  async (city: string | undefined, { rejectWithValue }) => {
    try {
      return await getTripBookingsApi(city);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch trip bookings");
    }
  },
);

export const markWebsiteGacReadThunk = createAsyncThunk(
  "websiteGac/markRead",
  async (id: number, { rejectWithValue }) => {
    try {
      await markWebsiteGacReadApi(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const markTripBookingReadThunk = createAsyncThunk(
  "website/markTripBookingRead",
  async (id: number, { rejectWithValue }) => {
    try {
      await markTripBookingReadApi(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const websiteGacSlice = createSlice({
  name: "websiteGac",
  initialState,

  reducers: {
    resetWebsiteGac: () => initialState,

    clearSelected: (state) => {
      state.selected.data = null;
      state.selected.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ================= WEBSITE GAC CREATE =================
      .addCase(createWebsiteGacThunk.pending, (state) => {
        state.creating = true;
        state.createSuccess = false;
        state.error = null;
      })
      .addCase(createWebsiteGacThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.createSuccess = true;
        state.data.unshift(action.payload);
      })
      .addCase(createWebsiteGacThunk.rejected, (state, action) => {
        state.creating = false;
        state.createSuccess = false;
        state.error = action.payload as string;
      })

      // ================= GET WEBSITE GAC =================
      .addCase(getWebsiteGacThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWebsiteGacThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.count = action.payload.count;
      })
      .addCase(getWebsiteGacThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= CREATE TRIP BOOKING =================
      .addCase(createTripBookingThunk.pending, (state) => {
        state.creating = true;
        state.tripBookingSuccess = false;
        state.error = null;
      })
      .addCase(createTripBookingThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.tripBookingSuccess = true;
        state.booking = action.payload;
        state.tripBookings.unshift(action.payload);
      })
      .addCase(createTripBookingThunk.rejected, (state, action) => {
        state.creating = false;
        state.tripBookingSuccess = false;
        state.error = action.payload as string;
      })

      // ================= GET ALL TRIP BOOKINGS =================
      .addCase(getTripBookingsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTripBookingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tripBookings = action.payload.data;
        state.tripBookingCount = action.payload.count;
      })
      .addCase(getTripBookingsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= MARK WEBSITE GAC READ =================
      .addCase(markWebsiteGacReadThunk.fulfilled, (state, action) => {
        const lead = state.data.find((item) => item.id === action.payload);

        if (lead) {
          lead.is_read = 1;
        }
      })
      .addCase(markTripBookingReadThunk.fulfilled, (state, action) => {
        const item = state.tripBookings.find(
          (b: any) => b.id === action.payload,
        );

        if (item) item.is_read = 1;
      });
  },
});

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

export const { resetWebsiteGac, clearSelected } = websiteGacSlice.actions;

export default websiteGacSlice.reducer;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectGacList = (state: RootState) => state.websiteGac?.data ?? [];

export const selectTripBookings = (state: RootState) =>
  state.websiteGac?.tripBookings ?? [];

export const selectTripBookingCount = (state: RootState) =>
  state.websiteGac?.tripBookingCount ?? 0;

export const selectSelected = (state: RootState) =>
  state.websiteGac?.selected.data ?? null;

export const selectLoading = (state: RootState) =>
  state.websiteGac?.loading ?? false;

export const selectCreating = (state: RootState) =>
  state.websiteGac?.creating ?? false;

export const selectError = (state: RootState) =>
  state.websiteGac?.error ?? null;
