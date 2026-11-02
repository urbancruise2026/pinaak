export type TripType = "personal" | "corporate";

export interface ItineraryRow {
  id: string;
  date: string;
  pickupTime: string;
  pickupLocation: string;
  destinations: string;
  dropLocation: string;
  dropTime: string;
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
  itinerary: ItineraryRow[];

  // Vehicle (common)
  vehicleModel: string;
  seats: string;
  vehicleCount: string;
  ac: boolean;
  specialReq: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;

  // Amount (common)
  totalCost: string;
  inclusions: string;
  advance: string;

  // Terms (common)
  parking: string;
  extraKm: string;
  extraHr: string;
  daAfterTime: string;
  daAmount: string;
  daPerHourAfter1Am: string;
  notes: string;

  // Personal only
  passengerName: string;
  passengerPhone: string;
  customerCollect: string;

  // Corporate only
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  kmLimit: string;
  pickupBasis: string;
}

export type SetField = <K extends keyof FormState>(
  key: K,
  value: FormState[K],
) => void;

export interface Theme {
  label: string;
  text: string;
  soft: string;
  border: string;
  iconBg: string;
  btn: string;
  pageBg: string;
  header: string;
}

/** Values derived from the form (auto-calculated) */
export interface Calc {
  totalDays: number;
  total: number;
  customerCollect: number;
  collectFromUC: number;
  advance: number;
  balance: number;
}

/** Props shared by every form section */
export interface SectionProps {
  form: FormState;
  set: SetField;
  errors: Record<string, string>;
  isPersonal: boolean;
  theme: Theme;
  calc: Calc;
}
