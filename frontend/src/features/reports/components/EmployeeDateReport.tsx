"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseDateReport } from "@/features/reports/monthlyReportSlice";
import { AppDispatch } from "@/store/store";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Eye, X } from "lucide-react";
import employeeDate from "@/assets/images/empforstatus.png";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const MONTH_MAP: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const ALL_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const STATUSES = ["new", "kyc", "rfq", "hot", "vehn", "lost", "book"];

const STATUS_LABELS: Record<string, string> = {
  new: "NEW",
  kyc: "KYC",
  rfq: "RFQ",
  hot: "HOT",
  vehn: "VEH-N",
  lost: "LOST",
  book: "BOOK",
};

const STATUS_STYLE: Record<string, string> = {
  new: "text-blue-600 bg-blue-200",
  kyc: "text-cyan-800 bg-cyan-200",
  rfq: "text-amber-600 bg-amber-200",
  hot: "text-pink-950 bg-pink-200",
  vehn: "text-[#2c1332] bg-[#2c1332]/5",
  lost: "text-red-600 bg-red-200",
  book: "text-green-800 bg-green-200",
};

const rowColors = [
  "bg-indigo-50",
  "bg-cyan-50",
  "bg-rose-50",
  "bg-green-50",
  "bg-purple-50",
  "bg-yellow-50",
];

const Empreport = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Default: current year & current month
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    ALL_MONTHS[new Date().getMonth()],
  );

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await dispatch(
          fetchStatusWiseDateReport({
            month: MONTH_MAP[selectedMonth],
            year: Number(selectedYear),

            // filters
            regionId: selectedRegion || undefined,
            zoneId: selectedZone || undefined,
            cityId: selectedCity || undefined,
          }),
        ).unwrap();

        const safeEmployees = Array.isArray(result?.data) ? result.data : [];

        setEmployees(safeEmployees);
      } catch (err) {
        console.error("Date Report Error:", err);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    selectedMonth,
    selectedYear,
    selectedRegion,
    selectedZone,
    selectedCity,
    dispatch,
  ]);

  const daysInMonth = new Date(
    Number(selectedYear),
    MONTH_MAP[selectedMonth],
    0,
  ).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-orange-100 shadow-sm">
        <div className="pl-4 border-l-8 border-orange-500 bg-orange-100 px-3">
          <div className="flex justify-between items-center py-4">
            <h2 className="text-4xl font-bold text-orange-600 p-2">
              Employee Performance PS – {selectedMonth} {selectedYear}
            </h2>

            <div className="flex items-center gap-3">
              <AllRegionZoneCityFilter
                selectedRegion={selectedRegion}
                selectedZone={selectedZone}
                selectedCity={selectedCity}
                selectedYear={selectedYear}
                onRegionChange={setSelectedRegion}
                onZoneChange={setSelectedZone}
                onCityChange={setSelectedCity}
                onYearChange={setSelectedYear}
                layout="row"
              />
              <button
                onClick={() => setShowImageModal(true)}
                className="p-1 rounded-full hover:bg-orange-50 border-2 border-orange-400 shadow-sm transition-colors"
                title="View Chart"
              >
                <Eye className="w-6 h-6 text-orange-600" />
              </button>

              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-slate-300 text-lg">|</span>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {ALL_MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

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
                  Employee Reports PS Chart – {selectedMonth} {selectedYear}
                </h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#EE0000] hover:bg-red-700 transition-colors"
                >
                  <X className="w-6 h-6 text-white" strokeWidth={3} />
                </button>
              </div>
              <Image
                src={employeeDate}
                alt="Employee Performance TS"
                width={1920}
                height={1080}
                priority
                className="w-full rounded-xl object-contain max-h-[70vh]"
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-10 h-10" />
        </div>
      ) : (
        <div className="bg-white rounded-xl mt-2 shadow overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-green-950 text-white">
                {/* ✅ EMP - sticky */}
                <th className="sticky left-0 z-20 bg-green-950 border p-2 w-[35px] min-w-[35px]">
                  EMP
                </th>
                {/* ✅ Status - sticky after EMP */}
                <th className="sticky left-[35px] z-20 bg-green-950 border p-1 min-w-[70px]">
                  Status
                </th>
                {daysArray.map((day) => (
                  <th key={day} className="border p-2 min-w-[40px]">
                    {day}
                  </th>
                ))}
                <th className="border p-2 bg-green-950 min-w-[60px]">TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {employees.length > 0 ? (
                employees.map((employee, empIndex) => {
                  const bgColor = rowColors[empIndex % rowColors.length];
                  const days = Array.isArray(employee?.days)
                    ? employee.days
                    : [];
                  const totals = employee?.totals || {};

                  return (
                    <React.Fragment key={employee?.adviser_id}>
                      {STATUSES.map((status, statusIdx) => (
                        <tr
                          key={`${employee?.adviser_id}-${status}`}
                          className={bgColor}
                        >
                          {statusIdx === 0 && (
                            <td
                              rowSpan={STATUSES.length + 1}
                              className={`sticky left-0 z-10 border font-bold ${bgColor} w-[35px] min-w-[35px] max-w-[35px] p-0 text-center align-middle`}
                            >
                              <div
                                className="flex items-center justify-center mx-auto font-extrabold text-base"
                                style={{
                                  writingMode: "vertical-rl",
                                  transform: "rotate(180deg)",
                                  whiteSpace: "nowrap",
                                  lineHeight: "16px",
                                  padding: "6px 0",
                                  letterSpacing: "10px",
                                }}
                              >
                                {employee?.adviser_name
                                  ?.toUpperCase()
                                  .replace(/\s+/g, " ")
                                  .trim()}
                              </div>
                            </td>
                          )}

                          {/* ✅ Status cell - sticky */}
                          <td
                            className={`sticky left-[35px] z-10 border p-0.5 font-semibold ${STATUS_STYLE[status]}`}
                          >
                            {STATUS_LABELS[status]}
                          </td>

                          {daysArray.map((dayNo) => {
                            const dayData =
                              days.find((d: any) => d.day === dayNo) || {};
                            return (
                              <td
                                key={dayNo}
                                className={`border text-center font-semibold ${STATUS_STYLE[status].split(" ")[0]}`}
                              >
                                {(dayData?.[status] || 0) > 0
                                  ? dayData[status]
                                  : "-"}
                              </td>
                            );
                          })}

                          <td className="border text-center bg-amber-200 font-bold">
                            {totals[status] || 0}
                          </td>
                        </tr>
                      ))}

                      {/* TOTAL ROW */}
                      <tr className="bg-amber-500 text-lg font-extrabold">
                        {/* ✅ TOTAL label - sticky */}
                        <td className="sticky left-[35px] z-10 border text-center px-3 py-2 bg-amber-500">
                          TOTAL
                        </td>
                        {daysArray.map((dayNo) => {
                          const dayData =
                            days.find((d: any) => d.day === dayNo) || {};
                          return (
                            <td
                              key={dayNo}
                              className="border text-center text-base font-semibold"
                            >
                              {(dayData?.total || 0) > 0 ? dayData.total : "-"}
                            </td>
                          );
                        })}
                        <td className="border bg-amber-300 text-center font-bold">
                          {totals.total || 0}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={daysArray.length + 3}
                    className="text-center py-10 text-gray-500"
                  >
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Empreport;
