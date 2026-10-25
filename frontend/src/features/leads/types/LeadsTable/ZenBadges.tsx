"use client";

import type { CSSProperties } from "react";
import {
  BookOpen,
  Car,
  Crown,
  Flame,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";

/* ─── Shared tokens ─────────────────────────────────────────────────────── */

// Still used by the filter bar (LeadSearchFilters) and the header title.
export const ZEN_SERIF =
  'var(--font-zen-serif, "Fraunces"), "Iowan Old Style", Georgia, serif';

export type ZenStatusTone =
  | "total"
  | "new"
  | "rfq"
  | "kyc"
  | "hot"
  | "vehn"
  | "lost"
  | "book";

// Colours are inline styles on purpose, so they never depend on Tailwind
// generating arbitrary classes.
const TONES: Record<
  ZenStatusTone,
  {
    Icon: LucideIcon;
    bg: string;
    border: string;
    glow: string;
    icon: string;
    label: string;
    value: string;
    pct: string;
  }
> = {
  total: {
    Icon: Crown,
    bg: "radial-gradient(circle at 30% 22%, #3b4d70 0%, #1b2a4a 55%, #0f1b33 100%)",
    border: "#1e3a8a",
    glow: "0 10px 22px rgba(30,64,175,0.35)",
    icon: "#ffffff",
    label: "#e2e8f0",
    value: "#ffffff",
    pct: "#5eead4",
  },
  new: {
    Icon: Sparkles,
    bg: "radial-gradient(circle at 30% 22%, #ffffff 0%, #e0efff 55%, #c7dffd 100%)",
    border: "#93c5fd",
    glow: "0 8px 18px rgba(59,130,246,0.18)",
    icon: "#3b82f6",
    label: "#2563eb",
    value: "#1e293b",
    pct: "#16a34a",
  },
  rfq: {
    Icon: MessageCircle,
    bg: "radial-gradient(circle at 30% 22%, #fffdf3 0%, #fff0b8 55%, #fde08a 100%)",
    border: "#fcd34d",
    glow: "0 8px 18px rgba(245,158,11,0.20)",
    icon: "#f59e0b",
    label: "#b45309",
    value: "#1e293b",
    pct: "#b45309",
  },
  kyc: {
    Icon: Users,
    bg: "radial-gradient(circle at 30% 22%, #ffffff 0%, #d5f7ef 55%, #a7f0df 100%)",
    border: "#5eead4",
    glow: "0 8px 18px rgba(20,184,166,0.18)",
    icon: "#14b8a6",
    label: "#0f766e",
    value: "#1e293b",
    pct: "#0f766e",
  },
  hot: {
    Icon: Flame,
    bg: "radial-gradient(circle at 30% 22%, #fff7fb 0%, #fddcee 55%, #fbbfdc 100%)",
    border: "#f9a8d4",
    glow: "0 8px 18px rgba(236,72,153,0.18)",
    icon: "#ec4899",
    label: "#be185d",
    value: "#1e293b",
    pct: "#be185d",
  },
  vehn: {
    Icon: Car,
    bg: "radial-gradient(circle at 30% 22%, #ffffff 0%, #ece3fd 55%, #d9c8fa 100%)",
    border: "#c4b5fd",
    glow: "0 8px 18px rgba(139,92,246,0.18)",
    icon: "#8b5cf6",
    label: "#6d28d9",
    value: "#1e293b",
    pct: "#6d28d9",
  },
  lost: {
    Icon: XCircle,
    bg: "radial-gradient(circle at 30% 22%, #fffafa 0%, #ffd9d9 55%, #fcb8b8 100%)",
    border: "#fca5a5",
    glow: "0 8px 18px rgba(239,68,68,0.20)",
    icon: "#ef4444",
    label: "#b91c1c",
    value: "#1e293b",
    pct: "#b91c1c",
  },
  book: {
    Icon: BookOpen,
    bg: "radial-gradient(circle at 30% 22%, #ffffff 0%, #d7f7e0 55%, #a9ecc0 100%)",
    border: "#86efac",
    glow: "0 8px 18px rgba(34,197,94,0.20)",
    icon: "#22c55e",
    label: "#15803d",
    value: "#1e293b",
    pct: "#15803d",
  },
};

/* ─── Status badge ──────────────────────────────────────────────────────── */

type ZenStatusBadgeProps = {
  tone: ZenStatusTone;
  label: string;
  value: number | string | undefined;
  percentage?: number | string;
  onClick?: () => void;
  /** Rings the circle, e.g. when it is the active status filter */
  active?: boolean;
};

export function ZenStatusBadge({
  tone,
  label,
  value,
  percentage,
  onClick,
  active = false,
}: ZenStatusBadgeProps) {
  const t = TONES[tone];
  const Icon = t.Icon;
  const shown = value ?? 0;
  const pct =
    percentage === undefined || percentage === ""
      ? null
      : String(percentage).includes("%")
        ? String(percentage)
        : `${percentage}%`;
  const title = `${label}: ${shown}${pct ? ` (${pct})` : ""}`;

  // A circle that fills its grid cell (up to a max) and stays round.
  const style: CSSProperties = {
    width: "100%",
    maxWidth: 104,
    aspectRatio: "1 / 1",
    justifySelf: "center",
    borderRadius: "9999px",
    background: t.bg,
    border: `2px solid ${t.border}`,
    boxShadow: active
      ? `0 0 0 3px #ffffff, 0 0 0 5px ${t.border}, ${t.glow}`
      : `inset 0 2px 6px rgba(255,255,255,0.55), ${t.glow}`,
  };

  const className =
    "flex min-w-0 flex-col items-center justify-center leading-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

  const content = (
    <>
      <Icon
        className="h-3 w-3 sm:h-4 sm:w-4"
        style={{ color: t.icon }}
        strokeWidth={2.4}
        aria-hidden="true"
      />
      <span
        className="mt-0.5 max-w-full truncate text-[15px] font-semibold tracking-wide sm:mt-1 sm:text-[13px]"
        style={{ color: t.label }}
      >
        {label}
      </span>
      <span
        className="mt-0.5 text-base font-bold sm:text-[22px]"
        style={{ color: t.value }}
      >
        {shown}
      </span>
      {pct && (
        <span
          className="mt-0.5 flex items-center gap-0.5 text-[8px] font-semibold sm:mt-1 sm:text-[10px]"
          style={{ color: t.pct }}
        >
          <TrendingUp className="h-2 w-2 sm:h-2.5 sm:w-2.5" strokeWidth={3} aria-hidden="true" />
          {pct}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        aria-pressed={active}
        className={`${className} motion-safe:transition-transform motion-safe:hover:scale-105`}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <div role="group" title={title} aria-label={title} className={className} style={style}>
      {content}
    </div>
  );
}

/* ─── Month pill (used by the filter bar – unchanged) ───────────────────── */

type ZenMonthPillProps = {
  label: string;
  count?: number;
  isSelected?: boolean;
  isCurrentMonth?: boolean;
  onClick: () => void;
};

export function ZenMonthPill({
  label,
  count = 0,
  isSelected = false,
  isCurrentMonth = false,
  onClick,
}: ZenMonthPillProps) {
  const filled = isSelected || isCurrentMonth;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      title={`${label}: ${count} pickup${count === 1 ? "" : "s"}`}
      className={[
        "relative flex h-6 w-12 items-center justify-center text-[11px]",
        "motion-safe:transition-transform motion-safe:hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f2a22] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1ead7]",
        filled ? "text-white" : "text-[#6b6556]",
        isCurrentMonth ? "scale-110" : "",
      ].join(" ")}
      style={{
        fontFamily: ZEN_SERIF,
        borderRadius: "52% 48% 56% 44% / 48% 54% 46% 52%",
        backgroundColor: filled ? "#8aa07a" : "#ddd6c3",
        boxShadow: isCurrentMonth
          ? "0 0 0 2px #5f7a50, inset 0 -4px 8px rgba(0,0,0,0.12)"
          : "inset 0 0 0 1.5px rgba(107,101,86,0.35)",
      }}
    >
      {label}
      {count > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8f5a3c] px-1 text-[9px] font-semibold text-white"
          aria-hidden="true"
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Month stat (display only, not clickable) ──────────────────────────── */

type ZenMonthStatProps = {
  label: string;
  count?: number;
  isCurrentMonth?: boolean;
};

// accent / soft background / border – one hue per month
const MONTH_HUES: Record<string, [string, string, string]> = {
  apr: ["#94a3b8", "#f1f5f9", "#e2e8f0"],
  may: ["#16a34a", "#f0fdf4", "#bbf7d0"],
  jun: ["#f59e0b", "#fffbeb", "#fde68a"],
  jul: ["#8b5cf6", "#faf5ff", "#e9d5ff"],
  aug: ["#3b82f6", "#eff6ff", "#bfdbfe"],
  sep: ["#ec4899", "#fdf2f8", "#fbcfe8"],
  oct: ["#16a34a", "#f0fdf4", "#86efac"],
  nov: ["#14b8a6", "#f0fdfa", "#99f6e4"],
  dec: ["#8b5cf6", "#f5f3ff", "#ddd6fe"],
  jan: ["#ef4444", "#fef2f2", "#fecaca"],
  feb: ["#3b82f6", "#eff6ff", "#bfdbfe"],
  mar: ["#22c55e", "#f0fdf4", "#bbf7d0"],
};

export function ZenMonthStat({
  label,
  count = 0,
  isCurrentMonth = false,
}: ZenMonthStatProps) {
  const [accent, soft, border] = MONTH_HUES[label.slice(0, 3).toLowerCase()] ?? [
    "#94a3b8",
    "#f8fafc",
    "#e2e8f0",
  ];
  const text = `${label}: ${count} pickup${count === 1 ? "" : "s"}`;

  return (
    <div
      role="group"
      aria-label={text}
      title={text}
      className="flex min-w-0 select-none flex-col items-center justify-center gap-0.5 leading-none"
      style={{
        width: "100%",
        maxWidth: 80,
        height: 58,
        justifySelf: "center",
        borderRadius: 14,
        background: isCurrentMonth
          ? "linear-gradient(180deg,#ffffff,#e4f9ec)"
          : `linear-gradient(180deg,#ffffff,${soft})`,
        border: isCurrentMonth ? "2px solid #22c55e" : `1px solid ${border}`,
        boxShadow: isCurrentMonth
          ? "0 6px 14px rgba(34,197,94,0.22)"
          : "0 2px 6px rgba(15,23,42,0.04)",
      }}
    >
      <span
        className="text-[12px] font-semibold uppercase tracking-wide"
        style={{ color: accent }}
      >
        {label}
      </span>
      <span className="flex items-center gap-1">
        <i
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <span
          className="text-base font-bold sm:text-[17px]"
          style={{ color: "#1e293b", opacity: count === 0 && !isCurrentMonth ? 0.55 : 1 }}
        >
          {count}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="mt-0.5 h-[3px] w-5 rounded-full"
        style={{ backgroundColor: accent, opacity: 0.4 }}
      />
    </div>
  );
}