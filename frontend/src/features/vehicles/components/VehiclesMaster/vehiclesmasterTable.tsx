"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import type { AppDispatch, RootState } from "@/store/store";
import {
  vehicleslice,
  fetchSeatOptions,
  getVehicleById,
  clearVehicle,
  deleteVehicle, // 👈 new thunk (see end of message)
} from "@/features/vehicles/vehicleSlice";
import VehicleForm from "./VehiclesMasterForm";
import { CATEGORY_OPTIONS, VARIANT_OPTIONS } from "./vehicleMasterDropdown";
import VehicleFilters from "../VehicleFilters";
import Table from "@/components/ui/Table/Table";
import TableHeader from "@/components/ui/Table/TableHeader";
import TableRow from "@/components/ui/Table/TableRow";
import TableCell from "@/components/ui/Table/TableCell";
import VehicleCodeHover from "../VehicleCodeHover";
import LeadPageHeader from "@/components/ui/PageHeader/TablePageHeader";
import VehicleViewModal from "./VehicleMasterModel";
import type { Vehicle } from "@/types/types";

const PAGE_LIMIT = 20;

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const VehicleTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    vehicleCodes,
    loading,
    error,
    limit,
    totalPages,
    total,
    seatOptions,
    seatOptionsLoading,
    vehicle,
    vehicleLoading,
    vehicleError,
  } = useSelector((state: RootState) => state.vehicle);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const formOpen = showForm || !!editingVehicle;

  useEffect(() => {
    dispatch(fetchSeatOptions());
  }, [dispatch]);

  const categoryOptions = CATEGORY_OPTIONS.map((c) => ({ code: c, label: c }));
  const seatDropdownOptions = (seatOptions || []).map((s) => ({
    code: s,
    label: `${s} Seater`,
  }));
  const variantOptions = VARIANT_OPTIONS.map((v) => ({
    code: v.code,
    label: v.code,
  }));

  const fetchVehicles = useCallback(
    (page: number) =>
      dispatch(
        vehicleslice({
          search: search.trim(),
          page,
          limit: PAGE_LIMIT,
          category: selectedCategories.length
            ? selectedCategories.join(",")
            : undefined,
          seat: selectedSeats.length ? selectedSeats.join(",") : undefined,
          variant: selectedVariants.length
            ? selectedVariants.join(",")
            : undefined,
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, selectedCategories, selectedSeats, selectedVariants],
  );

  useEffect(() => {
    fetchVehicles(currentPage);
  }, [fetchVehicles, currentPage]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow =
      formOpen || showViewModal || deleteTarget ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [formOpen, showViewModal, deleteTarget]);

  // ---------- handlers ----------

  const closeForm = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleFormSuccess = () => {
    const wasEditing = !!editingVehicle;
    closeForm();
    if (wasEditing) {
      fetchVehicles(currentPage); // stay on same page after edit
    } else if (currentPage === 1) {
      fetchVehicles(1);
    } else {
      setCurrentPage(1); // effect refetches
    }
  };

  const handleViewVehicle = (id: string | number | undefined) => {
    if (!id) return;
    setShowViewModal(true);
    dispatch(getVehicleById(String(id)));
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    dispatch(clearVehicle());
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await dispatch(deleteVehicle(String(deleteTarget.id))).unwrap();
      setDeleteTarget(null);
      // if last row on a page > 1 got deleted, go back one page
      if (vehicleCodes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchVehicles(currentPage);
      }
    } catch (err: any) {
      setDeleteError(
        typeof err === "string" ? err : err?.message || "Failed to delete",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    // Whole page = one screen. Only the table body scrolls.
    <div className="flex h-[calc(100vh-6rem)] w-full flex-col gap-3">
      <LeadPageHeader
        title="Vehicles Master"
        description={`${total ?? 0} vehicles registered`}
      >
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

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-indigo-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
        >
          <Plus size={16} />
          Add Vehicle
        </button>
      </LeadPageHeader>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* TABLE — fills remaining height, scrolls inside */}
     <div className="min-h-0 flex-1">
  <Table minWidth="min-w-[1100px]" className="h-full">
          <TableHeader>
            <TableRow alternate={false}>
              <TableCell header sticky>
                #
              </TableCell>
              <TableCell header>Code</TableCell>
              <TableCell header>Seat</TableCell>
              <TableCell header>Config</TableCell>
              <TableCell header>Category</TableCell>
              <TableCell header>Make</TableCell>
              <TableCell header>Model</TableCell>
              <TableCell header>Variant</TableCell>
              <TableCell header>Description</TableCell>
              <TableCell header>Highlight</TableCell>
              <TableCell header>Action</TableCell>
            </TableRow>
          </TableHeader>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={11} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 size={24} className="animate-spin text-indigo-400" />
                    <span className="text-sm">Loading vehicles...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && vehicleCodes.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="py-16 text-center text-sm text-slate-500"
                >
                  No vehicles found
                </td>
              </tr>
            )}

            {!loading &&
              vehicleCodes.map((v, index) => (
                <TableRow key={v.id ?? index} index={index}>
                  <TableCell sticky rowIndex={index}>
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>

                  <TableCell>
                    <VehicleCodeHover
  code={v.code}
  seat={v.seat}
  category={v.category}
  config={v.config}
  make={v.make}
  model={v.model}
  variant={v.variant}
/>
                  </TableCell>

                  <TableCell>{v.seat || "-"}</TableCell>
                  <TableCell>{v.config || "-"}</TableCell>
                  <TableCell>{v.category || "-"}</TableCell>
                  <TableCell>{v.make || "-"}</TableCell>
                  <TableCell>{v.model || "-"}</TableCell>
                  <TableCell>{v.variant || "-"}</TableCell>

                  <TableCell
                    className="max-w-[260px]"
                    title={v.description || ""}
                  >
                    <div className="line-clamp-2 whitespace-normal leading-5">
                      {v.description || "-"}
                    </div>
                  </TableCell>

                  <TableCell
                    className="max-w-[260px]"
                    title={v.amenities || ""}
                  >
                    <div className="line-clamp-2 whitespace-normal leading-5">
                      {v.amenities || "-"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="View"
                        aria-label="View vehicle"
                        disabled={!v.id}
                        onClick={() => handleViewVehicle(v.id)}
                        className={`${iconBtn} bg-sky-50 text-sky-600 hover:bg-sky-100`}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        title="Edit"
                        aria-label="Edit vehicle"
                        disabled={!v.id}
                        onClick={() => setEditingVehicle(v)}
                        className={`${iconBtn} bg-emerald-50 text-emerald-600 hover:bg-emerald-100`}
                      >
                        <Pencil size={16} />
                      </button>
                      {/* <button
                        type="button"
                        title="Delete"
                        aria-label="Delete vehicle"
                        disabled={!v.id}
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(v);
                        }}
                        className={`${iconBtn} bg-rose-50 text-rose-500 hover:bg-rose-100`}
                      >
                        <Trash2 size={16} />
                      </button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </tbody>
        </Table>
      </div>

      {/* PAGINATION — no wrapper card */}
      {total > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          rowsPerPage={limit}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ADD / EDIT MODAL */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
          onClick={closeForm}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-600"
            >
              <X size={16} />
            </button>
            <div className="p-6">
              <VehicleForm
                vehicle={editingVehicle}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && (
        <VehicleViewModal
          vehicle={vehicle}
          loading={vehicleLoading}
          error={vehicleError}
          onClose={handleCloseViewModal}
        />
      )}

      {/* DELETE CONFIRM */}
      {/* {deleteTarget && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/30 p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Delete vehicle?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">
                {deleteTarget.code}
              </span>{" "}
              will be permanently removed.
            </p>

            {deleteError && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default VehicleTable;