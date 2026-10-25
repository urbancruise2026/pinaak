"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  X,
  IndianRupee,
  Car,
  Tag,
  AlignLeft,
  Plus,
  Trash2,
  Percent,
  Hash,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchVehicles } from "@/features/vehicles/vehicleSlice";
import { createRateQuotation } from "@/features/rate-quotation/rateSlice";
import type { LeadRecord } from "@/types/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VehicleSlot {
  vehicleType: string;
  category: string;
  description: string;
  amount: number | string;
  noOfVehicles: number | string;
}

interface RateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadRecord | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_SLOT: VehicleSlot = {
  vehicleType: "",
  category: "",
  description: "",
  amount: "",
  noOfVehicles: 1,
};

const CATEGORY_OPTIONS = [
  { value: "economy ", label: "Economy " },
  { value: " premium", label: " Premium" },
  { value: "royal", label: "Royal" },
  { value: "royal vip", label: "Royal VIP" },
];

// ✅ GST % dropdown ke options
const GST_OPTIONS = [
  { value: "0", label: "0%" },
  { value: "5", label: "5%" },
  { value: "18", label: "18%" },
];

const MIN_ROWS = 1; // kam se kam kitni rows honi chahiye (delete se neeche na jaye)
const MAX_ROWS = 10; // add row ki upper limit
const INITIAL_ROWS = 1; // shuruat me kitni rows dikhengi (baaki Add Row se aayengi)

// ─── Component ────────────────────────────────────────────────────────────────

