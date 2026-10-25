"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchTimeEnquiry } from "../monthlyReportSlice";

const timeSlots = [
  { label: "00:00-06:00", start: 0, end: 6 },
  { label: "06:00-10:00", start: 6, end: 10 },
  { label: "10:00-17:00", start: 10, end: 17 },
  { label: "17:00-21:30", start: 17, end: 21.5 },
  { label: "21:30-00:00", start: 21.5, end: 24 },
];

function getTimeSlotFromHour(hour: number): string {
  if (hour >= 10 && hour < 17) return "10:00-17:00";
  if (hour >= 17 && hour < 21.5) return "17:00-21:30";
  if (hour >= 21.5 && hour < 24) return "21:30-00:00";
  if (hour >= 0 && hour < 6) return "00:00-06:00";
  if (hour >= 6 && hour < 10) return "06:00-10:00";
  return "Unknown";
}

const months = [
  { name: "JAN", index: 1 },
  { name: "FEB", index: 2 },
  { name: "MAR", index: 3 },
  { name: "APR", index: 4 },
  { name: "MAY", index: 5 },
  { name: "JUN", index: 6 },
  { name: "JUL", index: 7 },
  { name: "AUG", index: 8 },
  { name: "SEP", index: 9 },
  { name: "OCT", index: 10 },
  { name: "NOV", index: 11 },
  { name: "DEC", index: 12 },
];

function getDaysInMonth(monthIndex: number, year: number) {
  return new Date(year, monthIndex, 0).getDate();
}

function getCurrentMonthName() {
  const m = new Date().getMonth() + 1;
  return months.find((x) => x.index === m)?.name || "JAN";
}

function getCurrentYear() {
  return new Date().getFullYear().toString();
}

interface TimeEnquiryRecord {
  month: number;
  day: number;
  hour: number;
  total: number;
}

const getSlotDataColor = (label: string): string => {
  if (label === "10:00-17:00" || label === "17:00-21:30") {
    return "bg-blue-300";
  }
  return "bg-gray-200";
};

