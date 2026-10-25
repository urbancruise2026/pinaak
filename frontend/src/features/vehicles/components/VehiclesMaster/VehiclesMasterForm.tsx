"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, CheckCircle2,  Bus,
  Armchair,
  Settings2,
  FileText,
  Sparkles,
  type LucideIcon, } from "lucide-react";
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

const LABEL = "block mb-2 text-sm font-semibold text-slate-800";

// FIX 1: z-0 -> z-10, taaki select/dropdown hamesha neeche ke fields ke upar rahe
const STACK = "relative z-10 focus-within:z-40 lg:col-span-2";
const SELECT_WRAP = `${STACK} [&_label]:block [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800`;

const inputClass =
  "w-full min-h-[48px] py-3 pl-11 pr-4 text-sm text-gray-800 bg-white border rounded-lg outline-none transition placeholder:text-gray-400 border-indigo-300 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200";

const variantOptions: FilterOption[] = VARIANT_OPTIONS.map((v) => ({
  code: v.code,
  label: v.code,
}));

// FIX 2: outer div ko "relative z-0" diya, taaki andar ke relative elements bahar leak na hon
const Field: React.FC<{
  label: string;
  Icon: LucideIcon;
  top?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ label, Icon, top, className = "", children }) => (
  <div className={`relative z-0 ${className}`}>
    <label className={LABEL}>{label}</label>
    <div className="relative">
      <Icon
        size={19}
        className={`absolute left-3 text-indigo-500 pointer-events-none ${
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

  const setField = (name: string, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setField(e.target.name, e.target.value);

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
  ) => (
    <div className={SELECT_WRAP}>
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
    <Field label={label} Icon={Icon} className="lg:col-span-2">
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
      className="sm:col-span-1 lg:col-span-3"
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
        <div className="flex items-center gap-2 p-4 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
          <AlertCircle size={20} className="shrink-0" />
          <span className="font-medium">{validationError || createError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <div className="p-7 md:p-8 border-2 rounded-xl bg-indigo-50/70 border-indigo-300">
          <h3 className="flex items-center gap-3 pb-4 mb-7 text-xl font-semibold text-indigo-900 border-b border-indigo-200">
            <span className="flex items-center justify-center w-10 h-10 text-white bg-indigo-600 rounded-lg">
              <Bus size={21} />
            </span>
            Add New Vehicle Type
          </h3>

          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-6">
            {textField("Seat", "seat", Armchair, "e.g., 9")}
            {textField("Config", "config", Settings2, "e.g., 1x1")}
            {selectField("Category", "category", CATEGORY_OPTIONS)}
            {selectField("Make", "make", MAKE_OPTIONS)}
            {selectField("Model", "model", MODEL_OPTIONS)}

            <div className={STACK}>
              <label className={LABEL}>Variant</label>
              <MultiSelectFilter
                title="Select Variant"
                options={variantOptions}
                selected={selectedVariants}
                onChange={setSelectedVariants}
              />
            </div>

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

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={creating}
            className="px-9 py-3 text-sm font-semibold text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Saving..." : "Register Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;