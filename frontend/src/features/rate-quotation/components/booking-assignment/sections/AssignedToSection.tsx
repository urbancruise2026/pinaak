import React from "react";
import { Users } from "lucide-react";
import { FormTable, GroupRow, Section, TRow, bind, inputCls } from "../ui";
import type { SectionProps } from "../types";

export const AssignedToSection = ({
  form,
  set,
  errors,
  isPersonal,
  theme,
}: SectionProps) => (
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
              placeholder="New Milan Travels"
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

      {isPersonal ? (
        <>
          <GroupRow theme={theme}>Personal – passenger</GroupRow>
          <TRow
            a={{
              label: "Passenger name",
              children: (
                <input
                  {...bind(form, set, "passengerName")}
                  placeholder="Customer name"
                  className={inputCls}
                />
              ),
            }}
            b={{
              label: "Passenger phone",
              children: (
                <input
                  {...bind(form, set, "passengerPhone")}
                  inputMode="tel"
                  placeholder="98XXXXXXXX"
                  className={inputCls}
                />
              ),
            }}
          />
        </>
      ) : (
        <>
          <GroupRow theme={theme}>Corporate – client</GroupRow>
          <TRow
            a={{
              label: "Company name",
              children: (
                <input
                  {...bind(form, set, "companyName")}
                  placeholder="Client company"
                  className={inputCls}
                />
              ),
            }}
            b={{
              label: "Contact person",
              children: (
                <input
                  {...bind(form, set, "contactPerson")}
                  className={inputCls}
                />
              ),
            }}
          />
          <TRow
            a={{
              label: "Contact phone",
              children: (
                <input
                  {...bind(form, set, "contactPhone")}
                  inputMode="tel"
                  placeholder="98XXXXXXXX"
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
