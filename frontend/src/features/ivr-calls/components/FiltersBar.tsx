"use client";

import React from "react";
import type { Direction, HoursFilter, IvrFilters } from "../ivr.types";
import { defaultFilters, todayIST } from "../ivr.utils";

interface Props {
  value: IvrFilters;
  agents: string[];
  departments: string[];
  showDirection?: boolean;
  onChange: (next: IvrFilters) => void;
}

const input = "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none";

const shiftDays = (days: number) => {
  const d = new Date(`${todayIST()}T00:00:00+05:30`);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
};

const FiltersBar: React.FC<Props> = ({ value, agents, departments, showDirection = true, onChange }) => {
  const set = <K extends keyof IvrFilters>(k: K, v: IvrFilters[K]) => onChange({ ...value, [k]: v });
  const [search, setSearch] = React.useState(value.search);

  // debounce phone search
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (search !== value.search) set("search", search);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const quick = (from: string, to: string) => onChange({ ...value, from, to });

  return (
    <div className="flex flex-wrap items-end gap-2.5">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">From</label>
        <input
          type="date"
          className={input}
          value={value.from}
          max={value.to}
          onChange={(e) => e.target.value && set("from", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">To</label>
        <input
          type="date"
          className={input}
          value={value.to}
          min={value.from}
          onChange={(e) => e.target.value && set("to", e.target.value)}
        />
      </div>

      <div className="flex gap-1">
        <button type="button" className="rounded border px-2 py-1.5 text-xs" onClick={() => quick(todayIST(), todayIST())}>
          Today
        </button>
        <button type="button" className="rounded border px-2 py-1.5 text-xs" onClick={() => quick(shiftDays(-1), shiftDays(-1))}>
          Yesterday
        </button>
        <button type="button" className="rounded border px-2 py-1.5 text-xs" onClick={() => quick(shiftDays(-6), todayIST())}>
          7 days
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Department</label>
        <select className={input} value={value.department} onChange={(e) => set("department", e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Agent</label>
        <select className={input} value={value.agent} onChange={(e) => set("agent", e.target.value)}>
          <option value="">All agents</option>
          {agents.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {showDirection && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Direction</label>
          <select
            className={input}
            value={value.direction}
            onChange={(e) => set("direction", e.target.value as "" | Direction)}
          >
            <option value="">All</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Hours</label>
        <select className={input} value={value.hours} onChange={(e) => set("hours", e.target.value as HoursFilter)}>
          <option value="all">All hours</option>
          <option value="working">Working (9:30-21:30, Sun 10:30-18:30)</option>
          <option value="non_working">Non-working hours</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Time from - to (custom)</label>
        <div className="flex items-center gap-1">
          <input
            type="time"
            className={input}
            value={value.timeFrom}
            onChange={(e) => set("timeFrom", e.target.value)}
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="time"
            className={input}
            value={value.timeTo}
            onChange={(e) => set("timeTo", e.target.value)}
          />
          {(value.timeFrom || value.timeTo) && (
            <button
              type="button"
              title="Clear time"
              className="rounded border px-1.5 py-1 text-xs text-gray-500"
              onClick={() => onChange({ ...value, timeFrom: "", timeTo: "" })}
            >
              x
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Phone</label>
        <input
          className={`${input} w-40`}
          placeholder="Search number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <button
        type="button"
        className="rounded border px-3 py-1.5 text-sm text-gray-600"
        onClick={() => {
          setSearch("");
          onChange(defaultFilters());
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default FiltersBar;
