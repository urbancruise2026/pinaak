import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";

import axios from "axios";

import {
  createVendorAPI,
  updateVendorAPI,
  type VendorResponse,
  type VendorUpdateData,
} from "./vendorApi";

import type { VendorFormData } from "./components/vendorComponents/types";

import { baseApi } from "@/lib/commonApi";

// ─────────────────────────────────────────────
// CREATE VENDOR THUNK
// ─────────────────────────────────────────────

export const createVendorThunk =
  createAsyncThunk<
    VendorResponse,
    VendorFormData,
    { rejectValue: string }
  >(
    "vendor/createVendor",
    async (
      vendorData,
      { rejectWithValue },
    ) => {
      try {
        const response =
          await createVendorAPI(vendorData);

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error.message ||
            "Failed to create vendor",
        );
      }
    },
  );

// ─────────────────────────────────────────────
// UPDATE VENDOR THUNK
// ─────────────────────────────────────────────

export const updateVendorThunk =
  createAsyncThunk<
    VendorResponse,
    {
      id: number;
      vendorData: VendorUpdateData;
    },
    { rejectValue: string }
  >(
    "vendor/updateVendor",
    async (
      { id, vendorData },
      { rejectWithValue },
    ) => {
      try {
        const response =
          await updateVendorAPI(
            id,
            vendorData,
          );

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error.message ||
            "Failed to update vendor",
        );
      }
    },
  );

// ─────────────────────────────────────────────
// GET ALL VENDORS THUNK
// ─────────────────────────────────────────────

export const getVendorsThunk =
  createAsyncThunk<
    VendorResponse[],
    void,
    { rejectValue: string }
  >(
    "vendor/getVendors",
    async (
      _,
      { rejectWithValue },
    ) => {
      try {
        const response = await axios.get(
          `${baseApi}/vendor`,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          },
        );

        if (
          response.data?.data?.vendors
        ) {
          return response.data.data.vendors;
        }

        if (Array.isArray(response.data?.data)) {
          return response.data.data;
        }

        if (Array.isArray(response.data)) {
          return response.data;
        }

        return [];
      } catch (error: any) {
        console.error(
          "Get vendors error:",
          error,
        );

        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to fetch vendors",
        );
      }
    },
  );

// ─────────────────────────────────────────────
// GET VENDOR BY ID THUNK
// ─────────────────────────────────────────────

export const getVendorByIdThunk =
  createAsyncThunk<
    VendorResponse | null,
    number,
    { rejectValue: string }
  >(
    "vendor/getVendorById",
    async (
      id,
      { rejectWithValue },
    ) => {
      try {
        const response = await axios.get(
          `${baseApi}/vendor/${id}`,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          },
        );

        if (
          response.data?.data?.vendor
        ) {
          return response.data.data.vendor;
        }

        if (response.data?.data) {
          return response.data.data;
        }

        if (response.data?.vendor) {
          return response.data.vendor;
        }

        return response.data;
      } catch (error: any) {
        console.error(
          "Get vendor by ID error:",
          error,
        );

        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to fetch vendor",
        );
      }
    },
  );

// ─────────────────────────────────────────────
// VENDOR STATE
// ─────────────────────────────────────────────

interface VendorState {
  vendors: VendorResponse[];

  currentVendor:
    | VendorResponse
    | null;

  selectedVendor:
    | VendorResponse
    | null;

  loading: boolean;

  error: string | null;

  successMessage: string | null;

  isSuccess: boolean;

  vendorId: number | null;
}

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────

const initialState: VendorState = {
  vendors: [],

  currentVendor: null,

  selectedVendor: null,

  loading: false,

  error: null,

  successMessage: null,

  isSuccess: false,

  vendorId: null,
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const vendorSlice = createSlice({
  name: "vendor",

  initialState,

  reducers: {
    resetSuccess: (state) => {
      state.successMessage = null;
      state.isSuccess = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    setCurrentVendor: (
      state,
      action: PayloadAction<
        VendorResponse | null
      >,
    ) => {
      state.currentVendor =
        action.payload;
    },

    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },

    clearVendorState: (state) => {
      state.vendors = [];
      state.currentVendor = null;
      state.selectedVendor = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
      state.isSuccess = false;
      state.vendorId = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ═══════════════════════════════════════
      // CREATE VENDOR
      // ═══════════════════════════════════════

      .addCase(
        createVendorThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
          state.isSuccess = false;
        },
      )

     .addCase(
  createVendorThunk.fulfilled,
  (state, action) => {
    state.loading = false;

    state.vendors.push(action.payload);

    state.currentVendor = action.payload;

    state.selectedVendor = action.payload;

    state.vendorId = action.payload.id ?? null;

    state.successMessage =
      action.payload.message ||
      "Vendor created successfully";

    state.isSuccess = true;
  },
)


      .addCase(
        createVendorThunk.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to create vendor";

          state.isSuccess = false;
        },
      )

      // ═══════════════════════════════════════
      // UPDATE VENDOR
      // ═══════════════════════════════════════

      .addCase(
        updateVendorThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
          state.isSuccess = false;
        },
      )

      .addCase(
  updateVendorThunk.fulfilled,
  (state, action) => {
    state.loading = false;

    const index = state.vendors.findIndex(
      (vendor) =>
        vendor.id === action.payload.id,
    );

    if (index !== -1) {
      state.vendors[index] = action.payload;
    }

    state.currentVendor = action.payload;

    state.selectedVendor = action.payload;

    state.vendorId = action.payload.id ?? null;

    state.successMessage =
      "Vendor updated successfully";

    state.isSuccess = true;
  },
)


      .addCase(
        updateVendorThunk.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to update vendor";

          state.isSuccess = false;
        },
      )

      // ═══════════════════════════════════════
      // GET ALL VENDORS
      // ═══════════════════════════════════════

      .addCase(
        getVendorsThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )

      .addCase(
        getVendorsThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.vendors =
            action.payload;
          state.error = null;
        },
      )

      .addCase(
        getVendorsThunk.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch vendors";
        },
      )

      // ═══════════════════════════════════════
      // GET VENDOR BY ID
      // ═══════════════════════════════════════

      .addCase(
        getVendorByIdThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )

      .addCase(
        getVendorByIdThunk.fulfilled,
        (state, action) => {
          state.loading = false;

          state.currentVendor =
            action.payload;

          state.selectedVendor =
            action.payload;

          state.vendorId =
            action.payload?.id ??
            null;

          state.error = null;
        },
      )

      .addCase(
        getVendorByIdThunk.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch vendor";
        },
      );
  },
});

// ─────────────────────────────────────────────
// EXPORT ACTIONS
// ─────────────────────────────────────────────

export const {
  resetSuccess,
  clearError,
  setCurrentVendor,
  clearSelectedVendor,
  clearVendorState,
} = vendorSlice.actions;

// ─────────────────────────────────────────────
// EXPORT REDUCER
// ─────────────────────────────────────────────

export default vendorSlice.reducer;
