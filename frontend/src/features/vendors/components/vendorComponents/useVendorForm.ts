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
const mapVendorToForm = (
  v: VendorResponse,
): VendorFormData => {

  const flat = Object.fromEntries(
    (Object.keys(initialFormState) as (keyof VendorFormData)[])
      .filter((k) => k !== "personalInfo" && k !== "password")
      .map((k) => [k, v?.[k] ?? ""]),
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
  };
};

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
  const selectedVendor = useSelector(
    (s: RootState) => s.vendor.selectedVendor,
  );

  const [formData, setFormData] = useState<VendorFormData>(initialFormState);
  const [files, setFiles] = useState<FileState>(initialFiles);
  const [states, setStates] = useState<StateItem[]>([]);

  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleFileChange = useCallback(
    (key: DocKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] ?? null })),
    [],
  );

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else router.push("/dashboard?tab=vendortable");
  }, [onBack, router]);

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);

  /* ---------- Submit ---------- */
  const validate = (): string | null => {
    if (!isEdit && !formData.username.trim()) return "Username is required";
    if (!isEdit && !formData.password.trim()) return "Password is required";
    if (formData.password && formData.password.length < 6)
      return "Password must be at least 6 characters long";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setSaving(true);
    try {
      if (isEdit && formData.id) {
        // blank password => bhejna nahi hai, backend purana hash rakhega
        const { password, ...rest } = formData;
        const payload = password.trim() ? formData : rest;
        await dispatch(
          updateVendorThunk({ id: formData.id, vendorData: payload }),
        ).unwrap();
        setSuccess("Vendor updated successfully!");
      } else {
        await dispatch(createVendorThunk(formData)).unwrap();
        setSuccess("Vendor created successfully!");
        setFormData(initialFormState);
        setFiles(initialFiles);
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
    showPassword,
    error,
    success,
    // handlers
    handleChange,
    handleCityChange,
    handleFileChange,
    handleSubmit,
    togglePassword,
  };
}
