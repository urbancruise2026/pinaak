"use client";

import React, { useState } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  GitBranch,
  ChevronDown,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

import { Section } from "../rateQuotationFormComponents/FormParts";
import { THEMES as T } from "../rateQuotationFormComponents/constants";

export type PaymentRow = {
  id: string;
  date: string;
  description: string;
  amount: number | string;
  recipient: string;
  status: "PAID" | "PENDING";
  children: PaymentRow[];
};

export type BookingBalancePaymentData = {
  totalTripCost: number | string;
  bookingAmount: number | string;
  bookingAmountRecipient: string;
  bookingAmountStatus: "PAID" | "PENDING";
  payments: PaymentRow[];
};

type Props = {
  value: BookingBalancePaymentData;
  onChange: (value: BookingBalancePaymentData) => void;
};

const createPaymentRow = (): PaymentRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  date: "",
  description: "",
  amount: "",
  recipient: "UC",
  status: "PENDING",
  children: [],
});

const formatAmount = (amount: number | string) =>
  (Number(amount) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

function getPaidTotal(rows: PaymentRow[]): number {
  return rows.reduce((total, row) => {
    const ownAmount = row.status === "PAID" ? Number(row.amount) || 0 : 0;

    return total + ownAmount + getPaidTotal(row.children);
  }, 0);
}

function updateNestedRow(
  rows: PaymentRow[],
  id: string,
  updater: (row: PaymentRow) => PaymentRow,
): PaymentRow[] {
  return rows.map((row) =>
    row.id === id
      ? updater(row)
      : {
          ...row,
          children: updateNestedRow(row.children, id, updater),
        },
  );
}

function removeNestedRow(rows: PaymentRow[], id: string): PaymentRow[] {
  return rows
    .filter((row) => row.id !== id)
    .map((row) => ({
      ...row,
      children: removeNestedRow(row.children, id),
    }));
}

function PaymentRowItem({
  row,
  depth,
  onUpdate,
  onAddNested,
  onRemove,
}: {
  row: PaymentRow;
  depth: number;
  onUpdate: (id: string, patch: Partial<PaymentRow>) => void;
  onAddNested: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={`space-y-3 rounded-xl border border-gray-200 bg-white p-4 ${
        depth > 0 ? "ml-4 border-l-4 border-l-blue-200 md:ml-8" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-800"
        >
          {expanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
          <GitBranch size={16} className="text-blue-600" />
          {row.description || `Payment ${depth + 1}`}
          {row.children.length > 0 && (
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
              {row.children.length} nested
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onRemove(row.id)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          <Trash2 size={15} />
          Remove
        </button>
      </div>

      {expanded && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Payment Date
              </label>
              <input
                type="date"
                value={row.date}
                onChange={(e) => onUpdate(row.id, { date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Description
              </label>
              <input
                type="text"
                value={row.description}
                onChange={(e) =>
                  onUpdate(row.id, { description: e.target.value })
                }
                placeholder="e.g. 4th Apr payment / Extra KM / Parking"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={row.amount}
                onChange={(e) => onUpdate(row.id, { amount: e.target.value })}
                placeholder="Enter amount"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Payment To
              </label>
              <select
                value={row.recipient}
                onChange={(e) =>
                  onUpdate(row.id, { recipient: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="UC">UC</option>
                <option value="Driver">Driver</option>
                <option value="Vendor">Vendor</option>
                <option value="Customer">Customer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Payment Status
              </label>
              <select
                value={row.status}
                onChange={(e) =>
                  onUpdate(row.id, {
                    status: e.target.value as PaymentRow["status"],
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddNested(row.id)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            <GitBranch size={15} />
            Add Nested Row
          </button>

          {row.children.length > 0 && (
            <div className="space-y-3 border-l border-dashed border-gray-300 pl-2">
              {row.children.map((child) => (
                <PaymentRowItem
                  key={child.id}
                  row={child}
                  depth={depth + 1}
                  onUpdate={onUpdate}
                  onAddNested={onAddNested}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BookingBalancePayment({ value, onChange }: Props) {
  const [bookingExpanded, setBookingExpanded] = useState(true);

  const totalTripCost = Number(value.totalTripCost) || 0;
  const bookingAmount = Number(value.bookingAmount) || 0;

  const scheduledPaid = getPaidTotal(value.payments);

  const bookingAmountPaid =
    value.bookingAmountStatus === "PAID" ? bookingAmount : 0;

  const totalPaid = bookingAmountPaid + scheduledPaid;
  const balanceAmount = totalTripCost - totalPaid;

  const patchRow = (id: string, patch: Partial<PaymentRow>) => {
    onChange({
      ...value,
      payments: updateNestedRow(value.payments, id, (row) => ({
        ...row,
        ...patch,
      })),
    });
  };

  const addNestedRow = (id: string) => {
    onChange({
      ...value,
      payments: updateNestedRow(value.payments, id, (row) => ({
        ...row,
        children: [...row.children, createPaymentRow()],
      })),
    });
  };

  const addRow = () => {
    onChange({
      ...value,
      payments: [...value.payments, createPaymentRow()],
    });
  };

  const removeRow = (id: string) => {
    onChange({
      ...value,
      payments: removeNestedRow(value.payments, id),
    });
  };

  return (
    <Section
      theme={T.notes}
      Icon={Wallet}
      title="Booking Balance & Payment"
      gridClassName="space-y-4"
    >
      <div className="col-span-full space-y-5">
        {/* Trip Cost, Booking Amount and Balance */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Total Trip Cost (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={value.totalTripCost}
              onChange={(e) =>
                onChange({
                  ...value,
                  totalTripCost: e.target.value,
                })
              }
              placeholder="23000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
            <p className="mt-3 text-lg font-bold text-gray-900">
              ₹ {formatAmount(value.totalTripCost)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Booking Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={value.bookingAmount}
              onChange={(e) =>
                onChange({
                  ...value,
                  bookingAmount: e.target.value,
                })
              }
              placeholder="5000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />

            <div className="mt-3 space-y-2">
              <select
                value={value.bookingAmountRecipient}
                onChange={(e) =>
                  onChange({
                    ...value,
                    bookingAmountRecipient: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="UC">Paid to UC</option>
                <option value="Driver">Paid to Driver</option>
                <option value="Vendor">Paid to Vendor</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={value.bookingAmountStatus}
                onChange={(e) =>
                  onChange({
                    ...value,
                    bookingAmountStatus: e.target.value as "PAID" | "PENDING",
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">Balance Amount</p>
            <p className="mt-2 text-2xl font-bold text-amber-900">
              ₹ {formatAmount(balanceAmount)}
            </p>
            <p className="mt-2 text-xs text-amber-800">
              Pending balance = trip cost − total paid.
            </p>
            {balanceAmount < 0 && (
              <p className="mt-2 text-xs font-semibold text-red-700">
                Overpaid by ₹ {formatAmount(Math.abs(balanceAmount))}
              </p>
            )}
          </div>
        </div>

        {/* Booking Amount Details */}
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setBookingExpanded(!bookingExpanded)}
            className="flex w-full items-center justify-between gap-3 bg-gray-50 p-4 text-left"
          >
            <span className="font-semibold text-gray-800">
              Booking Amount Details
            </span>
            {bookingExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>

          {bookingExpanded && (
            <div className="space-y-2 p-4 text-sm">
              <p>
                Booking Amount:{" "}
                <strong>₹ {formatAmount(value.bookingAmount)}</strong>
              </p>
              <p>
                Recipient: <strong>{value.bookingAmountRecipient}</strong>
              </p>
              <p>
                Status: <strong>{value.bookingAmountStatus}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Payment Schedule */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Payment Schedule
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add payment dates, amounts, extra KM, parking and nested rows.
              </p>
            </div>

            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Row
            </button>
          </div>

          {value.payments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center">
              <CalendarDays className="mx-auto mb-2 text-gray-400" size={26} />
              <p className="text-sm font-medium text-gray-700">
                No scheduled payments added
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Click Add Row to add a payment.
              </p>
            </div>
          ) : (
            value.payments.map((row) => (
              <PaymentRowItem
                key={row.id}
                row={row}
                depth={0}
                onUpdate={patchRow}
                onAddNested={addNestedRow}
                onRemove={removeRow}
              />
            ))
          )}
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            Payment Summary
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <p>
              Total Paid: <strong>₹ {formatAmount(totalPaid)}</strong>
            </p>
            <p>
              Payment Rows: <strong>{value.payments.length}</strong>
            </p>
            <p>
              Balance Pending: <strong>₹ {formatAmount(balanceAmount)}</strong>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
