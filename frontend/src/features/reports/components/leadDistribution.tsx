"use client";

import { fetchLeadDistribution } from "@/features/reports/monthlyReportSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useState, Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import {
  Eye,
  X,
  ChevronDown,
  MapPin,
  Building2,
  CalendarDays,
  BarChart3,
  Users,
  TrendingUp,
} from "lucide-react";

import employeeDistb from "@/assets/images/leaddstbimage.png";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const monthsList = [
  { name: "Jan", num: 1 },
  { name: "Feb", num: 2 },
  { name: "Mar", num: 3 },
  { name: "Apr", num: 4 },
  { name: "May", num: 5 },
  { name: "Jun", num: 6 },
  { name: "Jul", num: 7 },
  { name: "Aug", num: 8 },
  { name: "Sep", num: 9 },
  { name: "Oct", num: 10 },
  { name: "Nov", num: 11 },
  { name: "Dec", num: 12 },
];

const rowColors = [
  {
    avatar: "bg-indigo-100 text-indigo-700",
    row: "bg-indigo-50/40",
  },
  {
    avatar: "bg-pink-100 text-pink-700",
    row: "bg-pink-50/40",
  },
  {
    avatar: "bg-amber-100 text-amber-800",
    row: "bg-amber-50/40",
  },
  {
    avatar: "bg-teal-100 text-teal-700",
    row: "bg-teal-50/40",
  },
  {
    avatar: "bg-blue-100 text-blue-700",
    row: "bg-blue-50/40",
  },
  {
    avatar: "bg-violet-100 text-violet-700",
    row: "bg-violet-50/40",
  },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);

const tableCell =
  "border-b border-r border-white/80 px-1 py-2 text-center text-[14px] sm:text-sm whitespace-nowrap";

