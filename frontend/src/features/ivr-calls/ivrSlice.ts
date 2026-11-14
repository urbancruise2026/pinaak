import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "./ivrApi";
import type {
  AccessMapAgent,
  AgentsResult,
  BreakActionResult,
  BreakReport,
  CallsResult,
  FollowupStatus,
  IvrAccess,
  IvrFilters,
  MissedResult,
  MyBreakState,
  SummaryResult,
  SyncResult,
} from "./ivr.types";

type Key = "calls" | "summary" | "missed" | "breaks" | "agents" | "sync" | "action" | "map";

interface IvrState {
  calls: CallsResult | null;
  summary: SummaryResult | null;
  missed: MissedResult | null;
  breaks: BreakReport | null;
  agents: AgentsResult | null;
  accessMap: AccessMapAgent[] | null;
  access: IvrAccess | null;
  me: MyBreakState | null;
  lastSync: SyncResult | null;
  loading: Record<Key, boolean>;
  error: string | null;
}

const initialState: IvrState = {
  calls: null,
  summary: null,
  missed: null,
  breaks: null,
  agents: null,
  accessMap: null,
  access: null,
  me: null,
  lastSync: null,
  loading: {
    calls: false,
    summary: false,
    missed: false,
    breaks: false,
    agents: false,
    sync: false,
    action: false,
    map: false,
  },
  error: null,
};

const msg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

// ---------------- fetchers ----------------

export const fetchCalls = createAsyncThunk<
  CallsResult,
  { filters: IvrFilters; page: number },
  { rejectValue: string }
>("ivr/fetchCalls", async ({ filters, page }, { rejectWithValue }) => {
  try {
    return await api.getCalls(filters, page);
  } catch (e) {
    return rejectWithValue(msg(e, "Failed to fetch calls"));
  }
});

export const fetchSummary = createAsyncThunk<SummaryResult, IvrFilters, { rejectValue: string }>(
  "ivr/fetchSummary",
  async (filters, { rejectWithValue }) => {
    try {
      return await api.getSummary(filters);
    } catch (e) {
      return rejectWithValue(msg(e, "Failed to fetch summary"));
    }
  },
);

export const fetchMissed = createAsyncThunk<
  MissedResult,
  { filters: IvrFilters; page: number; status: FollowupStatus | "" },
  { rejectValue: string }
>("ivr/fetchMissed", async ({ filters, page, status }, { rejectWithValue }) => {
  try {
    return await api.getMissed(filters, page, status);
  } catch (e) {
    return rejectWithValue(msg(e, "Failed to fetch missed calls"));
  }
});

export const fetchBreakReport = createAsyncThunk<BreakReport, IvrFilters, { rejectValue: string }>(
  "ivr/fetchBreakReport",
  async (filters, { rejectWithValue }) => {
    try {
      return await api.getBreakReport(filters);
    } catch (e) {
      return rejectWithValue(msg(e, "Failed to fetch break report"));
    }
  },
);

export const fetchAccess = createAsyncThunk<IvrAccess, void, { rejectValue: string }>(
  "ivr/fetchAccess",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getAccess();
    } catch (e) {
      return rejectWithValue(msg(e, "Failed to fetch access"));
    }
  },
);

export const fetchMyBreak = createAsyncThunk<MyBreakState, void, { rejectValue: string }>(
  "ivr/fetchMyBreak",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getMyBreak();
    } catch (e) {
      return rejectWithValue(msg(e, "Failed to fetch break"));
    }
  },
);

export const fetchAccessMap = createAsyncThunk<AccessMapAgent[], void, { rejectValue: string }>(
  "ivr/fetchAccessMap",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getAccessMap();
    } catch (e) {
      return rejectWithValue(msg(e, "Failed to fetch agent mapping"));
    }
  },
);

export const fetchAgents = createAsyncThunk<AgentsResult, void, { rejectValue: string }>(
  "ivr/fetchAgents",
  async (_, { rejectWithValue }) => {
    try {
      return await api.getAgents();
    } catch (e) {
      return rejectWithValue(msg(e, "Failed to fetch agents"));
    }
  },
);

// ---------------- actions ----------------

export const changeMissedStatus = createAsyncThunk<
  { uid: string; status: FollowupStatus; note?: string },
  { uid: string; status: FollowupStatus; note?: string },
  { rejectValue: string }
>("ivr/changeMissedStatus", async ({ uid, status, note }, { rejectWithValue }) => {
  try {
    await api.patchMissedStatus(uid, status, note);
    return { uid, status, note };
  } catch (e) {
    return rejectWithValue(msg(e, "Failed to update status"));
  }
});

export const logMissedAttempt = createAsyncThunk<
  { uid: string; attemptCount: number; status: FollowupStatus },
  { uid: string; note?: string },
  { rejectValue: string }
