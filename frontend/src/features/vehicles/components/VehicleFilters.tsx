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
    <div className="relative z-[100] flex flex-wrap items-center gap-2 overflow-visible">
      {" "}
      {/* Category */}
      <MultiSelectFilter
        title="Category"
        options={categoryOptions}
        selected={selectedCategories}
        onChange={(values) => handleChange(setSelectedCategories, values)}
      />
      {/* Seater */}
      <MultiSelectFilter
        title="Seater"
        options={seatDropdownOptions}
        selected={selectedSeats}
        loading={seatOptionsLoading}
        onChange={(values) => handleChange(setSelectedSeats, values)}
      />
      {/* Variant */}
      <MultiSelectFilter
        title="Variant"
        options={variantOptions}
        selected={selectedVariants}
        onChange={(values) => handleChange(setSelectedVariants, values)}
      />
    </div>
  );
};

export default VehicleFilters;
