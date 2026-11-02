"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseDateReport } from "@/features/reports/monthlyReportSlice";
import { AppDispatch } from "@/store/store";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Eye, X, BarChart3, CalendarDays, Users } from "lucide-react";
import employeeDate from "@/assets/images/empforstatus.png";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const MONTH_MAP: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const ALL_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const STATUSES = ["new", "kyc", "rfq", "hot", "vehn", "lost", "book"];

const STATUS_LABELS: Record<string, string> = {
  new: "NEW",
  kyc: "KYC",
  rfq: "RFQ",
  hot: "HOT",
  vehn: "VEH-N",
  lost: "LOST",
  book: "BOOK",
};

// text = number colour, soft = (opaque) tint behind the status name, dot = marker colour.
// Full class names so Tailwind never purges them.
const STATUS_STYLE: Record<
  string,
  { text: string; soft: string; dot: string }
> = {
  new: { text: "text-blue-600", soft: "bg-blue-50", dot: "bg-blue-500" },
  kyc: { text: "text-cyan-800", soft: "bg-cyan-50", dot: "bg-cyan-600" },
  rfq: { text: "text-amber-600", soft: "bg-amber-50", dot: "bg-amber-500" },
  hot: { text: "text-pink-700", soft: "bg-pink-50", dot: "bg-pink-500" },
  vehn: { text: "text-purple-900", soft: "bg-purple-50", dot: "bg-purple-500" },
  lost: { text: "text-red-600", soft: "bg-red-50", dot: "bg-red-500" },
  book: { text: "text-green-800", soft: "bg-green-50", dot: "bg-green-600" },
};

// One colour family per employee block (row tint + name tile). The row tints are
// opaque on purpose: the frozen EMP / Status columns must hide what scrolls under them.
const rowColors = [
  "bg-indigo-50",
  "bg-cyan-50",
  "bg-rose-50",
  "bg-green-50",
  "bg-purple-50",
  "bg-yellow-50",
];

const empTileColors = [
  "bg-indigo-100 text-indigo-800",
  "bg-cyan-100 text-cyan-800",
  "bg-rose-100 text-rose-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-yellow-100 text-yellow-800",
];

// Frozen column geometry (EMP, then Status right after it)
const EMP_W = 40;
const STATUS_W = 82;

