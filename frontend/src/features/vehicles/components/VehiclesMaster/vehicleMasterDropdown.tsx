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
  "Bharat Benz",
  "Eicher",
  "Force Motors",
  "Mercedes Benz",
  "SML Mahindra",
  "Suzuki",
  "Tata",
  "Toyato",
  "Volvo",
];

export const MODEL_OPTIONS: string[] = [
  "Crysta",
  "Ertiga",
  "Lux Bus",
  "Mini Bus",
  "Traveller",
  "Urbania",
  "Vellfire",
];

export const CATEGORY_OPTIONS: string[] = [
  "Car",
  "SUV",
  "Lux Car",
  "Lux SUVs",
  "Lux Van",
  "Traveller",
  "Urbania",
  "Mini Bus",
  "Lux Bus",
  "Semi-Sleeper Bus",
  "Sleeper Bus",
  "Bus with Washroom",
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
