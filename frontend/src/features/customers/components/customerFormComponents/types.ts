export type FormMode = "create" | "edit" | "view";

export interface CustomerFormData {
  // Basic info
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  // Phones
  phone: string;
  alternateCountryCode: string;
  alternatePhone: string;
  // Category
  countryName: string;
  customerType: string;
  customerCategoryType: string;
  companyName: string;
  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  cityId?: number;
  stateId?: number;
}

/** Sirf text/select wale keys (ids hata ke) — field() helper isi pe chalta hai */
export type TextKey = Exclude<keyof CustomerFormData, "stateId" | "cityId">;

export type DocKey = "passportPhoto" | "adhar" | "panDoc" | "gstDoc";
export type FileState = Record<DocKey, File | null>;

export interface Country {
  id: number;
  country_name: string;
  country_code: string;
  phone_code: string;
}

export interface City {
  id: number;
  cityName: string;
}

export interface StateItem {
  id: number;
  stateName: string;
}

export interface Option {
  value: string;
  label: string;
}

export interface SectionTheme {
  section: string;
  heading: string;
  badge: string;
  icon: string;
  field: string;
  wrap: string; // focus-within version (phone fields ke liye)
}

/** form.field("firstName") ye object deta hai, seedha <TextField {...} /> me spread hota hai */
export interface FieldBinding {
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onBlur: () => void;
  error?: string;
}