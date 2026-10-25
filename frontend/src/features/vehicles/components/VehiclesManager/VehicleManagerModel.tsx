"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import type { Vehicle } from "@/types/types";

interface VehicleManagerModelProps {
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

// =====================================================
// TYPES
// =====================================================

type DetailValue = string | number | null | undefined;

type VehicleRecord = Record<string, unknown>;

// =====================================================
// DETAIL ROW
// =====================================================

const DetailRow: React.FC<{
  label: string;
  value?: DetailValue;
}> = ({ label, value }) => {
  const displayValue =
    value !== undefined && value !== null && String(value).trim() !== ""
      ? String(value)
      : "-";

  return (
    <div className="border-b border-gray-100 py-3">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-gray-800">
        {displayValue}
      </p>
    </div>
  );
};

// =====================================================
// VALUE CONVERTER
// =====================================================

const normalizeValue = (value: unknown): DetailValue => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : null;
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

// =====================================================
// GET VALUE FROM OBJECT
// =====================================================

const getFromObject = (
  object: VehicleRecord | null | undefined,
  keys: string[],
): DetailValue => {
  if (!object) {
    return null;
  }

  for (const key of keys) {
    const value = object[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return normalizeValue(value);
    }
  }

  return null;
};

// =====================================================
// GET VEHICLE VALUE
// =====================================================

const getVehicleValue = (
  vehicle: Vehicle | null,
  keys: string[],
): DetailValue => {
  if (!vehicle) {
    return null;
  }

  const root = vehicle as unknown as VehicleRecord;

  // ---------------------------------------------------
  // DIRECT VEHICLE OBJECT
  // ---------------------------------------------------

  const directValue = getFromObject(root, keys);

  if (
    directValue !== null &&
    directValue !== undefined &&
    String(directValue).trim() !== ""
  ) {
    return directValue;
  }

  // ---------------------------------------------------
  // COMMON NESTED OBJECTS
  // ---------------------------------------------------

  const nestedKeys = [
    "vehicle",
    "vehicleMaster",
    "vehicle_master",
    "master",
    "vehicleDetails",
    "vehicle_details",
    "details",
    "data",
  ];

  for (const nestedKey of nestedKeys) {
    const nestedObject = root[nestedKey];

    if (
      nestedObject &&
      typeof nestedObject === "object" &&
      !Array.isArray(nestedObject)
    ) {
      const value = getFromObject(nestedObject as VehicleRecord, keys);

      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }
  }

  return null;
};

// =====================================================
// DATE FORMATTER
// =====================================================

const formatDate = (value: DetailValue): string => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "-";
  }

  const rawValue = String(value).trim();

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return rawValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// =====================================================
// AGING FORMATTER
// =====================================================

const formatAging = (value: DetailValue): React.ReactNode => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "-";
  }

  const rawValue = String(value).trim();

  const numericValue = Number(rawValue);

  if (Number.isNaN(numericValue)) {
    return rawValue;
  }

  if (numericValue < 0) {
    return "-";
  }

  const years = Math.floor(numericValue);

  let months = Math.round((numericValue - years) * 10);

  if (months >= 10) {
    return (
      <>
        {years + 1} <span className="text-[9px] font-bold">Y</span> 0{" "}
        <span className="text-[9px] font-bold">M</span>
      </>
    );
  }

  if (months < 0) {
    months = 0;
  }

  return (
    <>
      {years} <span className="text-[9px] font-bold">Y</span> {months}{" "}
      <span className="text-[9px] font-bold">M</span>
    </>
  );
};

// =====================================================
// DISPLAY TEXT
// =====================================================

const displayText = (value: DetailValue): string => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "-";
  }

  return String(value);
};

// =====================================================
// VEHICLE MANAGER VIEW MODAL
// =====================================================

