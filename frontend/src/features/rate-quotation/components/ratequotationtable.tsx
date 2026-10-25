"use client";

import React, { useState } from "react";
import RateQuotationModel from "./rateQuotationFormComponents/RateQuotationForm";
import QuotationPdf from "@/features/rate-quotation/components/quotation";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Link,
  Eye,
} from "lucide-react";

const DUMMY_RATE_LIST = [
  {
    id: 1,
    lead_id: "UC-2026-001",
    quotation_no: "QT-2026-00001",
    quote_no: "QT-2026-00001",

    fullName: "Rahul Sharma",
    companyName: "ABC Travels",
    customerCity: "Delhi",
    advisorShortName: "Amit",

    created_at: "2026-10-22T10:30:00",
    valid_till: "2026-10-29",
    validTill: "2026-10-29",

    pickupDate: "2026-11-05",
    pickupTime: "6:30 AM",
    pickupLocation: "Delhi Airport",

    dropDate: "2026-11-09",
    dropTime: "8:30 PM",
    dropLocation: "Mumbai Airport",

    duration: "5 Days",
    days: 5,
    tripType: "One Way Drop",
    passangerTotal: 4,
    passengerTotal: 4,

    routeDetails: "Delhi Airport → Agra → Jaipur → Udaipur → Mumbai Airport",

    remarks:
      "Airport pickup, luggage assistance required. AC vehicle preferred.",

    contactNumber: "+91 98765 43210",

    vehicles: [
      {
        id: 1,
        vehicleType: "SUV",
        category: "Premium",
        description: "Toyota Innova Crysta",
        quantity: 1,
        amount: 8500,
        discountedPrice: 8500,
      },
      {
        id: 2,
        vehicleType: "Sedan",
        category: "Standard",
        description: "Honda City",
        quantity: 1,
        amount: 5500,
        discountedPrice: 5500,
      },
    ],
  },

  {
    id: 2,
    lead_id: "UC-2026-002",
    quotation_no: "QT-2026-00002",
    quote_no: "QT-2026-00002",

    fullName: "Priya Verma",
    companyName: "Verma Holidays",
    customerCity: "Gurugram",
    advisorShortName: "Neha",

    created_at: "2026-10-21T12:15:00",
    valid_till: "2026-10-28",
    validTill: "2026-10-28",

    pickupDate: "2026-11-10",
    pickupTime: "7:00 AM",
    pickupLocation: "Gurugram Railway Station",

    dropDate: "2026-11-12",
    dropTime: "6:00 PM",
    dropLocation: "Manali Hotel",

    duration: "3 Days",
    days: 3,
    tripType: "Round Trip",
    passangerTotal: 10,
    passengerTotal: 10,

    routeDetails: "Gurugram → Chandigarh → Manali → Solang Valley → Gurugram",

    remarks:
      "Family trip. Extra luggage space and comfortable seating required.",

    contactNumber: "+91 98765 43211",

    vehicles: [
      {
        id: 1,
        vehicleType: "Tempo Traveller",
        category: "Luxury",
        description: "12 Seater Urbania",
        quantity: 1,
        amount: 15000,
        discountedPrice: 15000,
      },
    ],
  },

  {
    id: 3,
    lead_id: "UC-2026-003",
    quotation_no: "QT-2026-00003",
    quote_no: "QT-2026-00003",

    fullName: "Aman Gupta",
    companyName: "Gupta Enterprises",
    customerCity: "Noida",
    advisorShortName: "Rohit",

    created_at: "2026-10-20T09:45:00",
    valid_till: "2026-10-27",
    validTill: "2026-10-27",

    pickupDate: "2026-11-15",
    pickupTime: "5:30 AM",
    pickupLocation: "Noida Sector 18",

    dropDate: "2026-11-19",
    dropTime: "9:00 PM",
    dropLocation: "Noida Sector 18",

    duration: "5 Days",
    days: 5,
    tripType: "Round Trip",
    passangerTotal: 25,
    passengerTotal: 25,

    routeDetails: "Noida → Haridwar → Rishikesh → Mussoorie → Dehradun → Noida",

    remarks:
      "Corporate group trip. Multiple sightseeing stops and luggage space required.",

    contactNumber: "+91 98765 43212",

    vehicles: [
      {
        id: 1,
        vehicleType: "SUV",
        category: "Premium",
        description: "Toyota Fortuner",
        quantity: 1,
        amount: 12000,
        discountedPrice: 12000,
      },
      {
        id: 2,
        vehicleType: "Bus",
        category: "Luxury",
        description: "35 Seater Bus",
        quantity: 1,
        amount: 22000,
        discountedPrice: 22000,
      },
      {
        id: 3,
        vehicleType: "Sedan",
        category: "Standard",
        description: "Maruti Dzire",
        quantity: 1,
        amount: 4000,
        discountedPrice: 4000,
      },
    ],
  },

  {
    id: 4,
    lead_id: "UC-2026-004",
    quotation_no: "QT-2026-00004",
    quote_no: "QT-2026-00004",

    fullName: "Sneha Singh",
    companyName: "Singh Events",
    customerCity: "Delhi",
    advisorShortName: "Pooja",

    created_at: "2026-10-19T14:20:00",
    valid_till: "2026-10-26",
    validTill: "2026-10-26",

    pickupDate: "2026-11-20",
    pickupTime: "9:00 AM",
    pickupLocation: "Connaught Place, Delhi",

    dropDate: "2026-11-20",
    dropTime: "8:00 PM",
    dropLocation: "Aerocity, Delhi",

    duration: "1 Day",
    days: 1,
    tripType: "Local",
    passangerTotal: 3,
    passengerTotal: 3,

    routeDetails: "Connaught Place → India Gate → Qutub Minar → Aerocity",

    remarks: "Event transportation. Vehicle must be clean and air-conditioned.",

    contactNumber: "+91 98765 43213",

    vehicles: [
      {
        id: 1,
        vehicleType: "Sedan",
        category: "Premium",
        description: "Honda City with AC",
        quantity: 1,
        amount: 6500,
        discountedPrice: 6500,
      },
    ],
  },

  {
    id: 5,
    lead_id: "UC-2026-005",
    quotation_no: "QT-2026-00005",
    quote_no: "QT-2026-00005",

    fullName: "Vikash Kumar",
    companyName: "Kumar Tours",
    customerCity: "Mumbai",
    advisorShortName: "Amit",

    created_at: "2026-10-18T11:00:00",
    valid_till: "2026-10-25",
    validTill: "2026-10-25",

    pickupDate: "2026-12-01",
    pickupTime: "6:00 AM",
    pickupLocation: "Mumbai Central Railway Station",

    dropDate: "2026-12-05",
    dropTime: "7:30 PM",
    dropLocation: "Pune Railway Station",

    duration: "5 Days",
    days: 5,
    tripType: "Outstation",
    passangerTotal: 12,
    passengerTotal: 12,

    routeDetails: "Mumbai → Lonavala → Mahabaleshwar → Panchgani → Pune",

    remarks:
      "Outstation family tour. Hill driving experience and sufficient luggage capacity required.",

    contactNumber: "+91 98765 43214",

    vehicles: [
      {
        id: 1,
        vehicleType: "SUV",
        category: "Standard",
        description: "Kia Carens",
        quantity: 1,
        amount: 7500,
        discountedPrice: 7500,
      },
      {
        id: 2,
        vehicleType: "Tempo Traveller",
        category: "Premium",
        description: "17 Seater Traveller",
        quantity: 1,
        amount: 13000,
        discountedPrice: 13000,
      },
    ],
  },
];

