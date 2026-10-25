import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCitiesApi, getStatesByCityApi } from "./stateApi";

export interface CityType {
  id: number;
  uuid?: string;
  cityName: string;
}

export interface StateType {
  id: number;
  stateName: string;
}

interface StateCityState {
  cities: CityType[];
  statesForCity: StateType[]; // ← city ke basis pe states
  loading: boolean;
  citiesLoading: boolean;
  statesLoading: boolean;
}

const initialState: StateCityState = {
  cities: [],
  statesForCity: [],
  loading: false,
  citiesLoading: false,
  statesLoading: false,
};

// ─── All cities fetch ───────────────────────────────────────────────────────
export const fetchAllCities = createAsyncThunk(
  "stateCity/fetchAllCities",
  async () => {
    const data = await getAllCitiesApi();
    return data;
  },
);

// ─── City ke basis pe states fetch ─────────────────────────────────────────
export const fetchStatesByCity = createAsyncThunk(
  "stateCity/fetchStatesByCity",
  async (cityName: string) => {
    const data = await getStatesByCityApi(cityName);
    return data;
  },
);

const stateCitySlice = createSlice({
  name: "stateCity",
  initialState,
  reducers: {
    // City change hone pe states reset karo
    resetStatesForCity: (state) => {
      state.statesForCity = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchAllCities ──────────────────────────────────────────────────
      .addCase(fetchAllCities.pending, (state) => {
        state.citiesLoading = true;
      })
      .addCase(fetchAllCities.fulfilled, (state, action) => {
        // Unique cities only
        const seen = new Set<string>();
        state.cities = action.payload.filter((city) => {
          if (seen.has(city.cityName)) return false;
          seen.add(city.cityName);
          return true;
        });
        state.citiesLoading = false;
      })
      .addCase(fetchAllCities.rejected, (state) => {
        state.citiesLoading = false;
        state.cities = [];
      })

      // ── fetchStatesByCity ───────────────────────────────────────────────
      .addCase(fetchStatesByCity.pending, (state) => {
        state.statesLoading = true;
        state.statesForCity = [];
      })
      .addCase(fetchStatesByCity.fulfilled, (state, action) => {
        state.statesForCity = action.payload;
        state.statesLoading = false;
      })
      .addCase(fetchStatesByCity.rejected, (state) => {
        state.statesLoading = false;
        state.statesForCity = [];
      });
  },
});

export const { resetStatesForCity } = stateCitySlice.actions;
export default stateCitySlice.reducer;
