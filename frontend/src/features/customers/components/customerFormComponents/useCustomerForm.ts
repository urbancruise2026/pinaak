"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "@/features/location/stateSlice";
import {
  clearSearchResults,
  createCustomerThunk,
  updateCustomerThunk,
} from "@/features/customers/newCustomerSlice";
import { getCountriesThunk } from "@/features/location/countrycodeSlice";
import { initialFiles, initialFormState, NUMERIC_FIELDS } from "./constants";
import {
  buildCustomerPayload,
  getErrorMessage,
  mapCustomerToForm,
  scrollToTop,
  validateCustomer,
} from "./utils";
import type {
  City,
  Country,
  CustomerFormData,
  DocKey,
  FieldBinding,
  FileState,
  FormMode,
  StateItem,
  TextKey,
} from "./types";

interface Options {
  mode: FormMode;
  onBack?: () => void;
}

export function useCustomerForm({ mode, onBack }: Options) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isCreate = mode === "create";

  /* ---------- Redux ---------- */
  const stateSlice = useSelector((s: RootState) => s.stateCity);
  const customerSlice = useSelector((s: RootState) => s.newCustomer);
  const countrySlice = useSelector((s: RootState) => s.country);

  const {
    cities = [],
    statesForCity = [],
    loading: statesLoading = false,
  } = stateSlice || {};
  const { loading: customerLoading = false, error: customerError = null } =
    customerSlice || {};
  const { countries = [], loading: countriesLoading = false } =
    countrySlice || {};
  const selectedCustomer = customerSlice?.selectedCustomer;

  /* ---------- Local state ---------- */
  const [formData, setFormData] = useState<CustomerFormData>(initialFormState);
  const [files, setFiles] = useState<FileState>(initialFiles);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Errors state nahi, formData se nikalte hain (derived) — alag se set/clear nahi karna padta
  const errors = useMemo(() => validateCustomer(formData), [formData]);

  /* ---------- Effects ---------- */
  useEffect(() => {
    (async () => {
      try {
        await dispatch(fetchAllCities()).unwrap();
      } catch (err) {
        console.error("Cities fetch error:", err);
      } finally {
        setIsLoadingCities(false);
      }
    })();
    dispatch(getCountriesThunk());
  }, [dispatch]);

  // selected customer (edit / view) -> form
  useEffect(() => {
    if (!selectedCustomer) return;
    setFormData(mapCustomerToForm(selectedCustomer));
    setEditId(selectedCustomer.id ? Number(selectedCustomer.id) : null);
  }, [selectedCustomer]);

  // city badalte hi states load: city dropdown, edit load, search select — teeno case yahin cover
  useEffect(() => {
    if (formData.city) dispatch(fetchStatesByCity(formData.city));
    else dispatch(resetStatesForCity());
  }, [dispatch, formData.city]);

  const uniqueCities = useMemo(
    () => [
      ...new Map(
        (cities as City[])
          .filter((c) => c?.cityName)
          .map((c) => [c.cityName, c]),
      ).values(),
    ],
    [cities],
  );

  /* ---------- Handlers ---------- */
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name } = e.target;
      const value = NUMERIC_FIELDS.includes(name)
        ? e.target.value.replace(/\D/g, "")
        : e.target.value;

      setFormData((prev) =>
        // category badalne par sub-type reset
        name === "customerType"
          ? {
              ...prev,
              customerType: value,
              customerCategoryType: "",
              companyName: value === "Personal" ? "" : prev.companyName,
            }
          : { ...prev, [name]: value },
      );
    },
    [],
  );

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    const cityObj = uniqueCities.find((c) => c.cityName === city);
    setFormData((prev) => ({
      ...prev,
      city,
      cityId: cityObj?.id ? Number(cityObj.id) : undefined,
      state: "",
      stateId: undefined,
    }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    const stateObj = (statesForCity as StateItem[]).find(
      (s) => s.stateName === state,
    );
    setFormData((prev) => ({
      ...prev,
      state,
      stateId: stateObj?.id ? Number(stateObj.id) : undefined,
    }));
  };

  const handleFileChange =
    (key: DocKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] ?? null }));

  // search se customer select hua
  const applyCustomer = useCallback(
    (customer: any) => setFormData(mapCustomerToForm(customer)),
    [],
  );

  const handleBack = () => {
    if (onBack) onBack();
    else router.push("/dashboard?tab=customer-table");
  };

  /* ---------- field() : value + onChange + onBlur + error ek saath ---------- */
  const touch = (name: string) =>
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));

  const field = (name: TextKey): FieldBinding => ({
    name,
    value: formData[name] ?? "",
    onChange: handleChange,
    onBlur: () => touch(name),
    error: touched[name] ? errors[name] : undefined,
  });

  /* ---------- Submit ---------- */
  const resetForm = () => {
    setFormData(initialFormState);
    setFiles(initialFiles);
    setTouched({});
    setEditId(null);
    setSubmitError(null);
    dispatch(clearSearchResults());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // sab fields touched => saare errors dikhenge
    setTouched(
      Object.fromEntries(Object.keys(formData).map((k) => [k, true])),
    );
    if (Object.keys(errors).length > 0) return scrollToTop();

    setSaving(true);
    setSubmitError(null);

    try {
      const payload = buildCustomerPayload(formData);

      if (isEdit && editId) {
        await dispatch(
          updateCustomerThunk({ id: editId, data: payload }),
        ).unwrap();
      } else {
        await dispatch(createCustomerThunk(payload)).unwrap();
      }

      setSuccess(true);
      scrollToTop();
      if (isCreate) resetForm();

      setTimeout(() => {
        setSuccess(false);
        if (isEdit) handleBack();
      }, 2500);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(getErrorMessage(err));
      scrollToTop();
    } finally {
      setSaving(false);
    }
  };

  return {
    // mode
    isEdit,
    isView,
    isCreate,
    // data
    formData,
    files,
    cityNames: uniqueCities.map((c) => c.cityName),
    stateNames: (statesForCity as StateItem[]).map((s) => s.stateName),
    countries: countries as Country[],
    // status
    isLoadingCities,
    statesLoading,
    countriesLoading,
    saving: saving || customerLoading,
    submitDisabled: saving || isLoadingCities || statesLoading || customerLoading,
    error: submitError || customerError,
    success,
    // handlers
    field,
    handleChange,
    handleCityChange,
    handleStateChange,
    handleFileChange,
    handleSubmit,
    handleBack,
    applyCustomer,
  };
}