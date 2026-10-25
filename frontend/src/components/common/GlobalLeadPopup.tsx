"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { fetchMyAssignedLeads } from "@/features/user/accessSlice";
import type { LeadRecord } from "@/types/types";
import { X, Bell, CalendarRange, Clock, Phone, Mail } from "lucide-react";

const IST_TIMEZONE = "Asia/Kolkata";

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isNewStatus = (status?: string) => {
  const s = (status ?? "").trim().toUpperCase();
  return s === "-" || s === "NEW";
};

export default function GlobalLeadPopup() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { leads } = useSelector(
    (state: RootState) => state.travelAdvisor.assignedLeads,
  );

  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const activeLeadsMapRef = useRef<Map<string, LeadRecord>>(new Map());
  const initialSeenRef = useRef<Set<string> | null>(null);
  const prevStatusRef = useRef<Map<string, string>>(new Map());
  const currentLeadIdRef = useRef<string | null>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const isTravelAdvisor = currentUser?.role_name === "Travel Advisor";

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // ─── Close with animation ─────────────────────────────────────────────────
  const closePopup = useCallback((cb?: () => void) => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setLead(null);
      currentLeadIdRef.current = null;
      setIsAnimatingOut(false);
      cb?.();
    }, 300);
  }, []);

  // ─── Show lead ────────────────────────────────────────────────────────────
  const showLead = useCallback(
    (l: LeadRecord) => {
      if (!isNewStatus(l.status)) return;
      if (currentLeadIdRef.current !== null) return;
      if (String(l.advisor_id) !== String(currentUser?.id)) return;

      currentLeadIdRef.current = String(l.id);
      setLead(l);
      setIsAnimatingOut(false);
    },
    [currentUser],
  );

  // ─── Schedule reshow ──────────────────────────────────────────────────────
  const scheduleReshow = useCallback(
    (leadId: string, delayMs: number) => {
      const existing = timersRef.current.get(leadId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        timersRef.current.delete(leadId);
        const latestLead = activeLeadsMapRef.current.get(leadId);
        if (
          latestLead &&
          isNewStatus(latestLead.status) &&
          String(latestLead.advisor_id) === String(currentUser?.id)
        ) {
          showLead(latestLead);
        }
      }, delayMs);

      timersRef.current.set(leadId, timer);
    },
    [showLead, currentUser],
  );

  // ─── Close button — 15 min baad wapas ────────────────────────────────────
  const handleClose = useCallback(() => {
    const closedId = currentLeadIdRef.current;
    closePopup(() => {
      if (closedId && activeLeadsMapRef.current.has(closedId)) {
        scheduleReshow(closedId, 15 * 60 * 1000);
      }
    });
  }, [closePopup, scheduleReshow]);

  // ─── Snooze button — 60 min baad wapas ───────────────────────────────────
  const handleSnooze = useCallback(() => {
    const snoozedId = currentLeadIdRef.current;
    closePopup(() => {
      if (snoozedId && activeLeadsMapRef.current.has(snoozedId)) {
        scheduleReshow(snoozedId, 60 * 60 * 1000);
      }
    });
  }, [closePopup, scheduleReshow]);

  // ─── Sirf ek baar fetch — no polling ─────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !isTravelAdvisor) return;
    dispatch(fetchMyAssignedLeads({page:1}));
  }, [currentUser, isTravelAdvisor, dispatch]);

  // ─── Process leads from Redux ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !isTravelAdvisor || !leads || leads.length === 0)
      return;

    if (initialSeenRef.current === null) {
      const baseline = new Set<string>();
      leads.forEach((l) => {
        const id = String(l.id);
        baseline.add(id);
        prevStatusRef.current.set(id, (l.status ?? "").trim());
        if (
          isNewStatus(l.status) &&
          String(l.advisor_id) === String(currentUser.id)
        ) {
          activeLeadsMapRef.current.set(id, l);
        }
      });
      initialSeenRef.current = baseline;
      return;
    }

    leads.forEach((l) => {
      const id = String(l.id);
      const isNew = isNewStatus(l.status);
      const currentStatus = (l.status ?? "").trim();
      const prevStatus = prevStatusRef.current.get(id);

      if (String(l.advisor_id) !== String(currentUser.id)) {
        activeLeadsMapRef.current.delete(id);
        prevStatusRef.current.set(id, currentStatus);
        return;
      }

      if (!isNew) {
        activeLeadsMapRef.current.delete(id);
        if (currentLeadIdRef.current === id) {
          closePopup();
        }
        const t = timersRef.current.get(id);
        if (t) {
          clearTimeout(t);
          timersRef.current.delete(id);
        }
        prevStatusRef.current.set(id, currentStatus);
        return;
      }

      // Trigger popup if: (a) this id was never seen before, OR
      // (b) its status just transitioned into a "new" status from something else.
      const isReallyNew = !initialSeenRef.current!.has(id);
      const statusJustBecameNew =
        prevStatus !== undefined && prevStatus !== currentStatus;

      activeLeadsMapRef.current.set(id, l);
      initialSeenRef.current!.add(id);
      prevStatusRef.current.set(id, currentStatus);

      if (isReallyNew || statusJustBecameNew) {
        showLead(l);
      }
    });
  }, [leads, currentUser, isTravelAdvisor]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Logout / role change reset ───────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !isTravelAdvisor) {
      setLead(null);
      currentLeadIdRef.current = null;
      activeLeadsMapRef.current.clear();
      initialSeenRef.current = null;
      prevStatusRef.current.clear();
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    }
  }, [currentUser, isTravelAdvisor]);

  if (!lead || !currentUser || !isTravelAdvisor) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className={`absolute inset-0 bg-black/55 transition-all duration-300 ${
          isAnimatingOut ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />
      <div
        style={{
          animation: isAnimatingOut
            ? "zoomOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards"
            : "zoomIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards",
        }}
        className="relative w-full max-w-2xl mx-4"
      >
        <div
          className="rounded-3xl p-[3px] shadow-2xl"
          style={{
            background: "#16a34a",
            boxShadow: "0 8px 32px rgba(22,163,74,0.35)",
          }}
        >
          <div className="rounded-[22px] p-6" style={{ background: "#16a34a" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-white " />
                <h2 className="text-2xl font-extrabold text-white">
                  🚀 New Lead Arrived!
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
                style={{ background: "#dc2626" }}
              >
                <X size={14} color="white" />
              </button>
            </div>

            {/* White body card */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "#ffffff",
                border: "0.5px solid rgba(255,255,255,0.3)",
              }}
            >
              <div className="space-y-3">
                {/* Date & Time */}
                <div
                  className="flex items-center gap-3 pb-3"
                  style={{ borderBottom: "0.5px solid #e5e7eb" }}
                >
                  <Clock
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "#6366f1" }}
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">
                      Leads Date &amp; Time:
                    </span>
                    <span
                      className="ml-2 font-medium"
                      style={{ color: "#6366f1" }}
                    >
                      {formatDateTime(lead.enquiryTime || lead.date)}
                    </span>
                  </span>
                </div>

                {/* Customer Name */}
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{
                    background: "#f0fdf4",
                    border: "0.5px solid #bbf7d0",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
                    style={{ background: "#16a34a" }}
                  >
                    {lead.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">
                      Customer Name
                    </div>
                    <div
                      className="text-base font-semibold"
                      style={{ color: "#15803d" }}
                    >
                      {lead.fullName}
                    </div>
                  </div>
                </div>

                {/* Phone & Email */}
                {(lead.customerEmail || lead.customerPhone) && (
                  <div
                    className="rounded-xl p-3 flex items-center gap-5"
                    style={{
                      background: "#f0fdf4",
                      border: "0.5px solid #bbf7d0",
                    }}
                  >
                    {lead.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone
                          className="w-4 h-4"
                          style={{ color: "#16a34a" }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {lead.customerPhone}
                        </span>
                      </div>
                    )}
                    {lead.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail
                          className="w-4 h-4"
                          style={{ color: "#3b82f6" }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {lead.customerEmail}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Travel Details */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarRange
                      className="w-4 h-4"
                      style={{ color: "#6366f1" }}
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      Travel Details
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: "Start Date",
                        value: formatDate(lead.pickupDateTime),
                      },
                      {
                        label: "End Date",
                        value: formatDate(lead.dropDateTime),
                      },
                      { label: "Duration", value: `${lead.days} days` },
                      { label: "Pax", value: `${lead.passengerTotal} pax` },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl p-3"
                        style={{
                          background: "#f0fdf4",
                          border: "0.5px solid #bbf7d0",
                        }}
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {item.label}
                        </div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "#15803d" }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "0.5px solid rgba(255,255,255,0.4)",
                  color: "#ffffff",
                }}
              >
                CLOSE (15 min)
              </button>
              <button
                onClick={handleSnooze}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "0.5px solid rgba(255,255,255,0.4)",
                  color: "#ffffff",
                }}
              >
                <Clock className="w-4 h-4" />
                <span>Remind in 60 min</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zoomIn { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes zoomOut { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.7); } }
      `}</style>
    </div>
  );
}
