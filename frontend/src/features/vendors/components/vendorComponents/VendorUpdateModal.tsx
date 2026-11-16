"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";
import type { AppDispatch } from "@/store/store";

import {
  STATUS_OPTIONS,
  VERIFICATION_OPTIONS,
  getStatus,
  getVerification,
  getVendorCode,
  getVendorName,
  type VendorStatus,
  type VendorVerification,
} from "./vendorHelpers";
import {
  updateVendorStatusThunk,
  updateVendorVerificationThunk,
} from "../../vendorSlice";

interface Props {
  vendor: any;
  onClose: () => void;
  onError: (message: string) => void;
}

const selectCls =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50";

const VendorUpdateModal: React.FC<Props> = ({ vendor, onClose, onError }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [status, setStatus] = useState<VendorStatus>(getStatus(vendor));
  const [verification, setVerification] = useState<VendorVerification>(
    (getVerification(vendor) as VendorVerification) || "pending",
  );
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    const id = Number(vendor.id);
    try {
      setUpdating(true);

      if (status !== getStatus(vendor)) {
        await dispatch(updateVendorStatusThunk({ id, status })).unwrap();
      }
      if (verification !== (getVerification(vendor) || "pending")) {
        await dispatch(
          updateVendorVerificationThunk({ id, verification }),
        ).unwrap();
      }

      onClose();
    } catch (err: any) {
      onClose();
      onError(typeof err === "string" ? err : "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const code = getVendorCode(vendor);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !updating && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Update Vendor
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {getVendorName(vendor)}
              {code !== "—" ? ` · ${code}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VendorStatus)}
              className={selectCls}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Verification
            </label>
            <select
              value={verification}
              onChange={(e) =>
                setVerification(e.target.value as VendorVerification)
              }
              className={selectCls}
            >
              {VERIFICATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="rounded-lg border border-slate-200 px-4 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updating}
            className="rounded-lg bg-orange-500 px-5 py-2 text-base font-medium text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorUpdateModal;
