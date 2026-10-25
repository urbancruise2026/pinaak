"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Eye,
  Pencil,
  X,
  RotateCcw,
  Users,
  MapPin,
  UserRound,
  ChevronDown,
  Search,
} from "lucide-react";

import { RootState, AppDispatch } from "@/store/store";

import CustomerModelView from "./customerModelView";
import CustomerPersonal from "./customerForm";

import {
  getCustomersThunk,
  clearError,
  getCustomerByIdThunk,
} from "../newCustomerSlice";

import Pagination from "@/components/ui/pagination";

import LeadPageHeader from "@/components/ui/PageHeader/TablePageHeader";

import Table from "@/components/ui/Table/Table";
import TableHeader from "@/components/ui/Table/TableHeader";
import TableRow from "@/components/ui/Table/TableRow";
import TableCell from "@/components/ui/Table/TableCell";

interface CustomerTableProps {
  onEdit?: (customer: any) => void;
}

const TABLE_COLUMNS: { label: string; key: string }[] = [
  { label: "Name", key: "fullName" },
  { label: "Email", key: "customerEmail" },
  { label: "Phone (India)", key: "customerPhone" },
  { label: "Alternate Phone (Other)", key: "alternatePhone" },
  { label: "Company", key: "companyName" },
  { label: "Customer Type", key: "customerType" },
  { label: "Category Type", key: "customerCategoryType" },
  { label: "Country", key: "countryName" },
  { label: "City", key: "customerCity" },
  { label: "State", key: "state" },
  { label: "Pincode", key: "pincode" },
  { label: "Address", key: "address" },
];

