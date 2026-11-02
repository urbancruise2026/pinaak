import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emptyInstallment } from "../constants";
import { inputCls } from "../ui";
import type { Installment, Theme } from "../types";

interface Props {
  rows: Installment[];
  onChange: (rows: Installment[]) => void;
  theme: Theme;
  error?: string;
}

/** Dated payment schedule: "31st Oct - Rs. 80,000" */
export const InstallmentsTable = ({ rows, onChange, theme, error }: Props) => {
  const update = (id: string, patch: Partial<Installment>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div
      className="border-t border-slate-200"
      data-error={error ? "true" : undefined}
    >
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 px-5 py-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Payment schedule (collect on)
        </h4>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className={`border-y text-left text-xs font-semibold uppercase tracking-wide ${theme.soft} ${theme.border} ${theme.text}`}>
              <th className="w-12 px-3 py-3">#</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Amount (₹)</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <td className="px-3 py-2 text-sm font-medium text-slate-500">
                  {i + 1}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={r.date}
                    onChange={(e) => update(r.id, { date: e.target.value })}
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={r.amount}
                    onChange={(e) => update(r.id, { amount: e.target.value })}
                    placeholder="80000"
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      rows.length > 1 && onChange(rows.filter((x) => x.id !== r.id))
                    }
                    disabled={rows.length === 1}
                    aria-label={`Remove instalment ${i + 1}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-5 py-3">
        <button
          type="button"
          onClick={() => onChange([...rows, emptyInstallment()])}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3.5 py-2 text-sm font-medium ${theme.border} ${theme.text}`}
        >
          <Plus className="h-4 w-4" /> Add date
        </button>
      </div>
    </div>
  );
};
