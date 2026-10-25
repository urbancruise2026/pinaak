import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createRateQuotationApi,
  getRateQuotationByLeadIdApi,
  getAllRateQuotationApi,
} from "./rateApi";

interface RateState {
  currentRate: Record<string, any> | null;
  rateList: any[];

  listLoading: boolean;
  listError: string | null;

  createLoading: boolean;
  createError: string | null;
  createSuccess: boolean;

  fetchLoading: boolean;
  fetchError: string | null;
}

const initialState: RateState = {
  currentRate: null,
  rateList: [],

  listLoading: false,
  listError: null,

  createLoading: false,
  createError: null,
  createSuccess: false,

  fetchLoading: false,
  fetchError: null,
};

// ─── CREATE ───────────────────────────────
export const createRateQuotation = createAsyncThunk(
  "rate/create",
  async (data: Record<string, any>, { rejectWithValue }) => {
    try {
      return await createRateQuotationApi(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── GET BY LEAD ID ───────────────────────
export const fetchRateByLeadId = createAsyncThunk(
  "rate/fetchByLead",
  async (leadId: string, { rejectWithValue }) => {
    try {
      return await getRateQuotationByLeadIdApi(leadId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── GET ALL ───────────────────────────────
export const fetchAllRateQuotation = createAsyncThunk(
  "rate/fetchAll",
  async (params: Record<string, any>, { rejectWithValue }) => {
    try {
      return await getAllRateQuotationApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── SLICE ───────────────────────────────
const rateSlice = createSlice({
  name: "rate",
  initialState,
  reducers: {
    resetRateState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
    },

    clearCurrentRate: (state) => {
      state.currentRate = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ─── CREATE ─────────────
      .addCase(createRateQuotation.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createRateQuotation.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.currentRate = action.payload;
      })
      .addCase(createRateQuotation.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })

      // ─── GET BY LEAD ─────────────
      .addCase(fetchRateByLeadId.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchRateByLeadId.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.currentRate = action.payload;
      })
      .addCase(fetchRateByLeadId.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload as string;
      })

      // ─── GET ALL ─────────────
      .addCase(fetchAllRateQuotation.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchAllRateQuotation.fulfilled, (state, action) => {
        console.log("RATE API RESPONSE:", action.payload);

        state.listLoading = false;
        state.rateList = action.payload?.rateList || [];
      })
      .addCase(fetchAllRateQuotation.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload as string;
        state.rateList = [];
      });
  },
});

export const { resetRateState, clearCurrentRate } = rateSlice.actions;

export default rateSlice.reducer;
