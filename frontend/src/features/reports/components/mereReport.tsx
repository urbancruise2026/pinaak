// MonthlyEnquiryReport.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMonthlyEnquiry } from "../monthlyReportSlice";
import { RootState, AppDispatch } from "@/store/store";
import { Eye, X, ChevronDown } from "lucide-react";
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

function getMonthColorClass(monthName: string): string {
  if (["APR", "MAY", "JUN"].includes(monthName)) return "bg-green-300";
  if (["JUL", "AUG", "SEP", "OCT"].includes(monthName)) return "bg-cyan-300";
  if (["NOV", "DEC", "JAN"].includes(monthName)) return "bg-green-300";
  if (["FEB", "MAR"].includes(monthName)) return "bg-cyan-300";
  return "";
}

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-semibold">❌ Error: {error}</p>
          <button
            onClick={() => dispatch(fetchMonthlyEnquiry({year:Number(year)}))}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <style>{`
  .high-value {
    display: inline-block;
    color: #be123c;
    font-weight: 900;
    font-family: "Arial Black", Arial, sans-serif;
  }

  .sunday-cell {
    color: #000000;
    font-weight: 900;
  }

  .sunday-high {
    color: #be123c;
    font-weight: 900;
    font-family: "Arial Black", Arial, sans-serif;
  }
`}</style>

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md mb-4 border border-orange-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-600 bg-white px-3 rounded-md shadow-sm">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-700 p-2">
              📊 Monthly Enquiry Report – {year}
            </h2>
          </div>

          <div className="flex items-center gap-4">
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
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-4xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-lg font-bold text-orange-700">
                  Employee Performance TS – {year}
                </h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#EE0000] hover:bg-red-700 transition-colors"
                >
                  <X className="w-6 h-6 text-white" strokeWidth={3} />
                </button>
              </div>

              {/* Image */}
              <Image
                src={employee}
                alt="Performance Chart"
                width={900}
                height={600}
                priority
                className="w-full rounded-xl object-contain max-h-[70vh]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── No Data Warning ── */}
      {(!apiData || apiData.length === 0) && !loading && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center text-yellow-700 font-medium">
          ⚠️ No data found for year {year}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto border border-gray-600 rounded-lg shadow-sm">
        <table className="border-collapse w-full text-center font-bold">
          <thead className="bg-green-950 text-white text-2xl">
            <tr>
              <th className="border border-white p-3 font-bold text-xl">
                MONTH
              </th>
              {[...Array(31)].map((_, i) => (
                <th
                  key={i}
                  className="border border-white p-2 font-bold text-lg"
                >
                  {i + 1}
                </th>
              ))}
              <th className="border border-white p-3 font-bold text-white text-xl">
                TOTAL
              </th>
              <th className="border border-white p-3 font-bold text-white text-xl">
                AVG
              </th>
            </tr>
          </thead>

          <tbody>
            {reportData.map((month, idx) => {
              const monthColor = getMonthColorClass(month.name);
              const monthIndex = MONTH_NAME_TO_INDEX[month.name];

              return (
                <tr key={idx}>
                  <td
                    className={`border border-gray-600 p-2 font-bold text-xl ${monthColor}`}
                  >
                    {month.name}
                  </td>

                  {month.dailyData.map((value: number, i: number) => {
                    const dayNumber = i + 1;
                    const sunday = isSunday(
                      Number(year),
                      monthIndex,
                      dayNumber,
                    );
                    const highValue = value >= 50;

                    const cellBg = sunday ? "!bg-gray-300" : "";

                    const textClass =
                      highValue && sunday
                        ? "sunday-high"
                        : highValue
                          ? "high-value"
                          : sunday
                            ? "sunday-cell"
                            : "";

                    return (
                      <td
                        key={i}
                        className={`border border-gray-600 p-1 text-lg ${monthColor} ${cellBg}`}
                      >
                        {value > 0 ? (
                          <span className={textClass}>{value}</span>
                        ) : (
                          ""
                        )}
                      </td>
                    );
                  })}

                  {[...Array(31 - month.days)].map((_, i) => (
                    <td
                      key={`empty-${i}`}
                      className={`border border-gray-600 p-1 ${monthColor}`}
                    />
                  ))}

                  <td className="border border-gray-600 p-2 bg-amber-200 font-bold text-green-800 text-xl">
                    {month.total}
                  </td>
                  <td className="border border-gray-600 p-2 bg-amber-200 font-bold text-red-800 text-xl">
                    {month.avg > 0 ? month.avg : ""}
                  </td>
                </tr>
              );
            })}

            {/* ── Grand Total Row ── */}
            <tr className="bg-green-800 text-white font-bold text-lg">
              <td className="border border-white p-2 text-xl">TOTAL</td>

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
                    className="border border-white p-2 text-lg"
                  >
                    {dailyTotal > 0 ? dailyTotal : ""}
                  </td>
                );
              })}

              <td className="border border-white p-2 text-2xl font-extrabold text-white">
                {grandTotal}
              </td>
              <td className="border border-gray-600 p-2 text-2xl font-extrabold text-white">
                {grandAvg > 0 ? grandAvg : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
