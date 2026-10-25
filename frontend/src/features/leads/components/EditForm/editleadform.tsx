"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  Calendar,
  X,
  GripVertical,
  Info,
  Luggage,
  Globe,
  CheckCircle,
} from "lucide-react";
import type { LeadRecord } from "@/types/types";
import { updateLead } from "@/features/leads/leadSlice";
import { AppDispatch, RootState } from "@/store/store";
import { getCountriesThunk } from "@/features/location/countrycodeSlice";
import { fetchVehicles } from "@/features/vehicles/vehicleSlice";
import { getAllCitiesThunk } from "@/features/location/travelcitySlice";
import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "@/features/location/stateSlice";

import {
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  OCCASION_OPTIONS,
  LOST_REASON_OPTIONS,
  TRIP_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  DEFAULT_VALUES,
} from "../../types/Editleads/editleaddata";
import {
  leadSchema,
  LeadFormData,
} from "../../types/Editleads/editleadschema";
import {
  calculateDays,
  calculateTotalBaggage,
  prepareLeadPayload,
  mapInitialDataToForm,
  calculateTotalVehicles,
} from "../../types/Editleads/editleadcalculations";
import FormPageHeader from "@/components/ui/PageHeader/FormPageHeader";

const EditLeadForm: React.FC<{
  initialData: LeadRecord;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({ initialData, onSuccess, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { countries } = useSelector((state: RootState) => state.country);
  const { vehicleCodes } = useSelector((state: RootState) => state.vehicle);
  const { travelcity } = useSelector((state: RootState) => state.travelcity);
  const { cities, statesForCity, citiesLoading, statesLoading } = useSelector(
    (state: RootState) => state.stateCity,
  );
  const { currentUser } = useSelector((state: RootState) => state.user);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema) as any,
    mode: "onChange",
    defaultValues: DEFAULT_VALUES as any,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    companyName: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState("");
  const [itineraryList, setItineraryList] = useState<string[]>([]);
  const [customerCategoryTypeValue, setCustomerCategoryTypeValue] =
    useState("");
  const [alternateCountryCode, setAlternateCountryCode] = useState("+91");
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const [isInitialized, setIsInitialized] = useState(false);

  const pendingStateRef = useRef<string | null>(null);
  const cityIdSetRef = useRef(false);

  const pickupDateTime = watch("pickupDateTime");
  const dropDateTime = watch("dropDateTime");
  const smallbaggage = watch("smallbaggage");
  const mediumbaggage = watch("mediumbaggage");
  const largebaggage = watch("largebaggage");
  const airportbaggage = watch("airportbaggage");
  const customerType = watch("customerType");
  const serviceType = watch("serviceType");
  const customerCity = watch("customerCity");
  const vehicles = watch("vehicles");
  const vehicle1Quantity = watch("vehicle1Quantity");
  const vehicle2 = watch("vehicle2");
  const vehicle2Quantity = watch("vehicle2Quantity");
  const vehicle3 = watch("vehicle3");
  const vehicle3Quantity = watch("vehicle3Quantity");

  const isIndia = selectedCountry === "India";

  useEffect(() => {
    dispatch(getCountriesThunk());
    dispatch(fetchAllCities());
    dispatch(fetchVehicles());
    dispatch(getAllCitiesThunk());
  }, [dispatch]);

  useEffect(() => {
    const total = calculateTotalBaggage(
      Number(smallbaggage) || 0,
      Number(mediumbaggage) || 0,
      Number(largebaggage) || 0,
      Number(airportbaggage) || 0,
    );
    setValue("totalbaggage", total);
  }, [smallbaggage, mediumbaggage, largebaggage, airportbaggage, setValue]);

  useEffect(() => {
    const days = calculateDays(serviceType, pickupDateTime, dropDateTime);
    setValue("days", days);
  }, [serviceType, pickupDateTime, dropDateTime, setValue]);

  useEffect(() => {
    const totalVehicles = calculateTotalVehicles(
      vehicles || "",
      vehicle1Quantity || 0,
      vehicle2 || "",
      vehicle2Quantity || 0,
      vehicle3 || "",
      vehicle3Quantity || 0,
    );
    setValue("requirementVehicle", totalVehicles);
  }, [
    vehicles,
    vehicle1Quantity,
    vehicle2,
    vehicle2Quantity,
    vehicle3,
    vehicle3Quantity,
    setValue,
  ]);

  useEffect(() => {
    if (!isInitialized) return;

    if (customerCity) {
      dispatch(fetchStatesByCity(customerCity));
    } else {
      dispatch(resetStatesForCity());
      setValue("state", "");
    }
  }, [customerCity, isInitialized, dispatch, setValue]);

  useEffect(() => {
    if (statesForCity?.length > 0 && initialData?.state) {
      setValue("state", initialData.state);
    }
  }, [statesForCity, initialData, setValue]);

  useEffect(() => {
    if (
      !cityIdSetRef.current &&
      initialData?.city_id &&
      Array.isArray(currentUser?.city_ids) &&
      currentUser.city_ids.length > 0
    ) {
      setValue("city_id", Number(initialData.city_id));
      cityIdSetRef.current = true;
    }
  }, [initialData, currentUser, setValue]);

  useEffect(() => {
    if (!initialData) return;
    if (!cities?.length || !travelcity?.length) return;
    if (isInitialized) return;

    const mapped = mapInitialDataToForm(initialData);

    setFormData(mapped.formData);
    setAlternateCountryCode(mapped.alternateCountryCode ?? "+91");
    setCustomerCategoryTypeValue(mapped.customerCategoryTypeValue ?? "");
    setItineraryList(mapped.itineraryList ?? []);

    const country =
      (initialData as any).countryName ??
      (initialData as any).customerCountry ??
      "";
    setSelectedCountry(country);

    Object.entries(mapped.setValues).forEach(([key, value]) => {
      setValue(key as keyof LeadFormData, value as any);
    });

    if (country) setValue("countryName" as any, country);
    if ((initialData as any).address)
      setValue("address", (initialData as any).address);

    const cityValue = (initialData as any).customerCity;
    const stateValue = (initialData as any).state ?? null;

    if (cityValue) {
      dispatch(resetStatesForCity());
      pendingStateRef.current = stateValue;
      setValue("customerCity", cityValue);
      dispatch(fetchStatesByCity(cityValue));
    }

    setIsInitialized(true);
    setTimeout(() => trigger(), 150);
  }, [
    initialData,
    cities,
    travelcity,
    isInitialized,
    setValue,
    trigger,
    dispatch,
  ]);

  useEffect(() => {
    if (pendingStateRef.current && statesForCity?.length > 0) {
      setValue("state", pendingStateRef.current);
      pendingStateRef.current = null;
    }
  }, [statesForCity, setValue]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setValue("customerCity", "");
    setValue("state", "");
    setValue("countryName" as any, country);
    setValue("customerCountry" as any, country);
    dispatch(resetStatesForCity());
  };

  const addItinerary = () => {
    if (currentItinerary.trim() && itineraryList.length < 25) {
      const newList = [...itineraryList, currentItinerary.trim()];
      setItineraryList(newList);
      setCurrentItinerary("");
      setValue("itinerary", newList);
    }
  };

  const removeItinerary = (index: number) => {
    const newList = itineraryList.filter((_, i) => i !== index);
    setItineraryList(newList);
    setValue("itinerary", newList);
  };

  const reorderItinerary = (from: number, to: number) => {
    const newList = [...itineraryList];
    const [removed] = newList.splice(from, 1);
    newList.splice(to, 0, removed);
    setItineraryList(newList);
    setValue("itinerary", newList);
  };

  const showToastMessage = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToastType(type);
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setTimeout(() => setSuccessMessage(""), 300);
    }, 3000);
  };

  const onSubmit: SubmitHandler<LeadFormData> = async (data) => {
    if (!initialData.id) {
      showToastMessage("Lead ID not found", "error");
      return;
    }
    setIsSubmitting(true);
    const payload = {
  ...prepareLeadPayload(data, formData, itineraryList, alternateCountryCode, initialData),
  city_id: data.city_id,
};

    try {
      await dispatch(
        updateLead({
          id: initialData.id,
          data: payload as Partial<LeadRecord>,
        }),
      ).unwrap();
      showToastMessage("Lead updated successfully!", "success");
      onSuccess?.();
    } catch (error: any) {
      showToastMessage(
        error?.message || "Failed to update lead. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Date helpers ──────────────────────────────────────────────────────────
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() + 2,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .slice(0, 16);
  const minDate = today.toISOString().slice(0, 16);

  const sortVehicleCodes = (codes: any[]) =>
    [...codes].sort((a, b) => {
      const numA = parseInt(a.code.match(/\d+/)?.[0] ?? "0");
      const numB = parseInt(b.code.match(/\d+/)?.[0] ?? "0");
      return numA !== numB ? numA - numB : a.code.localeCompare(b.code);
    });

  return (
    <div>
      {/* Toast */}
      {showSuccessToast && (
        <div className="fixed right-4 top-4 z-50 animate-slide-in-right">
          <div
            className={`${toastType === "error" ? "bg-red-50 border-red-500" : "bg-green-50 border-green-500"} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px]`}
          >
            <CheckCircle
              className={`${toastType === "error" ? "text-red-500" : "text-green-500"} w-5 h-5 flex-shrink-0 mt-0.5`}
            />
            <div className="flex-1">
              <p
                className={`${toastType === "error" ? "text-red-800" : "text-green-800"} font-medium`}
              >
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className={
                toastType === "error"
                  ? "text-red-600 hover:text-red-800"
                  : "text-green-600 hover:text-green-800"
              }
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Loading banner */}
      {!isInitialized && (
        <div className="flex items-center justify-center py-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3" />
          <span className="text-yellow-700 font-medium text-sm">
            Loading form data, please wait...
          </span>
        </div>
      )}

      {/* Header */}
      {/* Header */}
      <div className="sticky top-0 z-30">
        <div className="relative">
          <FormPageHeader title="Edit Lead Form" />

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="absolute right-4 top-3 z-50 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      {/* Form */}
      <div className="p-6 mx-auto bg-white shadow-xl rounded-lg">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
          {/* ════════════════════════ SECTION 1 — Enquiry Information ════════════════════════ */}
          <div className="border rounded-xl p-6 bg-blue-50">
            <h3 className="text-xl font-semibold text-blue-800 mb-6 pb-3 border-b">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">
                1
              </span>
              Enquiry Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Lead Date */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Lead Date & Time
                </label>
                <div className="relative">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <input
                    type="datetime-local"
                    {...register("date")}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                  />
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-800"
                    size={20}
                  />
                </div>
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Source */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Source
                </label>
                <div className="relative">
                  <select
                    {...register("source")}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                  >
                    <option value="">Select Source Type</option>
                    {SOURCE_OPTIONS.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    {...register("status")}
                    className="w-full py-2 border bg-white px-10 border-gray-300 rounded-md"
                  >
                    <option value="">Select Status</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Branch City */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  City
                </label>
                <div className="relative group">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <select
                    {...register("city_id", {
                      valueAsNumber: true,
                      required: "City is required",
                    })}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select City</option>
                    {Array.isArray(currentUser?.city_ids) &&
                    currentUser.city_ids.length > 0 ? (
                      currentUser.city_ids.map((id: number, index: number) => (
                        <option key={id} value={id}>
                          {Array.isArray(currentUser?.city_names) &&
                          currentUser.city_names[index]
                            ? currentUser.city_names[index]
                            : `City ${id}`}
                        </option>
                      ))
                    ) : (
                      <option disabled>No cities available</option>
                    )}
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                    size={20}
                  />
                </div>
                {errors.city_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.city_id.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ════════════════════════ SECTION 2 — Customer Information ════════════════════════ */}
          <div className="border rounded-xl p-6 bg-green-50">
            <h3 className="text-xl font-semibold text-green-800 mb-6 pb-3 border-b">
              <span className="bg-green-600 text-white px-3 py-1 rounded-md mr-2">
                2
              </span>
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFieldChange}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                    placeholder="Enter first name"
                    required
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Middle Name
                </label>
                <div className="relative">
                  <input
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleFieldChange}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                    placeholder="Enter middle name"
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFieldChange}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                    placeholder="Enter last name"
                    required
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Phone India */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Phone No. (India) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <div className="bg-gray-100 px-2 py-2 text-sm font-medium min-w-[100px]">
                    +91 IND
                  </div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleFieldChange}
                    placeholder="Enter phone number"
                    className="w-full py-2 px-3 outline-none"
                    maxLength={10}
                    required
                  />
                  <Phone
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Phone Other */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Phone No. (Other)
                </label>
                <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <select
                    value={alternateCountryCode}
                    onChange={(e) => setAlternateCountryCode(e.target.value)}
                    className="bg-gray-100 px-2 py-2 outline-none text-sm cursor-pointer min-w-[100px]"
                  >
                    <option value="">Select</option>
                    {countries.map((code) => (
                      <option key={code.id} value={code.country_code}>
                        {code.country_code} {code.phone_code}
                      </option>
                    ))}
                  </select>
                  <input
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleFieldChange}
                    placeholder="Enter phone number"
                    className="w-full py-2 px-3 outline-none"
                  />
                  <Phone
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange}
                    placeholder="Enter email address"
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                  />
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <input
                    name="companyName"
                    value={
                      formData.companyName === "C" ? "" : formData.companyName
                    }
                    onChange={handleFieldChange}
                    placeholder="Enter company name"
                    disabled={customerType === "Personal"}
                    className={`w-full py-2 border px-12 border-gray-300 rounded-md ${customerType === "Personal" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                  />
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Customer Category */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register("customerType")}
                    onChange={(e) => {
                      register("customerType").onChange(e);
                      if (e.target.value === "Personal")
                        setFormData((prev) => ({ ...prev, companyName: "C" }));
                      else if (formData.companyName === "C")
                        setFormData((prev) => ({ ...prev, companyName: "" }));
                      setCustomerCategoryTypeValue("");
                      setValue("customerCategoryType", "");
                    }}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                  >
                    <option value="">Select Customer Category</option>
                    <option value="Personal">Personal</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Travel Agent">Agent</option>
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
                {errors.customerType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerType.message}
                  </p>
                )}
              </div>

              {/* Customer Sub-type */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Type
                </label>
                <div className="relative">
                  <select
                    {...register("customerCategoryType")}
                    value={customerCategoryTypeValue}
                    onChange={(e) => {
                      register("customerCategoryType").onChange(e);
                      setCustomerCategoryTypeValue(e.target.value);
                    }}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                  >
                    <option value="">Select Customer Type</option>
                    {customerType &&
                      CATEGORY_OPTIONS[customerType]?.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Country Name
                </label>
                <div className="relative">
                  <select
                    {...register("countryName")}
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="">Select Country</option>
                    {countries
                      .slice()
                      .sort((a, b) => {
                        if (a.country_name === "India") return -1;
                        if (b.country_name === "India") return 1;
                        return a.country_name.localeCompare(b.country_name);
                      })
                      .map((country) => (
                        <option key={country.id} value={country.country_name}>
                          {country.country_name}
                        </option>
                      ))}
                  </select>
                  <Globe
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                    size={20}
                  />
                </div>
                {errors.countryName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.countryName.message}
                  </p>
                )}
              </div>

              {/* ── Customer City (India only) ────────────────────────────────────────────
                  cities → fetchAllCities (stateSlice) se aata hai
                  value: city.cityName (string) — fetchStatesByCity mein yahi pass hota hai
              ─────────────────────────────────────────────────────────────────────────── */}
              {isIndia && (
                <div>
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Customer City
                  </label>
                  <div className="relative">
                    <Info
                      size={15}
                      className="absolute -top-4 right-0 text-blue-500 cursor-help z-10"
                    />
                    <select
                      {...register("customerCity")}
                      className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md"
                    >
                      <option value="">
                        {citiesLoading
                          ? "Loading cities..."
                          : "Select Customer City"}
                      </option>
                      {cities?.map((city) => (
                        <option
                          key={city.id || city.uuid}
                          value={city.cityName}
                        >
                          {city.cityName}
                        </option>
                      ))}
                    </select>
                    <Globe
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                      size={20}
                    />
                  </div>
                </div>
              )}

              {isIndia && (
                <div>
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Customer State
                  </label>
                  <div className="relative">
                    <Info
                      size={15}
                      className="absolute -top-4 right-0 text-blue-500 cursor-help z-10"
                    />
                    <select
                      {...register("state")}
                      disabled={!customerCity}
                      className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md disabled:bg-gray-100"
                    >
                      <option value="">
                        {statesLoading ? "Loading states..." : "Select State"}
                      </option>
                      {statesForCity?.map((state) => (
                        <option key={state.id} value={state.stateName}>
                          {state.stateName}
                        </option>
                      ))}
                    </select>
                    <Globe
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                      size={20}
                    />
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="w-full md:col-span-2">
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Address
                </label>
                <textarea
                  {...register("address")}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter complete customer address"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* ════════════════════════ SECTION 3 — Travel Requirements ════════════════════════ */}
          <div className="p-6 border rounded-xl bg-purple-50">
            <h3 className="relative pb-3 mb-6 text-xl font-semibold text-purple-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-purple-600 rounded-md">
                3
              </span>
              Travel Requirements
            </h3>

            {/* Travel Dates */}
            <div className="p-4 mb-6 bg-white border rounded-lg">
              <span className="mb-3 font-extrabold text-purple-600 text-md">
                Travel Dates
              </span>
              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Pickup DateTime */}
                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Pickup Date & Time{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          {...register("pickupDateTime")}
                          min={minDate}
                          max={maxDate}
                          className="w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                        />
                        <Calendar
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                      {errors.pickupDateTime && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.pickupDateTime.message}
                        </p>
                      )}
                    </div>

                    {/* Pickup City — travelcity (getAllCitiesThunk) se */}
                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Pickup City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...register("pickupcity")}
                          className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-md bg-white"
                        >
                          <option value="">
                            {travelcity?.length === 0
                              ? "Loading..."
                              : "Select Pickup City"}
                          </option>
                          {travelcity?.map((city) => (
                            <option
                              key={city.id ?? city.uuid}
                              value={city.cityName}
                            >
                              {city.cityName}
                            </option>
                          ))}
                        </select>
                        <MapPin
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                      {errors.pickupcity && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.pickupcity.message}
                        </p>
                      )}
                    </div>

                    {/* Pickup Address */}
                    <div className="w-full md:w-[30%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Pickup Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register("pickupAddress")}
                          className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                          placeholder="Enter pickup address"
                        />
                        <MapPin
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                      {errors.pickupAddress && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.pickupAddress.message}
                        </p>
                      )}
                    </div>

                    {/* Additional Pickup */}
                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Additional Pickup Addresses
                      </label>
                      <div className="relative">
                        <input
                          {...register("multiplepickup")}
                          className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                          placeholder="Enter Multiple Pickup"
                        />
                        <MapPin
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                    </div>

                    {/* No. of Days */}
                    <div className="w-full md:w-[10%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        No. of Days <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          {...register("days", { valueAsNumber: true })}
                          readOnly={serviceType === "Pick & Drop"}
                          className={`w-full ${serviceType === "Pick & Drop" ? "bg-purple-400" : "bg-purple-600"} text-white font-extrabold text-2xl py-2 text-center border border-gray-300 rounded-md`}
                          placeholder="Days"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold text-xs">
                          days
                        </span>
                      </div>
                      {errors.days && (
                        <p className="mt-1 text-sm text-red-500 text-center">
                          {errors.days.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap gap-4">
                    {/* Drop DateTime */}
                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Drop Date & Time
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          {...register("dropDateTime")}
                          min={pickupDateTime || minDate}
                          max={maxDate}
                          className="w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                        />
                        <Calendar
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                    </div>

                    {/* Drop City — travelcity se */}
                    <div className="w-full md:w-[15%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Drop City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...register("dropcity")}
                          className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-md bg-white"
                        >
                          <option value="">
                            {travelcity?.length === 0
                              ? "Loading..."
                              : "Select Drop City"}
                          </option>
                          {travelcity?.map((city) => (
                            <option
                              key={city.id ?? city.uuid}
                              value={city.cityName}
                            >
                              {city.cityName}
                            </option>
                          ))}
                        </select>
                        <MapPin
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                      {errors.dropcity && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.dropcity.message}
                        </p>
                      )}
                    </div>

                    {/* Drop Address */}
                    <div className="w-full md:w-[30%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Drop Address
                      </label>
                      <input
                        {...register("dropAddress")}
                        className="w-full py-2 px-3 border border-gray-300 rounded-md"
                        placeholder="Address"
                      />
                    </div>

                    {/* Additional Drop */}
                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Additional Drop Addresses
                      </label>
                      <div className="relative">
                        <input
                          {...register("multipledrop")}
                          className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                          placeholder="Enter Multiple Drop"
                        />
                        <MapPin
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                    </div>

                    {/* Service Type */}
                    <div className="w-full md:w-[15%]">
                      <label className="block text-md font-extrabold text-gray-700 mb-1">
                        Service
                      </label>
                      <select
                        {...register("serviceType")}
                        onChange={(e) => {
                          register("serviceType").onChange(e);
                          if (e.target.value === "Pick & Drop")
                            setValue("days", 2);
                        }}
                        className="w-full py-2 border bg-white px-3 border-gray-300 rounded-md"
                      >
                        <option value="">Select</option>
                        {SERVICE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trip Type */}
                    {(serviceType === "Round Trip" ||
                      serviceType === "Round Trip Drop") && (
                      <div className="w-full md:w-[20%]">
                        <label className="block text-md font-extrabold text-gray-700 mb-1">
                          Trip Type
                        </label>
                        <div className="flex items-center gap-6 mt-2">
                          {TRIP_TYPE_OPTIONS.map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                value={opt}
                                {...register("tripType")}
                                className="accent-blue-500"
                              />
                              <span className="text-sm font-semibold">
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="p-4 mb-6 bg-white border rounded-lg">
              <span className="mb-6 font-extrabold text-purple-600 text-md">
                Itinerary Details
              </span>
              <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
                <div>
                  <label className="block mb-1 mt-6 font-extrabold text-gray-700 text-md">
                    Add Itinerary
                  </label>
                  <div className="relative">
                    <input
                      value={currentItinerary}
                      onChange={(e) => setCurrentItinerary(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addItinerary())
                      }
                      className="w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md"
                      placeholder="Enter itinerary item and press Enter"
                    />
                    <FileText
                      className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addItinerary}
                    className="mt-2 px-4 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Added Itineraries ({itineraryList.length}/25)
                  </label>
                  <div className="flex flex-wrap gap-2 overflow-y-auto max-h-32">
                    {itineraryList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-purple-800 bg-purple-100 rounded cursor-move"
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", idx.toString())
                        }
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const draggedIdx = parseInt(
                            e.dataTransfer.getData("text/plain"),
                          );
                          if (!isNaN(draggedIdx) && draggedIdx !== idx)
                            reorderItinerary(draggedIdx, idx);
                        }}
                      >
                        <GripVertical size={14} className="text-purple-600" />
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeItinerary(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Actual KM <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-[180px]">
                    <input
                      type="number"
                      {...register("km")}
                      className="w-full bg-purple-600 text-white font-extrabold text-2xl py-2 pl-6 text-center pr-10 border border-gray-300 rounded-md"
                      placeholder="KM"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold text-xs">
                      KM
                    </span>
                  </div>
                  {errors.km && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.km.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Occasion Type
                  </label>
                  <div className="relative">
                    <select
                      {...register("occasion")}
                      className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                    >
                      <option value="">Select Occasion Type</option>
                      {OCCASION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <FileText
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="p-6 mt-6 bg-white border rounded-xl">
              <span className="mb-3 font-extrabold text-purple-900 text-md">
                Passenger Details
              </span>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Total Passengers <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-[180px]">
                    <input
                      type="number"
                      {...register("passengerTotal", { valueAsNumber: true })}
                      className="w-full bg-purple-600 text-white font-extrabold text-2xl py-2 text-center border border-gray-300 rounded-md"
                      placeholder="Pax"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold text-xs">
                      Pax
                    </span>
                  </div>
                  {errors.passengerTotal && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.passengerTotal.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Number of Pets
                  </label>
                  <div className="relative max-w-[180px]">
                    <input
                      type="number"
                      {...register("petsNumber", { valueAsNumber: true })}
                      min="0"
                      className="w-full bg-red-600 text-white font-extrabold text-2xl py-2 text-center border border-gray-300 rounded-md"
                      placeholder="Pets"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold text-xs">
                      pets
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Pet Names
                  </label>
                  <div className="relative">
                    <input
                      {...register("petsNames")}
                      className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                      placeholder="Enter pet names"
                    />
                    <FileText
                      className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Baggage Details */}
            <div className="p-6 mt-6 bg-white border rounded-xl">
              <span className="mb-3 font-extrabold text-purple-900 text-md">
                Baggage Details
              </span>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mt-4">
                {(
                  [
                    "smallbaggage",
                    "mediumbaggage",
                    "largebaggage",
                    "airportbaggage",
                  ] as const
                ).map((baggage) => (
                  <div key={baggage}>
                    <label className="block mb-1 font-extrabold text-gray-700 text-md capitalize">
                      {baggage.replace("baggage", " Baggage")}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        {...register(baggage, { valueAsNumber: true })}
                        className="w-full py-2 bg-white pl-10 pr-3 border border-gray-300 rounded-md"
                        placeholder="0"
                        min="0"
                      />
                      <Luggage
                        className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                        size={16}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Total Baggage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register("totalbaggage", { valueAsNumber: true })}
                      readOnly
                      className="w-full bg-purple-600 text-white font-extrabold text-2xl py-2 pl-8 text-center pr-10 border border-gray-300 rounded-md"
                    />
                    <Luggage
                      className="absolute text-white -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-6 bg-white border rounded-xl mt-4">
              <span className="mb-3 font-extrabold text-purple-900 text-md">
                Vehicle Details (Optional)
              </span>
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  {
                    reg: "vehicles",
                    reg2: "vehicle1Quantity",
                    label: "Vehicle Type 1",
                    suffix: "",
                  },
                  {
                    reg: "vehicle2",
                    reg2: "vehicle2Quantity",
                    label: "Vehicle Type 2",
                    suffix: "type2",
                  },
                  {
                    reg: "vehicle3",
                    reg2: "vehicle3Quantity",
                    label: "Vehicle Type 3",
                    suffix: "type3",
                  },
                ].map(({ reg, reg2, label, suffix }) => (
                  <div key={reg} className="w-full md:w-[20%]">
                    <label className="block text-md font-extrabold text-gray-700 mb-1">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select
                          {...register(reg as any)}
                          className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                        >
                          <option value="">Select</option>
                          {sortVehicleCodes(vehicleCodes).map(
                            (v: any, i: number) => (
                              <option
                                key={`${v.code}-${suffix}-${i}`}
                                value={v.code}
                              >
                                {v.code}
                              </option>
                            ),
                          )}
                        </select>
                        <FileText
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                          size={20}
                        />
                      </div>
                      <input
                        type="number"
                        placeholder="Qty"
                        min="0"
                        className="w-20 py-2 border border-gray-300 rounded-md text-center"
                        {...register(reg2 as any, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                ))}
                <div className="w-full md:w-[35%]">
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Total Vehicle Requirement
                  </label>
                  <div className="relative">
                    <input
                      {...register("requirementVehicle")}
                      readOnly
                      className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md bg-gray-50"
                      placeholder="Auto-filled when vehicles selected"
                    />
                    <FileText
                      className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Remark
                </label>
                <div className="relative">
                  <textarea
                    {...register("remarks")}
                    rows={4}
                    placeholder="Enter your remark..."
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md resize-none"
                  />
                  <FileText
                    className="absolute left-3 top-3 text-green-600"
                    size={20}
                  />
                </div>
              </div>
            </div>

            {/* Lost Reason */}
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  LOST REASON
                </label>
                <div className="relative">
                  <select
                    {...register("lost_reason")}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                  >
                    <option value="">Select Lost Reason</option>
                    {LOST_REASON_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-3 text-green-600"
                    size={20}
                  />
                </div>
              </div>
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Lost Reason Details
                </label>
                <div className="relative">
                  <textarea
                    {...register("lostReasonDetails")}
                    rows={4}
                    placeholder="Enter lost reason details..."
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md resize-none"
                  />
                  <FileText
                    className="absolute left-3 top-3 text-green-600"
                    size={20}
                  />
                </div>
              </div>
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Follow Up
                </label>
                <div className="relative">
                  <textarea
  {...register("followUps.0.followup_remark")}
  rows={4}
  placeholder="Enter follow up notes..."
  className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md resize-none"
/>
                  <FileText
                    className="absolute left-3 top-3 text-green-600"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            {!isValid && Object.keys(errors).length > 0 && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-semibold mb-2">
                  Please fix the following errors:
                </p>
                <ul className="list-disc list-inside text-sm">
                  {Object.entries(errors)
                    .slice(0, 5)
                    .map(([key, error]: any) => (
                      <li key={key}>
                        <span className="font-semibold">{key}</span>:{" "}
                        {error?.message || "is invalid"}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !isInitialized}
              className={`w-full px-6 py-3 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting || !isInitialized
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 text-white hover:bg-blue-500"
              }`}
            >
              {isSubmitting
                ? "Updating..."
                : !isInitialized
                  ? "Loading..."
                  : "Update Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadForm;
