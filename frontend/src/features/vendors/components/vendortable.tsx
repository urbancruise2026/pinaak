"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  Eye,
  Pencil,
  X,
  Search,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Clock,
  Filter,
  Star,
  MapPin,
  List,
  Plus,
  Handshake,
} from "lucide-react";

import {
  getVendorsThunk,
  clearError,
  resetSuccess,
  getVendorByIdThunk,
  deleteVendorThunk,
} from "../vendorSlice";

import VendorForm from "@/features/vendors/components/VendorFormData";
import Pagination from "@/components/ui/pagination";
import VendorModalView from "@/features/vendors/components/vendorModelView";

import {
  STATUS_OPTIONS,
  getStatus,
  getVendorCode,
  getVendorName,
  getEmail,
  getPhone,
  getCompanyName,
  getCompanyType,
  getGstNumber,
  getOwnerName,
  getCity,
  getState,
  getRating,
  isVerified,
  type VendorStatus,
} from "./vendorComponents/vendorHelpers";
import VendorUpdateModal from "./vendorComponents/VendorUpdateModal";

const PAGE_SIZE = 50;

const StarRating: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null) {
    return <span className="text-sm text-slate-400">No rating</span>;
  }
  return (
    <div
      className="flex items-center gap-0.5"
      title={`${value.toFixed(1)} / 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block h-[18px] w-[18px]">
            <Star size={18} className="absolute inset-0 text-amber-400" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                size={18}
                className="shrink-0 fill-amber-400 text-amber-400"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
};

type MenuState = { vendor: any; top: number; left: number } | null;

// Naya prop: "Add Vendor" button tabhi dikhega jab parent onAdd pass kare
const VendorTable: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VendorStatus>("all");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewVendor, setViewVendor] = useState<any>(null);
  const [updateTarget, setUpdateTarget] = useState<any>(null);

  const [menu, setMenu] = useState<MenuState>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { vendors, loading, error, successMessage } = useSelector(
    (state: RootState) => state.vendor,
  );

  /* ---------- Fetch ---------- */
  useEffect(() => {
    dispatch(getVendorsThunk());
  }, [dispatch]);

  /* ---------- Success toast ---------- */
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

  useEffect(() => {
    if (!actionError) return;
    const t = setTimeout(() => setActionError(null), 4000);
    return () => clearTimeout(t);
  }, [actionError]);

  /* ---------- Menu band karo (bahar click / resize) ---------- */
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, vendor: any) => {
    e.stopPropagation();
    if (menu?.vendor?.id === vendor.id) return setMenu(null);

    const r = e.currentTarget.getBoundingClientRect();
    const MENU_H = 230;
    const GAP = 8;

    const spaceBelow = window.innerHeight - r.bottom - GAP;
    const spaceAbove = r.top - GAP;

    // jis taraf zyada jagah ho, us taraf kholo
    const openUp = spaceBelow < MENU_H && spaceAbove > spaceBelow;

    const top = openUp
      ? Math.max(GAP, r.top - Math.min(MENU_H, spaceAbove) - 4)
      : r.bottom + 4;

    setMenu({ vendor, top, left: Math.max(8, r.right - 208) });
  };

  /* ---------- Actions ---------- */
  const handleEditClick = async (vendor: any) => {
    const vendorId = vendor?.id || vendor?.vendor_id;
    if (!vendorId) return;
    try {
      setEditLoading(true);
      await dispatch(getVendorByIdThunk(Number(vendorId))).unwrap();
      setShowEditForm(true);
    } catch (err) {
      console.error("Error fetching vendor:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleViewClick = async (vendor: any) => {
    const vendorId = vendor?.id || vendor?.vendor_id;
    if (!vendorId) return;
    try {
      setEditLoading(true);
      const full = await dispatch(
        getVendorByIdThunk(Number(vendorId)),
      ).unwrap();
      setViewVendor(full ?? vendor);
    } catch (err) {
      console.error("Error fetching vendor:", err);
      setViewVendor(vendor);
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await dispatch(deleteVendorThunk(Number(deleteTarget.id))).unwrap();
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteTarget(null);
      setActionError(typeof err === "string" ? err : "Failed to delete vendor");
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- Derived data (hooks hamesha early return se pehle) ---------- */
  const allVendors: any[] = vendors ?? [];

  const stats = useMemo(() => {
    const count = (list: VendorStatus[]) =>
      allVendors.filter((v) => list.includes(getStatus(v))).length;
    return {
      total: allVendors.length,
      active: count(["active"]),
      inactive: count(["inactive", "suspended", "blocked"]),
      pending: allVendors.filter((v) => !isVerified(v)).length,
    };
  }, [allVendors]);

  /* ---------- Edit form ---------- */
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

  /* ---------- Filter -> pagination ---------- */
  const s = searchTerm.trim().toLowerCase();

  const filteredVendors = allVendors.filter((v) => {
    if (statusFilter !== "all" && getStatus(v) !== statusFilter) return false;
    if (!s) return true;
    return [
      getVendorCode(v),
      getVendorName(v),
      getEmail(v),
      getPhone(v),
      getCompanyName(v),
      getOwnerName(v),
      getCity(v),
      getGstNumber(v),
    ].some((f) => f.toLowerCase().includes(s));
  });

  const total = filteredVendors.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageVendors = filteredVendors.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  /* ---------- Loading / Error ---------- */
  if ((loading && allVendors.length === 0) || editLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <span className="ml-2 text-base text-gray-600">
          {editLoading ? "Fetching vendor details..." : "Loading Vendors..."}
        </span>
      </div>
    );
  }

  if (error && allVendors.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-3 text-base text-red-600">❌ Error: {error}</p>
          <button
            type="button"
            onClick={() => {
              dispatch(clearError());
              dispatch(getVendorsThunk());
            }}
            className="rounded bg-red-600 px-4 py-2 text-base text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Stat cards ---------- */
  const cards = [
    {
      label: "Total Vendors",
      value: stats.total,
      sub: "All registered vendors",
      Icon: Users,
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Vendors",
      value: stats.active,
      sub: "In use & active",
      Icon: UserCheck,
      iconBg: "bg-green-100 text-green-600",
    },
    {
      label: "Inactive / Blocked",
      value: stats.inactive,
      sub: "Inactive or suspended",
      Icon: UserX,
      iconBg: "bg-red-100 text-red-600",
    },
    {
      label: "Pending Verification",
      value: stats.pending,
      sub: "Awaiting approval",
      Icon: Clock,
      iconBg: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <>
      {viewVendor && (
        <VendorModalView
          vendor={viewVendor}
          onClose={() => setViewVendor(null)}
        />
      )}

      {updateTarget && (
        <VendorUpdateModal
          vendor={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onError={setActionError}
        />
      )}

      {/* ---------- Toasts ---------- */}
      {showSuccessMessage && successMessage && (
        <div className="fixed right-4 top-4 z-50">
          <div className="flex min-w-[280px] items-center gap-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-4 shadow-lg">
            <CheckCircle2 size={20} className="text-green-600" />
            <p className="text-base font-medium text-green-700">
              {successMessage}
            </p>
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
      {actionError && (
        <div className="fixed right-4 top-4 z-50">
          <div className="flex max-w-sm items-start gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 shadow-lg">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
            <p className="text-base font-medium text-red-700">{actionError}</p>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ---------- Three dots menu (portal) — UNCHANGED ---------- */}
      {menu &&
        createPortal(
          <div
            style={{
              top: menu.top,
              left: menu.left,
              maxHeight: "calc(100vh - 16px)",
            }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[100] w-52 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
          >
            <button
              type="button"
              onClick={() => {
                const v = menu.vendor;
                setMenu(null);
                handleViewClick(v);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-base text-slate-700 hover:bg-slate-50"
            >
              <Eye size={17} /> View
            </button>
            <button
              type="button"
              onClick={() => {
                const v = menu.vendor;
                setMenu(null);
                handleEditClick(v);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-base text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={17} /> Edit
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                const v = menu.vendor;
                setMenu(null);
                setUpdateTarget(v);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-base text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={17} /> Update Status
            </button>
            <button
              type="button"
              onClick={() => {
                const v = menu.vendor;
                setMenu(null);
                setUpdateTarget(v);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-base text-slate-700 hover:bg-slate-50"
            >
              <CheckCircle2 size={17} /> Update Verification
            </button>

            <div className="my-1 border-t border-slate-100" />
            <button
              type="button"
              onClick={() => {
                const v = menu.vendor;
                setMenu(null);
                setDeleteTarget(v);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-base text-red-600 hover:bg-red-50"
            >
              <Trash2 size={17} /> Delete
            </button>
          </div>,
          document.body,
        )}

      {/* ---------- Delete confirm ---------- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={20} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              Delete vendor?
            </h3>
            <p className="mt-1 text-base text-slate-500">
              <span className="font-medium text-slate-700">
                {getVendorName(deleteTarget)}
              </span>{" "}
              aur uska saara data (company, contacts, documents) permanently
              delete ho jayega.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-base font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full space-y-6 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-6">
        {/* ---------- Header ---------- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200">
              <Handshake size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Vendor Management
              </h1>
              <p className="text-base text-slate-600">
                Manage your vendors and their details
              </p>
            </div>
          </div>

          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-blue-800"
            >
              <Plus size={20} /> Add Vendor
            </button>
          )}
        </div>

        {/* ---------- Stat cards ---------- */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, sub, Icon, iconBg }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconBg}`}
              >
                <Icon size={26} />
              </div>
              <div>
                <p className="text-base font-medium text-slate-700">{label}</p>
                <p className="text-3xl font-bold leading-tight text-slate-900">
                  {value}
                </p>
                <p className="text-sm text-slate-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ---------- Vendor list card ---------- */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <List size={18} />
              </span>
              <h2 className="text-xl font-semibold text-slate-900">
                Vendor List
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search
                  size={18}
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
                  className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-8 text-base text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
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
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="relative">
                <Filter
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "all" | VendorStatus);
                    setCurrentPage(1);
                  }}
                  className="h-11 appearance-none rounded-full border border-slate-200 bg-white pl-10 pr-5 text-base font-medium text-slate-700 outline-none focus:border-blue-400"
                >
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => dispatch(getVendorsThunk())}
                disabled={loading}
                className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-base font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* ---------- Table ---------- */}
          <div
            className="max-h-[720px] overflow-auto px-4 pb-2"
            onScroll={() => menu && setMenu(null)}
          >
            <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left text-base">
              <thead className="sticky top-0 z-10 text-white">
                <tr className="bg-[#0f2a5c]">
                  <th className="rounded-tl-xl bg-[#0f2a5c] px-4 py-4 text-base font-semibold">
                    #
                  </th>
                  <th className="bg-[#0f2a5c] px-4 py-4 text-base font-semibold">
                    Vendor Code
                  </th>
                  <th className="bg-[#0f2a5c] px-4 py-4 text-base font-semibold">
                    Vendor Name
                  </th>
                  <th className="bg-[#0f2a5c] px-4 py-4 text-base font-semibold">
                    Status
                  </th>
                  <th className="bg-[#0f2a5c] px-4 py-4 text-center text-base font-semibold">
                    Verification
                  </th>
                  <th className="bg-[#0f2a5c] px-4 py-4 text-base font-semibold">
                    Owner
                  </th>
                  <th className="bg-[#0f2a5c] px-4 py-4 text-base font-semibold">
                    GST Number
                  </th>
                  <th className="bg-[#0f2a5c] px-4 py-4 text-base font-semibold">
                    Location
                  </th>
                  <th className="bg-[#0f2a5c] px-4 py-4 text-base font-semibold">
                    Rating
                  </th>
                  <th className="rounded-tr-xl bg-[#0f2a5c] px-4 py-4 text-center text-base font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {pageVendors.length > 0 ? (
                  pageVendors.map((vendor: any, index: number) => {
                    const status = getStatus(vendor);
                    const statusOpt = STATUS_OPTIONS.find(
                      (o) => o.value === status,
                    )!;
                    const verified = isVerified(vendor);
                    const location = [getCity(vendor), getState(vendor)]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <tr
                        key={vendor.id ?? index}
                        className="hover:bg-blue-50/40 [&>td]:border-b [&>td]:border-slate-100"
                      >
                        <td className="px-4 py-4 text-base text-slate-700">
                          {(safePage - 1) * PAGE_SIZE + index + 1}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex whitespace-nowrap rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                            {getVendorCode(vendor)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-base font-semibold text-slate-900">
                            {getVendorName(vendor)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {getCompanyName(vendor)}
                            {getCompanyType(vendor)
                              ? ` · ${getCompanyType(vendor)}`
                              : ""}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${statusOpt.cls}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {statusOpt.label}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="group relative flex justify-center">
                            {verified ? (
                              <CheckCircle2
                                size={22}
                                className="text-green-500"
                              />
                            ) : (
                              <AlertTriangle
                                size={22}
                                className="text-amber-500"
                              />
                            )}
                            <span className="pointer-events-none absolute -bottom-9 z-20 hidden whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1 text-sm text-white group-hover:block">
                              {verified ? "Verified" : "Verification pending"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-base text-slate-800">
                          {getOwnerName(vendor)}
                        </td>
                        <td className="px-4 py-4 text-base text-slate-800">
                          {getGstNumber(vendor)}
                        </td>
                        <td className="px-4 py-4 text-base text-slate-800">
                          {location ? (
                            <span className="flex items-center gap-1.5">
                              <MapPin
                                size={15}
                                className="shrink-0 text-blue-600"
                              />
                              {location}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <StarRating value={getRating(vendor)} />
                        </td>

                        {/* ACTIONS — same three-dots menu, koi change nahi */}
                        <td className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => openMenu(e, vendor)}
                            className="rounded-lg p-1.5 text-white hover:bg-blue-500 hover:text-white bg-blue-300"
                            aria-label="Actions"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-5 py-14 text-center">
                      <p className="text-xl text-slate-500">
                        {searchTerm || statusFilter !== "all"
                          ? "No matching vendors found"
                          : "No vendors found"}
                      </p>
                      <p className="mt-1 text-base text-slate-400">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filter"
                          : "Click refresh to load vendors"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ---------- Footer ---------- */}
          {total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <p className="text-base text-slate-600">
                Showing {(safePage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(safePage * PAGE_SIZE, total)} of {total} entries
              </p>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={total}
                rowsPerPage={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VendorTable;
