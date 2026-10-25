"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Info,
  FileText,
  Luggage,
  GripVertical,
  X,
  Briefcase,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

import { TextField, TextAreaField, type Theme } from "./FormParts";
import { THEMES as T } from "./constants";
import type { useRateQuotationForm } from "./useRateQuotationForm";

type FormHook = ReturnType<typeof useRateQuotationForm>;

type City = { id?: string | number; uuid?: string; cityName: string };

/* =========================================================
   DEFAULT OPTIONS  (props se override kar sakte ho)
========================================================= */

const DEFAULT_SERVICE_TYPES = ["One Way", "Round Trip", "Pick & Drop"];

const DEFAULT_TRIP_TYPES = ["Point to Point", "Local"];

const DEFAULT_OCCASIONS = [
  "Vacation",
  "Business",
  "Wedding",
  "Corporate",
  "Other",
];

const MAX_ITINERARY = 25;

/* Customer Information wali same theme (violet) */
const theme: Theme = T.customer;

/* =========================================================
   STYLES  (FormParts ke TextField jaise)
========================================================= */

const LABEL = "mb-1.5 block text-sm font-medium text-gray-700";

const INPUT_BASE =
  "w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500";

const BADGE_INPUT =
  "w-full rounded-lg border text-center text-xl font-extrabold text-white outline-none placeholder:text-white/70 py-2 focus:ring-2 focus:ring-violet-200";

const CARD = "rounded-xl border border-violet-100 bg-white p-4 shadow-sm";

const CARD_TITLE = "mb-4 block text-base font-bold text-violet-700";

/* =========================================================
   HELPERS
========================================================= */

function parseItinerary(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);

  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* plain text, neeche split hoga */
    }

    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

