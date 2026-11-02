// MonthlyEnquiryReport.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMonthlyEnquiry } from "../monthlyReportSlice";
import { RootState, AppDispatch } from "@/store/store";
import {
  Eye,
  X,
  CalendarDays,
  Users,
  Target,
  Sigma,
  BarChart3,
} from "lucide-react";
import Image from "next/image";
import employee from "@/assets/images/monthyview.png";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const MONTH_NAMES = [
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
  "JAN",
  "FEB",
  "MAR",
];

const MONTH_NAME_TO_NUMBER: { [key: string]: number } = {
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
  JAN: 1,
  FEB: 2,
  MAR: 3,
};

const MONTH_NAME_TO_INDEX: { [key: string]: number } = {
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
  JAN: 0,
  FEB: 1,
  MAR: 2,
};

const getMonthsData = (year: number) => {
  return MONTH_NAMES.map((name) => {
    const monthIndex = MONTH_NAME_TO_INDEX[name];
    const days = getDaysInMonth(year, monthIndex);
    return {
      name,
      monthNumber: MONTH_NAME_TO_NUMBER[name],
      days,
      firstDay: getFirstDayOfMonth(year, monthIndex),
    };
  });
};

/* ─── Month colours ─────────────────────────────────────────────────────────
   Every month has its own pastel chip (used for the name, TOTAL and AVG cells).
   Months that have no enquiries yet fall back to a quiet grey chip.
   Full class names are written out so Tailwind never purges them.          */
type MonthTheme = { chip: string; dot: string };

