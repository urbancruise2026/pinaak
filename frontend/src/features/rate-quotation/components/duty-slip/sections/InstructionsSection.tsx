import React from "react";
import { ClipboardCheck } from "lucide-react";
import { RULES } from "../constants";
import {
  FormTable,
  Section,
  TRow,
  bind,
  inputCls,
  textareaCls,
} from "../ui";
import type { SectionProps } from "../types";

export const InstructionsSection = ({
  form,
  set,
  isPersonal,
  theme,
}: SectionProps) => {
  const tripType = isPersonal ? "personal" : "corporate";
  const rules = RULES.filter((r) => !r.only || r.only === tripType);

  return (
    <Section title="Instructions & Sent By" icon={ClipboardCheck} theme={theme}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className={`border-b text-left text-xs font-semibold uppercase tracking-wide ${theme.soft} ${theme.border} ${theme.text}`}>
              <th className="w-16 px-4 py-3">Print</th>
              <th className="px-4 py-3">Instruction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((r) => (
              <tr key={r.key} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={!!form.rules[r.key]}
                    onChange={(e) =>
                      set("rules", { ...form.rules, [r.key]: e.target.checked })
                    }
                    aria-label={`Print: ${r.text.replace(/\*/g, "")}`}
                    style={{ accentColor: "currentColor" }}
                    className={`h-5 w-5 rounded border-slate-300 ${theme.text}`}
                  />
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {r.text.replace(/\*/g, "")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormTable>
        <TRow
          a={{
            label: "Extra instruction",
            children: (
              <textarea
                rows={2}
                {...bind(form, set, "notes")}
                placeholder="Anything else for the driver / vendor"
                className={textareaCls}
              />
            ),
          }}
        />
        <TRow
          a={{
            label: "Sent by",
            children: (
              <input {...bind(form, set, "senderName")} className={inputCls} />
            ),
          }}
          b={{
            label: "Phone",
            children: (
              <input
                {...bind(form, set, "senderPhone")}
                inputMode="tel"
                className={inputCls}
              />
            ),
          }}
        />
        <TRow
          a={{
            label: "Office city",
            children: (
              <input {...bind(form, set, "senderCity")} className={inputCls} />
            ),
          }}
        />
      </FormTable>
    </Section>
  );
};
