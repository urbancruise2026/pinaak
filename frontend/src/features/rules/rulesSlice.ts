import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAdvisorsByZone,
  getRules,
  createRule,
  ZoneAdvisor,
  RuleEntry,
  CreateRulePayload,
  deleteRule,
  updateRule,
} from "./rulesApi";
import {Entry, FormState} from "./components/Entryform"
import type { PayloadAction } from "@reduxjs/toolkit"
import type {  RulePayload } from "./rules.types";
interface RuleState {
  zoneAdvisors: ZoneAdvisor[];
  entries: RuleEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: RuleState = {
  zoneAdvisors: [],
  entries: [],
  loading: false,
  error: null,
};

// ================= Advisors =================

export const fetchAdvisorsByZone = createAsyncThunk<
  ZoneAdvisor[],
  void,
  { rejectValue: string }
>("rule/fetchAdvisorsByZone", async (_, { rejectWithValue }) => {
  try {
    const data = await getAdvisorsByZone();

    return data;
  } catch (error: any) {
    console.log("API ERROR:", error);

    return rejectWithValue(error.message || "Failed to fetch advisors");
  }
});

// ================= Get Entries =================

export const fetchRuleEntries = createAsyncThunk<
  RuleEntry[],
  void,
  { rejectValue: string }
>("rule/fetchRuleEntries", async (_, { rejectWithValue }) => {
  try {
    const data = await getRules();

    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch rules");
  }
});

// ================= Create Entry =================

export const createRuleEntry = createAsyncThunk<
  RuleEntry,
  CreateRulePayload,
  { rejectValue: string }
>("rule/createRuleEntry", async (payload, { rejectWithValue }) => {
  try {
    const data = await createRule(payload);

    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create rule");
  }
});

//remove this line if everything works good at the place off this i have added another ruleentry 

// export const updateRuleEntry = createAsyncThunk<
//   RuleEntry,
//   FormState & { id: number },
//   { rejectValue: string }
// >("rule/updateRuleEntry", async ({ id, ...form }, { rejectWithValue }) => {
//   try {
//     return await updateRule(id, form);
//   } catch (error: any) {
//     return rejectWithValue(error.message || "Failed to update entry");
//   }
// });

export const updateRuleEntry = createAsyncThunk<
  RuleEntry,
  { id: number; data: RulePayload },   // was FormState
  { rejectValue: string }
>("rules/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updateRule(id, data);
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Failed to update entry");
  }
});

// DELETE
export const deleteRuleEntry = createAsyncThunk<
  { id: number },
  number,
  { rejectValue: string }
>("rule/deleteRuleEntry", async (id, { rejectWithValue }) => {
  try {
    return await deleteRule(id);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete entry");
  }
});
const ruleSlice = createSlice({
  name: "rule",
  initialState,
  reducers: {
    clearAdvisors: (state) => {
      state.zoneAdvisors = [];
      state.error = null;
    },

    clearRules: (state) => {
      state.entries = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Advisors
      .addCase(fetchAdvisorsByZone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAdvisorsByZone.fulfilled, (state, action) => {
        state.loading = false;
        state.zoneAdvisors = action.payload;
      })

      .addCase(fetchAdvisorsByZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch advisors";
      })

      // Get Rules
      .addCase(fetchRuleEntries.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchRuleEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })

      .addCase(fetchRuleEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch rules";
      })

      // Create Rule
      .addCase(createRuleEntry.pending, (state) => {
        state.loading = true;
      })

      .addCase(createRuleEntry.fulfilled, (state, action) => {
        state.loading = false;

        // nayi entry list me add
        state.entries.unshift(action.payload);
      })

      .addCase(createRuleEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create rule";
      })
      .addCase(
        updateRuleEntry.fulfilled,
        (state, action)=> {
          const index = state.entries.findIndex(
            (e) => e.id === action.payload.id,
          );
          if (index !== -1) {
            state.entries[index] = {
              ...state.entries[index],
              ...action.payload,
            };
          }
        },
      )
      .addCase(updateRuleEntry.rejected, (state, action) => {
        state.error = action.payload || "Failed to update entry";
      })

      // DELETE
      .addCase(
        deleteRuleEntry.fulfilled,
        (state, action: PayloadAction<{ id: number }>) => {
          state.entries = state.entries.filter(
            (e) => e.id !== action.payload.id,
          );
        },
      )
      .addCase(deleteRuleEntry.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete entry";
      });
  },
});

export const { clearAdvisors, clearRules } = ruleSlice.actions;

export default ruleSlice.reducer;
