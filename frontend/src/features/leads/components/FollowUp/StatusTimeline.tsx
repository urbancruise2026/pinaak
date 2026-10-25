"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";

interface StatusHistoryItem {
  id: number;
  old_status: string;
  new_status: string;
  changed_by: string | null;
  changed_at: string;
}

interface StatusTimelineProps {
  statusHistory: StatusHistoryItem[];
}

// Status -> color config (aapke stats card wale colors se match)
const STATUS_STYLES: Record<
  string,
  { bg: string; border: string; text: string; ring: string; dot: string }
> = {
  NEW: {
    bg: "bg-blue-200",
    border: "border-sky-800",
    text: "text-black",
    ring: "ring-sky-500",
    dot: "bg-sky-600",
  },
  KYC: {
    bg: "bg-orange-200",
    border: "border-orange-800",
    text: "text-orange-950",
    ring: "ring-orange-500",
    dot: "bg-orange-600",
  },
  RFQ: {
    bg: "bg-blue-300",
    border: "border-blue-800",
    text: "text-blue-950",
    ring: "ring-blue-600",
    dot: "bg-blue-700",
  },
  HOT: {
    bg: "bg-purple-200",
    border: "border-purple-800",
    text: "text-purple-950",
    ring: "ring-purple-500",
    dot: "bg-purple-600",
  },
  "VEH-N": {
    bg: "bg-pink-200",
    border: "border-pink-900",
    text: "text-pink-950",
    ring: "ring-pink-500",
    dot: "bg-pink-700",
  },
  LOST: {
    bg: "bg-red-500",
    border: "border-red-600",
    text: "text-white",
    ring: "ring-red-300",
    dot: "bg-red-600",
  },
  BOOK: {
    bg: "bg-green-800",
    border: "border-green-800",
    text: "text-white",
    ring: "ring-green-400",
    dot: "bg-green-800",
  },
};

// Koi bhi status jo upar list me nahi hai (e.g. "TRIP COMPLETE") uske liye default
const DEFAULT_STYLE = {
  bg: "bg-gray-200",
  border: "border-gray-700",
  text: "text-gray-900",
  ring: "ring-gray-400",
  dot: "bg-gray-600",
};

const getStatusStyle = (status: string) => {
  const key = (status || "").trim().toUpperCase();
  return STATUS_STYLES[key] || DEFAULT_STYLE;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "-", time: "-" };
  return {
    date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const formatDuration = (from: string, to: string) => {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;

  let diffMs = end - start;
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;

  const days = Math.floor(diffMs / dayMs);
  diffMs -= days * dayMs;
  const hours = Math.floor(diffMs / hourMs);
  diffMs -= hours * hourMs;
  const minutes = Math.floor(diffMs / minuteMs);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
};

export default function StatusTimeline({ statusHistory }: StatusTimelineProps) {
  // status_history API me har followup row ke andar repeat hota hai,
  // isliye id se dedupe + changed_at se sort karna zaroori hai
  const uniqueHistory = Array.from(
    new Map((statusHistory || []).map((item) => [item.id, item])).values(),
  ).sort(
    (a, b) =>
      new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime(),
  );

  if (uniqueHistory.length === 0) return null;

  return (
    <div className="mb-3 overflow-x-auto rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-orange-500" />
        <h3 className="text-sm font-bold text-gray-700">Status Timeline</h3>
      </div>

      <div className="flex min-w-max items-start">
        {uniqueHistory.map((item, index) => {
          const { date, time } = formatDateTime(item.changed_at);
          const duration =
            index > 0
              ? formatDuration(
                  uniqueHistory[index - 1].changed_at,
                  item.changed_at,
                )
              : null;

          const isLast = index === uniqueHistory.length - 1;
          const style = getStatusStyle(item.new_status);

          return (
            <div key={item.id} className="flex items-start">
              <div className="flex w-[130px] flex-col items-center text-center">
                {/* Status Badge */}
                <div
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${style.bg} ${style.border} ${style.text} ${
                    isLast ? `ring-2 ${style.ring} ring-offset-1` : ""
                  }`}
                >
                  <CheckCircle2 size={13} className={style.text} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">
                    {item.new_status}
                  </span>
                </div>

                <p className="mt-1.5 text-[11px] font-semibold text-gray-500">
                  {date}{" "}
                  <span className="font-normal text-gray-500">{time}</span>
                </p>
                {duration && (
                  <span
                    className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.border} ${style.text}`}
                  >
                    {duration}
                  </span>
                )}
              </div>

              {!isLast && (
                <div className="mt-3 flex w-10 shrink-0 items-center">
                  <div
                    className={`h-0.5 flex-1 rounded-full ${
                      getStatusStyle(uniqueHistory[index + 1].new_status).dot
                    } opacity-40`}
                  />
                  <ChevronRight
                    size={14}
                    strokeWidth={3}
                    className={`-ml-1 ${
                      getStatusStyle(uniqueHistory[index + 1].new_status).text
                    } opacity-60`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
