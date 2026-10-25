import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchCustomersAPI,
  searchCustomersAPI,
  createCustomerAPI,
  updateCustomerAPI,
  CustomerRecord,
  getCustomerByIdAPI,
} from "./newCustomerApi";

interface CustomerState {
  customers: CustomerRecord[];
  searchResults: CustomerRecord[];
  loading: boolean;
  searching: boolean;
  error: string | null;
  searchError: string | null;
  createdCustomer: CustomerRecord | null;
  isSuccess: boolean;
  selectedCustomer: CustomerRecord | null;
}

const initialState: CustomerState = {
  customers: [],
  searchResults: [],
  loading: false,
  searching: false,
  error: null,
  searchError: null,
  createdCustomer: null,
  isSuccess: false,
  selectedCustomer: null,
};

// ─── Get All Customers ──────────────────────────────────────────────────────
export const getCustomersThunk = createAsyncThunk(
  "newCustomer/getCustomers",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCustomersAPI();
    } catch (error: any) {
      return rejectWithValue(error.message || "Error fetching customers");
    }
  },
);

// ─── Search Customers ───────────────────────────────────────────────────────
export const searchCustomersThunk = createAsyncThunk(
  "newCustomer/searchCustomers",
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      if (!searchTerm.trim()) return [];
      return await searchCustomersAPI(searchTerm);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error searching customers");
    }
  },
);

// ─── Create Customer ────────────────────────────────────────────────────────
export const createCustomerThunk = createAsyncThunk(
  "newCustomer/createCustomer",
  async (
    customerData: Partial<CustomerRecord> & { phone?: string; email?: string },
    { rejectWithValue },
  ) => {
    try {
      return await createCustomerAPI(customerData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error creating customer");
    }
  },
);

export const updateCustomerThunk = createAsyncThunk(
  "newCustomer/updateCustomer",
  async (
    {
      id,
      data,
    }: {
      id: number;
      data: Partial<CustomerRecord> & {
        phone?: string;
        email?: string;
        dateOfBirth?: string;
      };
    },
    { rejectWithValue },
  ) => {
    try {
      const result = await updateCustomerAPI(id, data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error updating customer");
    }
  },
);

export const getCustomerByIdThunk = createAsyncThunk(
  "newCustomer/getCustomerById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getCustomerByIdAPI(id);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error fetching customer");
    }
  },
);
// ─── Slice ──────────────────────────────────────────────────────────────────
const NewCustomerSlice = createSlice({
  name: "newCustomer",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.searchError = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searching = false;
      state.searchError = null;
    },
    resetSuccess: (state) => {
      state.isSuccess = false;
      state.createdCustomer = null;
    },
  },
  extraReducers: (builder) => {
    // ── Get All ──────────────────────────────────────────────────────────────
    builder
      .addCase(getCustomersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCustomersThunk.fulfilled,
        (state, action: PayloadAction<CustomerRecord[]>) => {
          state.loading = false;
          state.customers = action.payload;
        },
      )
      .addCase(getCustomersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── Search ───────────────────────────────────────────────────────────────
      .addCase(searchCustomersThunk.pending, (state) => {
        state.searching = true;
        state.searchError = null;
      })
      .addCase(
        searchCustomersThunk.fulfilled,
        (state, action: PayloadAction<CustomerRecord[]>) => {
          state.searching = false;
          state.searchResults = action.payload;
        },
      )
      .addCase(searchCustomersThunk.rejected, (state, action) => {
        state.searching = false;
        state.searchError = action.payload as string;
      })

      // ── Create ───────────────────────────────────────────────────────────────
      .addCase(createCustomerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(
        createCustomerThunk.fulfilled,
        (state, action: PayloadAction<CustomerRecord>) => {
          state.loading = false;
          state.createdCustomer = action.payload;
          state.customers.unshift(action.payload);
          state.isSuccess = true;
        },
      )
      .addCase(createCustomerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isSuccess = false;
      })

      // ── Update ───────────────────────────────────────────────────────────────
      .addCase(updateCustomerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(
        updateCustomerThunk.fulfilled,
        (state, action: PayloadAction<CustomerRecord>) => {
          state.loading = false;
          // Local list mein bhi update karo taaki table refresh na karna pade
          const index = state.customers.findIndex(
            (c) => c.id === action.payload.id,
          );
          if (index !== -1) {
            state.customers[index] = action.payload;
          }
          state.isSuccess = true;
        },
      )
      .addCase(updateCustomerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isSuccess = false;
      })
      .addCase(getCustomerByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        getCustomerByIdThunk.fulfilled,
        (state, action: PayloadAction<CustomerRecord>) => {
          state.loading = false;
          state.selectedCustomer = action.payload;
        },
      )

      .addCase(getCustomerByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSearchResults, resetSuccess } =
  NewCustomerSlice.actions;
export default NewCustomerSlice.reducer;
