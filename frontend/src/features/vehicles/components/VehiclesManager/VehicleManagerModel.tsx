"use client";

import React from "react";
import {
  X,
  Loader2,
  Car,
  Hash,
  Armchair,
  Tag,
  Layers,
  Settings2,
  FileText,
  MapPin,
  Building2,
  Warehouse,
  CalendarDays,
  Clock,
  ShieldCheck,
  Sparkles,
  Info,
  Users,
} from "lucide-react";
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

type SectionTheme = {
  card: string;
  header: string;
  title: string;
  iconWrap: string;
};

// =====================================================
// THEMES (section wise colors)
// =====================================================

const THEMES: Record<"blue" | "cyan" | "purple", SectionTheme> = {
  blue: {
    card: "border-blue-200 bg-blue-50/40",
    header: "border-blue-200 bg-blue-50",
    title: "text-blue-900",
    iconWrap: "bg-blue-100 text-blue-600",
  },
  cyan: {
    card: "border-cyan-200 bg-cyan-50/40",
    header: "border-cyan-200 bg-cyan-50",
    title: "text-cyan-900",
    iconWrap: "bg-cyan-100 text-cyan-600",
  },
  purple: {
    card: "border-purple-200 bg-purple-50/40",
    header: "border-purple-200 bg-purple-50",
    title: "text-purple-900",
    iconWrap: "bg-purple-100 text-purple-600",
  },
};

// =====================================================
// SECTION CARD
// =====================================================

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  theme: keyof typeof THEMES;
  children: React.ReactNode;
}> = ({ title, icon, theme, children }) => {
  const t = THEMES[theme];

  return (
    <div className={`mb-4 overflow-hidden rounded-xl border ${t.card}`}>
      <div
        className={`flex items-center gap-2.5 border-b px-5 py-3.5 ${t.header}`}
      >
        <span className={t.title}>{icon}</span>
        <h3 className={`text-base font-bold ${t.title}`}>{title}</h3>
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
};

// =====================================================
// DETAIL FIELD (icon circle + label + value)
// =====================================================

const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  theme: keyof typeof THEMES;
  value?: DetailValue;
  children?: React.ReactNode;
}> = ({ label, icon, theme, value, children }) => {
  const t = THEMES[theme];

  const displayValue =
    value !== undefined && value !== null && String(value).trim() !== ""
      ? String(value)
      : "—";

  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="break-words text-sm font-bold text-slate-900">
          {children ?? displayValue}
        </div>
      </div>
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

  const directValue = getFromObject(root, keys);

  if (
    directValue !== null &&
    directValue !== undefined &&
    String(directValue).trim() !== ""
  ) {
    return directValue;
  }

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
    return "—";
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
    return "—";
  }

  const rawValue = String(value).trim();

  const numericValue = Number(rawValue);

  if (Number.isNaN(numericValue)) {
    return rawValue;
  }

  if (numericValue < 0) {
    return "—";
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
// AMENITIES PARSER
// =====================================================

const parseAmenities = (value: DetailValue): string[] =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// =====================================================
// STATUS BADGE STYLES
// =====================================================

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "suspended":
      return { badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" };
    case "blocked":
      return { badge: "bg-red-100 text-red-700", dot: "bg-red-500" };
    default:
      return { badge: "bg-green-100 text-green-700", dot: "bg-green-500" };
  }
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

  const amenitiesList = parseAmenities(amenities);

  const statusText =
    status && String(status).trim() !== "" ? String(status) : "Active";

  const statusStyle = getStatusStyle(statusText);

  const hasCode = code && String(code).trim() !== "" && code !== "-";

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-manager-modal-title"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Car size={30} />
            </div>

            <div className="min-w-0">
              <h2
                id="vehicle-manager-modal-title"
                className="truncate text-xl font-extrabold text-slate-900"
              >
                {hasCode ? String(code) : "Vehicle Manager Details"}
              </h2>

              <p className="truncate text-sm text-slate-500">
                Vehicle ID: {vehicleId ?? "—"}
                {category ? ` · ${String(category)}` : ""}
              </p>

              {vehicle && !loading && !error && (
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                    />
                    {statusText}
                  </span>

                  {variant && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {String(variant)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Close vehicle details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5">
          {/* LOADING */}

          {loading && (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <Loader2 size={30} className="animate-spin text-indigo-500" />

              <p className="text-sm font-semibold text-slate-500">
                Loading vehicle details...
              </p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-semibold text-red-700">{error}</p>
            </div>
          )}

          {/* DATA */}

          {!loading && !error && vehicle && (
            <>
              {/* VEHICLE DETAILS */}

              <Section
                title="Vehicle Details"
                theme="blue"
                icon={<Info size={18} />}
              >
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field
                    label="Vehicle ID"
                    theme="blue"
                    icon={<Hash size={18} />}
                    value={vehicleId}
                  />

                  <Field
                    label="Code"
                    theme="blue"
                    icon={<Tag size={18} />}
                    value={code}
                  />

                  <Field
                    label="Seater"
                    theme="blue"
                    icon={<Armchair size={18} />}
                    value={seat}
                  />

                  <Field
                    label="Category"
                    theme="blue"
                    icon={<Layers size={18} />}
                    value={category}
                  />

                  <Field
                    label="Variant"
                    theme="blue"
                    icon={<Car size={18} />}
                    value={variant}
                  />

                  <Field
                    label="Config"
                    theme="blue"
                    icon={<Settings2 size={18} />}
                    value={config}
                  />

                  <Field
                    label="Vehicle Number"
                    theme="blue"
                    icon={<FileText size={18} />}
                    value={vehicleNumber}
                  />
                </div>
              </Section>

              {/* MANAGER DETAILS */}

              <Section
                title="Manager Details"
                theme="cyan"
                icon={<Users size={18} />}
              >
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field
                    label="City"
                    theme="cyan"
                    icon={<MapPin size={18} />}
                    value={city}
                  />

                  <Field
                    label="Vendor"
                    theme="cyan"
                    icon={<Building2 size={18} />}
                    value={vendor}
                  />

                  <Field
                    label="Garage"
                    theme="cyan"
                    icon={<Warehouse size={18} />}
                    value={garage}
                  />

                  <Field
                    label="Registration Date"
                    theme="cyan"
                    icon={<CalendarDays size={18} />}
                    value={formatDate(registrationDate)}
                  />

                  <Field label="Aging" theme="cyan" icon={<Clock size={18} />}>
                    {formatAging(aging)}
                  </Field>

                  <Field
                    label="Status"
                    theme="cyan"
                    icon={<ShieldCheck size={18} />}
                    value={status}
                  />
                </div>
              </Section>

              {/* AMENITIES */}

              <Section
                title="Amenities"
                theme="purple"
                icon={<Sparkles size={18} />}
              >
                {amenitiesList.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-500">—</p>
                ) : (
                  <>
                    <p className="mb-3 text-xs font-semibold text-purple-700">
                      {amenitiesList.length} amenities
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {amenitiesList.map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="rounded-full border border-purple-200 bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </Section>
            </>
          )}

          {/* NO DATA */}

          {!loading && !error && !vehicle && (
            <div className="flex min-h-[250px] items-center justify-center text-center">
              <div>
                <p className="font-semibold text-slate-600">
                  No vehicle details found
                </p>

                <p className="mt-1 text-sm text-slate-400">
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
