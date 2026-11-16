export const txt = (v: unknown) =>
  v === null || v === undefined ? "" : String(v);

/* ---------- Verification ---------- */
export type VendorVerification = "pending" | "verified" | "rejected";

export const VERIFICATION_OPTIONS: {
  value: VendorVerification;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

/* ---------- Status ---------- */
export type VendorStatus =
  | "applied"
  | "approved"
  | "rejected"
  | "active"
  | "inactive"
  | "suspended"
  | "blocked";

export const STATUS_OPTIONS: {
  value: VendorStatus;
  label: string;
  cls: string;
}[] = [
  {
    value: "applied",
    label: "Applied",
    cls: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    value: "approved",
    label: "Approved",
    cls: "border-teal-200 bg-teal-50 text-teal-700",
  },
  {
    value: "rejected",
    label: "Rejected",
    cls: "border-rose-200 bg-rose-50 text-rose-700",
  },
  {
    value: "active",
    label: "Active",
    cls: "border-green-200 bg-green-50 text-green-700",
  },
  {
    value: "inactive",
    label: "Inactive",
    cls: "border-slate-200 bg-slate-100 text-slate-600",
  },
  {
    value: "suspended",
    label: "Suspended",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "blocked",
    label: "Blocked",
    cls: "border-red-200 bg-red-50 text-red-700",
  },
];

/* ---------- Getters ---------- */
export const getStatus = (v: any): VendorStatus => {
  const s = txt(v.status).toLowerCase();
  return (
    STATUS_OPTIONS.some((o) => o.value === s) ? s : "applied"
  ) as VendorStatus;
};

export const getVendorCode = (v: any) =>
  txt(v.vender_code || v.venderCode || v.vendor_code) || "—";
export const getVendorName = (v: any) => txt(v.name || v.vendor_name) || "—";
export const getEmail = (v: any) => txt(v.email || v.vendor_email) || "";
export const getPhone = (v: any) => txt(v.phone || v.mobile) || "";
export const getCompanyName = (v: any) =>
  txt(v.company_name || v.companyName) || "—";
export const getCompanyType = (v: any) =>
  txt(v.company_type || v.companyType) || "";
export const getGstNumber = (v: any) => txt(v.gst_number || v.gstNumber) || "—";
export const getOwnerName = (v: any) => txt(v.owner_name || v.ownerName) || "—";
export const getCity = (v: any) =>
  txt(v.personal_city || v.personalInfo?.personalCity);
export const getState = (v: any) =>
  txt(v.personal_state || v.personalInfo?.personalState);
export const getVerification = (v: any) => txt(v.verification).toLowerCase();
export const isVerified = (v: any) =>
  ["verified", "approved"].includes(getVerification(v));

/* ---------- Rating (MOCK, backend rating aane tak) ---------- */
const MOCK_RATINGS = [5, 4.5, 4, 3.5, 3, 4.5, 5, 4, 3.5, 4];
const USE_MOCK_RATING = true; // backend se rating aane par false kar do

export const getRating = (v: any): number | null => {
  const raw = v.rating ?? v.average_rating ?? v.avg_rating;

  if (raw !== null && raw !== undefined && raw !== "") {
    const n = Number(raw);
    if (!Number.isNaN(n)) return Math.min(5, Math.max(0, n));
  }

  if (!USE_MOCK_RATING) return null;

  const id = Number(v.id);
  const seed = Number.isNaN(id) ? 0 : id;
  return MOCK_RATINGS[seed % MOCK_RATINGS.length];
};
