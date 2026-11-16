"use client";

import React, { useMemo, useState } from "react";
import {
  Loader2,
  X,
  CalendarCheck,
  Car,
  CheckCircle2,
  Minus,
  ChevronDown,
  Tag,
  RotateCcw,
  CalendarDays,
  Calendar,
} from "lucide-react";

// =====================================================
// TYPES
// =====================================================

export interface VehicleManagerRow {
  id: number | string;
  code?: string;
  vendor?: string;
  model?: string;
  veh_no?: string;
  city?: string;
  city_name?: string;
  reg_date?: string;
  garage?: string;
  seat?: string;
  variant?: string;
  category?: string;
  aging?: string | number;
  amenities?: string;
  status?: string;
  config?: string | any;
}

type CellStatus = "available" | "booked" | "na";

interface AvailabilityCell {
  value: number | null;
  // API se status aaye toh yahan set karo. Na aaye toh value se decide hoga.
  status?: CellStatus;
}

interface AvailabilityMonth {
  label: string;
  days: number;
  cells: (AvailabilityCell | null)[];
}

interface VehicleManagerCalenderPopupProps {
  vehicle: VehicleManagerRow;
  onClose: () => void;
}

// =====================================================
// CONSTANTS
// =====================================================

// Financial-year month order (Apr -> Mar)
const FY_MONTHS = [
  { label: "APR", full: "April", days: 30 },
  { label: "MAY", full: "May", days: 31 },
  { label: "JUN", full: "June", days: 30 },
  { label: "JUL", full: "July", days: 31 },
  { label: "AUG", full: "August", days: 31 },
  { label: "SEP", full: "September", days: 30 },
  { label: "OCT", full: "October", days: 31 },
  { label: "NOV", full: "November", days: 30 },
  { label: "DEC", full: "December", days: 31 },
  { label: "JAN", full: "January", days: 31 },
  { label: "FEB", full: "February", days: 28 },
  { label: "MAR", full: "March", days: 31 },
];

const buildEmptyCalendar = (): AvailabilityMonth[] =>
  FY_MONTHS.map(({ label, days }) => ({
    label,
    days,
    cells: Array.from({ length: 31 }, (_, dIdx) =>
      dIdx + 1 > days ? null : { value: null },
    ),
  }));

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];

// =====================================================
// HELPERS
// =====================================================

// status na ho toh: value null -> not available, 0 -> booked, baaki -> available
const resolveStatus = (cell: AvailabilityCell): CellStatus => {
  if (cell.status) return cell.status;
  if (cell.value === null || cell.value === undefined) return "na";
  if (cell.value === 0) return "booked";
  return "available";
};

// =====================================================
// SMALL UI PIECES
// =====================================================

const AvailabilityIcon: React.FC<{ status: CellStatus }> = ({ status }) => {
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

const FilterBox: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon, children }) => (
  <div className="flex min-w-[170px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
    <span className="text-blue-600">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      {children}
    </div>
  </div>
);

// =====================================================
// COMPONENT
// =====================================================

const VehicleManagerCalenderPopup: React.FC<
  VehicleManagerCalenderPopupProps
