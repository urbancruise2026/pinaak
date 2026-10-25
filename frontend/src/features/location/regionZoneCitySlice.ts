import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  getAllRegionsApi,
  getZonesByRegionApi,
  getCitiesByZoneApi,
} from "./regionZoneCityApi";

// =========================
// Types
// =========================

export interface Region {
  id: number;
  region_name: string;
}

export interface Zone {
  id: number;
  zone_name: string;
  region_id: number;
}

export interface City {
  id: number;
  city_name: string;
  zone_id: number;
}

interface LocationState {
  regions: Region[];
  zones: Zone[];
  cities: City[];

  selectedRegionId: number | null;
  selectedZoneId: number | null;
  selectedCityId: number | null;

  loadingRegions: boolean;
  loadingZones: boolean;
  loadingCities: boolean;

  error: string | null;
}

const initialState: LocationState = {
  regions: [],
  zones: [],
  cities: [],

  selectedRegionId: null,
  selectedZoneId: null,
  selectedCityId: null,

  loadingRegions: false,
  loadingZones: false,
  loadingCities: false,

  error: null,
};

// =========================
// Fetch Regions
// =========================

export const fetchRegions = createAsyncThunk(
  "location/fetchRegions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllRegionsApi();

      if (!response.success) {
        return rejectWithValue("Failed to fetch regions");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch regions"
      );
    }
  }
);

// =========================
// Fetch Zones By Region
// =========================

export const fetchZones = createAsyncThunk(
  "location/fetchZones",
  async (regionId: number, { rejectWithValue }) => {
    try {
      const response = await getZonesByRegionApi(regionId);

      if (!response.success) {
        return rejectWithValue("Failed to fetch zones");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch zones"
      );
    }
  }
);

// =========================
// Fetch Cities By Zone
// =========================

export const fetchCities = createAsyncThunk(
  "location/fetchCities",
  async (zoneId: number, { rejectWithValue }) => {
    try {
      const response = await getCitiesByZoneApi(zoneId);

      if (!response.success) {
        return rejectWithValue("Failed to fetch cities");
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch cities"
      );
    }
  }
);

// =========================
// Slice
// =========================

const locationSlice = createSlice({
  name: "location",

  initialState,

  reducers: {
    // =========================
    // Select Region
    // =========================

    setSelectedRegion: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.selectedRegionId = action.payload;

      // Region change hone par
      // Zone aur City reset
      state.selectedZoneId = null;
      state.selectedCityId = null;

      state.zones = [];
      state.cities = [];
    },

    // =========================
    // Select Zone
    // =========================

    setSelectedZone: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.selectedZoneId = action.payload;

      // Zone change hone par City reset
      state.selectedCityId = null;

      state.cities = [];
    },

    // =========================
    // Select City
    // =========================

    setSelectedCity: (
      state,
      action: PayloadAction<number | null>
    ) => {
      state.selectedCityId = action.payload;
    },

    // =========================
    // Reset Filters
    // =========================

    resetLocationFilters: (state) => {
      state.selectedRegionId = null;
      state.selectedZoneId = null;
      state.selectedCityId = null;

      state.zones = [];
      state.cities = [];
    },

    // =========================
    // Clear All Locations
    // =========================

    clearLocations: (state) => {
      state.regions = [];
      state.zones = [];
      state.cities = [];

      state.selectedRegionId = null;
      state.selectedZoneId = null;
      state.selectedCityId = null;

      state.error = null;
    },

    // =========================
    // Clear Error
    // =========================

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // =====================================
    // REGIONS
    // =====================================

    builder
      .addCase(fetchRegions.pending, (state) => {
        state.loadingRegions = true;
        state.error = null;
      })

      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.loadingRegions = false;
        state.regions = action.payload;
      })

      .addCase(fetchRegions.rejected, (state, action) => {
        state.loadingRegions = false;

        state.error =
          (action.payload as string) ||
          "Failed to fetch regions";
      });

    // =====================================
    // ZONES
    // =====================================

    builder
      .addCase(fetchZones.pending, (state) => {
        state.loadingZones = true;
        state.error = null;
      })

      .addCase(fetchZones.fulfilled, (state, action) => {
        state.loadingZones = false;
        state.zones = action.payload;
      })

      .addCase(fetchZones.rejected, (state, action) => {
        state.loadingZones = false;

        state.error =
          (action.payload as string) ||
          "Failed to fetch zones";
      });

    // =====================================
    // CITIES
    // =====================================

    builder
      .addCase(fetchCities.pending, (state) => {
        state.loadingCities = true;
        state.error = null;
      })

      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loadingCities = false;
        state.cities = action.payload;
      })

      .addCase(fetchCities.rejected, (state, action) => {
        state.loadingCities = false;

        state.error =
          (action.payload as string) ||
          "Failed to fetch cities";
      });
  },
});

// =========================
// Actions
// =========================

export const {
  setSelectedRegion,
  setSelectedZone,
  setSelectedCity,
  resetLocationFilters,
  clearLocations,
  clearError,
} = locationSlice.actions;

// =========================
// Reducer
// =========================

export default locationSlice.reducer;