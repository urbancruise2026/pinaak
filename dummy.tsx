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
  MapPin,
  Target,
  Building2,
  CalendarDays,
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

const CHART_MONTHS = ALL_MONTHS;

type Pt = { x: number; y: number };

type MonthRecord = {
  new: string | number;
  kyc: string | number;
  rfq: string | number;
  hot: string | number;
  vehn: string | number;
  lost: string | number;
  book: string | number;
  blank: string | number;
  total: string | number;
};

type EmployeeRecord = {
  adviser_name: string;
  months: Record<string, MonthRecord>;
};

type EmployeeReportRow = {
  adviser_name: string;
  new?: number | string;
  kyc?: number | string;
  rfq?: number | string;
  hot?: number | string;
  vehn?: number | string;
  lost?: number | string;
  book?: number | string;
  blank?: number | string;
  total?: number | string;
};

const CH_H = 150;
const CH_PAD_X = 38;
const CH_TOP = 26;
const CH_BASE = 112;

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

const STATUS_COLUMNS = [
  { key: "new", label: "NEW" },
  { key: "kyc", label: "KYC" },
  { key: "rfq", label: "RFQ" },
  { key: "hot", label: "HOT" },
  { key: "vehn", label: "VEH" },
  { key: "lost", label: "LST" },
  { key: "book", label: "BK" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "text-sky-600",
  kyc: "text-orange-500",
  rfq: "text-sky-700",
  hot: "text-purple-600",
  vehn: "text-purple-900",
  lost: "text-rose-500",
  book: "text-emerald-700",
};

const HEADER_STATUS_COLORS: Record<string, string> = {
  NEW: "text-sky-600",
  KYC: "text-orange-500",
  RFQ: "text-sky-700",
  HOT: "text-purple-600",
  VEH: "text-purple-900",
  LST: "text-rose-500",
  BK: "text-emerald-700",
};

const MEDAL_STYLES = [
  {
    ring: "from-yellow-300 via-yellow-500 to-yellow-700",
    face: "from-yellow-100 to-yellow-400",
    text: "text-yellow-800",
    card: "from-yellow-50 to-amber-100 border-yellow-200",
  },
  {
    ring: "from-slate-200 via-slate-400 to-slate-600",
    face: "from-slate-100 to-slate-300",
    text: "text-slate-600",
    card: "from-slate-50 to-slate-100 border-slate-200",
  },
  {
    ring: "from-orange-300 via-orange-500 to-orange-800",
    face: "from-orange-100 to-orange-400",
    text: "text-orange-800",
    card: "from-orange-50 to-orange-100 border-orange-200",
  },
];

const PANEL_CLASS =
  "rounded-2xl border border-white bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_5px_20px_rgba(15,23,42,0.07)]";

const Empreport = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [ALL_MONTHSData, setALL_MONTHSData] = useState<
    Record<string, EmployeeReportRow[]>
  >({});

  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState<EmployeeRecord[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const [chartEl, setChartEl] = useState<HTMLDivElement | null>(null);
  const [chartW, setChartW] = useState(720);

  // Keep the chart responsive to its actual panel width.
  useEffect(() => {
    if (!chartEl) return;

    const update = () => {
      setChartW(Math.max(320, chartEl.clientWidth));
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(chartEl);

    return () => resizeObserver.disconnect();
  }, [chartEl]);

  const formatValue = (value: unknown) => {
    if (
      value === 0 ||
      value === "0" ||
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    return value;
  };

  const formatEmployeeName = (name: string) => {
    if (!name) return "";
    return capitalizeName(name).toUpperCase();
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

  const getStatusColor = (status: string) =>
    STATUS_COLORS[status] ?? "text-slate-600";

  const getHeadingColor = (status: string) =>
    HEADER_STATUS_COLORS[status] ?? "text-slate-600";

  const getRowColor = (month: string) => {
    if (["APR", "MAY", "JUN"].includes(month)) {
      return "bg-emerald-50/80 hover:bg-emerald-100/80";
    }

    if (["JUL", "AUG", "SEP", "OCT"].includes(month)) {
      return "bg-sky-50/80 hover:bg-sky-100/80";
    }

    if (["NOV", "DEC", "JAN"].includes(month)) {
      return "bg-emerald-50/80 hover:bg-emerald-100/80";
    }

    return "bg-sky-50/80 hover:bg-sky-100/80";
  };

  // Fetch all 12 monthly reports using the selected filters.
  useEffect(() => {
    let cancelled = false;

    const fetchALL_MONTHSData = async () => {
      setLoading(true);

      try {
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

            return {
              month,
              data: result?.data ?? [],
            };
          } catch (error) {
            console.error(`Error fetching ${month}:`, error);

            return {
              month,
              data: [],
            };
          }
        });

        const responses = await Promise.all(promises);

        if (cancelled) return;

        const results: Record<string, EmployeeReportRow[]> = {};

        responses.forEach(({ month, data }) => {
          results[month] = data;
        });

        setALL_MONTHSData(results);
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching employee reports:", error);
          setALL_MONTHSData({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchALL_MONTHSData();

    return () => {
      cancelled = true;
    };
  }, [
    selectedYear,
    selectedRegion,
    selectedZone,
    selectedCity,
    dispatch,
  ]);

  // Combine the monthly API results into one record per employee.
  useEffect(() => {
    if (!Object.keys(ALL_MONTHSData).length) {
      setProcessedData([]);
      return;
    }

    const employeeMap = new Map<string, EmployeeRecord>();

    for (const month of ALL_MONTHS) {
      const monthData = ALL_MONTHSData[month] || [];

      for (const item of monthData) {
        const name = capitalizeName(item.adviser_name || "");
        if (!name) continue;

        let emp = employeeMap.get(name);

        if (!emp) {
          emp = {
            adviser_name: name,
            months: {},
          };

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
        } as MonthRecord;
      }
    }

    const emptyMonthData: MonthRecord = {
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
        if (!emp.months[month]) {
          emp.months[month] = { ...emptyMonthData };
        }
      }
    }

    setProcessedData(finalData);
  }, [ALL_MONTHSData]);

  const yearSum = (emp: EmployeeRecord, field: string) => {
    return ALL_MONTHS.reduce((total, month) => {
      const value = emp.months[month]?.[
        field as keyof MonthRecord
      ];

      return total + (value !== "-" ? Number(value || 0) : 0);
    }, 0);
  };

  const grandTotal = useMemo(() => {
    return processedData.reduce(
      (sum, emp) => sum + yearSum(emp, "total"),
      0,
    );
  }, [processedData]);

  const summary = useMemo(() => {
    const totalLeads = processedData.reduce(
      (sum, emp) => sum + yearSum(emp, "total"),
      0,
    );

    const activeMonths = ALL_MONTHS.filter((month) =>
      processedData.some((emp) => emp.months[month]?.total !== "-"),
    ).length;

    const avgPerMonth =
      activeMonths > 0 ? Math.round(totalLeads / activeMonths) : 0;

    const topPerformer = processedData.reduce(
      (best, emp) => {
        const book = yearSum(emp, "book");

        return book > best.total
          ? { name: emp.adviser_name, total: book }
          : best;
      },
      { name: "", total: 0 },
    );

    return {
      totalLeads,
      avgPerMonth,
      topPerformer,
    };
  }, [processedData]);

  // Month-wise leads and bookings for the trend chart.
  const monthlyStats = useMemo(
    () =>
      CHART_MONTHS.map((month) => {
        let total = 0;
        let book = 0;

        for (const emp of processedData) {
          const leadValue = emp.months[month]?.total;
          const bookValue = emp.months[month]?.book;

          total +=
            leadValue !== "-" && leadValue
              ? Number(leadValue)
              : 0;

          book +=
            bookValue !== "-" && bookValue
              ? Number(bookValue)
              : 0;
        }

        return { month, total, book };
      }),
    [processedData],
  );

  const chart = useMemo(() => {
    const max = Math.max(
      1,
      ...monthlyStats.map((stat) => stat.total),
    );

    const step =
      (chartW - CH_PAD_X * 2) /
      (CHART_MONTHS.length - 1);

    const yOf = (value: number) =>
      CH_BASE - (value / max) * (CH_BASE - CH_TOP);

    const leadPts = monthlyStats.map((stat, index) => ({
      x: CH_PAD_X + index * step,
      y: yOf(stat.total),
    }));

    const bookPts = monthlyStats.map((stat, index) => ({
      x: CH_PAD_X + index * step,
      y: yOf(stat.book),
    }));

    const leadLine = smoothPath(leadPts);
    const bookLine = smoothPath(bookPts);

    const area = leadPts.length
      ? `${leadLine} L ${
          leadPts[leadPts.length - 1].x
        } ${CH_BASE} L ${leadPts[0].x} ${CH_BASE} Z`
      : "";

    return {
      leadPts,
      bookPts,
      leadLine,
      bookLine,
      area,
      step,
    };
  }, [monthlyStats, chartW]);

  // The champions panel follows the current calendar month.
  const currentMonthKey = useMemo(() => {
    const monthNum = new Date().getMonth() + 1;

    return (
      Object.entries(MONTH_MAP).find(
        ([, value]) => value === monthNum,
      )?.[0] ?? ""
    );
  }, []);

  const renderChampion = (
    emp: { name: string; book: number },
    index: number,
  ) => {
    const style = MEDAL_STYLES[index];

    return (
      <div
        key={`${emp.name}-${index}`}
        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-xl border bg-gradient-to-b px-2 py-3 shadow-sm transition-transform hover:-translate-y-0.5 ${style.card}`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${style.ring} p-[3px] shadow-md`}
        >
          <div
            className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${style.face}`}
          >
            {index === 0 ? (
              <Trophy className="h-5 w-5 text-yellow-800" />
            ) : (
              <span className="text-sm font-extrabold text-slate-700">
                {index + 1}
              </span>
            )}
          </div>
        </div>

        <span
          className={`w-full break-words text-center text-xs font-extrabold leading-tight ${style.text}`}
          title={capitalizeName(emp.name)}
        >
          {capitalizeName(emp.name)}
        </span>

        <span className="text-sm font-extrabold text-emerald-800">
          {emp.book} BK
        </span>
      </div>
    );
  };

  const monthlyChampions = useMemo(() => {
    return processedData
      .map((emp) => {
        const monthData = emp.months[currentMonthKey];

        const book =
          monthData?.book !== "-" && monthData?.book
            ? Number(monthData.book)
            : 0;

        return {
          name: emp.adviser_name,
          book,
        };
      })
      .sort((a, b) => b.book - a.book)
      .slice(0, 3);
  }, [processedData, currentMonthKey]);

  const yearlyLeaders = useMemo(() => {
    return processedData
      .map((emp) => ({
        name: emp.adviser_name,
        book: yearSum(emp, "book"),
      }))
      .sort((a, b) => b.book - a.book)
      .slice(0, 3);
  }, [processedData]);

  const bookingPercent = (emp: EmployeeRecord) => {
    const total = yearSum(emp, "total");
    const book = yearSum(emp, "book");

    return total > 0 ? Math.round((book / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-800">
      {/* DASHBOARD HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-800 shadow-lg shadow-emerald-900/15">
              <BarChart3
                className="h-8 w-8 text-white"
                strokeWidth={2.5}
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl xl:text-3xl">
                Employee Performance TS – {selectedYear}
              </h1>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-1.5 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" />
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Track team performance, leads and conversions across all
                  months
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <AllRegionZoneCityFilter
              selectedRegion={selectedRegion}
              selectedZone={selectedZone}
              selectedCity={selectedCity}
              selectedYear={selectedYear}
              onRegionChange={setSelectedRegion}
              onZoneChange={setSelectedZone}
              onCityChange={setSelectedCity}
              onYearChange={(year: string) => {
                setSelectedYear(year);
                setExpandedCard(null);
              }}
              layout="row"
            />

            <button
              onClick={() => setShowImageModal(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100"
              title="View Chart"
              aria-label="View performance chart image"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* IMAGE MODAL */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative w-full max-w-5xl rounded-2xl border border-white/20 bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Employee Performance TS – {selectedYear}
                </h3>
                <p className="text-sm text-slate-500">
                  Performance chart reference
                </p>
              </div>

              <button
                onClick={() => setShowImageModal(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white transition hover:bg-rose-700"
                aria-label="Close image modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Image
              src={employee}
              alt="Employee performance chart"
              width={1200}
              height={800}
              priority
              className="max-h-[75vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {/* SUMMARY DASHBOARD */}
      {!loading && processedData.length > 0 && (
        <section className="border-b border-slate-200/80 bg-slate-100/80 px-4 py-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(230px,0.95fr)_minmax(420px,2fr)_minmax(220px,0.8fr)_minmax(220px,0.8fr)]">
            {/* LEAD SUMMARY */}
            <div className={`${PANEL_CLASS} flex flex-col p-4`}>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <h2 className="text-sm font-extrabold text-slate-800">
                  Lead Summary
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="min-w-0 border-r border-slate-200 pr-3">
                  <p className="text-xs font-medium text-slate-500">
                    Total Leads Per Year
                  </p>

                  <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                    {summary.totalLeads.toLocaleString()}
                  </p>
                </div>

                <div className="min-w-0 pl-1">
                  <p className="text-xs font-medium text-slate-500">
                    Avg. Leads Per Month
                  </p>

                  <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                    {summary.avgPerMonth.toLocaleString()}
                  </p>
                </div>
              </div>

              {summary.topPerformer.name && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                  <Trophy className="h-4 w-4 shrink-0 text-emerald-700" />

                  <p className="min-w-0 text-xs text-emerald-900">
                    Top booking performer:{" "}
                    <span className="font-extrabold">
                      {summary.topPerformer.name}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* YEARLY LEAD PERFORMANCE TREND */}
            <div className={`${PANEL_CLASS} min-w-0 p-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>

                  <h2 className="text-sm font-extrabold text-slate-800">
                    Yearly Lead Performance Trend ({selectedYear})
                  </h2>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-3 rounded-full bg-emerald-600" />
                    Leads
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-3 rounded-full bg-amber-500" />
                    BOOK
                  </span>
                </div>
              </div>

              <div ref={setChartEl} className="mt-2 w-full">
                <svg
                  width="100%"
                  height={CH_H}
                  viewBox={`0 0 ${chartW} ${CH_H}`}
                  className="block overflow-visible"
                  role="img"
                  aria-label="Monthly leads and bookings trend"
                >
                  <defs>
                    <linearGradient
                      id="leadArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#059669"
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor="#059669"
                        stopOpacity="0.02"
                      />
                    </linearGradient>
                  </defs>

                  {/* Chart grid */}
                  {[0, 1, 2, 3].map((index) => {
                    const y =
                      CH_TOP +
                      (index * (CH_BASE - CH_TOP)) / 3;

                    return (
                      <line
                        key={index}
                        x1={CH_PAD_X}
                        x2={chartW - CH_PAD_X}
                        y1={y}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray="3 4"
                      />
                    );
                  })}

                  {/* Baseline */}
                  <line
                    x1={CH_PAD_X}
                    x2={chartW - CH_PAD_X}
                    y1={CH_BASE}
                    y2={CH_BASE}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />

                  {/* Lead area and lines */}
                  <path d={chart.area} fill="url(#leadArea)" />

                  <path
                    d={chart.leadLine}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />

                  <path
                    d={chart.bookLine}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Data points and month labels */}
                  {monthlyStats.map((stat, index) => {
                    const point = chart.leadPts[index];
                    const bookPoint = chart.bookPts[index];
                    const active = hoveredMonth === index;

                    const hitWidth = Math.max(18, chart.step);

                    return (
                      <g key={stat.month}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={active ? 5 : 3}
                          fill="white"
                          stroke="#059669"
                          strokeWidth="2"
                        />

                        <circle
                          cx={bookPoint.x}
                          cy={bookPoint.y}
                          r={active ? 4 : 2.5}
                          fill="white"
                          stroke="#eab308"
                          strokeWidth="2"
                        />

                        {stat.total > 0 && (
                          <text
                            x={point.x}
                            y={Math.max(12, point.y - 10)}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="800"
                            fill="#334155"
                          >
                            {stat.total}
                          </text>
                        )}

                        <text
                          x={point.x}
                          y={CH_BASE + 19}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill={active ? "#047857" : "#64748b"}
                        >
                          {stat.month}
                        </text>

                        <rect
                          x={point.x - hitWidth / 2}
                          y={0}
                          width={hitWidth}
                          height={CH_H}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredMonth(index)}
                          onMouseLeave={() => setHoveredMonth(null)}
                          onFocus={() => setHoveredMonth(index)}
                          onBlur={() => setHoveredMonth(null)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${stat.month}: ${stat.total} leads, ${stat.book} bookings`}
                        />
                      </g>
                    );
                  })}

                  {/* Hover tooltip */}
                  {hoveredMonth !== null &&
                    (() => {
                      const stat = monthlyStats[hoveredMonth];
                      const point = chart.leadPts[hoveredMonth];

                      const width = 104;
                      const x = Math.min(
                        Math.max(point.x - width / 2, 2),
                        chartW - width - 2,
                      );

                      const y = Math.max(point.y - 58, 2);

                      return (
                        <g pointerEvents="none">
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={42}
                            rx={7}
                            fill="#0f172a"
                            opacity="0.96"
                          />

                          <text
                            x={x + width / 2}
                            y={y + 16}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="700"
                            fill="#ffffff"
                          >
                            {stat.month}: {stat.total} Leads
                          </text>

                          <text
                            x={x + width / 2}
                            y={y + 32}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill="#fde047"
                          >
                            {stat.book} BK
                          </text>
                        </g>
                      );
                    })()}
                </svg>
              </div>

              <p className="text-center text-[10px] text-slate-400">
                Data View: All 12 Months
              </p>
            </div>

            {/* MONTHLY CHAMPIONS */}
            <div className={`${PANEL_CLASS} p-3`}>
              <div className="mb-3 flex items-center justify-center gap-2">
                <Trophy className="h-4 w-4 text-amber-600" />

                <h2 className="text-center text-sm font-extrabold text-slate-800">
                  Monthly Champions – {currentMonthKey}
                </h2>
              </div>

              <div className="flex items-stretch gap-2">
                {monthlyChampions.map((emp, index) =>
                  renderChampion(emp, index),
                )}
              </div>
            </div>

            {/* YEARLY LEADERS */}
            <div className={`${PANEL_CLASS} p-3`}>
              <div className="mb-3 flex items-center justify-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" />

                <h2 className="text-center text-sm font-extrabold text-slate-800">
                  Yearly Leaders – {selectedYear}
                </h2>
              </div>

              <div className="flex items-stretch gap-2">
                {yearlyLeaders.map((emp, index) =>
                  renderChampion(emp, index),
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* EMPLOYEE CARDS */}
      <main className="p-4 sm:p-5">
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-700" />

            <p className="mt-3 text-sm font-semibold text-slate-600">
              Loading performance data for {selectedYear}...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching reports for all months
            </p>
          </div>
        )}

        {!loading && processedData.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {processedData.map((emp, empIdx) => {
              const empYearlyTotal = yearSum(emp, "total");
              const empYearlyBook = yearSum(emp, "book");

              const contributionPercent =
                grandTotal > 0
                  ? Math.round(
                      (empYearlyTotal / grandTotal) * 100,
                    )
                  : 0;

              const employeeBookingPercent = bookingPercent(emp);
              const isExpanded = expandedCard === empIdx;

              // Alternate green and blue card headers like the reference.
              const isBlue = empIdx % 2 === 1;

              const accentColor = isBlue
                ? "border-sky-300"
                : "border-emerald-300";

              const headerColor = isBlue
                ? "from-sky-900 via-sky-800 to-slate-900"
                : "from-emerald-950 via-emerald-900 to-teal-950";

              const avatarColor = isBlue
                ? "from-sky-400 to-blue-600"
                : "from-emerald-400 to-teal-600";

              return (
                <article
                  key={emp.adviser_name || empIdx}
                  className={`min-w-0 overflow-hidden rounded-2xl border-2 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.13)] ${accentColor} ${
                    isExpanded
                      ? "ring-2 ring-emerald-300 shadow-xl"
                      : ""
                  }`}
                >
                  {/* EMPLOYEE HEADER */}
                  <button
                    type="button"
                    className={`block w-full cursor-pointer bg-gradient-to-r ${headerColor} p-3 text-left`}
                    onClick={() =>
                      setExpandedCard(isExpanded ? null : empIdx)
                    }
                    aria-expanded={isExpanded}
                    title="Click to highlight this employee card"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} text-sm font-extrabold text-white shadow-md ring-2 ring-white/20`}
                      >
                        {emp.adviser_name
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2
                          className="truncate text-sm font-extrabold tracking-wide text-white sm:text-base"
                          title={emp.adviser_name}
                        >
                          {formatEmployeeName(emp.adviser_name)}
                        </h2>

                        <p className="mt-0.5 text-[10px] font-medium text-white/70">
                          Employee performance
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="whitespace-nowrap text-xs font-bold text-white">
                          Total: {empYearlyTotal.toLocaleString()}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                            isBlue
                              ? "bg-sky-100 text-sky-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {employeeBookingPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Employee contribution progress */}
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sky-300 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            contributionPercent,
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-white/70">
                      <span>
                        {contributionPercent}% of team leads
                      </span>

                      <span>
                        {empYearlyBook.toLocaleString()} bookings
                      </span>
                    </div>
                  </button>

                  {/* MONTHLY STATUS TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="w-[16%] px-1.5 py-2 text-left text-[10px] font-extrabold text-slate-600 sm:text-xs">
                            Month
                          </th>

                          {STATUS_COLUMNS.map((column) => (
                            <th
                              key={column.key}
                              className={`px-0 py-2 text-center text-[10px] font-extrabold sm:text-xs ${getHeadingColor(
                                column.label,
                              )}`}
                            >
                              {column.label}
                            </th>
                          ))}

                          <th className="w-[11%] px-0 py-2 text-center text-[10px] font-extrabold text-slate-900 sm:text-xs">
                            TTL
                          </th>

                          <th className="w-[9%] px-0 py-2 text-center text-[10px] font-extrabold text-sky-700 sm:text-xs">
                            %
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {ALL_MONTHS.map((month) => {
                          const monthData = emp.months[month];

                          const monthTotal =
                            monthData?.total !== "-"
                              ? Number(monthData?.total || 0)
                              : 0;

                          const bookValue =
                            monthData?.book !== "-" &&
                            monthData?.book
                              ? Number(monthData.book)
                              : 0;

                          const monthBookingPercent =
                            monthTotal > 0
                              ? Math.round(
                                  (bookValue / monthTotal) * 100,
                                )
                              : 0;

                          return (
                            <tr
                              key={month}
                              className={`border-b border-white transition-colors ${getRowColor(
                                month,
                              )}`}
                            >
                              <td className="whitespace-nowrap px-1.5 py-2 text-[10px] font-bold text-slate-700 sm:text-xs">
                                {month}
                              </td>

                              {STATUS_COLUMNS.map((column) => (
                                <td
                                  key={column.key}
                                  className={`overflow-hidden px-0 py-2 text-center text-[10px] font-bold sm:text-xs ${getStatusColor(
                                    column.key,
                                  )}`}
                                >
                                  {monthData?.[
                                    column.key
                                  ] || "-"}
                                </td>
                              ))}

                              <td className="px-0 py-2 text-center text-[11px] font-extrabold text-slate-900 sm:text-xs">
                                {monthTotal === 0
                                  ? "-"
                                  : monthTotal.toLocaleString()}
                              </td>

                              <td className="px-0 py-2 text-center text-[10px] font-extrabold text-sky-700 sm:text-xs">
                                {monthBookingPercent === 0
                                  ? "-"
                                  : `${monthBookingPercent}%`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                      {/* YEARLY TOTAL */}
                      <tfoot>
                        <tr className="border-t-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-sky-50">
                          <td className="whitespace-nowrap px-1.5 py-2 text-[10px] font-extrabold text-slate-800 sm:text-xs">
                            Total
                          </td>

                          {STATUS_COLUMNS.map((column) => (
                            <td
                              key={column.key}
                              className={`px-0 py-2 text-center text-[10px] font-extrabold sm:text-xs ${getStatusColor(
                                column.key,
                              )}`}
                            >
                              {formatValue(
                                yearSum(emp, column.key),
                              )}
                            </td>
                          ))}

                          <td className="px-0 py-2 text-center text-[11px] font-extrabold text-slate-950 sm:text-xs">
                            {empYearlyTotal === 0
                              ? "-"
                              : empYearlyTotal.toLocaleString()}
                          </td>

                          <td className="px-0 py-2 text-center text-[10px] font-extrabold text-sky-700 sm:text-xs">
                            {employeeBookingPercent === 0
                              ? "-"
                              : `${employeeBookingPercent}%`}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* EXPANDED CARD DETAILS */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-white p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                          <p className="text-[10px] font-semibold text-emerald-700">
                            Total Leads
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-emerald-900">
                            {empYearlyTotal.toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
                          <p className="text-[10px] font-semibold text-sky-700">
                            Total Bookings
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-sky-900">
                            {empYearlyBook.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        Booking conversion:{" "}
                        <span className="font-extrabold text-slate-800">
                          {employeeBookingPercent}%
                        </span>
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* NO DATA */}
        {!loading && processedData.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-100">
              <BarChart3 className="h-8 w-8 text-emerald-700" />
            </div>

            <h3 className="text-base font-extrabold text-slate-800">
              No data found for {selectedYear}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try selecting a different year or changing the region, zone
              or city filters.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Empreport;