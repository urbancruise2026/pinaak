"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { FileText } from "lucide-react";
import { RootState } from "@/store/store";
import SubCard from "./SubCard";
import FormField, { inputClass, labelClass } from "./FormField";
import type { LeadFormData } from "./schema";

const VEHICLE_SLOTS = [
  {
    name: "vehicles",
    qty: "vehicle1Quantity",
    label: "Vehicle Type 1",
    placeholder: "Select Vehicle Type",
  },
  {
    name: "vehicle2",
    qty: "vehicle2Quantity",
    label: "Vehicle Type 2",
    placeholder: "Select Vehicle Type 2",
  },
  {
    name: "vehicle3",
    qty: "vehicle3Quantity",
    label: "Vehicle Type 3",
    placeholder: "Select Vehicle Type 3",
  },
] as const;

const VehicleDetails: React.FC = () => {
  const { register } = useFormContext<LeadFormData>();
  const { vehicleCodes } = useSelector((state: RootState) => state.vehicle);

  // Sort once by the number inside the code, then alphabetically
  const sortedVehicles = useMemo(
    () =>
      [...vehicleCodes].sort((a, b) => {
        const numA = parseInt(a.code.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.code.match(/\d+/)?.[0] || "0");
        if (numA !== numB) return numA - numB;
        return a.code.localeCompare(b.code);
      }),
    [vehicleCodes],
  );

  return (
    <SubCard title="Vehicle Details (Optional)">
      <div className="flex flex-wrap gap-4">
        {VEHICLE_SLOTS.map((slot) => (
          <div key={slot.name} className="w-full md:w-[20%]">
            <label className={labelClass}>{slot.label}</label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <select {...register(slot.name)} className={inputClass}>
                  <option value="">{slot.placeholder}</option>
                  {sortedVehicles.map(
                    (vehicle: { code: string; name: string }, index) => (
                      <option
                        key={`${vehicle.code}-${slot.name}-${index}`}
                        value={vehicle.code}
                      >
                        {vehicle.code}
                      </option>
                    ),
                  )}
                </select>
                <FileText
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none"
                  size={20}
                />
              </div>
              <input
                type="number"
                placeholder="Qty"
                className="w-20 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                min="1"
                {...register(slot.qty)}
              />
            </div>
          </div>
        ))}

        <FormField
          label="Total Vehicle Requirement"
          icon={FileText}
          iconClassName="text-purple-800"
          className="w-full md:w-[35%]"
        >
          <input
            {...register("requirementVehicle")}
            className={inputClass}
            placeholder="Auto-filled when vehicles selected"
            readOnly
          />
        </FormField>
      </div>
    </SubCard>
  );
};

export default VehicleDetails;