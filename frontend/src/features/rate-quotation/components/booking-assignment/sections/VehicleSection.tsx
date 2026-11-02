import React from "react";
import { Car } from "lucide-react";
import { FormTable, Section, TRow, bind, inputCls } from "../ui";
import type { SectionProps } from "../types";

export const VehicleSection = ({
  form,
  set,
  errors,
  theme,
}: SectionProps) => (
  <Section title="Vehicle Details" icon={Car} theme={theme}>
    <FormTable>
      <TRow
        a={{
          label: "Vehicle model",
          required: true,
          error: errors.vehicleModel,
          children: (
            <input
              {...bind(form, set, "vehicleModel")}
              placeholder="Tata / Ashok Leyland 2x2, Crysta…"
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "Seats",
          children: (
            <input
              type="number"
              min={1}
              {...bind(form, set, "seats")}
              placeholder="53"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "No. of vehicles",
          children: (
            <input
              type="number"
              min={1}
              {...bind(form, set, "vehicleCount")}
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "A/C required",
          children: (
            <div className="inline-flex rounded-xl border border-slate-300 bg-slate-50 p-1">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => set("ac", v)}
                  className={`h-9 rounded-lg px-6 text-base font-semibold transition-colors ${
                    form.ac === v
                      ? `${theme.soft} shadow-sm ${theme.text}`
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {v ? "Yes" : "No"}
                </button>
              ))}
            </div>
          ),
        }}
      />
      <TRow
        a={{
          label: "Special requirements",
          children: (
            <input
              {...bind(form, set, "specialReq")}
              placeholder="ICE BOX, carrier, extra blanket…"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Vehicle no.",
          hint: "Vendor can fill later",
          children: (
            <input
              {...bind(form, set, "vehicleNo")}
              placeholder="AS01TC 4831"
              className={`${inputCls} uppercase`}
            />
          ),
        }}
        b={{
          label: "Driver name",
          children: (
            <input {...bind(form, set, "driverName")} className={inputCls} />
          ),
        }}
      />
      <TRow
        a={{
          label: "Driver phone",
          children: (
            <input
              {...bind(form, set, "driverPhone")}
              inputMode="tel"
              className={inputCls}
            />
          ),
        }}
      />
    </FormTable>
  </Section>
);
