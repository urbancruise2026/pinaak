"use client";

import React, { useEffect, useRef, useState } from "react";

import VehicleManagerExtraFilters from "./VehicleManagerExtraFilters";
import VehicleFilters from "../VehicleFilters";

import {
  Loader2,
  Plus,
  ArrowLeft,
  ChevronDown,
  CalendarCheck,
  CalendarDays,
  Eye,
  Pencil,
  Car,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  List,
  X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  CATEGORY_OPTIONS,
  VARIANT_OPTIONS,
} from "../VehiclesMaster/vehicleMasterDropdown";

import type { AppDispatch, RootState } from "@/store/store";

import VehicleCodeHover from "../VehicleCodeHover";

import {
  getVehicleManagers,
  getVehicleMasterCodes,
  getAllCities,
  updateVehicleStatus,
  getVehicleManagerById,
  clearVehicleManagerDetails,
} from "../../vehicleManagerSlice";

import { fetchSeatOptions } from "@/features/vehicles/vehicleSlice";

import Pagination from "@/components/ui/pagination";

import VehicleForm from "./VehiclesManagerForm";

import VehicleManagerCalenderPopup, {
  type VehicleManagerRow,
} from "./VehicleManagerCalenderPopup";

import VehicleManagerModel from "./VehicleManagerModel";
import VehicleAvailabilityTab from "./VehicleAvailabilityTab";

// =====================================================
// TYPES
// =====================================================

type VehicleStatus = "Active" | "Suspended" | "Blocked";
type ActiveTab = "list" | "availability";

// =====================================================
// STATUS
// =====================================================

const STATUS_OPTIONS: VehicleStatus[] = ["Active", "Suspended", "Blocked"];

