"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchAgingReport } from "../monthlyReportSlice";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const CURRENT_YEAR = new Date().getFullYear();

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
    <div className="p-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md mb-4 border border-orange-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-600 bg-white px-3 rounded-md shadow-sm">
            <h2 className="text-3xl font-bold text-orange-700 py-4">
              📊 Aging Report
            </h2>
          </div>

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

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-lg font-semibold">
          Loading...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-10 text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto border border-gray-400 rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead className="bg-green-900 text-white">
              <tr>
                <th className="border p-2">S.No.</th>
                <th className="border p-2">Customer Name</th>
                <th className="border p-2">Customer Number</th>
                <th className="border p-2">New Time</th>
                <th className="border p-2">RFQ Time</th>
                <th className="border p-2">Time Taken</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6">
                    No Data Found
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.lead_id ?? index}
                    className="hover:bg-orange-50 transition"
                  >
                    <td className="border p-2 text-center">{index + 1}</td>

                    <td className="border p-2">{row.customer_name}</td>

                    <td className="border p-2">{row.customerPhone}</td>

                    {/*
                      FIX: backend ab already IST me formatted string
                      bhejta hai (e.g. "31 Jul 2026, 08:07 AM"). Isliye
                      yaha new Date(row.new_time).toLocaleString() use
                      NAHI karna - wo dobara timezone conversion kar ke
                      time galat kar deta tha. Ab bas string seedha dikhao.
                    */}
                    <td className="border p-2">{row.new_time || "-"}</td>

                    <td className="border p-2">{row.rfq_time || "-"}</td>

                    <td className="border p-2 font-bold text-red-600">
                      {row.aging}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgingReport;
