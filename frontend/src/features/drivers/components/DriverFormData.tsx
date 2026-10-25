"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
} from "lucide-react";
import { AppDispatch, RootState } from "@/store/store";
import {
  createDriverThunk,
  updateDriverThunk,
  resetSuccess,
} from "@/features/drivers/driverSlice";
import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "@/features/location/stateSlice";

interface CityItem {
  id: number | string;
  cityName: string;
}

interface StateItem {
  id: number | string;
  stateName: string;
}

interface StateCitySlice {
  cities: CityItem[];
  statesForCity: StateItem[];
  loading: boolean;
  error: string | null;
}

type AppRootState = RootState & {
  stateCity: StateCitySlice;
};

interface DriverFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    emergencyContact: string;
    bloodGroup: string;
    vendor: string;
    vendorState: string;
    vendorCity: string;
  };
  addressInfo: {
    permanentAddress: string;
    permanentCity: string;
    permanentState: string;
    permanentPincode: string;
    currentAddress: string;
    currentCity: string;
    currentState: string;
    currentPincode: string;
  };
  licenseInfo: {
    licenseNumber: string;
    licenseType: string;
    issuingAuthority: string;
    issueDate: string;
    experienceDetails: string;
    expiryDate: string;
    dlFront: string;
    dlBack: string;
  };
  employmentInfo: {
    employeeId: string;
  };
  documents: {
    aadharCard: string;
    panCard: string;
  };
}

interface DriverResponse {
  id: number;
  personalInfo?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    emergencyContact: string;
    bloodGroup: string;
    vendor: string;
    vendorState: string;
    vendorCity: string;
  };
  addressInfo?: {
    permanentAddress: string;
    permanentCity: string;
    permanentState: string;
    permanentPincode: string;
    currentAddress: string;
    currentCity: string;
    currentState: string;
    currentPincode: string;
  };
  licenseInfo?: {
    licenseNumber: string;
    licenseType: string;
    issuingAuthority: string;
    issueDate: string;
    experienceDetails: string;
    expiryDate: string;
    dlFront: string;
    dlBack: string;
  };
  employmentInfo?: {
    employeeId: string;
  };
  documents?: {
    aadharCard: string;
    panCard: string;
  };
}

interface DriverFormProps {
  initialData?: DriverResponse | null;
  mode?: "create" | "edit";
  onBack?: () => void;
}

const licenseTypes = [
  "MCWG",
  "MCWOG",
  "LMV",
  "LMV-NT",
  "LMV-TR",
  "HMV",
  "HMV-TR",
  "HMV-NT",
  "International",
];

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const genders = ["Male", "Female", "Other"];

const sampleVendors = [
  { name: "Vendor A", state: "Maharashtra", city: "Mumbai" },
  { name: "Vendor B", state: "Delhi", city: "New Delhi" },
  { name: "Vendor C", state: "Karnataka", city: "Bengaluru" },
  { name: "Vendor D", state: "Tamil Nadu", city: "Chennai" },
  { name: "Vendor E", state: "Uttar Pradesh", city: "Lucknow" },
];

const initialFormState: DriverFormData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    emergencyContact: "",
    bloodGroup: "",
    vendor: "",
    vendorState: "",
    vendorCity: "",
  },
  addressInfo: {
    permanentAddress: "",
    permanentCity: "",
    permanentState: "",
    permanentPincode: "",
    currentAddress: "",
    currentCity: "",
    currentState: "",
    currentPincode: "",
  },
  licenseInfo: {
    licenseNumber: "",
    licenseType: "",
    issuingAuthority: "",
    issueDate: "",
    experienceDetails: "",
    expiryDate: "",
    dlFront: "",
    dlBack: "",
  },
  employmentInfo: {
    employeeId: "",
  },
  documents: {
    aadharCard: "",
    panCard: "",
  },
};

