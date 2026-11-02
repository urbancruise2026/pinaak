import React from "react";
import { Car } from "lucide-react";
import { FormTable, GroupRow, Section, TRow, bind, inputCls } from "../ui";
import type { SectionProps } from "../types";

export const VehicleSection = ({
  form,
  set,
  errors,
  isPersonal,
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
              placeholder="Bharat Benz With Washroom, Crysta…"
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "Seats / berths",
          children: (
            <input
              type="number"
              min={1}
              {...bind(form, set, "seats")}
              placeholder="36"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
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
        b={{
          label: "Special requirements",
          children: (
            <input
              {...bind(form, set, "specialReq")}
              placeholder="ICE BOX"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Vehicle no.",
          hint: "Usually blank – vendor sends the same no. as in the assignment",
          children: (
            <input
              {...bind(form, set, "vehicleNo")}
              className={`${inputCls} uppercase`}
            />
          ),
        }}
      />
      {!isPersonal && (
        <>
          <GroupRow theme={theme}>Corporate – multiple vehicles</GroupRow>
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
          />
        </>
      )}
    </FormTable>
  </Section>
);
