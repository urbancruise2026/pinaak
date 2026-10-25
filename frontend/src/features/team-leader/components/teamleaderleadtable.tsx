"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import LeadsForm from "../../leads/components/leadsfrom";
import EditLeadForm from "../../leads/components/EditForm/editleadform";
import { Eye, Edit, Trash2, UserPlus, EyeOff, Repeat } from "lucide-react";
import type { LeadRecord } from "@/types/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchLeads } from "@/features/leads/leadSlice";
import LeadDetailsModel from "../../leads/components/LeadModel/leadTabledetailsmodel";
import {
  ADDRESS_KEYWORDS,
  ITINERARY_KEYWORDS,
} from "../../../types/keywords";

import {
  BannerColumn,
  TABLE_BANNER_COLUMNS,
  BANNER_GROUP_LIGHT_BG_CLASS,
  BANNER_GROUP_BG_CLASS,
  OCCASION_COLOR_MAP,
  SERVICE_TYPE_COLOR_MAP,
  statusClassMap,
  LEAD_STATUS_OPTIONS,
  MONTH_OPTIONS,
} from "../../leads/types/LeadsTable/leadstabledata";

import Pagination from "@/components/ui/pagination";

const highlightAddressIfKeyword = (text: string): ReactNode => {
  if (!text || text === "—") return "—";
  const pattern = new RegExp(`\\b(${ADDRESS_KEYWORDS.join("|")})\\b`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const isKeyword = ADDRESS_KEYWORDS.some(
          (keyword) => keyword.toLowerCase() === part.toLowerCase(),
        );
        return isKeyword ? (
          <span key={index} className="text-red-600 font-bold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
};

const highlightItineraryIfKeyword = (text: string): ReactNode => {
  if (!text || text === "—") return "—";

  const pattern = new RegExp(`\\b(${ITINERARY_KEYWORDS.join("|")})\\b`, "gi");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, index) => {
        const isKeyword = ITINERARY_KEYWORDS.some(
          (keyword) => keyword.toLowerCase() === part.toLowerCase(),
        );
        return isKeyword ? (
          <span key={index} className="text-red-600 font-bold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
};

const CITY_OPTIONS = [
  "Delhi",
  "Mumbai",
  "Chandigarh",
  "Varanasi",
  "Prayagraj",
] as const;

const renderOccasion = (occasion: string): ReactNode => {
  if (!occasion) return "—";

  const colorClass = OCCASION_COLOR_MAP[occasion] || "text-gray-800";

  return <span className={colorClass}>{occasion}</span>;
};

const renderServiceType = (serviceType: string): ReactNode => {
  if (!serviceType) return "—";

  const colorClass = SERVICE_TYPE_COLOR_MAP[serviceType] || "text-gray-800";

  return <span className={colorClass}>{serviceType}</span>;
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

const formatTime24Hour = (isoDateTime?: string) => {
  if (!isoDateTime) return "—";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatDateTime = (isoDateTime?: string) => {
  if (!isoDateTime) return "-";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

const formatTime12Hour = (isoDateTime?: string) => {
  if (!isoDateTime) return "—";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayHoursStr = displayHours.toString().padStart(2, "0");
  return `${displayHoursStr}:${minutes} ${ampm}`;
};

const formatTripType = (tripType: LeadRecord["tripType"]) =>
  ({
    pickup: "Pickup",
    drop: "Drop",
    both: "Pickup & Drop",
    Sightseeing: "Sightseeing",
    "Point to Point": "Point to Point",
  })[tripType] ?? String(tripType);

type LeadColumn = {
  key: string;
  label: string;
  render: (lead: LeadRecord, rowIndex?: number) => ReactNode;
  accessor: (lead: LeadRecord, rowIndex?: number) => string;
  sticky?: boolean;
};

export default function LeadsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | LeadRecord["status"]
  >("All");
  const [cityFilter, setCityFilter] = useState<
    "All" | (typeof CITY_OPTIONS)[number]
  >("All");
  const [yearFilter, setYearFilter] = useState<"All" | "2025" | "2026">("All");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [startType, setStartType] = useState("text");
  const [endType, setEndType] = useState("text");
  const [detailLead, setDetailLead] = useState<LeadRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<LeadRecord | null>(null);
  const [freezeKey, setFreezeKey] = useState<string | null>(null);
  const [selectedPax, setSelectedPax] = useState<number[]>([]);
  const [paxOpen, setPaxOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const paxBtnRef = useRef<HTMLButtonElement>(null);
  const daysBtnRef = useRef<HTMLButtonElement>(null);
  const [daysOpen, setDaysOpen] = useState(false);
  const [paxDropdownStyle, setPaxDropdownStyle] = useState<React.CSSProperties>(
    {},
  );
  const [daysDropdownStyle, setDaysDropdownStyle] =
    useState<React.CSSProperties>({});
  const paxDropdownRef = useRef<HTMLDivElement>(null);
  const daysDropdownRef = useRef<HTMLDivElement>(null);

  // Swap Modal States
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedSwapLead, setSelectedSwapLead] = useState<LeadRecord | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 14;

  const dispatch = useDispatch<AppDispatch>();
  const { leads, loading, error, totalPages, total } = useSelector(
    (state: RootState) => state.lead,
  );

  useEffect(() => {
    dispatch(fetchLeads({page :currentPage}));
  }, [dispatch, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewLead = (lead: LeadRecord) => {
    setDetailLead(lead);
    setIsDetailModalOpen(true);
  };

  // Swap Click Handler
  const handleSwapClick = (lead: LeadRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSwapLead(lead);
    setSwapModalOpen(true);
  };

  // Swap Confirm Handler
  const handleConfirmSwap = (lead: LeadRecord) => {
    // Update Redux store or local state to mark lead as swapped
    // You can dispatch an action to update the lead status or move it to a different list

    // Dispatch event for swap page/list
    window.dispatchEvent(
      new CustomEvent("swapLead", {
        detail: {
          ...lead,
          swappedAt: new Date().toISOString(),
          swappedBy: "user", // You can add user info here
        },
      }),
    );


    // Close modal
    setSwapModalOpen(false);
    setSelectedSwapLead(null);
  };

  // Close Swap Modal
  const handleCloseSwapModal = () => {
    setSwapModalOpen(false);
    setSelectedSwapLead(null);
  };

  useEffect(() => {
    const handleLeadSubmitted = () => {
      setEditLead(null);
      setDetailLead(null);
      dispatch(fetchLeads({page:currentPage}));
    };
    window.addEventListener("leadSubmitted", handleLeadSubmitted);
    return () =>
      window.removeEventListener("leadSubmitted", handleLeadSubmitted);
  }, [dispatch, currentPage]);

  const togglePax = () => {
    if (!paxOpen) {
      const rect = paxBtnRef.current?.getBoundingClientRect();
      if (rect) {
        setPaxDropdownStyle({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }
    setPaxOpen((prev) => !prev);
  };

  const toggleDays = () => {
    if (!daysOpen) {
      const rect = daysBtnRef.current?.getBoundingClientRect();
      if (rect) {
        setDaysDropdownStyle({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }
    setDaysOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        paxDropdownRef.current &&
        !paxDropdownRef.current.contains(event.target as Node) &&
        paxBtnRef.current &&
        !paxBtnRef.current.contains(event.target as Node)
      ) {
        setPaxOpen(false);
      }
    };
    if (paxOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [paxOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        daysDropdownRef.current &&
        !daysDropdownRef.current.contains(event.target as Node) &&
        daysBtnRef.current &&
        !daysBtnRef.current.contains(event.target as Node)
      ) {
        setDaysOpen(false);
      }
    };
    if (daysOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [daysOpen]);

  const columns = useMemo<LeadColumn[]>(() => {
    return TABLE_BANNER_COLUMNS.map((col) => ({
      key: col.key,
      label: col.label,
      render: (lead: LeadRecord) => {
        const val = lead[col.key as keyof LeadRecord];

        if (col.key === "actions") {
          return (
            <div className="flex gap-1 justify-evenly">
              <button
                onClick={(e) => handleSwapClick(lead, e)}
                className="p-1 text-white transition-colors bg-black rounded hover:bg-blue-700"
                title="Swap"
              >
                <Repeat size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewLead(lead);
                }}
                className="p-1 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
                title="View"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditLead(lead);
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 100);
                }}
                className="p-1 text-white transition-colors bg-yellow-600 rounded hover:bg-yellow-700"
                title="Edit"
              >
                <Edit size={16} />
              </button>
            </div>
          );
        }
        if (col.key === "occasion") {
          return renderOccasion(String(val));
        }
        if (col.key === "serviceType") {
          return renderServiceType(String(val));
        }

        if (col.key === "date") {
          const dateStr = formatDate(String(val));
          const timeStr = lead.enquiryTime
            ? formatTime24Hour(lead.enquiryTime)
            : "";
          return `${dateStr} ${timeStr}`.trim();
        }

        if (col.key === "status") {
          return (
            <span
              className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${lead.status ? (statusClassMap[lead.status] ?? "bg-gray-100 text-gray-800") : "bg-gray-100 text-gray-800"}`}
            >
              {lead.status ? lead.status.toUpperCase() : "-"}
            </span>
          );
        }

        if (col.key === "pickupDateTime") {
          const dateTimeStr = formatDateTime(String(val));
          const time12Hour = formatTime12Hour(lead.pickupDateTime);
          const hour = new Date(lead.pickupDateTime).getHours();
          const isNightTime = hour >= 17 || hour < 5;

          const pickupDate = new Date(lead.pickupDateTime);
          const currentDate = new Date();

          const today = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
          );
          const pickupDateOnly = new Date(
            pickupDate.getFullYear(),
            pickupDate.getMonth(),
            pickupDate.getDate(),
          );

          const diffTime = pickupDateOnly.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const isNearbyDate = diffDays >= 0 && diffDays <= 2;

          return (
            <div className="relative group cursor-pointer">
              <span
                className={`px-2 py-1 rounded transition-colors
          ${isNightTime ? "bg-red-900 text-white font-semibold" : ""}
          ${isNearbyDate ? "text-red-900 font-bold" : "text-slate-800"}`}
              >
                {dateTimeStr}
              </span>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-auto bg-slate-800 text-white rounded-lg shadow-xl px-3 py-2 whitespace-nowrap">
                <div className="text-xs font-semibold text-slate-300 mb-1">
                  Pickup Time
                </div>
                <div className="text-lg font-bold text-white">{time12Hour}</div>
              </div>
            </div>
          );
        }

        if (col.key === "dropDateTime") {
          const dateTimeStr = formatDateTime(String(val));
          const time12Hour = formatTime12Hour(lead.dropDateTime);
          return (
            <div className="relative group cursor-pointer">
              <span className="text-slate-800 hover:text-blue-600 transition-colors">
                {dateTimeStr}
              </span>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-auto bg-slate-800 text-white rounded-lg shadow-xl px-3 py-2 whitespace-nowrap">
                <div className="text-xs font-semibold text-slate-300 mb-1">
                  Drop Time
                </div>
                <div className="text-lg font-bold text-white">{time12Hour}</div>
              </div>
            </div>
          );
        }

        if (col.key === "tripType")
          return formatTripType(val as any) || String(val);

        if (col.key === "aged") {
          const leadDate = new Date(lead.date);
          const currentDate = new Date();
          const diffTime = currentDate.getTime() - leadDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const age = diffDays >= 0 ? diffDays : 0;

          let bgClass = "";
          if (age >= 0 && age <= 5)
            bgClass = "bg-green-500 text-white px-2 py-1 rounded";
          else if (age >= 6 && age <= 10)
            bgClass = "bg-orange-500 text-white px-2 py-1 rounded";
          else if (age >= 11)
            bgClass = "bg-red-900 text-white px-2 py-1 rounded";

          return <span className={bgClass}>{String(age)}</span>;
        }

        if (col.key === "liveorexpiry") {
          if (!lead.pickupDateTime) return "—";
          const pickupDate = new Date(lead.pickupDateTime);
          const currentDate = new Date();
          const isExpired = pickupDate <= currentDate;
          return (
            <span
              className={`px-2 py-1 rounded font-bold ${isExpired ? "text-red-500" : "text-green-500"}`}
            >
              {isExpired ? "EXPIRY" : "LIVE"}
            </span>
          );
        }

        if (col.key === "km") {
          if (!lead?.km) return "—";
          return (
            <span className="px-2 py-1 rounded font-bold text-white bg-black">
              {Number(lead.km).toFixed(0)}
            </span>
          );
        }

        if (col.key === "days") {
          if (lead.days === null || lead.days === undefined) return "—";
          const days = Number(lead.days);
          let bgClass = "";
          if (days >= 0 && days <= 1) bgClass = "bg-red-500 text-white";
          else if (days > 1 && days <= 7) bgClass = "bg-blue-500 text-white";
          else if (days >= 8) bgClass = "bg-green-500 text-white";
          return (
            <span className={`px-2 py-1 rounded font-bold ${bgClass}`}>
              {days}
            </span>
          );
        }

        if (col.key === "passengerTotal") {
          if (lead.passengerTotal === null || lead.passengerTotal === undefined)
            return "—";
          const pax = Number(lead.passengerTotal);
          let bgClass = "";
          if (pax >= 0 && pax <= 4) bgClass = "bg-red-500 text-white";
          else if (pax > 5 && pax <= 50) bgClass = "bg-blue-500 text-white";
          else if (pax > 51 && pax <= 100) bgClass = "bg-black text-white";
          else if (pax >= 100) bgClass = "bg-green-900 text-white";
          return (
            <span className={`px-2 py-1 rounded font-bold ${bgClass}`}>
              {pax}
            </span>
          );
        }

        if (col.key === "vehicles" && Array.isArray(val)) {
          return val
            .map((v: any) => `${v.quantity}x ${v.category} (${v.type})`)
            .join(", ");
        }

        if (col.key === "itinerary" && Array.isArray(val)) {
          const itineraryText = val.length > 0 ? val.join(", ") : "—";
          return highlightItineraryIfKeyword(itineraryText);
        }

        if (col.key === "customerName") {
          return (
            <div className="relative group cursor-pointer">
              <span className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                {String(val)}
              </span>
              <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 w-auto bg-slate-800 text-white rounded-lg shadow-xl p-3">
                <div className="font-semibold mb-1 border-b border-slate-600 pb-1">
                  {String(val)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-xl">
                    <span className="text-slate-400">📞</span>
                    <span>{lead.customerPhone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-extrabold text-xl">
                    <span className="text-slate-400">📞</span>
                    <span>{lead.alternatePhone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-slate-400">🌐</span>
                    <span>{lead.countryName || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">✉️</span>
                    <span className="truncate">
                      {lead.customerEmail || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (col.key === "petsNumber") {
          return (
            <div className="relative group cursor-pointer">
              <span className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                {String(val)}
              </span>
              <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 w-48 bg-slate-800 text-white rounded-lg shadow-xl p-3">
                <div className="font-semibold mb-1 border-b border-slate-600 pb-1">
                  {String(val)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-sm">
                    <span className="text-slate-400">Pets Names -</span>
                    <span>{lead.petsNames || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (col.key === "totalBaggage") {
          return (
            <div className="relative group cursor-pointer">
              <span className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                {String(val)}
              </span>
              <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 w-48 bg-slate-800 text-white rounded-lg shadow-xl p-3">
                <div className="font-semibold mb-1 border-b border-slate-600 pb-1">
                  {String(val)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-sm">
                    <span className="text-slate-400">Small Baggage -</span>
                    <span>{lead.smallBaggage || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Med Baggage -</span>
                    <span className="truncate">
                      {lead.mediumBaggage || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Large Baggage -</span>
                    <span className="truncate">{lead.largeBaggage || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Airport Baggage -</span>
                    <span className="truncate">
                      {lead.airportBaggage || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Handle pickupAddress with keyword highlighting
        if (col.key === "pickupAddress") {
          const addressText =
            val !== undefined && val !== null && val !== "" ? String(val) : "—";
          return highlightAddressIfKeyword(addressText);
        }

        // Handle dropAddress with keyword highlighting
        if (col.key === "dropAddress") {
          const addressText =
            val !== undefined && val !== null && val !== "" ? String(val) : "—";
          return highlightAddressIfKeyword(addressText);
        }

        return val !== undefined && val !== null && val !== ""
          ? String(val)
          : "—";
      },
      accessor: (lead: LeadRecord) => {
        const val = lead[col.key as keyof LeadRecord];
        if (val === undefined || val === null) return "";
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
      },
      sticky: false,
    }));
  }, []);

  const bannerColumnsMeta = useMemo(() => {
    const meta = columns
      .map((column, index) => {
        const bannerCol = TABLE_BANNER_COLUMNS.find(
          (c) => c.key === column.key,
        );
        const groupLabel = bannerCol?.groupLabel;
        const headerBgClass = groupLabel
          ? (BANNER_GROUP_LIGHT_BG_CLASS[groupLabel] ?? "bg-slate-50")
          : "bg-slate-50";

        return {
          ...column,
          index,
          headerBgClass,
          groupLabel,
        };
      })
      .filter(Boolean) as (LeadColumn & {
      index: number;
      headerBgClass: string;
      groupLabel?: string;
    })[];

    return meta.sort((a, b) => a.index - b.index);
  }, [columns]);

  const freezeIndex = useMemo(() => {
    if (!freezeKey) return -1;
    return columns.findIndex((column) => column.key === freezeKey);
  }, [columns, freezeKey]);

  useEffect(() => {
    if (!freezeKey) return;
    if (freezeIndex === -1) setFreezeKey(null);
  }, [freezeIndex, freezeKey]);

  const statusOptions: ("All" | LeadRecord["status"])[] = [
    "All",
    ...LEAD_STATUS_OPTIONS,
  ];
  const cityOptions: ("All" | (typeof CITY_OPTIONS)[number])[] = [
    "All",
    ...CITY_OPTIONS,
  ];

  const filteredLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const startDate = startMonth ? new Date(startMonth) : null;
    const endDate = endMonth ? new Date(`${endMonth}T23:59:59`) : null;

    return leads.filter((lead) => {
      if (statusFilter !== "All" && lead.status !== statusFilter) return false;
      if (cityFilter !== "All" && lead.city !== cityFilter) return false;
      if (yearFilter !== "All") {
        const leadYear = new Date(lead.date).getFullYear().toString();
        if (leadYear !== yearFilter) return false;
      }
      if (selectedMonth) {
        const leadMonth = new Date(lead.date).getMonth() + 1;
        const selectedMonthNum = parseInt(selectedMonth);
        if (leadMonth !== selectedMonthNum) return false;
      }
      if (term) {
        const haystack = [
          lead.customerName,
          lead.companyName,
          lead.city,
          lead.source,
          lead.tripType,
          lead.customerType,
          lead.customerCategoryType,
          lead.serviceType,
          lead.occasion,
          lead.vehicle2,
          lead.vehicle3,
          lead.requirementVehicle,
          lead.vehicles,
          lead.itinerary?.join(" ") ?? "",
          lead.customerEmail,
          lead.customerPhone,
          lead.telecaller,
          lead.petsNames ?? "",
          lead.pickupAddress,
          lead.dropAddress,
          lead.remarks,
          lead.km ? String(Number(lead.km).toFixed(0)) : "",
          lead.days ? String(lead.days) : "",
          lead.passengerTotal ? String(lead.passengerTotal) : "",
          lead.totalBaggage ? String(lead.totalBaggage) : "",
        ];
        const hasMatch = haystack.some(
          (value) => value && value.toLowerCase().includes(term),
        );
        if (!hasMatch) return false;
      }
      if (startDate || endDate) {
        const leadDate = new Date(`${lead.date}T00:00`);
        if (startDate && leadDate < startDate) return false;
        if (endDate && leadDate > endDate) return false;
      }
      if (
        selectedPax.length > 0 &&
        !selectedPax.includes(Number(lead.passengerTotal))
      )
        return false;
      if (selectedDays.length > 0 && !selectedDays.includes(Number(lead.days)))
        return false;
      return true;
    });
  }, [
    leads,
    statusFilter,
    cityFilter,
    yearFilter,
    selectedMonth,
    searchTerm,
    startMonth,
    endMonth,
    selectedPax,
    selectedDays,
  ]);

  const frozenColumns = useMemo(() => {
    return bannerColumnsMeta.slice(0, freezeIndex + 1);
  }, [bannerColumnsMeta, freezeIndex]);

  const scrollableColumns = useMemo(() => {
    return bannerColumnsMeta.slice(freezeIndex + 1);
  }, [bannerColumnsMeta, freezeIndex]);

  const getBannerGroups = (cols: typeof bannerColumnsMeta) => {
    const groups: Array<{ id: string; label: string; colSpan: number }> = [];
    let currentGroup: { id: string; label: string; colSpan: number } | null =
      null;

    const finishGroup = () => {
      if (currentGroup) {
        groups.push(currentGroup);
        currentGroup = null;
      }
    };

    cols.forEach((column) => {
      if (!column.groupLabel) {
        finishGroup();
        groups.push({ id: `empty-${column.key}`, label: "", colSpan: 1 });
        return;
      }

      if (!currentGroup || currentGroup.label !== column.groupLabel) {
        finishGroup();
        currentGroup = {
          id: `${column.groupLabel}-${column.index}`,
          label: column.groupLabel,
          colSpan: 1,
        };
      } else {
        currentGroup.colSpan += 1;
      }
    });
    finishGroup();
    return groups;
  };

  const leftBannerGroups = useMemo(
    () => getBannerGroups(frozenColumns),
    [frozenColumns],
  );
  const rightBannerGroups = useMemo(
    () => getBannerGroups(scrollableColumns),
    [scrollableColumns],
  );

  const renderTableSection = (
    cols: typeof bannerColumnsMeta,
    banners: typeof leftBannerGroups,
    isLeft: boolean,
  ) => (
    <div
      className={`overflow-x-auto custom-scrollbar ${isLeft ? "border-r border-white" : ""}`}
      style={{ maxWidth: "100%" }}
    >
      <table className="min-w-full text-xs border border-collapse border-white sm:text-sm">
        <thead>
          <tr>
            {banners.map((group, index) => {
              const groupBgClass = group.label
                ? (BANNER_GROUP_BG_CLASS[group.label] ?? "bg-slate-900")
                : "bg-white border-b-0";

              return (
                <th
                  key={group.id}
                  colSpan={group.colSpan}
                  className={`p-1 sticky top-0 z-30 ${group.label ? "border border-white" : ""} ${groupBgClass}`}
                >
                  {group.label && (
                    <div className="px-2 py-1 text-[18px] font-black uppercase tracking-[0.35em] text-white">
                      {group.label}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
          <tr>
            {cols.map((column, index) => {
              const bannerCol = TABLE_BANNER_COLUMNS.find(
                (c) => c.key === column.key,
              );
              const groupLabel = bannerCol?.groupLabel;
              const headerBgClass = groupLabel
                ? (BANNER_GROUP_BG_CLASS[groupLabel] ?? "bg-slate-900")
                : "bg-slate-900";

              const headerClassName = `sticky top-[30px] border border-white ${headerBgClass} px-1 text-left text-[11px] font-bold uppercase tracking-wide text-white sm:text-xs z-20 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1)]`;

              return (
                <th
                  key={column.key}
                  scope="col"
                  className={headerClassName.trim()}
                >
                  <div className="relative flex items-center justify-between w-full">
                    <span className="text-center w-full">{column.label}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                className="text-sm font-semibold text-center border border-white text-slate-500"
                colSpan={cols.length}
              >
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                className="px-4 text-sm font-semibold text-center border border-white text-rose-500"
                colSpan={cols.length}
              >
                Error: {error}
              </td>
            </tr>
          ) : filteredLeads.length === 0 ? (
            <tr>
              <td
                className="px-4 text-sm font-semibold text-center border border-white text-slate-500"
                colSpan={cols.length}
              >
                No leads.
              </td>
            </tr>
          ) : (
            filteredLeads.map((lead, rowIndex) => (
              <tr
                key={lead.id}
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                {cols.map((column) => {
                  const bgClass = column.headerBgClass;
                  const isAddress =
                    column.key === "pickupAddress" ||
                    column.key === "dropAddress" ||
                    column.key === "itinerary";

                  const cellClassName = `
                    whitespace-nowrap border border-white text-slate-800 p-[3px_6px]
                    ${isAddress ? "text-[12px] !font-normal" : "text-sm font-extrabold"}
                    ${bgClass}
                  `;

                  return (
                    <td key={column.key} className={cellClassName.trim()}>
                      {column.render(lead, rowIndex)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const totalLeadsCount = total || 0;
  const blankLeads = filteredLeads.filter(
    (lead) => lead.status === "Blank",
  ).length;
  const bookLeads = filteredLeads.filter(
    (lead) => lead.status === "Book",
  ).length;
  const lostLeads = filteredLeads.filter(
    (lead) => lead.status === "Lost",
  ).length;
  const newLeads = filteredLeads.filter((lead) => lead.status === "New").length;
  const kycLeads = filteredLeads.filter((lead) => lead.status === "KYC").length;
  const rfqLeads = filteredLeads.filter((lead) => lead.status === "RFQ").length;
  const hotLeads = filteredLeads.filter((lead) => lead.status === "HOT").length;
  const vehnLeads = filteredLeads.filter(
    (lead) => lead.status === "Veh-n",
  ).length;

  const totalPercentage = totalLeadsCount > 0 ? "100.0" : "0.0";
  const blankPercentage =
    totalLeadsCount > 0
      ? ((blankLeads / totalLeadsCount) * 100).toFixed(1)
      : "0.0";
  const bookPercentage =
    totalLeadsCount > 0
      ? ((bookLeads / totalLeadsCount) * 100).toFixed(1)
      : "0.0";
  const lostPercentage =
    totalLeadsCount > 0
      ? ((lostLeads / totalLeadsCount) * 100).toFixed(1)
      : "0.0";
  const newPercentage =
    totalLeadsCount > 0
      ? ((newLeads / totalLeadsCount) * 100).toFixed(1)
      : "0.0";
  const kycPercentage =
    totalLeadsCount > 0
      ? ((kycLeads / totalLeadsCount) * 100).toFixed(1)
      : "0.0";
  const rfqPercentage =
    totalLeadsCount > 0
      ? ((rfqLeads / totalLeadsCount) * 100).toFixed(1)
      : "0.0";
  const hotPercentage =
    totalLeadsCount > 0
      ? ((hotLeads / totalLeadsCount) * 100).toFixed(1)
      : "0.0";
  const vehnPercentage =
    totalLeadsCount > 0
      ? ((vehnLeads / totalLeadsCount) * 100).toFixed(1)
      : "0.0";

  if (editLead) {
    return (
      <div className="w-full">
        <div className="mb-4"></div>
        <EditLeadForm
          initialData={editLead}
          onSuccess={() => {
            setEditLead(null);
            dispatch(fetchLeads({page:currentPage}));
          }}
          onCancel={() => setEditLead(null)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="p-3 bg-orange-100 rounded-md mb-1">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="border-l-8 border rounded-lg border-orange-500 bg-white px-3">
              <h2 className="text-2xl md:text-2xl font-bold text-left text-orange-600 whitespace-nowrap">
                Team Leader Table
              </h2>
              <p className="mt-1 text-sm text-left text-orange-700">
                Leads Details & Status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <div className="flex flex-wrap items-center gap-2 ml-10">
                <div className="flex items-center bg-black px-4 shadow-md border border-white rounded-md min-w-[140px] h-10 gap-3">
                  <span className="font-bold text-sm text-white">TOTAL</span>
                  <span className="font-extrabold text-md text-white">
                    {totalLeadsCount}
                  </span>
                  <span className="text-md font-bold text-white">
                    ({totalPercentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between bg-blue-200 px-4 py-1 shadow-md border rounded-md border-sky-800 min-w-[140px] h-10">
                  <span className="font-bold text-sm text-black">NEW</span>
                  <span className="font-extrabold text-md text-black">
                    {newLeads}
                  </span>
                  <span className="text-md font-bold text-black">
                    {newPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between bg-blue-300 px-4 py-1 shadow-md border rounded-md border-blue-800 min-w-[140px] h-10">
                  <span className="font-extrabold text-md text-blue-950">
                    RFQ
                  </span>
                  <span className="font-extrabold text-md text-blue-900">
                    {rfqLeads}
                  </span>
                  <span className="text-md font-bold text-blue-700">
                    {rfqPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between bg-orange-200 px-4 py-1 shadow-md border rounded-md border-orange-800 min-w-[140px] h-10">
                  <span className="font-extrabold text-md text-orange-950">
                    KYC
                  </span>
                  <span className="font-extrabold text-md text-orange-900">
                    {kycLeads}
                  </span>
                  <span className="text-md font-bold text-orange-700">
                    {kycPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between bg-purple-200 px-4 py-1 shadow-md border rounded-md border-purple-800 min-w-[140px] h-10">
                  <span className="font-extrabold text-md text-purple-950">
                    HOT
                  </span>
                  <span className="font-extrabold text-md text-purple-900">
                    {hotLeads}
                  </span>
                  <span className="text-md font-bold text-purple-700">
                    {hotPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between bg-pink-200 px-4 py-1 shadow-md border rounded-md border-pink-900 min-w-[140px] h-10">
                  <span className="font-extrabold text-md text-pink-950">
                    VEH-N
                  </span>
                  <span className="font-extrabold text-md text-pink-900">
                    {vehnLeads}
                  </span>
                  <span className="text-md font-bold text-pink-700">
                    {vehnPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between bg-red-500 px-4 py-1 shadow-md border rounded-md border-red-600 min-w-[140px] h-10">
                  <span className="font-bold text-md text-white">LOST</span>
                  <span className="font-extrabold text-white">{lostLeads}</span>
                  <span className="text-md font-bold text-white">
                    {lostPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between bg-green-800 px-4 py-1 shadow-md border rounded-md border-green-800 min-w-[140px] h-10">
                  <span className="font-extrabold text-md text-white">
                    BOOK
                  </span>
                  <span className="font-extrabold text-md text-white">
                    {bookLeads}
                  </span>
                  <span className="text-md font-bold text-white">
                    {bookPercentage}%
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 ml-10">
                {MONTH_OPTIONS.map((month) => {
                  const currentMonth = new Date().getMonth() + 1;
                  const isCurrentMonth = Number(month.value) === currentMonth;
                  const monthPickupCount =
                    leads?.filter((lead) => {
                      const leadMonth =
                        new Date(lead.pickupDateTime).getMonth() + 1;
                      return leadMonth === Number(month.value);
                    }).length || 0;

                  return (
                    <div
                      key={month.value}
                      className={`text-md font-extrabold rounded-lg border-sky-800 shadow-sm min-w-[90px] h-8 px-3 flex items-center justify-between gap-2 ${
                        isCurrentMonth
                          ? "bg-blue-600 text-white ring-2 ring-blue-400"
                          : "bg-slate-100 text-red-700 border border-red-300"
                      }`}
                    >
                      <span className="text-left">{month.label}</span>
                      <span className="text-[16px] font-bold bg-white bg-opacity-20 rounded-full px-2 py-0.5">
                        {monthPickupCount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky md:top-28 z-3 bg-white shadow-sm rounded-2xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="flex flex-col gap-1">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as typeof statusFilter)
                }
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="All">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <select
                value={cityFilter}
                onChange={(event) =>
                  setCityFilter(event.target.value as typeof cityFilter)
                }
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="All">All City</option>
                {cityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex flex-col gap-1">
              <button
                ref={paxBtnRef}
                onClick={togglePax}
                className="w-full px-3 h-9 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 text-left flex justify-between items-center bg-white"
              >
                {selectedPax.length > 0
                  ? `${selectedPax.length} Pax Selected`
                  : "Select Pax"}
                <span>▾</span>
              </button>
              {paxOpen &&
                typeof document !== "undefined" &&
                createPortal(
                  <div
                    ref={paxDropdownRef}
                    className="absolute z-[9999] bg-white border rounded-lg shadow max-h-60 overflow-y-auto"
                    style={paxDropdownStyle}
                  >
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer">
                      <button
                        onClick={() => setSelectedPax([])}
                        className="text-sm text-red-600 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    </label>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                      <label
                        key={num}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPax.includes(num)}
                          onChange={() =>
                            setSelectedPax((prev) =>
                              prev.includes(num)
                                ? prev.filter((v) => v !== num)
                                : [...prev, num],
                            )
                          }
                        />
                        <span className="text-sm text-black">{num} Pax</span>
                      </label>
                    ))}
                  </div>,
                  document.body,
                )}
            </div>
            <div className="relative flex flex-col gap-1">
              <button
                ref={daysBtnRef}
                onClick={toggleDays}
                className="w-full px-3 h-9 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 text-left flex justify-between items-center bg-white"
              >
                {selectedDays.length > 0
                  ? `${selectedDays.length} Days Selected`
                  : "Select Days"}
                <span>▾</span>
              </button>
              {daysOpen &&
                typeof document !== "undefined" &&
                createPortal(
                  <div
                    ref={daysDropdownRef}
                    className="absolute z-[9999] bg-white border rounded-lg shadow max-h-60 overflow-y-auto"
                    style={daysDropdownStyle}
                  >
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer">
                      <button
                        onClick={() => setSelectedDays([])}
                        className="text-sm text-red-600 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    </label>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                      <label
                        key={num}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDays.includes(num)}
                          onChange={() =>
                            setSelectedDays((prev) =>
                              prev.includes(num)
                                ? prev.filter((v) => v !== num)
                                : [...prev, num],
                            )
                          }
                        />
                        <span className="text-sm text-black">{num} Days</span>
                      </label>
                    ))}
                  </div>,
                  document.body,
                )}
            </div>
            <div className="flex flex-col gap-1">
              <select
                value={freezeKey ?? "none"}
                onChange={(event) =>
                  setFreezeKey(
                    event.target.value === "none" ? null : event.target.value,
                  )
                }
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="none">Freeze Columns</option>
                {columns.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 lg:col-span-6">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {MONTH_OPTIONS.map((month) => {
                  const currentMonth = new Date().getMonth() + 1;
                  const isCurrentMonth = Number(month.value) === currentMonth;
                  const isActive = selectedMonth === month.value;

                  return (
                    <button
                      key={month.value}
                      type="button"
                      onClick={() =>
                        setSelectedMonth(isActive ? null : month.value)
                      }
                      className={`text-md font-extrabold rounded-lg transition-all shadow-sm min-w-[50px] h-9 ${
                        isCurrentMonth
                          ? "bg-blue-600 text-white ring-2 ring-blue-400"
                          : isActive
                            ? "bg-green-600 text-white"
                            : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {month.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <input
                  type={startType}
                  value={startMonth}
                  onChange={(event) => setStartMonth(event.target.value)}
                  placeholder="Start Date"
                  onFocus={(e) => {
                    setStartType("date");
                    setTimeout(() => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }, 0);
                  }}
                  onClick={(e) => {
                    setStartType("date");
                    setTimeout(() => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }, 0);
                  }}
                  onBlur={() => {
                    if (!startMonth) setStartType("text");
                  }}
                  className="px-3 h-8 text-md font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white flex-1"
                />
                <input
                  type={endType}
                  value={endMonth}
                  min={startMonth}
                  onChange={(event) => setEndMonth(event.target.value)}
                  placeholder="End Date"
                  onFocus={(e) => {
                    setEndType("date");
                    setTimeout(() => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }, 0);
                  }}
                  onClick={(e) => {
                    setEndType("date");
                    setTimeout(() => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }, 0);
                  }}
                  onBlur={() => {
                    if (!endMonth) setEndType("text");
                  }}
                  className="px-3 h-8 text-md font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-1 bg-white border shadow-sm rounded-3xl border-white w-full">
          <div className="border border-white rounded-2xl overflow-x-auto">
            <div className="flex overflow-x-auto">
              {frozenColumns.length > 0 && (
                <div className="sticky left-0 z-30 bg-white flex flex-col border-r border-white">
                  {renderTableSection(frozenColumns, leftBannerGroups, true)}
                </div>
              )}
              <div className="flex-1 min-w-0 bg-white">
                {renderTableSection(
                  scrollableColumns,
                  rightBannerGroups,
                  false,
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between px-2">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1} • Total {totalLeadsCount}{" "}
              leads • Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(currentPage * rowsPerPage, totalLeadsCount)} of{" "}
              {totalLeadsCount} leads
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                ←
              </button>

              <button
                onClick={() => {
                  const nextPage =
                    currentPage >= totalPages ? 1 : currentPage + 1;
                  handlePageChange(nextPage);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {currentPage}
              </button>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {isDetailModalOpen && detailLead && (
        <LeadDetailsModel
          lead={detailLead}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setTimeout(() => setDetailLead(null), 300);
          }}
        />
      )}
    </>
  );
}