const LIMIT = 50;

export default function RateQuotationTable() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  // ==========================================
  // USE DUMMY DATA INSTEAD OF REDUX/API DATA
  // ==========================================

  const filteredData = DUMMY_RATE_LIST.filter((item) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return true;

    return (
      item.lead_id.toLowerCase().includes(searchText) ||
      item.fullName.toLowerCase().includes(searchText) ||
      item.advisorShortName.toLowerCase().includes(searchText) ||
      item.vehicles.some(
        (vehicle) =>
          vehicle.vehicleType.toLowerCase().includes(searchText) ||
          vehicle.category.toLowerCase().includes(searchText) ||
          vehicle.description.toLowerCase().includes(searchText),
      )
    );
  });

  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / LIMIT));

  const rateList = filteredData.slice(
    (currentPage - 1) * LIMIT,
    currentPage * LIMIT,
  );

  const maxVehicles = Math.max(
    1,
    ...rateList.map((item) => item.vehicles.length),
  );

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleGenerateLink = async (item: any) => {
    const link = `${window.location.origin}/rate-quotation/${item.lead_id}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("Link copied!\n" + link);
    } catch {
      window.prompt("Copy this quotation link:", link);
    }
  };

  const handleView = (item: any) => {
    setSelectedQuotation(item);
    setIsPdfOpen(true);
  };

  const handleRefresh = () => {
    setSearch("");
    setCurrentPage(1);
    setIsEditOpen(false);
    setIsPdfOpen(false);
    setSelectedItem(null);
    setSelectedQuotation(null);
  };

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-lg">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-blue-50 p-4">
        <h2 className="text-xl font-semibold text-blue-700 sm:text-2xl">
          Rate Quotation Records
        </h2>

        <span className="whitespace-nowrap text-sm font-medium text-blue-600">
          {totalRecords} total records
        </span>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />

          <input
            type="text"
            placeholder="Search Lead / Customer / Vehicle..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          <Search size={16} />
          Search
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
        >
          <RefreshCw size={16} />
          Reset
        </button>
      </div>

      {/* DUMMY DATA NOTICE */}
      <div className="border-b border-blue-100 bg-blue-50/60 px-4 py-2 text-xs text-blue-700">
        Demo Mode: Showing dummy quotation data. API data is not being fetched.
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <table className="border-collapse text-sm" style={{ minWidth: "100%" }}>
          <thead>
            {/* MAIN HEADER */}
            <tr className="bg-gray-100 text-xs uppercase text-gray-600">
              <th className="border p-3 text-center" rowSpan={2}>
                #
              </th>

              <th className="border p-3 text-center" rowSpan={2}>
                Actions
              </th>

              <th className="border p-3 text-left" rowSpan={2}>
                Lead ID
              </th>

              <th className="border p-3 text-left" rowSpan={2}>
                Customer
              </th>

              <th className="border p-3 text-left" rowSpan={2}>
                Advisor
              </th>

              <th className="border p-3 text-left" rowSpan={2}>
                Date
              </th>

              {Array.from({ length: maxVehicles }).map((_, i) => (
                <th
                  key={i}
                  colSpan={4}
                  className="whitespace-nowrap border bg-blue-600 p-2 text-center font-semibold tracking-wide text-white"
                >
                  Vehicle {i + 1}
                </th>
              ))}
            </tr>

            {/* VEHICLE SUBHEADERS */}
            <tr className="bg-blue-50 text-xs uppercase text-blue-700">
              {Array.from({ length: maxVehicles }).map((_, i) => (
                <React.Fragment key={i}>
                  <th className="whitespace-nowrap border p-2">Type</th>

                  <th className="whitespace-nowrap border p-2">Category</th>

                  <th className="whitespace-nowrap border p-2">Description</th>

                  <th className="whitespace-nowrap border p-2 text-right">
                    Amount
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {rateList.length === 0 ? (
              <tr>
                <td
                  colSpan={6 + maxVehicles * 4}
                  className="p-10 text-center text-gray-400"
                >
                  No Dummy Quotations Found
                </td>
              </tr>
            ) : (
              rateList.map((item, index) => {
                const vehicles = item.vehicles || [];

                return (
                  <tr
                    key={item.id}
                    className="border-t border-gray-200 transition hover:bg-blue-50/40"
                  >
                    {/* SERIAL NUMBER */}
                    <td className="border p-3 text-center text-gray-500">
                      {(currentPage - 1) * LIMIT + index + 1}
                    </td>

                    {/* ACTIONS */}
                    <td className="border p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(item)}
                          title="View Quotation"
                          aria-label="View Quotation"
                          className="rounded-lg border border-blue-900 bg-white p-2 text-blue-900 transition hover:bg-blue-100"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          title="Edit Quotation"
                          aria-label="Edit Quotation"
                          className="rounded-lg border border-amber-700 bg-white p-2 text-amber-800 transition hover:bg-amber-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleGenerateLink(item)}
                          title="Copy Quotation Link"
                          aria-label="Copy Quotation Link"
                          className="rounded-lg border border-green-800 bg-white p-2 text-green-800 transition hover:bg-green-100"
                        >
                          <Link size={16} />
                        </button>
                      </div>
                    </td>

                    {/* LEAD ID */}
                    <td className="whitespace-nowrap border p-3 font-mono text-xs text-gray-700">
                      {item.lead_id || "—"}
                    </td>

                    {/* CUSTOMER */}
                    <td className="whitespace-nowrap border p-3 font-medium text-gray-800">
                      {item.fullName || "—"}
                    </td>

                    {/* ADVISOR */}
                    <td className="whitespace-nowrap border p-3 text-gray-600">
                      {item.advisorShortName || "—"}
                    </td>

                    {/* DATE */}
                    <td className="whitespace-nowrap border p-3 text-gray-500">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    {/* VEHICLE DETAILS */}
                    {Array.from({ length: maxVehicles }).map((_, vIdx) => {
                      const vehicle = vehicles[vIdx];

                      return (
                        <React.Fragment key={vIdx}>
                          <td
                            className={`whitespace-nowrap border p-2 text-gray-700 ${
                              vehicle ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            {vehicle?.vehicleType || (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td
                            className={`whitespace-nowrap border p-2 text-gray-600 ${
                              vehicle ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            {vehicle?.category || (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td
                            title={vehicle?.description || ""}
                            className={`max-w-[160px] truncate border p-2 text-gray-500 ${
                              vehicle ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            {vehicle?.description || (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td
                            className={`whitespace-nowrap border p-2 text-right font-semibold ${
                              vehicle
                                ? "bg-white text-green-600"
                                : "bg-gray-50 text-gray-300"
                            }`}
                          >
                            {vehicle
                              ? `₹${Number(vehicle.amount || 0).toLocaleString(
                                  "en-IN",
                                )}`
                              : "—"}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER / PAGINATION */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{rateList.length}</span>{" "}
          records — page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white">
            {currentPage}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditOpen && (
        <RateQuotationModel
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedItem(null);
          }}
          lead={selectedItem}
        />
      )}

      {/* VIEW QUOTATION */}
      {isPdfOpen && selectedQuotation && (
        <QuotationPdf
          data={selectedQuotation}
          onClose={() => {
            setIsPdfOpen(false);
            setSelectedQuotation(null);
          }}
        />
      )}
    </div>
  );
}
