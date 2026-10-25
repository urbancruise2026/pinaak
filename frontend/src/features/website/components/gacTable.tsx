"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  getWebsiteGacThunk,
  markWebsiteGacReadThunk,
} from "../websiteSlice";
import Pagination from "@/components/ui/pagination";

interface WebsiteGacEntry {
  id: number;
  name: string;
  country_code: string;
  phone: string;
  city: string;
  created_at: string;
  is_read: number;
}

const selectGacList = (state: RootState): WebsiteGacEntry[] =>
  state.websiteGac.data;
const selectGacLoading = (state: RootState): boolean =>
  state.websiteGac.loading;
const selectGacError = (state: RootState): string | null =>
  state.websiteGac.error;

// 🆕 City filter options — single source of truth for buttons + dropdown
const CITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Mumbai", value: "mumbai" },
  { label: "Delhi", value: "delhi" },
  { label: "Pune", value: "pune" },
  { label: "Gurugram", value: "gurugram" },
  { label: "All India", value: "india" },
];

const GACForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectGacList);
  const loading = useSelector(selectGacLoading);
  const error = useSelector(selectGacError);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // City filter state: "all" | "mumbai" | "delhi" | "pune" | "gurugram" | "india"
  const [cityFilter, setCityFilter] = useState("all");
  const rowsPerPage = 10;

  // Jab bhi cityFilter change ho, backend se filtered data fetch karo
  useEffect(() => {
    dispatch(getWebsiteGacThunk(cityFilter));
  }, [dispatch, cityFilter]);

  // Ab sirf text-search yaha hota hai, city filtering backend (DB query) me ho chuki hoti hai
  const filtered = (list ?? []).filter((entry) => {
    const q = search.toLowerCase();
    return (
      entry.name?.toLowerCase().includes(q) ||
      entry.phone?.toLowerCase().includes(q) ||
      entry.city?.toLowerCase().includes(q) ||
      entry.country_code?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const totalCount = list?.length ?? 0;
  const readCount = (list ?? []).filter((i) => i.is_read === 1).length;
  const unreadCount = totalCount - readCount;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRead = async (id: number) => {
    try {
      await dispatch(markWebsiteGacReadThunk(id)).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  // Refresh karte waqt current city filter bhi bhejo
  const handleRefresh = () => dispatch(getWebsiteGacThunk(cityFilter));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // City filter change handler (buttons + dropdown dono ke liye common)
  const handleCityFilterChange = (value: string) => {
    setCityFilter(value);
    setCurrentPage(1);
  };

  // Build page numbers with ellipsis for large lists
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="w-full space-y-6">
      {/* Page heading */}
      <div className="sticky top-0 z-30 bg-orange-100 p-3 rounded-md shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
            <h2 className="text-4xl font-bold py-4 text-orange-600">
              GAC Enquiries
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            <span className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm">
              Total: {totalCount}
            </span>

            <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold text-sm">
              Read: {readCount}
            </span>

            <span className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold text-sm">
              Unread: {unreadCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Search + City Filter bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
            />
          </div>

          {/* City Filter Buttons — ab Pune aur Gurugram bhi include */}
          <div className="flex items-center gap-2 flex-wrap">
            {CITY_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => handleCityFilterChange(c.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  cityFilter === c.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* City Filter Dropdown (mobile / compact view ke liye alternative) */}
          <select
            value={cityFilter}
            onChange={(e) => handleCityFilterChange(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {CITY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <span className="text-sm text-slate-400 hidden sm:block ml-auto">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 uppercase text-xs tracking-wide bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 font-semibold">No.</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Phone</th>
                <th className="px-6 py-3 font-semibold">City</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-center">
                  Mark Read
                </th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-3.5 bg-slate-100 rounded w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-slate-500">
                        No entries found
                      </p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-400">
                      {(currentPage - 1) * rowsPerPage + idx + 1}
                    </td>

                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {item.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      +{item.country_code} {item.phone}
                    </td>

                    <td className="px-6 py-4 text-slate-600">{item.city}</td>

                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.is_read === 1}
                          disabled={item.is_read === 1}
                          onChange={() => handleRead(item.id)}
                          className="w-4.5 h-4.5 accent-green-600 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </label>
                    </td>

                    <td className="px-6 py-4">
                      {item.is_read === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Unread
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          totalItems={filtered.length} // ✅ use the filtered/searched count
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default GACForm;
