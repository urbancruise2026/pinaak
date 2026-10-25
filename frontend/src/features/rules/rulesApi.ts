import axiosInstance from "@/lib/axioInstance";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { ApiResponse } from "@/types/api";
import type { RuleEntry, RulePayload, ZoneAdvisor } from "./rules.types";

export type { RuleEntry, ZoneAdvisor };
export type CreateRulePayload = RulePayload; // keeps existing imports working

export interface AdvisorsByZoneResponse {
  zoneAdvisors: ZoneAdvisor[];
}

export const getAdvisorsByZone = async (): Promise<ZoneAdvisor[]> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<ZoneAdvisor[]>>(
      "/rule/advisors-by-zone",
    );
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch advisors"));
  }
};

export const createRule = async (payload: RulePayload): Promise<RuleEntry> => {
  try {
    const { data } = await axiosInstance.post<ApiResponse<RuleEntry>>("/rule", payload);
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to create rule"));
  }
};

export const getRules = async (): Promise<RuleEntry[]> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<RuleEntry[]>>("/rule/getrule");
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch rules"));
  }
};

export const updateRule = async (id: number, payload: RulePayload): Promise<RuleEntry> => {
  try {
    const { data } = await axiosInstance.put<ApiResponse<RuleEntry>>(`/rule/${id}`, payload);
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to update entry"));
  }
};

export const deleteRule = async (id: number): Promise<{ id: number }> => {
  try {
    const { data } = await axiosInstance.delete<ApiResponse<{ id: number }>>(`/rule/delete/${id}`);
    return data.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to delete entry"));
  }
};