import axiosInstance from "@/lib/axioInstance";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { ApiResponse } from "@/types/api";
import type {
  AccessMapAgent,
  AgentsResult,
  AttemptRow,
  BreakActionResult,
  BreakReport,
  CallsResult,
  FollowupStatus,
  IvrFilters,
  IvrAccess,
  MissedResult,
  MyBreakState,
  MyOperatorSyncResult,
  StaffHit,
  SummaryResult,
  SyncResult,
} from "./ivr.types";

// Drop empty values so the backend uses its defaults.
const clean = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

const filterParams = (f: IvrFilters) => ({
  from: f.from,
  to: f.to,
  agent: f.agent,
  direction: f.direction,
  hours: f.hours,
  search: f.search,
});

export const getCalls = async (
  f: IvrFilters,
  page: number,
  limit = 25,
): Promise<CallsResult> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<CallsResult>>("/ivr/calls", {
      params: clean({ ...filterParams(f), page, limit }),
    });
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch calls"));
  }
};

export const getSummary = async (f: IvrFilters): Promise<SummaryResult> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<SummaryResult>>("/ivr/summary", {
      params: clean(filterParams(f)),
    });
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch summary"));
  }
};

export const getMissed = async (
  f: IvrFilters,
  page: number,
  status: FollowupStatus | "",
  limit = 25,
): Promise<MissedResult> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<MissedResult>>("/ivr/missed", {
      // direction is fixed to incoming on the server
      params: clean({ ...filterParams(f), direction: "", status, page, limit }),
    });
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch missed calls"));
  }
};

export const patchMissedStatus = async (
  uid: string,
  status: FollowupStatus,
  note?: string,
): Promise<{ uid: string; status: FollowupStatus }> => {
  try {
    const { data } = await axiosInstance.patch<
      ApiResponse<{ uid: string; status: FollowupStatus }>
    >(`/ivr/missed/${encodeURIComponent(uid)}/status`, { status, note });
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to update status"));
  }
};

export const postMissedAttempt = async (
  uid: string,
  note?: string,
): Promise<{ uid: string; attemptCount: number; status: FollowupStatus }> => {
  try {
    const { data } = await axiosInstance.post<
      ApiResponse<{ uid: string; attemptCount: number; status: FollowupStatus }>
    >(`/ivr/missed/${encodeURIComponent(uid)}/attempt`, { note });
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to record attempt"));
  }
};

export const getMissedAttempts = async (uid: string): Promise<AttemptRow[]> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<AttemptRow[]>>(
      `/ivr/missed/${encodeURIComponent(uid)}/attempts`,
    );
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch attempts"));
  }
};

export const getAccess = async (): Promise<IvrAccess> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<IvrAccess>>("/ivr/access");
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch access"));
  }
};

export const getMyBreak = async (): Promise<MyBreakState> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<MyBreakState>>("/ivr/breaks/me");
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch break"));
  }
};

export const postStartBreak = async (
  agentId: number | undefined,
  reason?: string,
): Promise<BreakActionResult> => {
  try {
    const { data } = await axiosInstance.post<ApiResponse<BreakActionResult>>("/ivr/breaks/start", {
      agentId,
      reason,
    });
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to start break"));
  }
};

export const postEndBreak = async (agentId?: number): Promise<BreakActionResult> => {
  try {
    const { data } = await axiosInstance.post<ApiResponse<BreakActionResult>>("/ivr/breaks/end", {
      agentId,
    });
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to end break"));
  }
};

export const getBreakReport = async (f: IvrFilters): Promise<BreakReport> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<BreakReport>>("/ivr/breaks", {
      params: clean({ from: f.from, to: f.to }),
    });
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch break report"));
  }
};

export const getAgents = async (): Promise<AgentsResult> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<AgentsResult>>("/ivr/agents");
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch agents"));
  }
};

export const putAgent = async (
  id: number,
  body: { staffId: number | null; staffName: string | null },
): Promise<void> => {
  try {
    await axiosInstance.put(`/ivr/agents/${id}`, body);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to update agent"));
  }
};

export const postSync = async (range?: { from: string; to: string }): Promise<SyncResult> => {
  try {
    const { data } = await axiosInstance.post<ApiResponse<SyncResult>>("/ivr/sync", range ?? {});
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Sync failed"));
  }
};

export const getAccessMap = async (): Promise<AccessMapAgent[]> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<AccessMapAgent[]>>("/ivr/access-map");
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch agent mapping"));
  }
};

export const putAgentLogins = async (agentId: number, staffIds: number[]): Promise<void> => {
  try {
    await axiosInstance.put(`/ivr/agents/${agentId}/logins`, { staffIds });
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to save logins"));
  }
};

export const getStaffSearch = async (q: string): Promise<StaffHit[]> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<StaffHit[]>>("/ivr/staff-search", {
      params: { q },
    });
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Staff search failed"));
  }
};

export const postSyncMyOperator = async (add: string[]): Promise<MyOperatorSyncResult> => {
  try {
    const { data } = await axiosInstance.post<ApiResponse<MyOperatorSyncResult>>(
      "/ivr/agents/sync-myoperator",
      { add },
    );
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to link MyOperator users"));
  }
};
