// Put this next to leadstabledata.ts  →  types/LeadsTable/leadTheme.ts
//
// All colours are OPAQUE hex on purpose: frozen (sticky) columns must hide
// the cells scrolling underneath them, so no rgba() / alpha tints here.

export type GroupTheme = {
  head: string; // top banner row (ACTION / STATUS / ENQUIRY ...)
  sub: string; // column-name row
  cell: string; // even row
  cellAlt: string; // odd row
  accent: string; // text accent / borders
};

export const SURFACE = {
  page: "#0b1220",
  panel: "#0f1a2e",
  border: "#1e2b45",
  text: "#e2e8f0",
  muted: "#94a3b8",
  rowHover: "#1b2c4d",
};

const FALLBACK: GroupTheme = {
  head: "#1c2740",
  sub: "#162136",
  cell: "#0f192c",
  cellAlt: "#121e34",
  accent: "#94a3b8",
};

export const GROUP_THEME: Record<string, GroupTheme> = {
  ACTION: { ...FALLBACK, accent: "#94a3b8" },
  STATUS: { head: "#1d3461", sub: "#14284a", cell: "#0f1c33", cellAlt: "#122039", accent: "#60a5fa" },
  ENQUIRY: { head: "#5b2149", sub: "#2a1d3d", cell: "#1a1a30", cellAlt: "#1d1d35", accent: "#f472b6" },
  CUSTOMER: { head: "#0f4a3c", sub: "#12332f", cell: "#0e1f2b", cellAlt: "#102431", accent: "#34d399" },
  TRAVEL: { head: "#3b2a78", sub: "#271f55", cell: "#16193a", cellAlt: "#191d40", accent: "#a78bfa" },
  ITINERARY: { head: "#0e5163", sub: "#0f3a4c", cell: "#0e1f33", cellAlt: "#102338", accent: "#22d3ee" },
  "Travel Req.": { head: "#6b2437", sub: "#3a1f30", cell: "#1b1a2c", cellAlt: "#1e1d31", accent: "#fb7185" },
  PASSANGER: { head: "#145a47", sub: "#14403a", cell: "#0e202d", cellAlt: "#112433", accent: "#34d399" },
  VEHICLE: { head: "#1e4a8a", sub: "#163563", cell: "#0f1c33", cellAlt: "#122039", accent: "#60a5fa" },
  TS_REPORT: { head: "#7a1f3a", sub: "#451d33", cell: "#1c1a2a", cellAlt: "#1f1d2e", accent: "#f43f5e" },
};

export const themeFor = (groupLabel?: string): GroupTheme =>
  (groupLabel && GROUP_THEME[groupLabel]) || FALLBACK;

// Coloured stripe on the left edge of every row (like your screenshot).
// Keys match LeadRecord["status"].
export const STATUS_STRIPE: Record<string, string> = {
  New: "#3b82f6",
  KYC: "#06b6d4",
  RFQ: "#d97706",
  HOT: "#ec4899",
  Book: "#22c55e",
  "Veh-n": "#a855f7",
  Lost: "#ef4444",
  Blank: "#475569",
};

// Small solid status pills (replaces statusClassMap look)
export const STATUS_PILL: Record<string, string> = {
  New: "bg-blue-600 text-white",
  KYC: "bg-cyan-700 text-white",
  RFQ: "bg-amber-700 text-white",
  HOT: "bg-pink-600 text-white",
  Book: "bg-green-600 text-white",
  "Veh-n": "bg-purple-700 text-white",
  Lost: "bg-red-600 text-white",
  Blank: "bg-slate-600 text-slate-200",
};