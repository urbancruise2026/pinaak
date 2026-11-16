"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/store/store";

import type { VendorResponse } from "../../vendorApi";
import {
  createVendorThunk,
  updateVendorThunk,
  resetSuccess,
  getVendorByIdThunk,
} from "@/features/vendors/vendorSlice";
import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "@/features/location/stateSlice";
import { uploadToCloudinary } from "@/features/utils/uploadToCloudinary";
import { initialFiles, initialFormState } from "./constants";
import type {
  AppRootState,
  DocKey,
  FileState,
  FormMode,
  StateItem,
  VendorFormData,
} from "./types";

/* Backend vendor -> form data (sirf wahi keys jo form me hain) */
const mapVendorToForm = (v: VendorResponse): VendorFormData => {
  const flat = Object.fromEntries(
    (Object.keys(initialFormState) as (keyof VendorFormData)[])
      .filter(
        (k) => k !== "personalInfo" && k !== "companyinfo" && k !== "password",
      )
      .map((k) => [k, (v as any)?.[k] ?? ""]),
  );
  return {
    ...initialFormState,
    ...flat,
    id: v.id,
    password: "",
    personalInfo: {
      personalAddress: v.personalInfo?.personalAddress ?? "",
      personalCity: v.personalInfo?.personalCity ?? "",
      personalState: v.personalInfo?.personalState ?? "",
    },
    companyinfo: {
      companyState: (v as any).companyinfo?.companyState ?? "",
      companyCity: (v as any).companyinfo?.companyCity ?? "",
    },
  };
};

/* Vendor name se safe Cloudinary folder name banata hai */
const getVendorFolder = (name?: string) => {
  const safeName =
    (name ?? "")
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "unnamed_vendor";

  return `vendor_details/${safeName}`;
};

/* Har field hamesha bhejo (khali ho to "" jayega, backend NULL bana dega) */
const buildPayload = (data: VendorFormData) => ({
  ...data,

  username: data.username ?? "",
  password: data.password ?? "",
  name: data.name ?? "",
  shortName: data.shortName ?? "",
  email: data.email ?? "",
  phone: data.phone ?? "",
  address: data.address ?? "",
  aadhaarNumber: data.aadhaarNumber ?? "",

  ownerName: data.ownerName?.trim() ?? "",
  ownerPhone: data.ownerPhone ?? "",
  ownerEmail: data.ownerEmail ?? "",
  managerName1: data.managerName1 ?? "",
  managerPhone1: data.managerPhone1 ?? "",
  managerEmail1: data.managerEmail1 ?? "",
  managerName2: data.managerName2 ?? "",
  managerPhone2: data.managerPhone2 ?? "",
  managerEmail2: data.managerEmail2 ?? "",

  companyName: data.companyName ?? "",
  companyType: data.companyType ?? "",
  companyPanNumber: data.companyPanNumber ?? "",
  companyRegisteredNumber: data.companyRegisteredNumber ?? "",
  gstNumber: data.gstNumber ?? "",
  businessNumber: data.businessNumber ?? "",
  registeredAddress: data.registeredAddress ?? "",
  garageAddress: data.garageAddress ?? "",
  garagePhone: data.garagePhone ?? "",
  cooperativeName: data.cooperativeName ?? "",
  cooperativeNumber: data.cooperativeNumber ?? "",

  personalInfo: {
    personalAddress: data.personalInfo?.personalAddress ?? "",
    personalCity: data.personalInfo?.personalCity ?? "",
    personalState: data.personalInfo?.personalState ?? "",
  },
  companyinfo: {
    companyState: data.companyinfo?.companyState ?? "",
    companyCity: data.companyinfo?.companyCity ?? "",
  },

  // documents: upload ke time hi URL formData me aa chuka hai
  passportPhoto: data.passportPhoto ?? "",
  panDoc: data.panDoc ?? "",
  adharDoc: data.adharDoc ?? "",
  gstDoc: data.gstDoc ?? "",
  vendorProof: data.vendorProof ?? "",
  vehicleDoc: data.vehicleDoc ?? "",
});

interface Options {
  mode: FormMode;
  vendorId?: number;
  onBack?: () => void;
}

