"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserRound,
  User,
  Globe,
  Car,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Briefcase,
} from "lucide-react";

import FormPageHeader from "@/components/ui/PageHeader/FormPageHeader";

import {
  Section,
  TextField,
  PhoneField,
} from "../rateQuotationFormComponents/FormParts";

import VehicleFormRow from "../rateQuotationFormComponents/VehicleFormRow";

import ChargesNotesSection, {
  type FormCharge,
  type FormNote,
} from "../rateQuotationFormComponents/ChargesNotesSection";

import BookingConfirmationSection, {
  type BookingConfirmationData,
} from "./BookingNoteSection";

import BookingBalancePayment, {
  type BookingBalancePaymentData,
} from "./BookingBalancePayment";

import {
  THEMES as T,
  MAX_LENGTHS,
  MAX_VEHICLES,
} from "../rateQuotationFormComponents/constants";

import { useRateQuotationForm } from "../rateQuotationFormComponents/useRateQuotationForm";

import {
  fetchChargeTemplates,
  fetchNoteTemplates,
} from "../../RateQuotationSlice";

import TravelRequirementsSection from "../rateQuotationFormComponents/travelRequirement";

import type { EditableLeadFormProps } from "../rateQuotationFormComponents/types";

const PREFIX_BASE =
  "text-xs font-semibold text-center border-r bg-violet-100 text-violet-800 border-violet-200";

const TAB_COLORS = [
  {
    idle: "bg-violet-100 text-violet-700 hover:bg-violet-200",
    active: "bg-violet-700 text-white shadow-md",
  },
  {
    idle: "bg-sky-100 text-sky-700 hover:bg-sky-200",
    active: "bg-sky-700 text-white shadow-md",
  },
  {
    idle: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    active: "bg-emerald-700 text-white shadow-md",
  },
  {
    idle: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    active: "bg-amber-700 text-white shadow-md",
  },
];

type BookingConfirmationFormProps = EditableLeadFormProps & {
  onCancel?: () => void;
};

