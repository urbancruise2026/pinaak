"use client";

import type { StatCardStyle } from "./statCardConfig";

interface StatCardProps {
  style: StatCardStyle;
  count: number;
  percent: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}

export default function StatCard({
  style,
  count,
  percent,
  active,
  onClick,
  className = "",
}: StatCardProps) {
  const { Icon, card, iconBg, labelText, bar, track, ring, label } = style;
  const width = Math.min(100, parseFloat(percent) || 0);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // 👇 CARD HEIGHT: change min-h here (currently 92px / 104px on sm+)
      className={`flex min-h-[92px] flex-col justify-between gap-1.5 rounded-xl border px-3 py-2 text-left transition-all sm:min-h-[104px] ${card} ${
        active
          ? `scale-[1.02] shadow-xl ring-4 ring-offset-2 ${ring}`
          : "hover:scale-[1.02] hover:shadow-lg"
      } ${className}`}
    >
      {/* icon + label on one row */}
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow ${iconBg}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className={`text-sm font-semibold leading-tight sm:text-base ${labelText}`}>
          {label}
        </span>
      </div>

      {/* count + percent on one row */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-extrabold leading-none text-slate-900">
          {count}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
          {percent}
          <span className="text-[10px] text-green-500">▲</span>
        </span>
      </div>

      <div className={`h-1.5 w-full overflow-hidden rounded-full ${track}`}>
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${width}%` }} />
      </div>
    </button>
  );
}