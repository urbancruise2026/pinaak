"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchLeads } from "@/features/leads/leadSlice";
import type { LeadRecord } from "@/types/types";

export default function LeadsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    leads = [],
    loading = false,
    error = null,
    totalPages = 0,
    total = 0,
  } = useSelector((state: RootState) => state.lead || {});
  const [period, setPeriod] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    try {
      dispatch(fetchLeads({page:1}) as any);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [dispatch]);

  // Safe calculations with try-catch
  const getSafeLeads = () => {
    try {
      return Array.isArray(leads) ? leads : [];
    } catch {
      return [];
    }
  };

  const safeLeads = getSafeLeads();

  const totalLeads = total || safeLeads.length || 0;

  const pendingLeads = useMemo(() => {
    try {
      if (!Array.isArray(safeLeads) || safeLeads.length === 0) return 0;
      return safeLeads.filter(
        (lead) => lead && !["Book", "Lost"].includes(lead.status),
      ).length;
    } catch {
      return 0;
    }
  }, [safeLeads]);

  const bookedLeads = useMemo(() => {
    try {
      if (!Array.isArray(safeLeads) || safeLeads.length === 0) return 0;
      return safeLeads.filter((lead) => lead && lead.status === "Book").length;
    } catch {
      return 0;
    }
  }, [safeLeads]);

  const lostLeads = useMemo(() => {
    try {
      if (!Array.isArray(safeLeads) || safeLeads.length === 0) return 0;
      return safeLeads.filter((lead) => lead && lead.status === "Lost").length;
    } catch {
      return 0;
    }
  }, [safeLeads]);

  const ageLeads = useMemo(() => {
    try {
      if (!Array.isArray(safeLeads) || safeLeads.length === 0) return [];
      return [...safeLeads]
        .filter((lead) => lead && lead.date)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
    } catch {
      return [];
    }
  }, [safeLeads]);

  const agedLeadsCount = useMemo(() => {
    try {
      if (!Array.isArray(safeLeads) || safeLeads.length === 0) return 0;
      const now = new Date();
      return safeLeads.filter((lead) => {
        if (!lead || !lead.date) return false;
        const leadDate = new Date(lead.date);
        const diffTime = now.getTime() - leadDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
        return diffDays > 7;
      }).length;
    } catch {
      return 0;
    }
  }, [safeLeads]);

  const stats = [
    { title: "Total Leads", value: totalLeads, color: "bg-blue-500" },
    { title: "Pending Leads", value: pendingLeads, color: "bg-yellow-500" },
    { title: "Booked Leads", value: bookedLeads, color: "bg-green-500" },
    { title: "Lost Leads", value: lostLeads, color: "bg-red-500" },
    {
      title: "Aged Leads (>7 days)",
      value: agedLeadsCount,
      color: "bg-purple-500",
    },
  ];

  const chartData = useMemo(() => {
    try {
      if (!Array.isArray(safeLeads) || safeLeads.length === 0) return {};
      return safeLeads.reduce((acc: Record<string, number>, lead) => {
        if (!lead || !lead.date) return acc;
        const date = new Date(lead.date);
        let key: string;
        if (period === "month") {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        } else if (period === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else {
          key = lead.date;
        }
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
    } catch {
      return {};
    }
  }, [safeLeads, period]);

  const chartArray = useMemo(() => {
    try {
      return Object.entries(chartData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch {
      return [];
    }
  }, [chartData]);

  // Always show UI - no matter what
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leads Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg shadow p-6 border">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${stat.color} mr-3`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Leads Over Time</h2>
          <div className="mb-4">
            <label className="mr-4">
              <input
                type="radio"
                value="month"
                checked={period === "month"}
                onChange={(e) => setPeriod(e.target.value as "month")}
                className="mr-2"
              />
              Month
            </label>
            <label className="mr-4">
              <input
                type="radio"
                value="week"
                checked={period === "week"}
                onChange={(e) => setPeriod(e.target.value as "week")}
                className="mr-2"
              />
              Week
            </label>
            <label>
              <input
                type="radio"
                value="day"
                checked={period === "day"}
                onChange={(e) => setPeriod(e.target.value as "day")}
                className="mr-2"
              />
              Day
            </label>
          </div>
          <div className="h-[300px]">
            {chartArray.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartArray}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p>No chart data available</p>
                  {loading && <p className="text-sm">Loading...</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full table-auto">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="px-4 py-2 bg-green-50 text-left text-xs font-bold text-green-800 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-2 bg-purple-50 text-left text-xs font-bold text-purple-800 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 bg-blue-50 text-left text-xs font-bold text-blue-800 uppercase">
                    Assigned To
                  </th>
                  <th className="px-4 py-2 bg-yellow-50 text-left text-xs font-bold text-yellow-800 uppercase">
                    Days Old
                  </th>
                  <th className="px-4 py-2 bg-red-50 text-left text-xs font-bold text-red-800 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ageLeads.length > 0 ? (
                  ageLeads.slice(0, 20).map((lead, idx) => {
                    try {
                      const leadDate = new Date(lead.date);
                      const now = new Date();
                      const diffTime = now.getTime() - leadDate.getTime();
                      const diffDays = Math.floor(
                        diffTime / (1000 * 3600 * 24),
                      );
                      const formattedDate = leadDate.toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      );
                      return (
                        <tr
                          key={lead.id || idx}
                          className="border-t text-gray-900"
                        >
                          <td className="px-4 py-2 text-sm font-medium">
                            {lead.customerName || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">{formattedDate}</td>
                          <td className="px-4 py-2 text-sm">
                            {lead.telecaller || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">{diffDays}</td>
                          <td className="px-4 py-2 text-sm">
                            {lead.status || "-"}
                          </td>
                        </tr>
                      );
                    } catch {
                      return null;
                    }
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="text-gray-400">
                        <p>No leads found</p>
                        {loading && <p className="text-sm">Loading...</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transfer/Swap Analytics */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">
          Transfer & Swap Analytics
        </h2>
        <div className="text-center py-12 text-gray-400">
          <p>No transfer/swap data available</p>
        </div>
      </div>

      {/* Error Display if any */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
