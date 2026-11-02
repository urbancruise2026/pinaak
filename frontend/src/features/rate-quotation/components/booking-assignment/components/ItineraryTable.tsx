import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emptyRow } from "../constants";
import { datesBetween } from "../utils";
import { inputCls } from "../ui";
import type { ItineraryRow, Theme } from "../types";

interface Props {
  rows: ItineraryRow[];
  onChange: (rows: ItineraryRow[]) => void;
  startDate: string;
  endDate: string;
  theme: Theme;
}

const HEADS = [
  "Day",
  "Date",
  "Pick-up time",
  "Pick-up location",
  "Destinations / stops",
  "Drop location",
  "Drop time",
  "",
];

export const ItineraryTable = ({
  rows,
  onChange,
  startDate,
  endDate,
  theme,
}: Props) => {
  const update = (id: string, patch: Partial<ItineraryRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const remove = (id: string) =>
    rows.length > 1 && onChange(rows.filter((r) => r.id !== id));

  const fillFromDates = () => {
    const dates = datesBetween(startDate, endDate);
    if (dates.length)
      onChange(dates.map((d) => rows.find((r) => r.date === d) ?? emptyRow(d)));
  };

  return (
    <div className="border-t border-slate-200">
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 px-5 py-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Day-wise itinerary
        </h4>
        <button
          type="button"
          onClick={fillFromDates}
          disabled={!startDate || !endDate}
          className="ml-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-600 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Fill rows from dates
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-base">
          <thead>
            <tr className={`border-y text-left text-xs font-semibold uppercase tracking-wide ${theme.soft} ${theme.border} ${theme.text}`}>
              {HEADS.map((h, i) => (
                <th key={i} className="px-3 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr key={r.id} className="align-middle hover:bg-slate-50/60">
                <td className="w-12 px-3 py-2">
                  <span
                    className={`inline-flex h-6 min-w-6 items-center justify-center rounded-lg px-1.5 text-sm font-semibold ${theme.soft} ${theme.text}`}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="w-40 px-3 py-2">
                  <input
                    type="date"
                    value={r.date}
                    onChange={(e) => update(r.id, { date: e.target.value })}
                    className={inputCls}
                  />
                </td>
                <td className="w-32 px-3 py-2">
                  <input
                    type="time"
                    value={r.pickupTime}
                    onChange={(e) =>
                      update(r.id, { pickupTime: e.target.value })
                    }
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={r.pickupLocation}
                    onChange={(e) =>
                      update(r.id, { pickupLocation: e.target.value })
                    }
                    placeholder="Sec-1, Vaishali"
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={r.destinations}
                    onChange={(e) =>
                      update(r.id, { destinations: e.target.value })
                    }
                    placeholder="Jaipur, Gulmohar Resort"
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={r.dropLocation}
                    onChange={(e) =>
                      update(r.id, { dropLocation: e.target.value })
                    }
                    placeholder="Sec-1, Vaishali"
                    className={inputCls}
                  />
                </td>
                <td className="w-32 px-3 py-2">
                  <input
                    type="time"
                    value={r.dropTime}
                    onChange={(e) => update(r.id, { dropTime: e.target.value })}
                    className={inputCls}
                  />
                </td>
                <td className="w-10 px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    disabled={rows.length === 1}
                    aria-label={`Remove day ${i + 1}`}
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
          onClick={() => onChange([...rows, emptyRow()])}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3.5 py-2 text-sm font-medium ${theme.border} ${theme.text}`}
        >
          <Plus className="h-4 w-4" /> Add day / leg
        </button>
      </div>
    </div>
  );
};
