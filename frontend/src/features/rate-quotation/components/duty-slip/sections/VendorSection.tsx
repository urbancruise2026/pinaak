import React from "react";
import { Users } from "lucide-react";
import { FormTable, Section, TRow, bind, inputCls } from "../ui";
import type { SectionProps } from "../types";

export const VendorSection = ({ form, set, errors, theme }: SectionProps) => (
  <Section title="Assigned To" icon={Users} theme={theme}>
    <FormTable>
      <TRow
        a={{
          label: "Vendor name",
          required: true,
          error: errors.vendorName,
          children: (
            <input
              {...bind(form, set, "vendorName")}
              placeholder="Mr. Jai Yadav"
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "Vendor company",
          children: (
            <input
              {...bind(form, set, "vendorCompany")}
              placeholder="Gajraj Travels"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Vendor city",
          children: (
            <input
              {...bind(form, set, "vendorCity")}
              placeholder="Delhi"
              className={inputCls}
            />
          ),
        }}
      />
    </FormTable>
  </Section>
);
