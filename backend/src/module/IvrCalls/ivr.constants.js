// Working window used by the "working hours" / "non-working hours" filters.
// Times are IST wall-clock (ivr_call_logs.call_time is stored in IST).
export const WORK_START = "10:00:00";
export const WORK_END = "21:30:00";

// Manual follow-up status of a missed call.
//   missed    -> red     (default, nobody has reached the customer)
//   trying    -> orange  (agent attempted a callback, not connected yet)
//   connected -> green   (agent reached the customer)
export const FOLLOWUP_STATUS = ["missed", "trying", "connected"];

export const DIRECTIONS = ["incoming", "outgoing"];
export const HOURS_FILTERS = ["all", "working", "non_working"];

// Default background sync interval and first-run backfill.
export const SYNC_INTERVAL_MS = Number(process.env.IVR_SYNC_INTERVAL_MS) || 5 * 60 * 1000;
export const BACKFILL_DAYS = Number(process.env.IVR_BACKFILL_DAYS) || 7;

export const MYOPERATOR_BASE_URL =
  process.env.MYOPERATOR_BASE_URL || "https://developers.myoperator.co";
