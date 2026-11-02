import { uid } from "../booking-assignment/constants";
import type { DutyLeg, FormState, Installment, TripType } from "./types";

export { THEME, PURPOSES, uid } from "../booking-assignment/constants";

export const emptyLeg = (date = "", vehicle = ""): DutyLeg => ({
  id: uid(),
  vehicle,
  date,
  pickupTime: "",
  pickupLocations: "",
  destinations: "",
  dropLocations: "",
  dropDate: "",
  dropTime: "",
});

export const emptyInstallment = (date = ""): Installment => ({
  id: uid(),
  date,
  amount: "",
});

/** Standard instructions printed at the bottom of the slip. `*x*` = WhatsApp bold. */
export const RULES: Array<{ key: string; text: string; only?: TripType }> = [
  {
    key: "collect",
    only: "personal",
    text: "*Driver to Collect Payment from Customer on above dates before start of the Trip.* If not collected, we will not be responsible.",
  },
  {
    key: "sameVehicle",
    text: "*Pls send the same vehicle No.* as mentioned in Booking Assignment.",
  },
  {
    key: "clean",
    text: "*Send Neat & Clean Vehicle & ask Driver to reach on time* at Pickup Point.",
  },
  {
    key: "diesel",
    only: "corporate",
    text: "Pls fill Diesel in Vehicle before reaching at Pick-up Point.",
  },
  {
    key: "nonAdherence",
    text: "Incase of Non-adherance of above points, We will not be responsible.",
  },
];

export const createInitialForm = (): FormState => ({
  vendorName: "",
  vendorCompany: "",
  vendorCity: "",
  tripIds: [],
  startDate: "",
  endDate: "",
  purpose: "Sightseeing",
  legs: [emptyLeg()],
  vehicleModel: "",
  seats: "",
  vehicleCount: "1",
  ac: true,
  specialReq: "",
  vehicleNo: "",
  customerName: "",
  customerPhone: "",
  pickupAddress: "",
  mapLink: "",
  pickupTime: "",
  totalCost: "",
  inclusions: "All inclusives",
  billingBasis: "Pick-up point to Pick-up point",
  installments: [emptyInstallment()],
  parking: "Client will pay at actual to Driver.",
  extraKm: "",
  extraHr: "",
  daAfterTime: "11:00 PM",
  daAmount: "",
  daPerHourAfter1Am: "",
  rules: Object.fromEntries(RULES.map((r) => [r.key, true])),
  notes: "",
  senderName: "RENU",
  senderPhone: "+91 86557 15978",
  senderCity: "Delhi",
  kmLimit: "",
  bookingAdvance: "",
});
