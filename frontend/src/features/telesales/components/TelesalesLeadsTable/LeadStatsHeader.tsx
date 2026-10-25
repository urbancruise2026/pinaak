"use client";

import type { ReactNode } from "react";
import type { LeadRecord } from "@/types/types";
import LeadBrandPanel from "./LeadBrandPanel";
import TotalLeadsCard from "./TotalLeadsCard";
import StatCard from "./StatCard";
import { STATUS_CARDS } from "./statCardConfig";

interface LeadStatsHeaderProps {
  totalLeads: number;
  counts: Record<string, number>;
  statusFilter: "All" | LeadRecord["status"];
  onStatusChange: (val: "All" | LeadRecord["status"]) => void;
  /** Region → Zone → City → Year filter, rendered in a single row */
  filterSlot?: ReactNode;
}

export default function LeadStatsHeader({
  totalLeads,
  counts,
  statusFilter,
  onStatusChange,
  filterSlot,
}: LeadStatsHeaderProps) {
  const pct = (n: number) =>
    totalLeads > 0 ? ((n / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:p-4">
      {/* Top bar: title on the left, filters in ONE row on the right */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <LeadBrandPanel />

        {filterSlot && (
          <div className="min-w-0 rounded-2xl bg-slate-50 p-2 lg:w-[560px] lg:max-w-[60%]">
            <div className="w-full [&>*]:!flex [&>*]:!w-full [&>*]:!flex-row [&>*]:!flex-wrap [&>*]:!items-center [&>*]:!gap-2 [&>*>*]:!min-w-[110px] [&>*>*]:!flex-1">
              {filterSlot}
            </div>
          </div>
        )}
      </div>

      {/* Cards: 2 cols (mobile) → 4 cols (tablet) → 8 cols in one row (xl+) */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 xl:grid-cols-8">
        <TotalLeadsCard
          total={totalLeads}
          active={statusFilter === "All"}
          onClick={() => onStatusChange("All")}
          className="col-span-2 sm:col-span-1"
        />

        {STATUS_CARDS.map((style, i) => {
          const isActive = statusFilter === style.label;
          return (
            <StatCard
              key={style.label}
              style={style}
              count={counts[style.label] ?? 0}
              percent={pct(counts[style.label] ?? 0)}
              active={isActive}
              onClick={() =>
                onStatusChange(
                  isActive ? "All" : (style.label as LeadRecord["status"]),
                )
              }
              // keep the last row of the 2-col mobile grid full
              className={
                i === STATUS_CARDS.length - 1 ? "col-span-2 sm:col-span-1" : ""
              }
            />
          );
        })}
      </div>
    </section>
  );
}