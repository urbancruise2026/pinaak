import { useState, useRef, useEffect } from "react";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectDropdownProps {
  label: string; // "Days", "Pax" — placeholder text ke liye
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const displayText =
    selected.length === 0
      ? `All ${label}`
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label
        : `${selected.length} ${label} selected`;

  return (
    <div className="relative flex flex-col gap-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-2 text-sm font-semibold text-left border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white flex justify-between items-center"
      >
        <span>{displayText}</span>
        <span className="ml-2 text-slate-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1 min-w-[240px] w-max max-w-[320px] max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg p-2">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left text-xs text-blue-600 font-medium px-2 py-1 hover:bg-slate-50 rounded mb-1"
            >
              Clear all
            </button>
          )}
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 rounded hover:bg-slate-50 cursor-pointer whitespace-nowrap"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggleValue(opt.value)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-200"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
