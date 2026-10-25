export const SOURCE_OPTIONS = [
  "Call",
  "WA",
  "GAC",
  "GAQ",
  "Email",
  "META",
  "GA",
  "REP-C",
  "REF-C",
];

export const STATUS_OPTIONS = [
  "New",
  "KYC",
  "RFQ",
  "HOT",
  "Book",
  "Veh-n",
  "Lost",
];

export const CITY_OPTIONS = ["delhi", "gurgoan", "hydrabad", "noida"];

export const SERVICE_TYPE_OPTIONS = [
  "One Way",
  "Pick & Drop",
  "Round Trip",
  "Round Trip Drop",
  "Long Term Lease",
];

export const OCCASION_OPTIONS = [
  "Wedding",
  "Vacation",
  "Pilgrimage",
  "Corporate",
  "Event",
  "Local",
];

export const LOST_REASON_OPTIONS = [
  "No Response from Customer",
  "Plan Cancelled",
  "Plan Posponed",
  "Price to High Booked from Other",
  "Found Better Vehicle Options",
];

export const TRIP_TYPE_OPTIONS = ["Sightseeing", "Point to Point"];

export const CATEGORY_OPTIONS: Record<string, string[]> = {
  Personal: ["Personal"],
  Corporate: [
    "Company",
    "NGO",
    "Educational Institute",
    "Sporting Company",
    "Government",
  ],
  "Travel Agent": [
    "Travel Agent",
    "Tour Operator",
    "Hotel",
    "Wedding Planner",
    "DMC",
  ],
};

export const DAYS_OPTIONS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11-15",
  "16-30",
  "31-60",
  "60+",
];

const PAX_OPTIONS = [
  "1-4",
  "5-7",
  "8-13",
  "14-20",
  "21-30",
  "31-40",
  "41-50",
  "51-60",
  "60+",
] as const;

export const DEFAULT_VALUES = {
  smallbaggage: 0,
  mediumbaggage: 0,
  largebaggage: 0,
  airportbaggage: 0,
  totalbaggage: 0,
  petsNumber: 0,
  days: 1,
  followUps: [{ followup_date: "", followup_remark: "" }],
};
