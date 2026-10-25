"use client";

import React, { useEffect, useState, useCallback} from "react";
import Image from "next/image";
import { CheckCircle2, XCircle,  Hash,
  Tag,
  Car,
  CalendarDays,
  Warehouse,
  MapPin,
  Building2,
  Sparkles,
  type LucideIcon, } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import SearchableSelect from "@/components/ui/SearchableSelect";
import type { AppDispatch, RootState } from "@/store/store";
import {
  createVehicleManager,
  getVehicleMasterCodes,
  getVehicleMasterVariants,
  getVehicleManagerVendors,
  getAllCities,
} from "../../vehicleManagerSlice";
import { AMENITIES_OPTIONS } from "../VehiclesMaster/vehicleMasterDropdown";
import FormPageHeader from "@/components/ui/PageHeader/FormPageHeader";


interface VehicleFormData {
  code: string;
  vendor: string;
  model: string;
  veh_no: string;
  reg_date: string;
  garage: string;
  aging: string;
  amenities: string;
  city: string;
  variant: string;
}

type CreatePayload = Parameters<typeof createVehicleManager>[0];

interface SectionTheme {
  section: string;
  heading: string;
  badge: string;
  icon: string;
  field: string;
}

const THEMES: Record<"basic" | "amenities", SectionTheme> = {
  basic: {
    section: "bg-violet-50/70 border-violet-300",
    heading: "text-violet-900 border-violet-200",
    badge: "bg-violet-600",
    icon: "text-violet-500",
    field:
      "border-violet-300 hover:border-violet-400 focus:border-violet-600 focus:ring-2 focus:ring-violet-200",
  },
  amenities: {
    section: "bg-emerald-50/70 border-emerald-300",
    heading: "text-emerald-900 border-emerald-200",
    badge: "bg-emerald-600",
    icon: "text-emerald-500",
    field:
      "border-emerald-300 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200",
  },
};

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";
const LABEL = "block mb-1.5 text-sm font-semibold text-slate-800";
const SELECT_WRAP =
  "relative z-10 focus-within:z-40 [&_label]:block [&_label]:mb-1.5 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800";

const initialFormState: VehicleFormData = {
  code: "",
  vendor: "",
  model: "",
  veh_no: "",
  reg_date: "",
  garage: "",
  aging: "",
  amenities: "",
  city: "",
  variant: "",
};

const inputClass = (theme: SectionTheme) =>
  `w-full py-2.5 pl-10 pr-3 text-sm text-gray-800 bg-white border rounded-lg outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${theme.field}`;


const Section: React.FC<{
  theme: SectionTheme;
  Icon: LucideIcon;
  title: string;
  bodyClass?: string;
  children: React.ReactNode;
}> = ({ theme, Icon, title, bodyClass = GRID, children }) => (
  <div className={`p-5 border-2 rounded-xl ${theme.section}`}>
    <h3
      className={`flex items-center gap-3 pb-3 mb-5 text-lg font-semibold border-b ${theme.heading}`}
    >
      <span
        className={`flex items-center justify-center w-9 h-9 text-white rounded-lg ${theme.badge}`}
      >
        <Icon size={20} />
      </span>
      {title}
    </h3>
    <div className={bodyClass}>{children}</div>
  </div>
);

const Field: React.FC<{
  label: string;
  Icon: LucideIcon;
  theme: SectionTheme;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, Icon, theme, required, children }) => (
  <div className="relative z-0">
    <label className={LABEL}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon
        className={`absolute z-10 -translate-y-1/2 pointer-events-none left-3 top-1/2 ${theme.icon}`}
        size={18}
      />
      {children}
    </div>
  </div>
);

