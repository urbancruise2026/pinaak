"use client";

import React from "react";
import { Users } from "lucide-react";

interface LeadPageHeaderProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const LeadPageHeader: React.FC<LeadPageHeaderProps> = ({
  title = "Lead Followups",
  description = "Manage, track & follow up with your leads",
  children,
}) => {
  return (
    <div
      className="
        relative
        w-full
        overflow-hidden
        rounded-[26px]
        border border-orange-100
        bg-white
        shadow-[0_18px_55px_rgba(15,23,42,0.08)]
      "
    >
      {/* AMBIENT BACKGROUND */}
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-orange-500/[0.08] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-amber-400/[0.06] blur-3xl"
        aria-hidden="true"
      />

      {/* GRID PATTERN */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* LEFT ACCENT LINE */}
      <div
        className="absolute bottom-0 left-0 top-0 w-[4px] bg-gradient-to-b from-orange-500 via-orange-600 to-amber-500"
        aria-hidden="true"
      />

      {/* ===================== SINGLE ROW: ICON+TITLE | FILTERS (right) ===================== */}
      <div className="relative z-10 flex flex-wrap items-center gap-4 p-4 sm:gap-6 sm:p-5">
        {/* LEFT: ICON + TITLE */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <div
              className="absolute -inset-3 rounded-[24px] bg-orange-500/10 blur-xl"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-1 rounded-[21px] border border-orange-500/10"
              aria-hidden="true"
            />
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[17px] bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800 shadow-[0_12px_30px_rgba(234,88,12,0.28)] sm:h-[60px] sm:w-[60px] sm:rounded-[19px]">
              <div
                className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/20 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="absolute h-7 w-7 rounded-full border border-white/20 sm:h-[34px] sm:w-[34px]"
                aria-hidden="true"
              />
              <Users className="relative z-10 h-5 w-5 text-white sm:h-[22px] sm:w-[22px]" />
            </div>

            <span
              className="absolute -right-1 -top-1 flex h-[17px] w-[17px] items-center justify-center rounded-full border-[3px] border-white bg-emerald-500 shadow-[0_3px_10px_rgba(16,185,129,0.35)] sm:h-[18px] sm:w-[18px]"
              aria-label="Active"
            >
              <span className="h-[4px] w-[4px] rounded-full bg-white sm:h-[5px] sm:w-[5px]" />
            </span>
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-extrabold tracking-[-0.035em] text-slate-800 sm:text-[20px]">
              {title}
            </h2>
            <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-5 text-slate-400 sm:text-[12px]">
              {description}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="h-[3px] w-8 rounded-full bg-orange-600 sm:w-10" />
              <div className="h-[3px] w-2 rounded-full bg-orange-300" />
              <div className="h-[3px] w-1 rounded-full bg-orange-200" />
            </div>
          </div>
        </div>

        {/* RIGHT: PAGE-SPECIFIC MENU — starts from right, no stretching */}
        {children && (
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadPageHeader;
