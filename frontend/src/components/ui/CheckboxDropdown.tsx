"use client";

import { useEffect, useRef, useState } from "react";

interface CheckboxOption {
  label: string;
  value: string;
}

interface CheckboxDropdownProps {
  label?: string;
  placeholder?: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export default function CheckboxDropdown({
  label,
  placeholder = "Select",
  options,
  value,
  onChange,
  className = "",
}: CheckboxDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const getButtonText = () => {
    if (value.length === 0) {
      return placeholder;
    }

    if (value.length === 1) {
      const selected = options.find((item) => item.value === value[0]);
      return selected?.label || value[0];
    }

    return `${value.length} Selected`;
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative flex flex-col gap-1 ${className}`}
    >
      {label && (
        <label className="text-xs font-semibold text-slate-600">{label}</label>
      )}

      {/* Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <span className="truncate">{getButtonText()}</span>

        <span
          className={`ml-2 text-xs text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[180px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => {
              const checked = value.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleChange(option.value)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>

          {/* Clear */}
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-1 w-full border-t border-slate-100 pt-2 text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
