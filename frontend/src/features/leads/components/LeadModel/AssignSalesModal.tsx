// AssignSalesModal.tsx

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { toast } from "react-toastify";
import {
  fetchTravelAdvisors,
  assignTravelAdvisor,
} from "@/features/user/accessSlice";
import { X, UserCheck, ChevronDown, Check } from "lucide-react";

const AssignSalesModal = ({ isOpen, onClose, leadId, cityId }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const { advisors, loading, assignLoading } = useSelector(
    (state: RootState) => state.travelAdvisor,
  );

  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen && cityId) {
      dispatch(fetchTravelAdvisors(cityId));
    }
  }, [isOpen, cityId, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAssign = async () => {
    if (!selectedAdvisorId) {
      toast.warning("Please select an advisor first ⚠️");
      return;
    }

    try {
      await dispatch(
        assignTravelAdvisor({
          leadId,
          travelAdvisorId: selectedAdvisorId,
        }),
      ).unwrap();

      toast.success("Assigned successfully ✅");
      onClose();
      setSelectedAdvisorId(null);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Assignment failed ❌");
    }
  };

  const selectedAdvisor = advisors.find((a: any) => a.id === selectedAdvisorId);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      {/* Modal - Auto height with max height */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header - Fixed */}
        <div className="border-b border-gray-100 px-6 py-5 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Assign Travel Advisor
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select an advisor for this lead
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div
          className="overflow-y-auto flex-1"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          <div className="p-6">
            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                Loading advisors...
              </div>
            )}

            {/* Empty */}
            {!loading && advisors.length === 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                No advisors found for this city
              </div>
            )}

            {/* Custom Dropdown */}
            {!loading && advisors.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Choose Advisor
                </label>

                <div className="relative" ref={dropdownRef}>
                  {/* Dropdown Button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:border-gray-300 transition"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck size={18} className="text-gray-400" />
                      <span
                        className={
                          selectedAdvisorId ? "text-gray-900" : "text-gray-500"
                        }
                      >
                        {selectedAdvisorId && selectedAdvisor
                          ? selectedAdvisor.fullName
                          : "Select a travel advisor"}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`transition-all duration-200 overflow-hidden ${
                      isDropdownOpen
                        ? "max-h-60 opacity-100 mt-1"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden">
                      <div className="max-h-48 overflow-y-auto">
                        {advisors.map((advisor: any) => {
                          // Backend se is_online directly advisor object pe aati hai
                          const isOnline = !!advisor.is_online;

                          return (
                            <button
                              key={advisor.id}
                              onClick={() => {
                                setSelectedAdvisorId(advisor.id);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                            >
                              <div className="flex items-center gap-2">
                                {/* Status Dot */}
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    isOnline ? "bg-green-500" : "bg-red-500"
                                  }`}
                                />

                                <span>{advisor.fullName || advisor.name}</span>

                                <span
                                  className={`text-xs ${
                                    isOnline ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {isOnline ? "Online" : "Offline"}
                                </span>
                              </div>

                              {selectedAdvisorId === advisor.id && (
                                <Check size={16} className="text-blue-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div
              className={`mt-8 flex items-center justify-end gap-3 transition-all duration-200 ${
                isDropdownOpen ? "mt-6" : "mt-8"
              }`}
            >
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleAssign}
                disabled={!selectedAdvisorId || assignLoading}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200
                  ${
                    !selectedAdvisorId || assignLoading
                      ? "cursor-not-allowed bg-gray-300"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                  }`}
              >
                {assignLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Assigning...
                  </span>
                ) : (
                  "Assign Advisor"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignSalesModal;
