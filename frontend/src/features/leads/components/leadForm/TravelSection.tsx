"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FileText } from "lucide-react";
import FormSection from "./FormSection";
import FormField from "./FormField";
import TravelDates from "./TravelDates";
import ItineraryDetails from "./ItineraryDetails";
import PassengerDetails from "./PassengerDetails";
import BaggageDetails from "./BaggageDetails";
import VehicleDetails from "./VehicleDetails";
import type { LeadFormData } from "./schema";

interface TravelSectionProps {
  itineraryList: string[];
  currentItinerary: string;
  setCurrentItinerary: (value: string) => void;
  onAddItinerary: () => void;
  onRemoveItinerary: (index: number) => void;
  onReorderItinerary: (from: number, to: number) => void;
}

const TravelSection: React.FC<TravelSectionProps> = ({
  itineraryList,
  currentItinerary,
  setCurrentItinerary,
  onAddItinerary,
  onRemoveItinerary,
  onReorderItinerary,
}) => {
  const { register } = useFormContext<LeadFormData>();

  return (
    <FormSection step={3} title="Travel Requirements" theme="purple">
      <TravelDates />

      <ItineraryDetails
        itineraryList={itineraryList}
        currentItinerary={currentItinerary}
        setCurrentItinerary={setCurrentItinerary}
        onAdd={onAddItinerary}
        onRemove={onRemoveItinerary}
        onReorder={onReorderItinerary}
      />

      <PassengerDetails />
      <BaggageDetails />
      <VehicleDetails />

      <div className="mt-6">
        <FormField label="Remark" icon={FileText} iconClassName="text-green-600">
          <textarea
            {...register("remarks")}
            rows={4}
            placeholder="Enter your remark..."
            className="w-full py-2 pl-10 pr-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </FormField>
      </div>
    </FormSection>
  );
};

export default TravelSection;