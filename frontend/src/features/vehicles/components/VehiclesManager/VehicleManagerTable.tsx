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
  Eye,
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

import LeadPageHeader from "@/components/ui/PageHeader/TablePageHeader";
import Table from "@/components/ui/Table/Table";
import TableHeader from "@/components/ui/Table/TableHeader";
import TableRow from "@/components/ui/Table/TableRow";
import TableCell from "@/components/ui/Table/TableCell";

// =====================================================
// TYPES
// =====================================================

type VehicleStatus = "Active" | "Suspended" | "Blocked";

// =====================================================
// STATUS
// =====================================================

const STATUS_OPTIONS: VehicleStatus[] = [
  "Active",
  "Suspended",
  "Blocked",
];

const STATUS_STYLES: Record<VehicleStatus, string> = {
  Active: "bg-green-100 text-green-700 border-green-300",
  Suspended: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Blocked: "bg-red-100 text-red-700 border-red-300",
};

// =====================================================
// CONSTANTS
// =====================================================

const PAGE_SIZE = 50;
const TABLE_COLUMN_COUNT = 15;

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

  const [search, setSearch] = useState("");

  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    [],
  );

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const [selectedVariants, setSelectedVariants] = useState<string[]>(
    [],
  );

  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);

  // ===================================================
  // FIXED STATUS MENU STATE
  // ===================================================

  const [statusMenuOpenId, setStatusMenuOpenId] = useState<
    number | string | null
  >(null);

  // ===================================================
  // AVAILABILITY
  // ===================================================

  const [availabilityVehicle, setAvailabilityVehicle] =
    useState<VehicleManagerRow | null>(null);

  // ===================================================
  // VIEW MODAL
  // ===================================================

  const [showViewModal, setShowViewModal] = useState(false);

  // ===================================================
  // REFS
  // ===================================================

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

  // ===================================================
  // UNIQUE CODES
  // ===================================================

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

        year:
          selectedYears.length > 0
            ? selectedYears.join(",")
            : undefined,

        code:
          selectedCodes.length > 0
            ? selectedCodes.join(",")
            : undefined,

        city:
          selectedCities.length > 0
            ? selectedCities.join(",")
            : undefined,

        category:
          selectedCategories.length > 0
            ? selectedCategories.join(",")
            : undefined,

        seat:
          selectedSeats.length > 0
            ? selectedSeats.join(",")
            : undefined,

        variant:
          selectedVariants.length > 0
            ? selectedVariants.join(",")
            : undefined,

        page: currentPage,
        limit: PAGE_SIZE,
      }),
    );
  };

  // ===================================================
  // FETCH ON FILTER CHANGE
  // ===================================================

  useEffect(() => {
    if (showForm) {
      return;
    }

    const timer = window.setTimeout(() => {
      fetchVehicles();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    search,
    selectedYears,
    selectedCodes,
    selectedCities,
    selectedCategories,
    selectedSeats,
    selectedVariants,
    currentPage,
    showForm,
  ]);

  // ===================================================
  // CLOSE STATUS MENU ON OUTSIDE CLICK
  // ===================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(target)
      ) {
        setStatusMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  // ===================================================
  // FILTER TOGGLES
  // ===================================================

  const toggleYear = (year: number) => {
    const value = String(year);

    setSelectedYears((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );

    setCurrentPage(1);
  };

  const toggleCode = (code: string) => {
    setSelectedCodes((previous) =>
      previous.includes(code)
        ? previous.filter((item) => item !== code)
        : [...previous, code],
    );

    setCurrentPage(1);
  };

  const toggleCity = (cityId: number) => {
    const value = String(cityId);

    setSelectedCities((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );

    setCurrentPage(1);
  };

  // ===================================================
  // STATUS CHANGE
  // ===================================================

  const handleStatusChange = async (
    id: number | string,
    status: VehicleStatus,
  ) => {
    setStatusMenuOpenId(null);

    try {
      await dispatch(
        updateVehicleStatus({
          vehicleId: id,
          status,
        }),
      ).unwrap();

      // Refresh current page after successful update
      fetchVehicles();
    } catch (updateError) {
      console.error(
        "Failed to update vehicle status:",
        updateError,
      );
    }
  };

  // ===================================================
  // DATE FORMAT
  // ===================================================

  const formatDate = (date?: string | null) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ===================================================
  // AGING FORMAT
  // ===================================================

  const formatAging = (aging?: string | number | null) => {
    if (
      aging === undefined ||
      aging === null ||
      aging === ""
    ) {
      return "-";
    }

    const value = Number(aging);

    if (Number.isNaN(value)) {
      return String(aging);
    }

    const years = Math.floor(value);

    let months = Math.round((value - years) * 10);

    if (months >= 10) {
      return (
        <>
          {years + 1}{" "}
          <span className="text-[9px] font-bold">Y</span>{" "}
          0 <span className="text-[9px] font-bold">M</span>
        </>
      );
    }

    if (months < 0) {
      months = 0;
    }

    return (
      <>
        {years}{" "}
        <span className="text-[9px] font-bold">Y</span>{" "}
        {months}{" "}
        <span className="text-[9px] font-bold">M</span>
      </>
    );
  };

  // ===================================================
  // ADD VEHICLE
  // ===================================================

  const handleAddVehicleManager = () => {
    setShowForm(true);
  };

  // ===================================================
  // BACK TO TABLE
  // ===================================================

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

    dispatch(
      getVehicleManagers({
        page: 1,
        limit: PAGE_SIZE,
      }),
    );
  };

  // ===================================================
  // PAGINATION
  // ===================================================

  const handlePageChange = (newPage: number) => {
    const safeTotalPages = Math.max(
      Number(totalPages) || 1,
      1,
    );

    if (
      newPage < 1 ||
      newPage > safeTotalPages
    ) {
      return;
    }

    setCurrentPage(newPage);
  };

  // ===================================================
  // VIEW VEHICLE
  // ===================================================

  const handleViewVehicle = (
    vehicleId: string | number | undefined | null,
  ) => {
    if (
      vehicleId === undefined ||
      vehicleId === null ||
      vehicleId === ""
    ) {
      console.error("Vehicle Manager ID missing");
      return;
    }

    // Clear previous detail
    dispatch(clearVehicleManagerDetails());

    // Open modal
    setShowViewModal(true);

    // Fetch selected vehicle
    dispatch(getVehicleManagerById(vehicleId));
  };

  // ===================================================
  // CLOSE VIEW MODAL
  // ===================================================

  const handleCloseView = () => {
    setShowViewModal(false);

    dispatch(clearVehicleManagerDetails());
  };

  // ===================================================
  // FORM PAGE
  // ===================================================

  if (showForm) {
    return (
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToTable}
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
            Back to Vehicles Manager
          </button>
        </div>

        <VehicleForm />
      </div>
    );
  }

  // ===================================================
  // SAFE VEHICLES
  // ===================================================

  const safeVehicles = Array.isArray(vehicles)
    ? vehicles
    : [];

  const safeTotal = Number(total) || 0;

  const safeTotalPages =
    Number(totalPages) > 0
      ? Number(totalPages)
      : 1;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="w-full">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-4 shrink-0">
        <LeadPageHeader
          title="Vehicles Manager"
          description={`${safeTotal} vehicles under management`}
        >
          {/* VEHICLE FILTERS */}

          <div className="shrink-0">
            <VehicleFilters
              categoryOptions={categoryOptions}
              seatDropdownOptions={seatDropdownOptions}
              variantOptions={variantOptions}
              selectedCategories={selectedCategories}
              selectedSeats={selectedSeats}
              selectedVariants={selectedVariants}
              seatOptionsLoading={seatOptionsLoading}
              setSelectedCategories={
                setSelectedCategories
              }
              setSelectedSeats={setSelectedSeats}
              setSelectedVariants={
                setSelectedVariants
              }
              setCurrentPage={setCurrentPage}
            />
          </div>

          {/* EXTRA FILTERS */}

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

          {/* ADD */}

          <button
            type="button"
            onClick={handleAddVehicleManager}
            className="flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.98]"
          >
            <Plus size={16} />
            Add Vehicle Manager
          </button>
        </LeadPageHeader>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

      <Table
        minWidth="min-w-[1650px]"
        maxHeight="max-h-[920px]"
      >
        <TableHeader>
          <TableRow alternate={false}>
            <TableCell header sticky>
              S.no.
            </TableCell>

            <TableCell header>
              Code
            </TableCell>

            <TableCell header>
              Seater
            </TableCell>

            <TableCell header>
              Category
            </TableCell>

            <TableCell header>
              Variant
            </TableCell>

            <TableCell header>
              City
            </TableCell>

            <TableCell header>
              Vendor Name
            </TableCell>

            <TableCell header>
              Garage
            </TableCell>

            <TableCell header>
              Vehicle Number
            </TableCell>

            <TableCell header>
              Registration Date
            </TableCell>

            <TableCell header>
              Aging
            </TableCell>

            <TableCell header>
              Amenities
            </TableCell>

            <TableCell header>
              Status
            </TableCell>

            <TableCell header>
              Check Availability
            </TableCell>

            <TableCell header>
              Action
            </TableCell>
          </TableRow>
        </TableHeader>

        <tbody>
          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <tr>
              <td
                colSpan={TABLE_COLUMN_COUNT}
                className="px-3 py-14 text-center"
              >
                <div className="flex items-center justify-center gap-3">
                  <Loader2
                    size={24}
                    className="animate-spin"
                  />

                  <span className="font-semibold">
                    Loading vehicles...
                  </span>
                </div>
              </td>
            </tr>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            safeVehicles.length === 0 && (
              <tr>
                <td
                  colSpan={TABLE_COLUMN_COUNT}
                  className="px-3 py-14 text-center text-gray-500"
                >
                  No vehicle records found.
                </td>
              </tr>
            )}

          {/* =================================================
              DATA
          ================================================= */}

          {!loading &&
            safeVehicles.map((vehicle, index) => {
              const row =
                vehicle as VehicleManagerRow;

              const currentStatus: VehicleStatus =
                row.status === "Suspended" ||
                row.status === "Blocked"
                  ? row.status
                  : "Active";

              const vehicleId =
                row.id as number | string | undefined;

              const isMenuOpen =
                statusMenuOpenId === vehicleId;

              const isUpdating =
                statusUpdatingId === vehicleId;

              return (
                <TableRow
                  key={
                    vehicleId ??
                    `vehicle-${index}`
                  }
                  index={index}
                >
                  {/* S.NO */}

                  <TableCell
                    sticky
                    rowIndex={index}
                  >
                    {(currentPage - 1) *
                      PAGE_SIZE +
                      index +
                      1}
                  </TableCell>

                  {/* CODE */}

                  <TableCell>
                    <VehicleCodeHover
                      code={row.code}
                      seat={row.seat}
                      category={row.category}
                      config={row.config}
                    />
                  </TableCell>

                  {/* SEAT */}

                  <TableCell>
                    {row.seat || "-"}
                  </TableCell>

                  {/* CATEGORY */}

                  <TableCell>
                    {row.category || "-"}
                  </TableCell>

                  {/* VARIANT */}

                  <TableCell>
                    {row.variant || "-"}
                  </TableCell>

                  {/* CITY */}

                  <TableCell>
                    {row.city_name ||
                      row.city ||
                      "-"}
                  </TableCell>

                  {/* VENDOR */}

                  <TableCell>
                    {row.vendor || "-"}
                  </TableCell>

                  {/* GARAGE */}

                  <TableCell>
                    {row.garage || "-"}
                  </TableCell>

                  {/* VEHICLE NUMBER */}

                  <TableCell className="text-gray-800">
                    {row.veh_no || "-"}
                  </TableCell>

                  {/* REGISTRATION DATE */}

                  <TableCell>
                    {formatDate(row.reg_date)}
                  </TableCell>

                  {/* AGING */}

                  <TableCell className="font-semibold">
                    {formatAging(row.aging)}
                  </TableCell>

                  {/* AMENITIES */}

                  <TableCell className="max-w-[350px]">
                    <div className="whitespace-normal leading-5">
                      {row.amenities || "-"}
                    </div>
                  </TableCell>

                  {/* STATUS */}

                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className="relative inline-block"
                        ref={
                          isMenuOpen
                            ? statusMenuRef
                            : null
                        }
                      >
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            setStatusMenuOpenId(
                              (previous) =>
                                previous ===
                                vehicleId
                                  ? null
                                  : vehicleId ??
                                    null,
                            )
                          }
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_STYLES[currentStatus]}`}
                        >
                          {isUpdating && (
                            <Loader2
                              size={12}
                              className="animate-spin"
                            />
                          )}

                          {currentStatus}

                          {!isUpdating && (
                            <ChevronDown
                              size={12}
                              className={`transition-transform ${
                                isMenuOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          )}
                        </button>

                        {/* STATUS MENU */}

                        {isMenuOpen && (
                          <div className="absolute left-0 z-50 mt-2 w-36 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl">
                            {STATUS_OPTIONS.map(
                              (option) => (
                                <button
                                  key={option}
                                  type="button"
                                  disabled={
                                    option ===
                                    currentStatus
                                  }
                                  onClick={() => {
                                    if (
                                      vehicleId !==
                                        undefined &&
                                      vehicleId !==
                                        null
                                    ) {
                                      handleStatusChange(
                                        vehicleId,
                                        option,
                                      );
                                    }
                                  }}
                                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-semibold transition hover:bg-gray-100 disabled:cursor-default disabled:bg-gray-50 ${
                                    option ===
                                    currentStatus
                                      ? "text-orange-600"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option}
                                </button>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* CHECK AVAILABILITY */}

                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        setAvailabilityVehicle(
                          row,
                        )
                      }
                      className="flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-all duration-200 hover:bg-orange-100 hover:shadow-sm"
                    >
                      <CalendarCheck size={13} />
                      Check Availability
                    </button>
                  </TableCell>

                  {/* VIEW */}

                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        handleViewVehicle(
                          vehicleId,
                        )
                      }
                      disabled={
                        vehicleId ===
                          undefined ||
                        vehicleId === null
                      }
                      title="View Vehicle"
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-orange-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
        </tbody>
      </Table>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!loading && safeTotal > 0 && (
        <div className="mt-2 shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Pagination
            currentPage={currentPage}
            totalPages={safeTotalPages}
            totalItems={safeTotal}
            rowsPerPage={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* =================================================
          AVAILABILITY MODAL
      ================================================= */}

      {availabilityVehicle && (
        <VehicleManagerCalenderPopup
          vehicle={availabilityVehicle}
          onClose={() =>
            setAvailabilityVehicle(null)
          }
        />
      )}

      {/* =================================================
          VIEW VEHICLE MODAL
      ================================================= */}

      {showViewModal && (
        <VehicleManagerModel
          vehicle={selectedVehicle}
          loading={selectedVehicleLoading}
          error={selectedVehicleError}
          onClose={handleCloseView}
        />
      )}
    </div>
  );
};

export default VehiclesManager;