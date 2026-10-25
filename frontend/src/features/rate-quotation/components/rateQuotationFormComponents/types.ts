export type LeadTab = "corporate" | "personal" | "events" | "longLease";

export interface VehicleData {
  id?: number | string;
  image: string;
  seating: string;
  make: string;
  variant: string;
  modelYear: number | string;
  noOfVehicles: number | string;
  discountedPrice: number | string;
}

export interface LeadData {
  id?: number | string;

  firstName?: string;
  middleName?: string;
  lastName?: string;
  customerPhone?: string;
  countryName?: string;
  companyName?: string;
  serviceType?: string;
  occasion?: string;
  tripType?: string;
  pickupDateTime?: string;
  dropDateTime?: string;
  days?: number | string;
  passengerTotal?: number | string;
  customerCity?: string;
  pickupcity?: string;
  dropcity?: string;
  pickupAddress?: string;
  dropAddress?: string;
  multiplepickup?: string;
  multipledrop?: string;
  alternatephone?: string;
  itinerary?: string;
  remarks?: string;

  vehicles?: VehicleData[];
}

export interface ChargeTemplate {
  id: number;
  charge_name: string;
  charge_detail: string;
  sort_order: number;
}

export interface NoteTemplate {
  id: number;
  note_text: string;
  sort_order: number;
}

export interface EditableLeadFormProps {
  lead?: LeadData;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}
