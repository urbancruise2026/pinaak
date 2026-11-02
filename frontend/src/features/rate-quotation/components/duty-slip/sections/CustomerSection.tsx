import React from "react";
import { User } from "lucide-react";
import { dayPart } from "../utils";
import {
  FormTable,
  Section,
  TRow,
  bind,
  inputCls,
  textareaCls,
} from "../ui";
import type { SectionProps } from "../types";

export const CustomerSection = ({ form, set, errors, theme }: SectionProps) => (
  <Section title="Customer Details" icon={User} theme={theme}>
    <FormTable>
      <TRow
        a={{
          label: "Customer name",
          required: true,
          error: errors.customerName,
          children: (
            <input
              {...bind(form, set, "customerName")}
              placeholder="Mr. Ruchi Shanker"
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "Phone(s)",
          required: true,
          error: errors.customerPhone,
          hint: "Separate several numbers with  /",
          children: (
            <input
              {...bind(form, set, "customerPhone")}
              inputMode="tel"
              placeholder="99536 79856 / 98188 35145"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Pick-up address",
          required: true,
          error: errors.pickupAddress,
          children: (
            <textarea
              rows={2}
              {...bind(form, set, "pickupAddress")}
              className={textareaCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Google map link",
          children: (
            <input
              type="url"
              {...bind(form, set, "mapLink")}
              placeholder="https://maps.app.goo.gl/…"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Pick-up time",
          hint: form.pickupTime ? `Shown as: ${dayPart(form.pickupTime)}` : undefined,
          children: (
            <input
              type="time"
              {...bind(form, set, "pickupTime")}
              className={inputCls}
            />
          ),
        }}
      />
    </FormTable>
  </Section>
);
