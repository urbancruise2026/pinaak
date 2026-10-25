import type { ComponentType, ReactNode } from "react";

export const STATUS_META = [
  { key: "NEW", label: "New", tileBg: "#EFF6FF", tileText: "#1D4ED8", dot: "#2563EB", pillBg: "#DBEAFE", pillText: "#1D4ED8" },
  { key: "KYC", label: "KYC", tileBg: "#FFF7ED", tileText: "#C2410C", dot: "#FB923C", pillBg: "#FFEDD5", pillText: "#C2410C" },
  { key: "RFQ", label: "RFQ", tileBg: "#EEF2FF", tileText: "#4338CA", dot: "#818CF8", pillBg: "#E0E7FF", pillText: "#4338CA" },
  { key: "HOT", label: "Hot", tileBg: "#FAF5FF", tileText: "#7E22CE", dot: "#A855F7", pillBg: "#F3E8FF", pillText: "#7E22CE" },
  { key: "VEH-N", label: "Veh-N", tileBg: "#FDF2F8", tileText: "#BE185D", dot: "#EC4899", pillBg: "#FCE7F3", pillText: "#BE185D" },
  { key: "LOST", label: "Lost", tileBg: "#FFF1F2", tileText: "#BE123C", dot: "#F43F5E", pillBg: "#FFE4E6", pillText: "#BE123C" },
  { key: "BOOK", label: "Book", tileBg: "#ECFDF5", tileText: "#047857", dot: "#10B981", pillBg: "#D1FAE5", pillText: "#047857" },
] as const;

export const statusMeta = (key?: string | null) =>
  STATUS_META.find((s) => s.key === key);

export function StatusPill({ status }: { status?: string | null }) {
  if (!status) return <span className="text-slate-400">-</span>;
  const m = statusMeta(status);
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: m?.pillBg ?? "#F1F5F9",
        color: m?.pillText ?? "#475569",
      }}
    >
      {m?.label ?? status}
    </span>
  );
}

export const fmtDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const CARD = "rounded-2xl border border-slate-200 text-center bg-white p-5 shadow-sm";

export const SELECT_CLS =
  "appearance-none cursor-pointer rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200";

export function CardHeader({
  icon: Icon,
  title,
  subtitle,
  loading,
  right,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  subtitle?: string;
  loading?: boolean;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            {title}
            {loading && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                syncing…
              </span>
            )}
          </h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Pager({
  total,
  shownPage,
  tablePage,
  totalPages,
  loading,
  onChange,
}: {
  total: number;
  shownPage: number;
  tablePage: number;
  totalPages: number;
  loading: boolean;
  onChange: (page: number) => void;
}) {
  const btn =
    "rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
      <span>Total: {total}</span>
      <div className="flex items-center gap-2">
        <button
          className={btn}
          disabled={loading || tablePage <= 1}
          onClick={() => onChange(Math.max(1, tablePage - 1))}
        >
          Prev
        </button>
        <span>
          Page {totalPages > 0 ? shownPage : 0} / {totalPages}
        </span>
        <button
          className={btn}
          disabled={loading || tablePage >= totalPages || totalPages === 0}
          onClick={() => onChange(tablePage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export const TH = "px-4 py-3 text-left text-xs font-semibold text-slate-600";
export const TD = "px-4 py-3 text-slate-700 whitespace-nowrap";