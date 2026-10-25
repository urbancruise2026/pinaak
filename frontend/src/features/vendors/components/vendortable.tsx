"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { Eye, Pencil, X, Search, RefreshCw } from "lucide-react";

import {
  getVendorsThunk,
  clearError,
  resetSuccess,
  getVendorByIdThunk,
} from "../vendorSlice";

import VendorForm from "@/features/vendors/components/VendorFormData";
import Pagination from "@/components/ui/pagination";
import VendorModalView from "@/features/vendors/components/vendorModelView";
import LeadPageHeader from "@/components/ui/PageHeader/TablePageHeader";

// =====================================================
// REUSABLE TABLE COMPONENTS
// =====================================================
import Table from "@/components/ui/Table/Table";
import TableHeader from "@/components/ui/Table/TableHeader";
import TableRow from "@/components/ui/Table/TableRow";
import TableCell from "@/components/ui/Table/TableCell";

// =====================================================
// COMPONENT
// =====================================================
const VendorTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // =====================================================
  // STATE
  // =====================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [viewVendor, setViewVendor] = useState<any>(null);

  const pageSize = 50;

  // =====================================================
  // REDUX
  // =====================================================
  const { vendors, loading, error, successMessage } = useSelector(
    (state: RootState) => state.vendor,
  );

  // =====================================================
  // PAGINATION
  // =====================================================
  const total = vendors?.length || 0;

  const totalPages = Math.ceil(total / pageSize);

  const paginatedVendors = vendors?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // =====================================================
  // FETCH VENDORS
  // =====================================================
  useEffect(() => {
    dispatch(getVendorsThunk());
  }, [dispatch]);

  // =====================================================
  // SUCCESS MESSAGE
  // =====================================================
  useEffect(() => {
    if (successMessage) {
      setShowSuccessMessage(true);

      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        dispatch(resetSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // =====================================================
  // EDIT
  // =====================================================
  const handleEditClick = async (vendor: any) => {
    try {
      setEditLoading(true);

      const vendorId = vendor?.id || vendor?.vendor_id;

      if (!vendorId) {
        console.error("Vendor ID missing:", vendor);
        return;
      }

      await dispatch(getVendorByIdThunk(Number(vendorId))).unwrap();

      setShowEditForm(true);
    } catch (err) {
      console.error("Error fetching vendor:", err);
    } finally {
      setEditLoading(false);
    }
  };

  // =====================================================
  // VIEW
  // =====================================================
  const handleViewClick = (vendor: any) => {
    setViewVendor(vendor);
  };

  // =====================================================
  // EDIT FORM
  // =====================================================
  if (showEditForm) {
    return (
      <VendorForm
        mode="edit"
        onBack={() => {
          setShowEditForm(false);
          dispatch(getVendorsThunk());
        }}
      />
    );
  }

  // =====================================================
  // HELPERS
  // =====================================================
  const getVendorName = (v: any) =>
    v.name || v.vendor_name || v.vendorName || "—";

  const getEmail = (v: any) => v.email || v.vendor_email || "—";

  const getPhone = (v: any) => v.phone || v.mobile || v.vendor_phone || "—";

  const getCompanyName = (v: any) =>
    v.company_name || v.companyName || v.company?.name || "—";

  const getCompanyType = (v: any) =>
    v.companyType || v.company_type || v.company?.type || "—";

  const getGstNumber = (v: any) => v.gstNumber || v.gst_number || v.gst || "—";

  const getOwnerName = (v: any) =>
    v.ownerName || v.owner_name || v.owner?.name || "—";

  const getCity = (v: any) =>
    v.personalInfo?.personalCity ||
    v.personal_city ||
    v.city ||
    v.address?.city ||
    "—";

  const getState = (v: any) =>
    v.personalInfo?.personalState ||
    v.personal_state ||
    v.state ||
    v.address?.state ||
    "—";

  const getStatus = (v: any) => v.status || "active";

  // =====================================================
  // FILTER
  // =====================================================
  const filteredVendors = paginatedVendors?.filter((vendor) => {
    if (!searchTerm) return true;

    const s = searchTerm.toLowerCase();

    return (
      getVendorName(vendor).toLowerCase().includes(s) ||
      getEmail(vendor).toLowerCase().includes(s) ||
      getPhone(vendor).toLowerCase().includes(s) ||
      getCompanyName(vendor).toLowerCase().includes(s) ||
      getOwnerName(vendor).toLowerCase().includes(s) ||
      getCity(vendor).toLowerCase().includes(s)
    );
  });

  // =====================================================
  // LOADING
  // =====================================================
  if ((loading && vendors.length === 0) || editLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600" />

        <span className="ml-2 text-gray-600">
          {editLoading ? "Fetching vendor details..." : "Loading Vendors..."}
        </span>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================
  if (error && vendors.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-3 text-red-600">❌ Error: {error}</p>

          <button
            type="button"
            onClick={() => {
              dispatch(clearError());
              dispatch(getVendorsThunk());
            }}
            className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <>
      {/* =====================================================
          VENDOR VIEW MODAL
      ===================================================== */}
      {viewVendor && (
        <VendorModalView
          vendor={viewVendor}
          onClose={() => setViewVendor(null)}
        />
      )}

      <div className="w-full">
        {/* =====================================================
            SUCCESS TOAST
        ===================================================== */}
        {showSuccessMessage && successMessage && (
          <div className="fixed right-4 top-4 z-50 animate-slide-in-right">
            <div className="flex min-w-[300px] items-center gap-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-4 shadow-lg">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

              <p className="font-medium text-green-700">✅ {successMessage}</p>

              <button
                type="button"
                onClick={() => setShowSuccessMessage(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            HEADER (reusable, with search + refresh menu)
        ===================================================== */}
        <div className="mb-4 shrink-0">
          <LeadPageHeader
            title="Vendor List"
            description={
              searchTerm && vendors?.length > 0
                ? `Total Vendors: ${total} (filtered from ${vendors.length} total)`
                : `Total Vendors: ${total}`
            }
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
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm text-slate-600 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* =================================================
                REFRESH BUTTON
            ================================================= */}
            <button
              type="button"
              onClick={() => dispatch(getVendorsThunk())}
              disabled={loading}
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </LeadPageHeader>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}
        <Table minWidth="min-w-[1400px]" maxHeight="max-h-[920px]">
          {/* TABLE HEADER */}
          <TableHeader>
            <TableRow alternate={false}>
              <TableCell header sticky>
                S.No
              </TableCell>

              <TableCell header>Vendor Name</TableCell>

              <TableCell header>Company Name</TableCell>

              <TableCell header>Company Type</TableCell>

              <TableCell header>GST Number</TableCell>

              <TableCell header>Owner Name</TableCell>

              <TableCell header>City</TableCell>

              <TableCell header>State</TableCell>

              <TableCell header>Status</TableCell>

              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHeader>

          {/* TABLE BODY */}
          <tbody>
            {filteredVendors && filteredVendors.length > 0 ? (
              filteredVendors.map((vendor, index) => {
                const status = getStatus(vendor);

                return (
                  <TableRow key={vendor.id || index} index={index}>
                    {/* S.NO */}
                    <TableCell sticky rowIndex={index}>
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>

                    {/* VENDOR NAME */}
                    <TableCell className="font-bold text-orange-700">
                      {getVendorName(vendor)}
                    </TableCell>

                    {/* COMPANY */}
                    <TableCell>{getCompanyName(vendor)}</TableCell>

                    {/* COMPANY TYPE */}
                    <TableCell>
                      <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800">
                        {getCompanyType(vendor)}
                      </span>
                    </TableCell>

                    {/* GST */}
                    <TableCell>{getGstNumber(vendor)}</TableCell>

                    {/* OWNER */}
                    <TableCell>{getOwnerName(vendor)}</TableCell>

                    {/* CITY */}
                    <TableCell>{getCity(vendor)}</TableCell>

                    {/* STATE */}
                    <TableCell>{getState(vendor)}</TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {status === "inactive" ? "Inactive" : "Active"}
                      </span>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() => handleEditClick(vendor)}
                          className="rounded-lg bg-blue-100 p-2 text-blue-700 transition hover:bg-blue-200"
                          title="Edit Vendor"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* VIEW */}
                        <button
                          type="button"
                          onClick={() => handleViewClick(vendor)}
                          className="rounded-lg bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200"
                          title="View Vendor"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              /* EMPTY */
              <tr>
                <td colSpan={10} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="mb-4 h-16 w-16 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>

                    <p className="text-lg text-gray-500">
                      {searchTerm
                        ? "No matching vendors found"
                        : "No vendors found"}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {searchTerm
                        ? "Try adjusting your search term"
                        : "Click refresh to load vendors"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* =====================================================
            PAGINATION
        ===================================================== */}
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

        {/* =====================================================
            ANIMATION
        ===================================================== */}
        <style jsx>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }

            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-slide-in-right {
            animation: slideInRight 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default VendorTable;
