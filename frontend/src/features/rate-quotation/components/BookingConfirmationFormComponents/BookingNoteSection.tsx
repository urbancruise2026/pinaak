"use client";

import React from "react";
import {
  CheckCircle2,
  ReceiptText,
  BadgeCheck,
  ClipboardCheck,
} from "lucide-react";

import { Section } from "../rateQuotationFormComponents/FormParts";
import { THEMES as T } from "../rateQuotationFormComponents/constants";

export interface BookingConfirmationData {
  receivedAmount: number | string;
  bookingId: string;
  bookingStatus: "CONFIRMED" | "PENDING" | "CANCELLED";
}

interface BookingConfirmationSectionProps {
  value: BookingConfirmationData;
  onChange: (data: BookingConfirmationData) => void;
}

export default function BookingConfirmationSection({
  value,
  onChange,
}: BookingConfirmationSectionProps) {
  const updateField = <K extends keyof BookingConfirmationData>(
    field: K,
    fieldValue: BookingConfirmationData[K],
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <Section
      theme={T.notes}
      Icon={ClipboardCheck}
      title="Booking Confirmation"
      gridClassName="space-y-4"
    >
      <div className="col-span-full grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Booking Amount */}
        <div className="space-y-2">
          <label
            htmlFor="receivedAmount"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <ReceiptText size={18} />
            Booking Amount Received (₹)
          </label>

          <input
            id="receivedAmount"
            type="number"
            min="0"
            step="0.01"
            value={value.receivedAmount}
            onChange={(e) => updateField("receivedAmount", e.target.value)}
            placeholder="Enter booking amount"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Booking ID */}
        <div className="space-y-2">
          <label
            htmlFor="bookingId"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <BadgeCheck size={18} />
            Booking ID
          </label>

          <input
            id="bookingId"
            type="text"
            value={value.bookingId}
            onChange={(e) => updateField("bookingId", e.target.value)}
            placeholder="Enter booking ID"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Booking Status */}
        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="bookingStatus"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <CheckCircle2 size={18} />
            Booking Status
          </label>

          <select
            id="bookingStatus"
            value={value.bookingStatus}
            onChange={(e) =>
              updateField(
                "bookingStatus",
                e.target.value as BookingConfirmationData["bookingStatus"],
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 md:col-span-2">
          <p className="mb-3 text-sm font-semibold text-gray-700">
            Booking Notes Preview
          </p>

          <p className="text-sm text-gray-600">
            Booking Amount Received: Rs.{" "}
            {(Number(value.receivedAmount) || 0).toLocaleString("en-IN")}/-
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Booking ID: {value.bookingId || "Not assigned"}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Booking Status: {value.bookingStatus}
          </p>
        </div>
      </div>
    </Section>
  );
}