const Empreport = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Default: current year & current month
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    ALL_MONTHS[new Date().getMonth()],
  );

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await dispatch(
          fetchStatusWiseDateReport({
            month: MONTH_MAP[selectedMonth],
            year: Number(selectedYear),

            // filters
            regionId: selectedRegion || undefined,
            zoneId: selectedZone || undefined,
            cityId: selectedCity || undefined,
          }),
        ).unwrap();

        const safeEmployees = Array.isArray(result?.data) ? result.data : [];

        setEmployees(safeEmployees);
      } catch (err) {
        console.error("Date Report Error:", err);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    selectedMonth,
    selectedYear,
    selectedRegion,
    selectedZone,
    selectedCity,
    dispatch,
  ]);

  const daysInMonth = new Date(
    Number(selectedYear),
    MONTH_MAP[selectedMonth],
    0,
  ).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Team Total row: all advisers added together, day by day
  const teamDayTotals = daysArray.map((dayNo) =>
    employees.reduce((sum, employee) => {
      const days = Array.isArray(employee?.days) ? employee.days : [];
      const dayData = days.find((d: any) => d.day === dayNo);
      return sum + (Number(dayData?.total) || 0);
    }, 0),
  );
  const teamGrandTotal = employees.reduce(
    (sum, employee) => sum + (Number(employee?.totals?.total) || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* HEADER */}
      <div className="z-30 bg-slate-50/95 px-3 pb-2 pt-3 backdrop-blur sm:px-4 md:sticky md:top-0">
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-white p-3 shadow-[0_6px_20px_rgba(79,70,229,0.08)] sm:p-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Title */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-indigo-300/50 sm:h-14 sm:w-14">
              <BarChart3
                className="h-6 w-6 text-white sm:h-7 sm:w-7"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">
                Employee Performance PS – {selectedMonth} {selectedYear}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Day-wise status counts for each adviser
              </p>
            </div>
          </div>

          {/* Filters: Region / Zone / City / Year, then Month + chart button */}
          <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center">
            <div className="min-w-0 lg:w-[460px] 2xl:w-[540px] [&>div>div]:!max-w-none md:[&>div>div]:!grid-cols-4 [&_select]:!h-11 [&_select]:!rounded-2xl [&_select]:!border-slate-200 [&_select]:!bg-white [&_select]:!text-slate-700 [&_select]:!shadow-sm [&_select]:hover:!border-indigo-300 [&_select]:focus:!border-indigo-400 [&_select]:focus:!ring-indigo-200">
              <AllRegionZoneCityFilter
                selectedRegion={selectedRegion}
                selectedZone={selectedZone}
                selectedCity={selectedCity}
                selectedYear={selectedYear}
                onRegionChange={setSelectedRegion}
                onZoneChange={setSelectedZone}
                onCityChange={setSelectedCity}
                onYearChange={setSelectedYear}
                layout="grid"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Month */}
              <div className="relative min-w-0 flex-1 lg:w-32 lg:flex-none">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  aria-label="Month"
                  className="h-11 w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                >
                  {ALL_MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <CalendarDays
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>

              {/* Chart button */}
              <button
                onClick={() => setShowImageModal(true)}
                className="shrink-0 rounded-full border-2 border-indigo-300 bg-white p-1.5 shadow-sm transition-colors hover:bg-indigo-50"
                title="View Chart"
                aria-label="View Chart"
              >
                <Eye className="h-5 w-5 text-indigo-600 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative mx-4 w-full max-w-6xl rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-indigo-700">
                Employee Reports PS Chart – {selectedMonth} {selectedYear}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EE0000] transition-colors hover:bg-red-700"
              >
                <X className="h-6 w-6 text-white" strokeWidth={3} />
              </button>
            </div>
            <Image
              src={employeeDate}
              alt="Employee Performance TS"
              width={1920}
              height={1080}
              priority
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      <div className="px-3 pb-4 sm:px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-100 bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-3">
            <div className="overflow-x-auto rounded-2xl">
              <table
                className="w-full border-separate text-sm"
                style={{ borderSpacing: 2 }}
              >
                <thead>
                  <tr className="text-white">
                    {/* ✅ EMP - sticky */}
                    <th
                      className="sticky left-0 z-20 rounded-lg bg-slate-800 p-2 text-xs font-extrabold"
                      style={{ width: EMP_W, minWidth: EMP_W }}
                    >
                      EMP
                    </th>
                    {/* ✅ Status - sticky after EMP */}
                    <th
                      className="sticky z-20 rounded-lg bg-slate-800 p-1 text-sm font-extrabold"
                      style={{
                        left: EMP_W,
                        width: STATUS_W,
                        minWidth: STATUS_W,
                      }}
                    >
                      Status
                    </th>
                    {daysArray.map((day) => (
                      <th
                        key={day}
                        className="min-w-[40px] rounded-lg bg-slate-800 p-2 text-sm font-bold"
                      >
                        {day}
                      </th>
                    ))}
                    <th className="min-w-[64px] rounded-lg bg-slate-900 p-2 text-sm font-extrabold">
                      TOTAL
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employees.length > 0 ? (
                    employees.map((employee, empIndex) => {
                      const bgColor = rowColors[empIndex % rowColors.length];
                      const tileColor =
                        empTileColors[empIndex % empTileColors.length];
                      const days = Array.isArray(employee?.days)
                        ? employee.days
                        : [];
                      const totals = employee?.totals || {};

                      return (
                        <React.Fragment key={employee?.adviser_id}>
                          {STATUSES.map((status, statusIdx) => (
                            <tr
                              key={`${employee?.adviser_id}-${status}`}
                              className={bgColor}
                            >
                              {statusIdx === 0 && (
                                <td
                                  rowSpan={STATUSES.length + 1}
                                  className={`sticky left-0 z-10 rounded-xl p-0 text-center align-middle font-bold ${tileColor}`}
                                  style={{
                                    width: EMP_W,
                                    minWidth: EMP_W,
                                    maxWidth: EMP_W,
                                  }}
                                >
                                  <div
                                    className="mx-auto flex items-center justify-center text-sm font-extrabold"
                                    style={{
                                      writingMode: "vertical-rl",
                                      transform: "rotate(180deg)",
                                      whiteSpace: "nowrap",
                                      lineHeight: "16px",
                                      padding: "6px 0",
                                      letterSpacing: "6px",
                                    }}
                                  >
                                    {employee?.adviser_name
                                      ?.toUpperCase()
                                      .replace(/\s+/g, " ")
                                      .trim()}
                                  </div>
                                </td>
                              )}

                              {/* ✅ Status cell - sticky */}
                              <td
                                className={`sticky z-10 rounded-md px-2 py-0.5 text-left text-[13px] font-semibold ${STATUS_STYLE[status].soft} ${STATUS_STYLE[status].text}`}
                                style={{
                                  left: EMP_W,
                                  width: STATUS_W,
                                  minWidth: STATUS_W,
                                }}
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <i
                                    aria-hidden="true"
                                    className={`inline-block h-2 w-2 rounded-full ${STATUS_STYLE[status].dot}`}
                                  />
                                  {STATUS_LABELS[status]}
                                </span>
                              </td>

                              {daysArray.map((dayNo) => {
                                const dayData =
                                  days.find((d: any) => d.day === dayNo) || {};
                                const value = dayData?.[status] || 0;
                                return (
                                  <td
                                    key={dayNo}
                                    className={`text-center text-[13px] font-semibold ${
                                      value > 0
                                        ? STATUS_STYLE[status].text
                                        : "text-slate-300"
                                    }`}
                                  >
                                    {value > 0 ? dayData[status] : "-"}
                                  </td>
                                );
                              })}

                              <td className="rounded-md bg-amber-100 text-center text-[13px] font-bold text-slate-800">
                                {totals[status] || 0}
                              </td>
                            </tr>
                          ))}

                          {/* TOTAL ROW */}
                          <tr className="bg-amber-100 text-base font-extrabold text-slate-800">
                            {/* ✅ TOTAL label - sticky */}
                            <td
                              className="sticky z-10 rounded-md bg-amber-200 px-2 py-1.5 text-center text-sm"
                              style={{
                                left: EMP_W,
                                width: STATUS_W,
                                minWidth: STATUS_W,
                              }}
                            >
                              TOTAL
                            </td>
                            {daysArray.map((dayNo) => {
                              const dayData =
                                days.find((d: any) => d.day === dayNo) || {};
                              const value = dayData?.total || 0;
                              return (
                                <td
                                  key={dayNo}
                                  className={`rounded-md text-center text-sm font-bold ${
                                    value > 0 ? "" : "text-slate-400"
                                  }`}
                                >
                                  {value > 0 ? dayData.total : "-"}
                                </td>
                              );
                            })}
                            <td className="rounded-md bg-amber-300 text-center text-sm font-extrabold">
                              {totals.total || 0}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={daysArray.length + 3}
                        className="py-10 text-center text-gray-500"
                      >
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Team Total – every adviser added together */}
                {employees.length > 0 && (
                  <tfoot>
                    <tr className="text-white">
                      <td
                        colSpan={2}
                        className="sticky left-0 z-10 rounded-lg bg-slate-900 px-3 py-2.5 text-left text-sm font-extrabold"
                      >
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <Users className="h-4 w-4" aria-hidden="true" />
                          Team Total
                        </span>
                      </td>
                      {teamDayTotals.map((value, i) => (
                        <td key={i} className="p-0.5 text-center">
                          <span
                            className={`inline-flex h-8 min-w-[34px] items-center justify-center rounded-lg px-1 text-[13px] font-bold ${
                              value > 0
                                ? "bg-indigo-200 text-indigo-900"
                                : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {value > 0 ? value : "-"}
                          </span>
                        </td>
                      ))}
                      <td className="rounded-lg bg-slate-900 text-center text-base font-extrabold">
                        {teamGrandTotal}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Empreport;