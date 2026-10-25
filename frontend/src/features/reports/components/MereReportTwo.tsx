"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMonthlyReportTwo } from "../monthlyReportSlice";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

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

  // ✅ data से rows और pickupMonthSummary अलग करो
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

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const toDisplay = (m: string) => m.toUpperCase();

  const currentMonthIndex = new Date().getMonth();
  const orderedMonths = [
    ...months.slice(currentMonthIndex),
    ...months.slice(0, currentMonthIndex),
  ];
  const containers = [orderedMonths.slice(0, 6), orderedMonths.slice(6, 12)];

  // ✅ rows से pickupByMonth map बनाओ
const pickupByMonth = useMemo(() => {
  const map: Record<string, Record<number, number>> = {};
  rows.forEach((r) => {
    const day = r.day;
    if (day == null) return;
    Object.entries(r.pickupMonthCounts ?? {}).forEach(([pickupMonth, count]) => {
      const bucket = (map[pickupMonth] ??= {});
      bucket[day] = (bucket[day] ?? 0) + Number(count);
    });
  });
  return map;
}, [rows]);

const getMonthData = (monthName: string): Record<number, number> => {
  const result: Record<number, number> = {};
  for (const r of rows) {
    if (r.month !== monthName || r.day == null) continue;
    result[r.day] = r.total ?? 0;
  }
  return result;
};

  const getRowTotal = (monthName: string): number =>
    Object.values(getMonthData(monthName)).reduce((s, v) => s + v, 0);

  const getColTotal = (day: number, displayMonths: string[]): number =>
    displayMonths.reduce((sum, m) => sum + (getMonthData(m)[day] ?? 0), 0);

  // ─── Render ───────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-lg">
        Loading report...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-lg">
        Error: {error}
      </div>
    );

  return (
    <>
      <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md mb-4 border border-orange-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-600 bg-white px-3 rounded-md shadow-sm">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-700 p-2">
              📊 Monthly Enquiry Report Two – {year}
            </h2>
          </div>

          <div className="flex items-center gap-4">
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

      <div className="p-4 overflow-auto bg-white">
        {containers.map((displayMonths, containerIndex) => (
          <div
            key={containerIndex}
            className="border-[3px] border-black mb-8 min-w-[1400px]"
          >
            {/* Header */}
            <div className="flex">
              <div className="w-[70px] bg-purple-700 border-r border-black" />
              <div className="flex-1 bg-green-700 text-white text-center font-bold text-2xl py-1 border-r border-black">
                MONTHLY ENQUIRY REPORT - LEAD TRENDS
              </div>
              <div className="w-[120px] bg-green-700 text-yellow-300 text-center font-bold text-xl border-r border-black flex items-center justify-center">
                DELHI
              </div>
              <div className="w-[100px] bg-pink-600 text-white text-center font-bold text-xl border-r border-black flex items-center justify-center">
                {toDisplay(displayMonths[0])}
              </div>
              <div className="w-[350px] bg-yellow-300 text-green-700 text-center font-bold text-lg flex items-center justify-center">
                {displayMonths.map(toDisplay).join(" | ")}
              </div>
            </div>

            {/* Table */}
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className="border border-gray-500 bg-yellow-200 w-[80px]">
                    Month
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="border border-gray-500 bg-yellow-100 text-xs w-[40px]"
                    >
                      {day}
                    </th>
                  ))}
                  <th className="border border-gray-500 bg-yellow-300 w-[55px]">
                    TOT
                  </th>
                  {/* ✅ AVG column add */}
                  <th className="border border-gray-500 bg-yellow-300 w-[55px]">
                    AVG
                  </th>
                </tr>
              </thead>

              <tbody>
                {displayMonths.map((month) => {
                  // ✅ pickupMonthSummary से total और avg लो
                  const summary = pickupMonthSummary[month];
                  const total = summary?.total ?? 0;
                  const avg = summary?.avg ?? 0;

                  return (
                    <tr key={month}>
                      <td className="border border-gray-400 text-red-600 font-semibold text-center align-middle">
                        {toDisplay(month)}
                      </td>

                      {days.map((day) => {
                        const pickupVal = pickupByMonth[month]?.[day] ?? 0;

                        return (
                          <td
                            key={day}
                            className={`border border-gray-300 text-center text-xs p-0 ${
                              pickupVal > 0 ? "bg-white" : "bg-gray-100"
                            }`}
                          >
                            <div className="flex flex-col items-center justify-start py-[2px] min-h-[28px]">
                              {pickupVal > 0 && (
                                <span className="text-[11px] font-semibold text-blue-600 leading-[13px]">
                                  {pickupVal}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* ✅ TOT — pickupMonthSummary से */}
                      <td className="border border-gray-400 bg-lime-200 text-center text-xs font-semibold align-middle">
                        {total > 0 ? total : ""}
                      </td>
                      {/* ✅ AVG — pickupMonthSummary से */}
                      <td className="border border-gray-400 bg-lime-200 text-center text-xs align-middle">
                        {avg > 0 ? avg : ""}
                      </td>
                    </tr>
                  );
                })}

                {/* Total Row */}
                <tr>
                  <td className="border border-black bg-yellow-300 font-bold text-center text-sm">
                    TOTAL
                  </td>
                  {days.map((day) => {
                    const colTotal = getColTotal(day, displayMonths);
                    return (
                      <td
                        key={day}
                        className="border border-black bg-yellow-100 text-center text-xs font-semibold"
                      >
                        {colTotal > 0 ? colTotal : ""}
                      </td>
                    );
                  })}
                  <td className="border border-black bg-yellow-300 text-center text-xs font-bold">
                    {displayMonths.reduce(
                      (s, m) => s + (pickupMonthSummary[m]?.total ?? 0),
                      0,
                    ) || ""}
                  </td>
                  {/* ✅ AVG total cell खाली */}
                  <td className="border border-black bg-yellow-300" />
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}