export default function BookingConfirmationForm({
  lead,
  onSuccess,
  onCancel,
}: BookingConfirmationFormProps) {
  const f = useRateQuotationForm({
    lead,
    onSuccess,
  });

  const dispatch = useDispatch<any>();

  const vehicleCount = f.form.vehicles?.length || 0;
  const maxReached = vehicleCount >= MAX_VEHICLES;

  const {
    charges: chargeTpl = [],
    notes: noteTpl = [],
    chargesLoading,
    notesLoading,
    chargesError,
    notesError,
  } = useSelector((s: any) => s.rateQuotation ?? {});

  // Charges and ordinary notes
  const [charges, setCharges] = useState<FormCharge[]>([]);
  const [notes, setNotes] = useState<FormNote[]>([]);

  // Booking Notes: amount, booking ID and status
  const [bookingConfirmation, setBookingConfirmation] =
    useState<BookingConfirmationData>({
      receivedAmount: "",
      bookingId: "",
      bookingStatus: "CONFIRMED",
    });

  // Payment details and nested payment rows
  const [paymentData, setPaymentData] = useState<BookingBalancePaymentData>({
    totalTripCost: 23000,
    bookingAmount: 5000,
    bookingAmountRecipient: "UC",
    bookingAmountStatus: "PAID",
    payments: [
      {
        id: "payment-1",
        date: "",
        description: "Second Payment",
        amount: 10000,
        recipient: "UC",
        status: "PENDING",
        children: [],
      },
      {
        id: "payment-2",
        date: "",
        description: "Third Payment",
        amount: 5000,
        recipient: "UC",
        status: "PENDING",
        children: [],
      },
      {
        id: "payment-3",
        date: "",
        description: "Extra KM / Parking",
        amount: "",
        recipient: "Driver",
        status: "PENDING",
        children: [],
      },
    ],
  });

  // Load charge and note templates
  useEffect(() => {
    dispatch(fetchChargeTemplates());
    dispatch(fetchNoteTemplates());
  }, [dispatch]);

  useEffect(() => {
    setCharges(
      chargeTpl.map((c: any) => ({
        charge_name: c.charge_name ?? "",
        charge_detail: c.charge_detail ?? "",
        is_included: false,
      })),
    );
  }, [chargeTpl]);

  useEffect(() => {
    setNotes(
      noteTpl.map((n: any) => ({
        note_text: n.note_text ?? "",
      })),
    );
  }, [noteTpl]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Existing submit handler is retained.
    // Booking/payment persistence must be wired to the booking API separately.
    return f.handleSubmit(e, {
      charges,
      notes,
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30">
        <FormPageHeader title="Booking Confirmation Form" />
      </div>

      <div className="mx-auto my-6 w-full rounded-lg bg-white p-4 md:p-6">
        {/* Navigation Tabs */}
        <div className="mb-6 grid w-full grid-cols-2 gap-2 border-b border-gray-200 pb-3 sm:grid-cols-4">
          {[
            { key: "customer", label: "Customer" },
            { key: "travel", label: "Travel" },
            { key: "vehicle", label: "Vehicle" },
            { key: "charges", label: "Charges & Notes" },
          ].map((tab, index) => {
            const color = TAB_COLORS[index];

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  document
                    .getElementById(`booking-section-${tab.key}`)
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }}
                className={`w-full whitespace-nowrap rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${color.idle}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {f.error && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <span className="font-medium">{f.error}</span>
          </div>
        )}

        {/* Success Message */}
        {f.success && (
          <div className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-5 py-3 text-green-700 shadow-lg">
            <CheckCircle2 size={20} />
            <span className="font-medium">{f.success}</span>
          </div>
        )}

        <form
          onSubmit={handleFormSubmit}
          className="space-y-5 [&_label]:!text-black [&_label]:!text-base [&_h1]:!text-2xl [&_h2]:!text-2xl [&_h3]:!text-2xl [&_h4]:!text-2xl"
        >
          {/* 1. Customer Information */}
          <div id="booking-section-customer" className="scroll-mt-28">
            <Section
              theme={T.customer}
              Icon={UserRound}
              title="Customer Information (Data From Lead Manager)"
            >
              <TextField
                label="First Name"
                Icon={User}
                theme={T.customer}
                placeholder="Enter first name"
                maxLength={MAX_LENGTHS.firstName}
                {...f.field("firstName")}
              />

              <TextField
                label="Middle Name"
                Icon={User}
                theme={T.customer}
                placeholder="Enter middle name"
                maxLength={MAX_LENGTHS.middleName}
                {...f.field("middleName")}
              />

              <TextField
                label="Last Name"
                Icon={User}
                theme={T.customer}
                placeholder="Enter last name"
                maxLength={MAX_LENGTHS.lastName}
                {...f.field("lastName")}
              />

              <PhoneField
                label="Phone No. (India)"
                theme={T.customer}
                placeholder="10 digit number"
                maxLength={MAX_LENGTHS.phone}
                prefix={
                  <div className={`min-w-[78px] px-3 py-2.5 ${PREFIX_BASE}`}>
                    +91 IND
                  </div>
                }
                {...f.field("customerPhone")}
                value={String(f.form.customerPhone ?? "")}
              />

              <PhoneField
                label="Phone No. (Other)"
                theme={T.customer}
                placeholder="Enter alternate phone"
                maxLength={MAX_LENGTHS.alternatephone}
                prefix={
                  <div className={`min-w-[78px] px-3 py-2.5 ${PREFIX_BASE}`}>
                    +91 IND
                  </div>
                }
                {...f.field("alternatephone")}
                value={String(f.form.alternatephone ?? "")}
              />

              <TextField
                label="Company Name"
                Icon={Briefcase}
                theme={T.customer}
                placeholder="Enter company name"
                maxLength={MAX_LENGTHS.companyName}
                {...f.field("companyName")}
              />

              <TextField
                label="Customer City"
                Icon={Briefcase}
                theme={T.customer}
                placeholder="Enter customer city"
                maxLength={MAX_LENGTHS.customerCity}
                {...f.field("customerCity")}
              />

              <TextField
                label="Country"
                Icon={Globe}
                theme={T.customer}
                placeholder="Enter country"
                maxLength={MAX_LENGTHS.countryName}
                {...f.field("countryName")}
              />
            </Section>
          </div>

          {/* 2. Travel Requirements */}
          <div id="booking-section-travel" className="scroll-mt-28">
            <TravelRequirementsSection f={f} number={2} />
          </div>

          {/* 3. Vehicle Options */}
          <div id="booking-section-vehicle" className="scroll-mt-28">
            <Section
              theme={T.vehicle}
              Icon={Car}
              title="Vehicle Options & Pricing"
              gridClassName="space-y-4"
              action={
                <button
                  type="button"
                  onClick={f.addVehicle}
                  disabled={maxReached}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${T.vehicle.button}`}
                >
                  <Plus size={16} />
                  Add Vehicle
                </button>
              }
            >
              {(f.form.vehicles || []).map((vehicle, index) => (
                <VehicleFormRow
                  key={vehicle.id ?? index}
                  index={index}
                  vehicle={vehicle}
                  theme={T.vehicle}
                  canRemove={vehicleCount > 1}
                  onChange={f.updateVehicle}
                  onImageChange={f.handleVehicleImage}
                  onRemove={f.removeVehicle}
                />
              ))}

              {/* Vehicle Totals */}
              <div className="flex flex-col gap-4 rounded-xl border border-orange-200 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-orange-700">
                  {maxReached
                    ? `Maximum ${MAX_VEHICLES} vehicles allowed`
                    : `${vehicleCount} of ${MAX_VEHICLES} vehicles added`}
                </p>

                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-gray-500">Total Vehicles</p>
                    <p className="mt-0.5 text-lg font-semibold text-gray-900">
                      {f.totalVehicles}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Total Discounted Price
                    </p>
                    <p className="mt-0.5 text-lg font-semibold text-orange-700">
                      ₹{f.vehicleTotal.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* 4. Charges and Ordinary Notes */}
          <div id="booking-section-charges" className="scroll-mt-28 space-y-5">
            <ChargesNotesSection
              charges={charges}
              notes={notes}
              chargesLoading={chargesLoading}
              notesLoading={notesLoading}
              chargesError={chargesError}
              notesError={notesError}
              onChargesChange={setCharges}
              onNotesChange={setNotes}
            />

            {/* 5. Booking Notes: amount, ID and status */}
            <BookingConfirmationSection
              value={bookingConfirmation}
              onChange={setBookingConfirmation}
            />

            {/* 6. Payment: trip cost, balance and Add Row */}
            <BookingBalancePayment
              value={paymentData}
              onChange={setPaymentData}
            />
          </div>

          {/* Submit and Back Buttons */}
          <div className="flex flex-col justify-center gap-3 border-t border-gray-200 pt-5 sm:flex-row">
            <button
              type="submit"
              disabled={f.loading}
              className="rounded-full bg-emerald-600 px-10 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {f.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Confirming Booking...
                </span>
              ) : (
                "Confirm Booking"
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={f.loading}
                className="rounded-full border border-gray-300 bg-gray-100 px-8 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50"
              >
                Back
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
