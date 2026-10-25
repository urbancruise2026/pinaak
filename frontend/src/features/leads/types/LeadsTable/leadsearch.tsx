"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import type { LeadColumn } from "./leadTableColumns";
import { MONTH_OPTIONS } from "./leadstabledata";
import { useAppDispatch } from "@/hooks/useRedux";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { fetchLeads } from "@/features/leads/leadSlice";
import { ZEN_SERIF, ZenMonthPill } from "./ZenBadges";

export interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions: string[];
  cityFilter: string;
  onCityChange: (value: string) => void;
  cityOptions: string[];
  selectedPax: number[];
  onPaxChange: (pax: number[]) => void;
  paxOpen: boolean;
  onPaxToggle: () => void;
  paxBtnRef: React.RefObject<HTMLButtonElement | null>;
  paxDropdownRef: React.RefObject<HTMLDivElement | null>;
  paxDropdownStyle: React.CSSProperties;
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
  daysOpen: boolean;
  onDaysToggle: () => void;
  daysBtnRef: React.RefObject<HTMLButtonElement | null>;
  daysDropdownRef: React.RefObject<HTMLDivElement | null>;
  daysDropdownStyle: React.CSSProperties;
  freezeKey: string | null;
  onFreezeChange: (key: string | null) => void;
  columns: LeadColumn[];
  selectedMonth: string | null;
  onMonthChange: (month: string | null) => void;
  startMonth: string;
  onStartMonthChange: (value: string) => void;
  endMonth: string;
  onEndMonthChange: (value: string) => void;
  startType: string;
  onStartTypeChange: (type: string) => void;
  endType: string;
  onEndTypeChange: (type: string) => void;
  // ─── Live / Expiry ────────────────────────────────────────────────────────
  liveorexpiryFilter: string;
  onLiveorexpiryChange: (value: string) => void;
  ageFilter: string;
  onAgeFilterChange: (value: string) => void;
  onReset: () => void;
}

/* ─── Zen styling helpers (presentation only) ─────────────────────────────── */

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7a50] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1ead7]";

const PILL_BASE = `h-9 rounded-full border px-4 text-sm text-[#2f2a22] ${FOCUS}`;
const PILL_IDLE = "border-[#cfc6ad] bg-[#e7dfc9]";
const PILL_SAGE = "border-[#a5b997] bg-[#d3dfc8]";
const PILL_CLAY = "border-[#cf9370] bg-[#efd0bb]";

function PillSelect({
  value,
  onChange,
  active,
  tint = "sage",
  label,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  active: boolean;
  tint?: "sage" | "clay";
  label: string;
  children: ReactNode;
}) {
  const tone = active ? (tint === "clay" ? PILL_CLAY : PILL_SAGE) : PILL_IDLE;
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`${PILL_BASE} ${tone} cursor-pointer appearance-none pr-8`}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#6b6556]"
      >
        ▾
      </span>
    </div>
  );
}

function CheckPanel({
  panelRef,
  style,
  selected,
  suffix,
  onToggle,
  onClear,
}: {
  panelRef: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  selected: number[];
  suffix: string;
  onToggle: (num: number) => void;
  onClear: () => void;
}) {
  return (
    <div
      ref={panelRef}
      className="absolute z-[9999] max-h-60 overflow-y-auto rounded-2xl border border-[#cfc6ad] bg-[#fbf7ea] py-1 shadow-lg"
      style={{ ...style, fontFamily: ZEN_SERIF }}
    >
      <div className="px-3 py-2 hover:bg-[#efe7d2]">
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-[#8f3b2c] hover:underline"
        >
          Clear All
        </button>
      </div>
      {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
        <label
          key={num}
          className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#efe7d2]"
        >
          <input
            type="checkbox"
            className="accent-[#5f7a50]"
            checked={selected.includes(num)}
            onChange={() => onToggle(num)}
          />
          <span className="text-sm text-[#2f2a22]">
            {num} {suffix}
          </span>
        </label>
      ))}
    </div>
  );
}

