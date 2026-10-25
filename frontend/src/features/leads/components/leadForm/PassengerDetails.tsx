"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FileText } from "lucide-react";
import SubCard from "./SubCard";
import FormField, { inputClass, labelClass, statInputClass } from "./FormField";
import type { LeadFormData } from "./schema";

const PassengerDetails: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<LeadFormData>();

  return (
    <SubCard title="Passenger Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Total Passengers</label>
          <div className="relative max-w-[180px]">
            <input
              type="number"
              {...register("passengerTotal", { valueAsNumber: true })}
              className={`${statInputClass} bg-purple-600`}
              placeholder="Total Pax"
              min="1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold pointer-events-none">
              Pax
            </span>
          </div>
          {errors.passengerTotal && (
            <p className="mt-1 text-sm text-red-500">
              {errors.passengerTotal.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Number of Pets</label>
          <div className="relative max-w-[180px]">
            <input
              type="number"
              {...register("petsNumber", { valueAsNumber: true })}
              className={`${statInputClass} bg-red-600`}
              placeholder="No. of pets"
              min="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold pointer-events-none">
              pets
            </span>
          </div>
        </div>

        <FormField
          label="Pet Names"
          icon={FileText}
          iconClassName="text-purple-800"
        >
          <input
            {...register("petsNames")}
            className={inputClass}
            placeholder="Enter pet names"
          />
        </FormField>
      </div>
    </SubCard>
  );
};

export default PassengerDetails;