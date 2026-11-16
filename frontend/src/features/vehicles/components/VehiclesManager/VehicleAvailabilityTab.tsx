"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Car,
  Tag,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Minus,
  ChevronDown,
  Check,
  RotateCcw,
  Search,
  Loader2,
} from "lucide-react";
import type { VehicleManagerRow } from "./VehicleManagerCalenderPopup";

// =====================================================
// TYPES
// =====================================================

type CellStatus = "available" | "booked" | "na";

interface Props {
  vehicles: VehicleManagerRow[];
  loading?: boolean;
  // Optional: API se aaya data. key = `${vehicleId}_${YYYY-MM-DD}`
  availability?: Record<string, CellStatus>;
}

interface DropdownOption {
  value: string | number;
  label: string;
}

// =====================================================
// DUMMY DATA SETTINGS
// =====================================================

// Real API connect karte waqt isko false kar do
const USE_DUMMY_DATA = true;

// Agar list me ek bhi vehicle na ho toh ye dummy vehicles dikhenge
const DUMMY_VEHICLES: VehicleManagerRow[] = [
  { id: 101, code: "11-UB-1x11-FM-URB", veh_no: "UP78BK1234", variant: "RYL" },
  { id: 102, code: "12-TA-1x1-FM-TRV", veh_no: "UP78BK1235", variant: "RYL" },
  { id: 103, code: "07-SW-2x2-FM-SWF", veh_no: "UP78BK1236", variant: "STD" },
  { id: 104, code: "09-IN-2x3-FM-INN", veh_no: "UP78BK1237", variant: "STD" },
  { id: 105, code: "14-TA-1x1-FM-TRV", veh_no: "UP78BK1238", variant: "RYL" },
  { id: 106, code: "03-UB-1x11-FM-URB", veh_no: "UP78BK1239", variant: "PRM" },
];

// Same input par hamesha same output deta hai (random nahi badlta)
const hashString = (text: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 100;
};

const dummyStatus = (
  vehicleId: number | string,
  dateKey: string,
): CellStatus => {
  const n = hashString(`${vehicleId}-${dateKey}`);
  if (n < 62) return "available"; // ~62%
  if (n < 82) return "booked"; // ~20%
  return "na"; // ~18%
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const now = new Date();
const currentYear = now.getFullYear();
const YEAR_OPTIONS: DropdownOption[] = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - 2 + i;
  return { value: y, label: String(y) };
});
const MONTH_OPTIONS: DropdownOption[] = MONTHS.map((m, i) => ({
  value: i,
  label: m,
}));

const pad = (n: number) => String(n).padStart(2, "0");

// =====================================================
// STATUS ICON
// =====================================================

const StatusIcon: React.FC<{ status: CellStatus }> = ({ status }) => {
  if (status === "available") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
        <CheckCircle2 size={17} className="text-green-500" />
      </span>
    );
  }
  if (status === "booked") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
        <Car size={16} className="text-red-500" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
      <Minus size={14} className="text-slate-400" />
    </span>
  );
};

// =====================================================
// CUSTOM DROPDOWN
// =====================================================