export function LeadSearchFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  cityFilter,
  selectedPax,
  onPaxChange,
  paxOpen,
  onPaxToggle,
  paxBtnRef,
  paxDropdownRef,
  paxDropdownStyle,
  selectedDays,
  onDaysChange,
  daysOpen,
  onDaysToggle,
  daysBtnRef,
  daysDropdownRef,
  daysDropdownStyle,
  freezeKey,
  onFreezeChange,
  columns,
  selectedMonth,
  onMonthChange,
  startMonth,
  onStartMonthChange,
  endMonth,
  onEndMonthChange,
  startType,
  onStartTypeChange,
  endType,
  onEndTypeChange,
  liveorexpiryFilter,
  onLiveorexpiryChange,
  ageFilter,
  onAgeFilterChange,
  onReset,
}: SearchFiltersProps) {
  const dispatch = useAppDispatch();
  const { leads } = useSelector((state: RootState) => state.lead);
  void leads;

  // ─── Search debounce ───────────────────────────────────────────────────────
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      onSearchChange(value);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        dispatch(
          fetchLeads({
            page: 1,
            search: value,
            ...(selectedMonth
              ? { month: Number(selectedMonth), year: new Date().getFullYear() }
              : {}),
          }),
        );
      }, 400);
    },
    [dispatch, onSearchChange, selectedMonth],
  );

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // ─── Month change ──────────────────────────────────────────────────────────
  const handleMonthChange = useCallback(
    (month: string | null) => {
      onMonthChange(month);
      if (month) {
        dispatch(
          fetchLeads({
            page: 1,
            month: Number(month),
            year: new Date().getFullYear(),
            search: searchTerm || undefined,
          }),
        );
      } else {
        dispatch(fetchLeads({ page: 1, search: searchTerm || undefined }));
      }
    },
    [dispatch, onMonthChange, searchTerm],
  );

  // ─── Checkbox helpers ──────────────────────────────────────────────────────
  const handlePaxCheckbox = (num: number) => {
    onPaxChange(
      selectedPax.includes(num)
        ? selectedPax.filter((v) => v !== num)
        : [...selectedPax, num],
    );
  };

  const handleDaysCheckbox = (num: number) => {
    onDaysChange(
      selectedDays.includes(num)
        ? selectedDays.filter((v) => v !== num)
        : [...selectedDays, num],
    );
  };

  const handleClearPax = () => onPaxChange([]);
  const handleClearDays = () => onDaysChange([]);

  const handleDateFocus = (
    e: React.FocusEvent<HTMLInputElement>,
    setType: (type: string) => void,
  ) => {
    setType("date");
    setTimeout(() => {
      try {
        e.currentTarget.showPicker();
      } catch {}
    }, 0);
  };

  const handleDateClick = (
    e: React.MouseEvent<HTMLInputElement>,
    setType: (type: string) => void,
  ) => {
    setType("date");
    setTimeout(() => {
      try {
        e.currentTarget.showPicker();
      } catch {}
    }, 0);
  };

  const handleDateBlur = (value: string, setType: (type: string) => void) => {
    if (!value) setType("text");
  };

  // ─── Reset ─────────────────────────────────────────────────────────────────
  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "All" ||
    cityFilter !== "All" ||
    ageFilter !== "" ||
    liveorexpiryFilter !== "All" ||
    freezeKey !== null ||
    selectedPax.length > 0 ||
    selectedDays.length > 0 ||
    selectedMonth !== null ||
    startMonth !== "" ||
    endMonth !== "";

  const handleReset = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    onReset();
  };

  return (
    <div
      className="rounded-2xl bg-[#f1ead7] px-3 py-3 sm:px-4"
      style={{ fontFamily: ZEN_SERIF }}
    >
      {/* ─── Row 1: search, dropdown filters, dates, reset ────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-[#2f2a22]">Filters</span>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6556]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13.5 13.5 3.5 3.5" />
          </svg>
          <input
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search"
            aria-label="Search leads"
            className={`${PILL_BASE} ${
              searchTerm ? PILL_SAGE : PILL_IDLE
            } w-full pl-9 placeholder:text-[#6b6556]`}
          />
        </div>

        {/* Status */}
        <PillSelect
          value={statusFilter}
          onChange={onStatusChange}
          active={statusFilter !== "All"}
          tint="clay"
          label="Filter by status"
        >
          <option value="All">All Statuses</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </PillSelect>

        {/* Age */}
        <PillSelect
          value={ageFilter}
          onChange={onAgeFilterChange}
          active={ageFilter !== ""}
          label="Filter by lead age"
        >
          <option value="">All Age</option>
          <option value="0-5">0-5 Days</option>
          <option value="6-10">6-10 Days</option>
          <option value="11+">11+ Days</option>
        </PillSelect>

        {/* Live / Expiry */}
        <PillSelect
          value={liveorexpiryFilter}
          onChange={onLiveorexpiryChange}
          active={liveorexpiryFilter !== "All"}
          label="Filter by live or expiry"
        >
          <option value="All">Live & Expiry</option>
          <option value="LIVE">🟢 Live</option>
          <option value="EXPIRY">🔴 Expiry</option>
        </PillSelect>

        {/* Freeze columns */}
        <PillSelect
          value={freezeKey ?? "none"}
          onChange={(v) => onFreezeChange(v === "none" ? null : v)}
          active={freezeKey !== null}
          label="Freeze columns"
        >
          <option value="none">Freeze Columns</option>
          {columns.map((column) => (
            <option key={column.key} value={column.key}>
              {column.label}
            </option>
          ))}
        </PillSelect>

        {/* Days dropdown */}
        <div className="relative">
          <button
            type="button"
            ref={daysBtnRef as React.RefObject<HTMLButtonElement>}
            onClick={onDaysToggle}
            aria-expanded={daysOpen}
            className={`${PILL_BASE} ${
              selectedDays.length > 0 ? PILL_SAGE : PILL_IDLE
            } flex items-center gap-2`}
          >
            {selectedDays.length > 0
              ? `${selectedDays.length} Days Selected`
              : "Select Days"}
            <span aria-hidden="true" className="text-[10px] text-[#6b6556]">
              ▾
            </span>
          </button>
          {daysOpen &&
            typeof document !== "undefined" &&
            createPortal(
              <CheckPanel
                panelRef={daysDropdownRef as React.RefObject<HTMLDivElement>}
                style={daysDropdownStyle}
                selected={selectedDays}
                suffix="Days"
                onToggle={handleDaysCheckbox}
                onClear={handleClearDays}
              />,
              document.body,
            )}
        </div>

        {/* Pax dropdown */}
        <div className="relative">
          <button
            type="button"
            ref={paxBtnRef as React.RefObject<HTMLButtonElement>}
            onClick={onPaxToggle}
            aria-expanded={paxOpen}
            className={`${PILL_BASE} ${
              selectedPax.length > 0 ? PILL_SAGE : PILL_IDLE
            } flex items-center gap-2`}
          >
            {selectedPax.length > 0
              ? `${selectedPax.length} Pax Selected`
              : "Select Pax"}
            <span aria-hidden="true" className="text-[10px] text-[#6b6556]">
              ▾
            </span>
          </button>
          {paxOpen &&
            typeof document !== "undefined" &&
            createPortal(
              <CheckPanel
                panelRef={paxDropdownRef as React.RefObject<HTMLDivElement>}
                style={paxDropdownStyle}
                selected={selectedPax}
                suffix="Pax"
                onToggle={handlePaxCheckbox}
                onClear={handleClearPax}
              />,
              document.body,
            )}
        </div>

        {/* Date range (same row as the other filters) */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input
            type={startType}
            value={startMonth}
            onChange={(e) => onStartMonthChange(e.target.value)}
            placeholder="Start Date"
            aria-label="Start date"
            onFocus={(e) => handleDateFocus(e, onStartTypeChange)}
            onClick={(e) => handleDateClick(e, onStartTypeChange)}
            onBlur={() => handleDateBlur(startMonth, onStartTypeChange)}
            className={`${PILL_BASE} ${
              startMonth ? PILL_SAGE : PILL_IDLE
            } min-w-0 flex-1 placeholder:text-[#6b6556] sm:w-40 sm:flex-none`}
          />
          <input
            type={endType}
            value={endMonth}
            min={startMonth}
            onChange={(e) => onEndMonthChange(e.target.value)}
            placeholder="End Date"
            aria-label="End date"
            onFocus={(e) => handleDateFocus(e, onEndTypeChange)}
            onClick={(e) => handleDateClick(e, onEndTypeChange)}
            onBlur={() => handleDateBlur(endMonth, onEndTypeChange)}
            className={`${PILL_BASE} ${
              endMonth ? PILL_SAGE : PILL_IDLE
            } min-w-0 flex-1 placeholder:text-[#6b6556] sm:w-40 sm:flex-none`}
          />
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasActiveFilters}
          className={`${PILL_BASE} flex items-center gap-2 sm:ml-auto ${
            hasActiveFilters
              ? "border-[#cf9370] bg-[#efd0bb] hover:bg-[#e8c2a8]"
              : "cursor-not-allowed border-[#cfc6ad] bg-[#e7dfc9] opacity-50"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 10a6.5 6.5 0 1 1 1.9 4.6" />
            <path d="M3.5 15.5v-4h4" />
          </svg>
          Reset
        </button>
      </div>

      {/* ─── Row 2: month filter ──────────────────────────────────────────── */}
      <div className="mt-2 flex gap-2 overflow-x-auto px-1 pb-1 pt-2">
        {MONTH_OPTIONS.map((month) => {
          const currentMonth = new Date().getMonth() + 1;
          const isCurrentMonth = Number(month.value) === currentMonth;
          const isActive = selectedMonth === month.value;

          return (
            <ZenMonthPill
              key={month.value}
              label={month.label}
              isCurrentMonth={isCurrentMonth}
              isSelected={isActive}
              onClick={() => handleMonthChange(isActive ? null : month.value)}
            />
          );
        })}
      </div>
    </div>
  );
}