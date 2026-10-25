export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  status: string;
  priority: string;
  source: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  value: number;
}

export interface SalesPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  leadsCount: number;
  conversionRate: number;
  totalValue: number;
}

export interface SalesTeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  leadsCount: number;
  conversionRate: number;
  totalValue: number;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  totalValue: number;
  conversionRate: number;
}

export interface FilterOptions {
  location: string;
  salesId: string;
  status: string;
}

export interface LeadRecord {
  aged: any;
  liveorexpiry: any;
  vehicle2: any;
  vehicle3: any;
  vehicles1: any;
  vehicles2: any;
  requirementVehicle: any;
  occasion: any;
  id: string;
  date: string;
  enquiryTime?: string;
  uuid?: string;
  customer_id?: number | string;
  cityName?: string;
  advisorFullName?:string;
  isEditMode?: boolean
  source:
    | "Call"
    | "Email"
    | "WA"
    | "GAC"
    | "GAQ"
    | "META"
    | "GA"
    | "REP-C"
    | "REF-C";
  status: "New" | "KYC" | "RFQ" | "HOT" | "Book" | "Veh-n" | "Lost" | "Blank";
  telecaller: string;
  region: string;
  city: string;
  pickupcity?: string;
  dropcity?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  customerType: "Personal" | "Corporate" | "Travel Agent";
  customerCategoryType?: string;
  serviceType?:
    | "One Way"
    | "Pick & Drop"
    | "Round Trip"
    | "Long Term Lease"
    | "Round Trip Drop"
    | "Wedding"
    | "Vacation"
    | "Pilgrimage"
    | "Corporate"
    | "Local";
  occasionType?: string;
  tripType: string;
  pickupDateTime: string;
  dropDateTime?: string;
  pickupAddress?: string;
  dropAddress?: string;
  itinerary?: string[];
  vehicles?: string;
  alternatePhone?: string;
  vehiclevehicle2?: string;
  vehiclevehicle3?: string;
  passengerTotal: number;
  days: number;
  km: number;
  petsNumber?: number;
  petsNames?: string;
  smallBaggage?: number;
  mediumBaggage?: number;
  largeBaggage?: number;
  airportBaggage?: number;
  totalBaggage?: number;
  remarks?: string;
  message?: string;
  lost_reason?: string;
  totalPages: Number;
  countryName?: string;
  lostReasonDetails?: string;
  followUp?: string;
  customerCity?: string;
  customerAddress?: string;
  address?: string;
  multiplepickup?: string;
  multipledrop?: string;
  customerState?: string;
  vehicle3Quantity?: number;
  vehicle2Quantity?: number;
  vehicle1Quantity?: number;
  unwanted_status?: "wanted" | "unwanted";
  state?: string;
  customercity?: string;
  city_id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  customerCountry?: string;
  createdAt?: string;
  updatedAt?: string;
  presales_id?: string | number;
  leadId?: string | number;
  advisor_id?: string | number;
  followup_date?: string | null;
  followup_remark?: string | null;
}
export type UserRole =
  | "user"
  | "admin"
  | "presale"
  | "bdm"
  | "sales"
  | "city manager"
  | "team leader";

export interface User {
  name: string;
  email: string;
  password: string;
  subdepartname_name: string;
  role: UserRole;
  data?: any;
  uuid: string;
  role_name: string;
  access_role?: string;
  aliasName?: string;
  subDepartment_name?: string;
}
// types/types.ts
export interface User {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  city_names?: string;
  city_ids?: string;
  zone_ids?: number[];
  zone_names?: string[];
}

export interface countryData {
  id?: number;
  country_name: string;
  country_code: string;
  phone_code: string;
  created_at?: Date;
  data?: any;
  name?: string;
}
export interface Vehicle {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at?: string;
  seat: string;
  category: string;
  make: string;
  variant: string;
  description: string;
  amenities: string;
  config: string;
  model: string; // Add model field to the Vehicle interface
}

export interface travelcity {
  id?: number;
  uuid?: string;
  cityName: string;
}

// Add or update these interfaces
export interface City {
  id: number;
  cityName: string;
  state_id: number;
}

export interface State {
  id: number;
  stateName: string;
}

export interface CustomerRecord {
  // Personal Info
  
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  anniversary: string;
  gender: string;


  // Address Info
  address: string;
  state: string;
  city: string;
  pincode: string;
  customerAddress?:string;
}

export interface SaleUser {
  id: number;
  name: string;
  role: string;
}

export interface DsrRecord {
  id: string;
  status?: string;
  customerPhone?: string;
  customerName?: string;
  dsrDate?: string;
  source?: string;
  presales?: string;
  telesales?: string;
  fullName?: string;
  leadId?: string;
  customerId?: string;
  advisorId?: string;
  bookingId?: string;
  dsrVehicles?: string;
  dsrCategory?: string;
  vehNo?: string;
  driver?: string;
  vendorName?: string;
  customerRate?: string | number;
  customerToll?: string | number;
  parkTax?: string | number;
  gstAmt?: string | number;
  total?: string | number;
  bookingAmount?: string | number;
  otherAmount?: string | number;
  bankName?: string;
  amountReceived?: string | number;
  tds?: string | number;
  remainingAmount?: string | number;
  vendorRate?: string | number;
  vendorToll?: string | number;
  vendorParkTax?: string | number;
  customerToVendor?: string | number;
  outstanding?: string | number;
  paymentStatus?: string;
  balanceAmount?: string | number;
  rate?: string | number;
  pay?: string | number;
  finalBalance?: string | number;
  before?: string | number;
  final?: string | number;
  gst?: string | number;
  remarksTS?: string;
  remarksMIS?: string;
  enteredBy?: string;
  amountReceivedDate?: string;
  ucBankName?: string;
  customerBankName?: string;
  transactionId?: string;
  remarksAmountReceived?: string;
  vendor_amount?: JSON;
  customer_amount?: JSON;
}
