"use client";

import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  CheckCircle2,
  Bus,
=======
import { useDispatch } from "react-redux";
import {
  AlertCircle,
  CheckCircle2,
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
  Armchair,
  Settings2,
  FileText,
  Sparkles,
  X,
  Loader2,
  type LucideIcon,
} from "lucide-react";
<<<<<<< HEAD
import type { AppDispatch, RootState } from "@/store/store";
import { createVehicle } from "@/features/vehicles/vehicleSlice";
=======
import type { AppDispatch } from "@/store/store";
import {
  createVehicle,
  updateVehicle, // 👈 new thunk
} from "@/features/vehicles/vehicleSlice";
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
import { Vehicle } from "@/types/types";

import SearchableSelect from "@/components/ui/SearchableSelect";
import MultiSelectFilter, {
  FilterOption,
} from "@/components/ui/MultiSelectFilter";

import {
  MAKE_OPTIONS,
  CATEGORY_OPTIONS,
  VARIANT_OPTIONS,
  getModelsByMake,
} from "./vehicleMasterDropdown";

type FormState = Omit<Vehicle, "id">;

const emptyForm: FormState = {
  code: "",
  seat: "",
  category: "",
  make: "",
  variant: "",
  description: "",
  amenities: "",
  config: "",
  model: "",
  name: "",
  created_at: "",
};

<<<<<<< HEAD
const LABEL = "block mb-1.5 text-sm font-semibold text-slate-700";

/*
 * OVERLAP FIX
 * -----------
 * Jis field par user click/focus kare, uska wrapper inline z-index 100 le leta
 * hai (state se), baaki rows ke base layers: row1=30, row2=20, row3=10.
 * Inline style use kiya hai taaki Tailwind class purge/override ka issue na ho.
 */
const ROW_1 = "relative lg:col-span-2";
const ROW_2 = "relative lg:col-span-2";
const ROW_3 = "relative";

// SearchableSelect ke andar ka label hamare label style se match kare
const SELECT_LABEL =
  "[&_label]:block [&_label]:mb-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700";

const inputClass =
  "w-full min-h-[46px] py-2.5 pl-11 pr-4 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg shadow-sm outline-none transition placeholder:text-slate-400 hover:border-indigo-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100";
=======
const LABEL = "block mb-1.5 text-sm font-medium text-slate-600";

const ROW = "relative lg:col-span-2";

const SELECT_LABEL =
  "[&_label]:block [&_label]:mb-1.5 [&_label]:text-sm [&_label]:font-medium [&_label]:text-slate-600";

const inputClass =
  "w-full min-h-[44px] py-2.5 pl-10 pr-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none transition-colors placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-400";
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7

const variantOptions: FilterOption[] = VARIANT_OPTIONS.map((v) => ({
  code: v.code,
  label: v.code,
}));

