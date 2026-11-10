"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  CheckCircle2,
  Bus,
  Armchair,
  Settings2,
  FileText,
  Sparkles,
  X,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import { createVehicle } from "@/features/vehicles/vehicleSlice";
import { Vehicle } from "@/types/types";

// ⚠️ Path apne project ke structure ke hisab se sahi karo
import SearchableSelect from "@/components/ui/SearchableSelect";
import MultiSelectFilter, {
  FilterOption,
} from "@/components/ui/MultiSelectFilter";

import {
  MAKE_OPTIONS,
  CATEGORY_OPTIONS,
  MODEL_OPTIONS,
  VARIANT_OPTIONS,
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

const variantOptions: FilterOption[] = VARIANT_OPTIONS.map((v) => ({
  code: v.code,
  label: v.code,
}));

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
        size={18}
        className={`absolute left-3.5 text-indigo-500 pointer-events-none ${
          top ? "top-3.5" : "top-1/2 -translate-y-1/2"
        }`}
      />
      {children}
    </div>
  </div>
);

const VehicleForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { creating, createError } = useSelector(
    (state: RootState) => state.vehicle,
  );

  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Active field sabse upar, baaki apni row ke base layer par
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setField(e.target.name, e.target.value);

  const removeVariant = (code: string) =>
    setSelectedVariants((prev) => prev.filter((v) => v !== code));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedVariants.length) {
      setValidationError("Please select at least one variant.");
      return;
    }
   
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

    const payload = {
      code,
      seat,
      category,
      make,
      variant: selectedVariants.join(","),
      description,
      amenities,
      config,
      model,
    } as Vehicle;

    try {
      await dispatch(createVehicle(payload)).unwrap();
      setFormData(emptyForm);
      setSelectedVariants([]);
      setIsSuccess(true);
    } catch (err) {
      console.error("❌ Failed to save vehicle:", err);
    }
  };

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      setIsSuccess(false);
      onSuccess?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [isSuccess, onSuccess]);

  const selectField = (
    label: string,
    name: "category" | "make" | "model",
    options: any[],
    wrapClass: string,
    base: number,
  ) => (
    <div className={`${wrapClass} ${SELECT_LABEL}`} {...layer(name, base)}>
      <SearchableSelect
        label={label}
        name={name}
        value={formData[name]}
        options={options}
        onChange={setField}
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
    <Field
      label={label}
      Icon={Icon}
      className={ROW_1}
      wrapProps={layer(name, 30)}
    >
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
      className={`${ROW_3} sm:col-span-1 lg:col-span-3`}
      wrapProps={layer(name, 10)}
    >
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        rows={4}
        className={`${inputClass} resize-none min-h-[112px]`}
        placeholder={placeholder}
      />
    </Field>
  );

  return (
    <div className="w-full">
      {isSuccess && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4 shadow-lg">
          <CheckCircle2 className="text-green-600" size={22} />
          <span className="font-semibold text-green-700">
            Vehicle registered successfully!
          </span>
        </div>
      )}

      {(validationError || createError) && (
        <div
          role="alert"
          className="flex items-center gap-2.5 px-4 py-3 mb-5 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span className="font-medium">{validationError || createError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
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
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white transition bg-indigo-600 rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating && <Loader2 size={16} className="animate-spin" />}
            {creating ? "Saving..." : "Register vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
