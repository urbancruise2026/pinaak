import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { countryData } from "@/types/types";
import {
  createCountryCodeApi,
  getAllCountriesApi,
  getCountryByCodeApi,
} from "./countrycodeApi";

interface CountryState {
  countries: countryData[];
  country: countryData | null;
  countryCode: Pick<countryData, "country_code" | "phone_code"> | null;
  loading: boolean;
  error: string | null;
}

const initialState: CountryState = {
  countries: [],
  country: null,
  countryCode: null,
  loading: false,
  error: null,
};

export const createCountryThunk = createAsyncThunk<
  countryData,
  countryData,
  { rejectValue: string }
>("country/create", async (data, { rejectWithValue }) => {
  try {
    return await createCountryCodeApi(data);
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to create country");
  }
});

export const getCountriesThunk = createAsyncThunk<
  countryData[],
  void,
  { rejectValue: string }
>("country/getAll", async (_, { rejectWithValue }) => {
  try {
    return await getAllCountriesApi();
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch countries");
  }
});

export const getCountryCodeThunk = createAsyncThunk<
  Pick<countryData, "country_code" | "phone_code">,
  void,
  { rejectValue: string }
>("country/getCode", async (_, { rejectWithValue }) => {
  try {
    return await getCountryByCodeApi();
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch country code");
  }
});

const countrySlice = createSlice({
  name: "country",
  initialState,
  reducers: {
    clearCountryState: (state) => {
      state.error = null;
      state.country = null;
      state.countryCode = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(createCountryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createCountryThunk.fulfilled,
        (state, action: PayloadAction<countryData>) => {
          state.loading = false;
          state.country = action.payload;

          const exists = state.countries.some(
            (c) => c.id === action.payload.id,
          );
          if (!exists) {
            state.countries.unshift(action.payload);
          }
        },
      )
      .addCase(createCountryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create country";
      })

      .addCase(getCountriesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCountriesThunk.fulfilled,
        (state, action: PayloadAction<countryData[]>) => {
          state.loading = false;
          state.countries = action.payload;
        },
      )
      .addCase(getCountriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch countries";
      })

      .addCase(getCountryCodeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCountryCodeThunk.fulfilled,
        (
          state,
          action: PayloadAction<
            Pick<countryData, "country_code" | "phone_code">
          >,
        ) => {
          state.loading = false;
          state.countryCode = action.payload;
        },
      )
      .addCase(getCountryCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch country code";
      });
  },
});

export const { clearCountryState } = countrySlice.actions;
export default countrySlice.reducer;