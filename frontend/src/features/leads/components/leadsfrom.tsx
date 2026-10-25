"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import { getAllCitiesThunk } from "@/features/location/travelcitySlice";
import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "@/features/location/stateSlice";
import {
  searchCustomersThunk,
  clearSearchResults,
} from "@/features/customers/newCustomerSlice";
import {
  createLead,
  checkCustomerPhone,
} from "@/features/leads/leadSlice";
import { getCountriesThunk } from "@/features/location/countrycodeSlice";
import { fetchVehicles } from "@/features/vehicles/vehicleSlice";
import { currentUserThunk } from "@/features/user/userSlice";
import FormPageHeader from "@/components/ui/PageHeader/FormPageHeader";

import { DEFAULT_VALUES } from "../types/Editleads/editleaddata";
import {
  EnquirySection,
  CustomerSection,
  CustomerSearch,
  TravelSection,
  SubmitSection,
  SuccessToast,
  schema,
  EMPTY_CUSTOMER,
} from "./leadForm";
import type { LeadFormData, CustomerFields } from "./leadForm";

const LeadsForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { countries } = useSelector((state: RootState) => state.country);
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Always have the latest currentUser available inside onSubmit
  const currentUserRef = React.useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Fetch current user if not available
  useEffect(() => {
    if (!currentUser) {
      dispatch(currentUserThunk());
    }
  }, [dispatch, currentUser]);

  const methods = useForm<LeadFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "-",
      pickupDateTime: new Date().toISOString().slice(0, 16),
      customerType: "Personal",
      date: new Date().toISOString().slice(0, 16),
      days: DEFAULT_VALUES.days,
      smallbaggage: DEFAULT_VALUES.smallbaggage,
      mediumbaggage: DEFAULT_VALUES.mediumbaggage,
      largebaggage: DEFAULT_VALUES.largebaggage,
      airportbaggage: DEFAULT_VALUES.airportbaggage,
      totalbaggage: DEFAULT_VALUES.totalbaggage,
      petsNumber: DEFAULT_VALUES.petsNumber,
      vehicles: "",
      vehicle2: "",
      vehicle3: "",
      vehicle1Quantity: "",
      vehicle2Quantity: "",
      vehicle3Quantity: "",
      requirementVehicle: "",
      serviceType: "",
      pickupAddress: "",
      pickupcity: "",
      passengerTotal: 0,
      km: "",
      presales_id: undefined,
    },
    mode: "onChange",
  });

  const { handleSubmit, setValue, watch, reset } = methods;

  // ---------- local (non react-hook-form) state ----------
  const [formData, setFormData] = useState<CustomerFields>(EMPTY_CUSTOMER);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState("");
  const [itineraryList, setItineraryList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [customerCategoryTypeValue, setCustomerCategoryTypeValue] =
    useState("");
  const [alternateCountryCode, setAlternateCountryCode] = useState("+91");

  // ---------- watched values used by effects ----------
  const pickupDateTime = watch("pickupDateTime");
  const dropDateTime = watch("dropDateTime");
  const smallbaggage = watch("smallbaggage");
  const mediumbaggage = watch("mediumbaggage");
  const largebaggage = watch("largebaggage");
  const airportbaggage = watch("airportbaggage");
  const customerCity = watch("customerCity");
  const serviceType = watch("serviceType");
  const vehicle1 = watch("vehicles");
  const vehicle2 = watch("vehicle2");
  const vehicle3 = watch("vehicle3");
  const qty1 = watch("vehicle1Quantity");
  const qty2 = watch("vehicle2Quantity");
  const qty3 = watch("vehicle3Quantity");

  // ---------- initial data ----------
  useEffect(() => {
    dispatch(getCountriesThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllCitiesThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllCities());
  }, [dispatch]);

  // Set presales_id from the logged-in user
  useEffect(() => {
    if (currentUser?.id) {
      setValue("presales_id", Number(currentUser.id), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [currentUser, setValue]);

  // Fetch states when city changes
  useEffect(() => {
    if (customerCity && customerCity !== "") {
      dispatch(fetchStatesByCity(customerCity));
    } else {
      dispatch(resetStatesForCity());
      setValue("state", "");
    }
  }, [customerCity, dispatch, setValue]);

  // Default country to India
  useEffect(() => {
    if (countries.length > 0) {
      const currentCountry = watch("countryName");
      if (!currentCountry) {
        const india = countries.find((c) => c.country_name === "India");
        if (india) setValue("countryName", "India");
      }
    }
  }, [countries, setValue, watch]);

  // Total baggage
  useEffect(() => {
    const total =
      (Number(smallbaggage) || 0) +
      (Number(mediumbaggage) || 0) +
      (Number(largebaggage) || 0) +
      (Number(airportbaggage) || 0);
    setValue("totalbaggage", total);
  }, [smallbaggage, mediumbaggage, largebaggage, airportbaggage, setValue]);

  // Number of days from service type + dates
  useEffect(() => {
    if (serviceType === "Pick & Drop") {
      setValue("days", 2);
      return;
    }
    if (serviceType === "One Way") {
      setValue("days", 1);
      setValue("dropcity", "");
      setValue("dropAddress", "");
      return;
    }
    if (pickupDateTime && dropDateTime) {
      const pickup = new Date(pickupDateTime.split("T")[0]);
      const drop = new Date(dropDateTime.split("T")[0]);
      const diffDays =
        (drop.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24);
      const totalDays = diffDays + 1;
      setValue("days", totalDays > 0 ? totalDays : 1);
    } else {
      setValue("days", 0);
    }
  }, [serviceType, pickupDateTime, dropDateTime, setValue]);

  // Combine vehicle requirements
  useEffect(() => {
    const vehiclesList: string[] = [];
    if (vehicle1 && vehicle1.trim() !== "" && qty1 && qty1.trim() !== "")
      vehiclesList.push(`${vehicle1} x ${qty1}`);
    if (vehicle2 && vehicle2.trim() !== "" && qty2 && qty2.trim() !== "")
      vehiclesList.push(`${vehicle2} x ${qty2}`);
    if (vehicle3 && vehicle3.trim() !== "" && qty3 && qty3.trim() !== "")
      vehiclesList.push(`${vehicle3} x ${qty3}`);
    setValue("requirementVehicle", vehiclesList.join(", "));
  }, [vehicle1, vehicle2, vehicle3, qty1, qty2, qty3, setValue]);

  // Set initial date
  useEffect(() => {
    setValue("date", new Date().toISOString().slice(0, 16));
  }, [setValue]);

  // Debounce customer search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search customers when debounced term changes
  useEffect(() => {
    if (debouncedTerm.length >= 2) {
      dispatch(searchCustomersThunk(debouncedTerm));
      setShowDropdown(true);
    } else if (debouncedTerm.length === 0) {
      dispatch(clearSearchResults());
      setShowDropdown(false);
    }
  }, [debouncedTerm, dispatch]);

  // ---------- handlers ----------
  const showToastMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setTimeout(() => setSuccessMessage(""), 300);
    }, 3000);
  };

  const closeToast = () => {
    setShowSuccessToast(false);
    setTimeout(() => setSuccessMessage(""), 300);
  };

  const handleCheckCustomerPhone = async (phone: string) => {
    try {
      const res = await dispatch(checkCustomerPhone(phone)).unwrap();
      if (res?.isExisting && res?.customer) {
        showToastMessage(`⚠ Customer already exists`);
      } else {
        showToastMessage("✅ New customer — number not found in database.");
      }
    } catch (err: any) {
      console.error(err);
      showToastMessage("Error checking customer phone. Try again.");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedTerm("");
    dispatch(clearSearchResults());
    setShowDropdown(false);
  };

  const handleFieldChange = (name: keyof CustomerFields, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const markFieldTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // "Personal" customers get the placeholder company "C" (stripped on submit)
  const handleCustomerCategoryChange = (value: string) => {
    if (value === "Personal") {
      setFormData((prev) => ({ ...prev, companyName: "C" }));
    } else if (formData.companyName === "C") {
      setFormData((prev) => ({ ...prev, companyName: "" }));
    }
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

  const resetFormFields = () => {
    setFormData(EMPTY_CUSTOMER);
    setItineraryList([]);
    setCurrentItinerary("");
    setCustomerCategoryTypeValue("");
    setAlternateCountryCode("+91");
    setSearchTerm("");
    setShowDropdown(false);

    // Always keep presales_id from currentUser when resetting
    const currentUserId = currentUserRef.current?.id
      ? Number(currentUserRef.current.id)
      : undefined;

    reset({
      status: "-",
      pickupDateTime: new Date().toISOString().slice(0, 16),
      customerType: "Personal",
      date: new Date().toISOString().slice(0, 16),
      source: "",
      presales_id: currentUserId,
      countryName: "India",
      serviceType: "",
      vehicle2: "",
      vehicles: "",
      vehicle3: "",
      vehicle3Quantity: "",
      vehicle2Quantity: "",
      vehicle1Quantity: "",
      occasion: "",
      dropDateTime: "",
      pickupAddress: "",
      multiplepickup: "",
      multipledrop: "",
      dropAddress: "",
      address: "",
      dropcity: "",
      pickupcity: "",
      passengerTotal: 0,
      days: 0,
      km: "",
      petsNumber: 0,
      petsNames: "",
      smallbaggage: 0,
      mediumbaggage: 0,
      largebaggage: 0,
      airportbaggage: 0,
      totalbaggage: 0,
      requirementVehicle: "",
      remarks: "",
      itinerary: [],
      tripType: "",
      city: "",
      customerCity: "",
      state: "",
      city_id: undefined,
    });
  };

  const handleSelectCustomer = (customer: any) => {
    const nameParts = customer.customerName?.split(" ") || [];
    setFormData({
      firstName: nameParts[0] || "",
      middleName: nameParts.slice(1, -1).join(" ") || "",
      lastName: nameParts[nameParts.length - 1] || "",
      phone: customer.customerPhone?.replace(/\D/g, "").slice(-10) || "",
      alternatePhone: customer.alternatePhone?.replace(/\D/g, "") || "",
      email: customer.customerEmail || "",
      companyName: customer.companyName || "",
    });

    if (customer.customerCity) setValue("customerCity", customer.customerCity);
    if (customer.state) setValue("state", customer.state);
    if (customer.address) setValue("address", customer.address);
    if (customer.countryName) setValue("countryName", customer.countryName);
    if (customer.customerType) setValue("customerType", customer.customerType);
    if (customer.customerCategoryType) {
      setValue("customerCategoryType", customer.customerCategoryType);
      setCustomerCategoryTypeValue(customer.customerCategoryType);
    }

    dispatch(clearSearchResults());
    setSearchTerm("");
    setShowDropdown(false);
  };

  // ==================== SUBMIT HANDLER ====================
  const onSubmit: SubmitHandler<LeadFormData> = async (data) => {
    setIsSubmitting(true);

    const latestUser = currentUserRef.current;

    // Check for id, _id, uuid or any other identifier field
    const userId =
      latestUser?.id || latestUser?._id || latestUser?.uuid || latestUser?.id;

    const finalPresalesId = userId
      ? Number(userId)
      : data.presales_id && !isNaN(Number(data.presales_id))
        ? Number(data.presales_id)
        : null;

    if (!finalPresalesId || isNaN(finalPresalesId)) {
      console.error(
        "presales_id is missing. currentUser:",
        latestUser,
        "form value:",
        data.presales_id,
      );
      showToastMessage(
        "Error: Presales user not assigned. Please refresh the page and try again.",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        date: data.date
          ? data.date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        enquiryTime: data.date ? `${data.date}:00` : new Date().toISOString(),
        source: data.source || "",
        status: data.status || "-",
        presales_id: finalPresalesId,
        firstName: formData.firstName || "",
        middleName: formData.middleName || "",
        lastName: formData.lastName || "",
        customerPhone: formData.phone ? `+91 ${formData.phone}` : "",
        alternatePhone: formData.alternatePhone
          ? `${alternateCountryCode} ${formData.alternatePhone}`
          : "",
        customerEmail: formData.email || "",
        companyName:
          formData.companyName === "C" ? "" : formData.companyName || "",
        customerType: data.customerType || "Personal",
        customerCategoryType: data.customerCategoryType || "",
        serviceType: data.serviceType || "",
        occasion: data.occasion || "",
        tripType: data.tripType || "",
        pickupDateTime: data.pickupDateTime
          ? `${data.pickupDateTime}:00`
          : null,
        dropDateTime: data.dropDateTime ? `${data.dropDateTime}:00` : null,
        pickupAddress: data.pickupAddress || "",
        multiplepickup: data.multiplepickup || "",
        multipledrop: data.multipledrop || "",
        dropAddress: data.dropAddress || "",
        address: data.address || "",
        pickupcity: data.pickupcity || "",
        dropcity: data.dropcity || "",
        itinerary: itineraryList || [],
        vehicles: data.vehicles || "",
        vehicle2: data.vehicle2 || "",
        vehicle3: data.vehicle3 || "",
        vehicle3Quantity: data.vehicle3Quantity || "",
        vehicle2Quantity: data.vehicle2Quantity || "",
        vehicle1Quantity: data.vehicle1Quantity || "",
        requirementVehicle: data.requirementVehicle || "",
        passengerTotal: data.passengerTotal || 0,
        days: Number(data.days) || 0,
        km: data.km
          ? typeof data.km === "string"
            ? parseInt(data.km) || 0
            : data.km
          : 0,
        petsNumber: Number(data.petsNumber) || 0,
        petsNames: data.petsNames || "",
        smallBaggage: Number(data.smallbaggage) || 0,
        mediumBaggage: Number(data.mediumbaggage) || 0,
        largeBaggage: Number(data.largebaggage) || 0,
        airportBaggage: Number(data.airportbaggage) || 0,
        totalBaggage: Number(data.totalbaggage) || 0,
        remarks: data.remarks || "",
        countryName: data.countryName || "",
        customerCity: data.customerCity || "",
        state: data.state || "",
        city: data.city || "",
        city_id: data.city_id || null,
        message: "",
        lost_reason: data.lost_reason || "",
        lostReasonDetails: data.lostReasonDetails || "",
        followUp: data.followUp || "",
      };

      await dispatch(createLead(payload)).unwrap();

      showToastMessage("Lead created successfully!");
      resetFormFields();

      window.dispatchEvent(new CustomEvent("leadSubmitted"));
      window.dispatchEvent(new CustomEvent("navigateToLeadTable"));
    } catch (error: any) {
      console.error("❌ Submit Error:", error);
      let errorMessage = "Failed to save lead. Please try again.";
      if (error?.message) errorMessage = error.message;
      else if (error?.payload) errorMessage = error.payload;
      else if (error?.data?.message) errorMessage = error.data.message;
      showToastMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <SuccessToast
        show={showSuccessToast}
        message={successMessage}
        onClose={closeToast}
      />

      <div className="sticky top-0 z-30">
        <FormPageHeader title={"New Lead Form"} />
      </div>

      <div className="p-6 mx-auto bg-white shadow-xl rounded-lg">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <EnquirySection />

            <CustomerSection
              headerAction={
                <CustomerSearch
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  showDropdown={showDropdown}
                  setShowDropdown={setShowDropdown}
                  onSelect={handleSelectCustomer}
                  onClear={handleClearSearch}
                />
              }
              formData={formData}
              onFieldChange={handleFieldChange}
              onFieldTouched={markFieldTouched}
              onCategoryChange={handleCustomerCategoryChange}
              onCheckPhone={handleCheckCustomerPhone}
              alternateCountryCode={alternateCountryCode}
              setAlternateCountryCode={setAlternateCountryCode}
              customerCategoryTypeValue={customerCategoryTypeValue}
              setCustomerCategoryTypeValue={setCustomerCategoryTypeValue}
            />

            <TravelSection
              itineraryList={itineraryList}
              currentItinerary={currentItinerary}
              setCurrentItinerary={setCurrentItinerary}
              onAddItinerary={addItinerary}
              onRemoveItinerary={removeItinerary}
              onReorderItinerary={reorderItinerary}
            />

            <SubmitSection isSubmitting={isSubmitting} hasUser={!!currentUser} />
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default LeadsForm;