export default function MonthlyEnquiryReport() {
  const dispatch = useDispatch<AppDispatch>();

  const { timeEnquiry } = useSelector((state: RootState) => state.report);
  const { data: reportData, loading, error } = timeEnquiry;

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthName());
  const [year, setYear] = useState(getCurrentYear());

  const [compareMonth, setCompareMonth] = useState(() => {
    const m = new Date().getMonth() + 1;
    const prev = m === 1 ? 12 : m - 1;
    return months.find((x) => x.index === prev)?.name || "DEC";
  });

  useEffect(() => {
    dispatch(fetchTimeEnquiry(parseInt(year)));
  }, [dispatch, year]);

  const getMonthInfo = (name: string, yearNum: number) => {
    const base = months.find((m) => m.name === name) || months[0];
    return {
      ...base,
      days: getDaysInMonth(base.index, yearNum),
    };
  };

  const yearNum = parseInt(year);
  const monthInfo = getMonthInfo(selectedMonth, yearNum);
  const compareMonthInfo = getMonthInfo(compareMonth, yearNum);

  // ── Main month data ──────────────────────────────────────
  const timeData = useMemo(() => {
    const slotData = timeSlots.map((slot) => ({
      label: slot.label,
      daily: Array(monthInfo.days).fill(0),
      total: 0,
      avg: 0,
    }));

    const monthRecords = (reportData || []).filter(
      (record: TimeEnquiryRecord) => record.month === monthInfo.index,
    );

    monthRecords.forEach((record) => {
      const dayIndex = record.day - 1;
      if (dayIndex >= 0 && dayIndex < monthInfo.days) {
        const slotLabel = getTimeSlotFromHour(record.hour);
        const slotIdx = timeSlots.findIndex((s) => s.label === slotLabel);
        if (slotIdx !== -1) {
          slotData[slotIdx].daily[dayIndex] += record.total;
          slotData[slotIdx].total += record.total;
        }
      }
    });

    slotData.forEach((slot) => {
      slot.avg = Math.round(slot.total / monthInfo.days);
    });

    return slotData;
  }, [reportData, monthInfo]);

  const dailyTotals = useMemo(() => {
    const totals = Array(monthInfo.days).fill(0);
    timeData.forEach((slot) => {
      slot.daily.forEach((val, i) => {
        totals[i] += val;
      });
    });
    return totals;
  }, [timeData, monthInfo.days]);

  const grandTotal = dailyTotals.reduce((a, b) => a + b, 0);

  // ── Compare month data ───────────────────────────────────
  const compareTimeData = useMemo(() => {
    const slotData = timeSlots.map((slot) => ({
      label: slot.label,
      daily: Array(compareMonthInfo.days).fill(0),
      total: 0,
      avg: 0,
    }));

    const monthRecords = (reportData || []).filter(
      (record: TimeEnquiryRecord) => record.month === compareMonthInfo.index,
    );

    monthRecords.forEach((record) => {
      const dayIndex = record.day - 1;
      if (dayIndex >= 0 && dayIndex < compareMonthInfo.days) {
        const slotLabel = getTimeSlotFromHour(record.hour);
        const slotIdx = timeSlots.findIndex((s) => s.label === slotLabel);
        if (slotIdx !== -1) {
          slotData[slotIdx].daily[dayIndex] += record.total;
          slotData[slotIdx].total += record.total;
        }
      }
    });

    slotData.forEach((slot) => {
      slot.avg = Math.round(slot.total / compareMonthInfo.days);
    });

    return slotData;
  }, [reportData, compareMonthInfo]);

  const compareDailyTotals = useMemo(() => {
    const totals = Array(compareMonthInfo.days).fill(0);
    compareTimeData.forEach((slot) => {
      slot.daily.forEach((val, i) => {
        totals[i] += val;
      });
    });
    return totals;
  }, [compareTimeData, compareMonthInfo.days]);

  const compareGrandTotal = compareDailyTotals.reduce((a, b) => a + b, 0);
  const compareAvg = Math.round(compareGrandTotal / compareMonthInfo.days);

  const getPercent = (value: number) => {
    if (!grandTotal) return 0;
    return Math.round((value / grandTotal) * 100);
  };

  const growth =
    compareGrandTotal === 0
      ? 0
      : Math.round(
          ((grandTotal - compareGrandTotal) / compareGrandTotal) * 100,
        );

  const hasAnyData = reportData && reportData.length > 0;
  const currentMonthName = getCurrentMonthName();
  const currentYear = getCurrentYear();

  if (loading) return <div className="p-6 text-2xl font-bold">Loading...</div>;
  if (error)
    return (
      <div className="p-6 text-red-600 text-xl font-bold">Error: {error}</div>
    );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 bg-orange-100 shadow-lg rounded-md">
        <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md w-full">
          <div className="flex items-center">
            <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
              <h2 className="text-4xl font-bold text-left py-4 text-orange-600 p-2">
                Time Enquiry Reports PS – {currentMonthName} {currentYear}
              </h2>
            </div>

            <div className="flex gap-3 flex-wrap ml-auto">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border px-3 py-2 font-semibold"
              >
                {months.map((m) => (
                  <option key={m.name}>{m.name}</option>
                ))}
              </select>

              <select
                value={compareMonth}
                onChange={(e) => setCompareMonth(e.target.value)}
                className="border px-3 py-2 font-semibold bg-yellow-100"
              >
                {months.map((m) => (
                  <option key={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg border">
        {hasAnyData ? (
          <table className="border-collapse w-full text-center font-semibold">
            <thead>
              <tr className="bg-green-950 text-white">
                <th className="border p-2">TIME SLOT</th>
                {[...Array(monthInfo.days)].map((_, i) => (
                  <th key={i} className="border p-1">
                    {i + 1}
                  </th>
                ))}
                <th className="border  p-2">TOTAL</th>
                <th className="border p-2">AVG</th>
                <th className="border p-2">%</th>
              </tr>
            </thead>

            <tbody>
              {timeData.map((slot, idx) => (
                <tr key={idx}>
                  {/* ✅ Label cell — same bg as row */}
                  {/* Time Slot Column */}
                  <td className="border p-2 font-bold bg-gray-200">
                    {slot.label}
                  </td>

                  {/* Date-wise Data */}
                  {slot.daily.map((v, i) => (
                    <td
                      key={i}
                      className={`border border-gray-400 p-1 ${getSlotDataColor(slot.label)}`}
                    >
                      {v > 0 ? v : "-"}
                    </td>
                  ))}

                  <td className="border bg-amber-200 font-bold p-2 text-blue-900">
                    {slot.total > 0 ? slot.total : "-"}
                  </td>

                  <td className="border bg-amber-200 font-bold p-2 text-blue-900">
                    {slot.avg > 0 ? slot.avg : "-"}
                  </td>

                  <td className="border bg-amber-200 font-bold p-2 text-blue-900">
                    {getPercent(slot.total)}%
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-green-800 text-white font-bold">
                <td className="border p-2">TOTAL</td>
                {dailyTotals.map((v, i) => (
                  <td key={i} className="border p-1">
                    {v > 0 ? v : "-"}
                  </td>
                ))}
                <td className="border p-2">{grandTotal}</td>
                <td className="border p-2">
                  {Math.round(grandTotal / monthInfo.days)}
                </td>
                <td className="border p-2">100%</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <p className="text-gray-500 text-lg font-semibold">
              No Data Available
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Please check back later
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
