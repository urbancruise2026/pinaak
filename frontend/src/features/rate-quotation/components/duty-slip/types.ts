import type { Theme, TripType } from "../booking-assignment/types";

export type { Theme, TripType };

/** One trip leg. Corporate trips use one leg per vehicle; points can hold several lines. */
export interface DutyLeg {
  id: string;
  vehicle: string; // "1", "2"… (leave blank for a single vehicle)
  date: string;
  pickupTime: string;
  pickupLocations: string; // one pick-up point per line
  destinations: string;
  dropLocations: string; // one drop point per line
  dropDate: string; // blank = same day as `date`
  dropTime: string;
}

export interface Installment {
  id: string;
  date: string;
  amount: string;
}

export interface FormState {
  // Assigned to (common)
  vendorName: string;
  vendorCompany: string;
  vendorCity: string;

  // Trip (common)
  tripIds: string[];
  startDate: string;
  endDate: string;
  purpose: string;
  legs: DutyLeg[];

  // Vehicle (common)
  vehicleModel: string;
  seats: string;
  vehicleCount: string;
  ac: boolean;
  specialReq: string;
  vehicleNo: string;

  // Customer (common)
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  mapLink: string;
  pickupTime: string;

  // Payment (common)
  totalCost: string;
  inclusions: string;
  billingBasis: string;
  installments: Installment[];

  // Terms (common)
  parking: string;
  extraKm: string;
  extraHr: string;
  daAfterTime: string;
  daAmount: string;
  daPerHourAfter1Am: string;

  // Instructions + sender (common)
  rules: Record<string, boolean>;
  notes: string;
  senderName: string;
  senderPhone: string;
  senderCity: string;

  // Corporate only
  kmLimit: string;
  bookingAdvance: string;
}

export type SetField = <K extends keyof FormState>(
  key: K,
  value: FormState[K],
) => void;

export interface Calc {
  totalDays: number;
  total: number;
  advance: number; // corporate booking advance (0 for personal)
  installmentsTotal: number;
  allocated: number; // advance + instalments
  unallocated: number; // total - allocated
}

export interface SectionProps {
  form: FormState;
  set: SetField;
  errors: Record<string, string>;
  isPersonal: boolean;
  theme: Theme;
  calc: Calc;
}