const MONTH_THEME: Record<string, MonthTheme> = {
  APR: { chip: "bg-green-100 text-green-700", dot: "bg-green-500" },
  MAY: { chip: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  JUN: { chip: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  JUL: { chip: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  AUG: { chip: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  SEP: { chip: "bg-teal-100 text-teal-700", dot: "bg-teal-500" },
  OCT: { chip: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  NOV: { chip: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
  DEC: { chip: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  JAN: { chip: "bg-red-100 text-red-700", dot: "bg-red-500" },
  FEB: { chip: "bg-cyan-100 text-cyan-700", dot: "bg-cyan-500" },
  MAR: { chip: "bg-fuchsia-100 text-fuchsia-700", dot: "bg-fuchsia-500" },
};

const MUTED_THEME: MonthTheme = {
  chip: "bg-slate-100 text-slate-400",
  dot: "bg-slate-300",
};

/* ─── Day-cell colours (heat map) ───────────────────────────────────────────
   Same rules as before: Sundays are shaded, 50+ is highlighted in red.     */
const HIGH_VALUE = 50;

const dayCellClass = (value: number, sunday: boolean): string => {
  const high = value >= HIGH_VALUE;

  if (sunday) {
    return high
      ? "bg-slate-200 text-rose-700 font-black"
      : value > 0
        ? "bg-slate-200 text-slate-900 font-black"
        : "bg-slate-200 text-slate-400";
  }
  if (value <= 0) return "bg-slate-50 text-slate-300";
  if (high) return "bg-rose-100 text-rose-700 font-black";
  if (value >= 30) return "bg-indigo-100 text-slate-800";
  if (value >= 15) return "bg-emerald-100 text-slate-800";
  return "bg-sky-100 text-slate-800";
};

const isSunday = (year: number, monthIndex: number, day: number): boolean => {
  return new Date(year, monthIndex, day).getDay() === 0;
};

const now = new Date();
const CURRENT_YEAR = now.getFullYear();

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) =>
  (CURRENT_YEAR - 2 + i).toString(),
);

export default function MonthlyEnquiryReport() {
  const [year, setYear] = useState(CURRENT_YEAR.toString());
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const {
    data: apiData,
    loading,
    error,
  } = useSelector((s: RootState) => s.report);

  useEffect(() => {
    dispatch(
      fetchMonthlyEnquiry({
        year: Number(year),
        regionId: selectedRegion || undefined,
        zoneId: selectedZone || undefined,
        cityId: selectedCity || undefined,
      }),
    );
  }, [year, selectedRegion, selectedZone, selectedCity, dispatch]);

  const reportData = useMemo(() => {
    const monthsData = getMonthsData(Number(year));

    return monthsData.map((month) => {
      const dailyData = Array(month.days).fill(0);

      if (apiData && apiData.length > 0) {
        apiData.forEach((item) => {
          if (item.month === month.monthNumber && item.day <= month.days) {
            dailyData[item.day - 1] = item.total;
          }
        });
      }

      const total = dailyData.reduce((a: number, b: number) => a + b, 0);
      const activeDays = dailyData.filter((v: number) => v > 0).length;
      const avg = activeDays > 0 ? Math.round(total / activeDays) : 0;

      return { ...month, dailyData, total, avg };
    });
  }, [apiData, year]);

  const grandTotal = reportData.reduce((acc, m) => acc + m.total, 0);

  const activeMonths = reportData.filter((m) => m.total > 0);
  const grandAvg =
    activeMonths.length > 0
      ? Math.round(
          activeMonths.reduce((sum, m) => sum + m.avg, 0) / activeMonths.length,
        )
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-600 font-semibold">❌ Error: {error}</p>
          <button
            onClick={() => dispatch(fetchMonthlyEnquiry({ year: Number(year) }))}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4">
      {/* ── Header ── */}
      <div className="z-10 mb-4 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-3 shadow-[0_8px_30px_rgba(79,70,229,0.10)] sm:p-4 md:sticky md:top-0">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          {/* Title */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4 xl:flex-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-300/50 sm:h-16 sm:w-16">
              <CalendarDays
                className="h-6 w-6 text-white sm:h-8 sm:w-8"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">
                Monthly Enquiry Report – {year}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Track your monthly enquiry performance at a glance
              </p>
            </div>

            <button
              onClick={() => setShowImageModal(true)}
              className="shrink-0 rounded-full border-2 border-indigo-300 bg-white p-1.5 shadow-sm transition-colors hover:bg-indigo-50"
              title="View Chart"
              aria-label="View Chart"
            >
              <Eye className="h-5 w-5 text-indigo-600 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 xl:w-[430px] xl:shrink-0">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-violet-100 bg-white/80 p-3 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 sm:h-12 sm:w-12">
                <Users className="h-5 w-5 text-violet-600 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                  Total Enquiries
                </p>
                <p className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                  {grandTotal}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 sm:h-12 sm:w-12">
                <Target className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                  Monthly Average
                </p>
                <p className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                  {grandAvg}
                </p>
              </div>
            </div>
          </div>

          {/* Filters – Region / Zone on the first row, City / Year on the second */}
          <div className="xl:w-[380px] xl:shrink-0 [&>div>div]:!max-w-none md:[&>div>div]:!grid-cols-4 xl:[&>div>div]:!grid-cols-2 [&_select]:!h-10 [&_select]:!rounded-full [&_select]:!border-slate-200 [&_select]:!bg-white [&_select]:!text-slate-700 [&_select]:!shadow-sm [&_select]:hover:!border-indigo-300 [&_select]:focus:!border-indigo-400 [&_select]:focus:!ring-indigo-200">
            <AllRegionZoneCityFilter
              selectedRegion={selectedRegion}
              selectedZone={selectedZone}
              selectedCity={selectedCity}
              selectedYear={year}
              onRegionChange={setSelectedRegion}
              onZoneChange={setSelectedZone}
              onCityChange={setSelectedCity}
              onYearChange={setYear}
              layout="grid"
            />
          </div>
        </div>
      </div>

      {/* ── Image Modal ── */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative mx-4 w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-indigo-700">
                Employee Performance TS – {year}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EE0000] transition-colors hover:bg-red-700"
              >
                <X className="h-6 w-6 text-white" strokeWidth={3} />
              </button>
            </div>

            {/* Image */}
            <Image
              src={employee}
              alt="Performance Chart"
              width={900}
              height={600}
              priority
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {/* ── No Data Warning ── */}
      {(!apiData || apiData.length === 0) && !loading && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center font-medium text-amber-700">
          ⚠️ No data found for year {year}
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-3xl border border-slate-100 bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-3">
        <div className="overflow-x-auto rounded-2xl">
          <table
            className="w-full min-w-[1150px] border-separate text-center"
            style={{ borderSpacing: 3 }}
          >
            <thead>
              <tr className="text-white">
                <th className="sticky left-0 z-20 rounded-lg bg-slate-900 px-3 py-2.5 text-left text-sm font-extrabold">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    MONTH
                  </span>
                </th>
                {[...Array(31)].map((_, i) => (
                  <th
                    key={i}
                    className="rounded-md bg-slate-900 px-0 py-2.5 text-xs font-bold"
                  >
                    {i + 1}
                  </th>
                ))}
                <th className="rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-extrabold">
                  <span className="inline-flex items-center gap-1.5">
                    <Sigma className="h-4 w-4" aria-hidden="true" />
                    TOTAL
                  </span>
                </th>
                <th className="rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-extrabold">
                  <span className="inline-flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4" aria-hidden="true" />
                    AVG
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {reportData.map((month, idx) => {
                const theme =
                  month.total > 0
                    ? (MONTH_THEME[month.name] ?? MUTED_THEME)
                    : MUTED_THEME;
                const monthIndex = MONTH_NAME_TO_INDEX[month.name];

                return (
                  <tr key={idx}>
                    <td
                      className={`sticky left-0 z-10 rounded-lg px-3 py-1.5 text-left text-sm font-extrabold ${theme.chip}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <i
                          aria-hidden="true"
                          className={`inline-block h-2 w-2 rounded-full ${theme.dot}`}
                        />
                        {month.name}
                      </span>
                    </td>

                    {month.dailyData.map((value: number, i: number) => {
                      const dayNumber = i + 1;
                      const sunday = isSunday(
                        Number(year),
                        monthIndex,
                        dayNumber,
                      );

                      return (
                        <td
                          key={i}
                          title={
                            value > 0
                              ? `${month.name} ${dayNumber}: ${value}`
                              : undefined
                          }
                          className={`rounded-md px-0 py-1.5 text-[13px] font-semibold ${dayCellClass(value, sunday)}`}
                        >
                          {value > 0 ? value : "-"}
                        </td>
                      );
                    })}

                    {[...Array(31 - month.days)].map((_, i) => (
                      <td
                        key={`empty-${i}`}
                        className="rounded-md bg-slate-50/60 px-0 py-1.5"
                      />
                    ))}

                    <td
                      className={`rounded-lg px-2 py-1.5 text-sm font-extrabold ${theme.chip}`}
                    >
                      {month.total}
                    </td>
                    <td
                      className={`rounded-lg px-2 py-1.5 text-sm font-extrabold ${theme.chip}`}
                    >
                      {month.avg}
                    </td>
                  </tr>
                );
              })}

              {/* ── Grand Total Row ── */}
              <tr className="text-white">
                <td className="sticky left-0 z-10 rounded-lg bg-slate-900 px-3 py-2.5 text-left text-sm font-extrabold">
                  <span className="inline-flex items-center gap-2">
                    <Sigma className="h-4 w-4" aria-hidden="true" />
                    TOTAL
                  </span>
                </td>

                {[...Array(31)].map((_, dateIndex) => {
                  const dailyTotal = reportData.reduce((sum, month) => {
                    if (dateIndex < month.days) {
                      return sum + (month.dailyData[dateIndex] || 0);
                    }
                    return sum;
                  }, 0);

                  return (
                    <td
                      key={dateIndex}
                      className="rounded-md bg-slate-800 px-0 py-2.5 text-[13px] font-bold"
                    >
                      {dailyTotal > 0 ? (
                        dailyTotal
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  );
                })}

                <td className="rounded-lg bg-blue-600 px-2 py-2.5 text-lg font-extrabold">
                  {grandTotal}
                </td>
                <td className="rounded-lg bg-blue-400 px-2 py-2.5 text-lg font-extrabold">
                  {grandAvg}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}