<<<<<<< HEAD
=======
// Variant can come back as "A,B", '"A,B"' (JSON string) or '["A","B"]'
const parseVariants = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw !== "string" || !raw.trim()) return [];
  let value: unknown = raw;
  try {
    value = JSON.parse(raw);
  } catch {
    /* plain string */
  }
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
const Field: React.FC<{
  label: string;
  Icon: LucideIcon;
  top?: boolean;
  className?: string;
  wrapProps?: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
}> = ({ label, Icon, top, className = "", wrapProps, children }) => (
  <div className={className} {...wrapProps}>
    <label className={LABEL}>{label}</label>
    <div className="relative">
      <Icon
<<<<<<< HEAD
        size={18}
        className={`absolute left-3.5 text-indigo-500 pointer-events-none ${
=======
        size={17}
        className={`pointer-events-none absolute left-3.5 text-indigo-400 ${
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
          top ? "top-3.5" : "top-1/2 -translate-y-1/2"
        }`}
      />
      {children}
    </div>
  </div>
);

const VehicleForm: React.FC<{
  vehicle?: Vehicle | null;
  onSuccess?: () => void;
}> = ({ vehicle, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEdit = !!vehicle?.id;

  const [formData, setFormData] = useState<FormState>(() => {
    if (!vehicle) return emptyForm;
    const { id, ...rest } = vehicle as any;
    return { ...emptyForm, ...rest };
  });
  const [selectedVariants, setSelectedVariants] = useState<string[]>(() =>
    parseVariants(vehicle?.variant),
  );
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [active, setActive] = useState<string | null>(null);

<<<<<<< HEAD
  // Active field sabse upar, baaki apni row ke base layer par
=======
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
  const layer = (
    id: string,
    base: number,
  ): React.HTMLAttributes<HTMLDivElement> => ({
    style: { zIndex: active === id ? 100 : base },
    onMouseDownCapture: () => setActive(id),
    onFocusCapture: () => setActive(id),
  });

  const setField = (name: string, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSelectChange = (name: string, value: string) => {
  if (name === "make") {
    setFormData((prev) => ({
      ...prev,
      make: value,
      model: getModelsByMake(value).includes(prev.model) ? prev.model : "",
    }));
    return;
  }
  setField(name, value);
};

const modelOptions = getModelsByMake(formData.make);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setField(e.target.name, e.target.value);

  const removeVariant = (code: string) =>
    setSelectedVariants((prev) => prev.filter((v) => v !== code));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedVariants.length) {
      setSubmitError("Please select at least one variant.");
      return;
    }
<<<<<<< HEAD
   
    const {
      code,
      seat,
      category,
      make,
      description,
      amenities,
      config,
      model,
    } = formData;
=======

    const { seat, category, make, description, amenities, config, model } =
      formData;
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7

    const payload = {
      seat,
      category,
      make,
      variant: selectedVariants.join(","),
      description,
      amenities,
      config,
      model,
    } as Vehicle;

    setSaving(true);
    try {
      if (isEdit) {
        await dispatch(
          updateVehicle({ id: String(vehicle!.id), data: payload }),
        ).unwrap();
      } else {
        await dispatch(createVehicle(payload)).unwrap();
        setFormData(emptyForm);
        setSelectedVariants([]);
      }
      setIsSuccess(true);
    } catch (err: any) {
      setSubmitError(
        typeof err === "string" ? err : err?.message || "Failed to save vehicle",
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      setIsSuccess(false);
      onSuccess?.();
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const selectField = (
    label: string,
    name: "category" | "make" | "model",
    options: any[],
<<<<<<< HEAD
    wrapClass: string,
    base: number,
  ) => (
    <div className={`${wrapClass} ${SELECT_LABEL}`} {...layer(name, base)}>
=======
    base: number,
  ) => (
    <div className={`${ROW} ${SELECT_LABEL}`} {...layer(name, base)}>
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
      <SearchableSelect
        label={label}
        name={name}
        value={formData[name]}
        options={options}
        onChange={handleSelectChange}
        placeholder={`Select ${label}`}
      />
    </div>
  );

  const textField = (
    label: string,
    name: "seat" | "config",
    Icon: LucideIcon,
    placeholder: string,
  ) => (
<<<<<<< HEAD
    <Field
      label={label}
      Icon={Icon}
      className={ROW_1}
      wrapProps={layer(name, 30)}
    >
=======
    <Field label={label} Icon={Icon} className={ROW} wrapProps={layer(name, 30)}>
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
      <input
        type="text"
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={inputClass}
        placeholder={placeholder}
      />
    </Field>
  );

  const areaField = (
    label: string,
    name: "description" | "amenities",
    Icon: LucideIcon,
    placeholder: string,
  ) => (
    <Field
      label={label}
      Icon={Icon}
      top
<<<<<<< HEAD
      className={`${ROW_3} sm:col-span-1 lg:col-span-3`}
=======
      className="relative sm:col-span-1 lg:col-span-3"
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
      wrapProps={layer(name, 10)}
    >
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        rows={3}
        className={`${inputClass} min-h-[96px] resize-none`}
        placeholder={placeholder}
      />
    </Field>
  );

  return (
    <div className="w-full">
      {isSuccess && (
        <div className="fixed right-5 top-5 z-[9999] flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 shadow-md">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <span className="text-sm font-medium text-emerald-700">
            {isEdit
              ? "Vehicle updated successfully!"
              : "Vehicle registered successfully!"}
          </span>
        </div>
      )}

<<<<<<< HEAD
      {(validationError || createError) && (
        <div
          role="alert"
          className="flex items-center gap-2.5 px-4 py-3 mb-5 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span className="font-medium">{validationError || createError}</span>
=======
      <div className="mb-5 pr-10">
        <h3 className="text-lg font-semibold text-slate-800">
          {isEdit ? "Edit vehicle" : "Add new vehicle"}
        </h3>
        <p className="text-sm text-slate-500">
          Code is generated automatically from seat, category, config and make.
        </p>
      </div>

      {submitError && (
        <div
          role="alert"
          className="mb-5 flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <AlertCircle size={17} className="shrink-0" />
          <span className="font-medium">{submitError}</span>
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
<<<<<<< HEAD
        <div className="p-6 border rounded-2xl md:p-8 bg-gradient-to-b from-indigo-50/80 to-white border-indigo-200 shadow-sm">
          <div className="flex items-center gap-3 pb-5 mb-6 border-b border-indigo-100">
            <span className="flex items-center justify-center w-11 h-11 text-white bg-indigo-600 rounded-xl shadow-md shadow-indigo-200">
              <Bus size={22} />
            </span>
            <div>
              <h3 className="text-lg font-semibold leading-tight text-indigo-950">
                Add new vehicle type
              </h3>
              <p className="text-sm text-slate-500">
                Code is generated automatically from seat, category, config and
                make.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-6">
            {/* Row 1 */}
            {textField("Seat", "seat", Armchair, "e.g., 9")}
            {textField("Config", "config", Settings2, "e.g., 1x1")}
            {selectField("Category", "category", CATEGORY_OPTIONS, ROW_1, 30)}

            {/* Row 2 */}
            {selectField("Make", "make", MAKE_OPTIONS, ROW_2, 20)}
            {selectField("Model", "model", MODEL_OPTIONS, ROW_2, 20)}

            <div className={ROW_2} {...layer("variant", 20)}>
              <label className={LABEL}>Variant</label>
              <MultiSelectFilter
                title="Select Variant"
                options={variantOptions}
                selected={selectedVariants}
                onChange={setSelectedVariants}
              />
            </div>

            {/* Selected variant chips */}
            {selectedVariants.length > 0 && (
              <div className="relative z-10 flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-6">
                <span className="text-sm font-medium text-slate-500">
                  Selected variants:
                </span>
                {selectedVariants.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1.5 py-1 pl-3 pr-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full"
                  >
                    {v}
                    <button
                      type="button"
                      onClick={() => removeVariant(v)}
                      aria-label={`Remove ${v}`}
                      className="flex items-center justify-center w-4 h-4 transition rounded-full hover:bg-indigo-200"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Row 3 */}
            {areaField(
              "Description",
              "description",
              FileText,
              "e.g., FORCE TRAVELLER - RYL VIP 1x1",
            )}
            {areaField(
              "Highlights",
              "amenities",
              Sparkles,
              "e.g., With Cleaner Seat, Fridge, Washroom",
            )}
=======
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-6">
          {textField("Seat", "seat", Armchair, "e.g., 9")}
          {textField("Config", "config", Settings2, "e.g., 1x1")}
          {selectField("Category", "category", CATEGORY_OPTIONS, 30)}

          {selectField("Make", "make", MAKE_OPTIONS, 20)}
          {selectField("Model", "model", modelOptions, 20)}
          <div className={ROW} {...layer("variant", 20)}>
            <label className={LABEL}>Variant</label>
            <MultiSelectFilter
              title="Select Variant"
              options={variantOptions}
              selected={selectedVariants}
              onChange={setSelectedVariants}
            />
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
          </div>

          {selectedVariants.length > 0 && (
            <div className="relative z-10 flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-6">
              <span className="text-sm text-slate-500">Selected:</span>
              {selectedVariants.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-3 pr-1.5 text-xs font-medium text-indigo-600"
                >
                  {v}
                  <button
                    type="button"
                    onClick={() => removeVariant(v)}
                    aria-label={`Remove ${v}`}
                    className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-indigo-100"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {areaField(
            "Description",
            "description",
            FileText,
            "e.g., FORCE TRAVELLER - RYL VIP 1x1",
          )}
          {areaField(
            "Highlights",
            "amenities",
            Sparkles,
            "e.g., With Cleaner Seat, Fridge, Washroom",
          )}
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="submit"
<<<<<<< HEAD
            disabled={creating}
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white transition bg-indigo-600 rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating && <Loader2 size={16} className="animate-spin" />}
            {creating ? "Saving..." : "Register vehicle"}
=======
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving
              ? "Saving..."
              : isEdit
                ? "Update vehicle"
                : "Register vehicle"}
>>>>>>> 018e14f809b643ec446fe87f307acb18c7a522d7
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
