"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface MultiSelectFieldProps {
  label: string;
  Icon: React.ElementType;
  name: string;
  value: string; // comma separated: "bus,cab"
  options: readonly string[];
  onChange: (e: React.ChangeEvent<any>) => void;
  placeholder?: string;
  viewMode?: boolean;
  theme?: any; // SelectField jaisa signature rakhne ke liye
}

// "tempo_traveller" -> "Tempo traveller"
const pretty = (s: string) => {
  const t = s.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  Icon,
  name,
  value,
  options,
  onChange,
  placeholder = "Select",
  viewMode = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? value.split(",").filter(Boolean) : [];

  // bahar click karne par dropdown band
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const emit = (next: string[]) =>
    onChange({ target: { name, value: next.join(",") } } as any);

  const toggle = (opt: string) =>
    emit(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt],
    );

  const summary = selected.length
    ? selected.map(pretty).join(", ")
    : placeholder;

  return (
    <div ref={ref} className="relative">
      <label className="block mb-1 text-sm font-semibold text-slate-800">
        {label}
      </label>

      {viewMode ? (
        <div className="flex flex-wrap gap-1.5 px-3 py-2.5 border rounded-lg border-slate-200 bg-slate-50 min-h-[42px]">
          {selected.length ? (
            selected.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700"
              >
                {pretty(s)}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">—</span>
          )}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center w-full gap-2 px-3 py-2.5 text-left bg-white border rounded-lg border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            <Icon className="w-5 h-5 shrink-0 text-violet-500" />
            <span
              className={`flex-1 text-sm truncate ${
                selected.length ? "text-slate-800" : "text-slate-500"
              }`}
            >
              {summary}
            </span>
            {selected.length > 0 && (
              <span className="px-1.5 text-xs font-semibold rounded-full bg-violet-600 text-white">
                {selected.length}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute z-40 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-lg max-h-64 border-slate-200">
              {options.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-violet-50"
                  >
                    <span
                      className={`flex items-center justify-center w-4 h-4 border rounded ${
                        checked
                          ? "bg-violet-600 border-violet-600"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggle(opt)}
                    />
                    {pretty(opt)}
                  </label>
                );
              })}

              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => emit([])}
                  className="w-full px-3 py-2 text-xs font-medium text-left text-red-600 border-t hover:bg-red-50"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MultiSelectField;