const FilterDropdown: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string | number) => void;
}> = ({ label, icon, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`relative min-w-[190px] flex-1 ${open ? "z-40" : "z-10"}`}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left shadow-sm transition-all duration-200 ${
          open
            ? "border-blue-400 ring-4 ring-blue-100"
            : "border-slate-200 hover:border-blue-300 hover:shadow-md"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium leading-tight text-slate-500">
            {label}
          </span>
          <span className="block truncate text-sm font-bold leading-tight text-slate-900">
            {selected?.label ?? "Select"}
          </span>
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_40px_rgba(30,64,175,0.18)]"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-blue-50 font-bold text-blue-700"
                    : "font-medium text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={16} className="shrink-0 text-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// =====================================================
// COMPONENT
// =====================================================

const VehicleAvailabilityTab: React.FC<Props> = ({
  vehicles: vehiclesProp,
  loading = false,
  availability = {},
}) => {
  // Dummy mode me: list khaali ho toh dummy vehicles use karo
  const vehicles = useMemo<VehicleManagerRow[]>(
    () =>
      USE_DUMMY_DATA && vehiclesProp.length === 0
        ? DUMMY_VEHICLES
        : vehiclesProp,
    [vehiclesProp],
  );

  // draft = dropdown me jo select ho raha hai
  const [draftCode, setDraftCode] = useState<string | number>("ALL");
  const [draftVariant, setDraftVariant] = useState<string | number>("ALL");
  const [draftYear, setDraftYear] = useState<string | number>(currentYear);
  const [draftMonth, setDraftMonth] = useState<string | number>(now.getMonth());

  // applied = "Apply Filter" dabane ke baad grid me lagta hai
  const [code, setCode] = useState<string | number>("ALL");
  const [variant, setVariant] = useState<string | number>("ALL");
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(now.getMonth());

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const codeOptions: DropdownOption[] = useMemo(
    () => [
      { value: "ALL", label: "All Vehicles" },
      ...(
        Array.from(
          new Set(vehicles.map((v) => v.code).filter(Boolean)),
        ) as string[]
      ).map((c) => ({ value: c, label: c })),
    ],
    [vehicles],
  );

  const variantOptions: DropdownOption[] = useMemo(
    () => [
      { value: "ALL", label: "All Variants" },
      ...(
        Array.from(
          new Set(vehicles.map((v) => v.variant).filter(Boolean)),
        ) as string[]
      ).map((v) => ({ value: v, label: v })),
    ],
    [vehicles],
  );

  const rows = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (code === "ALL" || v.code === code) &&
          (variant === "ALL" || v.variant === variant),
      ),
    [vehicles, code, variant],
  );

  const getStatus = (vehicleId: number | string, day: number): CellStatus => {
    const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;

    // 1) Real API data ho toh wahi use hoga
    const real = availability[`${vehicleId}_${dateKey}`];
    if (real) return real;

    // 2) Warna dummy data
    if (USE_DUMMY_DATA) return dummyStatus(vehicleId, dateKey);

    return "na";
  };

  const handleApply = () => {
    setCode(draftCode);
    setVariant(draftVariant);
    setYear(Number(draftYear));
    setMonth(Number(draftMonth));
  };

  const handleReset = () => {
    setDraftCode("ALL");
    setDraftVariant("ALL");
    setDraftYear(currentYear);
    setDraftMonth(now.getMonth());

    setCode("ALL");
    setVariant("ALL");
    setYear(currentYear);
    setMonth(now.getMonth());
  };

  return (
    <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-[0_8px_30px_rgba(30,64,175,0.10)] backdrop-blur">
      {/* HEADER */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-300/50">
          <CalendarDays size={22} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Availability Calendar
          </h2>
          <p className="text-sm text-slate-500">
            Check vehicle availability for selected filters
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="relative z-30 mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-sky-50/60 p-3">
        <FilterDropdown
          label="Vehicle Code"
          icon={<Car size={20} />}
          value={draftCode}
          options={codeOptions}
          onChange={setDraftCode}
        />

        <FilterDropdown
          label="Variant"
          icon={<Tag size={20} />}
          value={draftVariant}
          options={variantOptions}
          onChange={setDraftVariant}
        />

        <FilterDropdown
          label="Year"
          icon={<Calendar size={20} />}
          value={draftYear}
          options={YEAR_OPTIONS}
          onChange={setDraftYear}
        />

        <FilterDropdown
          label="Month"
          icon={<CalendarDays size={20} />}
          value={draftMonth}
          options={MONTH_OPTIONS}
          onChange={setDraftMonth}
        />

        <button
          type="button"
          onClick={handleApply}
          className="flex h-[56px] items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 text-sm font-bold text-white shadow-lg shadow-blue-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
        >
          <Search size={17} />
          Apply Filter
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex h-[56px] items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* GRID */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full border-separate border-spacing-0 text-center text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 whitespace-nowrap bg-[#0b2a6b] px-5 py-4 text-left text-sm font-bold text-white">
                Vehicle Code
              </th>
              <th className="whitespace-nowrap bg-[#0b2a6b] px-5 py-4 text-left text-sm font-bold text-white">
                Vehicle Number
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <th
                  key={i}
                  className="min-w-[44px] bg-[#0b2a6b] px-1 py-4 text-sm font-bold text-white"
                >
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={daysInMonth + 2} className="py-14">
                  <div className="flex items-center justify-center gap-3 text-slate-500">
                    <Loader2 size={22} className="animate-spin" />
                    <span className="font-semibold">
                      Loading availability...
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={daysInMonth + 2}
                  className="py-14 text-sm text-slate-500"
                >
                  No vehicles found.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((v) => (
                <tr key={v.id} className="hover:bg-blue-50/40">
                  <td className="sticky left-0 z-10 whitespace-nowrap border-b border-slate-100 bg-white px-5 py-2.5 text-left text-sm font-extrabold text-[#0b2a6b]">
                    {v.code || "-"}
                  </td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-5 py-2.5 text-left text-sm text-slate-700">
                    {v.veh_no || "-"}
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <td key={i} className="border-b border-slate-100 px-1 py-2">
                      <span className="mx-auto flex w-fit">
                        <StatusIcon status={getStatus(v.id, i + 1)} />
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-700">
          <span className="flex items-center gap-2">
            <StatusIcon status="available" /> Available
          </span>
          <span className="flex items-center gap-2">
            <StatusIcon status="booked" /> Booked
          </span>
          <span className="flex items-center gap-2">
            <StatusIcon status="na" /> Not Available
          </span>
        </div>

        <p className="text-sm font-semibold text-slate-600">
          Showing {rows.length} of {vehicles.length} Vehicles · {MONTHS[month]}{" "}
          {year}
        </p>
      </div>
    </div>
  );
};

export default VehicleAvailabilityTab;
