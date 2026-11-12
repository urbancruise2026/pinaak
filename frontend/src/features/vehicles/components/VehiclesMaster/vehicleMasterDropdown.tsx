import type { StaticImageData } from "next/image";

import bodyTypeImage from "@/assets/images/bodytype.png";
import seatsImage from "@/assets/images/seats.png";
import audioImage from "@/assets/images/audio.jpg";
import luggageImage from "@/assets/images/luggage.png";
import windowTypeImage from "@/assets/images/window.png";
import curtainTypeImage from "@/assets/images/curtain.png";
import acImage from "@/assets/images/acvent.png";
import videoImage from "@/assets/images/pinnak.png";

export interface VariantOption {
  label: string;
  code: string;
}

export interface AmenityOption {
  code: string;
  label: string;
}

export interface AmenityCategory {
  label: string;
  image: StaticImageData;
  options: AmenityOption[];
}

export const VARIANT_OPTIONS: VariantOption[] = [
  { code: "ECO", label: "Economy" },
  { code: "PRE N", label: "Premium New" },
  { code: "PRE P", label: "Premium Plus" },
  { code: "RYL", label: "Royal" },
  { code: "RYL - V", label: "Royal VIP" },
  { code: "UC Class", label: "UC Class" },
];

export const getVariantDisplay = (label: string, code: string): string =>
  `${code} - ${label}`;

export const VARIANT_DISPLAY_OPTIONS: string[] = VARIANT_OPTIONS.map((v) =>
  getVariantDisplay(v.label, v.code),
);

export const getVariantCodeByDisplay = (display: string): string => {
  const found = VARIANT_OPTIONS.find(
    (v) => getVariantDisplay(v.label, v.code) === display,
  );

  return found ? found.code : "";
};

export const getVariantDisplayByCode = (code: string): string => {
  const found = VARIANT_OPTIONS.find((v) => v.code === code);
  return found ? getVariantDisplay(found.label, found.code) : "";
};

export const MAKE_OPTIONS: string[] = [
  "Ashok Leyland",
  "Audi",
  "BMW",
  "Bharat Benz",
  "Eicher",
  "Force Motors",
  "Honda",
  "Hyundai",
  "Kia",
  "Maruti",
  "Mahindra",
  "Mercedes Benz",
  "SML Mahindra",
  "Suzuki",
  "Tata",
  "Toyota",
  "Volvo",
  "Volvo Eicher"
];

// Models available for each make. Selecting a make should only show these.
export const MODELS_BY_MAKE: Record<string, string[]> = {
  Toyota: ["Crysta", "Hycross", "Fortuner", "Vellfire","Coaster","Commuter"],
  Maruti: ["Dzire", "Ertiga", "Ciaz", "Invicto"],
  Suzuki: ["Dzire", "Ertiga", "Ciaz", "Invicto"],
  Kia: ["Sonet", "Seltos", "Carens", "Carnival", "Carnival 6-CRN-L", "Carnival 6-CRN-L+", "Carnival 6-CRN-P"],
  Mahindra:["XUV 700"],
  Audi: ["Q3", "A4", "A6", "Q7", "Q5", "Q8"],
  "Mercedes Benz": [
    "A Class",
    "GLA",
    "C Class",
    "S Class",
    "E Class",
    "EQS",
    "GLB",
    "GLC",
    "G Class",
    "V Class",
  ],
  Hyundai: ["Creta", "Venue", "i20", "Verna", "Alcazar", "Exter", "Tucson"],
  Honda: ["City", "Amaze", "Elevate", "Civic", "Jazz", "WR-V", "CR-V"],
  BMW: ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7"],
  "Force Motors": ["Traveller", "Urbania","Mono Bus"],
  "Ashok Leyland": ["Lux Bus", "Mini Bus", "SLP"],
  "Bharat Benz": ["Lux Bus", "Mini Bus", "SLP","Motor Home", "Bharat Benz Staff","Bharat Benz Tourist"],
  Eicher: ["Lux Bus", "Mini Bus", "SLP"],
  "SML Mahindra": ["Lux Bus", "Mini Bus", "SLP"],
  Tata: ["Lux Bus", "Mini Bus", "SLP"],
  Volvo: [
  "Lux Bus",
  "VO96",
  "VO96x",
  "VO94",
  "VO96 w",
  "VO94 w",
  "SS-V96",
  "SS-V94",
  "SS-V96 w",
  "SS-V94 w",
  "SL VO94",
  "SL VO96",
  "SL VO94 w",
  "SL VO96 w",
  "VO96SLX",
  "VO96SLX w",
  "SLP"
],
"Volvo Eicher": ["Lux bus", "Mini Bus", "SLP"],
};

