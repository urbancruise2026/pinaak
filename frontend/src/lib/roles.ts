export const normalizeRole = (role: unknown): string => {
  const value = String(role ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const roleMap: Record<string, string> = {
    "super admin": "superadmin",
    superadmin: "superadmin",
    "city manager": "city manager",
    "team leader": "team leader",
    "team leader sales": "team leader-sales",
    "pre sales executive": "pre-sales executive",
    "pre-sales executive": "pre-sales executive",
    "seo executive": "seo executive",
    "seo tl": "seo tl",
    "travel advisor": "travel advisor",
    manager: "manager",
    admin: "admin",
    sales: "sales",
    bdm: "bdm",
    presales: "presales",
    presale: "presale",
  };

  return roleMap[value] ?? value;
};

export const getEffectiveRole = (
  roleName: unknown,
  accessRole: unknown,
): string => {
  const roleNameValue = String(roleName ?? "").trim();
  if (roleNameValue !== "") return roleNameValue;
  return String(accessRole ?? "").trim();
};

export function resolveRole(currentUser: unknown): string {
  const raw = (currentUser as any) ?? {};
  const data = raw?.data ?? raw;
  return normalizeRole(
    getEffectiveRole(
      raw?.role_name ?? data?.role_name,
      raw?.access_role ?? data?.access_role,
    ),
  );
}

export const MASTER_ALLOWED_ROLES = [
  "superadmin",
  "admin",
  "manager",
  "city manager",
  "travel advisor",
];

export const MASTER_ITEM_ALLOWED_ROLES: Record<string, string[]> = {
  "customer-personal": ["superadmin", "admin", "manager", "city manager"],
  "customer-table": [
    "superadmin",
    "admin",
    "manager",
    "city manager",
    "travel advisor",
  ],
  "customer-history": ["superadmin", "admin", "manager", "city manager"],
  vendor: ["superadmin", "admin", "manager", "city manager"],
  "vendor-table": ["superadmin", "admin", "manager", "city manager"],
  vehicles: ["superadmin", "admin", "city manager"],
  "vehicle-manager": ["superadmin", "admin", "city manager"],
  "vehicle-category": ["superadmin", "city manager", "travel advisor"],
  driver: ["superadmin", "admin", "manager", "city manager"],
  "driver-table": ["superadmin", "admin", "manager", "city manager"],
  employee: ["superadmin", "admin", "manager", "city manager"],
  "corporate-form": ["superadmin", "admin", "manager", "city manager"],
  "quotation-pdf": ["superadmin", "admin", "manager", "city manager"],
  "rate-quotation": ["superadmin", "admin", "manager", "city manager"],
  "card-reel": ["superadmin", "admin", "manager", "city manager"],
  "country-code": ["superadmin", "admin", "manager", "city manager"],
  "corporate-event": ["superadmin", "admin", "manager", "city manager"],
  hr: ["superadmin", "admin", "manager", "city manager"],
  city: ["superadmin", "admin", "manager", "city manager"],
  zone: ["superadmin", "admin", "manager", "city manager"],
  region: ["superadmin", "admin", "manager", "city manager"],
};