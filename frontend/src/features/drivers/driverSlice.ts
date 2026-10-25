import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  createDriverAPI,
  updateDriverAPI,
  DriverFormData,
  DriverResponse,
} from "./driverApi";
import { baseApi } from "@/lib/commonApi";

// CREATE DRIVER
export const createDriverThunk = createAsyncThunk(
  "driver/createDriver",
  async (driverData: DriverFormData, { rejectWithValue }) => {
    try {
      const response = await createDriverAPI(driverData);

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create driver");
    }
  },
);

// UPDATE DRIVER
export const updateDriverThunk = createAsyncThunk(
  "driver/updateDriver",
  async (
    {
      id,
      data,
    }: {
      id: number;
      data: DriverFormData;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await updateDriverAPI(id, data);

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update driver");
    }
  },
);

// GET ALL DRIVERS
export const getDriversThunk = createAsyncThunk(
  "driver/getDrivers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${baseApi}/driver`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data?.data?.drivers || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch drivers",
      );
    }
  },
);

// GET DRIVER BY ID
export const getDriverByIdThunk = createAsyncThunk(
  "driver/getDriverById",
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${baseApi}/driver/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data?.data?.driver;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch driver",
      );
    }
  },
);

interface DriverState {
  drivers: DriverResponse[];
  currentDriver: DriverResponse | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  isSuccess: boolean;
  driverId: number | null;
}

const initialState: DriverState = {
  drivers: [],
  currentDriver: null,
  loading: false,
  error: null,
  successMessage: null,
  isSuccess: false,
  driverId: null,
};

const driverSlice = createSlice({
  name: "driver",
  initialState,

  reducers: {
    resetSuccess: (state) => {
      state.successMessage = null;
      state.isSuccess = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    setCurrentDriver: (state, action: PayloadAction<DriverResponse | null>) => {
      state.currentDriver = action.payload;
    },

    clearDriverState: (state) => {
      state.drivers = [];
      state.currentDriver = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
      state.isSuccess = false;
      state.driverId = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // CREATE DRIVER
      .addCase(createDriverThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createDriverThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;

        state.drivers.unshift(action.payload);

        state.driverId = action.payload.id;

        state.successMessage = "Driver created successfully";

        state.isSuccess = true;
      })

      .addCase(createDriverThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isSuccess = false;
      })

      // UPDATE DRIVER
      .addCase(updateDriverThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateDriverThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.currentDriver = action.payload;

        state.drivers = state.drivers.map((driver) =>
          driver.id === action.payload.id ? action.payload : driver,
        );

        state.successMessage = "Driver updated successfully";

        state.isSuccess = true;
      })

      .addCase(updateDriverThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;

        state.isSuccess = false;
      })

      // GET ALL DRIVERS
      .addCase(getDriversThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getDriversThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
        state.error = null;
      })

      .addCase(getDriversThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // GET DRIVER BY ID
      .addCase(getDriverByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getDriverByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;
        state.error = null;
      })

      .addCase(getDriverByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSuccess, clearError, setCurrentDriver, clearDriverState } =
  driverSlice.actions;

export default driverSlice.reducer;
