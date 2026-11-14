// Working window used by the "working hours" / "non-working hours" filters.
// Times are IST wall-clock (ivr_call_logs.call_time is stored in IST).
export const WORK_START = "10:00:00";
export const WORK_END = "21:30:00";

// Manual follow-up status of a missed call.
//   missed    -> red     (default, nobody has reached the customer)
//   trying    -> orange  (agent attempted a callback, not connected yet)
//   connected -> green   (agent reached the customer)
export const FOLLOWUP_STATUS = ["missed", "trying", "connected"];

// MyOperator /search returns numeric codes. They are NOT documented, so they
// are filled in from GET /ivr/debug/codes. Unknown codes are saved as
// "event_<n>" / "status_<n>" and fixed by a re-sync once mapped here.
//   EVENT_MAP:  raw `event`  -> "incoming" | "outgoing"
//   STATUS_MAP: raw `status` -> "connected" | "missed" | "voicemail"
export const EVENT_MAP = { 1: "incoming", 2: "outgoing" };
export const STATUS_MAP = { 1: "connected", 2: "missed", 3: "voicemail" };

// IVR "admin" rights (agent mapping, MyOperator linking, ending others' breaks)
// beyond super admin / admin: these roles and these staff ids.
export const MANAGE_ROLE_KEYS = ["seotl"]; // role "SEO TL"
export const MANAGE_STAFF_IDS = [62];

export const DIRECTIONS = ["incoming", "outgoing"];
export const HOURS_FILTERS = ["all", "working", "non_working"];

// Default background sync interval and first-run backfill.
export const SYNC_INTERVAL_MS = Number(process.env.IVR_SYNC_INTERVAL_MS) || 5 * 60 * 1000;
export const BACKFILL_DAYS = Number(process.env.IVR_BACKFILL_DAYS) || 7;

export const MYOPERATOR_BASE_URL =
  process.env.MYOPERATOR_BASE_URL || "https://developers.myoperator.co";
