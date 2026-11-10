"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  loading?: boolean;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = "Select...",
  loading = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchText("");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleSelect = (opt: string) => {
    onChange(name, opt);
    setSearchText("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div
        onClick={() => !loading && setIsOpen((p) => !p)}
        className={`flex min-h-[44px] w-full items-center justify-between rounded-lg border bg-white px-3 text-sm ${
          isOpen ? "border-indigo-400" : "border-slate-200 hover:border-indigo-300"
        } ${loading ? "cursor-not-allowed bg-slate-50" : "cursor-pointer"}`}
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {loading ? "Loading..." : value || placeholder}
        </span>
        <ChevronDown size={15} className="text-slate-400" />
      </div>

      {isOpen && !loading && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3">
            <Search size={14} className="text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={`Search ${label}...`}
              className="w-full py-2.5 text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length > 0 ? (
              filtered.map((opt, i) => (
                <div
                  key={`${opt}-${i}`}
                  onClick={() => handleSelect(opt)}
                  className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                    opt === value
                      ? "bg-indigo-50 font-medium text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400">No match found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;