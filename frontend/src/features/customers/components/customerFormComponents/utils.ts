import { DEFAULT_COUNTRY_CODE } from "./constants";
import type { CustomerFormData } from "./types";

/* ---------------- Validation ---------------- */
export type FormErrors = Partial<Record<string, string>>;

const REQUIRED_FIELDS: Partial<Record<keyof CustomerFormData, string>> = {
  firstName: "First name",
  lastName: "Last name",
  phone: "Phone",
  address: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
  customerType: "Customer category",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCustomer = (d: CustomerFormData): FormErrors => {
  const e: FormErrors = {};

  (Object.keys(REQUIRED_FIELDS) as (keyof CustomerFormData)[]).forEach((k) => {
    if (!String(d[k] ?? "").trim()) e[k] = `${REQUIRED_FIELDS[k]} is required`;
  });

  if (d.email.trim() && !EMAIL_RE.test(d.email))
    e.email = "Enter a valid email address";
  if (d.phone.trim() && !/^\d{10}$/.test(d.phone))
    e.phone = "Phone must be exactly 10 digits";
  if (d.alternatePhone.trim() && !/^\d{6,15}$/.test(d.alternatePhone))
    e.alternatePhone = "Enter a valid alternate phone number";
  if (d.pincode.trim() && !/^\d{6}$/.test(d.pincode))
    e.pincode = "Pincode must be exactly 6 digits";
  if (d.customerType && !d.customerCategoryType)
    e.customerCategoryType = "Customer type is required";

  return e;
};

/* ---------------- Mapping ---------------- */
/**
 * Backend customer / search result -> form data.
 * Pehle ye mapping 2 jagah alag-alag likhi thi (edit load + search select).
 */
export const mapCustomerToForm = (c: any): CustomerFormData => {
  const fullName =
    c.customerName || `${c.firstName || ""} ${c.lastName || ""}`.trim();
  const parts = fullName.split(/\s+/).filter(Boolean);

  return {
    firstName: c.firstName || parts[0] || "",
    middleName: c.middleName || "",
    lastName: c.lastName || parts.slice(1).join(" ") || "",
    email: c.customerEmail || c.email || "",
    phone: c.customerPhone || c.phone || "",
    alternateCountryCode:
      c.alternateCountryCode ||
      c.alternate_country_code ||
      DEFAULT_COUNTRY_CODE,
    alternatePhone: c.alternatePhone || "",
    countryName: c.countryName || "",
    customerType: c.customerType || "",
    customerCategoryType: c.customerCategoryType || "",
    companyName: c.companyName || "",
    address: c.customerAddress || c.address || "",
    city: c.customerCity || c.city || "",
    state: c.state || "",
    pincode: c.pincode || "",
    stateId: c.stateId ? Number(c.stateId) : undefined,
    cityId: c.cityId ? Number(c.cityId) : undefined,
  };
};

/* Form data -> API payload (backend ke duplicate keys yahin handle hote hain) */
export const buildCustomerPayload = (d: CustomerFormData) => ({
  firstName: d.firstName.trim(),
  middleName: d.middleName.trim(),
  lastName: d.lastName.trim(),
  customerEmail: d.email.trim(),
  customerPhone: d.phone.trim(),
  alternatePhone: d.alternatePhone.trim(),
  alternateCountryCode: d.alternateCountryCode,
  alternate_country_code: d.alternateCountryCode,
  address: d.address.trim(),
  customerAddress: d.address.trim(),
  state: d.state,
  city: d.city,
  customerCity: d.city,
  pincode: d.pincode.trim(),
  stateId: d.stateId || null,
  cityId: d.cityId || null,
  companyName: d.companyName.trim(),
  customerType: d.customerType,
  customerCategoryType: d.customerCategoryType,
  countryName: d.countryName,
});

/* ---------------- Misc ---------------- */
export const getErrorMessage = (error: any): string =>
  typeof error === "string"
    ? error
    : error?.message || error?.error || "Operation failed. Please try again.";

export const scrollToTop = () =>
  window.scrollTo({ top: 0, behavior: "smooth" });
