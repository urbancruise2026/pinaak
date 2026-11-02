import React from "react";
import { ScrollText } from "lucide-react";
import {
  FormTable,
  Section,
  TRow,
  bind,
  inputCls,
  textareaCls,
} from "../ui";
import type { SectionProps } from "../types";

export const TermsSection = ({ form, set, theme }: SectionProps) => (
  <Section title="Terms & Conditions" icon={ScrollText} theme={theme}>
    <FormTable>
      <TRow
        a={{
          label: "1. Parking / Entry",
          children: (
            <input {...bind(form, set, "parking")} className={inputCls} />
          ),
        }}
      />
      <TRow
        a={{
          label: "2. Extra km (₹/km)",
          hint: "Blank = Nill",
          children: (
            <input
              type="number"
              min={0}
              {...bind(form, set, "extraKm")}
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "Extra hour (₹/hr)",
          hint: "Blank = Nill",
          children: (
            <input
              type="number"
              min={0}
              {...bind(form, set, "extraHr")}
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "3. DA applies after",
          children: (
            <input
              {...bind(form, set, "daAfterTime")}
              placeholder="11:00 PM"
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "DA amount (₹)",
          children: (
            <input
              type="number"
              min={0}
              {...bind(form, set, "daAmount")}
              placeholder="500"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "After 1 AM (₹/hr)",
          children: (
            <input
              type="number"
              min={0}
              {...bind(form, set, "daPerHourAfter1Am")}
              placeholder="500"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Additional notes",
          children: (
            <textarea
              rows={2}
              {...bind(form, set, "notes")}
              placeholder="Anything else the vendor must know"
              className={textareaCls}
            />
          ),
        }}
      />
    </FormTable>
  </Section>
);