> = ({ vehicle, onClose }) => {
  const [calendarData] = useState<AvailabilityMonth[]>(buildEmptyCalendar());
  const [loading] = useState(false);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  // TODO: Real API call yahan lagao (selectedYear change hone par dobara fetch):
  //
  // useEffect(() => {
  //   const load = async () => {
  //     setLoading(true);
  //     const result = await dispatch(
  //       getVehicleAvailability({ vehicleId: vehicle.id, year: selectedYear }),
  //     ).unwrap();
  //
  //     setCalendarData((prev) =>
  //       prev.map((month) => ({
  //         ...month,
  //         cells: month.cells.map((cell, dIdx) => {
  //           if (cell === null) return null;
  //           const found = result.find(
  //             (r) => r.month === month.label && r.day === dIdx + 1,
  //           );
  //           return {
  //             value: found ? found.value : null,
  //             status: found?.status, // "available" | "booked" | "na"
  //           };
  //         }),
  //       })),
  //     );
  //     setLoading(false);
  //   };
  //   load();
  // }, [vehicle.id, selectedYear]);

  const visibleMonths = useMemo(
    () =>
      selectedMonth === "ALL"
        ? calendarData
        : calendarData.filter((m) => m.label === selectedMonth),
    [calendarData, selectedMonth],
  );

  const handleReset = () => {
    setSelectedYear(currentYear);
    setSelectedMonth("ALL");
  };

  const selectClass =
    "w-full cursor-pointer appearance-none bg-transparent pr-6 text-sm font-bold text-slate-900 outline-none";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-sky-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =============== HEADER =============== */}
        <div className="flex shrink-0 items-center justify-between gap-4 px-6 pb-3 pt-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-300/50">
              <CalendarCheck size={26} />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Availability Calendar
              </h3>
              <p className="text-sm text-slate-500">
                {vehicle.veh_no || vehicle.code || "-"} —{" "}
                {vehicle.vendor || "-"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={22} />
          </button>
        </div>

        {/* =============== FILTER BAR =============== */}
        <div className="mx-6 mb-4 shrink-0 rounded-2xl border border-white bg-white/70 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <FilterBox label="Vehicle Code" icon={<Car size={20} />}>
              <p className="truncate text-sm font-bold text-slate-900">
                {vehicle.code || "-"}
              </p>
            </FilterBox>

            <FilterBox label="Variant" icon={<Tag size={20} />}>
              <p className="truncate text-sm font-bold text-slate-900">
                {vehicle.variant || "-"}
              </p>
            </FilterBox>

            <FilterBox label="Year" icon={<Calendar size={20} />}>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className={selectClass}
                >
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </FilterBox>

            <FilterBox label="Month" icon={<CalendarDays size={20} />}>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={selectClass}
                >
                  <option value="ALL">All Months</option>
                  {FY_MONTHS.map((m) => (
                    <option key={m.label} value={m.label}>
                      {m.full}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </FilterBox>

            <button
              type="button"
              onClick={handleReset}
              className="flex h-[52px] items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* =============== CALENDAR GRID =============== */}
        <div className="min-h-0 flex-1 px-6">
          <div className="max-h-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
                <Loader2 size={22} className="animate-spin" />
                <span className="font-semibold">Loading availability...</span>
              </div>
            ) : (
              <table className="w-full border-separate border-spacing-0 text-center text-xs">
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th className="sticky left-0 z-30 whitespace-nowrap bg-[#0b2a6b] px-5 py-4 text-left text-sm font-bold text-white">
                      Month
                    </th>

                    {Array.from({ length: 31 }, (_, i) => (
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
                  {visibleMonths.map((month) => (
                    <tr key={month.label} className="hover:bg-blue-50/40">
                      <td className="sticky left-0 z-10 whitespace-nowrap border-b border-slate-100 bg-white px-5 py-2.5 text-left text-sm font-extrabold text-[#0b2a6b]">
                        {month.label}
                      </td>

                      {month.cells.map((cell, dIdx) => (
                        <td
                          key={dIdx}
                          className="border-b border-slate-100 px-1 py-2"
                        >
                          {cell === null ? (
                            <span className="mx-auto block h-8 w-8 rounded-lg bg-slate-50" />
                          ) : (
                            <span className="mx-auto flex w-fit">
                              <AvailabilityIcon status={resolveStatus(cell)} />
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* =============== FOOTER / LEGEND =============== */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-700">
            <span className="flex items-center gap-2">
              <AvailabilityIcon status="available" />
              Available
            </span>
            <span className="flex items-center gap-2">
              <AvailabilityIcon status="booked" />
              Booked
            </span>
            <span className="flex items-center gap-2">
              <AvailabilityIcon status="na" />
              Not Available
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-600">
            Showing {visibleMonths.length} of {calendarData.length} Months ·{" "}
            {selectedYear}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagerCalenderPopup;
