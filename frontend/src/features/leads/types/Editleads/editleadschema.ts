import * as z from "zod";

export const leadSchema = z.object({
  customer_id: z.number().optional(),
  date: z.string().min(1, "Date is required"),
  source: z.enum([
    "Call",
    "Email",
    "WA",
    "GAC",
    "GAQ",
    "META",
    "GA",
    "REP-C",
    "REF-C",
  ]),
  telesales: z.string().optional(),
  status: z
    .enum(["New", "KYC", "RFQ", "HOT", "Book", "Veh-n", "Lost", "Blank"])
    .optional(),
  customerType: z.enum(["Personal", "Corporate", "Travel Agent"]),
  customerCategoryType: z.string().optional(),
  countryName: z.string().min(1, "Country is required"),
  customerCity: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  serviceType: z
    .enum([
      "One Way",
      "Pick & Drop",
      "Round Trip",
      "Round Trip Drop",
      "Long Term Lease",
      "Wedding",
      "Vacation",
      "Pilgrimage",
      "Corporate",
      "Local",
    ])
    .optional(),
  tripType: z.string().optional(),

  occasion: z.string().optional(),
  pickupDateTime: z.string().min(1, "Pickup date is required"),
  dropDateTime: z.string().optional(),
  days: z.number().min(1, "Days is required"),
  multipledrop: z.string().optional(),
  multiplepickup: z.string().optional(),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropAddress: z.string().min(1, "Drop address is required"),
  pickupcity: z.string().min(1, "Pickup city is required"),
  dropcity: z.string().min(1, "Drop city is required"),
  city: z.string().optional(),
  passengerTotal: z
    .number()
    .min(1, "Passengers is required")
    .or(z.string().min(1, "Passengers is required")),
  petsNumber: z.number().optional(),
  petsNames: z.string().optional(),
  vehicle2: z.string().optional(),
  vehicles: z.string().optional(),
  vehicle3: z.string().optional(),
  vehicle1Quantity: z.number().optional().default(0),
  vehicle2Quantity: z.number().optional().default(0),
  vehicle3Quantity: z.number().optional().default(0),
  requirementVehicle: z.string().optional(),
  km: z.string().min(1, "KM is required"),
  smallbaggage: z.number().optional(),
  mediumbaggage: z.number().optional(),
  largebaggage: z.number().optional(),
  airportbaggage: z.number().optional(),
  totalbaggage: z.number().optional(),
  itinerary: z.array(z.string()).optional(),
  remarks: z.string().optional(),
  lost_reason: z.string().optional(),
  lostReasonDetails: z.string().optional(),
  followUps: z
    .array(
      z.object({
        followup_date: z.string().optional(),
        followup_remark: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  city_id: z.number().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
