"use client";
import { fetchLeadDistribution } from "@/features/reports/monthlyReportSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useState, Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { Eye, X, ChevronDown } from "lucide-react";

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
  { bg: "bg-indigo-50", name: "bg-indigo-50" },
  { bg: "bg-cyan-50", name: "bg-cyan-50" },
  { bg: "bg-rose-50", name: "bg-rose-50" },
  { bg: "bg-green-50", name: "bg-green-50" },
  { bg: "bg-purple-50", name: "bg-purple-50" },
  { bg: "bg-yellow-50", name: "bg-yellow-50" },
];

export default function DailyLeadReport() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = String(new Date().getFullYear());

  const [selectedMonthNum, setSelectedMonthNum] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { distribution } = useSelector((state: RootState) => state.report);
  const [showImageModal, setShowImageModal] = useState(false);
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

  // API se data
  const apiData = distribution?.data ?? [];
  const teamTotal = distribution?.teamTotal ?? null;
  const totalDays = distribution?.totalDaysInMonth ?? 30;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i);
  const teamTotalLeads = teamTotal?.total_leads ?? 0;
  const selectedMonthName =
    monthsList.find((m) => m.num === selectedMonthNum)?.name ?? "";

  const cell = "border-r border-b border-gray-300 text-center px-1 py-1";
  const headCell = "border-r border-b border-gray-300 px-2 py-2 text-center";

  // Loading state
  if (distribution?.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* HEADER */}
      <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-md border border-orange-100">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 md:p-5 gap-4">
          {/* Title Section */}
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Leads Distribution PS
                  </span>
                  <span className="text-gray-700 ml-2">
                    – {selectedMonthName} {year}
                  </span>
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-2"></div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex gap-3 items-center">
            {/* ✅ Eye Button */}
            <button
              onClick={() => setShowImageModal(true)}
              className="p-1 rounded-full hover:bg-orange-50 border-2 border-orange-400 shadow-sm transition-colors"
              title="View Chart"
            >
              <Eye className="w-6 h-6 text-orange-600" />
            </button>
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

            {/* Month Select */}
            <div className="relative">
              <select
                value={selectedMonthNum}
                onChange={(e) => setSelectedMonthNum(Number(e.target.value))}
                className="appearance-none bg-white border-2 border-orange-200 rounded-xl px-4 py-2.5 pr-10 font-semibold text-gray-700 hover:border-orange-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-200 cursor-pointer shadow-sm"
              >
                {monthsList.map((m) => (
                  <option key={m.num} value={m.num}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-orange-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>

            {/* Year Select */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="appearance-none bg-white border-2 border-orange-200 rounded-xl px-4 py-2.5 pr-10 font-semibold text-gray-700 hover:border-orange-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-200 cursor-pointer shadow-sm"
              >
                {["2024", "2025", "2026", "2027"].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-orange-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ IMAGE MODAL */}
        {showImageModal && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-6xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-lg font-bold text-orange-700">
                  Lead Distribution Chart – {selectedMonthName} {year}
                </h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#EE0000] hover:bg-red-700 transition-colors"
                >
                  <X className="w-6 h-6 text-white" strokeWidth={3} />
                </button>
              </div>

              <Image
                src={employeeDistb}
                alt="Leads Distribution Chart"
                width={1920}
                height={1080}
                priority
                className="w-full rounded-xl object-contain max-h-[85vh]"
              />
            </div>
          </div>
        )}
      </div>

      {/* NO DATA */}
      {apiData.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-400 text-lg">
            No data found for this period.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-400 border-separate border-spacing-0 text-md font-semibold">
            <thead>
              <tr className="bg-green-950 text-white">
                <th className={headCell}>NAME</th>
                <th className={headCell}>STATUS</th>
                {daysArray.map((d) => (
                  <th key={d} className={headCell}>
                    {d + 1}
                  </th>
                ))}
                <th className="border-b border-white bg-green-950 text-white px-2 py-2 ">
                  TOTAL
                </th>
                <th className="border-b border-white bg-green-950 text-white px-2 py-2">
                  AVG/DAY
                </th>
                <th className="border-b border-white bg-green-950 text-white px-2 py-2">
                  CNTB %
                </th>
              </tr>
            </thead>

            <tbody>
              {apiData.map((adviser: any, index: number) => {
                const color = rowColors[index % rowColors.length];

                return (
                  <Fragment key={adviser.adviser_id}>
                    {/* LEADS ROW */}
                    <tr className={color.bg}>
                      <td
                        rowSpan={2}
                        className={`${cell} font-bold text-xl ${color.name}`}
                      >
                        {adviser.adviser_name}
                      </td>

                      <td className={`${cell} text-blue-700`}>Lead</td>

                      {adviser.days.map((d: any) => (
                        <td key={d.day} className={`${cell} text-blue-700`}>
                          {d.leads || 0}
                        </td>
                      ))}

                      <td
                        className={`${cell} font-extrabold text-green-700 bg-amber-200 text-xl`}
                      >
                        {adviser.total_leads}
                      </td>
                      <td
                        className={`${cell} font-extrabold bg-amber-200 text-xl`}
                      >
                        {adviser.avg_leads_per_day}
                      </td>
                      <td rowSpan={2} className="border-b border-gray-400 px-2 py-1 font-extrabold text-purple-700 bg-amber-200 text-center text-xl">
                        {teamTotalLeads > 0
                          ? ((adviser.total_leads / teamTotalLeads) * 100).toFixed(1)
                           : "0.0"}
                      </td>
                    </tr>

                    {/* BOOKED ROW */}
                    <tr className={color.bg}>
                      <td className={`${cell} text-pink-700`}>Book</td>

                      {adviser.days.map((d: any) => (
                        <td key={d.day} className={`${cell} text-pink-700`}>
                          {d.booked || 0}
                        </td>
                      ))}

                      <td
                        className={`${cell} font-extrabold text-red-600 bg-amber-200`}
                      >
                        {adviser.total_booked}
                      </td>
                      <td
                        className={`${cell} font-extrabold text-red-600 bg-amber-200`}
                      >
                        —
                      </td>
                    </tr>
                  </Fragment>
                );
              })}

              {/* TEAM TOTAL ROW */}
              {teamTotal && (
                <tr className="bg-green-800 text-white font-bold text-2xl">
                  <td colSpan={2} className={cell}>
                    Team Total
                  </td>

                  {teamTotal.days.map((d: any) => (
                    <td key={d.day} className={cell}>
                      {d.leads || 0}
                    </td>
                  ))}

                  <td className={cell}>{teamTotal.total_leads}</td>
                  <td className={cell}>—</td>
                  <td className="text-center px-2">
                    {teamTotal.total_leads > 0
                      ? (
                          (teamTotal.total_leads / teamTotal.total_leads) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
