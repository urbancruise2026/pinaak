"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseReport } from "@/features/reports/monthlyReportSlice";
import { AppDispatch } from "@/store/store";
import Image from "next/image";
import employee from "@/assets/images/employeeformulaview.png";
import { Eye, X } from "lucide-react";

import { BarChart3, Loader2, TrendingUp } from "lucide-react";
import { AllRegionZoneCityFilter } from "@/components/ui/AllRegionZoneCityFilter";

const MONTH_MAP = {
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

const ALL_MONTHS = [
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

// Trend chart uses the same fiscal order (APR -> MAR)
const CHART_MONTHS = ALL_MONTHS;

const AVAILABLE_YEARS = ["2023", "2024", "2025", "2026", "2027", "2028"];

/* ---------- helpers for the smooth trend chart ---------- */
type Pt = { x: number; y: number };

const smoothPath = (pts: Pt[]) => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
};

const CH_H = 120;
const CH_PAD_X = 30;
const CH_TOP = 30;
const CH_BASE = 90;

const Empreport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [ALL_MONTHSData, setALL_MONTHSData] = useState<Record<string, any[]>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [chartEl, setChartEl] = useState<HTMLDivElement | null>(null);
  const [chartW, setChartW] = useState(720);

  // Keep the SVG exactly as wide as its panel so the chart fills the space
  useEffect(() => {
    if (!chartEl) return;
    const update = () => setChartW(Math.max(320, chartEl.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(chartEl);
    return () => ro.disconnect();
  }, [chartEl]);

  const formatValue = (value: any) => {
    if (value === 0 || value === "0" || value === null || value === undefined)
      return "-";
    return value;
  };

  const formatEmployeeName = (name: string) => {
    if (!name) return "";
    return name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toUpperCase()
      .split(" ")
      .map((word) => word.split("").join(" "))
      .join("   ");
  };

  const capitalizeName = (name: string) => {
    if (!name) return "";
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-sky-600";
      case "rfq":
        return "text-sky-700";
      case "kyc":
        return "text-orange-500";
      case "hot":
        return "text-purple-500";
      case "vehn":
        return "text-purple-900";
      case "lost":
        return "text-red-500";
      case "book":
        return "text-green-800";
      default:
        return "text-yellow-700";
    }
  };

  const getHeadingColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "text-blue-600";
      case "RFQ":
        return "text-sky-700";
      case "KYC":
        return "text-orange-500";
      case "HOT":
        return "text-purple-500";
      case "VEH":
        return "text-purple-900";
      case "LST":
        return "text-red-500";
      case "BK":
        return "text-green-800";
      default:
        return "text-yellow-700";
    }
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
    setExpandedCard(null);
  };

  useEffect(() => {
    const fetchALL_MONTHSData = async () => {
      try {
        setLoading(true);
        const promises = ALL_MONTHS.map(async (month) => {
          try {
            const result = await dispatch(
              fetchStatusWiseReport({
                month: MONTH_MAP[month as keyof typeof MONTH_MAP],
                year: Number(selectedYear),
                regionId: selectedRegion || undefined,
                zoneId: selectedZone || undefined,
                cityId: selectedCity || undefined,
              }),
            ).unwrap();
            return { month, data: result?.data || [] };
          } catch (error) {
            console.error(`Error fetching ${month}:`, error);
            return { month, data: [] };
          }
        });
        const responses = await Promise.all(promises);
        const results: Record<string, any[]> = {};
        responses.forEach(({ month, data }) => {
          results[month] = data;
        });
        setALL_MONTHSData(results);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchALL_MONTHSData();
  }, [selectedYear, selectedRegion, selectedZone, selectedCity, dispatch]);

  useEffect(() => {
    if (!Object.keys(ALL_MONTHSData).length) return;
    const employeeMap = new Map();
    for (const month of ALL_MONTHS) {
      const monthData = ALL_MONTHSData[month] || [];
      for (const item of monthData) {
        const name = capitalizeName(item.adviser_name);
        let emp = employeeMap.get(name);
        if (!emp) {
          emp = { adviser_name: name, months: {} };
          employeeMap.set(name, emp);
        }
        emp.months[month] = {
          new: formatValue(item.new),
          kyc: formatValue(item.kyc),
          rfq: formatValue(item.rfq),
          hot: formatValue(item.hot),
          vehn: formatValue(item.vehn),
          lost: formatValue(item.lost),
          book: formatValue(item.book),
          blank: formatValue(item.blank),
          total: formatValue(item.total),
        };
      }
    }
    const emptyMonthData = {
      new: "-",
      kyc: "-",
      rfq: "-",
      hot: "-",
      vehn: "-",
      lost: "-",
      book: "-",
      blank: "-",
      total: "-",
    };
    const finalData = Array.from(employeeMap.values());
    for (const emp of finalData) {
      for (const month of ALL_MONTHS) {
        if (!emp.months[month]) emp.months[month] = { ...emptyMonthData };
      }
    }
    setProcessedData(finalData);
  }, [ALL_MONTHSData]);

  const grandTotal = useMemo(() => {
    return processedData.reduce(
      (sum, emp) =>
        sum +
        ALL_MONTHS.reduce((s, m) => {
          const total = emp.months[m]?.total;
          return s + (total !== "-" ? Number(total) : 0);
        }, 0),
      0,
    );
  }, [processedData]);

  const yearSum = (emp: any, field: string) => {
    let total = 0;
    for (const month of ALL_MONTHS) {
      const value = emp.months[month]?.[field];
      total += value !== "-" ? Number(value) : 0;
    }
    return total;
  };

  const getSummaryStats = () => {
    const totalLeads = processedData.reduce(
      (sum, emp) => sum + yearSum(emp, "total"),
      0,
    );

    // Average over the months that actually have data
    const activeMonths = ALL_MONTHS.filter((m) =>
      processedData.some((emp) => emp.months[m]?.total !== "-"),
    ).length;

    const avgPerMonth =
      activeMonths > 0 ? Math.round(totalLeads / activeMonths) : 0;

    // Top performer = most bookings
    const topPerformer = processedData.reduce(
      (best, emp) => {
        const book = yearSum(emp, "book");
        if (book > best.total) return { name: emp.adviser_name, total: book };
        return best;
      },
      { name: "", total: 0 },
    );

    return { totalLeads, avgPerMonth, topPerformer };
  };

  const summary = getSummaryStats();

  const getRowColor = (month: string) => {
    if (["APR", "MAY", "JUN"].includes(month))
      return "bg-green-100 hover:bg-green-200";
    if (["JUL", "AUG", "SEP", "OCT"].includes(month))
      return "bg-sky-100 hover:bg-sky-200";
    if (["NOV", "DEC", "JAN"].includes(month))
      return "bg-green-100 hover:bg-green-200";
    return "bg-sky-100 hover:bg-sky-200";
  };

  /* ---------- month-wise leads + bookings for the trend chart ---------- */
  const monthlyStats = useMemo(
    () =>
      CHART_MONTHS.map((m) => {
        let total = 0;
        let book = 0;
        for (const emp of processedData) {
          const t = emp.months[m]?.total;
          const b = emp.months[m]?.book;
          total += t !== "-" && t ? Number(t) : 0;
          book += b !== "-" && b ? Number(b) : 0;
        }
        return { month: m, total, book };
      }),
    [processedData],
  );

  const chart = useMemo(() => {
    const max = Math.max(1, ...monthlyStats.map((s) => s.total));
    const step = (chartW - CH_PAD_X * 2) / (CHART_MONTHS.length - 1);
    const yOf = (v: number) => CH_BASE - (v / max) * (CH_BASE - CH_TOP);
    const leadPts = monthlyStats.map((s, i) => ({
      x: CH_PAD_X + i * step,
      y: yOf(s.total),
    }));
    const bookPts = monthlyStats.map((s, i) => ({
      x: CH_PAD_X + i * step,
      y: yOf(s.book),
    }));
    const leadLine = smoothPath(leadPts);
    const bookLine = smoothPath(bookPts);
    const area = leadPts.length
      ? `${leadLine} L ${leadPts[leadPts.length - 1].x} ${CH_BASE} L ${leadPts[0].x} ${CH_BASE} Z`
      : "";
    return { leadPts, bookPts, leadLine, bookLine, area, step };
  }, [monthlyStats, chartW]);

  /* ---------- current month (for Monthly Champions) ---------- */
  const currentMonthKey = useMemo(() => {
    const monthNum = new Date().getMonth() + 1;
    return (
      Object.entries(MONTH_MAP).find(([, v]) => v === monthNum)?.[0] ?? ""
    );
  }, []);

  const medalStyles = [
    {
      ring: "from-yellow-300 via-yellow-500 to-yellow-700",
      face: "from-yellow-200 to-yellow-500",
      ribbon: "bg-yellow-600",
      text: "text-yellow-800",
      card: "from-yellow-50 to-amber-100 border-yellow-300",
    },
    {
      ring: "from-slate-200 via-slate-400 to-slate-600",
      face: "from-slate-100 to-slate-300",
      ribbon: "bg-slate-500",
      text: "text-slate-600",
      card: "from-slate-50 to-slate-200 border-slate-300",
    },
    {
      ring: "from-orange-300 via-orange-500 to-orange-800",
      face: "from-orange-200 to-orange-400",
      ribbon: "bg-orange-700",
      text: "text-orange-800",
      card: "from-orange-50 to-orange-100 border-orange-300",
    },
  ];

  const renderChampion = (
    emp: { name: string; book: number },
    idx: number,
  ) => {
    const s = medalStyles[idx];
    return (
      <div
        key={idx}
        className={`flex-1 min-w-0 flex flex-col items-center justify-between gap-1 rounded-xl border bg-gradient-to-b px-1.5 pt-2 pb-2 shadow-sm ${s.card}`}
      >
        <div className="relative flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${s.ring} p-[3px] shadow-md`}
          >
            <div
              className={`w-full h-full rounded-full bg-gradient-to-br ${s.face} flex items-center justify-center text-[12px] font-extrabold text-white drop-shadow`}
            >
              {idx + 1}
            </div>
          </div>
          <div className={`w-2.5 h-2 -mt-0.5 ${s.ribbon} rounded-b-sm`} />
        </div>
        <span
          className={`w-full text-center text-[13px] leading-tight font-extrabold uppercase break-words ${s.text}`}
          title={capitalizeName(emp.name)}
        >
          {capitalizeName(emp.name)}
        </span>
        <span className="text-[14px] font-extrabold text-green-800">
          {emp.book} BK
        </span>
      </div>
    );
  };

  const monthlyChampions = processedData
    .map((emp) => {
      const monthData = emp.months[currentMonthKey];
      const book =
        monthData?.book !== "-" && monthData?.book
          ? Number(monthData.book)
          : 0;
      return { name: emp.adviser_name, book };
    })
    .sort((a, b) => b.book - a.book)
    .slice(0, 3);

  const yearlyLeaders = processedData
    .map((emp) => ({
      name: emp.adviser_name,
      book: yearSum(emp, "book"),
    }))
    .sort((a, b) => b.book - a.book)
    .slice(0, 3);

  const panelClass =
    "rounded-2xl border border-white/80 bg-gradient-to-b from-white/90 to-slate-100/80 shadow-[0_4px_14px_rgba(15,23,42,0.10)] backdrop-blur";

  return (
    <div className="min-h-screen via-white to-slate-100">
      {/* HEADER - STICKY */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="pl-4 border-l-8 border-orange-600 bg-white px-3">
          <div className="flex justify-between items-center py-4">
            <h2 className="text-4xl font-bold text-orange-700 p-2">
              📊 Employee Performance TS – {selectedYear}
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
                onYearChange={(y: string) => {
                  setSelectedYear(y);
                  setExpandedCard(null);
                }}
                layout="row"
              />
              {/* Eye Button */}
              <button
                onClick={() => setShowImageModal(true)}
                className="p-1 rounded-full hover:bg-orange-50 border-2 border-orange-400 shadow-sm transition-colors"
                title="View Chart"
              >
                <Eye className="w-6 h-6 text-orange-600" />
              </button>

              {/* Year Select */}
            </div>
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
                  Employee Performance TS – {selectedYear}
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

        {/* SUMMARY STRIP - STICKY (header ke saath) */}
        {!loading && processedData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)_310px_310px] gap-3 px-4 py-3 bg-slate-100 border-b border-slate-200">
            {/* LEAD SUMMARY */}
            <div className={`${panelClass} p-3 flex flex-col`}>
              <p className="text-center text-[13px] font-extrabold tracking-wide text-slate-800">
                LEAD SUMMARY
              </p>
              <div className="flex flex-1 items-center gap-3 mt-1">
                <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-300 shadow-inner">
                  <TrendingUp
                    className="w-9 h-9 text-green-800"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <p className="text-[15px] leading-tight text-slate-700">
                    Total Leads Per Year:{" "}
                    <span className="text-[20px] font-extrabold text-slate-900">
                      {summary.totalLeads.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-[15px] leading-tight text-slate-700">
                    Avg. Leads Per Month:{" "}
                    <span className="text-[20px] font-extrabold text-slate-900">
                      {summary.avgPerMonth}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* YEARLY LEAD PERFORMANCE TREND (month wise leads + BK) */}
            <div className={`${panelClass} p-1 min-w-0`}>
              <div className="flex items-center justify-between">
                <p className="flex-1 text-center text-[13px] font-extrabold tracking-wide text-slate-800">
                  YEARLY LEAD PERFORMANCE TREND ({selectedYear})
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-1.5 rounded bg-green-700" />
                    Leads
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-1.5 rounded bg-yellow-500" />
                    BOOK
                  </span>
                </div>
              </div>

              <div ref={setChartEl} className="w-full">
              <svg
                width={chartW}
                height={CH_H}
                viewBox={`0 0 ${chartW} ${CH_H}`}
                className="block"
                role="img"
                aria-label="Month wise leads and bookings"
              >
                <defs>
                  <linearGradient id="leadArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#15803d" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#15803d" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* baseline */}
                <line
                  x1={CH_PAD_X}
                  x2={chartW - CH_PAD_X}
                  y1={CH_BASE}
                  y2={CH_BASE}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />

                {/* area + lines */}
                <path d={chart.area} fill="url(#leadArea)" />
                <path
                  d={chart.leadLine}
                  fill="none"
                  stroke="#166534"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d={chart.bookLine}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* points, labels, x-axis, hover columns */}
                {monthlyStats.map((s, i) => {
                  const p = chart.leadPts[i];
                  const b = chart.bookPts[i];
                  const active = hoveredMonth === i;
                  return (
                    <g key={s.month}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={active ? 5 : 3}
                        fill="#fff"
                        stroke="#166534"
                        strokeWidth="2"
                      />
                      <circle
                        cx={b.x}
                        cy={b.y}
                        r={active ? 4 : 2.5}
                        fill="#fff"
                        stroke="#eab308"
                        strokeWidth="2"
                      />
                      {s.total > 0 && (
                        <>
                          <text
                            x={p.x}
                            y={p.y - 16}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="800"
                            fill="#1e293b"
                          >
                            {s.total}
                          </text>
                          <text
                            x={p.x}
                            y={p.y - 5.5}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill="#a16207"
                          >
                            {s.book} Bk
                          </text>
                        </>
                      )}
                      <text
                        x={p.x}
                        y={CH_BASE + 18}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="700"
                        fill={active ? "#166534" : "#475569"}
                      >
                        {s.month}
                      </text>
                      <rect
                        x={p.x - chart.step / 2}
                        y={0}
                        width={chart.step}
                        height={CH_H}
                        fill="transparent"
                        onMouseEnter={() => setHoveredMonth(i)}
                        onMouseLeave={() => setHoveredMonth(null)}
                      />
                    </g>
                  );
                })}

                {/* hover tooltip */}
                {hoveredMonth !== null &&
                  (() => {
                    const s = monthlyStats[hoveredMonth];
                    const p = chart.leadPts[hoveredMonth];
                    const w = 92;
                    const x = Math.min(
                      Math.max(p.x - w / 2, 2),
                      chartW - w - 2,
                    );
                    const y = Math.max(p.y - 62, 2);
                    return (
                      <g pointerEvents="none">
                        <rect
                          x={x}
                          y={y}
                          width={w}
                          height={36}
                          rx={6}
                          fill="#0f172a"
                          opacity="0.92"
                        />
                        <text
                          x={x + w / 2}
                          y={y + 14}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill="#fff"
                        >
                          {s.month} – {s.total} Leads
                        </text>
                        <text
                          x={x + w / 2}
                          y={y + 28}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#fde047"
                        >
                          {s.book} BK
                        </text>
                      </g>
                    );
                  })()}
              </svg>
              </div>
              <p className="text-center text-[10px] text-slate-400 -mt-1">
                Data View: All 12 Months
              </p>
            </div>

            {/* MONTHLY CHAMPIONS */}
            <div className={`${panelClass} p-3`}>
              <p className="text-center text-[13px] font-extrabold tracking-wide text-slate-800 mb-2">
                MONTHLY CHAMPIONS - {currentMonthKey}
              </p>
              <div className="flex items-stretch gap-2">
                {monthlyChampions.map((emp, idx) => renderChampion(emp, idx))}
              </div>
            </div>

            {/* YEARLY LEADERS */}
            <div className={`${panelClass} p-3`}>
              <p className="text-center text-[13px] font-extrabold tracking-wide text-slate-800 mb-2">
                YEARLY LEADERS - {selectedYear}
              </p>
              <div className="flex items-stretch gap-2">
                {yearlyLeaders.map((emp, idx) => renderChampion(emp, idx))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="p-4">
        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-blue-950 animate-spin" />
            <p className="mt-3 text-slate-500 font-medium text-sm">
              Loading performance data for {selectedYear}...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Fetching reports for all months
            </p>
          </div>
        )}

        {/* CARDS GRID */}
        {!loading && processedData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {processedData.map((employee, empIdx) => {
              const empYearlyTotal = yearSum(employee, "total");
              const empYearlyBook = yearSum(employee, "book");
              const contributionPercent =
                grandTotal > 0
                  ? Math.round((empYearlyTotal / grandTotal) * 100)
                  : 0;
              const bookingPercent =
                empYearlyTotal > 0
                  ? Math.round((empYearlyBook / empYearlyTotal) * 100)
                  : 0;
              const isExpanded = expandedCard === empIdx;

              return (
                <div
                  key={empIdx}
                  className={`bg-white rounded-xl shadow-lg border-2 border-green-500 overflow-hidden transition-all duration-300 hover:shadow-xl ${isExpanded ? "ring-2 ring-emerald-400 shadow-2xl" : ""}`}
                >
                  {/* Employee Header */}
                  <div
                    className="bg-green-950 p-3 cursor-pointer sticky top-[var(--sticky-top,0)] z-10"
                    onClick={() => setExpandedCard(isExpanded ? null : empIdx)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-extrabold text-white tracking-wider">
                            {formatEmployeeName(employee.adviser_name)}
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-100 text-md font-semibold whitespace-nowrap">
                              Total: {empYearlyTotal}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                              <span className="text-green-700 text-[18px] ml-1 font-extrabold leading-tight text-center">
                                {bookingPercent}
                                <span className="text-green-700 text-[12px] font-extrabold leading-tight text-center">
                                  %
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, contributionPercent)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-100">
                          <th className="px-1.5 py-1.5 text-left text-slate-600 font-semibold text-[13px]">
                            Mon
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("NEW")}`}
                          >
                            NEW
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("KYC")}`}
                          >
                            KYC
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("RFQ")}`}
                          >
                            RFQ
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("HOT")}`}
                          >
                            HOT
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("VEH")}`}
                          >
                            VEH
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("LST")}`}
                          >
                            LST
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("BK")}`}
                          >
                            BK
                          </th>
                          <th className="px-0.5 py-1.5 text-center text-black font-semibold text-[14px]">
                            TTL
                          </th>
                          <th className="px-0.5 py-1.5 text-center text-blue-600 font-semibold text-[16px] relative group cursor-help overflow-visible">
                            %
                            <div className="absolute hidden group-hover:flex z-[999] bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[16px] rounded px-2 py-1 whitespace-nowrap shadow-lg flex-col items-center">
                              <span>(BK ÷ TTL) × 100</span>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ALL_MONTHS.map((month) => {
                          const d = employee.months[month];
                          const monthTotal =
                            d?.total !== "-" ? Number(d?.total || 0) : 0;
                          const bookVal =
                            d?.book !== "-" && d?.book ? Number(d.book) : 0;
                          const monthContrib =
                            monthTotal > 0
                              ? Math.round((bookVal / monthTotal) * 100)
                              : 0;
                          return (
                            <tr
                              key={month}
                              className={`border-b border-slate-100 transition-colors ${getRowColor(month)}`}
                            >
                              <td className="px-1.5 py-2 font-semibold text-slate-700 whitespace-nowrap text-[13px]">
                                {month}
                              </td>
                              <td
                                className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("new")}`}
                              >
                                {d?.new || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("kyc")}`}
                              >
                                {d?.kyc || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("rfq")}`}
                              >
                                {d?.rfq || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("hot")}`}
                              >
                                {d?.hot || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("vehn")}`}
                              >
                                {d?.vehn || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("lost")}`}
                              >
                                {d?.lost || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("book")}`}
                              >
                                {d?.book || "-"}
                              </td>
                              <td className="px-0.5 py-1 text-center text-[16px] font-bold text-black">
                                {monthTotal === 0 ? "-" : monthTotal}
                              </td>
                              <td className="px-0.5 py-1 text-center text-[16px] font-bold text-blue-600">
                                {monthContrib === 0 ? "-" : `${monthContrib}%`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-200 font-bold">
                          <td className="px-1.5 py-1.5 text-slate-700 text-[16px] font-bold">
                            Total
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("new")}`}
                          >
                            {formatValue(yearSum(employee, "new"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("kyc")}`}
                          >
                            {formatValue(yearSum(employee, "kyc"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("rfq")}`}
                          >
                            {formatValue(yearSum(employee, "rfq"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("hot")}`}
                          >
                            {formatValue(yearSum(employee, "hot"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("vehn")}`}
                          >
                            {formatValue(yearSum(employee, "vehn"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("lost")}`}
                          >
                            {formatValue(yearSum(employee, "lost"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("book")}`}
                          >
                            {formatValue(yearSum(employee, "book"))}
                          </td>
                          <td className="px-0.5 py-1.5 text-center text-black font-bold text-[16px]">
                            {empYearlyTotal === 0 ? "-" : empYearlyTotal}
                          </td>
                          <td className="px-0.5 py-1.5 text-center text-blue-600 font-bold text-[16px]">
                            {bookingPercent === 0 ? "-" : `${bookingPercent}%`}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* NO DATA */}
        {!loading && processedData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-semibold text-base">
              No data found for {selectedYear}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Try selecting a different year
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Empreport;