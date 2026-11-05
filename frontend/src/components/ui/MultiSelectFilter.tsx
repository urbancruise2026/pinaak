"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";

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
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = 256;
    let left = rect.left;
    if (left + width > window.innerWidth - 10) left = window.innerWidth - width - 10;
    if (left < 10) left = 10;
    setPos({ top: rect.bottom + 6, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !menuRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const q = search.toLowerCase().trim();
  const filtered = options.filter(
    (o) =>
      !q || o.label.toLowerCase().includes(q) || o.code.toLowerCase().includes(q),
  );

  const toggle = (code: string) =>
    onChange(
      selected.includes(code)
        ? selected.filter((c) => c !== code)
        : [...selected, code],
    );

  const dropdown = (
    <div
      ref={menuRef}
      className="fixed z-[99999] w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="border-b border-slate-100 p-2">
        <div className="flex h-9 items-center rounded-lg bg-slate-50 px-2.5">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title}`}
            autoFocus
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto p-1.5">
        {loading && (
          <p className="px-3 py-6 text-center text-xs text-slate-400">Loading...</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-slate-400">
            No options found
          </p>
        )}

        {!loading &&
          filtered.map((o) => {
            const isSel = selected.includes(o.code);
            return (
              <button
                key={o.code}
                type="button"
                onClick={() => toggle(o.code)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm ${
                  isSel
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isSel
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSel && <Check size={11} strokeWidth={3} className="text-white" />}
                </span>
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
              </button>
            );
          })}
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <span className="text-xs text-slate-500">{selected.length} selected</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-medium text-rose-500 hover:text-rose-600"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className={`flex h-10 min-w-[120px] items-center gap-2 rounded-lg border px-3 text-sm font-medium ${
          selected.length > 0 || open
            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <span className="whitespace-nowrap">{title}</span>
        {selected.length > 0 && (
          <span className="rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown size={14} className="ml-auto text-slate-400" />
      </button>

      {open && mounted && createPortal(dropdown, document.body)}
    </div>
  );
};

export default MultiSelectFilter;