import { Camera, IdCard, CreditCard, FileCheck, type LucideIcon } from "lucide-react";
import type { CustomerFormData, DocKey, FileState, Option, SectionTheme } from "./types";

export const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";
export const DEFAULT_COUNTRY_CODE = "+91";

/* Explicit class strings: Tailwind dynamic class names purge kar deta hai */
export const THEMES: Record<"info" | "address" | "docs", SectionTheme> = {
  info: {
    section: "bg-violet-50/70 border-violet-300",
    heading: "text-violet-900 border-violet-200",
    badge: "bg-violet-600",
    icon: "text-violet-500",
    field:
      "border-violet-300 hover:border-violet-400 focus:border-violet-600 focus:ring-2 focus:ring-violet-200",
    wrap: "border-violet-300 hover:border-violet-400 focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-200",
  },
  address: {
    section: "bg-emerald-50/70 border-emerald-300",
    heading: "text-emerald-900 border-emerald-200",
    badge: "bg-emerald-600",
    icon: "text-emerald-500",
    field:
      "border-emerald-300 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200",
    wrap: "border-emerald-300 hover:border-emerald-400 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-200",
  },
  docs: {
    section: "bg-amber-50/70 border-amber-300",
    heading: "text-amber-900 border-amber-200",
    badge: "bg-amber-600",
    icon: "text-amber-500",
    field:
      "border-amber-300 hover:border-amber-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-200",
    wrap: "border-amber-300 hover:border-amber-400 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-200",
  },
};

/* Initial state */
export const initialFormState: CustomerFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  alternateCountryCode: DEFAULT_COUNTRY_CODE,
  alternatePhone: "",
  countryName: "",
  customerType: "",
  customerCategoryType: "",
  companyName: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export const initialFiles: FileState = {
  passportPhoto: null,
  adhar: null,
  panDoc: null,
  gstDoc: null,
};

/* Dropdown options */
export const CUSTOMER_CATEGORIES: Option[] = [
  { value: "Personal", label: "Personal" },
  { value: "Corporate", label: "Corporate" },
  { value: "Travel Agent", label: "Agent" },
];

export const CATEGORY_OPTIONS: Record<string, string[]> = {
  Personal: ["Personal"],
  Corporate: [
    "Company",
    "NGO",
    "Educational Institution",
    "Sporting Company",
    "Government Organization",
    "Other",
  ],
  "Travel Agent": [
    "Travel Agenct", // NOTE: typo hai, lekin DB me yahi value ho sakti hai — check karke hi badalna
    "Tour Operator",
    "Hotel",
    "Wedding Planner",
    "DMC",
  ],
};

/* Input rules */
export const NUMERIC_FIELDS = ["phone", "alternatePhone", "pincode"];

export const MAX_LENGTHS: Partial<Record<keyof CustomerFormData, number>> = {
  firstName: 50,
  middleName: 50,
  lastName: 50,
  email: 100,
  phone: 10,
  alternatePhone: 15,
  pincode: 6,
  companyName: 100,
};

export const DOC_FIELDS: { key: DocKey; label: string; Icon: LucideIcon }[] = [
  { key: "passportPhoto", label: "Passport Photo", Icon: Camera },
  { key: "adhar", label: "Aadhaar Document", Icon: IdCard },
  { key: "panDoc", label: "PAN Document", Icon: CreditCard },
  { key: "gstDoc", label: "GST Document", Icon: FileCheck },
];
