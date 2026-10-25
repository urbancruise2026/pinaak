"use client";

import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

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

interface AvailabilityCell {
  value: number | null;
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

// Financial-year month order (Apr -> Mar) used by the availability calendar
const FY_MONTHS = [
  { label: "APR", days: 30 },
  { label: "MAY", days: 31 },
  { label: "JUN", days: 30 },
  { label: "JUL", days: 31 },
  { label: "AUG", days: 31 },
  { label: "SEP", days: 30 },
  { label: "OCT", days: 31 },
  { label: "NOV", days: 30 },
  { label: "DEC", days: 31 },
  { label: "JAN", days: 31 },
  { label: "FEB", days: 28 },
  { label: "MAR", days: 31 },
];

// Empty grid shape (all cells blank) until real data is wired up
const buildEmptyCalendar = (): AvailabilityMonth[] =>
  FY_MONTHS.map((month) => ({
    ...month,
    cells: Array.from({ length: 31 }, (_, dIdx) =>
      dIdx + 1 > month.days ? null : { value: null },
    ),
  }));

// =====================================================
// COMPONENT
// =====================================================

const VehicleManagerCalenderPopup: React.FC<
  VehicleManagerCalenderPopupProps
> = ({ vehicle, onClose }) => {
  const [calendarData, setCalendarData] =
    useState<AvailabilityMonth[]>(buildEmptyCalendar());
  const [loading, setLoading] = useState(false);

  // TODO: Replace with a real API call, e.g.
  //
  // useEffect(() => {
  //   const load = async () => {
  //     setLoading(true);
  //     const result = await dispatch(
  //       getVehicleAvailability({ vehicleId: vehicle.id }),
  //     ).unwrap();
  //
  //     // Map API response into the same { label, days, cells } shape
  //     setCalendarData((prev) =>
  //       prev.map((month) => ({
  //         ...month,
  //         cells: month.cells.map((cell, dIdx) => {
  //           if (cell === null) return null;
  //           const day = dIdx + 1;
  //           const found = result.find(
  //             (r) => r.month === month.label && r.day === day,
  //           );
  //           return { value: found ? found.value : null };
  //         }),
  //       })),
  //     );
  //     setLoading(false);
  //   };
  //
  //   load();
  // }, [vehicle.id]);

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-6xl
          overflow-hidden
          rounded-xl
          bg-white
          shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            bg-white
            px-5
            py-4
          "
        >
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Availability Calendar
            </h3>
            <p className="text-sm text-gray-500">
              {vehicle.veh_no || vehicle.code || "-"} — {vehicle.vendor || "-"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-full
              p-2
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-800
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* CALENDAR GRID */}
        <div className="max-h-[90vh] overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-14 text-gray-500">
              <Loader2 size={22} className="animate-spin" />
              <span className="font-semibold">Loading availability...</span>
            </div>
          ) : (
            <table className=" w-full border-collapse text-center text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-700 text-white">
                  <th
                    className="
                      sticky
                      left-0
                      z-20
                      whitespace-nowrap
                      bg-gray-700
                      px-3
                      py-3
                      text-left
                      text-sm
                    "
                  >
                    MONTH
                  </th>

                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i} className="px-2 py-3 font-semibold">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {calendarData.map((month) => (
                  <tr key={month.label}>
                    <td
                      className="
                        sticky
                        left-0
                        z-10
                        whitespace-nowrap
                        border
                        border-gray-200
                        bg-gray-50
                        px-3
                        py-2.5
                        text-left
                        text-sm
                        font-bold
                        text-gray-700
                      "
                    >
                      {month.label}
                    </td>

                    {month.cells.map((cell, dIdx) => {
                      if (cell === null) {
                        return (
                          <td
                            key={dIdx}
                            className="border border-gray-200 bg-gray-50 px-2 py-2.5"
                          />
                        );
                      }

                      return (
                        <td
                          key={dIdx}
                          className="border border-gray-200 px-2 py-2.5 font-medium text-gray-700"
                        >
                          {cell.value ?? "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagerCalenderPopup;
