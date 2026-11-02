"use client";

import { useState, useEffect } from "react";
import { fetchLongWeekendReport } from "../monthlyReportSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";
import { CalendarDays, Users, TrendingUp } from "lucide-react";

const MONTHS: { label: string; month: number }[] = [
  { label: "APR", month: 4 },
  { label: "MAY", month: 5 },
  { label: "JUN", month: 6 },
  { label: "JUL", month: 7 },
  { label: "AUG", month: 8 },
  { label: "SEP", month: 9 },
  { label: "OCT", month: 10 },
  { label: "NOV", month: 11 },
  { label: "DEC", month: 12 },
  { label: "JAN", month: 1 },
  { label: "FEB", month: 2 },
  { label: "MAR", month: 3 },
];

const DAYS: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

type DayData = { total: number; avg: number };
type DataMap = { [month: number]: { [day: number]: DayData } };

const MONTH_STYLES: Record<
  string,
  { background: string; dot: string; text: string }
> = {
  APR: {
    background: "bg-emerald-50",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
  },
  MAY: {
    background: "bg-blue-50",
    dot: "bg-blue-500",
    text: "text-blue-800",
  },
  JUN: {
    background: "bg-orange-50",
    dot: "bg-orange-500",
    text: "text-orange-800",
  },
  JUL: {
    background: "bg-violet-50",
    dot: "bg-violet-500",
    text: "text-violet-800",
  },
  AUG: {
    background: "bg-rose-50",
    dot: "bg-rose-500",
    text: "text-rose-800",
  },
  SEP: {
    background: "bg-cyan-50",
    dot: "bg-cyan-500",
    text: "text-cyan-800",
  },
  OCT: {
    background: "bg-violet-50",
    dot: "bg-violet-500",
    text: "text-violet-800",
  },
  NOV: {
    background: "bg-emerald-50",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
  },
  DEC: {
    background: "bg-sky-50",
    dot: "bg-sky-500",
    text: "text-sky-800",
  },
  JAN: {
    background: "bg-indigo-50",
    dot: "bg-indigo-500",
    text: "text-indigo-800",
  },
  FEB: {
    background: "bg-pink-50",
    dot: "bg-pink-500",
    text: "text-pink-800",
  },
  MAR: {
    background: "bg-indigo-50",
    dot: "bg-indigo-500",
    text: "text-indigo-800",
  },
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

export default function LongWeekendReport() {
  const dispatch = useAppDispatch();

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<string>(currentYear.toString());
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const { data, loading, error } = useAppSelector(
    (state) => state.report.longWeekend,
  );

  useEffect(() => {
    dispatch(
      fetchLongWeekendReport({
        year: Number(year),
        regionId: selectedRegion,
        zoneId: selectedZone,
        cityId: selectedCity,
      }),
    );
  }, [dispatch, year, selectedRegion, selectedZone, selectedCity]);

  // Preserve the existing API data mapping.
  const dataMap = (data ?? []).reduce<DataMap>((acc, row) => {
    if (!acc[row.month]) acc[row.month] = {};

    acc[row.month][row.day] = {
      total: Number(row.total),
      avg: row.avg,
    };

    return acc;
  }, {});

  const isSunday = (year: number, month: number, day: number): boolean => {
    return new Date(year, month - 1, day).getDay() === 0;
  };

  // Preserve the existing monthly total and average calculations.
  const monthTotals = MONTHS.map(({ label, month }) => {
    const monthData = dataMap[month] ?? {};

    const total = Object.values(monthData).reduce(
      (sum, value) => sum + value.total,
      0,
    );

    const activeDays = Object.keys(monthData).length;
    const avg = activeDays > 0 ? Math.round(total / activeDays) : 0;

    return { label, month, total, avg };
  });

  // Preserve the existing day-wise totals across all months.
  const dayTotals = DAYS.map((day) =>
    MONTHS.reduce((sum, { month }) => {
      return sum + (dataMap[month]?.[day]?.total ?? 0);
    }, 0),
  );

  const grandTotal = monthTotals.reduce(
    (sum, row) => sum + row.total,
    0,
  );

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Loading Long Weekend Report...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-sm font-semibold text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 bg-[#f2f7fd] p-3 sm:p-5">
      {/* HEADER */}

      <section className="relative z-20 rounded-3xl border border-white bg-gradient-to-br from-white via-[#fafdff] to-[#edf4ff] p-4 shadow-[0_8px_30px_rgba(40,75,140,0.07)] sm:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-sky-500 text-white shadow-lg shadow-indigo-200">
              <CalendarDays size={29} strokeWidth={2.3} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-[#17365f] sm:text-2xl lg:text-3xl">
                Long Weekend Report
                <span className="ml-2 text-indigo-600">— {year}</span>
              </h1>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-1 w-16 rounded-full bg-gradient-to-r from-violet-500 to-sky-400" />

                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Track long weekend performance and daily summary
                </p>
              </div>
            </div>
          </div>

          {/* Existing filters */}

          <div className="min-w-0 xl:max-w-[680px]">
            <AllRegionZoneCityFilter
              selectedRegion={selectedRegion}
              selectedZone={selectedZone}
              selectedCity={selectedCity}
              selectedYear={year}
              onRegionChange={setSelectedRegion}
              onZoneChange={setSelectedZone}
              onCityChange={setSelectedCity}
              onYearChange={setYear}
              layout="row"
            />
          </div>
        </div>
      </section>

      {/* REPORT TABLE */}

      <section className="overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-[0_8px_30px_rgba(40,75,140,0.07)] sm:p-4">
        {/* Table heading */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#17365f] sm:text-xl">
              Daily Long Weekend Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Financial-year monthly breakdown and daily totals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
              <CalendarDays size={15} />
              Financial Year: {year}
            </span>

            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              <Users size={15} />
              12 Months
            </span>
          </div>
        </div>

        {/* Horizontal scrolling keeps all 31 day columns accessible. */}

        <div className="overflow-x-auto rounded-2xl border border-blue-100">
          <table className="w-full min-w-[1100px] border-separate border-spacing-[3px] bg-[#f4f8fe] text-center">
            <thead>
              <tr>
                <th className="sticky left-0 z-30 min-w-[125px] rounded-xl bg-gradient-to-r from-[#16365f] to-[#254c80] px-3 py-3 text-left text-xs font-bold text-white">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={17} />
                    MONTH
                  </span>
                </th>

                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="min-w-[34px] rounded-lg bg-gradient-to-b from-[#214b7c] to-[#16365f] px-1 py-3 text-[11px] font-bold text-white"
                  >
                    {day}
                  </th>
                ))}

                <th className="min-w-[88px] rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-3 py-3 text-xs font-extrabold text-white">
                  <span className="flex items-center justify-center gap-1">
                    <span className="text-base">∑</span>
                    TOTAL
                  </span>
                </th>

                <th className="min-w-[75px] rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 px-3 py-3 text-xs font-extrabold text-white">
                  <span className="flex items-center justify-center gap-1">
                    <TrendingUp size={14} />
                    AVG
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {MONTHS.map(({ label, month }) => {
                const monthData = dataMap[month] ?? {};

                const monthStat = monthTotals.find(
                  (row) => row.month === month,
                )!;

                const style = MONTH_STYLES[label];

                return (
                  <tr key={label}>
                    {/* Month label */}

                    <td
                      className={`sticky left-0 z-20 rounded-xl ${style.background} px-3 py-2 text-left`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
                        />

                        <span
                          className={`text-xs font-extrabold ${style.text}`}
                        >
                          {label}
                        </span>
                      </span>
                    </td>

                    {/* Daily values: preserve Sunday and high-value styling. */}

                    {DAYS.map((day) => {
                      const cell = monthData[day];
                      const value = cell?.total ?? 0;

                      const sunday = isSunday(Number(year), month, day);
                      const highValue = value >= 35;

                      const validDay =
                        day <= new Date(Number(year), month, 0).getDate();

                      const cellBackground = sunday
                        ? "!bg-slate-200"
                        : value >= 35
                          ? "bg-rose-100"
                          : value > 0
                            ? "bg-sky-50"
                            : "bg-white";

                      const textClass = highValue
                        ? "font-black text-rose-700"
                        : sunday
                          ? "font-extrabold text-slate-900"
                          : "font-semibold text-[#244474]";

                      return (
                        <td
                          key={day}
                          className={`rounded-lg px-1 py-2 text-[11px] transition-colors ${cellBackground}`}
                        >
                          {validDay ? (
                            value > 0 ? (
                              <span className={textClass}>
                                {formatNumber(value)}
                              </span>
                            ) : sunday ? (
                              <span className={textClass}>0</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Monthly total */}

                    <td className="rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 px-3 py-2 text-sm font-extrabold text-emerald-800">
                      {formatNumber(monthStat.total)}
                    </td>

                    {/* Monthly average */}

                    <td className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-100 px-3 py-2 text-sm font-extrabold text-blue-700">
                      {formatNumber(monthStat.avg)}
                    </td>
                  </tr>
                );
              })}

              {/* TEAM TOTAL */}

              <tr>
                <td className="sticky left-0 z-20 rounded-xl bg-gradient-to-r from-[#16365f] to-[#285487] px-3 py-3 text-left text-xs font-extrabold text-white">
                  <span className="flex items-center gap-2">
                    <Users size={17} />
                    Team Total
                  </span>
                </td>

                {dayTotals.map((total, index) => (
                  <td
                    key={index}
                    className="rounded-lg bg-gradient-to-b from-[#254c80] to-[#16365f] px-1 py-3 text-[11px] font-extrabold text-white"
                  >
                    {total > 0 ? formatNumber(total) : "-"}
                  </td>
                ))}

                <td className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-3 py-3 text-sm font-extrabold text-white">
                  {formatNumber(grandTotal)}
                </td>

                <td className="rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 px-3 py-3 text-sm font-extrabold text-white">
                  -
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table footer */}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>Showing all 12 months in April–March financial-year order.</p>

          <p className="font-medium">
            Scroll horizontally to view all 31 daily columns.
          </p>
        </div>
      </section>
    </div>
  );
}
