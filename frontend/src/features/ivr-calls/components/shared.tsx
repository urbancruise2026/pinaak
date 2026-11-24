"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { STATUS_LABEL, STATUS_STYLE } from "../ivr.utils";
import type { ContactInfo, FollowupStatus } from "../ivr.types";

type Notify = (kind: "ok" | "err", text: string) => void;
const NoticeCtx = React.createContext<Notify>(() => {});
export const useNotice = () => {
  const notify = React.useContext(NoticeCtx);
  return { success: (t: string) => notify("ok", t), error: (t: string) => notify("err", t) };
};

export const NoticeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [n, setN] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = React.useCallback<Notify>((kind, text) => {
    setN({ kind, text });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setN(null), 3500);
  }, []);
  return (
    <NoticeCtx.Provider value={notify}>
      {children}
      {n && (
        <div
          role="status"
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${
            n.kind === "ok" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {n.text}
        </div>
      )}
    </NoticeCtx.Provider>
  );
};

export const useIvrDispatch = () => useDispatch<AppDispatch>();
export const useIvrState = () => useSelector((s: RootState) => s.ivr);

export const StatusBadge: React.FC<{ status: FollowupStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status].badge}`}
  >
    <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[status].dot}`} />
    {STATUS_LABEL[status]}
  </span>
);

export const Pager: React.FC<{
  page: number;
  limit: number;
  total: number;
  onChange: (p: number) => void;
}> = ({ page, limit, total, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-600">
      <span>
        {total === 0 ? "No records" : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}`}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Prev
        </button>
        <span>
          {page} / {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const Empty: React.FC<{ loading: boolean; text?: string }> = ({ loading, text }) => (
  <div className="py-10 text-center text-sm text-gray-500">
    {loading ? "Loading..." : (text ?? "No data for the selected filters")}
  </div>
);

export const Card: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "red" | "green" | "orange" | "blue";
}> = ({ label, value, hint, tone = "default" }) => {
  const toneCls = {
    default: "border-slate-200 bg-white",
    red: "border-red-200 bg-red-50",
    green: "border-emerald-200 bg-emerald-50",
    orange: "border-orange-200 bg-orange-50",
    blue: "border-blue-200 bg-blue-50",
  }[tone];
  return (
    <div className={`rounded-xl border p-3 shadow-sm ${toneCls}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

// Scroll box for a table: the heading row stays frozen while rows scroll.
export const TableShell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="max-h-[70vh] min-h-[12rem] overflow-auto lg:max-h-[calc(100vh-18rem)]">{children}</div>
);

export const TH: React.FC<React.PropsWithChildren<{ right?: boolean }>> = ({ children, right }) => (
  <th
    className={`sticky top-0 z-10 whitespace-nowrap bg-slate-100 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-[0_1px_0_0_#e2e8f0] ${
      right ? "text-right" : "text-left"
    }`}
  >
    {children}
  </th>
);

// Phone column: customer name when the number matches a customer, number on
// hover. Unknown numbers just show the number.
export const ContactCell: React.FC<{ phone: string; contact: ContactInfo | null }> = ({ phone, contact }) =>
  contact?.name ? (
    <span title={phone} className="cursor-help font-semibold text-slate-800 underline decoration-dotted underline-offset-2">
      {contact.name}
    </span>
  ) : (
    <span className="font-mono">{phone}</span>
  );

const LEAD_STYLE: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  RFQ: "bg-blue-100 text-blue-700",
  KYC: "bg-indigo-100 text-indigo-700",
  HOT: "bg-orange-100 text-orange-700",
  "VEH-N": "bg-amber-100 text-amber-800",
  LOST: "bg-red-100 text-red-700",
  BOOK: "bg-emerald-100 text-emerald-700",
};

// Lead column: status, remarks and (for LOST) the lost reason.
export const LeadCell: React.FC<{ contact: ContactInfo | null }> = ({ contact }) => {
  if (!contact) return <span className="text-xs text-slate-400">Not in customers</span>;
  if (!contact.leadStatus) return <span className="text-xs text-slate-400">No lead</span>;
  const status = contact.leadStatus.toUpperCase();
  return (
    <div className="max-w-[260px] space-y-0.5">
      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${LEAD_STYLE[status] ?? "bg-slate-100 text-slate-700"}`}>
        {contact.leadStatus}
      </span>
      {contact.lostReason && (
        <p className="truncate text-xs text-red-600" title={contact.lostReason}>
          Lost: {contact.lostReason}
        </p>
      )}
      {contact.remarks && (
        <p className="truncate text-xs text-slate-600" title={contact.remarks}>
          {contact.remarks}
        </p>
      )}
    </div>
  );
};
