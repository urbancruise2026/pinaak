import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createRateQuotationApi,
  getRateQuotationByLeadIdApi,
  getChargeTemplates,
  getNoteTemplates,
  type CreateQuotationPayload,
} from "./RateQuotationApi";

export interface RateQuotationState {
  charges: any[];
  notes: any[];

  chargesLoading: boolean;
  notesLoading: boolean;

  chargesError: string | null;
  notesError: string | null;

  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;

  createdQuotation: {
    id: number;
    quote_no: string;
  } | null;

  quotation: any | null;
  quotationLoading: boolean;
  quotationError: string | null;
}

const initialState: RateQuotationState = {
  charges: [],
  notes: [],

  chargesLoading: false,
  notesLoading: false,

  chargesError: null,
  notesError: null,

  createLoading: false,
  createError: null,
  createSuccess: null,

  createdQuotation: null,

  quotation: null,
  quotationLoading: false,
  quotationError: null,
};

/* =========================================================
   GET CHARGE TEMPLATES
========================================================= */

export const fetchChargeTemplates = createAsyncThunk(
  "rateQuotation/fetchChargeTemplates",
  async (_, { rejectWithValue }) => {
    try {
      return await getChargeTemplates();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/* =========================================================
   GET NOTE TEMPLATES
========================================================= */

export const fetchNoteTemplates = createAsyncThunk(
  "rateQuotation/fetchNoteTemplates",
  async (_, { rejectWithValue }) => {
    try {
      return await getNoteTemplates();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/* =========================================================
   GET QUOTATION BY LEAD
========================================================= */

export const fetchRateQuotationByLeadId = createAsyncThunk(
  "rateQuotation/fetchByLead",
  async (leadId: string | number, { rejectWithValue }) => {
    try {
      return await getRateQuotationByLeadIdApi(String(leadId));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/* =========================================================
   CREATE QUOTATION
========================================================= */

export const createRateQuotation = createAsyncThunk(
  "rateQuotation/create",
  async (payload: CreateQuotationPayload, { rejectWithValue }) => {
    try {
      return await createRateQuotationApi(payload);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/* =========================================================
   SLICE
========================================================= */

const rateQuotationSlice = createSlice({
  name: "rateQuotation",

  initialState,

  reducers: {
    clearCreateQuotationState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = null;
      state.createdQuotation = null;
    },

    clearQuotation: (state) => {
      state.quotation = null;
      state.quotationError = null;
      state.quotationLoading = false;
    },
  },

  extraReducers: (builder) => {
    /* ---------------- CHARGES ---------------- */

    builder
      .addCase(fetchChargeTemplates.pending, (state) => {
        state.chargesLoading = true;
        state.chargesError = null;
      })

      .addCase(fetchChargeTemplates.fulfilled, (state, action) => {
        state.chargesLoading = false;
        state.charges = action.payload;
      })

      .addCase(fetchChargeTemplates.rejected, (state, action) => {
        state.chargesLoading = false;
        state.chargesError =
          (action.payload as string) || "Failed to fetch charge templates";
      });

    /* ---------------- NOTES ---------------- */

    builder
      .addCase(fetchNoteTemplates.pending, (state) => {
        state.notesLoading = true;
        state.notesError = null;
      })

      .addCase(fetchNoteTemplates.fulfilled, (state, action) => {
        state.notesLoading = false;
        state.notes = action.payload;
      })

      .addCase(fetchNoteTemplates.rejected, (state, action) => {
        state.notesLoading = false;
        state.notesError =
          (action.payload as string) || "Failed to fetch note templates";
      });

    /* ---------------- GET QUOTATION ---------------- */

    builder
      .addCase(fetchRateQuotationByLeadId.pending, (state) => {
        state.quotationLoading = true;
        state.quotationError = null;
      })

      .addCase(fetchRateQuotationByLeadId.fulfilled, (state, action) => {
        state.quotationLoading = false;
        state.quotation = action.payload;
      })

      .addCase(fetchRateQuotationByLeadId.rejected, (state, action) => {
        state.quotationLoading = false;
        state.quotationError =
          (action.payload as string) || "Failed to fetch Rate Quotation";
      });

    /* ---------------- CREATE ---------------- */

    builder
      .addCase(createRateQuotation.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
        state.createdQuotation = null;
      })

      .addCase(createRateQuotation.fulfilled, (state, action) => {
        state.createLoading = false;

        state.createdQuotation = action.payload;

        state.createSuccess = `Quotation ${action.payload.quote_no} created successfully`;
      })

      .addCase(createRateQuotation.rejected, (state, action) => {
        state.createLoading = false;

        state.createError =
          (action.payload as string) || "Failed to create Rate Quotation";
      });
  },
});

export const { clearCreateQuotationState, clearQuotation } =
  rateQuotationSlice.actions;

export default rateQuotationSlice.reducer;
