"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";

import { fetchWebsiteToLeadAgingReport } from "../monthlyReportSlice";

import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const CURRENT_YEAR = new Date().getFullYear();
export interface WebsiteToLeadAgingItem {
  website_gac_id?: number | null;
  lead_id?: number | null;
  website_name?: string | null;
  lead_name?: string | null;
  website_phone?: string | null;
  lead_phone?: string | null;
  website_city?: string | null;
  website_time?: string | null;
  lead_time?: string | null;
  aging?: string | null;
}


export interface WebsiteToLeadAgingReportResponse {
  success: boolean;
  data: WebsiteToLeadAgingItem[];
}
const WebsiteToLeadAgingReport = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [year, setYear] = useState(CURRENT_YEAR.toString());
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const { data, loading, error } = useSelector(
    (state: RootState) => state.report.websiteToLeadAgingReport,
  );

  const rows = Array.isArray(data) ? data : [];

  useEffect(() => {
    dispatch(
      fetchWebsiteToLeadAgingReport({
        year: Number(year),
        regionId: selectedRegion || undefined,
        zoneId: selectedZone || undefined,
        cityId: selectedCity || undefined,
      }),
    );
  }, [dispatch, year, selectedRegion, selectedZone, selectedCity]);

  return (
    <div className="p-4">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md mb-4 border border-orange-200 shadow-sm">
        <div className="flex justify-between items-center">
          {/* TITLE */}
          <div className="pl-4 border-l-8 border-orange-600 bg-white px-3 rounded-md shadow-sm">
            <h2 className="text-3xl font-bold text-orange-700 py-4">
              📊 Website To Lead Aging Report
            </h2>
          </div>

          {/* FILTER */}
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

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="text-center py-10 text-lg font-semibold">
          Loading...
        </div>
      )}

      {/* ================= ERROR ================= */}
      {!loading && error && (
        <div className="text-center py-10 text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!loading && !error && (
        <div className="overflow-x-auto border border-gray-400 rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead className="bg-green-900 text-white">
              <tr>
                <th className="border p-2">S.No.</th>

                <th className="border p-2">Website Name</th>

                <th className="border p-2">Lead Name</th>

                <th className="border p-2">Website Phone</th>

                <th className="border p-2">Lead Phone</th>

                <th className="border p-2">Website City</th>

                <th className="border p-2">Website Time</th>

                <th className="border p-2">Lead Time</th>

                <th className="border p-2">Time Taken</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-6">
                    No Data Found
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.website_gac_id ?? row.lead_id ?? index}
                    className="hover:bg-orange-50 transition"
                  >
                    {/* S.NO */}
                    <td className="border p-2 text-center">{index + 1}</td>

                    {/* WEBSITE NAME */}
                    <td className="border p-2">{row.website_name || "-"}</td>

                    {/* LEAD NAME */}
                    <td className="border p-2">{row.lead_name || "-"}</td>

                    {/* WEBSITE PHONE */}
                    <td className="border p-2">{row.website_phone || "-"}</td>

                    {/* LEAD PHONE */}
                    <td className="border p-2">{row.lead_phone || "-"}</td>

                    {/* WEBSITE CITY */}
                    <td className="border p-2">{row.website_city || "-"}</td>

                    {/* WEBSITE TIME */}
                    {/*
                      Backend already IST formatted string bhej raha hai.
                      Isliye new Date() / toLocaleString() use nahi karna.
                    */}
                    <td className="border p-2 whitespace-nowrap">
                      {row.website_time || "-"}
                    </td>

                    {/* LEAD TIME */}
                    <td className="border p-2 whitespace-nowrap">
                      {row.lead_time || "-"}
                    </td>

                    {/* AGING */}
                    <td className="border p-2 font-bold text-red-600 whitespace-nowrap">
                      {row.aging || "-"}
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

export default WebsiteToLeadAgingReport;
