"use client";

import type { CSSProperties, ReactNode } from "react";
import type { LeadRecord } from "@/types/types";
import LeadBrandPanel from "./LeadBrandPanel";
import TotalLeadsCard from "../../TelesalesLeadsTable/TotalLeadsCard";
import StatCard from "../../TelesalesLeadsTable/StatCard";
import { STATUS_CARDS, type StatusKey } from "../../TelesalesLeadsTable/statCardConfig";

interface LeadStatsHeaderProps {
  /** Heading, defaults to "Lead Manager" (e.g. "Swap Lead Manager") */
  title?: string;
  /** "Tele-Sales", "Pre-Sales", ... */
  subtitle: string;
  totalLeads: number;
  counts: Record<string, number | undefined>;
  /** Optional ready-made percentages (e.g. from calculateLeadStatusPercentages). Falls back to count / total. */
  percentages?: Record<string, number | string | undefined>;
  totalPercent?: number | string;
  /** Which cards to show and in which order. Defaults to all. */
  statuses?: StatusKey[];
  statusFilter: "All" | LeadRecord["status"];
  /** If omitted, the cards are display-only (not clickable). */
  onStatusChange?: (val: "All" | LeadRecord["status"]) => void;
  /** Region → Zone → City → Year filter, rendered in a single row */
  filterSlot?: ReactNode;
  /** Anything extra under the cards (e.g. month badges) */
  footerSlot?: ReactNode;
}

const fmt = (v: number | string) =>
  typeof v === "number" ? v.toFixed(1) : String(v).replace("%", "");

export default function LeadStatsHeader({
  title,
  subtitle,
  totalLeads,
  counts,
  percentages,
  totalPercent,
  statuses,
  statusFilter,
  onStatusChange,
  filterSlot,
  footerSlot,
}: LeadStatsHeaderProps) {
  const pct = (n: number) =>
    totalLeads > 0 ? ((n / totalLeads) * 100).toFixed(1) : "0.0";

  const cards = statuses
    ? statuses
        .map((k) => STATUS_CARDS.find((c) => c.label === k))
        .filter((c): c is (typeof STATUS_CARDS)[number] => Boolean(c))
    : STATUS_CARDS;

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:p-4">
      {/* Top bar: title on the left, filters (if any) in ONE row on the right */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <LeadBrandPanel title={title} subtitle={subtitle} />

        {filterSlot && (
          <div className="min-w-0 rounded-2xl bg-slate-50 p-2 lg:w-[560px] lg:max-w-[60%]">
            <div className="w-full [&>*]:!flex [&>*]:!w-full [&>*]:!flex-row [&>*]:!flex-wrap [&>*]:!items-center [&>*]:!gap-2 [&>*>*]:!min-w-[110px] [&>*>*]:!flex-1">
              {filterSlot}
            </div>
          </div>
        )}
      </div>

      {/* Cards: 2 cols (mobile) → 4 cols (tablet) → one row (xl+) */}
      <div
        className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 xl:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": cards.length + 1 } as CSSProperties}
      >
        <TotalLeadsCard
          total={totalLeads}
          percent={totalPercent !== undefined ? fmt(totalPercent) : "100.0"}
          active={statusFilter === "All"}
          onClick={onStatusChange ? () => onStatusChange("All") : undefined}
          className="col-span-2 sm:col-span-1"
        />

        {cards.map((style, i) => {
          const count = Number(counts[style.label] ?? 0);
          const given = percentages?.[style.label];
          const isActive = statusFilter === style.label;
          return (
            <StatCard
              key={style.label}
              style={style}
              count={count}
              percent={given !== undefined ? fmt(given) : pct(count)}
              active={isActive}
              onClick={
                onStatusChange
                  ? () =>
                      onStatusChange(
                        isActive ? "All" : (style.label as LeadRecord["status"]),
                      )
                  : undefined
              }
              // keep the last row of the 2-col mobile grid full
              className={i === cards.length - 1 ? "col-span-2 sm:col-span-1" : ""}
            />
          );
        })}
      </div>

      {footerSlot && (
        <div className="mt-3 rounded-2xl bg-slate-50 p-2">{footerSlot}</div>
      )}
    </section>
  );
}