const CustomerTable: React.FC<CustomerTableProps> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { customers, loading, error } = useSelector(
    (state: RootState) => state.newCustomer,
  );

  /* =========================================================
     STATES
  ========================================================= */

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [selectedViewCustomer, setSelectedViewCustomer] = useState<any>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 50;

  /* =========================================================
     LOAD CUSTOMERS
  ========================================================= */

  useEffect(() => {
    dispatch(getCustomersThunk());
  }, [dispatch]);

  /* =========================================================
     CITY OPTIONS
  ========================================================= */

  const cityOptions = useMemo(() => {
    const cities = (customers || [])
      .map((customer: any) => customer.customerCity)
      .filter((city: any) => typeof city === "string" && city.trim() !== "");

    return Array.from(new Set(cities)).sort((a: string, b: string) =>
      a.localeCompare(b),
    );
  }, [customers]);

  /* =========================================================
     CUSTOMER TYPE OPTIONS
  ========================================================= */

  const typeOptions = useMemo(() => {
    const types = (customers || [])
      .map((customer: any) => customer.customerType)
      .filter((type: any) => typeof type === "string" && type.trim() !== "");

    return Array.from(new Set(types)).sort((a: string, b: string) =>
      a.localeCompare(b),
    );
  }, [customers]);

  /* =========================================================
     FILTER CUSTOMERS
  ========================================================= */

  const filteredCustomers = useMemo(() => {
    let result = customers || [];

    const term = searchTerm.trim().toLowerCase();

    if (term) {
      result = result.filter((customer: any) => {
        const fullName = [
          customer.firstName,
          customer.middleName,
          customer.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const phone = String(customer.customerPhone || "").toLowerCase();

        const alternatePhone = String(
          customer.alternatePhone || "",
        ).toLowerCase();

        const email = String(customer.customerEmail || "").toLowerCase();

        const company = String(customer.companyName || "").toLowerCase();

        const city = String(customer.customerCity || "").toLowerCase();

        return (
          fullName.includes(term) ||
          phone.includes(term) ||
          alternatePhone.includes(term) ||
          email.includes(term) ||
          company.includes(term) ||
          city.includes(term)
        );
      });
    }

    if (cityFilter) {
      result = result.filter(
        (customer: any) => customer.customerCity === cityFilter,
      );
    }

    if (typeFilter) {
      result = result.filter(
        (customer: any) => customer.customerType === typeFilter,
      );
    }

    return result;
  }, [customers, searchTerm, cityFilter, typeFilter]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const total = filteredCustomers.length;

  const totalPages = Math.ceil(total / pageSize);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  /* =========================================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, cityFilter, typeFilter]);

  /* =========================================================
     PAGE CHANGE
  ========================================================= */

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const handleResetFilters = () => {
    setSearchTerm("");
    setCityFilter("");
    setTypeFilter("");
    setCurrentPage(1);
  };

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {
    dispatch(getCustomersThunk());
  };

  /* =========================================================
     EDIT CUSTOMER
  ========================================================= */

  const handleEditClick = async (customer: any) => {
    try {
      setEditLoading(true);

      const response = await dispatch(
        getCustomerByIdThunk(customer.id),
      ).unwrap();

      setSelectedCustomer(response);
      setShowEditForm(true);

      if (onEdit) {
        onEdit(response);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setEditLoading(false);
    }
  };

  /* =========================================================
     VIEW CUSTOMER
  ========================================================= */

  const handleViewClick = async (customer: any) => {
    try {
      setViewLoading(true);
      setShowViewModal(true);
      setSelectedViewCustomer(null);

      const response = await dispatch(
        getCustomerByIdThunk(customer.id),
      ).unwrap();

      setSelectedViewCustomer(response);
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setViewLoading(false);
    }
  };

  /* =========================================================
     CLOSE VIEW MODAL
  ========================================================= */

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedViewCustomer(null);
  };

  /* =========================================================
     EDIT SCREEN
  ========================================================= */

  if (showEditForm) {
  return (
    <CustomerPersonal
      mode="edit"
      onBack={() => {
        setShowEditForm(false);
        setSelectedCustomer(null);
        dispatch(getCustomersThunk());
      }}
    />
  );
}

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading || editLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-[360px] rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />

            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-orange-500" />

            <Users
              size={22}
              className="absolute inset-0 m-auto text-slate-500"
            />
          </div>

          <p className="mt-6 text-base font-semibold text-slate-800">
            {editLoading ? "Fetching customer details" : "Loading customers"}
          </p>

          <p className="mt-1 text-sm text-slate-400">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR SCREEN
  ========================================================= */

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-9 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-xl">
            ⚠️
          </div>

          <h3 className="mt-5 text-xl font-bold text-slate-800">
            Unable to load customers
          </h3>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => {
              dispatch(clearError());
              dispatch(getCustomersThunk());
            }}
            className="mt-6 rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-900"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <>
      <div className="flex h-[calc(100vh-120px)] min-h-0 flex-col bg-slate-50">
        {/* =====================================================
            COMMON HEADER (with search + city + type filter menu)
        ===================================================== */}

        <div className="shrink-0">
          <LeadPageHeader
            title="Customers"
            description="Manage and view customer records"
          >
            {/* =================================================
                SEARCH BOX
            ================================================= */}
            <div className="relative w-56 shrink-0">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-600 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
              />
            </div>

            {/* =================================================
                CITY FILTER
            ================================================= */}

            <div className="relative shrink-0">
              <MapPin
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="h-10 w-[150px] appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-600 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
              >
                <option value="">All Cities</option>

                {cityOptions.map((city: string) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* =================================================
                CUSTOMER TYPE FILTER
            ================================================= */}

            <div className="relative shrink-0">
              <UserRound
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 w-[170px] appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-600 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
              >
                <option value="">All Customer Types</option>

                {typeOptions.map((type: string) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* =================================================
                RESET
            ================================================= */}

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!searchTerm && !cityFilter && !typeFilter}
              className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all ${
                searchTerm || cityFilter || typeFilter
                  ? "bg-slate-800 text-white hover:bg-slate-900"
                  : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-300"
              }`}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </LeadPageHeader>

          {/* =================================================
              ACTIVE FILTERS (below header, outside menu row)
          ================================================= */}

          {(searchTerm || cityFilter || typeFilter) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Filters:
              </span>

              {searchTerm && (
                <span className="inline-flex items-center rounded-lg border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                  Search: {searchTerm}
                </span>
              )}

              {cityFilter && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <MapPin size={12} />
                  {cityFilter}
                </span>
              )}

              {typeFilter && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <UserRound size={12} />
                  {typeFilter}
                </span>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div className="mt-4 min-h-0 flex-1">
          <Table
            minWidth="min-w-[1800px]"
            maxHeight="max-h-[calc(100vh-360px)]"
          >
            <TableHeader>
              <TableRow alternate={false}>
                {/* S.NO */}

                <TableCell header sticky>
                  S.No
                </TableCell>

                {/* COLUMNS */}

                {TABLE_COLUMNS.map((column) => (
                  <TableCell header key={column.key}>
                    {column.label}
                  </TableCell>
                ))}

                {/* ACTIONS */}

                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <tbody>
              {/* =================================================
                  CUSTOMER DATA
              ================================================= */}

              {paginatedCustomers.length > 0 &&
                paginatedCustomers.map((customer: any, index: number) => (
                  <TableRow key={customer.id} index={index}>
                    {/* S.NO */}

                    <TableCell sticky rowIndex={index}>
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>

                    {/* COLUMNS */}

                    {TABLE_COLUMNS.map((column) => {
                      const value =
                        column.key === "fullName"
                          ? [
                              customer.firstName,
                              customer.middleName,
                              customer.lastName,
                            ]
                              .filter(Boolean)
                              .join(" ")
                          : customer[column.key];

                      const isEmpty =
                        value === null || value === undefined || value === "";

                      const emphasizedKeys = [
                        "fullName",
                        "customerPhone",
                        "customerType",
                        "customerCategoryType",
                      ];

                      return (
                        <TableCell
                          key={column.key}
                          className="max-w-[280px]"
                          title={isEmpty ? "" : String(value)}
                        >
                          {isEmpty ? (
                            <span className="text-slate-300">—</span>
                          ) : emphasizedKeys.includes(column.key) ? (
                            <span className="font-semibold text-slate-700">
                              {String(value)}
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              {String(value)}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}

                    {/* =================================================
                          ACTIONS
                      ================================================= */}

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() => handleEditClick(customer)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                          title="Edit Customer"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() => handleViewClick(customer)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-800 hover:bg-slate-800 hover:text-white"
                          title="View Customer"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {/* =================================================
                  EMPTY STATE
              ================================================= */}

              {paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan={TABLE_COLUMNS.length + 2} className="py-24">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-18 w-18 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
                        <Users size={30} className="text-slate-300" />
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-slate-700">
                        {searchTerm || cityFilter || typeFilter
                          ? "No customers found"
                          : "No customer records"}
                      </h3>

                      <p className="mt-2 max-w-sm text-center text-sm text-slate-400">
                        {searchTerm || cityFilter || typeFilter
                          ? "Try changing your search or clearing the active filters."
                          : "Customer records will appear here once they are available."}
                      </p>

                      {(searchTerm || cityFilter || typeFilter) && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-5 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-900"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* =====================================================
            PAGINATION (same style as VehicleTable/master)
        ====================================================== */}

        {total > 0 && (
          <div className="mt-2 shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              rowsPerPage={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* =========================================================
          CUSTOMER VIEW MODAL
      ========================================================= */}

      {showViewModal && (
        <div className="fixed inset-0 z-[100]">
          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[4px]"
            onClick={handleCloseModal}
          />

          {/* MODAL WRAPPER */}

          <div className="relative flex h-full w-full items-center justify-center p-3 md:p-6">
            {/* MODAL */}

            <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="sticky top-0 z-20 border-b border-slate-200 bg-white">
                {/* ORANGE LINE */}

                <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-400" />

                <div className="flex items-center justify-between px-5 py-5 md:px-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                      <UserRound size={20} className="text-orange-500" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Customer Details
                      </h3>

                      <p className="mt-0.5 text-sm text-slate-400">
                        Complete customer information
                      </p>
                    </div>
                  </div>

                  {/* CLOSE */}

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                    title="Close"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div className="max-h-[calc(92vh-85px)] overflow-y-auto bg-slate-50 p-4 md:p-7">
                {viewLoading ? (
                  <div className="flex h-72 items-center justify-center">
                    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-9 py-7 shadow-sm">
                      <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-slate-100 border-t-orange-500" />

                      <p className="mt-5 text-base font-semibold text-slate-700">
                        Loading customer details...
                      </p>

                      <p className="mt-1 text-sm text-slate-400">Please wait</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                    <CustomerModelView customerData={selectedViewCustomer} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerTable;
