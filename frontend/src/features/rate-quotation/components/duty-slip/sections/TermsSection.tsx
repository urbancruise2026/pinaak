import React from "react";
import { ScrollText } from "lucide-react";
import { FormTable, Section, TRow, bind, inputCls } from "../ui";
import type { SectionProps } from "../types";

export const TermsSection = ({ form, set, theme }: SectionProps) => (
  <Section title="Terms" icon={ScrollText} theme={theme}>
    <FormTable>
      <TRow
        a={{
          label: "2. Parking / Entry",
          children: (
            <input {...bind(form, set, "parking")} className={inputCls} />
          ),
        }}
      />
      <TRow
        a={{
          label: "3. Extra km (₹/km)",
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
          label: "4. DA applies after",
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
              placeholder="1000"
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
              placeholder="1000"
              className={inputCls}
            />
          ),
        }}
      />
    </FormTable>
  </Section>
);
