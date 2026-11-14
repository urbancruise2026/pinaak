export type FollowupStatus = "missed" | "trying" | "connected";
export type HoursFilter = "all" | "working" | "non_working";
export type Direction = "incoming" | "outgoing";

export interface IvrFilters {
  from: string; // YYYY-MM-DD (IST)
  to: string;
  agent: string; // MyOperator agent name, "" = all
  direction: "" | Direction;
  hours: HoursFilter;
  search: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CallRow {
  uid: string;
  phone: string;
  callTime: string; // "YYYY-MM-DD HH:mm:ss" IST
  via: string | null;
  direction: Direction;
  response: string;
  missedBy: string | null;
  receivedBy: string | null;
  transferredTo: string | null;
  durationSec: number;
  recordingFile: string | null;
  isWorkingHours: number;
}

export interface CallsResult extends Paged<CallRow> {
  workingHours: { start: string; end: string };
}

export interface SummaryTotals {
  total: number;
  incoming: number;
  outgoing: number;
  incomingConnected: number;
  incomingMissedByAgent: number;
  droppedInIvr: number;
  voicemail: number;
  outgoingConnected: number;
  outgoingNotConnected: number;
  talkSec: number;
  workingHoursCalls: number;
  nonWorkingHoursCalls: number;
}

export interface AgentSummary {
  agentName: string;
  incomingAnswered: number;
  incomingMissed: number;
  incomingMissedNobodyAnswered: number;
  outgoingConnected: number;
  outgoingNotConnected: number;
  talkSec: number;
}

export interface SummaryResult {
  totals: SummaryTotals;
  agents: AgentSummary[];
}

export type AgentStateKind = "break" | "busy" | "available";

export interface AgentState {
  agent: string;
  state: AgentStateKind;
  detail: string;
}

export interface MissedRow {
  uid: string;
  phone: string;
  callTime: string;
  via: string | null;
  response: string;
  missedBy: string | null;
  durationSec: number;
  droppedInIvr: number;
  // effective status (automatic, with manual "connected" override)
  followupStatus: FollowupStatus;
  manualStatus: FollowupStatus | null;
  manualAttempts: number;
  note: string | null;
  updatedByName: string | null;
  updatedAt: string | null;
  // later calls to / from the same number
  customerCalls: number; // customer called us again (includes this call)
  customerConnected: number;
  customerConnectedAt: string | null;
  ourAttempts: number; // our agents called the customer
  ourConnected: number;
  ourConnectedAt: string | null;
  agentStates: AgentState[];
}

export interface MissedCounts {
  missed: number;
  trying: number;
  connected: number;
}

export interface MissedResult extends Paged<MissedRow> {
  counts: MissedCounts;
}

export interface BreakRow {
  id: number;
  agentId: number | null;
  agentName: string | null;
  pressedBy: string | null;
  startedAt: string;
  endedAt: string | null;
  isOpen: number;
  reason: string | null;
  moState: string | null;
  moError: string | null;
  durationMin: number;
  missedDuringBreak: number;
}

export interface BreakAgentSummary {
  agentId: number | null;
  agentName: string | null;
  breaks: number;
  totalMinutes: number;
  missedDuringBreak: number;
}

export interface BreakReport {
  items: BreakRow[];
  summary: BreakAgentSummary[];
}

export interface OpenBreak {
  id: number;
  agentId: number;
  staffName: string | null;
  startedAt: string;
  reason: string | null;
  moState: string | null;
}

export interface MyBreakAgent {
  id: number;
  name: string;
  linked: boolean; // has a MyOperator user id
  openBreak: OpenBreak | null;
}

export interface MyBreakState {
  syncEnabled: boolean;
  maxMinutes: number;
  agents: MyBreakAgent[];
}

export interface BreakActionResult {
  agent: string;
  moState: string | null;
  warning: string | null;
}

export interface IvrAccess {
  staffId: number;
  canManage: boolean;
  level: "full" | "limited" | "none";
}

export interface StaffHit {
  id: number;
  name: string;
  roleName: string | null;
}

export interface AccessMapAgent {
  id: number;
  ivrName: string;
  hasUuid: number;
  isActive: number;
  logins: { staffId: number; name: string; roleName: string | null }[];
}

export interface MyOperatorSyncResult {
  totalUsers: number;
  linked: { name: string; uuid: string }[];
  unmatched: { name: string; uuid: string }[];
}

export interface IvrAgent {
  id: number;
  ivrName: string;
  staffId: number | null;
  staffName: string | null;
  isActive: number;
  myoperatorUuid: string | null;
}

export interface PresalesStaff {
  id: number;
  name: string;
  aliasName: string | null;
  shortName: string | null;
}

export interface AgentsResult {
  agents: IvrAgent[];
  staff: PresalesStaff[];
}

export interface SyncResult {
  skipped?: boolean;
  reason?: string;
  from?: string;
  to?: string;
  fetched?: number;
  saved?: number;
  skippedEntries?: number;
}

export interface AttemptRow {
  id: number;
  staffId: number | null;
  staffName: string | null;
  note: string | null;
  attemptedAt: string;
}
