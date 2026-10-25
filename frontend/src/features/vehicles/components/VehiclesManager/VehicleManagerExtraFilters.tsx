"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, MapPin, Tag, Check, X } from "lucide-react";

interface CityOption {
  id: number;
  name: string;
}

interface VehicleManagerExtraFiltersProps {
  uniqueCodeOptions: string[];
  cities: CityOption[];

  selectedCodes: string[];
  selectedCities: string[];
  selectedYears: string[];

  setSelectedCodes: (values: string[]) => void;
  setSelectedCities: (values: string[]) => void;
  setSelectedYears: (values: string[]) => void;

  setCurrentPage?: (page: number) => void;
}

const YEAR_OPTIONS = Array.from(
  { length: 2026 - 2018 + 1 },
  (_, i) => 2018 + i,
);

type MenuType = "code" | "city" | "year" | null;

interface DropdownPosition {
  top: number;
  left: number;
  width?: number;
}

const VehicleManagerExtraFilters: React.FC<VehicleManagerExtraFiltersProps> = ({
  uniqueCodeOptions,
  cities,

  selectedCodes,
  selectedCities,
  selectedYears,

  setSelectedCodes,
  setSelectedCities,
  setSelectedYears,

  setCurrentPage,
}) => {
  // =====================================================
  // STATE
  // =====================================================

  const [openMenu, setOpenMenu] = useState<MenuType>(null);

  const [mounted, setMounted] = useState(false);

  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
  });

  // =====================================================
  // REFS
  // =====================================================

  const codeButtonRef = useRef<HTMLButtonElement>(null);
  const cityButtonRef = useRef<HTMLButtonElement>(null);
  const yearButtonRef = useRef<HTMLButtonElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // =====================================================
  // MOUNT
  // =====================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // =====================================================
  // GET ACTIVE BUTTON
  // =====================================================

  const getActiveButton = useCallback(() => {
    if (openMenu === "code") {
      return codeButtonRef.current;
    }

    if (openMenu === "city") {
      return cityButtonRef.current;
    }

    if (openMenu === "year") {
      return yearButtonRef.current;
    }

    return null;
  }, [openMenu]);

  // =====================================================
  // UPDATE DROPDOWN POSITION
  // =====================================================

  const updateDropdownPosition = useCallback(() => {
    const button = getActiveButton();

    if (!button) return;

    const rect = button.getBoundingClientRect();

    const dropdownWidth = openMenu === "year" ? 224 : 256;

    const gap = 8;

    let left = rect.left;

    // Prevent dropdown from going outside right side
    const maxLeft = window.innerWidth - dropdownWidth - 12;

    if (left > maxLeft) {
      left = Math.max(12, maxLeft);
    }

    // Prevent dropdown from going outside left side
    if (left < 12) {
      left = 12;
    }

    setDropdownPosition({
      top: rect.bottom + gap,
      left,
      width: dropdownWidth,
    });
  }, [getActiveButton, openMenu]);

  // =====================================================
  // UPDATE POSITION WHEN MENU OPENS
  // =====================================================

  useEffect(() => {
    if (!openMenu) return;

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
  }, [openMenu, updateDropdownPosition]);

  // =====================================================
  // OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const activeButton = getActiveButton();

      if (activeButton && activeButton.contains(target)) {
        return;
      }

      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }

      setOpenMenu(null);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu, getActiveButton]);

  // =====================================================
  // OPEN MENU
  // =====================================================

  const toggleMenu = (menu: MenuType) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  // =====================================================
  // CODE
  // =====================================================

  const toggleCode = (code: string) => {
    setSelectedCodes(
      selectedCodes.includes(code)
        ? selectedCodes.filter((item) => item !== code)
        : [...selectedCodes, code],
    );

    setCurrentPage?.(1);
  };

  const clearCodes = () => {
    setSelectedCodes([]);
    setCurrentPage?.(1);
  };

  // =====================================================
  // CITY
  // =====================================================

  const toggleCity = (cityId: number) => {
    const value = String(cityId);

    setSelectedCities(
      selectedCities.includes(value)
        ? selectedCities.filter((item) => item !== value)
        : [...selectedCities, value],
    );

    setCurrentPage?.(1);
  };

  const clearCities = () => {
    setSelectedCities([]);
    setCurrentPage?.(1);
  };

  // =====================================================
  // YEAR
  // =====================================================

  const toggleYear = (year: number) => {
    const value = String(year);

    setSelectedYears(
      selectedYears.includes(value)
        ? selectedYears.filter((item) => item !== value)
        : [...selectedYears, value],
    );

    setCurrentPage?.(1);
  };

  const clearYears = () => {
    setSelectedYears([]);
    setCurrentPage?.(1);
  };

  // =====================================================
  // FILTER BUTTON CLASS
  // =====================================================

  const filterButtonClass = (active: boolean, open: boolean) => `
    group
    flex
    h-[42px]
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
      active || open
        ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
    }
  `;

  // =====================================================
  // DROPDOWN BASE CLASS
  // =====================================================

  const dropdownClass = `
    fixed
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
    shadow-[0_12px_35px_rgba(15,23,42,0.18)]
    animate-in
    fade-in
    slide-in-from-top-1
    duration-150
  `;

  // =====================================================
  // DROPDOWN CONTENT
  // =====================================================

  const renderDropdown = () => {
    if (!openMenu || !mounted) {
      return null;
    }

    // ===================================================
    // CODE DROPDOWN
    // ===================================================

    if (openMenu === "code") {
      return createPortal(
        <div
          ref={dropdownRef}
          className={`${dropdownClass} w-64`}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 999999,
          }}
        >
          {/* HEADER */}

          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Vehicle Code</p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Select one or more codes
                </p>
              </div>

              {selectedCodes.length > 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                  {selectedCodes.length} selected
                </span>
              )}
            </div>
          </div>

          {/* OPTIONS */}

          <div className="max-h-64 overflow-y-auto p-2">
            {uniqueCodeOptions.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Tag size={22} className="mx-auto mb-2 text-slate-300" />

                <p className="text-xs font-medium text-slate-400">
                  No codes found
                </p>
              </div>
            ) : (
              uniqueCodeOptions.map((code) => {
                const checked = selectedCodes.includes(code);

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleCode(code)}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      transition-all
                      ${
                        checked
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-md
                          border
                          transition-all
                          ${
                            checked
                              ? "border-blue-500 bg-blue-500"
                              : "border-slate-300 bg-white"
                          }
                        `}
                      >
                        {checked && (
                          <Check
                            size={12}
                            strokeWidth={3}
                            className="text-white"
                          />
                        )}
                      </span>

                      <span className="text-xs font-semibold">{code}</span>
                    </span>

                    {checked && (
                      <span className="text-[10px] font-bold text-blue-500">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* FOOTER */}

          {selectedCodes.length > 0 && (
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={clearCodes}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  py-2
                  text-xs
                  font-bold
                  text-red-500
                  transition
                  hover:bg-red-50
                "
              >
                <X size={13} />
                Clear all
              </button>
            </div>
          )}
        </div>,
        document.body,
      );
    }

    // ===================================================
    // CITY DROPDOWN
    // ===================================================

    if (openMenu === "city") {
      return createPortal(
        <div
          ref={dropdownRef}
          className={`${dropdownClass} w-64`}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 999999,
          }}
        >
          {/* HEADER */}

          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">City</p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Choose vehicle location
                </p>
              </div>

              {selectedCities.length > 0 && (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                  {selectedCities.length} selected
                </span>
              )}
            </div>
          </div>

          {/* OPTIONS */}

          <div className="max-h-64 overflow-y-auto p-2">
            {!cities || cities.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <MapPin size={22} className="mx-auto mb-2 text-slate-300" />

                <p className="text-xs font-medium text-slate-400">
                  No cities found
                </p>
              </div>
            ) : (
              cities.map((city) => {
                const value = String(city.id);

                const checked = selectedCities.includes(value);

                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => toggleCity(city.id)}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      transition-all
                      ${
                        checked
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-md
                          border
                          transition-all
                          ${
                            checked
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300 bg-white"
                          }
                        `}
                      >
                        {checked && (
                          <Check
                            size={12}
                            strokeWidth={3}
                            className="text-white"
                          />
                        )}
                      </span>

                      <span className="text-xs font-semibold">{city.name}</span>
                    </span>

                    {checked && (
                      <span className="text-[10px] font-bold text-emerald-500">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* FOOTER */}

          {selectedCities.length > 0 && (
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={clearCities}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  py-2
                  text-xs
                  font-bold
                  text-red-500
                  transition
                  hover:bg-red-50
                "
              >
                <X size={13} />
                Clear all
              </button>
            </div>
          )}
        </div>,
        document.body,
      );
    }

    // ===================================================
    // YEAR DROPDOWN
    // ===================================================

    if (openMenu === "year") {
      return createPortal(
        <div
          ref={dropdownRef}
          className={`${dropdownClass} w-56`}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 999999,
          }}
        >
          {/* HEADER */}

          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Registration Year
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Select vehicle year
                </p>
              </div>

              {selectedYears.length > 0 && (
                <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-600">
                  {selectedYears.length} selected
                </span>
              )}
            </div>
          </div>

          {/* OPTIONS */}

          <div className="max-h-64 overflow-y-auto p-2">
            {YEAR_OPTIONS.slice()
              .reverse()
              .map((year) => {
                const value = String(year);

                const checked = selectedYears.includes(value);

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => toggleYear(year)}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      transition-all
                      ${
                        checked
                          ? "bg-violet-50 text-violet-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-md
                          border
                          transition-all
                          ${
                            checked
                              ? "border-violet-500 bg-violet-500"
                              : "border-slate-300 bg-white"
                          }
                        `}
                      >
                        {checked && (
                          <Check
                            size={12}
                            strokeWidth={3}
                            className="text-white"
                          />
                        )}
                      </span>

                      <span className="text-xs font-semibold">{year}</span>
                    </span>

                    {checked && (
                      <span className="text-[10px] font-bold text-violet-500">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* FOOTER */}

          {selectedYears.length > 0 && (
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={clearYears}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  py-2
                  text-xs
                  font-bold
                  text-red-500
                  transition
                  hover:bg-red-50
                "
              >
                <X size={13} />
                Clear all
              </button>
            </div>
          )}
        </div>,
        document.body,
      );
    }

    return null;
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* =================================================
            CODE FILTER
        ================================================= */}

        <div className="relative shrink-0">
          <button
            ref={codeButtonRef}
            type="button"
            onClick={() => toggleMenu("code")}
            className={filterButtonClass(
              selectedCodes.length > 0,
              openMenu === "code",
            )}
          >
            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-orange-50
                text-orange-500
                transition
                group-hover:bg-orange-100
              "
            >
              <Tag size={15} />
            </span>

            <span>Code</span>

            {selectedCodes.length > 0 && (
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
                  text-white
                "
              >
                {selectedCodes.length}
              </span>
            )}

            <ChevronDown
              size={15}
              className={`
                ml-0.5
                text-slate-400
                transition-transform
                ${openMenu === "code" ? "rotate-180 text-blue-500" : ""}
              `}
            />
          </button>
        </div>

        {/* =================================================
            CITY FILTER
        ================================================= */}

        <div className="relative shrink-0">
          <button
            ref={cityButtonRef}
            type="button"
            onClick={() => toggleMenu("city")}
            className={filterButtonClass(
              selectedCities.length > 0,
              openMenu === "city",
            )}
          >
            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-emerald-50
                text-emerald-500
                transition
                group-hover:bg-emerald-100
              "
            >
              <MapPin size={15} />
            </span>

            <span>City</span>

            {selectedCities.length > 0 && (
              <span
                className="
                  flex
                  min-w-[21px]
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-500
                  px-1.5
                  py-0.5
                  text-[10px]
                  font-bold
                  text-white
                "
              >
                {selectedCities.length}
              </span>
            )}

            <ChevronDown
              size={15}
              className={`
                ml-0.5
                text-slate-400
                transition-transform
                ${openMenu === "city" ? "rotate-180 text-blue-500" : ""}
              `}
            />
          </button>
        </div>

        {/* =================================================
            YEAR FILTER
        ================================================= */}

        <div className="relative shrink-0">
          <button
            ref={yearButtonRef}
            type="button"
            onClick={() => toggleMenu("year")}
            className={filterButtonClass(
              selectedYears.length > 0,
              openMenu === "year",
            )}
          >
            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-violet-50
                text-violet-500
                transition
                group-hover:bg-violet-100
              "
            >
              <Calendar size={15} />
            </span>

            <span>Year</span>

            {selectedYears.length > 0 && (
              <span
                className="
                  flex
                  min-w-[21px]
                  items-center
                  justify-center
                  rounded-full
                  bg-violet-500
                  px-1.5
                  py-0.5
                  text-[10px]
                  font-bold
                  text-white
                "
              >
                {selectedYears.length}
              </span>
            )}

            <ChevronDown
              size={15}
              className={`
                ml-0.5
                text-slate-400
                transition-transform
                ${openMenu === "year" ? "rotate-180 text-blue-500" : ""}
              `}
            />
          </button>
        </div>
      </div>

      {/* ===================================================
          PORTAL DROPDOWN
      =================================================== */}

      {renderDropdown()}
    </>
  );
};

export default VehicleManagerExtraFilters;
