import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import {
  createVendorAPI,
  deleteVendorAPI,
  getAllVendorsAPI,
  getAllAccessCitiesAPI,
  getVendorByIdAPI,
  updateVendorAPI,
  updateVendorStatusAPI,
  updateVendorVerificationAPI,
  type CityResponse,
  type VendorResponse,
  type VendorStatus,
  type VendorUpdateData,
  type VendorVerification,
} from "./vendorApi";

import type { VendorFormData } from "./components/vendorComponents/types";

export const createVendorThunk = createAsyncThunk<
  VendorResponse,
  VendorFormData,
  { rejectValue: string }
>("vendor/createVendor", async (vendorData, { rejectWithValue }) => {
  try {
    const response = await createVendorAPI(vendorData);

    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create vendor");
  }
});

export const updateVendorThunk = createAsyncThunk<
  VendorResponse,
  {
    id: number;
    vendorData: VendorUpdateData;
  },
  { rejectValue: string }
>("vendor/updateVendor", async ({ id, vendorData }, { rejectWithValue }) => {
  try {
    const response = await updateVendorAPI(id, vendorData);

    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update vendor");
  }
});

export const getVendorsThunk = createAsyncThunk<
  VendorResponse[],
  void,
  { rejectValue: string }
>("vendor/getVendors", async (_, { rejectWithValue }) => {
  try {
    return await getAllVendorsAPI();
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch vendors");
  }
});

export const getVendorByIdThunk = createAsyncThunk<
  VendorResponse | null,
  number,
  { rejectValue: string }
>("vendor/getVendorById", async (id, { rejectWithValue }) => {
  try {
    return await getVendorByIdAPI(id);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch vendor");
  }
});

export const updateVendorStatusThunk = createAsyncThunk<
  { id: number; status: VendorStatus },
  { id: number; status: VendorStatus },
  { rejectValue: string }
>("vendor/updateStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    return await updateVendorStatusAPI(id, status);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update status");
  }
});

export const updateVendorVerificationThunk = createAsyncThunk<
  { id: number; verification: VendorVerification },
  { id: number; verification: VendorVerification },
  { rejectValue: string }
>(
  "vendor/updateVerification",
  async ({ id, verification }, { rejectWithValue }) => {
    try {
      return await updateVendorVerificationAPI(id, verification);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update verification");
    }
  },
);
export const deleteVendorThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("vendor/delete", async (id, { rejectWithValue }) => {
  try {
    return await deleteVendorAPI(id);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete vendor");
  }
});

export const getAllAccessCitiesThunk = createAsyncThunk<
  CityResponse[],
  void,
  { rejectValue: string }
>("vendor/getAllAccessCities", async (_, { rejectWithValue }) => {
  try {
    return await getAllAccessCitiesAPI();
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch cities");
  }
});

interface VendorState {
  vendors: VendorResponse[];

  cities: CityResponse[];
  citiesLoading: boolean;

  currentVendor: VendorResponse | null;
  selectedVendor: VendorResponse | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  isSuccess: boolean;
  vendorId: number | null;
}

const initialState: VendorState = {
  vendors: [],

  cities: [],
  citiesLoading: false,

  currentVendor: null,
  selectedVendor: null,
  loading: false,
  error: null,
  successMessage: null,
  isSuccess: false,
  vendorId: null,
};

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

    setCurrentVendor: (state, action: PayloadAction<VendorResponse | null>) => {
      state.currentVendor = action.payload;
    },

    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },

    clearVendorState: (state) => {
      state.vendors = [];
      state.cities = [];
      state.citiesLoading = false;
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

      .addCase(createVendorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.isSuccess = false;
      })

      .addCase(createVendorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVendor = action.payload;
        state.selectedVendor = action.payload;
        state.vendorId = action.payload?.id ?? null;
        state.successMessage =
          action.payload?.message || "Vendor created successfully";
        state.isSuccess = true;
      })

      .addCase(createVendorThunk.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to create vendor";

        state.isSuccess = false;
      })

      .addCase(updateVendorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.isSuccess = false;
      })

      .addCase(updateVendorThunk.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Vendor updated successfully";
        state.isSuccess = true;
      })

      .addCase(updateVendorThunk.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to update vendor";

        state.isSuccess = false;
      })

      .addCase(getVendorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getVendorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
        state.error = null;
      })

      .addCase(getVendorsThunk.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch vendors";
      })

      .addCase(getVendorByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getVendorByIdThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.currentVendor = action.payload;

        state.selectedVendor = action.payload;

        state.vendorId = action.payload?.id ?? null;

        state.error = null;
      })

      .addCase(getVendorByIdThunk.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch vendor";
      })
      // ═══════════════════════════════════════
      // UPDATE VENDOR STATUS
      // ═══════════════════════════════════════

      .addCase(updateVendorStatusThunk.pending, (state) => {
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateVendorStatusThunk.fulfilled, (state, action) => {
        const vendor = state.vendors.find(
          (x: any) => x.id === action.payload.id,
        );
        if (vendor) (vendor as any).status = action.payload.status;

        state.successMessage = `Vendor marked ${action.payload.status}`;
        state.isSuccess = true;
      })

      .addCase(updateVendorStatusThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to update status";
        state.isSuccess = false;
      })

      // ═══════════════════════════════════════
      // DELETE VENDOR
      // ═══════════════════════════════════════

      .addCase(deleteVendorThunk.pending, (state) => {
        state.error = null;
        state.successMessage = null;
      })

      .addCase(deleteVendorThunk.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(
          (x: any) => x.id !== action.payload,
        );

        if (state.selectedVendor?.id === action.payload) {
          state.selectedVendor = null;
        }
        if (state.currentVendor?.id === action.payload) {
          state.currentVendor = null;
        }

        state.successMessage = "Vendor deleted successfully";
        state.isSuccess = true;
      })

      .addCase(deleteVendorThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete vendor";
        state.isSuccess = false;
      })
      .addCase(getAllAccessCitiesThunk.pending, (state) => {
        state.citiesLoading = true;
        state.error = null;
      })

      .addCase(getAllAccessCitiesThunk.fulfilled, (state, action) => {
        state.citiesLoading = false;
        state.cities = action.payload;
        state.error = null;
      })

      .addCase(getAllAccessCitiesThunk.rejected, (state, action) => {
        state.citiesLoading = false;
        state.error = action.payload || "Failed to fetch cities";
      })
      // ═══════════════════════════════════════
      // UPDATE VENDOR VERIFICATION
      // ═══════════════════════════════════════

      .addCase(updateVendorVerificationThunk.pending, (state) => {
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateVendorVerificationThunk.fulfilled, (state, action) => {
        const vendor = state.vendors.find(
          (x: any) => x.id === action.payload.id,
        );
        if (vendor) (vendor as any).verification = action.payload.verification;

        state.successMessage = `Verification marked ${action.payload.verification}`;
        state.isSuccess = true;
      })

      .addCase(updateVendorVerificationThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to update verification";
        state.isSuccess = false;
      });
  },
});

export const {
  resetSuccess,
  clearError,
  setCurrentVendor,
  clearSelectedVendor,
  clearVendorState,
} = vendorSlice.actions;

export default vendorSlice.reducer;
