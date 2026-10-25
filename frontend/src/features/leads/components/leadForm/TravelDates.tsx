"use client";

import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import { Calendar, MapPin } from "lucide-react";
import { RootState } from "@/store/store";
import {
  SERVICE_TYPE_OPTIONS,
  TRIP_TYPE_OPTIONS,
} from "../../types/Editleads/editleaddata";
import SubCard from "./SubCard";
import FormField, { inputClass, labelClass, statInputClass } from "./FormField";
import type { LeadFormData } from "./schema";

const Chevron = () => (
  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
);

const TravelDates: React.FC = () => {
const {
  register,
  control,
  setValue,
  formState: { errors },
} = useFormContext<LeadFormData>();
const { travelcity, loading } = useSelector(
  (state: RootState) => state.travelcity,
);

const pickupDateTime = useWatch({ control, name: "pickupDateTime" });
const serviceType = useWatch({ control, name: "serviceType" });

  const today = new Date();
  const minDate = today.toISOString().slice(0, 16);
  const maxDate = new Date(
    today.getFullYear() + 2,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .slice(0, 16);

  const serviceTypeField = register("serviceType");

  return (
    <SubCard title="Travel Dates">
      {/* Row 1: pickup */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <FormField
          label="Pickup Date & Time"
          icon={Calendar}
          iconClassName="text-purple-600"
          info
          className="w-full md:w-[20%]"
          error={errors.pickupDateTime?.message}
        >
          <input
            type="datetime-local"
            {...register("pickupDateTime")}
            min={minDate}
            max={maxDate}
            className={inputClass}
          />
        </FormField>

        <div className="w-full md:w-[20%]">
          <label className={labelClass}>Pickup City</label>
          <div className="relative">
            <select
              {...register("pickupcity")}
              className={`${inputClass} pr-8 appearance-none`}
            >
              <option value="">Select Pickup City</option>
              {travelcity?.map((city) => (
                <option key={city.id || city.uuid} value={city.cityName}>
                  {city.cityName}
                </option>
              ))}
            </select>
            <MapPin
              className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
              size={20}
            />
            <Chevron />
          </div>
          {errors.pickupcity && (
            <p className="mt-1 text-sm text-red-500">
              {errors.pickupcity.message}
            </p>
          )}
        </div>

        <FormField
          label="Pickup Address"
          icon={MapPin}
          iconClassName="text-purple-600"
          info
          className="w-full md:w-[40%]"
          error={errors.pickupAddress?.message}
        >
          <input
            {...register("pickupAddress")}
            className={inputClass}
            placeholder="Enter pickup address"
          />
        </FormField>

        <FormField
          label="Additional Pickup Addresses"
          icon={MapPin}
          iconClassName="text-purple-600"
          info
          className="w-full md:w-[30%]"
          error={errors.multiplepickup?.message}
        >
          <input
            {...register("multiplepickup")}
            className={inputClass}
            placeholder="multiple pickup city"
          />
        </FormField>

        <div className="w-full md:w-[10%]">
          <label className={labelClass}>No. of Days</label>
          <div className="relative group">
            <input
              type="number"
              {...register("days", { valueAsNumber: true })}
              readOnly={serviceType === "Pick & Drop"}
              className={`${statInputClass} pl-8 pr-8 ${
                serviceType === "Pick & Drop"
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600"
              }`}
              placeholder="Total Days"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold pointer-events-none">
              days
            </span>
          </div>
          {errors.days && (
            <p className="mt-1 text-sm text-red-500 text-center">
              {errors.days.message}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: drop + service */}
      <div className="flex flex-wrap md:flex-nowrap gap-4">
        <FormField
          label="Drop Date & Time"
          icon={Calendar}
          iconClassName="text-purple-600"
          className="w-full md:w-[20%]"
        >
          <input
            type="datetime-local"
            {...register("dropDateTime")}
            min={pickupDateTime || minDate}
            max={maxDate}
            className={inputClass}
          />
        </FormField>

        {serviceType !== "One Way" && (
          <>
            <div className="w-full md:w-[15%]">
              <label className={labelClass}>Drop City</label>
              <div className="relative">
                {loading ? (
                  <div className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
                    Loading cities...
                  </div>
                ) : (
                  <select
                    {...register("dropcity")}
                    className={`${inputClass} pr-8 appearance-none`}
                  >
                    <option value="">Select Drop City</option>
                    {travelcity?.length > 0 ? (
                      travelcity.map((city) => (
                        <option key={city.id || city.uuid} value={city.cityName}>
                          {city.cityName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No cities available</option>
                    )}
                  </select>
                )}
                <MapPin
                  className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                  size={20}
                />
                {!loading && <Chevron />}
              </div>
              {errors.dropcity && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.dropcity.message}
                </p>
              )}
            </div>

            <div className="w-full md:w-[30%]">
              <label className={labelClass}>Drop Address</label>
              <input
                {...register("dropAddress")}
                className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Address"
              />
            </div>

            <FormField
              label="Additional Drop Addresses"
              icon={MapPin}
              iconClassName="text-purple-600"
              info
              className="w-full md:w-[30%]"
              error={errors.multipledrop?.message}
            >
              <input
                {...register("multipledrop")}
                className={inputClass}
                placeholder="multiple pickup city"
              />
            </FormField>
          </>
        )}

        <div className="w-full md:w-[15%]">
          <label className={labelClass}>Service</label>
          <select
            {...serviceTypeField}
            onChange={(e) => {
              serviceTypeField.onChange(e);
              if (e.target.value === "Pick & Drop") setValue("days", 2);
            }}
            className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {SERVICE_TYPE_OPTIONS.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        {(serviceType === "Round Trip" ||
          serviceType === "Round Trip Drop") && (
          <div className="w-full md:w-[20%]">
            <label className={labelClass}>Trip Type</label>
            <div className="flex items-center gap-6 mt-2">
              {TRIP_TYPE_OPTIONS.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={type}
                    {...register("tripType")}
                    className="accent-blue-500"
                  />
                  <span className="text-sm font-semibold">{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </SubCard>
  );
};

export default TravelDates;