"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { markUnwanted } from "../../leadSlice";
import { AppDispatch } from "@/store/store";
import type { LeadRecord } from "@/types/types";

interface UnwantedModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadRecord;
}

type SelectionType = "unwanted" | "wanted";

const UnwantedModal: React.FC<UnwantedModalProps> = ({
  isOpen,
  onClose,
  lead,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [selected, setSelected] = useState<SelectionType>("unwanted");
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setErrorMsg(null);
      setSelected("unwanted");
      setIsDone(false);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const leadName = lead.customerName || lead.fullName || "this lead";
  const isUnwanted = selected === "unwanted";

  const handleSubmit = async () => {
    if (!lead?.id || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await dispatch(
        markUnwanted({ id: Number(lead.id), unwanted_status: selected }),
      ).unwrap();
      setIsDone(true);
      setTimeout(() => onClose(), 700);
    } catch (error: any) {
      setErrorMsg(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="flex items-start gap-3">
            {/* Status icon */}
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg transition-colors duration-200 ${
                isUnwanted
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {isUnwanted ? "✕" : "✓"}
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-black">
                Update lead status
              </h2>
              <p className="mt-0.5 text-[13px] text-gray-500">
                For <span className="font-semibold text-black">{leadName}</span>
              </p>
            </div>
          </div>

          {/* Close button — red */}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-colors hover:border-red-500 hover:bg-red-100 disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <div className="flex flex-col gap-2">
            {/* Option: Unwanted */}
            <button
              type="button"
              onClick={() => setSelected("unwanted")}
              disabled={isSubmitting}
              className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition-all duration-150 disabled:cursor-not-allowed ${
                isUnwanted
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                  isUnwanted ? "border-red-600 bg-red-600" : "border-gray-300"
                }`}
              >
                {isUnwanted && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-black">
                  Move to Unwanted
                </span>
                <span className="block text-xs text-gray-500">
                  Flagged and removed from active pipeline
                </span>
              </span>
            </button>

            {/* Option: Wanted */}
            <button
              type="button"
              onClick={() => setSelected("wanted")}
              disabled={isSubmitting}
              className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition-all duration-150 disabled:cursor-not-allowed ${
                !isUnwanted
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                  !isUnwanted
                    ? "border-green-700 bg-green-700"
                    : "border-gray-300"
                }`}
              >
                {!isUnwanted && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-black">
                  Keep as Wanted
                </span>
                <span className="block text-xs text-gray-500">
                  Lead stays active in your pipeline
                </span>
              </span>
            </button>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              <span>⚠</span>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          {/* Cancel — purple hover */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border-[1.5px] border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-black transition-colors hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Confirm */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex min-w-[95px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-all active:scale-[0.97] disabled:cursor-not-allowed ${
              isDone
                ? "bg-green-700"
                : isSubmitting
                  ? "bg-gray-400"
                  : isUnwanted
                    ? "bg-red-700 hover:bg-red-500"
                    : "bg-green-700 hover:bg-green-500"
            }`}
          >
            {isDone ? (
              <>✓ Done</>
            ) : isSubmitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Updating...
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnwantedModal;
