"use client";

import React from "react";
import { Ban, CheckCircle2, Clock, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, TrendingUp, XCircle } from "lucide-react";
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

const Tile: React.FC<{
  label: string;
  value: number;
  tone: "green" | "red";
  icon: React.ReactNode;
  className?: string;
}> = ({ label, value, tone, icon, className = "" }) => {
  const g = tone === "green";
  return (
    <div
      className={`relative min-w-[140px] overflow-hidden rounded-xl border px-3 py-2.5 ${
        g ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/60" : "border-red-200 bg-gradient-to-br from-red-50 to-red-100/60"
      } ${className}`}
    >
      <Wave color={g ? "#22c55e" : "#f87171"} className="!h-1/3 !w-1/3 opacity-70" />
      <div className="relative flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${g ? "bg-emerald-500 text-white" : "bg-red-100 text-red-600"}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${g ? "text-emerald-700" : "text-red-700"}`}>{label}</p>
          <p className={`text-2xl font-extrabold leading-tight ${g ? "text-emerald-800" : "text-red-700"}`}>{n(value)}</p>
        </div>
      </div>
    </div>
  );
};

// Square tile (same size for Answered and Unanswered).
const SquareTile: React.FC<{
  label: string;
  value: number;
  sub: string;
  tone: "green" | "red";
  icon: React.ReactNode;
}> = ({ label, value, sub, tone, icon }) => {
  const g = tone === "green";
  return (
    <div
      className={`relative flex aspect-square w-32 shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border p-2 text-center sm:w-40 ${
        g
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/70"
          : "border-red-200 bg-gradient-to-br from-red-50 to-red-100/70"
      }`}
    >
      <Wave color={g ? "#22c55e" : "#f87171"} className="!h-1/3 !w-full opacity-60" />
      <span className={`relative flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9 ${g ? "bg-emerald-500 text-white" : "bg-red-100 text-red-600"}`}>
        {icon}
      </span>
      <p className={`relative mt-1.5 text-xs font-semibold ${g ? "text-emerald-700" : "text-red-700"}`}>{label}</p>
      <p className={`relative text-3xl font-black leading-tight sm:text-4xl ${g ? "text-emerald-800" : "text-red-700"}`}>{n(value)}</p>
      <p className={`relative text-[11px] ${g ? "text-emerald-700/80" : "text-red-700/80"}`}>{sub}</p>
    </div>
  );
};

