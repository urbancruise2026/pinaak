"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FileText, GripVertical, X } from "lucide-react";
import { OCCASION_OPTIONS } from "../../types/Editleads/editleaddata";
import SubCard from "./SubCard";
import FormField, { inputClass, labelClass, statInputClass } from "./FormField";
import type { LeadFormData } from "./schema";

interface ItineraryDetailsProps {
  itineraryList: string[];
  currentItinerary: string;
  setCurrentItinerary: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onReorder: (from: number, to: number) => void;
}

const ItineraryDetails: React.FC<ItineraryDetailsProps> = ({
  itineraryList,
  currentItinerary,
  setCurrentItinerary,
  onAdd,
  onRemove,
  onReorder,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<LeadFormData>();

  return (
    <SubCard title="Itinerary Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          label="Add Itinerary"
          icon={FileText}
          iconClassName="text-purple-600"
        >
          <input
            value={currentItinerary}
            onChange={(e) => setCurrentItinerary(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd();
              }
            }}
            className={inputClass}
            placeholder="Enter itinerary item"
          />
        </FormField>

        <div>
          <label className={labelClass}>
            Added Itineraries ({itineraryList.length}/25)
          </label>
          <div className="flex flex-wrap gap-2 overflow-y-auto max-h-32">
            {itineraryList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-2 py-1 text-sm text-purple-800 bg-purple-100 rounded cursor-move"
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("text/plain", idx.toString())
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const draggedIdx = parseInt(
                    e.dataTransfer.getData("text/plain"),
                  );
                  if (draggedIdx !== idx) onReorder(draggedIdx, idx);
                }}
              >
                <GripVertical size={14} className="text-purple-600" />
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
        <div>
          <label className={labelClass}>Actual KM</label>
          <div className="relative max-w-[180px]">
            <input
              type="number"
              {...register("km")}
              className={`${statInputClass} bg-purple-600 pl-6 pr-10`}
              placeholder="Total KM"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white pointer-events-none">
              📍
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold pointer-events-none">
              KM
            </span>
          </div>
          {errors.km && (
            <p className="mt-1 text-sm text-red-500">{errors.km.message}</p>
          )}
        </div>

        <FormField
          label="Occasion Type"
          icon={FileText}
          iconClassName="text-green-600"
        >
          <select {...register("occasion")} className={inputClass}>
            <option value="">Select Occasion Type</option>
            {OCCASION_OPTIONS.map((occasion) => (
              <option key={occasion} value={occasion}>
                {occasion}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </SubCard>
  );
};

export default ItineraryDetails;