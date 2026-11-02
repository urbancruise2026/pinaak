import type { FormState, ItineraryRow, Theme, TripType } from "./types";

// Light, neutral palette: one soft accent per trip type.
// Full class names so Tailwind never purges them.
export const THEME: Record<TripType, Theme> = {
  personal: {
    label: "Personal Trip",
    text: "text-indigo-700",
    soft: "bg-indigo-50",
    border: "border-indigo-200",
    iconBg: "bg-indigo-50 text-indigo-600",
    btn: "bg-indigo-600 hover:bg-indigo-700",
    pageBg: "bg-gradient-to-br from-indigo-50/70 via-white to-sky-50",
    header: "bg-gradient-to-r from-indigo-100 via-indigo-50 to-white",
  },
  corporate: {
    label: "Corporate Trip",
    text: "text-teal-700",
    soft: "bg-teal-50",
    border: "border-teal-200",
    iconBg: "bg-teal-50 text-teal-600",
    btn: "bg-teal-600 hover:bg-teal-700",
    pageBg: "bg-gradient-to-br from-teal-50/70 via-white to-cyan-50",
    header: "bg-gradient-to-r from-teal-100 via-teal-50 to-white",
  },
};

export const PURPOSES = [
  "Sightseeing",
  "Airport Transfer",
  "Outstation",
  "Local Use",
  "Wedding",
  "Pilgrimage",
  "Other",
];

export const uid = () => Math.random().toString(36).slice(2, 9);

export const emptyRow = (date = ""): ItineraryRow => ({
  id: uid(),
  date,
  pickupTime: "",
  pickupLocation: "",
  destinations: "",
  dropLocation: "",
  dropTime: "",
});

export const createInitialForm = (): FormState => ({
  vendorName: "",
  vendorCompany: "",
  vendorCity: "",
  tripIds: [],
  startDate: "",
  endDate: "",
  purpose: "Sightseeing",
  itinerary: [emptyRow()],
  vehicleModel: "",
  seats: "",
  vehicleCount: "1",
  ac: true,
  specialReq: "",
  vehicleNo: "",
  driverName: "",
  driverPhone: "",
  totalCost: "",
  inclusions: "All inclusives",
  advance: "",
  parking: "Client will pay at actual to Driver/Parking Booth.",
  extraKm: "",
  extraHr: "",
  daAfterTime: "11:00 PM",
  daAmount: "",
  daPerHourAfter1Am: "",
  notes: "",
  passengerName: "",
  passengerPhone: "",
  customerCollect: "",
  companyName: "",
  contactPerson: "",
  contactPhone: "",
  kmLimit: "",
  pickupBasis: "Pick-up point to Pick-up point",
});
