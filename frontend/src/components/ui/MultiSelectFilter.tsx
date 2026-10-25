"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X, SlidersHorizontal } from "lucide-react";

export interface FilterOption {
  code: string;
  label: string;
}

interface MultiSelectFilterProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  loading?: boolean;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  title,
  options,
  selected,
  onChange,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // =====================================================
  // MOUNT
  // =====================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // =====================================================
  // DROPDOWN POSITION
  // =====================================================

  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    const dropdownWidth = 288;
    const gap = 8;

    let left = rect.left;

    // Prevent dropdown from going outside right side
    if (left + dropdownWidth > window.innerWidth - 10) {
      left = window.innerWidth - dropdownWidth - 10;
    }

    // Prevent dropdown from going outside left side
    if (left < 10) {
      left = 10;
    }

    setDropdownPosition({
      top: rect.bottom + gap,
      left,
    });
  }, []);

  // =====================================================
  // UPDATE POSITION WHEN OPEN
  // =====================================================

  useEffect(() => {
    if (!open) return;

    updateDropdownPosition();

    const handleResize = () => {
      updateDropdownPosition();
    };

    const handleScroll = () => {
      updateDropdownPosition();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updateDropdownPosition]);

  // =====================================================
  // OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedButton = buttonRef.current?.contains(target) ?? false;

      const clickedMenu = menuRef.current?.contains(target) ?? false;

      if (!clickedButton && !clickedMenu) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // =====================================================
  // ESC KEY
  // =====================================================

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // =====================================================
  // FILTER OPTIONS
  // =====================================================

  const filteredOptions = options.filter((option) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return true;

    return (
      option.label.toLowerCase().includes(searchValue) ||
      option.code.toLowerCase().includes(searchValue)
    );
  });

  // =====================================================
  // TOGGLE OPTION
  // =====================================================

  const toggleOption = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((item) => item !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const clearAll = () => {
    onChange([]);
  };

  // =====================================================
  // BUTTON STATE
  // =====================================================

  const isActive = selected.length > 0 || open;

  // =====================================================
  // DROPDOWN CONTENT
  // =====================================================

  const dropdown = (
    <div
      ref={menuRef}
      className="
        fixed
        z-[99999]
        w-72
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-[0_18px_45px_rgba(15,23,42,0.20)]
        animate-in
        fade-in
        slide-in-from-top-1
        duration-150
      "
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">{title}</p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Select one or more
            </p>
          </div>

          {selected.length > 0 && (
            <span
              className="
                rounded-full
                bg-orange-50
                px-2
                py-1
                text-[10px]
                font-bold
                text-orange-600
              "
            >
              {selected.length} selected
            </span>
          )}
        </div>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div
        className="
          border-b
          border-slate-100
          bg-slate-50/50
          p-3
        "
      >
        <div
          className="
            flex
            h-9
            items-center
            rounded-xl
            border
            border-slate-200
            bg-white
            px-2.5
            transition-all
            focus-within:border-blue-300
            focus-within:ring-2
            focus-within:ring-blue-100
          "
        >
          <Search size={15} className="shrink-0 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title}`}
            autoFocus
            className="
              min-w-0
              flex-1
              border-none
              bg-transparent
              px-2
              text-xs
              font-medium
              text-slate-700
              outline-none
              placeholder:text-slate-400
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-600
              "
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* =================================================
          OPTIONS
      ================================================= */}

      <div
        className="
          max-h-64
          overflow-y-auto
          p-2
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-slate-200
          hover:[&::-webkit-scrollbar-thumb]:bg-slate-300
        "
      >
        {/* LOADING */}

        {loading && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              px-3
              py-8
            "
          >
            <div
              className="
                mb-2
                h-6
                w-6
                animate-spin
                rounded-full
                border-2
                border-slate-200
                border-t-blue-500
              "
            />

            <p className="text-xs font-medium text-slate-400">
              Loading {title.toLowerCase()}...
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!loading && filteredOptions.length === 0 && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              px-3
              py-8
            "
          >
            <div
              className="
                mb-2
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-slate-100
              "
            >
              <Search size={18} className="text-slate-400" />
            </div>

            <p className="text-xs font-semibold text-slate-500">
              No options found
            </p>

            {search && (
              <p className="mt-1 text-[10px] text-slate-400">
                Try another search
              </p>
            )}
          </div>
        )}

        {/* OPTIONS */}

        {!loading &&
          filteredOptions.length > 0 &&
          filteredOptions.map((option) => {
            const isSelected = selected.includes(option.code);

            return (
              <button
                key={option.code}
                type="button"
                onClick={() => toggleOption(option.code)}
                className={`
                  group
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  transition-all
                  duration-150

                  ${
                    isSelected
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                {/* CHECKBOX */}

                <span
                  className={`
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    border
                    transition-all
                    duration-150

                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-500 shadow-sm"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                    }
                  `}
                >
                  {isSelected && (
                    <Check size={12} strokeWidth={3} className="text-white" />
                  )}
                </span>

                {/* LABEL */}

                <span
                  className={`
                    min-w-0
                    flex-1
                    truncate
                    text-xs
                    font-semibold

                    ${isSelected ? "text-blue-700" : "text-slate-700"}
                  `}
                >
                  {option.label}
                </span>

                {/* CODE */}

                {option.code !== option.label && (
                  <span
                    className={`
                      max-w-[80px]
                      truncate
                      text-[10px]
                      font-medium

                      ${isSelected ? "text-blue-400" : "text-slate-400"}
                    `}
                  >
                    {option.code}
                  </span>
                )}

                {/* SELECTED INDICATOR */}

                {isSelected && (
                  <span
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-blue-500
                    "
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      {selected.length > 0 && (
        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            bg-slate-50/50
            px-3
            py-2.5
          "
        >
          <div className="flex items-center gap-2">
            <span
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-blue-100
                text-[10px]
                font-bold
                text-blue-600
              "
            >
              {selected.length}
            </span>

            <span className="text-[11px] font-medium text-slate-500">
              selected
            </span>
          </div>

          <button
            type="button"
            onClick={clearAll}
            className="
              flex
              items-center
              gap-1
              rounded-lg
              px-2.5
              py-1.5
              text-[11px]
              font-bold
              text-red-500
              transition
              hover:bg-red-50
              hover:text-red-600
            "
          >
            <X size={13} />
            Clear all
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div ref={dropdownRef} className="relative z-[100]">
      {/* =================================================
          FILTER BUTTON
      ================================================= */}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);

          if (open) {
            setSearch("");
          }
        }}
        className={`
          group
          flex
          h-[42px]
          min-w-[130px]
          items-center
          gap-2
          rounded-xl
          border
          px-3
          text-sm
          font-semibold
          transition-all
          duration-200

          ${
            isActive
              ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          }
        `}
      >
        {/* ICON */}

        <span
          className={`
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            transition-all

            ${
              isActive
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
            }
          `}
        >
          <SlidersHorizontal size={15} />
        </span>

        {/* TITLE */}

        <span className="whitespace-nowrap">{title}</span>

        {/* SELECTED COUNT */}

        {selected.length > 0 && (
          <span
            className="
              flex
              min-w-[21px]
              items-center
              justify-center
              rounded-full
              bg-orange-500
              px-1.5
              py-0.5
              text-[10px]
              font-bold
              leading-none
              text-white
            "
          >
            {selected.length}
          </span>
        )}

        {/* ARROW */}

        <ChevronDown
          size={15}
          className={`
            ml-auto
            text-slate-400
            transition-transform
            duration-200

            ${open ? "rotate-180 text-blue-500" : ""}
          `}
        />
      </button>

      {/* =================================================
          PORTAL DROPDOWN
      ================================================= */}

      {open && mounted && createPortal(dropdown, document.body)}
    </div>
  );
};

export default MultiSelectFilter;
