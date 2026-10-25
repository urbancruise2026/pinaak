"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";

import {
  getTripBookingsThunk,
  selectTripBookings,
  selectLoading,
  selectError,
  markTripBookingReadThunk,
} from "../websiteSlice";
import Pagination from "@/components/ui/pagination";

interface TripBooking {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  customerPhone: string;
  country_code: string;
  customerEmail: string;
  message: string;
  city: string;
  pickupAddress: string;
  pickup_date: string;
  dropAddress: string;
  drop_date: string;
  itinerary: string;
  passengerTotal: number;
  baggageTotal: number;
  vehicle_category: string;
  vehicle_model: string;
  created_at: string;
  is_read: number;
}

// Small helper component to render a label + value pair inside the modal
const DetailRow: React.FC<{
  label: string;
  value?: string | number;
  full?: boolean;
}> = ({ label, value, full }) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
      {label}
    </p>
    <p className="text-slate-700 break-words">
      {value || value === 0 ? value : "—"}
    </p>
  </div>
);

// 🆕 City filter options — single source of truth for buttons + dropdown
const CITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Mumbai", value: "mumbai" },
  { label: "Delhi", value: "delhi" },
  { label: "Pune", value: "pune" },
  { label: "Gurugram", value: "gurugram" },
  { label: "All India", value: "india" },
];

const TripBookingsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectTripBookings) as TripBooking[];
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // City filter state: "all" | "mumbai" | "delhi" | "pune" | "gurugram" | "india"
  const [cityFilter, setCityFilter] = useState("all");

  // Currently selected booking for the "View" modal (null = modal closed)
  const [viewItem, setViewItem] = useState<TripBooking | null>(null);

  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(getTripBookingsThunk(cityFilter));
  }, [dispatch, cityFilter]);

  const handleRead = async (id: number) => {
    try {
      await dispatch(markTripBookingReadThunk(id)).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = () => dispatch(getTripBookingsThunk(cityFilter));

  const filtered = (list ?? []).filter((item) => {
    const q = search.toLowerCase();
    return (
      item.firstName?.toLowerCase().includes(q) ||
      item.lastName?.toLowerCase().includes(q) ||
      item.customerPhone?.toLowerCase().includes(q) ||
      item.customerEmail?.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const totalCount = list?.length ?? 0;
  const readCount = (list ?? []).filter((i) => i.is_read === 1).length;
  const unreadCount = totalCount - readCount;

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleCityFilterChange = (value: string) => {
    setCityFilter(value);
    setCurrentPage(1);
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "—";

    const d = new Date(dateStr);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Page heading */}
      <div className="sticky top-0 z-30 bg-orange-100 p-3 rounded-md shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
            <h2 className="text-4xl font-bold py-4 text-orange-600">
              GAQ Enquiries
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

            <span className="px-4 py-2 rounded-lg bg-red-100 text-red-600 font-semibold text-sm">
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
              placeholder="Search by name, phone, email, or city..."
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
          <table className="w-full text-sm min-w-[1700px]">
            <thead>
              <tr className="text-left text-slate-500 uppercase text-xs tracking-wide bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  No.
                </th>
                {/* Action column moved right after No. */}
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                  Action
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Customer
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Phone
                </th>

                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  City
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Pickup Address
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Pickup Date
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Drop Address
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Drop Date
                </th>

                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Passengers
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Baggage
                </th>

                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Date
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                  Mark Read
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 19 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3.5 bg-slate-100 rounded w-full max-w-[100px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={19} className="text-center py-16">
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
                    <td className="px-4 py-4 text-slate-400 whitespace-nowrap">
                      {(currentPage - 1) * rowsPerPage + idx + 1}
                    </td>
                    {/* Action cell -> View button, ab naam se pehle */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setViewItem(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        View
                      </button>
                    </td>
                    <td className="px-4 py-4 text-slate-800 font-medium whitespace-nowrap">
                      {[item.firstName, item.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                      +{item.country_code} {item.customerPhone}
                    </td>

                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                      {item.city}
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-xs max-w-[180px]">
                      {item.pickupAddress}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDateTime(item.pickup_date)}
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-xs max-w-[180px]">
                      {item.dropAddress}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDateTime(item.drop_date)}
                    </td>

                    <td className="px-4 py-4 text-slate-600 text-center">
                      {item.passengerTotal}
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-center">
                      {item.baggageTotal}
                    </td>

                    <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td className="px-4 py-4 text-center">
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
                    <td className="px-4 py-4 whitespace-nowrap">
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
          totalPages={totalPages}
          totalItems={filtered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
        />
      </div>

      {/* View Details Modal — opens when a row's View button is clicked */}
      {viewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-200 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {[viewItem.firstName, viewItem.middleName, viewItem.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Booking ID: {viewItem.id}
                </p>
              </div>
              <button
                onClick={() => setViewItem(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal body -> customer data */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <DetailRow
                label="Phone"
                value={`+${viewItem.country_code} ${viewItem.customerPhone}`}
              />
              <DetailRow label="Email" value={viewItem.customerEmail} />
              <DetailRow label="City" value={viewItem.city} />
              <DetailRow
                label="Status"
                value={viewItem.is_read === 1 ? "Read" : "Unread"}
              />
              <DetailRow
                label="Vehicle Category"
                value={viewItem.vehicle_category}
              />
              <DetailRow label="Vehicle Model" value={viewItem.vehicle_model} />
              <DetailRow label="Passengers" value={viewItem.passengerTotal} />
              <DetailRow label="Baggage" value={viewItem.baggageTotal} />
              <DetailRow
                label="Pickup Date"
                value={formatDateTime(viewItem.pickup_date)}
              />
              <DetailRow
                label="Drop Date"
                value={formatDateTime(viewItem.drop_date)}
              />
              <DetailRow
                label="Created At"
                value={formatDateTime(viewItem.created_at)}
              />
              <DetailRow
                label="Pickup Address"
                value={viewItem.pickupAddress}
                full
              />
              <DetailRow
                label="Drop Address"
                value={viewItem.dropAddress}
                full
              />
              <DetailRow label="Itinerary" value={viewItem.itinerary} full />
              <DetailRow label="Message" value={viewItem.message} full />
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-2xl">
              {viewItem.is_read !== 1 && (
                <button
                  onClick={() => {
                    handleRead(viewItem.id);
                    setViewItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripBookingsTable;
