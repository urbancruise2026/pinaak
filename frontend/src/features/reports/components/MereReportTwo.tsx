"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchMonthlyReportTwo } from "../monthlyReportSlice";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_STYLES = [
  { dot: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-800" },
  { dot: "bg-pink-500", bg: "bg-pink-50", text: "text-pink-800" },
  { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-800" },
  { dot: "bg-teal-500", bg: "bg-teal-50", text: "text-teal-800" },
  { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-800" },
  { dot: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-800" },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

export default function MonthlyEnquiryReportUI() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear.toString());
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.report.monthlyReportTwo,
  );

  const rows = data?.rows ?? [];
  const pickupMonthSummary = data?.pickupMonthSummary ?? {};

  useEffect(() => {
    dispatch(
      fetchMonthlyReportTwo({
        year: Number(year),
        regionId: selectedRegion,
        zoneId: selectedZone,
        cityId: selectedCity,
      }),
    );
  }, [dispatch, year, selectedRegion, selectedZone, selectedCity]);

  const days = useMemo(
    () => Array.from({ length: 31 }, (_, index) => index + 1),
    [],
  );

  const orderedMonths = useMemo(() => {
    const currentMonthIndex = new Date().getMonth();

    return [
      ...MONTHS.slice(currentMonthIndex),
      ...MONTHS.slice(0, currentMonthIndex),
    ];
  }, []);

  const containers = useMemo(
    () => [orderedMonths.slice(0, 6), orderedMonths.slice(6, 12)],
    [orderedMonths],
  );

  // Preserve the existing pickup counts by month and day.
  const pickupByMonth = useMemo(() => {
    const map: Record<string, Record<number, number>> = {};

    rows.forEach((row) => {
      const day = row.day;

      if (day == null) return;

      Object.entries(row.pickupMonthCounts ?? {}).forEach(
        ([pickupMonth, count]) => {
          const bucket = (map[pickupMonth] ??= {});
          bucket[day] = (bucket[day] ?? 0) + Number(count);
        },
      );
    });

    return map;
  }, [rows]);

  const getMonthData = (monthName: string): Record<number, number> => {
    const result: Record<number, number> = {};

    for (const row of rows) {
      if (row.month !== monthName || row.day == null) continue;

      result[row.day] = row.total ?? 0;
    }

    return result;
  };

  const getRowTotal = (monthName: string): number =>
    Object.values(getMonthData(monthName)).reduce(
      (sum, value) => sum + value,
      0,
    );

  const getColTotal = (day: number, displayMonths: string[]): number =>
    displayMonths.reduce(
      (sum, month) => sum + (getMonthData(month)[day] ?? 0),
      0,
    );

  // Summary values are derived from the existing report data.
  const totalEnquiries = useMemo(
    () => MONTHS.reduce((sum, month) => sum + getRowTotal(month), 0),
    // getMonthData reads the current rows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows],
  );

  const monthlyAverage = Math.round(totalEnquiries / 12);

  const topPickupMonth = useMemo(() => {
    return MONTHS.reduce(
      (best, month) => {
        const total = pickupMonthSummary[month]?.total ?? 0;

        return total > best.total ? { month, total } : best;
      },
      { month: "", total: 0 },
    );
  }, [pickupMonthSummary]);

  const toDisplay = (month: string) => month.toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-3xl border border-blue-100 bg-white text-sm font-medium text-slate-500 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Loading monthly report...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-sm font-medium text-red-600">
        Unable to load the monthly report: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-5 bg-[#f3f7fd] p-3 sm:p-5">
      {/* ================= MAIN HEADER ================= */}

      <section className="relative overflow-visible rounded-3xl border border-white bg-gradient-to-br from-white via-[#f7faff] to-[#edf4ff] p-4 shadow-[0_8px_30px_rgba(40,75,140,0.07)] sm:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Report title */}

          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl text-white shadow-lg shadow-indigo-200">
              ▥
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-[#1c3768] sm:text-2xl">
                Monthly Enquiry Report Two
                <span className="ml-2 text-indigo-600">— {year}</span>
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Lead trends and daily enquiry breakdown
              </p>
            </div>
          </div>

          {/* Summary cards */}

          <div className="grid grid-cols-2 gap-3 xl:min-w-[400px]">
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-3 sm:p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-600">
                ♙
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Total Enquiries
                </p>

                <p className="mt-1 text-xl font-extrabold text-[#1c3768] sm:text-2xl">
                  {formatNumber(totalEnquiries)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-3 sm:p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xl text-teal-700">
                ◷
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Monthly Average
                </p>

                <p className="mt-1 text-xl font-extrabold text-teal-800 sm:text-2xl">
                  {formatNumber(monthlyAverage)}
                </p>
              </div>
            </div>
          </div>

          {/* Existing filters */}

          <div className="min-w-0 xl:max-w-[570px]">
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

      {/* ================= FIRST REPORT TABLE ================= */}

      <section className="overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-[0_8px_30px_rgba(40,75,140,0.07)] sm:p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-[#1c3768] sm:text-xl">
              Daily Enquiry Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Month-wise daily counts, totals and averages
            </p>
          </div>
          <h1 className="border rounded-xl p-4 bg-slate-400/40">DELHI</h1>

          <div className="flex items-center gap-2 self-start rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-semibold text-blue-800">
              Financial / Calendar Year: {year}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-blue-100">
          <table className="w-full min-w-[1450px] border-separate border-spacing-[3px] bg-[#f5f8fe] text-center">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 min-w-[125px] rounded-xl bg-gradient-to-r from-[#183664] to-[#294b86] px-3 py-3 text-left text-xs font-bold text-white">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">▦</span>
                    Month
                  </span>
                </th>

                {days.map((day) => (
                  <th
                    key={day}
                    className="min-w-[39px] rounded-lg bg-[#e0ecff] py-2 text-[11px] font-bold text-[#244474]"
                  >
                    {day}
                  </th>
                ))}

                <th className="min-w-[85px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 px-2 py-2 text-xs font-bold text-white">
                  Total
                </th>

                <th className="min-w-[70px] rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 px-2 py-2 text-xs font-bold text-white">
                  Avg
                </th>
              </tr>
            </thead>

            <tbody>
              {containers[0].map((month, index) => {
                const style = MONTH_STYLES[index % MONTH_STYLES.length];
                const monthData = getMonthData(month);
                const total = getRowTotal(month);
                const average = Math.round(total / 31);

                return (
                  <tr key={month}>
                    <td
                      className={`sticky left-0 z-10 rounded-xl ${style.bg} px-3 py-2 text-left`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
                        />

                        <span
                          className={`text-xs font-extrabold ${style.text}`}
                        >
                          {toDisplay(month)}
                        </span>
                      </span>
                    </td>

                    {days.map((day) => {
                      const value = pickupByMonth[month]?.[day] ?? 0;

                      return (
                        <td
                          key={day}
                          className={`rounded-lg py-2 text-[11px] font-semibold transition-colors ${
                            value > 0
                              ? `${style.bg} ${style.text}`
                              : "bg-white text-slate-300"
                          }`}
                        >
                          {value > 0 ? value : "–"}
                        </td>
                      );
                    })}

                    <td
                      className={`rounded-xl ${style.bg} py-2 text-xs font-extrabold ${style.text}`}
                    >
                      {formatNumber(
                        pickupMonthSummary[month]?.total ?? total,
                      )}
                    </td>

                    <td
                      className={`rounded-xl ${style.bg} py-2 text-xs font-bold ${style.text}`}
                    >
                      {pickupMonthSummary[month]?.avg ?? average}
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td className="sticky left-0 z-10 rounded-xl bg-gradient-to-r from-[#183664] to-[#294b86] px-3 py-3 text-left text-xs font-extrabold text-white">
                  ∑ &nbsp; TOTAL
                </td>

                {days.map((day) => {
                  const total = getColTotal(day, containers[0]);

                  return (
                    <td
                      key={day}
                      className="rounded-lg bg-[#e0eaff] py-2 text-[11px] font-extrabold text-[#244474]"
                    >
                      {total > 0 ? formatNumber(total) : "–"}
                    </td>
                  );
                })}

                <td className="rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 py-2 text-xs font-extrabold text-white">
                  {formatNumber(
                    containers[0].reduce(
                      (sum, month) =>
                        sum +
                        (pickupMonthSummary[month]?.total ??
                          getRowTotal(month)),
                      0,
                    ),
                  )}
                </td>

                <td className="rounded-xl bg-indigo-100 py-2 text-xs font-bold text-indigo-700">
                  –
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>
            Showing the first six months in your existing month order.
          </p>

          <p className="font-medium">
            Scroll horizontally to view all days.
          </p>
        </div>
      </section>

      {/* ================= SECOND REPORT TABLE ================= */}

      <section className="overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-[0_8px_30px_rgba(40,75,140,0.07)] sm:p-5">
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 text-xl text-white shadow-lg shadow-teal-100">
              ↗
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#1c3768] sm:text-xl">
                Monthly Enquiry Report — {year}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Detailed monthly pickup trends
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3">
              <p className="text-[11px] font-medium text-emerald-700">
                🏆 Top Pickup Month
              </p>

              <p className="mt-1 text-sm font-extrabold text-emerald-900">
                {topPickupMonth.month
                  ? `${toDisplay(topPickupMonth.month)} — ${formatNumber(
                      topPickupMonth.total,
                    )} Leads`
                  : "No data available"}
              </p>
            </div>

            <div className="min-w-0">
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
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
            Region filtered
          </span>

          <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800">
            Zone filtered
          </span>

          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
            City filtered
          </span>
        </div>

        {containers[1].map((month) => month).length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-blue-100">
            <table className="w-full min-w-[1450px] border-separate border-spacing-[3px] bg-[#f5f8fe] text-center">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 min-w-[125px] rounded-xl bg-gradient-to-r from-[#183664] to-[#294b86] px-3 py-3 text-left text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">▦</span>
                      Month
                    </span>
                  </th>

                  {days.map((day) => (
                    <th
                      key={day}
                      className="min-w-[39px] rounded-lg bg-[#e0ecff] py-2 text-[11px] font-bold text-[#244474]"
                    >
                      {day}
                    </th>
                  ))}

                  <th className="min-w-[85px] rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 px-2 py-2 text-xs font-bold text-white">
                    Total
                  </th>

                  <th className="min-w-[70px] rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 px-2 py-2 text-xs font-bold text-white">
                    Avg
                  </th>
                </tr>
              </thead>

              <tbody>
                {containers[1].map((month, index) => {
                  const style = MONTH_STYLES[index % MONTH_STYLES.length];
                  const monthData = getMonthData(month);
                  const total = getRowTotal(month);
                  const average = Math.round(total / 31);

                  return (
                    <tr key={month}>
                      <td
                        className={`sticky left-0 z-10 rounded-xl ${style.bg} px-3 py-2 text-left`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
                          />

                          <span
                            className={`text-xs font-extrabold ${style.text}`}
                          >
                            {toDisplay(month)}
                          </span>
                        </span>
                      </td>

                      {days.map((day) => {
                        const value = pickupByMonth[month]?.[day] ?? 0;

                        return (
                          <td
                            key={day}
                            className={`rounded-lg py-2 text-[11px] font-semibold ${
                              value > 0
                                ? `${style.bg} ${style.text}`
                                : "bg-white text-slate-300"
                            }`}
                          >
                            {value > 0 ? value : "–"}
                          </td>
                        );
                      })}

                      <td
                        className={`rounded-xl ${style.bg} py-2 text-xs font-extrabold ${style.text}`}
                      >
                        {formatNumber(
                          pickupMonthSummary[month]?.total ?? total,
                        )}
                      </td>

                      <td
                        className={`rounded-xl ${style.bg} py-2 text-xs font-bold ${style.text}`}
                      >
                        {pickupMonthSummary[month]?.avg ?? average}
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td className="sticky left-0 z-10 rounded-xl bg-gradient-to-r from-[#183664] to-[#294b86] px-3 py-3 text-left text-xs font-extrabold text-white">
                    ∑ &nbsp; TOTAL
                  </td>

                  {days.map((day) => {
                    const total = getColTotal(day, containers[1]);

                    return (
                      <td
                        key={day}
                        className="rounded-lg bg-[#e0eaff] py-2 text-[11px] font-extrabold text-[#244474]"
                      >
                        {total > 0 ? formatNumber(total) : "–"}
                      </td>
                    );
                  })}

                  <td className="rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 py-2 text-xs font-extrabold text-white">
                    {formatNumber(
                      containers[1].reduce(
                        (sum, month) =>
                          sum +
                          (pickupMonthSummary[month]?.total ??
                            getRowTotal(month)),
                        0,
                      ),
                    )}
                  </td>

                  <td className="rounded-xl bg-indigo-100 py-2 text-xs font-bold text-indigo-700">
                    –
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>
            Showing the remaining six months in your existing month order.
          </p>

          <p className="font-medium">
            All report values come from your existing API response.
          </p>
        </div>
      </section>
    </div>
  );
}