"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseReport } from "@/features/reports/monthlyReportSlice";
import { AppDispatch } from "@/store/store";
import Image from "next/image";
import employee from "@/assets/images/employeeformulaview.png";
import {
  Eye,
  X,
  BarChart3,
  Loader2,
  TrendingUp,
  Trophy,
  Crown,
} from "lucide-react";
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

// Chart geometry (left padding leaves room for the y-axis numbers)
const CH_H = 134;
const CH_PAD_L = 44;
const CH_PAD_R = 18;
const CH_TOP = 30;
const CH_BASE = 106;

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

  // Soft row tints – month groups keep their green / blue alternation
  const getRowColor = (month: string) => {
    if (["APR", "MAY", "JUN"].includes(month))
      return "bg-emerald-50/70 hover:bg-emerald-100/80";
    if (["JUL", "AUG", "SEP", "OCT"].includes(month))
      return "bg-sky-50/70 hover:bg-sky-100/80";
    if (["NOV", "DEC", "JAN"].includes(month))
      return "bg-emerald-50/70 hover:bg-emerald-100/80";
    return "bg-sky-50/70 hover:bg-sky-100/80";
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
    // "Nice" y-axis: about 3 steps, rounded to 1 / 2 / 5 × 10^n
    const rawMax = Math.max(1, ...monthlyStats.map((s) => s.total));
    const rough = rawMax / 3;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    const niceStep = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
    const tickStep = Math.max(1, Math.round(niceStep));
    const tickCount = Math.max(1, Math.ceil(rawMax / tickStep));
    const max = tickCount * tickStep;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickStep);

    const step =
      (chartW - CH_PAD_L - CH_PAD_R) / (CHART_MONTHS.length - 1);
    const yOf = (v: number) => CH_BASE - (v / max) * (CH_BASE - CH_TOP);
    const leadPts = monthlyStats.map((s, i) => ({
      x: CH_PAD_L + i * step,
      y: yOf(s.total),
    }));
    const bookPts = monthlyStats.map((s, i) => ({
      x: CH_PAD_L + i * step,
      y: yOf(s.book),
    }));
    const leadLine = smoothPath(leadPts);
    const bookLine = smoothPath(bookPts);
    const area = leadPts.length
      ? `${leadLine} L ${leadPts[leadPts.length - 1].x} ${CH_BASE} L ${leadPts[0].x} ${CH_BASE} Z`
      : "";
    return { leadPts, bookPts, leadLine, bookLine, area, step, ticks, yOf };
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
      card: "from-yellow-50 to-amber-100 border-yellow-200",
    },
    {
      ring: "from-slate-200 via-slate-400 to-slate-600",
      face: "from-slate-100 to-slate-300",
      ribbon: "bg-slate-500",
      text: "text-slate-600",
      card: "from-sky-50 to-slate-100 border-slate-200",
    },
    {
      ring: "from-orange-300 via-orange-500 to-orange-800",
      face: "from-orange-200 to-orange-400",
      ribbon: "bg-orange-700",
      text: "text-orange-800",
      card: "from-orange-50 to-orange-100 border-orange-200",
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
        className={`flex min-w-0 flex-1 flex-col items-center justify-between gap-1 rounded-xl border bg-gradient-to-b px-1.5 pb-2 pt-2.5 shadow-sm ${s.card}`}
      >
        <div className="relative flex flex-col items-center">
          <div
            className={`h-9 w-9 rounded-full bg-gradient-to-br ${s.ring} p-[3px] shadow-md`}
          >
            <div
              className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${s.face} text-[13px] font-extrabold text-white drop-shadow`}
            >
              {idx + 1}
            </div>
          </div>
          <div className={`-mt-0.5 h-2 w-2.5 rounded-b-sm ${s.ribbon}`} />
        </div>
        <span
          className={`w-full break-words text-center text-[13px] font-extrabold uppercase leading-tight ${s.text}`}
          title={capitalizeName(emp.name)}
        >
          {capitalizeName(emp.name)}
        </span>
        <span className="text-sm font-extrabold text-green-800">
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
    "rounded-2xl border border-slate-100 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/50">
      {/* HEADER + SUMMARY – sticky on large screens only (saves space on phones) */}
      <div className="z-30 bg-slate-50/95 px-3 pb-2 pt-3 backdrop-blur sm:px-4 lg:sticky lg:top-0">
        {/* Title + filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_6px_20px_rgba(15,23,42,0.06)] sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 shadow-lg shadow-emerald-300/50 sm:h-14 sm:w-14">
              <BarChart3
                className="h-6 w-6 text-white sm:h-7 sm:w-7"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl xl:text-[28px]">
                Employee Performance TS – {selectedYear}
              </h2>
              <div className="mt-1 flex items-center gap-3">
                <span className="hidden h-1 w-16 shrink-0 rounded-full bg-emerald-500 sm:block" />
                <p className="text-xs text-slate-500 sm:text-sm">
                  Track team performance, leads &amp; conversions across all
                  months
                </p>
              </div>
            </div>

            {/* Eye Button */}
            <button
              onClick={() => setShowImageModal(true)}
              className="shrink-0 rounded-full border-2 border-emerald-400 bg-white p-1.5 shadow-sm transition-colors hover:bg-emerald-50"
              title="View Chart"
              aria-label="View Chart"
            >
              <Eye className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Region / Zone / City / Year – 2×2 on phones, one row from md up */}
          <div className="lg:w-[560px] lg:shrink-0 xl:w-[640px] [&>div>div]:!max-w-none md:[&>div>div]:!grid-cols-4 [&_select]:!h-11 [&_select]:!rounded-2xl [&_select]:!border-slate-200 [&_select]:!bg-white [&_select]:!text-slate-700 [&_select]:!shadow-sm [&_select]:hover:!border-emerald-300 [&_select]:focus:!border-emerald-400 [&_select]:focus:!ring-emerald-200">
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
              layout="grid"
            />
          </div>
        </div>

        {/* SUMMARY STRIP (sticky together with the header) */}
        {!loading && processedData.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-[260px_minmax(0,1fr)_300px_300px]">
            {/* LEAD SUMMARY */}
            <div
              className={`${panelClass} flex flex-col justify-between gap-3 border-l-4 border-l-emerald-500 p-4`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <TrendingUp
                    className="h-4 w-4 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  Lead Summary
                </p>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp
                  className="hidden h-10 w-10 shrink-0 text-emerald-500 sm:block"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">
                    Total Leads Per Year
                  </p>
                  <p className="text-xl font-extrabold leading-tight text-slate-900">
                    {summary.totalLeads.toLocaleString()}
                  </p>
                </div>
                <span className="h-9 w-px shrink-0 bg-slate-200" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">
                    Avg. Leads Per Month
                  </p>
                  <p className="text-xl font-extrabold leading-tight text-slate-900">
                    {summary.avgPerMonth}
                  </p>
                </div>
              </div>
            </div>

            {/* YEARLY LEAD PERFORMANCE TREND (month wise leads + BK) */}
            <div
              className={`${panelClass} min-w-0 p-3 md:order-4 md:col-span-3 xl:order-none xl:col-span-1`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <TrendingUp
                      className="h-4 w-4 text-emerald-600"
                      strokeWidth={2.5}
                    />
                  </span>
                  <p className="text-base font-extrabold text-slate-900">
                    Yearly Lead Performance Trend ({selectedYear})
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-3 rounded bg-green-700" />
                    Leads
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-3 rounded bg-yellow-500" />
                    BOOK
                  </span>
                </div>
              </div>

              <div ref={setChartEl} className="mt-1 w-full">
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
                      <stop offset="0%" stopColor="#15803d" stopOpacity="0.45" />
                      <stop
                        offset="100%"
                        stopColor="#15803d"
                        stopOpacity="0.04"
                      />
                    </linearGradient>
                  </defs>

                  {/* y-axis grid + numbers */}
                  {chart.ticks.map((t) => (
                    <g key={t}>
                      <line
                        x1={CH_PAD_L}
                        x2={chartW - CH_PAD_R}
                        y1={chart.yOf(t)}
                        y2={chart.yOf(t)}
                        stroke={t === 0 ? "#cbd5e1" : "#e2e8f0"}
                        strokeWidth="1"
                        strokeDasharray={t === 0 ? undefined : "3 3"}
                      />
                      <text
                        x={CH_PAD_L - 8}
                        y={chart.yOf(t) + 3.5}
                        textAnchor="end"
                        fontSize="10"
                        fill="#64748b"
                      >
                        {t.toLocaleString()}
                      </text>
                    </g>
                  ))}

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
                          fontSize="11"
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
              <p className="-mt-1 text-center text-[10px] text-slate-400">
                Data View: All 12 Months
              </p>
            </div>

            {/* MONTHLY CHAMPIONS */}
            <div className={`${panelClass} p-3`}>
              <div className="mb-2 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-slate-800" aria-hidden="true" />
                <p className="text-base font-extrabold text-slate-900">
                  Monthly Champions – {currentMonthKey}
                </p>
              </div>
              <div className="flex items-stretch gap-2">
                {monthlyChampions.map((emp, idx) => renderChampion(emp, idx))}
              </div>
            </div>

            {/* YEARLY LEADERS */}
            <div className={`${panelClass} p-3`}>
              <div className="mb-2 flex items-center gap-2">
                <Crown className="h-5 w-5 text-slate-800" aria-hidden="true" />
                <p className="text-base font-extrabold text-slate-900">
                  Yearly Leaders – {selectedYear}
                </p>
              </div>
              <div className="flex items-stretch gap-2">
                {yearlyLeaders.map((emp, idx) => renderChampion(emp, idx))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal (outside the sticky header so it always sits on top) */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative mx-4 w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-emerald-700">
                Employee Performance TS – {selectedYear}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EE0000] transition-colors hover:bg-red-700"
              >
                <X className="h-6 w-6 text-white" strokeWidth={3} />
              </button>
            </div>

            {/* Image */}
            <Image
              src={employee}
              alt="Performance Chart"
              width={900}
              height={600}
              priority
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {/* SCROLLABLE CONTENT */}
      <div className="p-3 sm:p-4">
        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-700" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Loading performance data for {selectedYear}...
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Fetching reports for all months
            </p>
          </div>
        )}

        {/* CARDS GRID */}
        {!loading && processedData.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              // alternate green / navy headers like the reference
              const isGreen = empIdx % 2 === 0;
              const toggleCard = () =>
                setExpandedCard(isExpanded ? null : empIdx);

              return (
                <div
                  key={empIdx}
                  className={`overflow-hidden rounded-2xl border-2 border-teal-300/80 bg-white shadow-[0_6px_20px_rgba(13,148,136,0.12)] transition-all duration-300 hover:shadow-xl ${isExpanded ? "shadow-2xl ring-2 ring-emerald-400" : ""}`}
                >
                  {/* Employee Header */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCard();
                      }
                    }}
                    className={`sticky top-[var(--sticky-top,0)] z-10 cursor-pointer bg-gradient-to-r px-3 py-2.5 ${
                      isGreen
                        ? "from-emerald-950 to-emerald-800"
                        : "from-blue-950 to-blue-800"
                    }`}
                    onClick={toggleCard}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white ${
                            isGreen ? "bg-emerald-400" : "bg-blue-400"
                          }`}
                          aria-hidden="true"
                        >
                          {employee.adviser_name?.charAt(0)}
                        </span>
                        <h2
                          className="truncate text-lg font-extrabold uppercase tracking-wide text-white"
                          title={employee.adviser_name}
                        >
                          {employee.adviser_name}
                        </h2>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="whitespace-nowrap text-sm font-semibold text-white/90">
                          Total: {empYearlyTotal}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-extrabold text-emerald-700 shadow-md">
                          {bookingPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-500"
                        style={{
                          width: `${Math.min(100, contributionPercent)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto px-1 pb-1">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-slate-200 bg-white">
                          <th className="px-1.5 py-1.5 text-left text-[12px] font-semibold text-slate-600">
                            Month
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center text-[12px] font-semibold ${getHeadingColor("NEW")}`}
                          >
                            NEW
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center text-[12px] font-semibold ${getHeadingColor("KYC")}`}
                          >
                            KYC
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center text-[12px] font-semibold ${getHeadingColor("RFQ")}`}
                          >
                            RFQ
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center text-[12px] font-semibold ${getHeadingColor("HOT")}`}
                          >
                            HOT
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center text-[12px] font-semibold ${getHeadingColor("VEH")}`}
                          >
                            VEH
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center text-[12px] font-semibold ${getHeadingColor("LST")}`}
                          >
                            LST
                          </th>
                          <th
                            className={`px-0.5 py-1.5 text-center text-[12px] font-semibold ${getHeadingColor("BK")}`}
                          >
                            BK
                          </th>
                          <th className="px-0.5 py-1.5 text-center text-[13px] font-semibold text-black">
                            TTL
                          </th>
                          <th className="group relative cursor-help overflow-visible px-0.5 py-1.5 text-center text-[14px] font-semibold text-teal-600">
                            %
                            {/* opens downwards + right-aligned so the card never clips it */}
                            <div className="absolute right-0 top-full z-[999] mt-1 hidden flex-col items-end whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:flex">
                              <div className="absolute -top-1 right-3 h-2 w-2 rotate-45 bg-gray-800" />
                              <span className="relative">(BK ÷ TTL) × 100</span>
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
                              className={`border-b border-slate-100/80 transition-colors ${getRowColor(month)}`}
                            >
                              <td className="whitespace-nowrap px-1.5 py-[3px] text-[12px] font-semibold text-slate-700">
                                {month}
                              </td>
                              <td
                                className={`px-0.5 py-[3px] text-center text-[12px] font-bold ${getStatusColor("new")}`}
                              >
                                {d?.new || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-[3px] text-center text-[12px] font-bold ${getStatusColor("kyc")}`}
                              >
                                {d?.kyc || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-[3px] text-center text-[12px] font-bold ${getStatusColor("rfq")}`}
                              >
                                {d?.rfq || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-[3px] text-center text-[12px] font-bold ${getStatusColor("hot")}`}
                              >
                                {d?.hot || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-[3px] text-center text-[12px] font-bold ${getStatusColor("vehn")}`}
                              >
                                {d?.vehn || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-[3px] text-center text-[12px] font-bold ${getStatusColor("lost")}`}
                              >
                                {d?.lost || "-"}
                              </td>
                              <td
                                className={`px-0.5 py-[3px] text-center text-[12px] font-bold ${getStatusColor("book")}`}
                              >
                                {d?.book || "-"}
                              </td>
                              <td className="px-0.5 py-[3px] text-center text-[13px] font-extrabold text-black">
                                {monthTotal === 0 ? "-" : monthTotal}
                              </td>
                              <td className="px-0.5 py-[3px] text-center text-[12px] font-bold text-teal-600">
                                {monthContrib === 0 ? "-" : `${monthContrib}%`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gradient-to-r from-sky-100 to-emerald-100 font-bold">
                          <td className="rounded-l-lg px-1.5 py-1.5 text-[13px] font-extrabold text-slate-800">
                            Total
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center text-[13px] font-extrabold ${getStatusColor("new")}`}
                          >
                            {formatValue(yearSum(employee, "new"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center text-[13px] font-extrabold ${getStatusColor("kyc")}`}
                          >
                            {formatValue(yearSum(employee, "kyc"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center text-[13px] font-extrabold ${getStatusColor("rfq")}`}
                          >
                            {formatValue(yearSum(employee, "rfq"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center text-[13px] font-extrabold ${getStatusColor("hot")}`}
                          >
                            {formatValue(yearSum(employee, "hot"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center text-[13px] font-extrabold ${getStatusColor("vehn")}`}
                          >
                            {formatValue(yearSum(employee, "vehn"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center text-[13px] font-extrabold ${getStatusColor("lost")}`}
                          >
                            {formatValue(yearSum(employee, "lost"))}
                          </td>
                          <td
                            className={`px-0.5 py-1.5 text-center text-[13px] font-extrabold ${getStatusColor("book")}`}
                          >
                            {formatValue(yearSum(employee, "book"))}
                          </td>
                          <td className="px-0.5 py-1.5 text-center text-[14px] font-extrabold text-black">
                            {empYearlyTotal === 0 ? "-" : empYearlyTotal}
                          </td>
                          <td className="rounded-r-lg px-0.5 py-1.5 text-center text-[13px] font-extrabold text-teal-600">
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16 shadow-sm">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-500">
              No data found for {selectedYear}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Try selecting a different year
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Empreport;