/* Select dropdown - TextField jaisa hi look */
function SelectField({
  label,
  name,
  value,
  onChange,
  Icon,
  placeholder,
  options,
  wrapperClassName,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  Icon?: LucideIcon;
  placeholder: string;
  options: string[];
  wrapperClassName?: string;
}) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={name} className={LABEL}>
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${theme.icon}`}
          />
        )}

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`${INPUT_BASE} appearance-none pr-8 ${
            Icon ? "pl-10" : "pl-3.5"
          } ${theme.focus}`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

/* Field ke upar right side ka chhota (i) icon */
function WithInfo({
  className,
  tip,
  children,
}: {
  className: string;
  tip: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      <Info
        size={15}
        title={tip}
        className="absolute right-0 top-1 z-10 cursor-help text-blue-500"
      />
      {children}
    </div>
  );
}

/* =========================================================
   TRAVEL REQUIREMENTS (main section)
========================================================= */

export default function TravelRequirementsSection({
  f,
  number = 2,
  cities,
  serviceTypes = DEFAULT_SERVICE_TYPES,
  tripTypes = DEFAULT_TRIP_TYPES,
  occasions = DEFAULT_OCCASIONS,
}: {
  f: FormHook;
  number?: number;
  /** cities do ge to Pickup/Drop City dropdown banega, warna text box */
  cities?: City[];
  serviceTypes?: string[];
  tripTypes?: string[];
  occasions?: string[];
}) {
  /* ---------- form value padhna / likhna ---------- */

  const get = (name: string) => (f.form as any)[name] ?? "";

  /* TextField / SelectField ke liye: name + value + onChange */
  const bind = (name: string) => ({
    name,
    value: get(name) as string | number,
    onChange: f.handleChange,
  });

  /* code se value set karne ke liye (itinerary, days, serviceType) */
  const set = (name: string, value: unknown) =>
    f.handleChange({ target: { name, value } } as any);

  /* ---------- derived ---------- */

  const serviceType = String(get("serviceType"));
  const isPickDrop = serviceType === "Pick & Drop";
  const isRound = serviceType === "Round Trip";

  const totalBaggage =
    (Number(get("smallbaggage")) || 0) +
    (Number(get("mediumbaggage")) || 0) +
    (Number(get("largebaggage")) || 0) +
    (Number(get("airportbaggage")) || 0);

  const cityNames = (cities || []).map((c) => c.cityName);

  /* ---------- itinerary list ---------- */

  const itineraryList = parseItinerary(get("itinerary"));
  const [currentItinerary, setCurrentItinerary] = useState("");

  const saveItinerary = (list: string[]) =>
    set("itinerary", list.length ? JSON.stringify(list) : "");

  const addItinerary = () => {
    const value = currentItinerary.trim();
    if (!value || itineraryList.length >= MAX_ITINERARY) return;
    saveItinerary([...itineraryList, value]);
    setCurrentItinerary("");
  };

  const removeItinerary = (idx: number) =>
    saveItinerary(itineraryList.filter((_, i) => i !== idx));

  const dropItinerary = (e: React.DragEvent, idx: number) => {
    const from = parseInt(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(from) || from === idx) return;
    const next = [...itineraryList];
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    saveItinerary(next);
  };

  /* ---------- city field (select ya text) ---------- */

  const renderCity = (
    name: string,
    label: string,
    placeholder: string,
    wrapperClassName: string,
  ) =>
    cityNames.length ? (
      <SelectField
        label={label}
        Icon={MapPin}
        placeholder={placeholder}
        options={cityNames}
        wrapperClassName={wrapperClassName}
        {...bind(name)}
        value={String(get(name))}
      />
    ) : (
      <TextField
        label={label}
        Icon={MapPin}
        theme={theme}
        placeholder={placeholder}
        wrapperClassName={wrapperClassName}
        {...bind(name)}
      />
    );

  return (
    <div className="rounded-xl border bg-red-50 p-4 md:p-6">
      {/* MAIN HEADER */}
      <div className="mb-6 border-b pb-3 text-xl font-semibold text-red-800">
        <span className="mr-2 rounded-md bg-red-600 px-3 py-1 text-white">
          {number}
        </span>
        Travel Requirements (Data From Lead Manager)
      </div>

      <div className="space-y-5">
        {/* =====================================================
            TRAVEL DATES
        ===================================================== */}
        <div className={CARD}>
          <span className={CARD_TITLE}>Travel Dates</span>

          {/* ---------- ROW 1 : PICKUP ---------- */}
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <WithInfo className="w-full md:w-[20%]" tip="Pickup date & time">
              <TextField
                label="Pickup Date & Time"
                Icon={Calendar}
                theme={theme}
                type="datetime-local"
                {...bind("pickupDateTime")}
              />
            </WithInfo>

            {renderCity(
              "pickupcity",
              "Pickup City",
              "Select Pickup City",
              "w-full md:w-[20%]",
            )}

            <WithInfo className="w-full md:w-[40%]" tip="Main pickup address">
              <TextField
                label="Pickup Address"
                Icon={MapPin}
                theme={theme}
                placeholder="Enter pickup address"
                {...bind("pickupAddress")}
              />
            </WithInfo>

            <WithInfo
              className="w-full md:w-[30%]"
              tip="Extra pickup locations"
            >
              <TextField
                label="Additional Pickup Addresses"
                Icon={MapPin}
                theme={theme}
                placeholder="multiple pickup city"
                {...bind("multiplepickup")}
              />
            </WithInfo>

            <div className="w-full md:w-[10%]">
              <label htmlFor="days" className={LABEL}>
                No. of Days
              </label>
              <div className="relative">
                <input
                  id="days"
                  type="number"
                  min="0"
                  readOnly={isPickDrop}
                  placeholder="Days"
                  className={`${BADGE_INPUT} pl-3 pr-12 ${
                    isPickDrop
                      ? "cursor-not-allowed border-purple-400 bg-purple-400"
                      : "border-purple-600 bg-purple-600"
                  }`}
                  {...bind("days")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white">
                  days
                </span>
              </div>
            </div>
          </div>

          {/* ---------- ROW 2 : DROP ---------- */}
          <div className="flex flex-col gap-4 md:flex-row">
            <TextField
              label="Drop Date & Time"
              Icon={Calendar}
              theme={theme}
              type="datetime-local"
              min={String(get("pickupDateTime")) || undefined}
              wrapperClassName="w-full md:w-[20%]"
              {...bind("dropDateTime")}
            />

            {serviceType !== "One Way" && (
              <>
                {renderCity(
                  "dropcity",
                  "Drop City",
                  "Select Drop City",
                  "w-full md:w-[15%]",
                )}

                <TextField
                  label="Drop Address"
                  Icon={MapPin}
                  theme={theme}
                  placeholder="Enter drop address"
                  wrapperClassName="w-full md:w-[30%]"
                  {...bind("dropAddress")}
                />

                <WithInfo
                  className="w-full md:w-[30%]"
                  tip="Extra drop locations"
                >
                  <TextField
                    label="Additional Drop Addresses"
                    Icon={MapPin}
                    theme={theme}
                    placeholder="multiple drop city"
                    {...bind("multipledrop")}
                  />
                </WithInfo>
              </>
            )}

            <SelectField
              label="Service"
              Icon={Briefcase}
              placeholder="Select"
              options={serviceTypes}
              wrapperClassName="w-full md:w-[15%]"
              name="serviceType"
              value={serviceType}
              onChange={(e) => {
                set("serviceType", e.target.value);
                if (e.target.value === "Pick & Drop") set("days", 2);
              }}
            />

            {isRound && (
              <div className="w-full md:w-[20%]">
                <label className={LABEL}>Trip Type</label>
                <div className="mt-3 flex items-center gap-6">
                  {tripTypes.map((type) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="tripType"
                        value={type}
                        checked={String(get("tripType")) === type}
                        onChange={() => set("tripType", type)}
                        className="accent-violet-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            ITINERARY DETAILS
        ===================================================== */}
        <div className={CARD}>
          <span className={CARD_TITLE}>Itinerary Details</span>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Enter dabane par item add hota hai */}
            <div
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItinerary();
                }
              }}
            >
              <TextField
                label="Add Itinerary"
                name="addItinerary"
                Icon={FileText}
                theme={theme}
                placeholder="Enter itinerary item"
                value={currentItinerary}
                onChange={(e) => setCurrentItinerary(e.target.value)}
              />
            </div>

            <div>
              <label className={LABEL}>
                Added Itineraries ({itineraryList.length}/{MAX_ITINERARY})
              </label>

              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {itineraryList.map((item, idx) => (
                  <div
                    key={`${item}-${idx}`}
                    className="flex cursor-move items-center gap-1 rounded bg-purple-100 px-2 py-1 text-sm text-purple-800"
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/plain", idx.toString())
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => dropItinerary(e, idx)}
                  >
                    <GripVertical size={14} className="text-purple-600" />
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeItinerary(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label htmlFor="km" className={LABEL}>
                Actual KM
              </label>
              <div className="relative max-w-[180px]">
                <input
                  id="km"
                  type="number"
                  min="0"
                  placeholder="Total KM"
                  className={`${BADGE_INPUT} border-purple-600 bg-purple-600 pl-8 pr-10`}
                  {...bind("km")}
                />
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white">
                  📍
                </span>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white">
                  KM
                </span>
              </div>
            </div>

            <SelectField
              label="Occasion Type"
              Icon={PartyPopper}
              placeholder="Select Occasion Type"
              options={occasions}
              {...bind("occasion")}
              value={String(get("occasion"))}
            />
          </div>
        </div>

        <div className={CARD}>
          <span className={CARD_TITLE}>Passenger Details</span>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="passengerTotal" className={LABEL}>
                Total Passengers
              </label>
              <div className="relative max-w-[180px]">
                <input
                  id="passengerTotal"
                  type="number"
                  min="1"
                  placeholder="Total Pax"
                  className={`${BADGE_INPUT} border-purple-600 bg-purple-600 pr-12`}
                  {...bind("passengerTotal")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white">
                  Pax
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="petsNumber" className={LABEL}>
                Number of Pets
              </label>
              <div className="relative max-w-[180px]">
                <input
                  id="petsNumber"
                  type="number"
                  min="0"
                  placeholder="No. of pets"
                  className={`${BADGE_INPUT} border-red-600 bg-red-600 pr-12`}
                  {...bind("petsNumber")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white">
                  pets
                </span>
              </div>
            </div>

            <TextField
              label="Pet Names"
              Icon={FileText}
              theme={theme}
              placeholder="Enter pet names"
              {...bind("petsNames")}
            />
          </div>
        </div>

        {/* =====================================================
            BAGGAGE DETAILS
        ===================================================== */}
        <div className={CARD}>
          <span className={CARD_TITLE}>Baggage Details</span>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {[
              ["smallbaggage", "Small Baggage"],
              ["mediumbaggage", "Medium Baggage"],
              ["largebaggage", "Large Baggage"],
              ["airportbaggage", "Airport Baggage"],
            ].map(([name, label]) => (
              <TextField
                key={name}
                label={label}
                Icon={Luggage}
                theme={theme}
                type="number"
                min="0"
                placeholder={label}
                {...bind(name)}
              />
            ))}

            <div>
              <label className={LABEL}>Total Baggage</label>
              <div className="relative">
                <input
                  type="number"
                  readOnly
                  value={totalBaggage}
                  className={`${BADGE_INPUT} border-purple-600 bg-purple-600 pl-9`}
                />
                <Luggage
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            REMARKS
        ===================================================== */}
        <div className={CARD}>
          <TextAreaField
            label="Remark"
            Icon={FileText}
            theme={theme}
            rows={4}
            placeholder="Enter your remark..."
            name="remarks"
            value={String(get("remarks"))}
            onChange={f.handleChange}
          />
        </div>
      </div>
    </div>
  );
}
