"use client";

import {
  fetchAdvisorsByZone,
} from "@/features/rules/rulesSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/hooks/useRedux";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type {
  EntryType,
  MonthLead,
  FormState,
  RuleEntry,
  RulePayload,
} from "../rules.types";

export type { EntryType, MonthLead, FormState };
export type Entry = RuleEntry;
export type EntryPayload = RulePayload;

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const emptyForm: FormState = {
  type: "T20",
  monthLeads: [
    { month: "", lead: 0 },
    { month: "", lead: 0 },
    { month: "", lead: 0 },
  ],
  advisorId: null,
  shiftTiming: "",
};

// Maps a backend Entry (months[] + monthLeads[]) into the 3-row monthLeads shape
function entryToForm(entry: Entry): FormState {
  const sourceLeads =
    entry.monthLeads && entry.monthLeads.length > 0
      ? entry.monthLeads
      : entry.months.map((m) => ({ month: m, lead: entry.lead ?? 0 }));

  const rows: MonthLead[] = [
    sourceLeads[0] ?? { month: "", lead: 0 },
    sourceLeads[1] ?? { month: "", lead: 0 },
    sourceLeads[2] ?? { month: "", lead: 0 },
  ];

  return {
    type: entry.type,
    monthLeads: rows,
    advisorId: entry.advisorId,
    shiftTiming: entry.shiftTiming,
  };
}

function formToPayload(form: FormState): EntryPayload {
  const filledRows = form.monthLeads.filter((ml) => ml.month !== "");

  return {
    type: form.type,
    months: filledRows.map((ml) => ml.month),
    monthLeads: filledRows,
    advisorId: form.advisorId as number,
    shiftTiming: form.shiftTiming,
    lead: filledRows[0]?.lead ?? 0,
    overflow: "",
  };
}

export default function EntryForm({
  editingEntry,
  onSubmit,
  onCancel,
}: {
  editingEntry: Entry | null;
  onSubmit: (payload: EntryPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    editingEntry ? entryToForm(editingEntry) : emptyForm,
  );

  // Keep form in sync when a different entry is selected for editing,
  // or when editing is cancelled / completed.
  const [syncedId, setSyncedId] = useState<number | null>(
    editingEntry ? editingEntry.id : null,
  );

  const dispatch = useAppDispatch();
  const { zoneAdvisors } = useSelector((state: RootState) => state.rule);

  useEffect(() => {
    dispatch(fetchAdvisorsByZone());
  }, [dispatch]);

  if ((editingEntry?.id ?? null) !== syncedId) {
    setSyncedId(editingEntry ? editingEntry.id : null);
    setForm(editingEntry ? entryToForm(editingEntry) : emptyForm);
  }

  function handleMonthChange(index: number, value: string) {
    setForm((prev) => {
      const next = [...prev.monthLeads];
      next[index] = { ...next[index], month: value };
      return { ...prev, monthLeads: next };
    });
  }

  function handleLeadChange(index: number, value: string) {
    setForm((prev) => {
      const next = [...prev.monthLeads];
      next[index] = { ...next[index], lead: value };
      return { ...prev, monthLeads: next };
    });
  }

  const handleAdvisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const advisorId = Number(e.target.value);
    const advisor = zoneAdvisors.find((a) => a.id === advisorId);

    setForm((prev) => ({
      ...prev,
      advisorId,
      shiftTiming: advisor?.shiftTiming || "",
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hasAtLeastOneMonth = form.monthLeads.some((ml) => ml.month !== "");

    // Mirror the backend's own validation so bad payloads never leave the client:
    // type, advisorId, and at least one month are all required.
    if (!form.type || !form.advisorId || !hasAtLeastOneMonth) {
      return;
    }

    try {
      await onSubmit(formToPayload(form));
      setForm(emptyForm);
    } catch {
      // keep the form as-is so the user can retry; the parent shows the error
    }
  }

  function handleCancel() {
    setForm(emptyForm);
    onCancel();
  }

  const editingId = editingEntry !== null ? editingEntry.id : null;

  return (
    <div className="flex flex-col">
      <h2 className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-5">
        {editingId !== null ? "Entry Edit " : "New Entry "}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div>
          <label className="text-md text-gray-700 font-semibold mb-2 block">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["T20", "T60"] as EntryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: t }))}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  form.type === t
                    ? t === "T20"
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
                }`}
              >
                {t === "T20" ? "T-20" : "T-60"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-md text-gray-700 font-semibold mb-2 block">
              Advisor
            </label>

            <select
              value={form.advisorId ?? ""}
              onChange={handleAdvisorChange}
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500"
            >
              <option value="">Select Advisor</option>

              {zoneAdvisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-md text-gray-700 font-semibold mb-2 block">
              Shift Timing
            </label>

            <input
              value={form.shiftTiming}
              readOnly
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900"
            />
          </div>
        </div>

        {/* Month + Lead rows */}
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-md text-gray-700 font-semibold mb-2 block">
                Month {i + 1}
              </label>
              <select
                value={form.monthLeads[i].month}
                onChange={(e) => handleMonthChange(i, e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500"
              >
                <option value="">Select Month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-md text-gray-700 font-semibold mb-2 block">
                Lead/Day
              </label>
              <input
                type="text"
                value={form.monthLeads[i].lead}
                onChange={(e) => handleLeadChange(i, e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500"
                placeholder="Enter lead / day"
              />
            </div>
          </div>
        ))}

        <div className="flex-1" />

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg py-3 transition-colors"
          >
            {editingId !== null ? "Update Entry" : "+ Add Entry"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-semibold rounded-lg px-5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}