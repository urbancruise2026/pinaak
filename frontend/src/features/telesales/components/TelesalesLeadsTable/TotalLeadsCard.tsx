"use client";

import { TrendingUp } from "lucide-react";

interface TotalLeadsCardProps {
  total: number;
  active: boolean;
  onClick?: () => void;
  percent?: string;
  className?: string;
}

export default function TotalLeadsCard({
  total,
  active,
  onClick,
  percent = "100.0",
  className = "",
}: TotalLeadsCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // inline colour so the navy background never depends on Tailwind generating an arbitrary class
      style={{ backgroundColor: "#04204f" }}
      // 👇 CARD HEIGHT: change min-h here (currently 92px / 104px on sm+)
      className={`relative flex min-h-[92px] flex-col justify-between overflow-hidden rounded-xl bg-blue-950 px-3 pt-2 pb-7 text-left transition-all sm:min-h-[104px] ${
        active
          ? "scale-[1.02] ring-4 ring-orange-400 ring-offset-2"
          : "hover:scale-[1.02] hover:shadow-lg"
      } ${className}`}
    >
      <div className="flex items-center justify-between text-white/90">
        <span className="text-sm font-semibold sm:text-base">Total Leads</span>
        <TrendingUp className="h-5 w-5 text-sky-400" />
      </div>

      <div>
        <div className="text-2xl font-extrabold leading-none text-white">
          {total}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-white/90">
          <span className="h-3.5 w-3.5 rounded-full bg-sky-400/90" />
          ({percent})
        </div>
      </div>

      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-6 w-full"
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 24 C 20 8, 40 40, 60 24 S 100 8, 120 24 S 160 40, 200 18 L200 40 L0 40 Z"
          fill="#1d4ed8"
          opacity="0.45"
        />
        <path
          d="M0 24 C 20 8, 40 40, 60 24 S 100 8, 120 24 S 160 40, 200 18"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
}