const RateQuotationModel = ({
  isOpen,
  onClose,
  lead,
}: RateQuotationModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  // Lead info (display only)
  const [leadInfo, setLeadInfo] = useState<LeadRecord | null>(null);

  // Vehicle slots — ab dynamic array hai (1 se start, "Add Row" se 10 tak badh sakti hai)
  const [slots, setSlots] = useState<VehicleSlot[]>([{ ...EMPTY_SLOT }]);

  // ✅ Global GST % — "Add Row" button ke paas GST dropdown ke liye (saari vehicles pe apply hota hai)
  const [gstPercentage, setGstPercentage] = useState<string>("0");
  const [isGstOpen, setIsGstOpen] = useState(false);

  // Redux
  const { vehicleCodes } = useSelector((state: RootState) => state.vehicle);
  const { createLoading, createSuccess } = useSelector(
    (state: RootState) => state.rate,
  );

  // ── Effects ────────────────────────────────────────────────────────────────

  // Fetch vehicles on open
  useEffect(() => {
    if (isOpen && vehicleCodes.length === 0) {
      dispatch(fetchVehicles());
    }
  }, [isOpen, dispatch, vehicleCodes.length]);

  // Close on success
  useEffect(() => {
    if (createSuccess) {
      onClose();
    }
  }, [createSuccess, onClose]);

  // Populate from lead when modal opens
  useEffect(() => {
    if (!lead) return;

    setLeadInfo(lead);

    const lead_ = lead as any;

    const vehicles = Array.isArray(lead_?.vehicles) ? lead_.vehicles : [];

    if (vehicles.length > 0) {
      // Lead me jitni vehicles already hain utni hi rows bana do (max 10)
      const mapped: VehicleSlot[] = vehicles.map((v: any) => ({
        vehicleType: v?.vehicleType || "",
        category: v?.category || "",
        description: v?.description || "",
        amount: v?.amount || "",
        noOfVehicles: v?.noOfVehicles || 1,
      }));

      const rowCount = Math.min(mapped.length, MAX_ROWS);
      setSlots(mapped.slice(0, rowCount));
    } else {
      // Naya lead — sirf 1 empty row se start, baaki "Add Row" se aayengi
      setSlots(Array.from({ length: INITIAL_ROWS }, () => ({ ...EMPTY_SLOT })));
    }
  }, [lead]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Update a single field in a specific slot
  const updateSlot = (
    index: number,
    field: keyof VehicleSlot,
    value: string | number,
  ) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    );
  };

  // ✅ Add a new empty vehicle row (max 10 tak)
  const addRow = () => {
    setSlots((prev) => {
      if (prev.length >= MAX_ROWS) return prev;
      return [...prev, { ...EMPTY_SLOT }];
    });
  };

  // ✅ Remove a specific vehicle row (min 1 row rehni chahiye)
  const removeRow = (index: number) => {
    setSlots((prev) => {
      if (prev.length <= MIN_ROWS) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  // Get vehicle display name from code
  const getVehicleName = (code: string) => {
    if (!code || vehicleCodes.length === 0) return "";
    const v = vehicleCodes.find((v: { code: string }) => v.code === code);
    return v ? `${v.code} - ${v.name}` : code;
  };

  // ✅ Ek slot ka GST amount + total nikalne wala helper
  // (Amount x No. of Vehicles = base, phir usi pe global GST % lagta hai)
  const getGstBreakdown = (slot: VehicleSlot) => {
    const rate = Number(slot.amount) || 0;
    const qty = Number(slot.noOfVehicles) || 0;
    const base = rate * qty;
    const gstPct = Number(gstPercentage) || 0;
    const gstAmount = (base * gstPct) / 100;
    const total = base + gstAmount;
    return { rate, qty, base, gstPct, gstAmount, total };
  };

  // Build final payload and dispatch
  const handleSave = async () => {
    const lead_ = lead as any;

    const vehiclesArray = slots
      .filter((slot) => slot.vehicleType !== "")
      .map((slot) => {
        const { rate, qty, base, gstPct, gstAmount, total } =
          getGstBreakdown(slot);
        return {
          vehicleType: slot.vehicleType,
          category: slot.category,
          description: slot.description,
          amount: rate,
          noOfVehicles: qty,
          subTotal: base,
          gstPercentage: gstPct,
          gstAmount,
          totalAmount: total,
        };
      });

    if (vehiclesArray.length === 0) {
      alert("Kam se kam ek vehicle select karo.");
      return;
    }

    // ✅ Get advisorId from Redux store or localStorage
    const advisorId =
      localStorage.getItem("advisorId") ||
      lead_?.advisorId ||
      lead_?.advisor_id ||
      null;

    const payload = {
      leadId: lead_?.leadId || lead_?.id || lead_?.lead_id,
      customerId: lead_?.customerId || lead_?.customer_id,
      vehicles: vehiclesArray,
      advisorId: advisorId ? Number(advisorId) : null, // ✅ Add this
    };

    try {
      const res = await dispatch(createRateQuotation(payload)).unwrap();
      onClose();
    } catch (error) {
      console.error("Rate Quotation Failed:", error);
    }
  };

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!isOpen || !leadInfo) return null;

  const lead_ = leadInfo as any;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        {/* ── Header ── */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Rate Quotation</h2>
            <p className="text-sm text-blue-600 font-medium mt-0.5">
              {lead_?.fullName || lead_?.customerName || lead_?.name || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ── Lead Info ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <InfoItem
              label="Name"
              value={lead_?.customerName || lead_?.fullName}
            />
            <InfoItem label="Phone" value={lead_?.phone} />
            <InfoItem label="Pax" value={lead_?.passengerTotal} />
            <InfoItem label="Pickup" value={lead_?.pickupAddress} />
            <InfoItem label="Drop" value={lead_?.dropAddress} />
            <InfoItem label="Service Type" value={lead_?.serviceType} />
          </div>

          {/* ── Vehicle Slots Header + GST Dropdown + Add Row Button ── */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Vehicles ({slots.length}/{MAX_ROWS})
            </h3>
            <div className="flex items-center gap-2">
              {/* ✅ GST Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsGstOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-semibold transition-colors"
                >
                  <Percent size={16} />
                  GST: {gstPercentage}%
                </button>

                {isGstOpen && (
                  <>
                    {/* Backdrop to close dropdown on outside click */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsGstOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      {GST_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setGstPercentage(opt.value);
                            setIsGstOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-rose-50 transition-colors ${
                            gstPercentage === opt.value
                              ? "text-rose-600 font-semibold bg-rose-50"
                              : "text-gray-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Add Row Button */}
              <button
                type="button"
                onClick={addRow}
                disabled={slots.length >= MAX_ROWS}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-50"
              >
                <Plus size={16} />
                Add Row
              </button>
            </div>
          </div>

          {/* ── Vehicle Slots ── */}
          <div className="space-y-5">
            {slots.map((slot, index) => (
              <VehicleRow
                key={index}
                index={index}
                slot={slot}
                vehicleCodes={vehicleCodes}
                getVehicleName={getVehicleName}
                onChange={updateSlot}
                onRemove={removeRow}
                canRemove={slots.length > MIN_ROWS}
                gstBreakdown={getGstBreakdown(slot)}
              />
            ))}
          </div>

          {/* ── Add Row Button (bottom, easy access after scrolling) ── */}
          <div className="mt-4">
            <button
              type="button"
              onClick={addRow}
              disabled={slots.length >= MAX_ROWS}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-blue-200"
            >
              <Plus size={16} />
              {slots.length >= MAX_ROWS
                ? `Maximum ${MAX_ROWS} vehicles allowed`
                : "Add Another Vehicle"}
            </button>
          </div>

          {/* ── Grand Total (sabhi vehicles ka amount + GST) ── */}
          {slots.some((s) => s.vehicleType) && (
            <div className="mt-5 flex justify-end">
              <div className="w-full sm:w-72 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {slots
                      .filter((s) => s.vehicleType)
                      .reduce((sum, s) => sum + getGstBreakdown(s).base, 0)
                      .toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>GST</span>
                  <span>
                    ₹
                    {slots
                      .filter((s) => s.vehicleType)
                      .reduce((sum, s) => sum + getGstBreakdown(s).gstAmount, 0)
                      .toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-800 pt-1.5 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span>
                    ₹
                    {slots
                      .filter((s) => s.vehicleType)
                      .reduce((sum, s) => sum + getGstBreakdown(s).total, 0)
                      .toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer Buttons ── */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createLoading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Rate Quotation"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateQuotationModel;

// ─── Sub-components ───────────────────────────────────────────────────────────

// Single lead info cell
const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div>
    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
      {label}
    </span>
    <p className="text-sm text-gray-800 font-medium mt-0.5">{value || "—"}</p>
  </div>
);

// One vehicle row (type + category + description + amount + no. of vehicles + GST%)
const VehicleRow = ({
  index,
  slot,
  vehicleCodes,
  getVehicleName,
  onChange,
  onRemove,
  canRemove,
  gstBreakdown,
}: {
  index: number;
  slot: VehicleSlot;
  vehicleCodes: { code: string; name: string }[];
  getVehicleName: (code: string) => string;
  onChange: (
    index: number,
    field: keyof VehicleSlot,
    value: string | number,
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  gstBreakdown: {
    rate: number;
    qty: number;
    base: number;
    gstPct: number;
    gstAmount: number;
    total: number;
  };
}) => {
  const num = index + 1;

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:border-blue-200 transition-colors">
      {/* Row label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {num}
        </span>
        <span className="text-sm font-semibold text-gray-700">
          Vehicle {num}
        </span>
        {slot.vehicleType && (
          <span className="ml-auto text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
            {getVehicleName(slot.vehicleType)}
          </span>
        )}
        {/* ✅ Remove row button (sirf tab dikhega jab 1 se zyada rows hongi) */}
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            title="Remove this vehicle"
            className={`${slot.vehicleType ? "" : "ml-auto"} p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Vehicle Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Vehicle Type
          </label>
          <div className="relative">
            <Car
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none"
            />
            <select
              value={slot.vehicleType}
              onChange={(e) => onChange(index, "vehicleType", e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Select type {num}</option>
              {vehicleCodes.length > 0 ? (
                vehicleCodes.map(
                  (v: { code: string; name: string }, i: number) => (
                    <option key={`${v.code}-${num}-${i}`} value={v.code}>
                      {v.code} - {v.name}
                    </option>
                  ),
                )
              ) : (
                <option disabled>Loading...</option>
              )}
            </select>
          </div>
        </div>

        {/* Category / Variant */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Variant{" "}
          </label>
          <div className="relative">
            <Tag
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none"
            />
            <select
              value={slot.category}
              onChange={(e) => onChange(index, "category", e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Variant</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Description
          </label>
          <div className="relative">
            <AlignLeft
              size={16}
              className="absolute left-3 top-3 text-gray-400 pointer-events-none"
            />
            <textarea
              value={slot.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
              placeholder="AC, Non-AC, model year..."
              rows={2}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* ✅ No. of Vehicles */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            No. of Vehicles
          </label>
          <div className="relative">
            <Hash
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none"
            />
            <input
              type="number"
              value={slot.noOfVehicles}
              onChange={(e) => onChange(index, "noOfVehicles", e.target.value)}
              placeholder="1"
              min={1}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Amount (per vehicle rate) */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Rate per Vehicle (₹)
          </label>
          <div className="relative">
            <IndianRupee
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none"
            />
            <input
              type="number"
              value={slot.amount}
              onChange={(e) => onChange(index, "amount", e.target.value)}
              placeholder="0"
              min={0}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* ✅ Qty x Rate + GST wala breakdown, header ke GST dropdown se apply hota hai */}
          {slot.amount !== "" && (
            <p className="text-[11px] text-gray-400 mt-1">
              {gstBreakdown.qty} × ₹{gstBreakdown.rate.toLocaleString("en-IN")}
              {gstBreakdown.gstPct > 0 && (
                <>
                  {" "}
                  +{gstBreakdown.gstPct}% GST (₹
                  {gstBreakdown.gstAmount.toLocaleString("en-IN")})
                </>
              )}{" "}
              ={" "}
              <span className="font-semibold text-gray-600">
                ₹{gstBreakdown.total.toLocaleString("en-IN")}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
