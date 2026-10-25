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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleSelect = (opt: string) => {
    onChange(name, opt);
    setSearchText("");
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!loading) setIsOpen((prev) => !prev);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1 block text-sm font-extrabold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Display box (click to open) */}
      <div
        onClick={handleToggle}
        className={`flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white p-2.5 ${
          loading ? "cursor-not-allowed bg-gray-100" : "cursor-pointer"
        } ${isOpen ? "border-blue-500 ring-2 ring-blue-500" : ""}`}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {loading ? "Loading..." : value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown panel */}
      {isOpen && !loading && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-gray-200 px-2.5">
            <Search size={16} className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={`Search ${label}...`}
              className="w-full py-2.5 text-sm focus:outline-none"
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => (
                <div
                  key={`${opt}-${index}`}
                  onClick={() => handleSelect(opt)}
                  className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 ${
                    opt === value
                      ? "bg-blue-100 font-semibold text-blue-700"
                      : ""
                  }`}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No match found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
