import React from "react";
import { IndianRupee } from "lucide-react";
import {
  FormTable,
  GroupRow,
  ReadOnly,
  Section,
  TRow,
  bind,
  inputCls,
} from "../ui";
import { InstallmentsTable } from "../components/InstallmentsTable";
import type { SectionProps } from "../types";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const PaymentSection = ({
  form,
  set,
  errors,
  isPersonal,
  theme,
  calc,
}: SectionProps) => (
  <Section
    title={isPersonal ? "Collect from Customer" : "Collect from UC"}
    icon={IndianRupee}
    theme={theme}
  >
    <FormTable>
      <TRow
        a={{
          label: "Total amount (₹)",
          required: true,
          error: errors.totalCost,
          children: (
            <input
              type="number"
              min={0}
              {...bind(form, set, "totalCost")}
              placeholder="194400"
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "Inclusions",
          children: (
            <input {...bind(form, set, "inclusions")} className={inputCls} />
          ),
        }}
      />
      <TRow
        a={{
          label: "Billing basis",
          children: (
            <input {...bind(form, set, "billingBasis")} className={inputCls} />
          ),
        }}
      />
      {!isPersonal && (
        <>
          <GroupRow theme={theme}>Corporate – package terms</GroupRow>
          <TRow
            a={{
              label: "Km limit",
              children: (
                <input
                  type="number"
                  min={0}
                  {...bind(form, set, "kmLimit")}
                  placeholder="500"
                  className={inputCls}
                />
              ),
            }}
            b={{
              label: "Booking advance paid (₹)",
              error: errors.bookingAdvance,
              children: (
                <input
                  type="number"
                  min={0}
                  {...bind(form, set, "bookingAdvance")}
                  placeholder="5000"
                  className={inputCls}
                />
              ),
            }}
          />
        </>
      )}
    </FormTable>

    <InstallmentsTable
      rows={form.installments}
      onChange={(rows) => set("installments", rows)}
      theme={theme}
      error={errors.installments}
    />

    <FormTable>
      <GroupRow theme={theme}>Auto-calculated</GroupRow>
      <TRow
        a={{
          label: "Allocated",
          hint: isPersonal ? "Sum of dates above" : "Booking advance + dates above",
          children: <ReadOnly>{inr(calc.allocated)}</ReadOnly>,
        }}
        b={{
          label: "Left to allocate",
          children: (
            <ReadOnly>
              {calc.total ? (calc.unallocated === 0 ? "Nil ✓" : inr(calc.unallocated)) : "—"}
            </ReadOnly>
          ),
        }}
      />
    </FormTable>
  </Section>
);
