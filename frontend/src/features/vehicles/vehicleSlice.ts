import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Vehicle } from "@/types/types";

import {
  getVehiclesApi,
  createvehiclesApi,
  getAllVehiclesApi,
  PaginatedVehicles,
  getSeatOptionsApi,
  getVehicleByIdApi,
} from "./vehicleApi";

interface VehicleState {
  vehicleCodes: Vehicle[];

  loading: boolean;
  error: string | null;

  creating: boolean;
  createError: string | null;

  total: number;
  page: number;
  limit: number;
  totalPages: number;

  // =====================================================
  // SINGLE VEHICLE
  // =====================================================
  vehicle: Vehicle | null;
  vehicleLoading: boolean;
  vehicleError: string | null;

  // =====================================================
  // SEAT OPTIONS
  // =====================================================
  seatOptions: string[];
  seatOptionsLoading: boolean;
  seatOptionsError: string | null;
}

const initialState: VehicleState = {
  vehicleCodes: [],

  loading: false,
  error: null,

  creating: false,
  createError: null,

  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,

  // SINGLE VEHICLE
  vehicle: null,
  vehicleLoading: false,
  vehicleError: null,

  // SEAT OPTIONS
  seatOptions: [],
  seatOptionsLoading: false,
  seatOptionsError: null,
};

// =====================================================
// FETCH ALL VEHICLE CODES
// =====================================================

export const fetchVehicles = createAsyncThunk<
  Vehicle[],
  void,
  { rejectValue: string }
>("vehicle/fetchVehicles", async (_, { rejectWithValue }) => {
  try {
    return await getVehiclesApi();
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch vehicles");
  }
});

// =====================================================
// CREATE VEHICLE
// =====================================================

export const createVehicle = createAsyncThunk<
  Vehicle,
  Vehicle,
  { rejectValue: string }
>("vehicle/createVehicle", async (vehicleData, { rejectWithValue }) => {
  try {
    return await createvehiclesApi(vehicleData);
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to create vehicle");
  }
});

// =====================================================
// FETCH PAGINATED VEHICLES
// =====================================================

export const vehicleslice = createAsyncThunk<
  PaginatedVehicles,
  | {
      search?: string;
      category?: string;
      make?: string;
      seat?: string;
      variant?: string;
      page?: number;
      limit?: number;
    }
  | undefined,
  { rejectValue: string }
>("vehicle/vehicleslice", async (params, { rejectWithValue }) => {
  try {
    const data = await getAllVehiclesApi(params);

    return data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch vehicles");
  }
});

// =====================================================
// FETCH SEAT OPTIONS
// =====================================================

export const fetchSeatOptions = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>("vehicle/fetchSeatOptions", async (_, { rejectWithValue }) => {
  try {
    return await getSeatOptionsApi();
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch seat options");
  }
});

// =====================================================
// GET VEHICLE BY ID
// =====================================================

export const getVehicleById = createAsyncThunk<
  Vehicle,
  string,
  { rejectValue: string }
>("vehicle/getVehicleById", async (id, { rejectWithValue }) => {
  try {
    if (!id) {
      return rejectWithValue("Vehicle ID is required");
    }

    const vehicle = await getVehicleByIdApi(id);

    return vehicle;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch vehicle");
  }
});

// =====================================================
// VEHICLE SLICE
// =====================================================

const vehicleSlice = createSlice({
  name: "vehicle",

  initialState,

  reducers: {
    // ===================================================
    // CLEAR SINGLE VEHICLE
    // ===================================================

    clearVehicle: (state) => {
      state.vehicle = null;
      state.vehicleLoading = false;
      state.vehicleError = null;
    },

    // ===================================================
    // CLEAR VEHICLE ERROR
    // ===================================================

    clearVehicleError: (state) => {
      state.vehicleError = null;
    },
  },

  extraReducers: (builder) => {
    // ===================================================
    // FETCH VEHICLES
    // ===================================================

    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleCodes = action.payload;
      })

      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch vehicles";
      });

    // ===================================================
    // CREATE VEHICLE
    // ===================================================

    builder
      .addCase(createVehicle.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })

      .addCase(createVehicle.fulfilled, (state, action) => {
        state.creating = false;

        state.vehicleCodes.unshift(action.payload);
      })

      .addCase(createVehicle.rejected, (state, action) => {
        state.creating = false;

        state.createError = action.payload || "Failed to create vehicle";
      });

    // ===================================================
    // PAGINATED VEHICLES
    // ===================================================

    builder
      .addCase(vehicleslice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(vehicleslice.fulfilled, (state, action) => {
        state.loading = false;

        state.vehicleCodes = action.payload.data;

        state.total = action.payload.total;

        state.page = action.payload.page;

        state.limit = action.payload.limit;

        state.totalPages = action.payload.totalPages;
      })

      .addCase(vehicleslice.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch vehicles";
      });

    // ===================================================
    // SEAT OPTIONS
    // ===================================================

    builder
      .addCase(fetchSeatOptions.pending, (state) => {
        state.seatOptionsLoading = true;
        state.seatOptionsError = null;
      })

      .addCase(fetchSeatOptions.fulfilled, (state, action) => {
        state.seatOptionsLoading = false;

        state.seatOptions = action.payload;
      })

      .addCase(fetchSeatOptions.rejected, (state, action) => {
        state.seatOptionsLoading = false;

        state.seatOptionsError =
          action.payload || "Failed to fetch seat options";
      });

    // ===================================================
    // GET VEHICLE BY ID
    // ===================================================

    builder
      .addCase(getVehicleById.pending, (state) => {
        state.vehicleLoading = true;

        state.vehicleError = null;

        // Purana vehicle hata do jab naya vehicle load ho raha ho
        state.vehicle = null;
      })

      .addCase(getVehicleById.fulfilled, (state, action) => {
        state.vehicleLoading = false;

        state.vehicle = action.payload;

        state.vehicleError = null;
      })

      .addCase(getVehicleById.rejected, (state, action) => {
        state.vehicleLoading = false;

        state.vehicle = null;

        state.vehicleError = action.payload || "Failed to fetch vehicle";
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const { clearVehicle, clearVehicleError } = vehicleSlice.actions;

// =====================================================
// REDUCER
// =====================================================

export default vehicleSlice.reducer;
