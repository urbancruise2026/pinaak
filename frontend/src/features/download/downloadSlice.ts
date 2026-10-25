import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDownloadReportAPI } from "./downloadApi";

interface DownloadState {
  loading: boolean;
  reportData: any[];
  error: string | null;
}

interface DownloadPayload {
  type: string;
  month: string;
  year: string;
}

const initialState: DownloadState = {
  loading: false,
  reportData: [],
  error: null,
};

export const getDownloadReportThunk = createAsyncThunk(
  "download/getReport",
  async (payload: DownloadPayload, { rejectWithValue }) => {
    try {
      const response = await getDownloadReportAPI(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong",
      );
    }
  },
);

const downloadSlice = createSlice({
  name: "download",
  initialState,
  reducers: {
    resetDownloadState: (state) => {
      state.reportData = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDownloadReportThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getDownloadReportThunk.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.reportData = action.payload || [];
        },
      )
      .addCase(getDownloadReportThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetDownloadState } = downloadSlice.actions;

export default downloadSlice.reducer;
