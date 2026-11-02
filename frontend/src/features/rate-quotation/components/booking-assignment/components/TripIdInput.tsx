import React, { useState } from "react";
import { X } from "lucide-react";
import type { Theme } from "../types";

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  theme: Theme;
}

/** Chip input: press Enter or comma to add a Trip ID */
export const TripIdInput = ({ value, onChange, theme }: Props) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim().toUpperCase();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm transition-colors hover:border-slate-400 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
      {value.map((id) => (
        <span
          key={id}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-medium ${theme.soft} ${theme.border} ${theme.text}`}
        >
          {id}
          <button
            type="button"
            aria-label={`Remove ${id}`}
            onClick={() => onChange(value.filter((t) => t !== id))}
          >
            <X className="h-4 w-4" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={value.length ? "Add another…" : "RN10 411"}
        className="min-w-[130px] flex-1 bg-transparent px-2 text-base text-slate-800 outline-none placeholder:text-slate-400"
      />
    </div>
  );
};