// Calls per hour of the day (real data); the count is always shown on top of each bar.
// Toggle: all calls (with the not-connected part marked) or only not-connected.
const HourChart: React.FC<{
  title: string;
  series: { total: number[]; missed: number[] };
  allLabel: string;
  missedLabel: string;
  tone: "blue" | "purple";
}> = ({ title, series, allLabel, missedLabel, tone }) => {
  const [mode, setMode] = React.useState<"all" | "missed">("all");
  const total = series?.total ?? Array.from({ length: 24 }, () => 0);
  const missed = series?.missed ?? Array.from({ length: 24 }, () => 0);
  const values = mode === "all" ? total : missed;
  const max = Math.max(1, ...values);
  const peak = values.indexOf(Math.max(...values));
  const any = values.some((v) => v > 0);
  const hh = (h: number) => String(h).padStart(2, "0");
  const base = tone === "blue" ? "bg-blue-300 group-hover:bg-blue-400" : "bg-violet-200 group-hover:bg-violet-300";
  const miss = tone === "blue" ? "bg-red-400" : "bg-violet-500";
  const btn = (on: boolean) =>
    `rounded-md px-2 py-0.5 text-[11px] font-semibold ${on ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`;
  return (
    <div className="flex h-full min-h-[170px] min-w-[240px] flex-1 flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-600">
          {title}
          {any && <span className="ml-1.5 font-normal text-slate-500">Peak {hh(peak)}:00 ({values[peak]})</span>}
        </span>
        <span className="inline-flex rounded-lg bg-slate-200/70 p-0.5">
          <button type="button" onClick={() => setMode("all")} className={btn(mode === "all")}>
            {allLabel}
          </button>
          <button type="button" onClick={() => setMode("missed")} className={btn(mode === "missed")}>
            {missedLabel}
          </button>
        </span>
      </div>

      <div className="mt-4 flex min-h-[90px] flex-1 items-end gap-[3px] pt-3">
        {values.map((v, h) => {
          const height = v > 0 ? Math.max(6, (v / max) * 100) : 0;
          const m = mode === "all" ? Math.min(missed[h] ?? 0, v) : 0;
          return (
            <div key={h} className="group relative flex h-full flex-1 items-end" title={`${hh(h)}:00 - ${hh(h)}:59`}>
              <div
                className={`relative w-full overflow-hidden rounded-t-sm ${mode === "all" ? base : v > 0 ? miss : "bg-slate-200"}`}
                style={{ height: v > 0 ? `${height}%` : "2px" }}
              >
                {m > 0 && <div className={`absolute bottom-0 w-full ${miss}`} style={{ height: `${(m / v) * 100}%` }} />}
              </div>
              {v > 0 && (
                <span
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[9px] font-bold leading-none text-slate-700"
                  style={{ bottom: `calc(${height}% + 2px)` }}
                >
                  {v}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-[3px] text-[8px] leading-none text-slate-500 sm:text-[9px]">
        {values.map((_, h) => (
          <span key={h} className="flex-1 text-center">
            {h}h
          </span>
        ))}
      </div>
    </div>
  );
};

const Chip: React.FC<{ label: string; value: number; cls: string }> = ({ label, value, cls }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${cls}`}>
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
  const un = summary.unassigned ?? {
    incomingAnswered: 0,
    incomingUnanswered: 0,
    outgoingConnected: 0,
    outgoingNotConnected: 0,
    talkSec: 0,
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,250px)_minmax(0,1fr)]">
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
              <p className="mt-0.5 text-[11px] text-blue-300">All day 00:00 - 23:59 (working + non-working)</p>
            </div>
          </div>

          <div className="my-3 border-t border-white/10" />

          <div className="flex flex-1 flex-col gap-2">
            <div className="relative flex-1 overflow-hidden rounded-xl bg-emerald-500/10 p-2.5 ring-1 ring-emerald-400/30">
              <Wave color="#34d399" />
              <div className="relative flex h-full items-center gap-3">
                <Clock className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold uppercase leading-tight text-emerald-300">
                    Working hours
                    <br />
                    9:30 - 21:30 (Sun 10:30 - 18:30)
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold">
                    {n(t.workingHoursCalls)} <span className="text-xs font-normal text-blue-200">Total calls</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-xl bg-amber-500/10 p-2.5 ring-1 ring-amber-400/30">
              <Wave color="#fbbf24" />
              <div className="relative flex h-full items-center gap-3">
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
        <div className="grid gap-4 [grid-template-rows:auto_auto]">
          <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <PhoneIncoming className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Incoming Calls</h3>
              </div>
              <Pill text={`${pct(t.incomingConnected, t.incoming)} answered`} cls="bg-blue-50 text-blue-700" />
            </div>

            <div className="mt-3 flex flex-wrap items-stretch gap-3">
              {/* number + what happened to the unanswered calls */}
              <div className="flex shrink-0 flex-col justify-center gap-2 pr-1">
                <div>
                  <p className="bg-gradient-to-b from-blue-500 to-blue-800 bg-clip-text text-4xl font-black leading-none text-transparent sm:text-5xl">
                    {n(t.incoming)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    {pct(t.incomingConnected, t.incoming)} of incoming
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <Chip label="Missed by agent" value={t.incomingMissedByAgent} cls="border-red-200 bg-white text-red-700" />
                  <Chip label="Dropped in IVR" value={t.droppedInIvr} cls="border-blue-200 bg-white text-blue-700" />
                  <Chip label="Voicemail" value={t.voicemail} cls="border-violet-200 bg-white text-violet-700" />
                </div>
              </div>

              <SquareTile
                label="Answered Calls"
                value={t.incomingConnected}
                sub={`${pct(t.incomingConnected, t.incoming)} of incoming`}
                tone="green"
                icon={<CheckCircle2 className="h-5 w-5" />}
              />
              <SquareTile
                label="Unanswered Calls"
                value={unanswered}
                sub={`${pct(unanswered, t.incoming)} of incoming`}
                tone="red"
                icon={<PhoneMissed className="h-4 w-4" />}
              />

              {/* connected back / pending + hourly graph filling the rest of the box */}
              <div className="flex min-w-[260px] flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-lg bg-emerald-100/80 px-2.5 py-1.5">
                    <p className="text-[11px] font-semibold text-emerald-700">Connected back</p>
                    <p className="text-lg font-extrabold leading-none text-emerald-800">{n(t.unansweredResolved)}</p>
                  </div>
                  <div className="rounded-lg bg-amber-100/80 px-2.5 py-1.5">
                    <p className="text-[11px] font-semibold text-amber-700">Pending</p>
                    <p className="text-lg font-extrabold leading-none text-amber-800">{n(t.unansweredPending)}</p>
                  </div>
                </div>
                <div className="min-h-[170px] flex-1">
                  <HourChart
                    title="Incoming by hour"
                    series={summary.hourly?.incoming ?? { total: [], missed: [] }}
                    allLabel="Incoming + missed"
                    missedLabel="Missed"
                    tone="blue"
                  />
                </div>
              </div>
            </div>

            {(summary.unansweredByDepartment ?? []).length > 0 && (
              <div className="mt-3 border-t border-slate-200 pt-2.5">
                <p className="mb-1.5 text-[11px] font-semibold text-slate-600">Unanswered by department</p>
                <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
                  {summary.unansweredByDepartment.map((d) => (
                    <div
                      key={d.department}
                      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs"
                    >
                      <span className="min-w-0 truncate font-semibold text-slate-800">{d.department}</span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
                          Dropped in IVR <b>{n(d.droppedInIvr)}</b>
                        </span>
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700">
                          Missed by agent <b>{n(d.missedByAgent)}</b>
                        </span>
                        <span className="rounded bg-violet-50 px-1.5 py-0.5 text-violet-700">
                          Voicemail <b>{n(d.voicemail)}</b>
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-800">{n(d.total)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <PhoneOutgoing className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Outgoing Calls</h3>
              </div>
              <Pill text={`${pct(t.outgoingConnected, t.outgoing)} connected`} cls="bg-violet-50 text-violet-700" />
            </div>

            <div className="mt-2.5 flex flex-wrap items-stretch gap-3">
              <div className="flex shrink-0 flex-col justify-center gap-2 pr-1">
                <p className="bg-gradient-to-b from-violet-500 to-violet-800 bg-clip-text text-4xl font-black leading-none text-transparent">
                  {n(t.outgoing)}
                </p>
              </div>
              <div className="flex w-44 shrink-0 flex-col gap-2">
                <Tile label="Connected" value={t.outgoingConnected} tone="green" icon={<CheckCircle2 className="h-4 w-4" />} className="flex-1" />
                <Tile label="Not Connected" value={t.outgoingNotConnected} tone="red" icon={<XCircle className="h-4 w-4" />} className="flex-1" />
              </div>
              <div className="min-h-[170px] min-w-[260px] flex-1">
                <HourChart
                  title="Outgoing by hour"
                  series={summary.hourly?.outgoing ?? { total: [], missed: [] }}
                  allLabel="Outgoing + not connected"
                  missedLabel="Not connected"
                  tone="purple"
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ---------------- AGENT-WISE ---------------- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Agent-wise</p>
          <p className="text-xs text-slate-500">
            Total row = the cards above. Calls that never reached an agent have their own row. A call that rang
            several agents is counted under each of them in Unanswered, so agent rows can add up to more than Total.
          </p>
        </div>
        <TableShell>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <TH>Agent</TH>
                <TH right>Incoming answered</TH>
                <TH right>Incoming unanswered</TH>
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
                  <td className="px-3 py-2.5 text-right text-red-600">{n(a.incomingUnanswered)}</td>
                  <td className="px-3 py-2.5 text-right text-emerald-700">{n(a.outgoingConnected)}</td>
                  <td className="px-3 py-2.5 text-right text-red-600">{n(a.outgoingNotConnected)}</td>
                  <td className="px-3 py-2.5 text-right text-slate-700">{formatDuration(a.talkSec)}</td>
                </tr>
              ))}
              {/* calls not connected to any agent */}
              <tr className="border-t border-amber-200 bg-amber-50/70">
                <td className="px-3 py-2.5 font-semibold text-amber-800">Not connected to any agent</td>
                <td className="px-3 py-2.5 text-right text-emerald-700">{n(un.incomingAnswered)}</td>
                <td className="px-3 py-2.5 text-right font-semibold text-red-700">{n(un.incomingUnanswered)}</td>
                <td className="px-3 py-2.5 text-right text-emerald-700">{n(un.outgoingConnected)}</td>
                <td className="px-3 py-2.5 text-right text-red-600">{n(un.outgoingNotConnected)}</td>
                <td className="px-3 py-2.5 text-right text-slate-700">{formatDuration(un.talkSec)}</td>
              </tr>
              {/* total = unique calls, same numbers as the cards */}
              <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
                <td className="px-3 py-2.5">Total</td>
                <td className="px-3 py-2.5 text-right">{n(t.incomingConnected)}</td>
                <td className="px-3 py-2.5 text-right">{n(unanswered)}</td>
                <td className="px-3 py-2.5 text-right">{n(t.outgoingConnected)}</td>
                <td className="px-3 py-2.5 text-right">{n(t.outgoingNotConnected)}</td>
                <td className="px-3 py-2.5 text-right">{formatDuration(t.talkSec)}</td>
              </tr>
            </tbody>
          </table>
        </TableShell>
      </div>
    </div>
  );
};

export default SummaryPanel;
