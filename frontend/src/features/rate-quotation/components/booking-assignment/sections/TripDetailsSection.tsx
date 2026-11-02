import React from "react";
import { MapPin } from "lucide-react";
import { PURPOSES } from "../constants";
import {
  FormTable,
  ReadOnly,
  Section,
  TRow,
  bind,
  inputCls,
} from "../ui";
import { TripIdInput } from "../components/TripIdInput";
import { ItineraryTable } from "../components/ItineraryTable";
import type { SectionProps } from "../types";

export const TripDetailsSection = ({
  form,
  set,
  errors,
  theme,
  calc,
}: SectionProps) => (
  <Section
    title="Trip Details"
    icon={MapPin}
    theme={theme}
    badge={
      calc.totalDays
        ? `${calc.totalDays} day${calc.totalDays > 1 ? "s" : ""}`
        : undefined
    }
  >
    <FormTable>
      <TRow
        a={{
          label: "Trip ID(s)",
          required: true,
          error: errors.tripIds,
          hint: "Press Enter or comma to add. Multiple IDs allowed.",
          children: (
            <TripIdInput
              value={form.tripIds}
              onChange={(ids) => set("tripIds", ids)}
              theme={theme}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Start date",
          required: true,
          error: errors.startDate,
          children: (
            <input
              type="date"
              {...bind(form, set, "startDate")}
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "End date",
          required: true,
          error: errors.endDate,
          children: (
            <input
              type="date"
              min={form.startDate || undefined}
              {...bind(form, set, "endDate")}
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Total days",
          children: (
            <ReadOnly>{calc.totalDays ? `${calc.totalDays}` : "—"}</ReadOnly>
          ),
        }}
        b={{
          label: "Trip purpose",
          children: (
            <select {...bind(form, set, "purpose")} className={inputCls}>
              {PURPOSES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          ),
        }}
      />
    </FormTable>

    <ItineraryTable
      rows={form.itinerary}
      onChange={(rows) => set("itinerary", rows)}
      startDate={form.startDate}
      endDate={form.endDate}
      theme={theme}
    />
  </Section>
);
