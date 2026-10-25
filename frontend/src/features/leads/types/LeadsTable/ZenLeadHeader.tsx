"use client";

import type { ReactNode } from "react";
import { CalendarDays, Star, Users } from "lucide-react";
import { ZEN_SERIF } from "./ZenBadges";

type ZenLeadHeaderProps = {
  /** Status circles (TOTAL, NEW, RFQ ...) – 8 of <ZenStatusBadge /> */
  badges: ReactNode;
  /** Month tiles (Apr ... Mar) – 12 of <ZenMonthStat /> */
  months: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function ZenLeadHeader({
  badges,
  months,
  title = "Lead Manager",
  subtitle = "(Pre-Sales)",
}: ZenLeadHeaderProps) {
  return (
    <header
      className="relative mb-2 overflow-hidden rounded-3xl p-3 sm:p-4"
      style={{
        background: "linear-gradient(135deg, #eceeff 0%, #f7f8ff 48%, #eef3ff 100%)",
        border: "1px solid rgba(129,140,248,0.20)",
        boxShadow: "0 10px 30px rgba(79,70,229,0.08)",
      }}
    >
      {/* soft colour washes */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: -80,
          top: -90,
          width: 320,
          height: 260,
          background: "radial-gradient(circle, rgba(165,180,252,0.38), rgba(165,180,252,0) 70%)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          right: -90,
          bottom: -100,
          width: 340,
          height: 260,
          background: "radial-gradient(circle, rgba(196,181,253,0.30), rgba(196,181,253,0) 70%)",
        }}
      />

      {/* Row 1: brand + status circles */}
      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <div
            className="relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-[68px] sm:w-[68px]"
            style={{
              borderRadius: "42% 58% 55% 45% / 50% 45% 55% 50%",
              background: "linear-gradient(145deg,#ffffff,#eef0ff)",
              boxShadow: "0 8px 18px rgba(99,102,241,0.18), inset 0 0 0 1px rgba(255,255,255,0.9)",
            }}
          >
            <Users className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: "#5b5bd6" }} strokeWidth={2.2} aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full"
              style={{ backgroundColor: "#f59e0b", border: "2px solid #ffffff" }}
            >
              <Star className="h-2.5 w-2.5 text-white" fill="#ffffff" strokeWidth={0} />
            </span>
          </div>

          <span aria-hidden="true" className="hidden h-12 w-px sm:block" style={{ backgroundColor: "rgba(100,116,139,0.28)" }} />

          <h2
            className="flex flex-wrap items-baseline gap-x-2 leading-tight"
            style={{ fontFamily: ZEN_SERIF, color: "#1e2340" }}
          >
            <span className="whitespace-nowrap text-2xl font-semibold sm:text-[30px]">{title}</span>
            <span className="text-base italic sm:text-lg" style={{ color: "#64748b" }}>
              {subtitle}
            </span>
          </h2>
        </div>

        {/* 4 per row on phones, all 8 in one row from md up */}
        <div className="grid min-w-0 grid-cols-4 gap-x-2 gap-y-3 sm:gap-x-3 md:grid-cols-8 lg:max-w-[860px] lg:flex-1">
          {badges}
        </div>
      </div>

      {/* Row 2: month tiles */}
      <div
        className="relative mt-3 flex items-center gap-3 rounded-2xl p-2 sm:p-2.5"
        style={{
          background: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: "0 4px 14px rgba(99,102,241,0.08)",
        }}
      >
        <div
          role="img"
          aria-label="Pickups by month"
          title="Pickups by month"
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full sm:flex"
          style={{ background: "linear-gradient(145deg,#ede9fe,#ddd6fe)" }}
        >
          <CalendarDays className="h-5 w-5" style={{ color: "#6d28d9" }} aria-hidden="true" />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-6 gap-x-2 gap-y-2 sm:grid-cols-12">
          {months}
        </div>
      </div>
    </header>
  );
}