// Flat list of every model (de-duplicated), useful as a fallback.
export const MODEL_OPTIONS: string[] = Array.from(
  new Set(Object.values(MODELS_BY_MAKE).flat()),
);

// Returns models for the selected make; all models if no make is selected.
export const getModelsByMake = (make: string): string[] =>
  make ? (MODELS_BY_MAKE[make] ?? []) : MODEL_OPTIONS;

export const CATEGORY_OPTIONS: string[] = [
  "Car",
  "SUV",
  "Lux Car",
  "Lux SUVs",
  "Lux Van",
  "Traveller",
  "Urbania",
  "Modified Urbania",
  "Mini Bus",
  "Lux Bus",
  "Semi-Sleeper Bus",
  "Semi-Sleeper Bus With Washroom",
  "Semi-Sleeper Bus With Washroom + Fridge",
  "Sleeper Bus",
  "Sleeper Bus With Washroom",
  "Sleeper Bus With Washroom + Fridge",
  "Bus with Washroom",
  "Mini Bus with Washroom",
  "Mini Bus with Washroom + Fridge",
  "Caravan",
];

export const AMENITIES_OPTIONS: AmenityCategory[] = [
  {
    label: "Body Type",
    image: bodyTypeImage,
    options: [
      { code: "MOD", label: "Modified" },
      { code: "RAW", label: "Rohit Auto Wheel" },
      { code: "RCE", label: "RCE" },
      { code: "SYN", label: "Synaty" },
      { code: "BUS", label: "Sheena" },
    ],
  },

  {
    label: "Seats",
    image: seatsImage,
    options: [
      { code: "NRS", label: "Non-Recline Seat" },
      { code: "RS", label: "Recline Seats" },
      { code: "VIP RS", label: "VIP Maharaja Recline Seat" },
      { code: "NSB", label: "No Seat Belts" },
      { code: "SB", label: "Seat Belts" },
      { code: "3SB", label: "3 Point Seat Belts" },
      { code: "ESM", label: "Electronic Seat Massager" },
      { code: "ESV", label: "Electronic Seat Ventilation" },
      { code: "SS", label: "Semi Sleeper" },
      {
        code: "HR AR LR",
        label: "Head Rest, Arm Rest, Leg Rest",
      },
      {
        code: "MCP 4/8/12",
        label: "Mobile Charging Points",
      },
    ],
  },

  {
    label: "Audio",
    image: audioImage,
    options: [
      { code: "MS", label: "Basic Music System" },
      {
        code: "MSB",
        label: "Music System + Bluetooth",
      },
      {
        code: "MSBA",
        label: "Music System + BT + Android Auto",
      },
      {
        code: "SPK",
        label: "Normal Speakers",
      },
      {
        code: "SPK JB / SPK PI",
        label: "Power Speakers - JBL / Pioneer",
      },
      {
        code: "SPK JB SUB / SPK PI SUB",
        label: "Power Speakers + JBL / Pioneer + Sub-Woofer",
      },
    ],
  },
  {
    label: "Luggage",
    image: luggageImage,
    options: [
      {
        code: "LRC",
        label: "Roof Carrier",
      },
      {
        code: "LRB",
        label: "Rear Boot Luggage",
      },
      {
        code: "LSB",
        label: "Side Bottom",
      },
      {
        code: "LHD",
        label: "Head Rack, Inside Cabin Luggage",
      },
    ],
  },

  {
    label: "Window Type",
    image: windowTypeImage,
    options: [
      {
        code: "SLG",
        label: "Sliding Glass",
      },
      {
        code: "PKG",
        label: "Pack Glass",
      },
      {
        code: "PKGW",
        label: "Pack Glass + Small Openable Window",
      },
    ],
  },

  {
    label: "Curtain Type",
    image: curtainTypeImage,
    options: [
      {
        code: "NC",
        label: "No Curtains due to Govt.",
      },
      {
        code: "CR",
        label: "Cloth or Rexene",
      },
      {
        code: "RW",
        label: "Roller Blinds",
      },
    ],
  },

  {
    label: "A/C",
    image: acImage,
    options: [
      {
        code: "F&R",
        label: "Front & Rear A/C Vents",
      },
      {
        code: "IAV",
        label: "Individual A/C Vents",
      },
      {
        code: "IAVL",
        label: "Individual A/C Vents + Reading Lights",
      },
    ],
  },

  {
    label: "Video",
    image: videoImage,
    options: [
      {
        code: "TV",
        label: "TV Non-HD",
      },
      {
        code: "TVHD",
        label: "HD TV",
      },
      {
        code: "TVHDS",
        label: "HD Smart TV",
      },
    ],
  },
];