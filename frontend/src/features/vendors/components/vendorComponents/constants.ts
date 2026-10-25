import {
  UserRound,
  UserCog,
  Calculator,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Receipt,
  Hash,
  MapPin,
  Warehouse,
  Truck,
  Camera,
  IdCard,
  FileCheck,
  Store,
  type LucideIcon,
} from "lucide-react";

import type {
  DocKey,
  FileState,
  SectionTheme,
  VendorFormData,
} from "./types";

// ─────────────────────────────────────────────
// Grid
// ─────────────────────────────────────────────

export const GRID =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";

// ─────────────────────────────────────────────
// Themes
// ─────────────────────────────────────────────

export const THEMES: Record<
  "vendor" | "contact" | "company" | "docs",
  SectionTheme
> = {
  vendor: {
    section:
      "bg-violet-50/70 border-violet-300",
    heading:
      "text-violet-900 border-violet-200",
    badge: "bg-violet-600",
    icon: "text-violet-500",
    field:
      "border-violet-300 hover:border-violet-400 focus:border-violet-600 focus:ring-2 focus:ring-violet-200",
  },

  contact: {
    section:
      "bg-sky-50/70 border-sky-300",
    heading:
      "text-sky-900 border-sky-200",
    badge: "bg-sky-600",
    icon: "text-sky-500",
    field:
      "border-sky-300 hover:border-sky-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200",
  },

  company: {
    section:
      "bg-emerald-50/70 border-emerald-300",
    heading:
      "text-emerald-900 border-emerald-200",
    badge: "bg-emerald-600",
    icon: "text-emerald-500",
    field:
      "border-emerald-300 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200",
  },

  docs: {
    section:
      "bg-amber-50/70 border-amber-300",
    heading:
      "text-amber-900 border-amber-200",
    badge: "bg-amber-600",
    icon: "text-amber-500",
    field:
      "border-amber-300 hover:border-amber-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-200",
  },
};

// ─────────────────────────────────────────────
// Initial Form State
// ─────────────────────────────────────────────

export const initialFormState: VendorFormData = {
  id: undefined,

  // Login / Vendor
  username: "",
  password: "",
  name: "",
  shortName: "",
  vendor: "",
  code: "",

  // Basic Contact
  email: "",
  phone: "",
  address: "",
  panNumber: "",
  aadhaarNumber: "",

  // Owner
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",

  // Manager 1
  managerName1: "",
  managerPhone1: "",
  managerEmail1: "",

  // Manager 2
  managerName2: "",
  managerPhone2: "",
  managerEmail2: "",

  // Company
  companyName: "",
  companyType: "",
  companyPanNumber: "",
  companyRegisteredNumber: "",
  gstNumber: "",
  businessNumber: "",

  registeredAddress: "",
  garageAddress: "",
  garagePhone: "",

  cooperativeName: "",
  cooperativeNumber: "",

  // Personal Information
  personalInfo: {
    personalAddress: "",
    personalCity: "",
    personalState: "",
  },

  // Company Information
  companyinfo: {
    companyState: "",
    companyCity: "",
  },

  // Documents
  passportPhoto: "",
  panDoc: "",
  gstDoc: "",
  vendorProof: "",
  vehicleDoc: "",
};

// ─────────────────────────────────────────────
// Initial Files
// ─────────────────────────────────────────────

export const initialFiles: FileState = {
  passportPhoto: null,
  panDoc: null,
  gstDoc: null,
  vendorProof: null,
  vehicleDoc: null,
};

// ─────────────────────────────────────────────
// Company Types
// ─────────────────────────────────────────────

export const COMPANY_TYPES = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Pvt Ltd",
  "Public Ltd",
  "Other",
];

// ─────────────────────────────────────────────
// Max Lengths
// ─────────────────────────────────────────────

export const MAX_LENGTHS: Partial<
  Record<string, number>
> = {
  name: 100,
  username: 50,
  shortName: 30,
  gstNumber: 15,
  ownerPhone: 10,
  managerPhone1: 10,
  managerPhone2: 10,
  garagePhone: 10,
};

// ─────────────────────────────────────────────
// Field Config
// ─────────────────────────────────────────────

export interface FieldConfig {
  name: keyof VendorFormData;
  label: string;
  Icon: LucideIcon;
  type?: "text" | "tel" | "email";
}

// ─────────────────────────────────────────────
// Contact Fields
// ─────────────────────────────────────────────

export const CONTACT_FIELDS: FieldConfig[] = [
  {
    name: "ownerName",
    label: "Owner Name",
    Icon: UserRound,
  },
  {
    name: "ownerPhone",
    label: "Owner Phone",
    type: "tel",
    Icon: Phone,
  },
  {
    name: "ownerEmail",
    label: "Owner Email",
    type: "email",
    Icon: Mail,
  },
  {
    name: "managerName1",
    label: "Ops Manager",
    Icon: UserCog,
  },
  {
    name: "managerPhone1",
    label: "Ops Mgr Number",
    type: "tel",
    Icon: Phone,
  },
  {
    name: "managerEmail1",
    label: "Ops Manager Email",
    type: "email",
    Icon: Mail,
  },
  {
    name: "managerName2",
    label: "Accountant Name",
    Icon: Calculator,
  },
  {
    name: "managerPhone2",
    label: "Accountant Phone",
    type: "tel",
    Icon: Phone,
  },
  {
    name: "managerEmail2",
    label: "Accountant Email",
    type: "email",
    Icon: Mail,
  },
];

// ─────────────────────────────────────────────
// Company Fields
// ─────────────────────────────────────────────

export const COMPANY_FIELDS: FieldConfig[] = [
  {
    name: "companyPanNumber",
    label: "Company PAN",
    Icon: CreditCard,
  },
  {
    name: "companyRegisteredNumber",
    label: "Registration Number",
    Icon: FileText,
  },
  {
    name: "gstNumber",
    label: "GST Number",
    Icon: Receipt,
  },
  {
    name: "businessNumber",
    label: "Business Number",
    Icon: Hash,
  },
  {
    name: "registeredAddress",
    label: "Registered Address",
    Icon: MapPin,
  },
  {
    name: "garageAddress",
    label: "Garage Address",
    Icon: Warehouse,
  },
  {
    name: "garagePhone",
    label: "Garage Phone",
    type: "tel",
    Icon: Phone,
  },
  {
    name: "cooperativeName",
    label: "Fleet Details",
    Icon: Truck,
  },
];

// ─────────────────────────────────────────────
// Document Fields
// ─────────────────────────────────────────────

export const DOC_FIELDS: {
  key: DocKey;
  label: string;
  Icon: LucideIcon;
}[] = [
  {
    key: "passportPhoto",
    label: "Passport Photo",
    Icon: Camera,
  },
  {
    key: "panDoc",
    label: "PAN Card",
    Icon: IdCard,
  },
  {
    key: "gstDoc",
    label: "GST Certificate",
    Icon: FileCheck,
  },
  {
    key: "vendorProof",
    label: "Ofc Photo Outside",
    Icon: Store,
  },
];
