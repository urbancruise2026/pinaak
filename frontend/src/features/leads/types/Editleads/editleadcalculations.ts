import type { LeadRecord } from "@/types/types";
import { LeadFormData } from "./editleadschema";
import { TRIP_TYPE_OPTIONS } from "./editleaddata";

// ── IST Timezone constant ─────────────────────────────────────────────────────
const IST_TIMEZONE = "Asia/Kolkata";

// ── Parse phone number ────────────────────────────────────────────────────────
export const parsePhone = (phone: string) => {
  if (!phone) return { code: "+91", number: "" };
  const match = phone.match(/^\+(\d{1,3})\s*(.*)$/);
  if (match) {
    return { code: "+" + match[1], number: match[2].trim() };
  }
  return { code: "+91", number: phone.trim() };
};

// ── Parse itinerary (handles string / array / null / JSON string) ─────────────
export const parseItinerary = (itinerary: any): string[] => {
  if (!itinerary) return [];
  if (Array.isArray(itinerary)) return itinerary.filter(Boolean);
  if (typeof itinerary === "string") {
    try {
      const parsed = JSON.parse(itinerary);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // comma-separated string fallback
      return itinerary
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

// ── Convert UTC ISO string → IST datetime-local string (YYYY-MM-DDTHH:mm) ────
// Backend se aata hai UTC mein (e.g. "2026-04-28T02:20:00.000Z")
// Input field ko chahiye IST mein (e.g. "2026-04-28T07:50")
export const formatDateTimeForInput = (dateStr?: string): string => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  // Intl se IST parts nikalo
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour") === "24" ? "00" : get("hour");
  const minute = get("minute");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

// ── Convert form IST value → API submission format ────────────────────────────
// Form value: "2026-04-28T07:50" (IST, no timezone info)
// Backend expect karta hai: "2026-04-28 07:50:00" (IST mein hi store karta hai)
// NOTE: seconds append karo, T → space replace karo. Timezone convert mat karo.
export const formatDateTimeForSubmit = (
  dateStr?: string,
): string | undefined => {
  if (!dateStr) return undefined;

  // "2026-04-28T07:50" → "2026-04-28 07:50:00"
  const withSpace = dateStr.replace("T", " ");
  const parts = withSpace.split(" ");

  if (parts.length >= 2) {
    const timePart = parts[1];
    if (timePart && timePart.split(":").length === 2) {
      parts[1] = timePart + ":00";
    }
  }

  return parts.join(" ");
};

// ── Calculate days (date-only, no time involved) ──────────────────────────────
// pickupDateTime & dropDateTime are form values: "YYYY-MM-DDTHH:mm" in IST
// We only use the date part, so timezone doesn't matter here
export const calculateDays = (
  serviceType: string | undefined,
  pickupDateTime: string,
  dropDateTime?: string,
): number => {
  if (serviceType === "Pick & Drop") return 2;
  if (serviceType === "One Way") return 1;

  if (pickupDateTime && dropDateTime) {
    // Split on T to get only date part — safe because form value is IST
    const pickup = new Date(pickupDateTime.split("T")[0]);
    const drop = new Date(dropDateTime.split("T")[0]);

    const diffDays =
      (drop.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24);

    const totalDays = diffDays + 1;
    return totalDays > 0 ? totalDays : 1;
  }

  return 1;
};

// ── Calculate total baggage ───────────────────────────────────────────────────
export const calculateTotalBaggage = (
  small = 0,
  medium = 0,
  large = 0,
  airport = 0,
): number => small + medium + large + airport;

// ── Calculate total vehicles ──────────────────────────────────────────────────
export const calculateTotalVehicles = (
  vehicle1: string,
  vehicle1Qty = 0,
  vehicle2: string,
  vehicle2Qty = 0,
  vehicle3: string,
  vehicle3Qty = 0,
): string => {
  const vehicles: string[] = [];

  if (vehicle1 && vehicle1Qty > 0)
    vehicles.push(`${vehicle1} x ${vehicle1Qty}`);
  if (vehicle2 && vehicle2Qty > 0)
    vehicles.push(`${vehicle2} x ${vehicle2Qty}`);
  if (vehicle3 && vehicle3Qty > 0)
    vehicles.push(`${vehicle3} x ${vehicle3Qty}`);

  return vehicles.join(", ");
};

// ── Prepare API payload ───────────────────────────────────────────────────────
export const prepareLeadPayload = (
  data: LeadFormData,
  formData: any,
  itineraryList: string[],
  alternateCountryCode: string,
  initialDataRecord?: any,
) => {
  return {
    // Customer
    customer_id:
      (data as any).customer_id ||
      initialDataRecord?.customer_id ||
      (initialDataRecord as any)?.id,
    firstName: formData.firstName,
    middleName: formData.middleName,
    lastName: formData.lastName,
    customerPhone: `+91 ${formData.phone}`,
    alternatePhone: formData.alternatePhone
      ? `${alternateCountryCode} ${formData.alternatePhone}`
      : "",
    customerEmail: formData.email || "",
    companyName: formData.companyName === "C" ? "" : formData.companyName,
    customerType: data.customerType,
    customerCategoryType: data.customerCategoryType || "",
    countryName: data.countryName,
    customerCity: data.customerCity || "",
    state: data.state || "",
    address: data.address || formData.address || "",
    // Lead
    enquiryTime: data.date ? `${data.date}:00` : new Date().toISOString(),
    source: data.source,
    status: data.status,

    city: data.city || "",
    serviceType: data.serviceType,
    occasion: data.occasion || "",
    tripType: data.tripType || undefined,

    // ✅ IST-safe: form value already IST, just format for backend
    pickupDateTime: formatDateTimeForSubmit(data.pickupDateTime),
    dropDateTime: formatDateTimeForSubmit(data.dropDateTime),

    pickupAddress: data.pickupAddress,
    dropAddress: data.dropAddress,
    pickupcity: data.pickupcity,
    dropcity: data.dropcity,
    days: Number(data.days),
    km: parseInt(data.km) || 0,
    itinerary: Array.isArray(itineraryList) ? itineraryList : [],
    passengerTotal: Number(data.passengerTotal),
    petsNumber: Number(data.petsNumber) || 0,
    petsNames: data.petsNames || "",
    smallBaggage: Number(data.smallbaggage) || 0,
    mediumBaggage: Number(data.mediumbaggage) || 0,
    largeBaggage: Number(data.largebaggage) || 0,
    airportBaggage: Number(data.airportbaggage) || 0,
    totalBaggage: Number(data.totalbaggage) || 0,
    vehicles: data.vehicles || "",
    vehicle2: data.vehicle2 || "",
    vehicle3: data.vehicle3 || "",
    vehicle1Quantity: Number(data.vehicle1Quantity) || 0,
    vehicle2Quantity: Number(data.vehicle2Quantity) || 0,
    vehicle3Quantity: Number(data.vehicle3Quantity) || 0,
    requirementVehicle: data.requirementVehicle || "",
    remarks: data.remarks || "",
    lost_reason: data.lost_reason || "",
    lostReasonDetails: data.lostReasonDetails || "",
    follow_ups: (data.followUps ?? [])
  .filter((item) => item.followup_remark?.trim())
  .map((item) => ({
    followup_date: item.followup_date ?? "",
    followup_remark: item.followup_remark ?? "",
  })),
    message: "",
    multiplepickup: data.multiplepickup || "",
    multipledrop: data.multipledrop || "",
  };
};
const normalizeTripType = (v?: string) =>
  TRIP_TYPE_OPTIONS.find(
    (o) => o.toLowerCase() === (v ?? "").trim().toLowerCase(),
  ) ?? "";
// ── Map initial data to form ──────────────────────────────────────────────────
export const mapInitialDataToForm = (initialData: LeadRecord) => {
  const mainPhone = parsePhone(initialData.customerPhone || "");
  const altPhone = parsePhone(initialData.alternatePhone || "");

  // ✅ Direct fields
  let firstName = initialData.firstName || "";
  let middleName = initialData.middleName || "";
  let lastName = initialData.lastName || "";

  // 🔥 Fallback agar backend se split nahi aaya
  if (!firstName && initialData.fullName) {
    const parts = initialData.fullName.trim().split(" ");
    firstName = parts[0] || "";
    middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";
    lastName = parts.length > 1 ? parts[parts.length - 1] : "";
  }

  return {
    formData: {
      firstName,
      middleName,
      lastName,
      phone: mainPhone.number,
      alternatePhone: altPhone.number,
      email: initialData.customerEmail || "",
      companyName:
        initialData.customerType === "Personal"
          ? "C"
          : initialData.companyName || "",
      name: initialData.fullName || "",
    },
    alternateCountryCode: altPhone.code,
    customerCategoryTypeValue: initialData.customerCategoryType || "",

    // ✅ FIXED: always returns string[]
    itineraryList: parseItinerary(initialData.itinerary),

    setValues: {
      customer_id:
        (initialData as any).customer_id ??
        (initialData as any).customerId ??
        undefined,

      date: initialData.enquiryTime
        ? formatDateTimeForInput(initialData.enquiryTime) // ✅ IST convert
        : "",
      source: initialData.source,
      telesales: initialData.telecaller,
      status: initialData.status,
      city: initialData.city || "",

      customerType: initialData.customerType,
      customerCategoryType: initialData.customerCategoryType || "",
      countryName: initialData.countryName || initialData.customerCountry || "",
      customerCity: initialData.customerCity || "",
      customerState: initialData.customerState || "",
      address: initialData.address || "",

      serviceType: initialData.serviceType,
      tripType: normalizeTripType(initialData.tripType),
      occasion: initialData.occasion || "",

      // ✅ KEY FIX: UTC → IST convert for input fields
      pickupDateTime: formatDateTimeForInput(initialData.pickupDateTime),
      dropDateTime: formatDateTimeForInput(initialData.dropDateTime),
      multiplepickup: initialData.multiplepickup || "",
      multipledrop: initialData.multipledrop || "",
      pickupAddress: initialData.pickupAddress || "",
      dropAddress: initialData.dropAddress || "",
      pickupcity: (initialData as any).pickupcity || "",
      dropcity: (initialData as any).dropcity || "",
      days: initialData.days,
      km: String(initialData.km),

      passengerTotal: initialData.passengerTotal,
      petsNumber: initialData.petsNumber || 0,
      petsNames: initialData.petsNames || "",

      smallbaggage: initialData.smallBaggage || 0,
      mediumbaggage: initialData.mediumBaggage || 0,
      largebaggage: initialData.largeBaggage || 0,
      airportbaggage: initialData.airportBaggage || 0,
      totalbaggage: initialData.totalBaggage || 0,

      vehicles: initialData.vehicles || "",
      vehicle2: initialData.vehicle2 || "",
      vehicle3: initialData.vehicle3 || "",
      vehicle1Quantity: (initialData as any).vehicle1Quantity || 0,
      vehicle2Quantity: (initialData as any).vehicle2Quantity || 0,
      vehicle3Quantity: (initialData as any).vehicle3Quantity || 0,
      requirementVehicle: initialData.requirementVehicle || "",

      remarks: initialData.remarks || "",
      lost_reason: initialData.lost_reason || "",
      lostReasonDetails: initialData.lostReasonDetails || "",
      followUp: initialData.followUp || "",
    },
  };
};
