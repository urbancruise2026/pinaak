import type { FollowupStatus, IvrFilters } from "./ivr.types";

// Today in IST as YYYY-MM-DD (the browser may be in any time zone).
export const todayIST = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export const defaultFilters = (): IvrFilters => {
  const t = todayIST();
  return { from: t, to: t, agent: "", direction: "", hours: "all", search: "" };
};

// 125 -> "2:05", 3700 -> "1:01:40"
export const formatDuration = (sec: number): string => {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(r).padStart(2, "0")}`;
};

// minutes -> "1h 05m" / "42m"
export const formatMinutes = (min: number): string => {
  const m = Math.max(0, Math.round(Number(min) || 0));
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${String(m % 60).padStart(2, "0")}m` : `${m}m`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-11-11 13:56:43" -> { date: "11 Nov", time: "13:56" }
export const splitDateTime = (value: string | null | undefined) => {
  if (!value) return { date: "-", time: "-" };
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  if (!m) return { date: value, time: "" };
  return { date: `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}`, time: `${m[4]}:${m[5]}` };
};

export const STATUS_LABEL: Record<FollowupStatus, string> = {
  missed: "Missed",
  trying: "Trying",
  connected: "Connected",
};

// red / orange / green, as requested
export const STATUS_STYLE: Record<
  FollowupStatus,
  { badge: string; dot: string; ring: string }
> = {
  missed: {
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    ring: "ring-red-300",
  },
  trying: {
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    ring: "ring-orange-300",
  },
  connected: {
    badge: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
    ring: "ring-green-300",
  },
};

// ---- role helpers (role comes from resolveRole() in lib/roles.ts) ----
// IVR admin rights (agent mapping etc.) for SEO TL + these staff ids.
// Keep in sync with MANAGE_ROLE_KEYS / MANAGE_STAFF_IDS in the backend
// (ivr.constants.js). The backend is the real gatekeeper.
export const MANAGE_STAFF_IDS: number[] = [62];

export const isPresalesRole = (role: string): boolean =>
  role.includes("presale") || role.includes("pre-sale") || role.includes("pre sale");

const isSeoTl = (role: string) => role.replace(/[\s_-]+/g, "") === "seotl";

export const canManageIvr = (role: string, userId?: number | null): boolean =>
  role === "superadmin" ||
  role === "admin" ||
  isSeoTl(role) ||
  (userId != null && MANAGE_STAFF_IDS.includes(Number(userId)));

// Pre-Sales: department / sub-department text like "Pre Sales", or a pre-sales
// role. Plain "Sales" does not match.
export const isPresalesUser = (role: string, department = ""): boolean =>
  /\bpre[\s_-]*sales?\b/.test(department.toLowerCase()) || role.replace(/[\s_-]+/g, "").includes("presale");

// Admins, the SEO department and Team Leaders (plus the staff ids above).
// `department` = department / sub-department text of the user (any case).
export const canViewIvr = (role: string, userId?: number | null, department = ""): boolean =>
  canManageIvr(role, userId) ||
  role.includes("team leader") ||
  role.replace(/[\s_-]+/g, "").includes("seo") ||
  /\bseo\b/.test(department.toLowerCase());

// Pre-Sales get a limited view (Missed calls + All calls); the rest is "full".
export const ivrAccessLevel = (
  role: string,
  userId?: number | null,
  department = "",
): "full" | "limited" | "none" =>
  canViewIvr(role, userId, department) ? "full" : isPresalesUser(role, department) ? "limited" : "none";