const DriverForm: React.FC<DriverFormProps> = ({
  initialData,
  mode = "create",
  onBack,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    loading,
    error,
    successMessage: reduxSuccessMessage,
  } = useSelector((state: RootState) => state.driver);

  const [formData, setFormData] = useState<DriverFormData>(initialFormState);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const stateSlice = useSelector((state: AppRootState) => state.stateCity);
  const { cities = [], loading: stateLoading = false } = stateSlice || {};

  // Separate states for permanent and current address
  const [permanentStates, setPermanentStates] = useState<StateItem[]>([]);
  const [currentStates, setCurrentStates] = useState<StateItem[]>([]);
  const [permanentStateLoading, setPermanentStateLoading] = useState(false);
  const [currentStateLoading, setCurrentStateLoading] = useState(false);

  const uniqueCities = React.useMemo(() => {
    if (!cities || !Array.isArray(cities)) return [];
    return [...new Map(cities.map((c) => [c?.cityName, c])).values()];
  }, [cities]);

  const [fileState, setFileState] = useState<{
    dlFront: File | null;
    dlBack: File | null;
    aadharCard: File | null;
    panCard: File | null;
  }>({
    dlFront: null,
    dlBack: null,
    aadharCard: null,
    panCard: null,
  });

  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoadingCities(true);
        await dispatch(fetchAllCities()).unwrap();
      } catch (err) {
        console.error("Cities fetch error:", err);
      } finally {
        setIsLoadingCities(false);
      }
    };
    loadCities();
  }, [dispatch]);

  useEffect(() => {
    if (reduxSuccessMessage) {
      setSuccessMessage(reduxSuccessMessage);
      setShowSuccessToast(true);
      setTimeout(() => {
        dispatch(resetSuccess());
        if (mode === "edit" && onBack) {
          onBack();
        }
      }, 2000);
    }
  }, [reduxSuccessMessage, dispatch, mode, onBack]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowErrorToast(true);
    }
  }, [error]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        personalInfo: {
          firstName: initialData.personalInfo?.firstName || "",
          lastName: initialData.personalInfo?.lastName || "",
          dateOfBirth: initialData.personalInfo?.dateOfBirth || "",
          gender: initialData.personalInfo?.gender || "",
          email: initialData.personalInfo?.email || "",
          phone: initialData.personalInfo?.phone || "",
          emergencyContact: initialData.personalInfo?.emergencyContact || "",
          bloodGroup: initialData.personalInfo?.bloodGroup || "",
          vendor: initialData.personalInfo?.vendor || "",
          vendorState: initialData.personalInfo?.vendorState || "",
          vendorCity: initialData.personalInfo?.vendorCity || "",
        },
        addressInfo: {
          permanentAddress: initialData.addressInfo?.permanentAddress || "",
          permanentCity: initialData.addressInfo?.permanentCity || "",
          permanentState: initialData.addressInfo?.permanentState || "",
          permanentPincode: initialData.addressInfo?.permanentPincode || "",
          currentAddress: initialData.addressInfo?.currentAddress || "",
          currentCity: initialData.addressInfo?.currentCity || "",
          currentState: initialData.addressInfo?.currentState || "",
          currentPincode: initialData.addressInfo?.currentPincode || "",
        },
        licenseInfo: {
          licenseNumber: initialData.licenseInfo?.licenseNumber || "",
          licenseType: initialData.licenseInfo?.licenseType || "",
          issuingAuthority: initialData.licenseInfo?.issuingAuthority || "",
          issueDate: initialData.licenseInfo?.issueDate || "",
          experienceDetails: initialData.licenseInfo?.experienceDetails || "",
          expiryDate: initialData.licenseInfo?.expiryDate || "",
          dlFront: initialData.licenseInfo?.dlFront || "",
          dlBack: initialData.licenseInfo?.dlBack || "",
        },
        employmentInfo: {
          employeeId: initialData.employmentInfo?.employeeId || "",
        },
        documents: {
          aadharCard: initialData.documents?.aadharCard || "",
          panCard: initialData.documents?.panCard || "",
        },
      });

      // Load states for permanent city if exists
      if (initialData.addressInfo?.permanentCity) {
        setPermanentStateLoading(true);
        dispatch(fetchStatesByCity(initialData.addressInfo.permanentCity))
          .unwrap()
          .then((result) => {
            if (Array.isArray(result)) setPermanentStates(result);
          })
          .catch((err) => console.error("States fetch error:", err))
          .finally(() => setPermanentStateLoading(false));
      }

      // Load states for current city if exists
      if (initialData.addressInfo?.currentCity) {
        setCurrentStateLoading(true);
        dispatch(fetchStatesByCity(initialData.addressInfo.currentCity))
          .unwrap()
          .then((result) => {
            if (Array.isArray(result)) setCurrentStates(result);
          })
          .catch((err) => console.error("States fetch error:", err))
          .finally(() => setCurrentStateLoading(false));
      }
    }
  }, [mode, initialData, dispatch]);

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  useEffect(() => {
    if (showErrorToast) {
      const timer = setTimeout(() => {
        setShowErrorToast(false);
        setErrorMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showErrorToast]);

  const markFieldTouched = useCallback((fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const getInputClass = useCallback((fieldName: string, hasIcon = false) => {
    const base = `w-full p-2.5 border rounded-lg ${hasIcon ? "pl-10" : ""}`;
    return `${base} border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`;
  }, []);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      const parts = name.split(".");
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof DriverFormData] as Record<string, string>),
            [child]: value,
          },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    [],
  );

  const handlePermanentCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedCity = e.target.value;
      setPermanentStates([]);
      setFormData((prev) => ({
        ...prev,
        addressInfo: {
          ...prev.addressInfo,
          permanentCity: selectedCity,
          permanentState: "",
        },
      }));
      if (!selectedCity) return;
      try {
        setPermanentStateLoading(true);
        const result = await dispatch(fetchStatesByCity(selectedCity)).unwrap();
        if (Array.isArray(result)) setPermanentStates(result);
      } catch (err) {
        console.error("States fetch error:", err);
      } finally {
        setPermanentStateLoading(false);
      }
    },
    [dispatch],
  );

  const handlePermanentStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedStateName = e.target.value;
      setFormData((prev) => ({
        ...prev,
        addressInfo: {
          ...prev.addressInfo,
          permanentState: selectedStateName,
        },
      }));
    },
    [],
  );

  const handleCurrentCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedCity = e.target.value;
      setCurrentStates([]);
      setFormData((prev) => ({
        ...prev,
        addressInfo: {
          ...prev.addressInfo,
          currentCity: selectedCity,
          currentState: "",
        },
      }));
      if (!selectedCity) return;
      try {
        setCurrentStateLoading(true);
        const result = await dispatch(fetchStatesByCity(selectedCity)).unwrap();
        if (Array.isArray(result)) setCurrentStates(result);
      } catch (err) {
        console.error("States fetch error:", err);
      } finally {
        setCurrentStateLoading(false);
      }
    },
    [dispatch],
  );

  const handleCurrentStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedStateName = e.target.value;
      setFormData((prev) => ({
        ...prev,
        addressInfo: {
          ...prev.addressInfo,
          currentState: selectedStateName,
        },
      }));
    },
    [],
  );

  const handleFileChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      fieldName: keyof typeof fileState,
    ) => {
      const file = e.target.files?.[0] || null;
      setFileState((prev) => ({ ...prev, [fieldName]: file }));
    },
    [],
  );

  const handleAddressSame = useCallback(() => {
    if (!sameAsPermanent) {
      setFormData((prev) => ({
        ...prev,
        addressInfo: {
          ...prev.addressInfo,
          currentAddress: prev.addressInfo.permanentAddress,
          currentCity: prev.addressInfo.permanentCity,
          currentState: prev.addressInfo.permanentState,
          currentPincode: prev.addressInfo.permanentPincode,
        },
      }));
      // Also copy the states array
      setCurrentStates([...permanentStates]);
    } else {
      setFormData((prev) => ({
        ...prev,
        addressInfo: {
          ...prev.addressInfo,
          currentAddress: "",
          currentCity: "",
          currentState: "",
          currentPincode: "",
        },
      }));
      setCurrentStates([]);
    }
    setSameAsPermanent(!sameAsPermanent);
  }, [sameAsPermanent, permanentStates]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingProfile(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const submissionData = {
          personalInfo: formData.personalInfo,
          addressInfo: formData.addressInfo,
          licenseInfo: formData.licenseInfo,
          employmentInfo: formData.employmentInfo,
          documents: formData.documents,
        };


        if (mode === "edit" && initialData?.id) {
          await dispatch(
            updateDriverThunk({
              id: initialData.id,
              data: submissionData,
            }),
          ).unwrap();
          setSuccessMessage("Driver Updated Successfully! 🎉");
          setShowSuccessToast(true);
          setTimeout(() => {
            if (onBack) {
              onBack();
            }
          }, 2000);
        } else {
          await dispatch(createDriverThunk(submissionData)).unwrap();
          setSuccessMessage("Driver Created Successfully! 🎉");
          setShowSuccessToast(true);
          setFormData(initialFormState);
          setFileState({
            dlFront: null,
            dlBack: null,
            aadharCard: null,
            panCard: null,
          });
          setTouchedFields({});
          setSameAsPermanent(false);
          setPermanentStates([]);
          setCurrentStates([]);
          dispatch(resetStatesForCity());
        }
      } catch (err: any) {
        console.error("Submit error:", err);
        setErrorMessage(
          err?.message ||
            err?.error ||
            "Something went wrong. Please try again.",
        );
        setShowErrorToast(true);
      } finally {
        setSavingProfile(false);
      }
    },
    [formData, dispatch, mode, initialData, onBack],
  );

  return (
    <div className="w-full bg-gray-50 p-6">
      {showSuccessToast && (
        <div className="fixed right-4 top-4 z-50 animate-slide-in-right">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700 font-medium">{successMessage}</p>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-auto text-green-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {showErrorToast && (
        <div className="fixed right-4 top-4 z-50 animate-slide-in-right">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{errorMessage}</p>
            <button
              onClick={() => setShowErrorToast(false)}
              className="ml-auto text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="w-full bg-white shadow-xl rounded-lg">
        <div className="p-6">
          {mode === "edit" && onBack && (
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <ArrowLeft size={18} />
              Back to Driver List
            </button>
          )}




          <div className="bg-orange-100 p-4 rounded-lg mb-6">
            <h2 className="text-2xl font-bold text-center text-orange-600">
              {mode === "edit" ? "Edit Driver" : "Driver Registration"}
            </h2>
            <p className="text-center text-orange-700 text-sm mt-1">
              {mode === "edit"
                ? "Update driver information"
                : "Fill all details to register a new driver"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border rounded-lg p-5 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 pb-2 border-b flex items-center gap-2">
                <User size={20} /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="employmentInfo.employeeId"
                    value={formData.employmentInfo.employeeId}
                    onChange={handleInputChange}
                    className={getInputClass("employeeId")}
                    placeholder="EMP001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="personalInfo.firstName"
                    value={formData.personalInfo.firstName}
                    onChange={handleInputChange}
                    className={getInputClass("firstName")}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="personalInfo.lastName"
                    value={formData.personalInfo.lastName}
                    onChange={handleInputChange}
                    className={getInputClass("lastName")}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="personalInfo.dateOfBirth"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={handleInputChange}
                    className={getInputClass("dateOfBirth")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="personalInfo.gender"
                    value={formData.personalInfo.gender}
                    onChange={handleInputChange}
                    className={getInputClass("gender")}
                  >
                    <option value="">Select</option>
                    {genders.map((g) => (
                      <option key={g} value={g.toLowerCase()}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="personalInfo.phone"
                    value={formData.personalInfo.phone}
                    onChange={handleInputChange}
                    className={getInputClass("phone")}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="personalInfo.email"
                    value={formData.personalInfo.email}
                    onChange={handleInputChange}
                    className={getInputClass("email")}
                    placeholder="driver@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="personalInfo.emergencyContact"
                    value={formData.personalInfo.emergencyContact}
                    onChange={handleInputChange}
                    className={getInputClass("emergencyContact")}
                    placeholder="Relative name - phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="personalInfo.bloodGroup"
                    value={formData.personalInfo.bloodGroup}
                    onChange={handleInputChange}
                    className={getInputClass("bloodGroup")}
                  >
                    <option value="">Select</option>
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <select
                    name="personalInfo.vendor"
                    value={formData.personalInfo.vendor}
                    onChange={(e) => {
                      handleInputChange(e);
                      const selected = sampleVendors.find(
                        (v) => v.name === e.target.value,
                      );
                      if (selected) {
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            vendorState: selected.state,
                            vendorCity: selected.city,
                          },
                        }));
                      }
                    }}
                    className={getInputClass("vendor")}
                  >
                    <option value="">Select Vendor</option>
                    {sampleVendors.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor City
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.vendorCity}
                    readOnly
                    className="w-full p-2.5 border rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor State
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.vendorState}
                    readOnly
                    className="w-full p-2.5 border rounded-lg bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border rounded-lg p-5 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-4 pb-2 border-b flex items-center gap-2">
                <MapPin size={20} /> Address Information
              </h3>
              <div className="space-y-6">
                {/* Permanent Address Section */}
                <div className="space-y-3">
                  <h4 className="text-md font-semibold text-green-700">
                    Permanent Address
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permanent Address
                    </label>
                    <textarea
                      name="addressInfo.permanentAddress"
                      value={formData.addressInfo.permanentAddress}
                      onChange={handleInputChange}
                      rows={2}
                      className={getInputClass("permanentAddress")}
                      placeholder="Enter permanent address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <select
                        name="addressInfo.permanentCity"
                        value={formData.addressInfo.permanentCity}
                        onChange={handlePermanentCityChange}
                        className="w-full p-2.5 border rounded-lg"
                        disabled={isLoadingCities}
                      >
                        <option value="">
                          {isLoadingCities ? "Loading..." : "Select City"}
                        </option>
                        {uniqueCities.map((city) => (
                          <option key={city.id} value={city.cityName}>
                            {city.cityName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <select
                        name="addressInfo.permanentState"
                        value={formData.addressInfo.permanentState}
                        onChange={handlePermanentStateChange}
                        className="w-full p-2.5 border rounded-lg"
                        disabled={
                          !formData.addressInfo.permanentCity ||
                          permanentStateLoading
                        }
                      >
                        <option value="">
                          {permanentStateLoading
                            ? "Loading..."
                            : "Select State"}
                        </option>
                        {permanentStates.map((state) => (
                          <option key={state.id} value={state.stateName}>
                            {state.stateName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="addressInfo.permanentPincode"
                        value={formData.addressInfo.permanentPincode}
                        onChange={handleInputChange}
                        className={getInputClass("permanentPincode")}
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Same as Permanent Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={sameAsPermanent}
                    onChange={handleAddressSame}
                    className="w-4 h-4"
                  />
                  <label
                    htmlFor="sameAddress"
                    className="text-sm text-gray-700"
                  >
                    Same as Permanent Address
                  </label>
                </div>

                {/* Current Address Section */}
                <div className="space-y-3">
                  <h4 className="text-md font-semibold text-green-700">
                    Current Address
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Address
                    </label>
                    <textarea
                      name="addressInfo.currentAddress"
                      value={formData.addressInfo.currentAddress}
                      onChange={handleInputChange}
                      rows={2}
                      className={getInputClass("currentAddress")}
                      disabled={sameAsPermanent}
                      placeholder="Enter current address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <select
                        name="addressInfo.currentCity"
                        value={formData.addressInfo.currentCity}
                        onChange={handleCurrentCityChange}
                        className="w-full p-2.5 border rounded-lg"
                        disabled={sameAsPermanent || isLoadingCities}
                      >
                        <option value="">
                          {isLoadingCities ? "Loading..." : "Select City"}
                        </option>
                        {uniqueCities.map((city) => (
                          <option key={city.id} value={city.cityName}>
                            {city.cityName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <select
                        name="addressInfo.currentState"
                        value={formData.addressInfo.currentState}
                        onChange={handleCurrentStateChange}
                        className="w-full p-2.5 border rounded-lg"
                        disabled={
                          sameAsPermanent ||
                          !formData.addressInfo.currentCity ||
                          currentStateLoading
                        }
                      >
                        <option value="">
                          {currentStateLoading ? "Loading..." : "Select State"}
                        </option>
                        {currentStates.map((state) => (
                          <option key={state.id} value={state.stateName}>
                            {state.stateName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="addressInfo.currentPincode"
                        value={formData.addressInfo.currentPincode}
                        onChange={handleInputChange}
                        className={getInputClass("currentPincode")}
                        disabled={sameAsPermanent}
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* License Information */}
            <div className="border rounded-lg p-5 bg-orange-50">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 pb-2 border-b flex items-center gap-2">
                <FileText size={20} /> License Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseInfo.licenseNumber"
                    value={formData.licenseInfo.licenseNumber}
                    onChange={handleInputChange}
                    className={getInputClass("licenseNumber")}
                    placeholder="DL-123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Type
                  </label>
                  <select
                    name="licenseInfo.licenseType"
                    value={formData.licenseInfo.licenseType}
                    onChange={handleInputChange}
                    className={getInputClass("licenseType")}
                  >
                    <option value="">Select Type</option>
                    {licenseTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    name="licenseInfo.issuingAuthority"
                    value={formData.licenseInfo.issuingAuthority}
                    onChange={handleInputChange}
                    className={getInputClass("issuingAuthority")}
                    placeholder="RTO Office"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    name="licenseInfo.issueDate"
                    value={formData.licenseInfo.issueDate}
                    onChange={handleInputChange}
                    className={getInputClass("issueDate")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="licenseInfo.expiryDate"
                    value={formData.licenseInfo.expiryDate}
                    onChange={handleInputChange}
                    className={getInputClass("expiryDate")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="licenseInfo.experienceDetails"
                    value={formData.licenseInfo.experienceDetails}
                    onChange={handleInputChange}
                    className={getInputClass("experienceDetails")}
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="border rounded-lg p-5 bg-yellow-50">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 pb-2 border-b flex items-center gap-2">
                <FileText size={20} /> Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "dlFront", label: "License Front" },
                  { key: "dlBack", label: "License Back" },
                  { key: "aadharCard", label: "Aadhar Card" },
                  { key: "panCard", label: "Pan Card" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id={key}
                        accept=".pdf,.jpg,.png"
                        onChange={(e) =>
                          handleFileChange(e, key as keyof typeof fileState)
                        }
                        className="hidden"
                      />
                      <label
                        htmlFor={key}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg cursor-pointer hover:bg-yellow-700"
                      >
                        Choose File
                      </label>
                      {fileState[key as keyof typeof fileState] && (
                        <span className="text-sm text-gray-600">
                          {fileState[key as keyof typeof fileState]!.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={savingProfile || loading}
                className="px-8 py-3 bg-orange-600 text-white rounded-full hover:bg-orange-700 disabled:bg-orange-300 transition text-lg font-semibold"
              >
                {savingProfile || loading
                  ? mode === "edit"
                    ? "Updating..."
                    : "Submitting..."
                  : mode === "edit"
                    ? "Update Driver"
                    : "Submit Driver"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DriverForm;
