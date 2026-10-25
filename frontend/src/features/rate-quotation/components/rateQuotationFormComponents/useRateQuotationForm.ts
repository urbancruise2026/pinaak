"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import type {
  EditableLeadFormProps,
  LeadData,
  LeadTab,
  VehicleData,
} from "./types";

import { EMPTY_FORM, EMPTY_VEHICLE, MAX_VEHICLES } from "./constants";

import { createRateQuotation } from "../../RateQuotationSlice";
import type { CreateQuotationPayload } from "../../RateQuotationApi";

import type { FormCharge, FormNote } from "./ChargesNotesSection";

type ChangeEvt = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;


export function formatDateTimeForInput(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/* =========================================================
   FRESH FORM
========================================================= */

const freshForm = (): LeadData => ({
  ...EMPTY_FORM,
  vehicles: [
    {
      ...EMPTY_VEHICLE,
    },
  ],
});

/* =========================================================
   VEHICLE MAPPING
========================================================= */

function mapVehicle(v: any): VehicleData {
  return {
    id: v?.id,
    image: v?.image ?? v?.vehicleImage ?? v?.vehicle_image ?? "",
    seating: v?.seating ?? v?.seatingCapacity ?? v?.seating_capacity ?? "",
    make: v?.make ?? v?.vehicleMake ?? v?.vehicle_make ?? "",
    variant: v?.variant ?? v?.vehicleVariant ?? v?.vehicle_variant ?? "",
    modelYear: v?.modelYear ?? v?.model_year ?? "",
    noOfVehicles:
      v?.noOfVehicles ??
      v?.no_of_vehicles ??
      v?.numberOfVehicles ??
      v?.number_of_vehicles ??
      1,
    discountedPrice: v?.discountedPrice ?? v?.discounted_price ?? v?.price ?? 0,
  };
}

/* =========================================================
   NUMBER HELPER
========================================================= */

const toNumOrNull = (v: unknown) =>
  v === "" || v === undefined || v === null ? null : Number(v);

/* =========================================================
   HOOK
========================================================= */

export function useRateQuotationForm({
  lead,
  onSuccess,
}: Pick<EditableLeadFormProps, "lead" | "onSuccess">) {
  const dispatch = useDispatch<any>();

  const [form, setForm] = useState<LeadData>(freshForm);
  const [activeTab, setActiveTab] = useState<LeadTab>("personal");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     LOAD LEAD
  ========================================================= */

  useEffect(() => {
    setActiveTab("personal");

    if (!lead) {
      setForm(freshForm());
      return;
    }

    const leadVehicles = Array.isArray(lead.vehicles) ? lead.vehicles : [];

    setForm({
      id: lead.id,

      /* CUSTOMER ID */
      customer_id:
        (lead as any).customer_id ?? (lead as any).customerId ?? undefined,

      customerId:
        (lead as any).customerId ?? (lead as any).customer_id ?? undefined,

      /* CUSTOMER */
      firstName: lead.firstName ?? "",     
      middleName: lead.middleName ?? "",
      lastName: lead.lastName ?? "",
      customerPhone: lead.customerPhone ?? "",
      countryName: lead.countryName ?? "",
      companyName: lead.companyName ?? "",
      /* TRIP */
      serviceType: lead.serviceType ?? "",
      occasion: lead.occasion ?? "",
      tripType: lead.tripType ?? "",

      pickupDateTime: formatDateTimeForInput(lead.pickupDateTime),

      dropDateTime: formatDateTimeForInput(lead.dropDateTime),
customerCity: lead.customerCity ?? "",
      days: lead.days ?? "",
      passengerTotal: lead.passengerTotal ?? "",

      /* PICKUP / DROP */
      pickupcity: lead.pickupcity ?? "",
      dropcity: lead.dropcity ?? "",
      pickupAddress: lead.pickupAddress ?? "",
      dropAddress: lead.dropAddress ?? "",
      multiplepickup: lead.multiplepickup ?? "",
      multipledrop: lead.multipledrop ?? "",

      /* REMARKS */
      itinerary: lead.itinerary ?? "",
      remarks: lead.remarks ?? "",

      /* VEHICLES */
      vehicles:
        leadVehicles.length > 0
          ? leadVehicles.map(mapVehicle)
          : [
              {
                ...EMPTY_VEHICLE,
              },
            ],
    });
  }, [lead]);

  /* =========================================================
     CLEAR MESSAGES
  ========================================================= */

  const clearMessages = () => {
    setSuccess("");
    setError("");
  };

  /* =========================================================
     GENERIC FIELD
  ========================================================= */

  function handleChange(e: ChangeEvt) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearMessages();
  }

  function field(name: keyof Omit<LeadData, "vehicles" | "id">) {
    return {
      name: name as string,
      value: (form[name] as string | number | undefined) ?? "",
      onChange: handleChange,
    };
  }

  /* =========================================================
     VEHICLES
  ========================================================= */

  function updateVehicle(
    index: number,
    key: keyof VehicleData,
    value: string | number,
  ) {
    setForm((prev) => {
      const vehicles = [...(prev.vehicles || [])];

      if (!vehicles[index]) {
        return prev;
      }

      vehicles[index] = {
        ...vehicles[index],
        [key]: value,
      };

      return {
        ...prev,
        vehicles,
      };
    });

    clearMessages();
  }

  function handleVehicleImage(index: number, file?: File) {
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Vehicle image must be less than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () =>
      updateVehicle(index, "image", String(reader.result || ""));

    reader.readAsDataURL(file);
  }

  function addVehicle() {
    setForm((prev) => {
      const vehicles = prev.vehicles || [];

      if (vehicles.length >= MAX_VEHICLES) {
        return prev;
      }

      return {
        ...prev,
        vehicles: [
          ...vehicles,
          {
            ...EMPTY_VEHICLE,
          },
        ],
      };
    });
  }

  function removeVehicle(index: number) {
    setForm((prev) => {
      const vehicles = prev.vehicles || [];

      if (vehicles.length <= 1) {
        return {
          ...prev,
          vehicles: [
            {
              ...EMPTY_VEHICLE,
            },
          ],
        };
      }

      return {
        ...prev,
        vehicles: vehicles.filter((_, i) => i !== index),
      };
    });
  }

  /* =========================================================
     TOTALS
  ========================================================= */

  const { vehicleTotal, totalVehicles } = useMemo(() => {
    let amount = 0;
    let count = 0;

    (form.vehicles || []).forEach((v) => {
      const qty = Number(v.noOfVehicles) || 0;

      amount += (Number(v.discountedPrice) || 0) * qty;

      count += qty;
    });

    return {
      vehicleTotal: amount,
      totalVehicles: count,
    };
  }, [form.vehicles]);

  /* =========================================================
     SUBMIT
     
     GET  -> leads table
     POST -> quotations table
     
     Lead table ko update nahi karna.
  ========================================================= */

  async function handleSubmit(
    e: React.FormEvent,
    extraData?: {
      charges?: FormCharge[];
      notes?: FormNote[];
    },
  ) {
    e.preventDefault();

    if (!lead?.id) {
      setError("Lead ID is missing.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      /* =====================================================
         CUSTOMER ID
      ===================================================== */

      const customerId =
        (lead as any)?.customer_id ??
        (lead as any)?.customerId ??
        (form as any)?.customer_id ??
        (form as any)?.customerId;

      console.log("👤 Customer ID:", customerId);

      if (!customerId) {
        throw new Error(
          "customer_id is missing from this lead. Quotation cannot be created.",
        );
      }

      /* =====================================================
         RATE QUOTATION PAYLOAD
      ===================================================== */

      const t = (v?: unknown) =>
        Array.isArray(v) ? JSON.stringify(v) : typeof v === "string" ? v.trim() : "";

      const quotationPayload: CreateQuotationPayload = {
        customer_id: customerId,

        lead_id: lead.id,

        quote_date: new Date().toISOString(),

        valid_till: null,

        travel_detail: t(form.itinerary),

        pickup_location: t(form.pickupAddress),

        pickup_time: form.pickupDateTime || null,

        drop_location: t(form.dropAddress),

        drop_time: form.dropDateTime || null,

        travel_from: t(form.pickupcity),

        travel_to: t(form.dropcity),

        total_days: toNumOrNull(form.days) ?? 0,

        trip_type: t(form.tripType),

        pax: toNumOrNull(form.passengerTotal) ?? 0,

        remarks: t(form.remarks),

        offer_text: null,

        status: "DRAFT",

        /* ===================================================
           NOTES
        =================================================== */

        notes: (extraData?.notes || [])
          .filter((note) => note.note_text?.trim())
          .map((note, index) => ({
            note_text: note.note_text.trim(),

            sort_order: index + 1,
          })),

        /* ===================================================
           OTHER CHARGES
        =================================================== */

        other_charges: (extraData?.charges || [])
          .filter((charge) => charge.charge_name?.trim())
          .map((charge, index) => ({
            charge_name: charge.charge_name.trim(),

            charge_detail: charge.charge_detail?.trim() || null,

            is_included: Boolean(charge.is_included),

            sort_order: index + 1,
          })),

        /* ===================================================
           VEHICLE OPTIONS
        =================================================== */

        vehicle_options: (form.vehicles || [])
          .filter(
            (vehicle) =>
              vehicle.make?.trim() ||
              vehicle.variant?.trim() ||
              vehicle.seating?.trim() ||
              vehicle.modelYear !== "" ||
              vehicle.discountedPrice !== "",
          )
          .map((vehicle, index) => ({
            sr_no: index + 1,

            vehicle_manager_id: null,

            seats: Number(vehicle.seating) || null,

            vehicle_name:
              [vehicle.make, vehicle.variant]
                .filter(Boolean)
                .join(" ")
                .trim() || `Vehicle ${index + 1}`,

            category_name: null,

            no_of_vehicles: Number(vehicle.noOfVehicles) || 1,

            description: vehicle.image ? "Vehicle image added" : null,

            discounted_price: Number(vehicle.discountedPrice) || 0,

            vehicles: [],
          })),
      };

      console.log("📦 Rate quotation payload:", quotationPayload);

      /* =====================================================
         CREATE QUOTATION
         
         Redux Slice -> API -> quotations
      ===================================================== */

      const quotationResult = await dispatch(
        createRateQuotation(quotationPayload),
      ).unwrap();

      console.log("✅ Rate quotation created:", quotationResult);

      /* =====================================================
         SUCCESS
      ===================================================== */

      setSuccess(`Quotation ${quotationResult.quote_no} saved successfully.`);

      onSuccess?.({
        lead,
        quotation: quotationResult,
      });
    } catch (err: any) {
      console.error("❌ Quotation submit error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create quotation.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RETURN
  ========================================================= */

  return {
    form,
    field,
    handleChange,

    activeTab,

    setActiveTab: (tab: LeadTab) => {
      setActiveTab(tab);
      clearMessages();
    },

    updateVehicle,
    handleVehicleImage,
    addVehicle,
    removeVehicle,

    vehicleTotal,
    totalVehicles,

    handleSubmit,

    loading,
    success,
    error,
  };
}