const VehicleManagerModel: React.FC<VehicleManagerModelProps> = ({
  vehicle,
  loading,
  error,
  onClose,
}) => {
  // ===================================================
  // VEHICLE VALUES
  // ===================================================

  const vehicleId = getVehicleValue(vehicle, ["id", "vehicle_id", "vehicleId"]);

  const code = getVehicleValue(vehicle, [
    "code",
    "vehicle_code",
    "vehicleCode",
  ]);

  const seat = getVehicleValue(vehicle, [
    "seat",
    "seater",
    "seats",
    "seat_count",
    "seater_count",
    "no_of_seats",
    "number_of_seats",
  ]);

  const category = getVehicleValue(vehicle, [
    "category",
    "vehicle_category",
    "category_name",
    "categoryName",
  ]);

  const variant = getVehicleValue(vehicle, [
    "variant",
    "vehicle_variant",
    "variant_name",
    "variantName",
  ]);

  const config = getVehicleValue(vehicle, [
    "config",
    "configuration",
    "vehicle_config",
    "vehicle_configuration",
    "config_name",
    "configuration_name",
  ]);

  const vehicleNumber = getVehicleValue(vehicle, [
    "veh_no",
    "vehicle_no",
    "vehicle_number",
    "vehicleNumber",
    "registration_no",
    "registration_number",
  ]);

  const cityDirect = getVehicleValue(vehicle, ["city_name", "cityName"]);

  const city = cityDirect || getVehicleValue(vehicle, ["city", "city_id"]);

  const vendor = getVehicleValue(vehicle, [
    "vendor",
    "vendor_name",
    "vendorName",
  ]);

  const garage = getVehicleValue(vehicle, [
    "garage",
    "garage_name",
    "garageName",
  ]);

  const registrationDate = getVehicleValue(vehicle, [
    "reg_date",
    "registration_date",
    "registrationDate",
    "regDate",
  ]);

  const aging = getVehicleValue(vehicle, ["aging", "vehicle_aging"]);

  const status = getVehicleValue(vehicle, ["status", "vehicle_status"]);

  const amenities = getVehicleValue(vehicle, [
    "amenities",
    "amenity",
    "vehicle_amenities",
  ]);

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-manager-modal-title"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex shrink-0 items-center justify-between border-b border-orange-200 bg-orange-500 px-6 py-4">
          <div className="min-w-0">
            <h2
              id="vehicle-manager-modal-title"
              className="text-lg font-bold text-white"
            >
              Vehicle Manager Details
            </h2>

            <p className="mt-0.5 truncate text-xs text-orange-100">
              {code && String(code).trim() !== "" && code !== "-"
                ? `Vehicle Code: ${String(code)}`
                : "Vehicle details"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Close vehicle details"
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white hover:text-orange-600"
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="flex-1 overflow-y-auto p-6">
          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <Loader2 size={30} className="animate-spin text-orange-500" />

              <p className="text-sm font-semibold text-gray-500">
                Loading vehicle details...
              </p>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-semibold text-red-700">{error}</p>
            </div>
          )}

          {/* =================================================
              DATA
          ================================================= */}

          {!loading && !error && vehicle && (
            <>
              {/* =================================================
                  VEHICLE DETAILS
              ================================================= */}

              <div className="mb-6">
                <h3 className="mb-3 border-l-4 border-orange-500 pl-3 text-sm font-bold text-gray-800">
                  Vehicle Details
                </h3>

                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailRow label="Vehicle ID" value={vehicleId} />

                  <DetailRow label="Code" value={code} />

                  <DetailRow label="Seater" value={seat} />

                  <DetailRow label="Category" value={category} />

                  <DetailRow label="Variant" value={variant} />

                  <DetailRow label="Config" value={config} />

                  <DetailRow label="Vehicle Number" value={vehicleNumber} />
                </div>
              </div>

              {/* =================================================
                  MANAGER DETAILS
              ================================================= */}

              <div className="mb-6">
                <h3 className="mb-3 border-l-4 border-orange-500 pl-3 text-sm font-bold text-gray-800">
                  Manager Details
                </h3>

                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailRow label="City" value={city} />

                  <DetailRow label="Vendor" value={vendor} />

                  <DetailRow label="Garage" value={garage} />

                  <DetailRow
                    label="Registration Date"
                    value={formatDate(registrationDate)}
                  />

                  {/* Aging */}
                  <div className="border-b border-gray-100 py-3">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      Aging
                    </p>

                    <p className="break-words text-sm font-semibold text-gray-800">
                      {formatAging(aging)}
                    </p>
                  </div>

                  <DetailRow label="Status" value={status} />
                </div>
              </div>

              {/* =================================================
                  AMENITIES
              ================================================= */}

              <div className="mb-6">
                <h3 className="mb-3 border-l-4 border-orange-500 pl-3 text-sm font-bold text-gray-800">
                  Amenities
                </h3>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                    {displayText(amenities)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* =================================================
              NO DATA
          ================================================= */}

          {!loading && !error && !vehicle && (
            <div className="flex min-h-[250px] items-center justify-center text-center">
              <div>
                <p className="font-semibold text-gray-600">
                  No vehicle details found
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Vehicle information is not available.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagerModel;
