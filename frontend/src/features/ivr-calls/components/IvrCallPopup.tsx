"use client";

import React from "react";
import { PhoneIncoming, PhoneMissed, PhoneCall, X } from "lucide-react";
import { getSocket } from "@/lib/socket";
import type { ContactInfo } from "../ivr.types";
import { LeadCell } from "./shared";

// Customer-call pop-ups pushed by the server (MyOperator webhook -> Socket.IO).
// Mount ONCE inside the logged-in layout, e.g. inside <SocketProvider>.
// Server events: ivr:incoming | ivr:answered | ivr:ended

interface IncomingEvent {
  callId: string;
  phone: string;
  contact: ContactInfo | null;
  department: string | null;
  agentId: number;
  agentName: string;
  startedAt: string;
}
interface AnsweredEvent {
  callId: string;
  agentId: number | null;
  agentName: string | null;
}
interface EndedEvent {
  callId: string;
  status: string | null;
  duration: number;
}

type Phase = "ringing" | "answered_me" | "answered_other" | "missed" | "done";

interface PopupCall {
  callId: string;
  phone: string;
  contact: ContactInfo | null;
  department: string | null;
  agents: { id: number; name: string }[];
  answeredBy: string | null;
  phase: Phase;
}

const pretty = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length >= 10 ? `+${d.length > 10 ? d.slice(0, d.length - 10) : "91"} ${d.slice(-10)}` : phone || "Unknown number";
};

// short double beep; browsers may block audio before the first click, so never throw
const beep = () => {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.25].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.value = 0.08;
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.15);
    });
    setTimeout(() => void ctx.close(), 800);
  } catch {
    /* ignore */
  }
};

const IvrCallPopup: React.FC = () => {
  const [calls, setCalls] = React.useState<PopupCall[]>([]);
  const timers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const remove = React.useCallback((callId: string) => {
    clearTimeout(timers.current[callId]);
    delete timers.current[callId];
    setCalls((list) => list.filter((c) => c.callId !== callId));
  }, []);

  const removeLater = React.useCallback(
    (callId: string, ms: number) => {
      clearTimeout(timers.current[callId]);
      timers.current[callId] = setTimeout(() => remove(callId), ms);
    },
    [remove],
  );

  React.useEffect(() => {
    const socket = getSocket();

    const onIncoming = (e: IncomingEvent) => {
      setCalls((list) => {
        const existing = list.find((c) => c.callId === e.callId);
        if (existing) {
          const has = existing.agents.some((a) => a.id === e.agentId);
          return list.map((c) =>
            c.callId === e.callId && !has ? { ...c, agents: [...c.agents, { id: e.agentId, name: e.agentName }] } : c,
          );
        }
        beep();
        return [
          {
            callId: e.callId,
            phone: e.phone,
            contact: e.contact,
            department: e.department,
            agents: [{ id: e.agentId, name: e.agentName }],
            answeredBy: null,
            phase: "ringing",
          },
          ...list,
        ];
      });
      // safety: never leave a pop-up open forever
      removeLater(e.callId, 3 * 60 * 1000);
    };

    const onAnswered = (e: AnsweredEvent) => {
      setCalls((list) =>
        list.map((c) => {
          if (c.callId !== e.callId) return c;
          const mine = e.agentId != null && c.agents.some((a) => a.id === e.agentId);
          return { ...c, phase: mine ? "answered_me" : "answered_other", answeredBy: e.agentName };
        }),
      );
      removeLater(e.callId, 60 * 60 * 1000); // ended event removes it sooner
    };

    const onEnded = (e: EndedEvent) => {
      let wasRinging = false;
      setCalls((list) =>
        list.map((c) => {
          if (c.callId !== e.callId) return c;
          wasRinging = c.phase === "ringing";
          return { ...c, phase: c.phase === "ringing" ? "missed" : "done" };
        }),
      );
      removeLater(e.callId, wasRinging ? 10000 : 2500);
    };

    socket.on("ivr:incoming", onIncoming);
    socket.on("ivr:answered", onAnswered);
    socket.on("ivr:ended", onEnded);
    const pending = timers.current;
    return () => {
      socket.off("ivr:incoming", onIncoming);
      socket.off("ivr:answered", onAnswered);
      socket.off("ivr:ended", onEnded);
      Object.values(pending).forEach(clearTimeout);
    };
  }, [removeLater]);

  if (calls.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3">
      {calls.map((c) => {
        const ringing = c.phase === "ringing";
        const tone =
          c.phase === "ringing"
            ? "border-blue-300 bg-white"
            : c.phase === "answered_me"
              ? "border-emerald-300 bg-emerald-50"
              : c.phase === "missed"
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-slate-50";
        return (
          <div key={c.callId} className={`pointer-events-auto rounded-2xl border-2 p-3 shadow-xl ${tone}`}>
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  ringing
                    ? "animate-pulse bg-blue-600 text-white"
                    : c.phase === "answered_me"
                      ? "bg-emerald-500 text-white"
                      : c.phase === "missed"
                        ? "bg-red-100 text-red-600"
                        : "bg-slate-200 text-slate-600"
                }`}
              >
                {c.phase === "missed" ? <PhoneMissed className="h-5 w-5" /> : ringing ? <PhoneIncoming className="h-5 w-5" /> : <PhoneCall className="h-5 w-5" />}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {ringing && "Incoming call"}
                  {c.phase === "answered_me" && "On call"}
                  {c.phase === "answered_other" && `Answered by ${c.answeredBy ?? "a teammate"}`}
                  {c.phase === "missed" && "Missed call"}
                  {c.phase === "done" && "Call ended"}
                </p>
                <p className="truncate text-base font-bold text-slate-900" title={pretty(c.phone)}>
                  {c.contact?.name || pretty(c.phone)}
                </p>
                {c.contact?.name && <p className="text-xs text-slate-500">{pretty(c.phone)}</p>}
                <p className="mt-0.5 text-xs text-slate-500">
                  {c.department ? `${c.department} - ` : ""}
                  for {c.agents.map((a) => a.name).join(", ")}
                </p>
              </div>

              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => remove(c.callId)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {c.contact && (
              <div className="mt-2 rounded-lg bg-white/70 p-2">
                <LeadCell contact={c.contact} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default IvrCallPopup;