export default function DailyLeadReport() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = String(new Date().getFullYear());

  const [selectedMonthNum, setSelectedMonthNum] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const { distribution } = useSelector(
    (state: RootState) => state.report,
  );

  useEffect(() => {
    dispatch(
      fetchLeadDistribution({
        month: selectedMonthNum,
        year: Number(year),
        regionId: selectedRegion || undefined,
        zoneId: selectedZone || undefined,
        cityId: selectedCity || undefined,
      }),
    );
  }, [
    selectedMonthNum,
    year,
    selectedRegion,
    selectedZone,
    selectedCity,
    dispatch,
  ]);

  // Preserve the existing API response and calculations.
  const apiData = distribution?.data ?? [];
  const teamTotal = distribution?.teamTotal ?? null;
  const totalDays = distribution?.totalDaysInMonth ?? 30;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i);
  const teamTotalLeads = teamTotal?.total_leads ?? 0;

  const selectedMonthName =
    monthsList.find((month) => month.num === selectedMonthNum)?.name ?? "";

  // Preserve the existing loading state.
  if (distribution?.loading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Loading lead distribution...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 bg-[#f2f7fd] p-3 sm:p-5">
      {/* HEADER AND FILTERS */}

      <section className="relative z-20 rounded-3xl border border-white bg-gradient-to-br from-white via-[#fafdff] to-[#edf4ff] p-4 shadow-[0_8px_30px_rgba(40,75,140,0.07)] sm:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Report title */}

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <BarChart3 size={29} strokeWidth={2.4} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-[#17365f] sm:text-2xl lg:text-3xl">
                Leads Distribution PS
                <span className="ml-2 text-indigo-600">
                  — {selectedMonthName} {year}
                </span>
              </h1>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-1 w-16 rounded-full bg-gradient-to-r from-orange-400 to-transparent" />

                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Daily leads and bookings by team member
                </p>
              </div>
            </div>
          </div>

          {/* Chart button */}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              title="View Chart"
              aria-label="View lead distribution chart"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <Eye size={20} />
            </button>

            {/* Existing region, zone, city and year filters */}

            <div className="min-w-0 flex-1">
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

            {/* Existing month selector */}

            <div className="relative">
              <select
                value={selectedMonthNum}
                aria-label="Select month"
                onChange={(event) =>
                  setSelectedMonthNum(Number(event.target.value))
                }
                className="h-11 appearance-none rounded-xl border border-indigo-100 bg-white py-2 pl-3 pr-9 text-sm font-semibold text-[#244474] shadow-sm outline-none transition hover:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                {monthsList.map((month) => (
                  <option key={month.num} value={month.num}>
                    {month.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* REPORT TABLE */}

      {apiData.length === 0 ? (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <BarChart3 size={27} />
          </div>

          <h2 className="text-base font-bold text-[#17365f]">
            No data available
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            No lead distribution data was found for {selectedMonthName}{" "}
            {year} with the selected filters.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-[0_8px_30px_rgba(40,75,140,0.07)] sm:p-4">
          {/* Table heading */}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#17365f] sm:text-xl">
                Daily Lead Distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Daily lead counts, bookings and team contribution
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
                <CalendarDays size={15} />
                {selectedMonthName} {year}
              </span>

              <span className="inline-flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
                <Users size={15} />
                {apiData.length} Team Members
              </span>
            </div>
          </div>

          {/* Horizontal scrolling preserves all daily columns on small screens */}

          <div className="overflow-x-auto rounded-2xl border border-blue-100">
            <table className="w-full min-w-max border-separate border-spacing-[3px] bg-[#f4f8fe] text-center">
              <thead>
                <tr>
                  <th className="sticky left-0 z-30 min-w-[95px] w-[95px] rounded-xl bg-gradient-to-r from-[#16365f] to-[#254c80] px-2 py-2 text-[11px] font-bold text-white">
                    NAME
                  </th>

                  <th className="sticky left-[105px] z-30 min-w-[65px] w-[65px] rounded-xl bg-gradient-to-r from-[#16365f] to-[#254c80] px-1 py-2  text-[11px] font-bold text-white">
                    STATUS
                  </th>

                  {daysArray.map((day) => (
                    <th
                      key={day}
                      className="min-w-[36px] rounded-lg bg-[#e0ebfb] px-1 py-3 text-[14px] font-bold text-[#244474]"
                    >
                      {day + 1}
                    </th>
                  ))}

                  <th className="min-w-[75px] rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 px-3 py-3 text-xs font-extrabold text-white">
                    ∑ TOTAL
                  </th>

                  <th className="min-w-[75px] rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-3 py-3 text-xs font-extrabold text-white">
                    <span className="flex items-center justify-center gap-1">
                      <TrendingUp size={13} />
                      AVG/DAY
                    </span>
                  </th>

                  <th className="min-w-[75px] rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 px-3 py-3 text-xs font-extrabold text-white">
                    CNTB %
                  </th>
                </tr>
              </thead>

              <tbody>
                {apiData.map((adviser: any, index: number) => {
                  const color = rowColors[index % rowColors.length];

                  const contribution =
                    teamTotalLeads > 0
                      ? (
                          (adviser.total_leads / teamTotalLeads) *
                          100
                        ).toFixed(1)
                      : "0.0";

                  return (
                    <Fragment key={adviser.adviser_id}>
                      {/* LEADS ROW */}

                      <tr className="group">
                        <td
                          rowSpan={2}
                          className={`sticky left-0 z-20 border-b-2 border-white ${color.row} px-2 py-3 text-left`}
                        >
                          <div className="flex min-w-0 items-center gap-1.5">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold ${color.avatar}`}
                            >
                              {adviser.adviser_name
                                ?.charAt(0)
                                ?.toUpperCase() ?? "?"}
                            </div>

                            <span className="max-w-[120px] truncate text-xs font-extrabold text-[#17365f] sm:text-sm">
                              {adviser.adviser_name}
                            </span>
                          </div>
                        </td>

                        <td
                          className={`sticky left-[105px] z-10 ${tableCell} bg-white`}
                        >
                          <span className="inline-flex min-w-[58px] items-center justify-center gap-1.5 rounded-xl bg-emerald-100 px-1.5 py-1.5 text-[11px] font-bold text-emerald-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                            Lead
                          </span>
                        </td>

                        {adviser.days.map((day: any) => (
                          <td
                            key={day.day}
                            className={`${tableCell} ${
                              day.leads
                                ? "bg-[#eaf5ff] font-semibold text-blue-700"
                                : "bg-white text-slate-300"
                            }`}
                          >
                            {day.leads || "–"}
                          </td>
                        ))}

                        <td className="rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 px-3 py-3 text-sm font-extrabold text-teal-800">
                          {formatNumber(adviser.total_leads)}
                        </td>

                        <td className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 px-3 py-3 text-sm font-extrabold text-indigo-800">
                          {formatNumber(adviser.avg_leads_per_day)}
                        </td>

                        <td
                          rowSpan={2}
                          className="rounded-xl bg-gradient-to-br from-teal-50 to-emerald-100 px-3 py-3 text-sm font-extrabold text-teal-800"
                        >
                          {contribution}
                        </td>
                      </tr>

                      {/* BOOKED ROW */}

                      <tr className="group">
                        <td
                          className={`sticky left-[105px] z-10 ${tableCell} bg-white`}
                        >
                          <span className="inline-flex min-w-[58px] items-center justify-center gap-1.5 rounded-xl bg-violet-100px-1.5 py-1.5 text-[11px] font-bold text-violet-800">
                            <span className="h-2 w-2 rounded-full bg-violet-600" />
                            Book
                          </span>
                        </td>

                        {adviser.days.map((day: any) => (
                          <td
                            key={day.day}
                            className={`${tableCell} ${
                              day.booked
                                ? "bg-violet-50 font-semibold text-pink-600"
                                : "bg-white text-slate-300"
                            }`}
                          >
                            {day.booked || "–"}
                          </td>
                        ))}

                        <td className="rounded-xl bg-gradient-to-br from-violet-50 to-pink-50 px-3 py-3 text-sm font-extrabold text-violet-800">
                          {formatNumber(adviser.total_booked)}
                        </td>

                        <td className="rounded-xl bg-gradient-to-br from-violet-50 to-pink-50 px-3 py-3 text-sm font-bold text-violet-500">
                          –
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}

                {/* TEAM TOTAL ROW */}

                {teamTotal && (
                  <tr>
                    <td
                      colSpan={2}
                      className="sticky left-0 z-20 rounded-xl bg-gradient-to-r from-[#16365f] to-[#285487] px-4 py-4 text-left text-sm font-extrabold text-white"
                    >
                      <span className="flex items-center gap-2">
                        <Users size={19} />
                        Team Total
                      </span>
                    </td>

                    {teamTotal.days.map((day: any) => (
                      <td
                        key={day.day}
                        className="rounded-lg bg-[#254c80] px-1 py-3 text-xs font-extrabold text-white"
                      >
                        {day.leads || "–"}
                      </td>
                    ))}

                    <td className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-3 py-3 text-sm font-extrabold text-white">
                      {formatNumber(teamTotal.total_leads)}
                    </td>

                    <td className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-3 py-3 text-sm font-extrabold text-white">
                      –
                    </td>

                    <td className="rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 px-3 py-3 text-sm font-extrabold text-white">
                      {teamTotal.total_leads > 0
                        ? (
                            (teamTotal.total_leads /
                              teamTotal.total_leads) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>
              Showing {totalDays} days for {selectedMonthName} {year}.
            </p>

            <p className="font-medium">
              Scroll horizontally to view all daily columns.
            </p>
          </div>
        </section>
      )}

      {/* EXISTING CHART IMAGE MODAL */}

      {showImageModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative w-full max-w-6xl rounded-3xl border border-white/70 bg-white p-4 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#17365f] sm:text-xl">
                  Lead Distribution Chart
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedMonthName} {year}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                aria-label="Close chart"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
              >
                <X size={21} />
              </button>
            </div>

            <Image
              src={employeeDistb}
              alt="Leads Distribution Chart"
              width={1920}
              height={1080}
              priority
              className="max-h-[75vh] w-full rounded-2xl border border-blue-100 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