const STATUS_STYLES: Record<VehicleStatus, string> = {
  Active: "bg-green-100 text-green-700 border-green-200",
  Suspended: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Blocked: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_DOT: Record<VehicleStatus, string> = {
  Active: "bg-green-500",
  Suspended: "bg-yellow-500",
  Blocked: "bg-red-500",
};

// =====================================================
// CONSTANTS
// =====================================================

const PAGE_SIZE = 50;
const TABLE_COLUMN_COUNT = 15;
const AMENITIES_PREVIEW_COUNT = 3;

const COLUMNS = [
  "S.No.",
  "Code",
  "Seater",
  "Category",
  "Variant",
  "City",
  "Vendor Name",
  "Garage",
  "Vehicle Number",
  "Registration Date",
  "Aging",
  "Amenities",
  "Status",
  "Check Availability",
  "Action",
];

// =====================================================
// HELPERS
// =====================================================

const parseAmenities = (value?: string | null): string[] =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// =====================================================
// STAT CARD
// =====================================================

const StatCard: React.FC<{
  label: string;
  value: number | string;
  hint: string;
  icon: React.ReactNode;
  iconBg: string;
}> = ({ label, value, hint, icon, iconBg }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-white bg-white/90 p-4 shadow-[0_4px_20px_rgba(30,64,175,0.08)] backdrop-blur">
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconBg}`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="text-3xl font-extrabold leading-tight text-slate-900">
        {value}
      </p>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
  </div>
);

// =====================================================
// AMENITIES MODAL
// =====================================================

const AmenitiesModal: React.FC<{
  vehicleCode?: string;
  amenities: string[];
  onClose: () => void;
}> = ({ vehicleCode, amenities, onClose }) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between rounded-t-2xl bg-[#0b2a6b] px-5 py-4">
        <div>
          <h3 className="text-lg font-bold text-white">Amenities</h3>
          {vehicleCode && (
            <p className="text-xs text-blue-200">{vehicleCode}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-5">
        <p className="mb-3 text-sm font-semibold text-slate-500">
          {amenities.length} amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-100 px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

// =====================================================
// COMPONENT
// =====================================================

const VehiclesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ===================================================
  // REDUX
  // ===================================================

  const vehicleManagerState = useSelector(
    (state: RootState) => state.vehicleManager,
  );

  const {
    vehicles = [],
    loading = false,
    error = null,
    total = 0,
    totalPages = 1,
    vehicleMasterCodes = [],
    cities = [],
    statusUpdatingId = null,

    vehicleManagerDetails: selectedVehicle = null,
    vehicleManagerDetailsLoading: selectedVehicleLoading = false,
    vehicleManagerDetailsError: selectedVehicleError = null,
  } = vehicleManagerState;

  const { seatOptions = [], seatOptionsLoading = false } = useSelector(
    (state: RootState) => state.vehicle,
  );

  // ===================================================
  // STATES
  // ===================================================

  const [activeTab, setActiveTab] = useState<ActiveTab>("list");

  const [search, setSearch] = useState("");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] =
    useState<VehicleManagerRow | null>(null);
  const formOpen = showForm || !!editingVehicle;

  const [statusMenuOpenId, setStatusMenuOpenId] = useState<
    number | string | null
  >(null);

  const [availabilityVehicle, setAvailabilityVehicle] =
    useState<VehicleManagerRow | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);

  const [amenitiesVehicle, setAmenitiesVehicle] =
    useState<VehicleManagerRow | null>(null);

  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  // ===================================================
  // OPTIONS
  // ===================================================

  const categoryOptions = (CATEGORY_OPTIONS || []).map((category) => ({
    code: category,
    label: category,
  }));

  const seatDropdownOptions = (seatOptions || []).map((seat) => ({
    code: seat,
    label: `${seat} Seater`,
  }));

  const variantOptions = (VARIANT_OPTIONS || []).map((variant) => ({
    code: variant.code,
    label: variant.code,
  }));

  // ===================================================
  // INITIAL DATA
  // ===================================================

  useEffect(() => {
    dispatch(getVehicleMasterCodes());
    dispatch(getAllCities());
    dispatch(fetchSeatOptions());
  }, [dispatch]);

  const uniqueCodeOptions = Array.from(
    new Set(
      (vehicleMasterCodes || [])
        .map((item) => item?.code)
        .filter(
          (code): code is string =>
            typeof code === "string" && code.trim().length > 0,
        ),
    ),
  ).sort((a, b) => a.localeCompare(b));

  // ===================================================
  // FETCH VEHICLES
  // ===================================================

  const fetchVehicles = () => {
    dispatch(
      getVehicleManagers({
        search: search.trim() || undefined,
        year: selectedYears.length > 0 ? selectedYears.join(",") : undefined,
        code: selectedCodes.length > 0 ? selectedCodes.join(",") : undefined,
        city: selectedCities.length > 0 ? selectedCities.join(",") : undefined,
        category:
          selectedCategories.length > 0
            ? selectedCategories.join(",")
            : undefined,
        seat: selectedSeats.length > 0 ? selectedSeats.join(",") : undefined,
        variant:
          selectedVariants.length > 0 ? selectedVariants.join(",") : undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      }),
    );
  };

  useEffect(() => {
    if (formOpen) return;
    const timer = window.setTimeout(fetchVehicles, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    search,
    selectedYears,
    selectedCodes,
    selectedCities,
    selectedCategories,
    selectedSeats,
    selectedVariants,
    currentPage,
    formOpen,
  ]);

  // ===================================================
  // CLOSE STATUS MENU ON OUTSIDE CLICK
  // ===================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (statusMenuRef.current && !statusMenuRef.current.contains(target)) {
        setStatusMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===================================================
  // STATUS CHANGE
  // ===================================================

  const handleStatusChange = async (
    id: number | string,
    status: VehicleStatus,
  ) => {
    setStatusMenuOpenId(null);
    try {
      await dispatch(updateVehicleStatus({ vehicleId: id, status })).unwrap();
      fetchVehicles();
    } catch (updateError) {
      console.error("Failed to update vehicle status:", updateError);
    }
  };

  // ===================================================
  // FORMATTERS
  // ===================================================

  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAging = (aging?: string | number | null) => {
    if (aging === undefined || aging === null || aging === "") return "-";
    const value = Number(aging);
    if (Number.isNaN(value)) return String(aging);

    const years = Math.floor(value);
    let months = Math.round((value - years) * 10);

    if (months >= 10) {
      return (
        <>
          {years + 1} <span className="text-[9px] font-bold">Y</span> 0{" "}
          <span className="text-[9px] font-bold">M</span>
        </>
      );
    }
    if (months < 0) months = 0;

    return (
      <>
        {years} <span className="text-[9px] font-bold">Y</span> {months}{" "}
        <span className="text-[9px] font-bold">M</span>
      </>
    );
  };

  // ===================================================
  // HANDLERS
  // ===================================================

  const handleAddVehicleManager = () => setShowForm(true);

  const handleBackToTable = () => {
    setShowForm(false);
    setCurrentPage(1);
    setSearch("");
    setSelectedYears([]);
    setSelectedCodes([]);
    setSelectedCities([]);
    setSelectedCategories([]);
    setSelectedSeats([]);
    setSelectedVariants([]);
  };

  const handleCloseEdit = () => setEditingVehicle(null);

  const handlePageChange = (newPage: number) => {
    const safe = Math.max(Number(totalPages) || 1, 1);
    if (newPage < 1 || newPage > safe) return;
    setCurrentPage(newPage);
  };

  const handleViewVehicle = (vehicleId: string | number | undefined | null) => {
    if (vehicleId === undefined || vehicleId === null || vehicleId === "") {
      console.error("Vehicle Manager ID missing");
      return;
    }
    dispatch(clearVehicleManagerDetails());
    setShowViewModal(true);
    dispatch(getVehicleManagerById(vehicleId));
  };

  const handleCloseView = () => {
    setShowViewModal(false);
    dispatch(clearVehicleManagerDetails());
  };

  // ===================================================
  // FORM PAGE
  // ===================================================

  if (formOpen) {
    return (
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={editingVehicle ? handleCloseEdit : handleBackToTable}
            className="flex items-center gap-2 rounded-xl bg-slate-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-slate-700"
          >
            <ArrowLeft size={20} />
            Back to Vehicles Manager
          </button>
        </div>

        <VehicleForm
          key={editingVehicle?.id ?? "new"}
          vehicle={editingVehicle}
          onSuccess={editingVehicle ? handleCloseEdit : undefined}
        />
      </div>
    );
  }

  // ===================================================
  // SAFE VALUES
  // ===================================================

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeTotal = Number(total) || 0;
  const safeTotalPages = Number(totalPages) > 0 ? Number(totalPages) : 1;

  // Stats (current page ke data se; backend counts ho toh yahan replace kar do)
  const activeCount = safeVehicles.filter(
    (v: any) => !v.status || v.status === "Active",
  ).length;
  const suspendedCount = safeVehicles.filter(
    (v: any) => v.status === "Suspended",
  ).length;
  const blockedCount = safeVehicles.filter(
    (v: any) => v.status === "Blocked",
  ).length;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative">
        {/* =============== HEADER =============== */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-inner">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white shadow-md">
                <Car size={22} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Vehicles Manager
              </h1>
              <p className="text-sm text-slate-600">
                {safeTotal} vehicles under management
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* TABS */}
            <div className="flex items-center rounded-xl border border-blue-100 bg-white/80 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className={`flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-bold transition ${
                  activeTab === "list"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-600 hover:bg-blue-50"
                }`}
              >
                <List size={15} />
                Vehicles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("availability")}
                className={`flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-bold transition ${
                  activeTab === "availability"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-600 hover:bg-blue-50"
                }`}
              >
                <CalendarDays size={15} />
                Availability
              </button>
            </div>

            {/* ADD BUTTON */}
            <button
              type="button"
              onClick={handleAddVehicleManager}
              className="flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 text-sm font-bold text-white shadow-lg shadow-blue-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Plus size={14} />
              </span>
              Add Vehicle Manager
            </button>
          </div>
        </div>

        {activeTab === "list" ? (
          <>
            {/* =============== STAT CARDS =============== */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Vehicles"
                value={safeTotal}
                hint="All registered vehicles"
                iconBg="bg-blue-100 text-blue-600"
                icon={<Car size={26} />}
              />
              <StatCard
                label="Active Vehicles"
                value={activeCount}
                hint="In use & active"
                iconBg="bg-green-100 text-green-600"
                icon={<CheckCircle2 size={26} />}
              />
              <StatCard
                label="Blocked"
                value={blockedCount}
                hint="Blocked vehicles"
                iconBg="bg-red-100 text-red-500"
                icon={<XCircle size={26} />}
              />
              <StatCard
                label="Suspended"
                value={suspendedCount}
                hint="Temporarily suspended"
                iconBg="bg-yellow-100 text-yellow-600"
                icon={<Clock size={26} />}
              />
            </div>

            {/* =============== LIST CARD =============== */}
            <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-[0_8px_30px_rgba(30,64,175,0.10)] backdrop-blur">
              {/* toolbar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <List size={16} />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Vehicle List
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                    <Search size={16} className="text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search vehicles..."
                      className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="shrink-0">
                    <VehicleFilters
                      categoryOptions={categoryOptions}
                      seatDropdownOptions={seatDropdownOptions}
                      variantOptions={variantOptions}
                      selectedCategories={selectedCategories}
                      selectedSeats={selectedSeats}
                      selectedVariants={selectedVariants}
                      seatOptionsLoading={seatOptionsLoading}
                      setSelectedCategories={setSelectedCategories}
                      setSelectedSeats={setSelectedSeats}
                      setSelectedVariants={setSelectedVariants}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>

                  <div className="shrink-0">
                    <VehicleManagerExtraFilters
                      uniqueCodeOptions={uniqueCodeOptions}
                      cities={cities || []}
                      selectedCodes={selectedCodes}
                      selectedCities={selectedCities}
                      selectedYears={selectedYears}
                      setSelectedCodes={setSelectedCodes}
                      setSelectedCities={setSelectedCities}
                      setSelectedYears={setSelectedYears}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={fetchVehicles}
                    className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* error */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* table */}
              <div className="overflow-x-auto rounded-2xl">
                <table className="w-full min-w-[1650px] border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      {COLUMNS.map((col, i) => (
                        <th
                          key={col}
                          className={`whitespace-nowrap bg-[#0b2a6b] px-4 py-4 text-left text-sm font-bold text-white ${
                            i === 0 ? "rounded-tl-2xl" : ""
                          } ${
                            i === COLUMNS.length - 1 ? "rounded-tr-2xl" : ""
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {loading && (
                      <tr>
                        <td
                          colSpan={TABLE_COLUMN_COUNT}
                          className="px-3 py-14 text-center"
                        >
                          <div className="flex items-center justify-center gap-3 text-slate-600">
                            <Loader2 size={24} className="animate-spin" />
                            <span className="font-semibold">
                              Loading vehicles...
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading && safeVehicles.length === 0 && (
                      <tr>
                        <td
                          colSpan={TABLE_COLUMN_COUNT}
                          className="px-3 py-14 text-center text-slate-500"
                        >
                          No vehicle records found.
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      safeVehicles.map((vehicle, index) => {
                        const row = vehicle as VehicleManagerRow;

                        const currentStatus: VehicleStatus =
                          row.status === "Suspended" || row.status === "Blocked"
                            ? row.status
                            : "Active";

                        const vehicleId = row.id as number | string | undefined;
                        const isMenuOpen = statusMenuOpenId === vehicleId;
                        const isUpdating = statusUpdatingId === vehicleId;

                        const amenitiesList = parseAmenities(row.amenities);
                        const amenitiesPreview = amenitiesList.slice(
                          0,
                          AMENITIES_PREVIEW_COUNT,
                        );
                        const amenitiesHasMore =
                          amenitiesList.length > AMENITIES_PREVIEW_COUNT;

                        const td =
                          "whitespace-nowrap border-b border-slate-100 px-4 py-3.5 text-slate-700";

                        return (
                          <tr
                            key={vehicleId ?? `vehicle-${index}`}
                            className="transition-colors hover:bg-blue-50/50"
                          >
                            <td className={`${td} font-semibold`}>
                              {(currentPage - 1) * PAGE_SIZE + index + 1}
                            </td>

                            <td className={td}>
                              <VehicleCodeHover
                                code={row.code}
                                seat={row.seat}
                                category={row.category}
                                config={row.config}
                              />
                            </td>

                            <td className={td}>{row.seat || "-"}</td>
                            <td className={td}>{row.category || "-"}</td>
                            <td className={td}>{row.variant || "-"}</td>
                            <td className={td}>
                              {row.city_name || row.city || "-"}
                            </td>
                            <td
                              className={`${td} font-semibold text-slate-900`}
                            >
                              {row.vendor || "-"}
                            </td>
                            <td className={td}>{row.garage || "-"}</td>
                            <td className={`${td} text-slate-800`}>
                              {row.veh_no || "-"}
                            </td>
                            <td className={td}>{formatDate(row.reg_date)}</td>
                            <td className={`${td} font-semibold`}>
                              {formatAging(row.aging)}
                            </td>

                            {/* AMENITIES (3 preview + See more) */}
                            <td className={td}>
                              {amenitiesList.length === 0 ? (
                                "-"
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span>{amenitiesPreview.join(", ")}</span>
                                  {amenitiesHasMore && (
                                    <button
                                      type="button"
                                      onClick={() => setAmenitiesVehicle(row)}
                                      className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                                    >
                                      +
                                      {amenitiesList.length -
                                        AMENITIES_PREVIEW_COUNT}{" "}
                                      See more
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* STATUS */}
                            <td className={td}>
                              <div
                                className="relative inline-block"
                                ref={isMenuOpen ? statusMenuRef : null}
                              >
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    setStatusMenuOpenId((prev) =>
                                      prev === vehicleId
                                        ? null
                                        : (vehicleId ?? null),
                                    )
                                  }
                                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_STYLES[currentStatus]}`}
                                >
                                  {isUpdating ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <span
                                      className={`h-2 w-2 rounded-full ${STATUS_DOT[currentStatus]}`}
                                    />
                                  )}
                                  {currentStatus}
                                  {!isUpdating && (
                                    <ChevronDown
                                      size={12}
                                      className={`transition-transform ${
                                        isMenuOpen ? "rotate-180" : ""
                                      }`}
                                    />
                                  )}
                                </button>

                                {isMenuOpen && (
                                  <div className="absolute left-0 z-50 mt-2 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                    {STATUS_OPTIONS.map((option) => (
                                      <button
                                        key={option}
                                        type="button"
                                        disabled={option === currentStatus}
                                        onClick={() => {
                                          if (
                                            vehicleId !== undefined &&
                                            vehicleId !== null
                                          ) {
                                            handleStatusChange(
                                              vehicleId,
                                              option,
                                            );
                                          }
                                        }}
                                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition hover:bg-slate-100 disabled:cursor-default disabled:bg-slate-50 ${
                                          option === currentStatus
                                            ? "text-blue-600"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* CHECK AVAILABILITY */}
                            <td className={td}>
                              <button
                                type="button"
                                onClick={() => setAvailabilityVehicle(row)}
                                className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:shadow-sm"
                              >
                                <CalendarCheck size={13} />
                                Check Availability
                              </button>
                            </td>

                            {/* ACTIONS */}
                            <td className={td}>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  title="View"
                                  aria-label="View vehicle"
                                  disabled={
                                    vehicleId === undefined ||
                                    vehicleId === null
                                  }
                                  onClick={() => handleViewVehicle(vehicleId)}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  type="button"
                                  title="Edit"
                                  aria-label="Edit vehicle"
                                  disabled={
                                    vehicleId === undefined ||
                                    vehicleId === null
                                  }
                                  onClick={() => setEditingVehicle(row)}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Pencil size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              {!loading && safeTotal > 0 && (
                <div className="mt-3 shrink-0 px-2 py-2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={safeTotalPages}
                    totalItems={safeTotal}
                    rowsPerPage={PAGE_SIZE}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <VehicleAvailabilityTab
            vehicles={safeVehicles as VehicleManagerRow[]}
            loading={loading}
          />
        )}
      </div>

      {/* AVAILABILITY MODAL */}
      {availabilityVehicle && (
        <VehicleManagerCalenderPopup
          vehicle={availabilityVehicle}
          onClose={() => setAvailabilityVehicle(null)}
        />
      )}

      {/* VIEW VEHICLE MODAL */}
      {showViewModal && (
        <VehicleManagerModel
          vehicle={selectedVehicle}
          loading={selectedVehicleLoading}
          error={selectedVehicleError}
          onClose={handleCloseView}
        />
      )}

      {/* AMENITIES MODAL */}
      {amenitiesVehicle && (
        <AmenitiesModal
          vehicleCode={amenitiesVehicle.code}
          amenities={parseAmenities(amenitiesVehicle.amenities)}
          onClose={() => setAmenitiesVehicle(null)}
        />
      )}
    </div>
  );
};

export default VehiclesManager;
