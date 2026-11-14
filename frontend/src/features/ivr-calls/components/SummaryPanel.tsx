"use client";

import React from "react";
import { Ban, CheckCircle2, Clock, Phone, PhoneIncoming, PhoneOutgoing, TrendingUp, XCircle, PhoneMissed } from "lucide-react";
import { formatDuration } from "../ivr.utils";
import { Empty, TH, TableShell, useIvrState } from "./shared";

const n = (v: number) => Number(v || 0).toLocaleString("en-IN");
const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : "0%");

// Decorative wave in the corner of a tile (not real data).
const Wave: React.FC<{ color: string; className?: string }> = ({ color, className = "" }) => (
  <svg viewBox="0 0 200 60" preserveAspectRatio="none" className={`pointer-events-none absolute bottom-0 right-0 h-3/4 w-2/3 ${className}`}>
    <defs>
      <linearGradient id={`g${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity="0.30" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0 50 C25 40 35 52 60 42 S95 30 120 38 S165 18 200 8 L200 60 L0 60 Z" fill={`url(#g${color.replace("#", "")})`} />
    <path d="M0 50 C25 40 35 52 60 42 S95 30 120 38 S165 18 200 8" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.7" />
  </svg>
);

const Tile: React.FC<{ label: string; value: number; tone: "green" | "red"; icon: React.ReactNode }> = ({
  label,
  value,
  tone,
  icon,
}) => {
  const g = tone === "green";
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-2.5 ${
        g ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/60" : "border-red-200 bg-gradient-to-br from-red-50 to-red-100/60"
      }`}
    >
      <Wave color={g ? "#22c55e" : "#f87171"} />
      <div className="relative flex items-start gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${g ? "bg-emerald-500 text-white" : "bg-red-100 text-red-600"}`}>
          {icon}
        </span>
        <div>
          <p className={`text-xs font-semibold ${g ? "text-emerald-700" : "text-red-700"}`}>{label}</p>
          <p className={`text-2xl font-extrabold leading-tight ${g ? "text-emerald-800" : "text-red-700"}`}>{n(value)}</p>
        </div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ label: string; value: number; cls: string }> = ({ label, value, cls }) => (
  <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${cls}`}>
    {label}
    <b className="text-sm">{n(value)}</b>
  </span>
);

const Pill: React.FC<{ text: string; cls: string }> = ({ text, cls }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{text}</span>
);

const SummaryPanel: React.FC = () => {
  const { summary, loading } = useIvrState();
  const t = summary?.totals;
  if (!t) return <Empty loading={loading.summary} />;

  const unanswered = Math.max(0, t.incoming - t.incomingConnected);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,260px)_1fr]">
        {/* ---------------- TOTAL ---------------- */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b2a5b] via-[#0a2149] to-[#07173a] p-3.5 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg ring-4 ring-white/10">
              <Phone className="h-5 w-5" />
            </span>
            <div className="border-l border-white/15 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">Total calls</p>
              <p className="text-4xl font-black leading-none">{n(t.total)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-blue-200">
                <Clock className="h-4 w-4" /> Talk time {formatDuration(t.talkSec)}
              </p>
            </div>
          </div>

          <div className="my-3 border-t border-white/10" />

          <div className="space-y-2">
            <div className="relative overflow-hidden rounded-xl bg-emerald-500/10 p-2.5 ring-1 ring-emerald-400/30">
              <Wave color="#34d399" />
              <div className="relative flex items-center gap-3">
                <Clock className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold uppercase leading-tight text-emerald-300">
                    Working hours
                    <br />
                    (10:00 - 21:30)
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold">
                    {n(t.workingHoursCalls)} <span className="text-xs font-normal text-blue-200">Total calls</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-amber-500/10 p-2.5 ring-1 ring-amber-400/30">
              <Wave color="#fbbf24" />
              <div className="relative flex items-center gap-3">
                <Ban className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-xs font-bold uppercase text-amber-300">Non-working hours</p>
                  <p className="mt-0.5 text-xl font-extrabold">
                    {n(t.nonWorkingHoursCalls)} <span className="text-xs font-normal text-blue-200">Total calls</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- INCOMING (top) + OUTGOING (below) ---------------- */}
        <div className="grid gap-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <PhoneIncoming className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Incoming Calls</h3>
              </div>
              <Pill text={`${pct(t.incomingConnected, t.incoming)} answered`} cls="bg-blue-50 text-blue-700" />
            </div>

            <div className="mt-3 grid items-center gap-3 md:grid-cols-[100px_1fr_1fr]">
              <div>
                <p className="bg-gradient-to-b from-blue-500 to-blue-800 bg-clip-text text-5xl font-black leading-none text-transparent">
                  {n(t.incoming)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                  </span>
                  {pct(t.incomingConnected, t.incoming)} of incoming
                </p>
              </div>
              <Tile label="Answered Calls" value={t.incomingConnected} tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
              <Tile label="Unanswered Calls" value={unanswered} tone="red" icon={<PhoneMissed className="h-4 w-4" />} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Unanswered breakdown:</span>
              <Chip label="Missed by agent" value={t.incomingMissedByAgent} cls="border-red-200 bg-red-50 text-red-700" />
              <Chip label="Dropped in IVR" value={t.droppedInIvr} cls="border-blue-200 bg-blue-50 text-blue-700" />
              <Chip label="Voicemail" value={t.voicemail} cls="border-violet-200 bg-violet-50 text-violet-700" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <PhoneOutgoing className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Outgoing Calls</h3>
              </div>
              <Pill text={`${pct(t.outgoingConnected, t.outgoing)} connected`} cls="bg-violet-50 text-violet-700" />
            </div>

            <div className="mt-3 grid items-center gap-3 md:grid-cols-[100px_1fr_1fr]">
              <div>
                <p className="bg-gradient-to-b from-violet-500 to-violet-800 bg-clip-text text-5xl font-black leading-none text-transparent">
                  {n(t.outgoing)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                  {pct(t.outgoingConnected, t.outgoing)} of outgoing
                </p>
              </div>
              <Tile label="Connected" value={t.outgoingConnected} tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
              <Tile label="Not Connected" value={t.outgoingNotConnected} tone="red" icon={<XCircle className="h-4 w-4" />} />
            </div>
          </section>
        </div>
      </div>

      {/* ---------------- AGENT-WISE ---------------- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">Agent-wise</div>
        <TableShell>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <TH>Agent</TH>
                <TH right>Incoming answered</TH>
                <TH right>Incoming missed</TH>
                <TH right>Missed, nobody answered</TH>
                <TH right>Outgoing connected</TH>
                <TH right>Outgoing not connected</TH>
                <TH right>Talk time</TH>
              </tr>
            </thead>
            <tbody>
              {summary.agents.map((a) => (
                <tr key={a.agentName} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-semibold text-slate-800">{a.agentName}</td>
                  <td className="px-3 py-2.5 text-right text-emerald-700">{n(a.incomingAnswered)}</td>
                  <td className="px-3 py-2.5 text-right text-red-600">{n(a.incomingMissed)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-red-700">{n(a.incomingMissedNobodyAnswered)}</td>
                  <td className="px-3 py-2.5 text-right text-emerald-700">{n(a.outgoingConnected)}</td>
                  <td className="px-3 py-2.5 text-right text-red-600">{n(a.outgoingNotConnected)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-700">{formatDuration(a.talkSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
        {summary.agents.length === 0 && <Empty loading={false} />}
      </div>
    </div>
  );
};

export default SummaryPanel;