>("ivr/logMissedAttempt", async ({ uid, note }, { rejectWithValue }) => {
  try {
    return await api.postMissedAttempt(uid, note);
  } catch (e) {
    return rejectWithValue(msg(e, "Failed to record attempt"));
  }
});

export const startMyBreak = createAsyncThunk<
  BreakActionResult,
  { agentId?: number; reason?: string },
  { rejectValue: string }
>("ivr/startMyBreak", async ({ agentId, reason }, { dispatch, rejectWithValue }) => {
  try {
    const r = await api.postStartBreak(agentId, reason);
    await dispatch(fetchMyBreak());
    return r;
  } catch (e) {
    return rejectWithValue(msg(e, "Failed to start break"));
  }
});

export const endMyBreak = createAsyncThunk<BreakActionResult, number | undefined, { rejectValue: string }>(
  "ivr/endMyBreak",
  async (agentId, { dispatch, rejectWithValue }) => {
    try {
      const r = await api.postEndBreak(agentId);
      await dispatch(fetchMyBreak());
      return r;
    } catch (e) {
      return rejectWithValue(msg(e, "Failed to end break"));
    }
  },
);

export const saveAgentLogins = createAsyncThunk<
  void,
  { agentId: number; staffIds: number[] },
  { rejectValue: string }
>("ivr/saveAgentLogins", async ({ agentId, staffIds }, { dispatch, rejectWithValue }) => {
  try {
    await api.putAgentLogins(agentId, staffIds);
    await dispatch(fetchAccessMap());
  } catch (e) {
    return rejectWithValue(msg(e, "Failed to save logins"));
  }
});

export const linkMyOperatorUsers = createAsyncThunk<
  Awaited<ReturnType<typeof api.postSyncMyOperator>>,
  string[],
  { rejectValue: string }
>("ivr/linkMyOperatorUsers", async (add, { dispatch, rejectWithValue }) => {
  try {
    const r = await api.postSyncMyOperator(add);
    await dispatch(fetchAccessMap());
    await dispatch(fetchAgents());
    return r;
  } catch (e) {
    return rejectWithValue(msg(e, "Failed to link MyOperator users"));
  }
});

export const saveAgentMapping = createAsyncThunk<
  void,
  { id: number; staffId: number | null; staffName: string | null },
  { rejectValue: string }
>("ivr/saveAgentMapping", async ({ id, staffId, staffName }, { rejectWithValue }) => {
  try {
    await api.putAgent(id, { staffId, staffName });
  } catch (e) {
    return rejectWithValue(msg(e, "Failed to save mapping"));
  }
});

export const runSync = createAsyncThunk<
  SyncResult,
  { from: string; to: string } | undefined,
  { rejectValue: string }
>("ivr/runSync", async (range, { rejectWithValue }) => {
  try {
    return await api.postSync(range);
  } catch (e) {
    return rejectWithValue(msg(e, "Sync failed"));
  }
});

// ---------------- slice ----------------

const ivrSlice = createSlice({
  name: "ivr",
  initialState,
  reducers: {
    clearIvrError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const track = <T extends { pending: any; fulfilled: any; rejected: any }>(
      thunk: T,
      key: Key,
      onOk?: (state: IvrState, payload: any) => void,
    ) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading[key] = true;
        })
        .addCase(thunk.fulfilled, (state, action: any) => {
          state.loading[key] = false;
          onOk?.(state, action.payload);
        })
        .addCase(thunk.rejected, (state, action: any) => {
          state.loading[key] = false;
          state.error = action.payload || action.error?.message || "Request failed";
        });
    };

    track(fetchCalls, "calls", (s, p) => {
      s.calls = p;
    });
    track(fetchSummary, "summary", (s, p) => {
      s.summary = p;
    });
    track(fetchMissed, "missed", (s, p) => {
      s.missed = p;
    });
    track(fetchBreakReport, "breaks", (s, p) => {
      s.breaks = p;
    });
    track(fetchAgents, "agents", (s, p) => {
      s.agents = p;
    });
    track(runSync, "sync", (s, p) => {
      s.lastSync = p;
    });

    // Missed-call status is computed on the server (automatic), so the page
    // refetches after a manual change instead of patching rows locally.
    track(changeMissedStatus, "action");
    track(logMissedAttempt, "action");

    track(fetchAccess, "action", (s, p) => {
      s.access = p;
    });
    track(fetchMyBreak, "action", (s, p) => {
      s.me = p;
    });
    track(fetchAccessMap, "map", (s, p) => {
      s.accessMap = p;
    });
    track(startMyBreak, "action");
    track(endMyBreak, "action");
    track(saveAgentLogins, "map");
    track(linkMyOperatorUsers, "map");
    track(saveAgentMapping, "action");
  },
});

export const { clearIvrError } = ivrSlice.actions;
export default ivrSlice.reducer;
