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
import type { SectionProps } from "../types";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const AmountSection = ({
  form,
  set,
  errors,
  isPersonal,
  theme,
  calc,
}: SectionProps) => (
  <Section title="Trip Amount" icon={IndianRupee} theme={theme}>
    <FormTable>
      <TRow
        a={{
          label: "Total trip cost (₹)",
          required: true,
          error: errors.totalCost,
          children: (
            <input
              type="number"
              min={0}
              {...bind(form, set, "totalCost")}
              placeholder="55000"
              className={inputCls}
            />
          ),
        }}
        b={{
          label: "Inclusions",
          children: (
            <input
              {...bind(form, set, "inclusions")}
              placeholder="All inclusive"
              className={inputCls}
            />
          ),
        }}
      />

      {isPersonal ? (
        <>
          <GroupRow theme={theme}>Personal – customer payment</GroupRow>
          <TRow
            a={{
              label: "Collect from customer (₹)",
              error: errors.customerCollect,
              hint: "Driver collects this directly from the customer",
              children: (
                <input
                  type="number"
                  min={0}
                  {...bind(form, set, "customerCollect")}
                  placeholder="54000"
                  className={inputCls}
                />
              ),
            }}
          />
        </>
      ) : (
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
              label: "Billing basis",
              children: (
                <input
                  {...bind(form, set, "pickupBasis")}
                  className={inputCls}
                />
              ),
            }}
          />
        </>
      )}

      <GroupRow theme={theme}>Auto-calculated</GroupRow>
      <TRow
        a={{
          label: "Collect from UC",
          hint: isPersonal ? "Total − customer payment" : "Equals total cost",
          children: <ReadOnly>{inr(calc.collectFromUC)}</ReadOnly>,
        }}
        b={{
          label: "Advance from UC (₹)",
          error: errors.advance,
          children: (
            <input
              type="number"
              min={0}
              {...bind(form, set, "advance")}
              placeholder="5000"
              className={inputCls}
            />
          ),
        }}
      />
      <TRow
        a={{
          label: "Balance",
          children: (
            <ReadOnly>{calc.balance ? inr(calc.balance) : "Nill"}</ReadOnly>
          ),
        }}
      />
    </FormTable>
  </Section>
);
