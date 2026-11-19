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
import {
  emptyCompany,
  emptyGarage,
  initialFiles,
  initialFormState,
} from "./constants";
import type {
  AppRootState,
  DocKey,
  FileState,
  FormMode,
  StateItem,
  VendorCompany,
  VendorFormData,
  VendorGarage,
} from "./types";

/* Backend vendor -> form data (sirf wahi keys jo form me hain) */
const mapVendorToForm = (v: VendorResponse): VendorFormData => {
  const flat = Object.fromEntries(
    (Object.keys(initialFormState) as (keyof VendorFormData)[])
      .filter(
        (k) =>
          k !== "personalInfo" &&
          k !== "companyinfo" &&
          k !== "password" &&
          k !== "garages" &&
          k !== "companies",
      )
      .map((k) => [k, (v as any)?.[k] ?? ""]),
  );

  // companies: id ke saath state me rakho (update me id se hi purani company update hoti hai)
  // har company ki bank details bhi isi me hain
  const companies: VendorCompany[] =
    Array.isArray((v as any).companies) && (v as any).companies.length
      ? (v as any).companies.map((c: any) => ({
          id: c.id,
          companyName: c.companyName ?? "",
          companyType: c.companyType ?? "",
          companyPanNumber: c.companyPanNumber ?? "",
          companyRegisteredNumber: c.companyRegisteredNumber ?? "",
          gstNumber: c.gstNumber ?? "",
          businessNumber: c.businessNumber ?? "",
          registeredAddress: c.registeredAddress ?? "",
          cooperativeName: c.cooperativeName ?? "",
          cooperativeNumber: c.cooperativeNumber ?? "",
          bankName: c.bankName ?? "",
          bankAccountNumber: c.bankAccountNumber ?? "",
          accountHolderName: c.accountHolderName ?? "",
          ifscCode: c.ifscCode ?? "",
          cancelledCheque: c.cancelledCheque ?? "",
        }))
      : [emptyCompany()];

  // garages: id ke saath state me rakho
  const garages: VendorGarage[] =
    Array.isArray((v as any).garages) && (v as any).garages.length
      ? (v as any).garages.map((g: any) => ({
          id: g.id,
          garageAddress: g.garageAddress ?? "",
          garageManager: g.garageManager ?? "",
          garagePhone: g.garagePhone ?? "",
        }))
      : [emptyGarage()];

  return {
    ...initialFormState,
    ...flat,
    id: v.id,
    password: "",
    companies,
    garages,
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
  region: data.region ?? "",
  vendorCategory: data.vendorCategory ?? "",
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

  // companies (bank details ke saath): id ke saath bhejo
  // (khali rows backend me skip ho jati hain)
  companies: (data.companies ?? []).map((c) => ({
    ...(c.id ? { id: c.id } : {}),
    companyName: c.companyName ?? "",
    companyType: c.companyType ?? "",
    companyPanNumber: c.companyPanNumber ?? "",
    companyRegisteredNumber: c.companyRegisteredNumber ?? "",
    gstNumber: c.gstNumber ?? "",
    businessNumber: c.businessNumber ?? "",
    registeredAddress: c.registeredAddress ?? "",
    cooperativeName: c.cooperativeName ?? "",
    cooperativeNumber: c.cooperativeNumber ?? "",
    bankName: c.bankName ?? "",
    bankAccountNumber: c.bankAccountNumber ?? "",
    accountHolderName: c.accountHolderName ?? "",
    ifscCode: c.ifscCode ?? "",
    cancelledCheque: c.cancelledCheque ?? "",
  })),

  // garages: id ke saath bhejo (khali rows vendorApi me hat jati hain)
  garages: (data.garages ?? []).map((g) => ({
    ...(g.id ? { id: g.id } : {}),
    garageAddress: g.garageAddress ?? "",
    garageManager: g.garageManager ?? "",
    garagePhone: g.garagePhone ?? "",
  })),

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
  vendorProof2: data.vendorProof2 ?? "",
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
  // company ke index ke hisaab se cancelled cheque ka upload status
  const [chequeUploading, setChequeUploading] = useState<
    Record<number, boolean>
  >({});
  const [states, setStates] = useState<StateItem[]>([]);

  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileResetKey, setFileResetKey] = useState(0);
  const isUploading =
    Object.values(uploading).some(Boolean) ||
    Object.values(chequeUploading).some(Boolean);

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

  /* ---------- Companies (multiple, har ek ki bank details ke saath) ---------- */
  const addCompany = useCallback(
    () =>
      setFormData((prev) => ({
        ...prev,
        companies: [...(prev.companies ?? []), emptyCompany()],
      })),
    [],
  );

  const removeCompany = useCallback(
    (index: number) =>
      setFormData((prev) => ({
        ...prev,
        companies: (prev.companies ?? []).filter((_, i) => i !== index),
      })),
    [],
  );

  const handleCompanyChange = useCallback(
    (index: number, field: keyof VendorCompany, value: string) =>
      setFormData((prev) => ({
        ...prev,
        companies: (prev.companies ?? []).map((c, i) =>
          i === index
            ? {
                ...c,
                // IFSC hamesha uppercase me
                [field]: field === "ifscCode" ? value.toUpperCase() : value,
              }
            : c,
        ),
      })),
    [],
  );

  /* Company ka cancelled cheque: select hote hi Cloudinary par upload, URL us company me save */
  const handleCompanyChequeChange = useCallback(
    (index: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const file = input.files?.[0] ?? null;
      if (!file) return;

      if (!formData.name?.trim()) {
        setError("Document upload karne se pehle Vendor Name bharo");
        input.value = "";
        return;
      }

      setError(null);
      setChequeUploading((prev) => ({ ...prev, [index]: true }));

      try {
        const url = await uploadToCloudinary(file, {
          folder: getVendorFolder(formData.name),
          fileName: `cancelledCheque_${index + 1}`,
        });
        setFormData((prev) => ({
          ...prev,
          companies: (prev.companies ?? []).map((c, i) =>
            i === index ? { ...c, cancelledCheque: url } : c,
          ),
        }));
      } catch (err: any) {
        setError(err?.message || "Cancelled cheque upload failed");
        input.value = "";
      } finally {
        setChequeUploading((prev) => ({ ...prev, [index]: false }));
      }
    },
    [formData.name],
  );

  /* ---------- Garages (multiple) ---------- */
  const addGarage = useCallback(
    () =>
      setFormData((prev) => ({
        ...prev,
        garages: [...(prev.garages ?? []), emptyGarage()],
      })),
    [],
  );

  const removeGarage = useCallback(
    (index: number) =>
      setFormData((prev) => ({
        ...prev,
        garages: (prev.garages ?? []).filter((_, i) => i !== index),
      })),
    [],
  );

  const handleGarageChange = useCallback(
    (
      index: number,
      field: "garageAddress" | "garageManager" | "garagePhone",
      value: string,
    ) =>
      setFormData((prev) => ({
        ...prev,
        garages: (prev.garages ?? []).map((g, i) =>
          i === index ? { ...g, [field]: value } : g,
        ),
      })),
    [],
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

    // har company ki bank details ki basic check (backend bhi validate karta hai)
    const companies = formData.companies ?? [];
    for (let i = 0; i < companies.length; i++) {
      const c = companies[i];
      if (c.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(c.ifscCode.trim())) {
        setError(
          `Company ${i + 1}: IFSC code galat hai (example: SBIN0001234)`,
        );
        return;
      }
      if (
        c.bankAccountNumber &&
        !/^\d{9,18}$/.test(c.bankAccountNumber.trim())
      ) {
        setError(
          `Company ${i + 1}: Bank account number 9 se 18 digits ka hona chahiye`,
        );
        return;
      }
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
        setChequeUploading({});
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
    chequeUploading,
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
    // companies
    addCompany,
    removeCompany,
    handleCompanyChange,
    handleCompanyChequeChange,
    // garages
    addGarage,
    removeGarage,
    handleGarageChange,
  };
}