export function useVendorForm({ mode, vendorId, onBack }: Options) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const isEdit = mode === "edit";
  const isView = mode === "view";

  const cities = useSelector((s: AppRootState) => s.stateCity?.cities);
  const selectedVendor = useSelector((s: RootState) => s.vendor.selectedVendor);

  const [formData, setFormData] = useState<VendorFormData>(initialFormState);
  const [files, setFiles] = useState<FileState>(initialFiles);
  const [uploading, setUploading] = useState<Partial<Record<DocKey, boolean>>>(
    {},
  );
  const [states, setStates] = useState<StateItem[]>([]);

  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileResetKey, setFileResetKey] = useState(0);
  const isUploading = Object.values(uploading).some(Boolean);

  /* ---------- Data loading ---------- */
  const loadStates = useCallback(
    async (city: string) => {
      setStates([]);
      if (!city) return;
      try {
        setIsLoadingStates(true);
        const result = await dispatch(fetchStatesByCity(city)).unwrap();
        if (Array.isArray(result)) setStates(result);
      } catch (err) {
        console.error("States fetch error:", err);
      } finally {
        setIsLoadingStates(false);
      }
    },
    [dispatch],
  );

  // cities
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingCities(true);
        await dispatch(fetchAllCities()).unwrap();
      } catch (err) {
        console.error("Cities fetch error:", err);
      } finally {
        setIsLoadingCities(false);
      }
    })();
  }, [dispatch]);

  // vendor (edit / view)
  useEffect(() => {
    if (mode === "create" || !vendorId) return;
    (async () => {
      try {
        setIsLoadingVendor(true);
        await dispatch(getVendorByIdThunk(vendorId)).unwrap();
      } catch (err) {
        console.error("Failed to fetch vendor:", err);
        setError("Failed to load vendor data");
      } finally {
        setIsLoadingVendor(false);
      }
    })();
  }, [dispatch, mode, vendorId]);

  // vendor -> form
  useEffect(() => {
    if (!selectedVendor || mode === "create") return;
    const mapped = mapVendorToForm(selectedVendor);

    setFormData(mapped);
    loadStates(mapped.personalInfo.personalCity);
  }, [selectedVendor, mode, loadStates]);

  const cityNames = useMemo(
    () => [...new Set((cities ?? []).map((c) => c.cityName).filter(Boolean))],
    [cities],
  );

  /* ---------- Handlers ---------- */
  // "personalInfo.personalAddress" jaise nested names bhi handle karta hai
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const [parent, child] = name.split(".");
      setFormData((prev) =>
        child
          ? {
              ...prev,
              [parent]: { ...(prev as any)[parent], [child]: value },
            }
          : { ...prev, [name]: value },
      );
    },
    [],
  );

  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const city = e.target.value;
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          personalCity: city,
          personalState: "",
        },
      }));
      loadStates(city);
    },
    [loadStates],
  );

  /* File select hote hi Cloudinary par upload, URL formData me save */
  const handleFileChange = useCallback(
    (key: DocKey) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const file = input.files?.[0] ?? null;
      if (!file) return;

      // folder vendor ke naam se banta hai, isliye naam pehle chahiye
      if (!formData.name?.trim()) {
        setError("Document upload karne se pehle Vendor Name bharo");
        input.value = "";
        return;
      }

      setError(null);
      setFiles((prev) => ({ ...prev, [key]: file }));
      setUploading((prev) => ({ ...prev, [key]: true }));

      try {
        const url = await uploadToCloudinary(file, {
          folder: getVendorFolder(formData.name),
          fileName: key,
        });
        setFormData((prev) => ({ ...prev, [key]: url }));
      } catch (err: any) {
        setFiles((prev) => ({ ...prev, [key]: null }));
        setError(err?.message || "Document upload failed");
        input.value = "";
      } finally {
        setUploading((prev) => ({ ...prev, [key]: false }));
      }
    },
    [formData.name],
  );

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else router.push("/dashboard?tab=vendortable");
  }, [onBack, router]);

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (isUploading) {
      setError("Document upload ho raha hai, thoda wait karo");
      return;
    }

    setSaving(true);

    try {
      // documents already upload ho chuke hain, sirf URLs ke saath payload
      const body = buildPayload(formData);

      if (isEdit && formData.id) {
        // blank password => bhejna nahi hai, backend purana hash rakhega
        const { password, ...rest } = body;
        const payload = password?.trim() ? body : rest;
        await dispatch(
          updateVendorThunk({ id: formData.id, vendorData: payload }),
        ).unwrap();
        setSuccess("Vendor updated successfully!");
      } else {
        await dispatch(createVendorThunk(body)).unwrap();
        setSuccess("Vendor created successfully!");
        setFormData(initialFormState);
        setFiles(initialFiles);
        setFileResetKey((k) => k + 1); // <- add
        setStates([]);
        dispatch(resetStatesForCity());
      }

      setTimeout(() => {
        setSuccess(null);
        dispatch(resetSuccess());
        if (isEdit) handleBack();
      }, 2500);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    // mode
    isEdit,
    isView,
    // data
    formData,
    files,
    states,
    cityNames,
    // status
    isLoadingCities,
    isLoadingVendor,
    isLoadingStates,
    saving,
    uploading,
    isUploading,
    showPassword,
    error,
    success,
    // handlers
    handleChange,
    handleCityChange,
    handleFileChange,
    handleSubmit,
    togglePassword,
    fileResetKey,
  };
}
