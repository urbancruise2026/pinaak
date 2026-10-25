// src/features/rules/rules.types.ts
export type EntryType = "T20" | "T60";

export interface MonthLead {
  month: string;
  lead: number | string;
}

export interface ZoneAdvisor {
  id: number;
  name: string;
  shiftTiming: string;
}

/** Row as returned by the backend */
export interface RuleEntry {
  id: number;
  type: EntryType;
  months: string[];
  monthLeads: MonthLead[];
  advisorId: number;
  advisorName: string;
  shiftTiming: string;
  lead: number | string;
  overflow: string;
}

/** Body for POST /rule and PUT /rule/:id */
export type RulePayload = Omit<RuleEntry, "id" | "advisorName">;

/** UI-only form state */
export interface FormState {
  type: EntryType;
  monthLeads: MonthLead[];
  advisorId: number | null;
  shiftTiming: string;
}