import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createDsrApi,
  getDsrByIdApi,
  updateDsrApi,
  getAllDsrApi,
} from "./dsrApi";
import { DsrRecord } from "@/types/types";

interface DsrState {
  currentDsr: Record<string, any> | null;
  dsrList: DsrRecord[];
  totalCount: number;
  listLoading: boolean;
  listError: string | null;
  createLoading: boolean;
  createError: string | null;
  createSuccess: boolean;
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  fetchLoading: boolean;
  fetchError: string | null;
}

const initialState: DsrState = {
  currentDsr: null,
  dsrList: [],
  totalCount: 0,
  listLoading: false,
  listError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  fetchLoading: false,
  fetchError: null,
};

// ─── FETCH ALL ────────────────────────────────────────────────────────────────
export const fetchAllDsr = createAsyncThunk(
  "dsr/fetchAllDsr",
  async (params: Record<string, any>, { rejectWithValue }) => {
    try {
      return await getAllDsrApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── FETCH BY ID ──────────────────────────────────────────────────────────────
export const fetchDsrById = createAsyncThunk(
  "dsr/fetchDsrById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getDsrByIdApi(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createDsr = createAsyncThunk(
  "dsr/createDsr",
  async (dsrData: Record<string, any>, { rejectWithValue }) => {
    try {
      return await createDsrApi(dsrData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateDsr = createAsyncThunk(
  "dsr/updateDsr",
  async (
    { id, data }: { id: string; data: Record<string, any> },
    { rejectWithValue },
  ) => {
    try {
      return await updateDsrApi(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── SLICE ────────────────────────────────────────────────────────────────────
const dsrSlice = createSlice({
  name: "dsr",
  initialState,
  reducers: {
    resetCreateState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
    },
    resetUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    resetAllStates: (state) => {
      state.createLoading = false;
      state.updateLoading = false;
      state.fetchLoading = false;
      state.listLoading = false;
      state.createError = null;
      state.updateError = null;
      state.fetchError = null;
      state.listError = null;
      state.createSuccess = false;
      state.updateSuccess = false;
    },
    clearCurrentDsr: (state) => {
      state.currentDsr = null;
    },
    setCurrentDsr: (
      state,
      action: PayloadAction<Record<string, any> | null>,
    ) => {
      state.currentDsr = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch All ──────────────────────────────────────────────────────────
      // ─── FETCH ALL ──────────────────────────────────────────────────────────
      .addCase(fetchAllDsr.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })

      .addCase(fetchAllDsr.fulfilled, (state, action) => {
        state.listLoading = false;
        state.listError = null;

        const payload = action.payload;

        console.log("DSR GET ALL RESPONSE:", payload);

        state.dsrList = payload?.dsrList || [];
        state.totalCount = payload?.total || 0;
      })

      .addCase(fetchAllDsr.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload as string;
        state.dsrList = [];
        state.totalCount = 0;
      })

      // ── Fetch By ID ────────────────────────────────────────────────────────
      .addCase(fetchDsrById.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
        state.currentDsr = null;
      })
      .addCase(fetchDsrById.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.currentDsr = action.payload;
      })
      .addCase(fetchDsrById.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload as string;
      })

      // ── Create ─────────────────────────────────────────────────────────────
      .addCase(createDsr.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createDsr.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.currentDsr = action.payload;
      })
      .addCase(createDsr.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
        state.createSuccess = false;
      })

      // ── Update ─────────────────────────────────────────────────────────────
      .addCase(updateDsr.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateDsr.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.currentDsr = action.payload;
        // Reflect updated record in list
        const idx = state.dsrList.findIndex((d) => d.id === action.payload?.id);
        if (idx !== -1) state.dsrList[idx] = action.payload;
      })
      .addCase(updateDsr.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
        state.updateSuccess = false;
      });
  },
});

export const {
  resetCreateState,
  resetUpdateState,
  resetAllStates,
  clearCurrentDsr,
  setCurrentDsr,
} = dsrSlice.actions;

export default dsrSlice.reducer;
