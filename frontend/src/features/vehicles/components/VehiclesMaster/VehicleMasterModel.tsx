"use client";

import React from "react";
import { X } from "lucide-react";
import type { Vehicle } from "@/types/types";

interface VehicleViewModalProps {
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

const DetailRow: React.FC<{
  label: string;
  value?: string | number | null;
}> = ({ label, value }) => (
  <div className="flex flex-col gap-1 border-b border-gray-100 py-2">
    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-800">{value || "-"}</span>
  </div>
);

const VehicleViewModal: React.FC<VehicleViewModalProps> = ({
  vehicle,
  loading,
  error,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-red-800 text-white transition hover:bg-red-200 hover:text-red-700"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            Vehicle Details
          </h2>

          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />
              <span className="text-sm font-medium">Loading details...</span>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* DATA */}
          {!loading && !error && vehicle && (
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <DetailRow label="Code" value={(vehicle as any).code} />
              <DetailRow label="Seat" value={(vehicle as any).seat} />
              <DetailRow label="Config" value={(vehicle as any).config} />
              <DetailRow label="Category" value={(vehicle as any).category} />
              <DetailRow label="Make" value={(vehicle as any).make} />
              <DetailRow label="Model" value={(vehicle as any).model} />
              <DetailRow label="Variant" value={(vehicle as any).variant} />

              <div className="sm:col-span-2">
                <DetailRow
                  label="Description"
                  value={(vehicle as any).description}
                />
              </div>

              <div className="sm:col-span-2">
                <DetailRow
                  label="Highlight / Amenities"
                  value={(vehicle as any).amenities}
                />
              </div>
            </div>
          )}

          {/* NO DATA FALLBACK */}
          {!loading && !error && !vehicle && (
            <div className="py-10 text-center text-sm text-gray-500">
              No details found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleViewModal;
