"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart3,
  Clock,
  FileText,
  Hash,
  Phone,
  Timer,
  User,
} from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchAgingReport } from "../monthlyReportSlice";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const CURRENT_YEAR = new Date().getFullYear();

const COLUMNS = [
  { label: "S.No.", icon: Hash, align: "text-center", w: "w-[84px]" },
  { label: "Customer Name", icon: User, align: "text-left", w: "min-w-[180px]" },
  { label: "Customer Number", icon: Phone, align: "text-left", w: "min-w-[170px]" },
  { label: "New Time", icon: Clock, align: "text-left", w: "min-w-[190px]" },
  { label: "RFQ Time", icon: FileText, align: "text-left", w: "min-w-[190px]" },
  { label: "Time Taken", icon: Timer, align: "text-left", w: "min-w-[190px]" },
];

const AgingReport = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [year, setYear] = useState(CURRENT_YEAR.toString());
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const { data, loading, error } = useSelector(
    (state: RootState) => state.report.agingReport,
  );

  const rows = Array.isArray(data) ? data : [];

  useEffect(() => {
    dispatch(
      fetchAgingReport({
        year: Number(year),
        regionId: selectedRegion || undefined,
        zoneId: selectedZone || undefined,
        cityId: selectedCity || undefined,
      }),
    );
  }, [dispatch, year, selectedRegion, selectedZone, selectedCity]);

  return (
    <div className="p-3 sm:p-4">
      {/* Header */}
      <div className="sticky top-0 z-10 mb-4 overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-orange-100/70 to-amber-100 p-3 shadow-sm sm:p-4">
        <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-orange-200/40" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-40 w-64 rounded-full bg-emerald-800/10" />

        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Title */}
          <div className="flex w-fit max-w-full items-center gap-4 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-amber-100 sm:px-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-orange-100 text-orange-600">
              <BarChart3 className="h-6 w-6" />
            </span>
            <span className="hidden h-10 w-px bg-slate-300 sm:block" />
            <div>
              <h2 className="text-2xl font-extrabold leading-tight text-emerald-900 sm:text-3xl">
                Aging Report
              </h2>
              <span className="mt-1 block h-1 w-14 rounded-full bg-orange-500" />
            </div>
          </div>

          {/* Filters */}
          <div
            className="min-w-0 lg:w-[520px] 2xl:w-[600px]
              [&>div>div]:!max-w-none md:[&>div>div]:!grid-cols-4
              [&_select]:!h-11 [&_select]:!rounded-full [&_select]:!border-slate-800/70
              [&_select]:!bg-white/80 [&_select]:!font-semibold [&_select]:!text-slate-800
              [&_select]:focus:!ring-2 [&_select]:focus:!ring-emerald-700/30"
          >
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

      {/* Loading */}
      {loading && (
        <div className="py-10 text-center text-lg font-semibold text-emerald-900">
          Loading...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-10 text-center font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-emerald-900/20 bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm sm:text-base">
              <thead className="bg-emerald-900 text-white">
                <tr>
                  {COLUMNS.map(({ label, icon: Icon, align, w }) => (
                    <th
                      key={label}
                      className={`${w} ${align} whitespace-nowrap border-r border-emerald-950/40 px-4 py-4 font-bold last:border-r-0`}
                    >
                      <span
                        className={`inline-flex items-center gap-2.5 ${
                          align === "text-center" ? "justify-center" : ""
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center font-medium text-slate-500"
                    >
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr
                      key={row.lead_id ?? index}
                      className="border-b border-amber-100 bg-amber-50/60 transition-colors even:bg-white hover:!bg-orange-100/70"
                    >
                      <td className="border-r border-amber-100 px-4 py-2.5 text-center font-medium text-slate-700">
                        {index + 1}
                      </td>

                      <td className="border-r border-amber-100 px-4 py-2.5 font-medium text-slate-900">
                        {row.customer_name}
                      </td>

                      <td className="whitespace-nowrap border-r border-amber-100 px-4 py-2.5 text-slate-800">
                        {row.customerPhone}
                      </td>

                      {/*
                        FIX: backend ab already IST me formatted string
                        bhejta hai (e.g. "31 Jul 2026, 08:07 AM"). Isliye
                        yaha new Date(row.new_time).toLocaleString() use
                        NAHI karna - wo dobara timezone conversion kar ke
                        time galat kar deta tha. Ab bas string seedha dikhao.
                      */}
                      <td className="whitespace-nowrap border-r border-amber-100 px-4 py-2.5 text-slate-800">
                        {row.new_time || "-"}
                      </td>

                      <td className="whitespace-nowrap border-r border-amber-100 px-4 py-2.5 text-slate-800">
                        {row.rfq_time || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5 font-bold text-red-600">
                        {row.aging}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgingReport;