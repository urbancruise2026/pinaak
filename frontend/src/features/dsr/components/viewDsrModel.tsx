"use client";

import React from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  CreditCard,
  BadgeIndianRupee,
} from "lucide-react";
import { DsrRecord } from "@/types/types";
import { DSR_TABLE_BANNER, GROUP_COLORS } from "./DsrTableHeader";

interface Props {
  dsr: DsrRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: string | number | undefined) => {
  if (!value || value === "0" || value === 0) return "₹0";

  const num = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: any;
}) => (
  <div className="flex gap-3 items-start">
    <div className="text-blue-500 mt-1">{icon}</div>

    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
        {label}
      </p>

      <p className="text-sm text-gray-800 font-medium break-words">
        {value || "—"}
      </p>
    </div>
  </div>
);

const Section = ({
  title,
  icon,
  bg,
  border,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  children: React.ReactNode;
}) => (
  <div className={`${bg} rounded-2xl p-5`}>
    <div
      className={`flex items-center gap-2 text-lg font-semibold mb-5 pb-3 border-b ${border}`}
    >
      {icon}
      {title}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
  </div>
);

export default function ViewDsrModal({ dsr, isOpen, onClose }: Props) {
  if (!isOpen || !dsr) return null;

  const customer =
    Array.isArray(dsr.customer_amount) && dsr.customer_amount.length > 0
      ? dsr.customer_amount[0]
      : {};

  const vendor =
    Array.isArray(dsr.vendor_amount) && dsr.vendor_amount.length > 0
      ? dsr.vendor_amount[0]
      : {};

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-100 rounded-[28px] overflow-hidden shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-orange-600 p-6 flex justify-between items-start text-white">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-400 flex items-center justify-center text-2xl font-bold">
              {dsr.fullName?.charAt(0) || "D"}
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {dsr.fullName || "DSR Details"}
              </h2>

              <p className="text-orange-100">
                Booking ID: {dsr.bookingId || "—"}
              </p>

              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-500 text-xs font-medium">
                {dsr.status || "Active"}
              </span>
            </div>
          </div>

          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {[...new Set(DSR_TABLE_BANNER.map((col) => col.groupLabel))].map(
            (group) => {
              const columns = DSR_TABLE_BANNER.filter(
                (col) => col.groupLabel === group && col.key !== "actions",
              );

              const colors = GROUP_COLORS[group];

              return (
                <Section
                  key={group}
                  title={group}
                  icon={<User className="text-gray-700" />}
                  bg={colors?.light || "bg-gray-50"}
                  border="border-gray-200"
                >
                  {columns.map((column) => {
                    const customer =
                      Array.isArray(dsr.customer_amount) &&
                      dsr.customer_amount.length > 0
                        ? dsr.customer_amount[0]
                        : {};

                    const vendor =
                      Array.isArray(dsr.vendor_amount) &&
                      dsr.vendor_amount.length > 0
                        ? dsr.vendor_amount[0]
                        : {};

                    const customerMap: Record<string, any> = {
                      customerAmountReceivedDate: customer?.amountReceivedDate,
                      cusomerUcBankName: customer?.ucBankName,
                      customerBankName: customer?.customerBankName,
                      customerAmount_received: customer?.bookingAmount,
                      customerAtherAmount: customer?.otherAmount,
                      customerTransactionId: customer?.transactionId,
                      customerRemarksAmountReceived: customer?.remarks,
                      customerEnteredBy: customer?.enteredBy,
                    };

                    const vendorMap: Record<string, any> = {
                      vendorAmountReceivedDate: vendor?.amountReceivedDate,
                      vendorUcBankName: vendor?.ucBankName,
                      vendorCustomerBankName: vendor?.customerBankName,
                      vendorTransactionId: vendor?.transactionId,
                      vendorBookingAmount: vendor?.bookingAmount,
                      vendorOtherAmount: vendor?.otherAmount,
                      vendorRemarksAmountReceived: vendor?.remarks,
                      vendorEnteredBy: vendor?.enteredBy,
                    };

                    let value =
                      customerMap[column.key] ??
                      vendorMap[column.key] ??
                      dsr[column.key as keyof DsrRecord];

                    const currencyFields = [
                      "customer_rate",
                      "customer_toll",
                      "park_tax",
                      "gst_amt",
                      "tds",
                      "remaining_amount",
                      "total",
                      "vendor_rate",
                      "vendor_toll",
                      "vendor_park_tax",
                      "customer_to_vendor",
                      "outstanding",
                      "balance_amount",
                      "rate",
                      "pay",
                      "final_balance",
                      "before_amt",
                      "final_amt",
                      "gst",
                    ];

                    if (currencyFields.includes(column.key)) {
                      value = formatCurrency(value);
                    }

                    const dateFields = [
                      "dsr_date",
                      "pickupDateTime",
                      "dropDateTime",
                      "customerAmountReceivedDate",
                      "vendorAmountReceivedDate",
                    ];

                    if (dateFields.includes(column.key) && value) {
                      value = new Date(value).toLocaleDateString("en-IN");
                    }

                    return (
                      <InfoItem
                        key={column.key}
                        icon={<User size={18} />}
                        label={column.label}
                        value={value}
                      />
                    );
                  })}
                </Section>
              );
            },
          )}

          {/* CUSTOMER PAYMENT ADD ROW */}
          {Array.isArray(dsr.customer_amount) &&
            dsr.customer_amount.length > 0 && (
              <Section
                title="Customer Payment Rows"
                icon={<BadgeIndianRupee className="text-orange-600" />}
                bg="bg-orange-50"
                border="border-orange-200"
              >
                <div className="col-span-3 overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead className="bg-orange-100">
                      <tr>
                        <th className="p-2 border">Amount</th>
                        <th className="p-2 border">Other Amount</th>
                        <th className="p-2 border">Transaction ID</th>
                        <th className="p-2 border">Bank</th>
                        <th className="p-2 border">Remarks</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dsr.customer_amount.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="border p-2">
                            {formatCurrency(item.bookingAmount)}
                          </td>
                          <td className="border p-2">
                            {formatCurrency(item.otherAmount)}
                          </td>
                          <td className="border p-2">
                            {item.transactionId || "—"}
                          </td>
                          <td className="border p-2">
                            {item.ucBankName || "—"}
                          </td>
                          <td className="border p-2">{item.remarks || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

          {/* VENDOR PAYMENT ADD ROW */}
          {Array.isArray(dsr.vendor_amount) && dsr.vendor_amount.length > 0 && (
            <Section
              title="Vendor Payment Rows"
              icon={<BadgeIndianRupee className="text-purple-600" />}
              bg="bg-purple-50"
              border="border-purple-200"
            >
              <div className="col-span-3 overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="p-2 border">Amount</th>
                      <th className="p-2 border">Other Amount</th>
                      <th className="p-2 border">Transaction ID</th>
                      <th className="p-2 border">Bank</th>
                      <th className="p-2 border">Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dsr.vendor_amount.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="border p-2">
                          {formatCurrency(item.bookingAmount)}
                        </td>
                        <td className="border p-2">
                          {formatCurrency(item.otherAmount)}
                        </td>
                        <td className="border p-2">
                          {item.transactionId || "—"}
                        </td>
                        <td className="border p-2">{item.ucBankName || "—"}</td>
                        <td className="border p-2">{item.remarks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </div>
        {/* Footer */}
        <div className="bg-white border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
