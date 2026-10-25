import type { RootState } from "@/store/store";

// ─────────────────────────────────────────────
// Form Mode
// ─────────────────────────────────────────────

export type FormMode = "create" | "edit" | "view";

// ─────────────────────────────────────────────
// City / State
// ─────────────────────────────────────────────

export interface CityItem {
  id: number | string;
  cityName: string;
}

export interface StateItem {
  id: number | string;
  stateName: string;
}

// ─────────────────────────────────────────────
// App Root State
// ─────────────────────────────────────────────

export type AppRootState = RootState & {
  stateCity?: {
    cities: CityItem[];
  };
};

// ─────────────────────────────────────────────
// Vendor Form Data
// ─────────────────────────────────────────────

export interface VendorFormData {
  id?: number;

  // Login / Vendor
  username: string;
  password: string;
  name: string;
  shortName: string;
  vendor?: string;
  code?: string;

  // Basic Contact
  email: string;
  phone: string;
  address: string;
  panNumber: string;
  aadhaarNumber: string;

  // Owner
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;

  // Manager 1
  managerName1: string;
  managerPhone1: string;
  managerEmail1: string;

  // Manager 2
  managerName2: string;
  managerPhone2: string;
  managerEmail2: string;

  // Company
  companyName: string;
  companyType: string;
  companyPanNumber: string;
  companyRegisteredNumber: string;
  gstNumber: string;
  businessNumber: string;

  registeredAddress: string;
  garageAddress: string;
  garagePhone: string;

  cooperativeName: string;
  cooperativeNumber: string;

  // Personal Information
  personalInfo: {
    personalAddress: string;
    personalCity: string;
    personalState: string;
  };

  // Company Information
  companyinfo: {
    companyState: string;
    companyCity: string;
  };

  // Documents
  passportPhoto: string;
  panDoc: string;
  gstDoc: string;
  vendorProof: string;
  vehicleDoc: string;
}

// ─────────────────────────────────────────────
// Document Types
// ─────────────────────────────────────────────

export type DocKey =
  | "passportPhoto"
  | "panDoc"
  | "gstDoc"
  | "vendorProof"
  | "vehicleDoc";

export type FileState = Record<DocKey, File | null>;

// ─────────────────────────────────────────────
// Section Theme
// ─────────────────────────────────────────────

export interface SectionTheme {
  section: string;
  heading: string;
  badge: string;
  icon: string;
  field: string;
}
