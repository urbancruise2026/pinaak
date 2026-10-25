import type { LeadData, LeadTab, VehicleData } from "./types";
import type { Theme } from "./FormParts";

export const MAX_VEHICLES = 10;

export const EMPTY_VEHICLE: VehicleData = {
  image: "",
  seating: "",
  make: "",
  variant: "",
  modelYear: "",
  noOfVehicles: 1,
  discountedPrice: "",
};

export const EMPTY_FORM: LeadData = {
  firstName: "",
  middleName: "",
  lastName: "",
  customerPhone: "",
  countryName: "",
  serviceType: "",
  occasion: "",
  tripType: "",
  pickupDateTime: "",
  dropDateTime: "",
  days: "",
  passengerTotal: "",
  pickupcity: "",
  dropcity: "",
  pickupAddress: "",
  dropAddress: "",
  multiplepickup: "",
  multipledrop: "",
  itinerary: "",
  remarks: "",
  companyName: "",
  customerCity: "",
  alternatephone: "",
  vehicles: [{ ...EMPTY_VEHICLE }],
};

export const TABS: { key: LeadTab; label: string }[] = [
  { key: "corporate", label: "Corporate" },
  { key: "personal", label: "Personal" },
  { key: "events", label: "Events" },
  { key: "longLease", label: "Long Lease" },
];

export const MAX_LENGTHS = {
  firstName: 50,
  middleName: 50,
  lastName: 50,
  phone: 10,
  countryName: 60,
  alternatephone: 15,
  serviceType: 80,
  occasion: 80,
  tripType: 80,
  city: 60,
  companyName: 100,
  customerCity: 100,
};

export const THEMES: Record<
  "customer" | "trip" | "route" | "vehicle" | "charges" | "notes",
  Theme
> = {
  customer: {
    border: "border-violet-200",
    header: "bg-violet-50",
    iconBox: "bg-violet-100 text-violet-700",
    title: "text-violet-800",
    icon: "text-violet-500",
    focus: "focus:border-violet-500 focus:ring-violet-100",
    button: "bg-violet-100 text-violet-700 hover:bg-violet-200",
  },
  trip: {
    border: "border-blue-200",
    header: "bg-blue-50",
    iconBox: "bg-blue-100 text-blue-700",
    title: "text-blue-800",
    icon: "text-blue-500",
    focus: "focus:border-blue-500 focus:ring-blue-100",
    button: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  route: {
    border: "border-emerald-200",
    header: "bg-emerald-50",
    iconBox: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-800",
    icon: "text-emerald-500",
    focus: "focus:border-emerald-500 focus:ring-emerald-100",
    button: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  vehicle: {
    border: "border-orange-200",
    header: "bg-orange-50",
    iconBox: "bg-orange-100 text-orange-700",
    title: "text-orange-800",
    icon: "text-orange-500",
    focus: "focus:border-orange-500 focus:ring-orange-100",
    button: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
  charges: {
    border: "border-rose-200",
    header: "bg-rose-50",
    iconBox: "bg-rose-100 text-rose-700",
    title: "text-rose-800",
    icon: "text-rose-500",
    focus: "focus:border-rose-500 focus:ring-rose-100",
    button: "bg-rose-100 text-rose-700 hover:bg-rose-200",
  },
  notes: {
    border: "border-amber-200",
    header: "bg-amber-50",
    iconBox: "bg-amber-100 text-amber-700",
    title: "text-amber-800",
    icon: "text-amber-500",
    focus: "focus:border-amber-500 focus:ring-amber-100",
    button: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },
};