/* ================================================================
   MAIN
================================================================ */
const VehicleForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    vehicleMasterCodes,
    vehicleMasterVariants,
    vendors,
    codesLoading,
    variantsLoading,
    vendorsLoading,
    cities,
    citiesLoading,
  } = useSelector((state: RootState) => state.vehicleManager);

  const [formData, setFormData] = useState<VehicleFormData>(initialFormState);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getVehicleMasterCodes());
    dispatch(getVehicleManagerVendors());
    dispatch(getAllCities());
  }, [dispatch]);

  const setField = useCallback(
    (name: string, value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errorMsg) setErrorMsg(null);
    },
    [errorMsg],
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setField(e.target.name, e.target.value);

  const handleSelectChange = (name: string, value: string) => {
    setField(name, value);

    if (name === "code") {
      const matched = vehicleMasterCodes.find((item) => item.code === value);
      const amenityCodes = matched?.amenities
        ? matched.amenities
            .split(",")
            .map((a: string) => a.trim())
            .filter(Boolean)
        : [];

      setSelectedAmenities(amenityCodes);
      setFormData((prev) => ({ ...prev, code: value, variant: "" }));

      if (value) dispatch(getVehicleMasterVariants(value));
    }
  };

  const handleAmenityToggle = (code: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(code) ? prev.filter((a) => a !== code) : [...prev, code],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.code) {
      setErrorMsg("Please select a code first.");
      return;
    }
    if (!formData.variant) {
      setErrorMsg("Please select a variant.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amenities: selectedAmenities.join(","),
      };

      await dispatch(
        createVehicleManager(payload as unknown as CreatePayload),
      ).unwrap();

      setIsSuccess(true);
      setFormData(initialFormState);
      setSelectedAmenities([]);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: unknown) {
      const err = error as { message?: string } | string;
      setErrorMsg(
        typeof err === "string"
          ? err
          : err?.message || "Something went wrong while creating vehicle",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const T = THEMES;

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {isSuccess && (
        <div className="fixed right-5 top-5 z-[9999] flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4 shadow-lg">
          <CheckCircle2 className="text-green-600" size={22} />
          <span className="font-semibold text-green-700">
            Vehicle registered successfully!
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed right-5 top-5 z-[9999] flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 shadow-lg">
          <XCircle className="text-red-600" size={22} />
          <span className="font-semibold text-red-700">{errorMsg}</span>
        </div>
      )}

      <div className="sticky top-0 z-30">
        <FormPageHeader title="Add Vehicles Manager Details" />
      </div>

      <div className="w-full p-4 mx-auto my-6 bg-white rounded-lg shadow-xl md:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SECTION 1 — Basic Vehicle Information */}
          <Section theme={T.basic} Icon={Car} title="Basic Vehicle Information">
            <div className={SELECT_WRAP}>
              <SearchableSelect
                label="Code"
                name="code"
                value={formData.code}
                options={vehicleMasterCodes.map((item) => item.code)}
                onChange={handleSelectChange}
                loading={codesLoading}
                placeholder="Select Code"
                required
              />
            </div>

            <div className={SELECT_WRAP}>
              <SearchableSelect
                label="Vendor Name"
                name="vendor"
                value={formData.vendor}
                options={vendors.map((item) => item.name)}
                onChange={handleSelectChange}
                loading={vendorsLoading}
                placeholder="Select Vendor"
                required
              />
            </div>

            <Field label="Variant" Icon={Tag} theme={T.basic} required>
              <select
                name="variant"
                value={formData.variant}
                onChange={handleInputChange}
                disabled={!formData.code || variantsLoading}
                required
                className={inputClass(T.basic)}
              >
                <option value="">
                  {!formData.code
                    ? "Select Code First"
                    : variantsLoading
                      ? "Loading variants..."
                      : "Select Variant"}
                </option>
                {vehicleMasterVariants.map((item, index) => {
                  const clean = item.variant?.replace(/^"+|"+$/g, "").trim();
                  return (
                    <option key={`${clean}-${index}`} value={clean}>
                      {clean}
                    </option>
                  );
                })}
              </select>
            </Field>

            <Field label="Vehicle Number" Icon={Hash} theme={T.basic} required>
              <input
                type="text"
                name="veh_no"
                value={formData.veh_no}
                onChange={handleInputChange}
                className={inputClass(T.basic)}
                placeholder="e.g., MH01AB1234"
                required
              />
            </Field>

            <Field
              label="Registration Date"
              Icon={CalendarDays}
              theme={T.basic}
              required
            >
              <input
                type="date"
                name="reg_date"
                value={formData.reg_date}
                onChange={handleInputChange}
                className={inputClass(T.basic)}
                required
              />
            </Field>

            <Field label="Garage" Icon={Warehouse} theme={T.basic} required>
              <input
                type="text"
                name="garage"
                value={formData.garage}
                onChange={handleInputChange}
                className={inputClass(T.basic)}
                placeholder="e.g., Tata, Mahindra, Toyota"
                required
              />
            </Field>

            <Field label="City" Icon={MapPin} theme={T.basic}>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={citiesLoading}
                className={inputClass(T.basic)}
              >
                <option value="">
                  {citiesLoading ? "Loading cities..." : "Select City"}
                </option>
                {cities.length > 0
                  ? cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))
                  : !citiesLoading && (
                      <option disabled>No cities available</option>
                    )}
              </select>
            </Field>
          </Section>

          {/* SECTION 2 — Amenities */}
          <Section
            theme={T.amenities}
            Icon={Sparkles}
            title="Amenities"
            bodyClass="space-y-4"
          >
            {AMENITIES_OPTIONS.map((category) => (
              <div
                key={category.label}
                className="overflow-hidden bg-white border border-emerald-200 rounded-lg"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-200 bg-emerald-100">
                  <Building2 size={18} className={T.amenities.icon} />
                  <h4 className="text-base font-bold text-emerald-900">
                    {category.label}
                  </h4>
                </div>

                <div className="flex flex-col gap-4 p-4 md:flex-row bg-emerald-50/50">
                  <div className="w-full shrink-0 md:w-48 lg:w-56">
                    <div className="relative flex h-full min-h-[170px] items-center justify-center overflow-hidden rounded-lg border border-emerald-300 bg-white">
                      <Image
                        src={category.image}
                        alt={category.label}
                        fill
                        sizes="(max-width: 768px) 100vw, 224px"
                        priority
                        className="object-contain p-6 drop-shadow-2xl"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {category.options.map((item, index) => {
                        const isChecked = selectedAmenities.includes(item.code);
                        return (
                          <label
                            key={`${item.code}-${index}`}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 transition-all ${
                              isChecked
                                ? "border-emerald-600 bg-emerald-100 font-semibold text-emerald-900 shadow-sm"
                                : "border-emerald-200 bg-white text-gray-800 hover:border-emerald-400 hover:bg-emerald-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleAmenityToggle(item.code)}
                              className="w-5 h-5 border-gray-300 rounded shrink-0 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium">
                              {item.code} - {item.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Section>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSubmitting ? "Registering..." : "Register Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;