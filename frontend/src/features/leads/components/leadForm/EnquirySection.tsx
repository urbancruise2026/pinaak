"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { Calendar, FileText } from "lucide-react";
import { RootState } from "@/store/store";
import { SOURCE_OPTIONS } from "../../types/Editleads/editleaddata";
import FormSection from "./FormSection";
import FormField, { inputClass, labelClass } from "./FormField";
import type { LeadFormData } from "./schema";

const EnquirySection: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<LeadFormData>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  return (
    <FormSection step={1} title="Enquiry Information" theme="blue">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField
          label="Lead Date & Time"
          icon={Calendar}
          iconClassName="text-blue-800"
          info
          error={errors.date?.message}
        >
          <input
            type="datetime-local"
            {...register("date")}
            className={inputClass}
          />
        </FormField>

        <FormField
          label="Source"
          icon={FileText}
          info
          error={errors.source?.message}
        >
          <select {...register("source")} className={inputClass}>
            <option value="">Select Source Type</option>
            {SOURCE_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </FormField>

        {/* Presales (read-only, comes from the logged-in user) */}
        <div>
          <label className={labelClass}>Presales</label>
          <div className="relative">
            <div className="w-full py-2 pl-10 pr-3 border bg-gray-100 border-gray-300 rounded-md text-gray-700 min-h-[40px] flex items-center">
              {currentUser ? (
                <span className="font-medium text-gray-800">
                  {currentUser.fullName ||
                    currentUser.name ||
                    `User #${currentUser.id}`}
                </span>
              ) : (
                <span className="text-gray-400 animate-pulse">Loading...</span>
              )}
            </div>
            <FileText
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
              size={20}
            />
          </div>
          {!currentUser && (
            <p className="text-amber-600 text-xs mt-1">
              ⚠ Waiting for user session...
            </p>
          )}
        </div>

        <FormField label="City" icon={FileText} info>
          <select
            {...register("city_id", { valueAsNumber: true })}
            className={inputClass}
          >
            <option value="">Select City</option>
            {Array.isArray(currentUser?.city_ids) &&
            currentUser.city_ids.length > 0 ? (
              currentUser.city_ids.map((id: number, index: number) => (
                <option key={id} value={id}>
                  {Array.isArray(currentUser?.city_names) &&
                  currentUser.city_names[index]
                    ? currentUser.city_names[index]
                    : `City ${id}`}
                </option>
              ))
            ) : (
              <option disabled>No cities available</option>
            )}
          </select>
        </FormField>
      </div>
    </FormSection>
  );
};

export default EnquirySection;