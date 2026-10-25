"use client";
import { useState, useEffect } from "react";
import { fetchLongWeekendReport } from "../monthlyReportSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const MONTHS: { label: string; month: number }[] = [
  { label: "APR", month: 4 },
  { label: "MAY", month: 5 },
  { label: "JUN", month: 6 },
  { label: "JUL", month: 7 },
  { label: "AUG", month: 8 },
  { label: "SEP", month: 9 },
  { label: "OCT", month: 10 },
  { label: "NOV", month: 11 },
  { label: "DEC", month: 12 },
  { label: "JAN", month: 1 },
  { label: "FEB", month: 2 },
  { label: "MAR", month: 3 },
];

const DAYS: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

type DayData = { total: number; avg: number };
type DataMap = { [month: number]: { [day: number]: DayData } };

export default function LongWeekendReport() {
  const dispatch = useAppDispatch();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(currentYear.toString());
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const { data, loading, error } = useAppSelector(
    (state) => state.report.longWeekend,
  );

  useEffect(() => {
    dispatch(
      fetchLongWeekendReport({
        year: Number(year),
        regionId: selectedRegion,
        zoneId: selectedZone,
        cityId: selectedCity,
      }),
    );
  }, [dispatch, year, selectedRegion, selectedZone, selectedCity]);

  const dataMap = (data ?? []).reduce<DataMap>((acc, row) => {
    if (!acc[row.month]) acc[row.month] = {};
    acc[row.month][row.day] = {
      total: Number(row.total),
      avg: row.avg,
    };
    return acc;
  }, {} as DataMap);

  const getRowColor = (label: string): string => {
    if (["APR", "MAY", "JUN"].includes(label)) return "bg-green-200";
    if (["JUL", "AUG", "SEP", "OCT"].includes(label)) return "bg-cyan-200";
    if (["NOV", "DEC", "JAN"].includes(label)) return "bg-green-200";
    return "bg-cyan-200";
  };

  const isSunday = (year: number, month: number, day: number): boolean => {
    return new Date(year, month - 1, day).getDay() === 0;
  };

  const monthTotals = MONTHS.map(({ label, month }) => {
    const monthData = dataMap[month] ?? {};
    const total = Object.values(monthData).reduce((s, v) => s + v.total, 0);
    const activeDays = Object.keys(monthData).length;
    const avg = activeDays > 0 ? Math.round(total / activeDays) : 0;
    return { label, month, total, avg };
  });

  const dayTotals = DAYS.map((day) =>
    MONTHS.reduce((sum, { month }) => {
      return sum + (dataMap[month]?.[day]?.total ?? 0);
    }, 0),
  );

  const grandTotal = monthTotals.reduce((s, r) => s + r.total, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] text-2xl font-bold">
        Loading Long Weekend Report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px] text-red-600 text-xl font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* ── Sunday CSS (Monthly report wali exact styling) ── */}
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

      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md mb-4 border border-orange-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-bold text-orange-700 py-4 pl-4 border-l-8 border-orange-600 bg-white px-3 rounded-md shadow-sm">
            🏖️ Long Weekend Report – {year}
          </h2>

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

      {/* TABLE */}
      <div className="overflow-x-auto border border-gray-600 rounded-lg shadow-sm">
        <table className="border-collapse w-full text-center font-bold">
          <thead>
            <tr className="bg-green-950 text-white">
              <th className="border border-white p-3 text-xl">MONTH</th>
              {DAYS.map((day) => (
                <th key={day} className="border border-white p-2 text-lg">
                  {day}
                </th>
              ))}
              <th className="border border-white p-3 text-xl">TOTAL</th>
              <th className="border border-white p-3 text-xl">AVG</th>
            </tr>
          </thead>

          <tbody>
            {MONTHS.map(({ label, month }) => {
              const monthData = dataMap[month] ?? {};
              const monthStat = monthTotals.find((r) => r.month === month)!;

              return (
                <tr key={label}>
                  <td
                    className={`border border-gray-600 p-2 text-xl ${getRowColor(label)}`}
                  >
                    {label}
                  </td>

                  {DAYS.map((day) => {
                    const cell = monthData[day];
                    const value = cell?.total ?? 0;

                    const sunday = isSunday(Number(year), month, day);
                    const highValue = value >= 35;
                    // ✅ Monthly report wala exact pattern: !bg-gray-300 force override
                    const cellBg = sunday ? "!bg-gray-300" : "";

                    // ✅ Monthly report wali CSS classes
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
                        key={day}
                        className={`border border-gray-600 p-2 h-12 ${getRowColor(label)} ${cellBg}`}
                      >
                        {value > 0 ? (
                          <span className={textClass}>{value}</span>
                        ) : sunday ? (
                          // ✅ Sunday 0 bhi same class se dikhao
                          <span className="sunday-cell">0</span>
                        ) : (
                          ""
                        )}
                      </td>
                    );
                  })}

                  <td className="border border-gray-600 bg-amber-200 p-2">
                    {monthStat.total || "-"}
                  </td>
                  <td className="border border-gray-600 bg-amber-200 p-2">
                    {monthStat.avg || "-"}
                  </td>
                </tr>
              );
            })}

            {/* TOTAL ROW */}
            <tr className="bg-green-800 text-white">
              <td className="border border-white p-2 text-xl font-bold">
                TOTAL
              </td>

              {dayTotals.map((total, i) => (
                <td key={i} className="border border-white p-2">
                  {total || "-"}
                </td>
              ))}

              <td className="border border-white p-2 text-xl font-bold">
                {grandTotal || "-"}
              </td>

              <td className="border border-white p-2 text-xl font-bold">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
