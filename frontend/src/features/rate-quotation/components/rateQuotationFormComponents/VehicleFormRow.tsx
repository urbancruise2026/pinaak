"use client";

import React from "react";
import Image from "next/image";

import {
  Car,
  Trash2,
  IndianRupee,
  Hash,
  Image as ImageIcon,
  Armchair,
  Factory,
  Tag,
  CalendarDays,
} from "lucide-react";
import type { VehicleData } from "./types";
import { TextField, type Theme } from "./FormParts";

interface Props {
  index: number;
  vehicle: VehicleData;
  theme: Theme;
  canRemove: boolean;
  onChange: (
    index: number,
    field: keyof VehicleData,
    value: string | number,
  ) => void;
  onImageChange: (index: number, file?: File) => void;
  onRemove: (index: number) => void;
}

export default function VehicleFormRow({
  index,
  vehicle,
  theme,
  canRemove,
  onChange,
  onImageChange,
  onRemove,
}: Props) {
  const quantity = Number(vehicle.noOfVehicles) || 0;
  const price = Number(vehicle.discountedPrice) || 0;
  const total = quantity * price;

  const bind = (field: keyof VehicleData) => ({
    name: `vehicle-${index}-${field}`,
    value: vehicle[field] as string | number,
    onChange: (e: React.ChangeEvent<any>) =>
      onChange(index, field, e.target.value),
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.iconBox}`}
        >
          <Car size={17} />
        </span>
        <h4 className="text-sm font-semibold text-gray-900">
          Vehicle {index + 1}
        </h4>

        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={15} />
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Image */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            Vehicle Image
          </span>
          <label className="relative flex h-[42px] w-full cursor-pointer items-center rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-500 transition hover:border-orange-400">
            <ImageIcon
              size={17}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.icon}`}
            />
            <span className="truncate">
              {vehicle.image ? "Change image" : "Choose image"}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => onImageChange(index, e.target.files?.[0])}
            />
          </label>
          {vehicle.image && (
            <Image
              src={vehicle.image}
              alt={`Vehicle ${index + 1}`}
              width={64}
              height={48}
              unoptimized
              className="mt-2 h-12 w-16 rounded-md border border-gray-200 object-cover"
            />
          )}
        </div>

        <TextField
          label="Seating"
          Icon={Armchair}
          theme={theme}
          placeholder="e.g. 35 Seater"
          {...bind("seating")}
        />
        <TextField
          label="Make"
          Icon={Factory}
          theme={theme}
          placeholder="e.g. Toyota"
          {...bind("make")}
        />
        <TextField
          label="Variant"
          Icon={Tag}
          theme={theme}
          placeholder="e.g. Innova Crysta"
          {...bind("variant")}
        />
        <TextField
          label="Model Year"
          Icon={CalendarDays}
          theme={theme}
          type="number"
          min="1900"
          max="2100"
          placeholder="e.g. 2025"
          {...bind("modelYear")}
        />
        <TextField
          label="No. of Vehicles"
          Icon={Hash}
          theme={theme}
          type="number"
          min="1"
          placeholder="1"
          {...bind("noOfVehicles")}
        />
        <TextField
          label="Discounted Price"
          Icon={IndianRupee}
          theme={theme}
          type="number"
          min="0"
          placeholder="Enter price"
          {...bind("discountedPrice")}
        />

        <div className="flex items-end justify-end">
          <div className="w-full rounded-lg bg-orange-100 px-4 py-2 text-right">
            <p className="text-xs text-orange-700">Vehicle Total</p>
            <p className="text-base font-bold text-orange-800">
              ₹{total.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
