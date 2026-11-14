import { MANAGE_ROLE_KEYS, MANAGE_STAFF_IDS } from "./ivr.constants.js";

// "Pre-Sales Executive" -> "presalesexecutive", "SEO TL" -> "seotl"
export const roleKey = (u) =>
  String(u?.role_name ?? u?.role ?? u?.access_role ?? "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const isEmployee = (u) => u?.loginType === "employee";
export const isSuperAdmin = (u) => isEmployee(u) && roleKey(u) === "superadmin";
const isAdmin = (u) => isEmployee(u) && roleKey(u) === "admin";
const isTeamLeader = (u) => isEmployee(u) && roleKey(u).includes("teamleader");

// SEO department: role like "SEO TL" / "SEO Executive", or a department /
// sub-department whose name contains "seo".
const isSeo = (u) => {
  if (!isEmployee(u)) return false;
  const text = [u?.department_name, u?.department, u?.subDepartment_name, u?.subDepartment]
    .map((v) => String(v ?? "").toLowerCase())
    .join(" ");
  return roleKey(u).includes("seo") || /\bseo\b/.test(text);
};

// Pre-Sales: department / sub-department like "Pre Sales" / "Pre-Sales" /
// "Presales", or a Pre-Sales role. Plain "Sales" does NOT match.
const isPresales = (u) => {
  if (!isEmployee(u)) return false;
  const text = [u?.department_name, u?.department, u?.subDepartment_name, u?.subDepartment]
    .map((v) => String(v ?? "").toLowerCase())
    .join(" | ");
  return /\bpre[\s_-]*sales?\b/.test(text) || roleKey(u).includes("presale");
};

// Admin functions: agent mapping, MyOperator linking, ending other people's
// breaks. Super admin, admin, SEO TL, and the staff ids in MANAGE_STAFF_IDS.
export const canManage = (u) =>
  isEmployee(u) &&
  (isSuperAdmin(u) ||
    isAdmin(u) ||
    MANAGE_ROLE_KEYS.includes(roleKey(u)) ||
    MANAGE_STAFF_IDS.includes(Number(u?.id)));

// Who can open the IVR reports: admins, the SEO department and Team Leaders
// (plus the staff ids that can manage).
export const canView = (u) =>
  isEmployee(u) && (canManage(u) || isSeo(u) || isTeamLeader(u));

// "full" = admin / SEO / TL, "limited" = Pre-Sales (Missed calls + All calls
// only), "none" = no access.
export const accessLevel = (u) => (canView(u) ? "full" : isPresales(u) ? "limited" : "none");

export const requireAccess = (req, res, next) => {
  if (accessLevel(req.user) === "none") {
    return res.status(403).json({ message: "You do not have access to IVR reports" });
  }
  next();
};

export const requireFull = (req, res, next) => {
  if (accessLevel(req.user) !== "full") {
    return res.status(403).json({ message: "Not available for your role" });
  }
  next();
};

export const requireManage = (req, res, next) => {
  if (!canManage(req.user)) {
    return res.status(403).json({ message: "Only IVR admins can do this" });
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!isSuperAdmin(req.user)) return res.status(403).json({ message: "Super admin only" });
  next();
};
