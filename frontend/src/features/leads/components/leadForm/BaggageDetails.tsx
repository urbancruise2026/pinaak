"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Luggage } from "lucide-react";
import SubCard from "./SubCard";
import FormField, { inputClass, labelClass, statInputClass } from "./FormField";
import type { LeadFormData } from "./schema";

const BAGGAGE_FIELDS = [
  { name: "smallbaggage", label: "Small Baggage" },
  { name: "mediumbaggage", label: "Medium Baggage" },
  { name: "largebaggage", label: "Large Baggage" },
  { name: "airportbaggage", label: "Airport Baggage" },
] as const;

const BaggageDetails: React.FC = () => {
  const { register } = useFormContext<LeadFormData>();

  return (
    <SubCard title="Baggage Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {BAGGAGE_FIELDS.map(({ name, label }) => (
          <FormField
            key={name}
            label={label}
            icon={Luggage}
            iconClassName="text-purple-800"
          >
            <input
              type="number"
              {...register(name, { valueAsNumber: true })}
              className={inputClass}
              placeholder={label}
            />
          </FormField>
        ))}

        <div>
          <label className={labelClass}>Total Baggage</label>
          <div className="relative group">
            <input
              type="number"
              {...register("totalbaggage", { valueAsNumber: true })}
              readOnly
              className={`${statInputClass} bg-purple-600 pl-8 pr-10`}
              placeholder="Total"
            />
            <Luggage
              className="absolute text-white -translate-y-1/2 left-3 top-1/2"
              size={20}
            />
          </div>
        </div>
      </div>
    </SubCard>
  );
};

export default BaggageDetails;