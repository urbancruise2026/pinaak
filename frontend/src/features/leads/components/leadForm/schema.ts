import * as z from "zod";

// presales_id is optional in the schema — it is validated manually in onSubmit
export const schema = z.object({
  date: z.string().min(1, "Date is required"),
  source: z.string().min(1, "Source is required"),
  presales_id: z.number().min(1).optional(),
  status: z.string().min(1, "Status is required"),
  customerType: z.string().min(1, "Customer category is required"),
  customerCategoryType: z.string().optional(),
  countryName: z.string().min(1, "Country is required"),
  customerCity: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  serviceType: z.string().optional(),
  tripType: z.string().optional(),
  occasion: z.string().optional(),
  pickupDateTime: z.string().optional(),
  dropDateTime: z.string().optional(),
  days: z.number().optional(),
  pickupAddress: z.string().optional(),
  multiplepickup: z.string().optional(),
  multipledrop: z.string().optional(),
  dropAddress: z.string().optional(),
  pickupcity: z.string().optional(),
  dropcity: z.string().optional(),
  city: z.string().optional(),
  passengerTotal: z.number().optional(),
  petsNumber: z.number().optional(),
  petsNames: z.string().optional(),
  vehicle2: z.string().optional(),
  vehicles: z.string().optional(),
  vehicle3: z.string().optional(),
  vehicle3Quantity: z.string().optional(),
  vehicle2Quantity: z.string().optional(),
  vehicle1Quantity: z.string().optional(),
  requirementVehicle: z.string().optional(),
  km: z.union([z.string(), z.number()]).optional(),
  smallbaggage: z.number().optional(),
  mediumbaggage: z.number().optional(),
  largebaggage: z.number().optional(),
  airportbaggage: z.number().optional(),
  totalbaggage: z.number().optional(),
  itinerary: z.array(z.string()).optional(),
  remarks: z.string().optional(),
  lost_reason: z.string().optional(),
  lostReasonDetails: z.string().optional(),
  followUp: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  city_id: z.number().optional(),
});

export type LeadFormData = z.infer<typeof schema>;

export interface CustomerFields {
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  alternatePhone: string;
  email: string;
  companyName: string;
}

export const EMPTY_CUSTOMER: CustomerFields = {
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  alternatePhone: "",
  email: "",
  companyName: "",
};