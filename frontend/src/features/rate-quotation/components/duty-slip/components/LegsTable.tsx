import React from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { emptyLeg } from "../constants";
import { inputCls, textareaCls } from "../ui";
import type { DutyLeg, Theme } from "../types";

interface Props {
  rows: DutyLeg[];
  onChange: (rows: DutyLeg[]) => void;
  isPersonal: boolean;
  theme: Theme;
  error?: string;
}

/** Trip legs. Corporate: one leg per vehicle (Veh. column). Points = one per line. */
export const LegsTable = ({ rows, onChange, isPersonal, theme, error }: Props) => {
  const update = (id: string, patch: Partial<DutyLeg>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const remove = (id: string) =>
    rows.length > 1 && onChange(rows.filter((r) => r.id !== id));

  // Copy a leg for the next vehicle (same date, times and destination)
  const duplicate = (r: DutyLeg) => {
    const next = String((Number(r.vehicle) || rows.length) + 1);
    onChange([
      ...rows,
      { ...r, id: emptyLeg().id, vehicle: next, pickupLocations: "", dropLocations: "" },
    ]);
  };

  const heads = [
    ...(isPersonal ? [] : ["Veh."]),
    "Pick-up (date / time)",
    "Pick-up point(s) – one per line",
    "Destinations",
    "Drop point(s) – one per line",
    "Drop (date / time)",
    "",
  ];

  return (
    <div
      className="border-t border-slate-200"
      data-error={error ? "true" : undefined}
    >
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 px-5 py-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Trip legs
        </h4>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-base">
          <thead>
            <tr
              className={`border-y text-left text-xs font-semibold uppercase tracking-wide ${theme.soft} ${theme.border} ${theme.text}`}
            >
              {heads.map((h, i) => (
                <th key={i} className="px-2 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr key={r.id} className="align-top hover:bg-slate-50/60">
                {!isPersonal && (
                  <td className="w-14 px-2 py-2">
                    <input
                      value={r.vehicle}
                      onChange={(e) => update(r.id, { vehicle: e.target.value })}
                      placeholder="1"
                      className={inputCls}
                    />
                  </td>
                )}
                <td className="w-40 px-2 py-2">
                  <div className="flex flex-col gap-2">
                    <input
                      type="date"
                      value={r.date}
                      onChange={(e) => update(r.id, { date: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="time"
                      value={r.pickupTime}
                      onChange={(e) =>
                        update(r.id, { pickupTime: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                </td>
                <td className="min-w-[150px] px-2 py-2">
                  <textarea
                    rows={3}
                    value={r.pickupLocations}
                    onChange={(e) =>
                      update(r.id, { pickupLocations: e.target.value })
                    }
                    placeholder={"Amrapali Princely Estate, Noida\nAkshardham Metro Station"}
                    className={textareaCls}
                  />
                </td>
                <td className="min-w-[120px] px-2 py-2">
                  <textarea
                    rows={3}
                    value={r.destinations}
                    onChange={(e) => update(r.id, { destinations: e.target.value })}
                    placeholder="Abheygarh, Khetri, Rajasthan"
                    className={textareaCls}
                  />
                </td>
                <td className="min-w-[150px] px-2 py-2">
                  <textarea
                    rows={3}
                    value={r.dropLocations}
                    onChange={(e) => update(r.id, { dropLocations: e.target.value })}
                    className={textareaCls}
                  />
                </td>
                <td className="w-40 px-2 py-2">
                  <div className="flex flex-col gap-2">
                    <input
                      type="date"
                      value={r.dropDate}
                      onChange={(e) => update(r.id, { dropDate: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="time"
                      value={r.dropTime}
                      onChange={(e) => update(r.id, { dropTime: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </td>
                <td className="w-14 px-1 py-2">
                  <div className="flex flex-col items-center gap-1">
                  {!isPersonal && (
                    <button
                      type="button"
                      onClick={() => duplicate(r)}
                      title="Copy for next vehicle"
                      aria-label={`Copy leg ${i + 1} for next vehicle`}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    disabled={rows.length === 1}
                    aria-label={`Remove leg ${i + 1}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-5 py-3">
        <button
          type="button"
          onClick={() => onChange([...rows, emptyLeg()])}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3.5 py-2 text-sm font-medium ${theme.border} ${theme.text}`}
        >
          <Plus className="h-4 w-4" /> Add leg
        </button>
      </div>
    </div>
  );
};
