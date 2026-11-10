"use client";

import React from "react";
import MultiSelectFilter, { FilterOption } from "@/components/ui/MultiSelectFilter";

interface VehicleFiltersProps {
  categoryOptions: FilterOption[];
  seatDropdownOptions: FilterOption[];
  variantOptions: FilterOption[];

  selectedCategories: string[];
  selectedSeats: string[];
  selectedVariants: string[];

  seatOptionsLoading?: boolean;

  setSelectedCategories: (values: string[]) => void;
  setSelectedSeats: (values: string[]) => void;
  setSelectedVariants: (values: string[]) => void;

  setCurrentPage?: (page: number) => void;

  clearAllFilters?: () => void;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  categoryOptions,
  seatDropdownOptions,
  variantOptions,

  selectedCategories,
  selectedSeats,
  selectedVariants,

  seatOptionsLoading,

  setSelectedCategories,
  setSelectedSeats,
  setSelectedVariants,

  setCurrentPage,
}) => {
  const handleChange = (
    setter: (values: string[]) => void,
    values: string[],
  ) => {
    setCurrentPage?.(1);
    setter(values);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MultiSelectFilter
        title="Category"
        options={categoryOptions}
        selected={selectedCategories}
        onChange={(v) => handleChange(setSelectedCategories, v)}
      />
      <MultiSelectFilter
        title="Seater"
        options={seatDropdownOptions}
        selected={selectedSeats}
        loading={seatOptionsLoading}
        onChange={(v) => handleChange(setSelectedSeats, v)}
      />
      <MultiSelectFilter
        title="Variant"
        options={variantOptions}
        selected={selectedVariants}
        onChange={(v) => handleChange(setSelectedVariants, v)}
      />
    </div>
  );
};

export default VehicleFilters;
