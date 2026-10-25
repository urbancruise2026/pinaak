"use client";

import { useEffect } from "react";
import {
  X,
  Loader2,
  CalendarDays,
  Phone,
  Mail,
  User,
  MessageSquareText,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store/store";

import {
  getFollowupsByLeadId,
  clearFollowups,
} from "@/features/leads/lead_followupsSlice";

import StatusTimeline from "./StatusTimeline";

interface FollowUpTableProps {
  lead: any;
  onClose: () => void;
}

export default function FollowUpTable({ lead, onClose }: FollowUpTableProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { followups, followupsLoading, followupsError } = useSelector(
    (state: RootState) => state.followUp,
  );

  const leadId = lead?.id;

  useEffect(() => {
    if (!leadId) return;

    dispatch(getFollowupsByLeadId(Number(leadId)));

    return () => {
      dispatch(clearFollowups());
    };
  }, [dispatch, leadId]);

  const formatDate = (value: any) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value: any) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getValue = (value: any) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "-";
    }

    return value;
  };

  const lostReason = getValue(lead?.lost_reason ?? lead?.lostReason);

  const lostReasonDetails = getValue(
    lead?.lost_reason_details ??
      lead?.lostReasonDetails ??
      lead?.lost_reason_detail,
  );

  const hasLostReason = lostReason !== "-" || lostReasonDetails !== "-";

  // status_history har followup row ke andar aata hai, sabko combine karke
  // StatusTimeline component ke andar dedupe + sort ho jayega
  const combinedStatusHistory = (followups || []).flatMap(
    (f: any) => f?.status_history || [],
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="relative flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
              <CalendarDays size={19} className="text-orange-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-800">
                Follow Up Timeline
              </h2>

              <p className="text-[11px] text-gray-400">
                Complete follow-up interaction history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!followupsLoading && (
              <span className="hidden rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 sm:block">
                {followups.length} Follow Ups
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b bg-gray-50 px-4 py-2.5">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {/* Lead ID */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-50">
                <FileText size={14} className="text-orange-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                  Lead ID
                </p>

                <p className="truncate text-xs font-semibold text-gray-700">
                  #{lead?.id ?? "-"}
                </p>
              </div>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-50">
                <User size={14} className="text-orange-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                  Customer
                </p>

                <p className="truncate text-xs font-semibold text-gray-700">
                  {lead?.fullName || "-"}
                </p>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-50">
                <Phone size={14} className="text-orange-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                  Mobile
                </p>

                <p className="truncate text-xs font-semibold text-gray-700">
                  {lead?.customerPhone || "-"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-50">
                <Mail size={14} className="text-orange-600" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="truncate text-xs font-semibold text-gray-700">
                  {lead?.customerEmail || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-3 py-3 sm:px-4">
          {/* STATUS TIMELINE BAR - Follow Up Timeline se upar */}
          {!followupsLoading && !followupsError && (
            <StatusTimeline statusHistory={combinedStatusHistory} />
          )}

          <div className="mb-2 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-orange-500" />

            <h3 className="text-sm font-bold text-gray-700">
              Follow Up Timeline
            </h3>
          </div>

          {followupsLoading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 rounded-lg border border-orange-100 bg-white px-4 py-3 text-orange-600 shadow-sm">
                <Loader2 size={19} className="animate-spin" />

                <span className="text-sm font-medium">
                  Loading followups...
                </span>
              </div>
            </div>
          )}

          {!followupsLoading && followupsError && (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-center">
                <AlertCircle size={24} className="mx-auto mb-2 text-red-500" />

                <p className="text-sm font-semibold text-red-600">
                  {followupsError}
                </p>
              </div>
            </div>
          )}

          {!followupsLoading && !followupsError && followups.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-8 py-7 text-center">
                <CalendarDays
                  size={32}
                  className="mx-auto mb-2 text-gray-300"
                />

                <p className="text-sm font-semibold text-gray-600">
                  No followups found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  There are no followup records for this lead.
                </p>
              </div>
            </div>
          )}

          {!followupsLoading && !followupsError && followups.length > 0 && (
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute bottom-5 left-[18px] top-5 w-px bg-orange-200" />

              <div className="space-y-3">
                {followups.map((item: any, index: number) => {
                  const followupDate = item?.followup_date;

                  const remark = getValue(item?.remark);

                  return (
                    <div
                      key={item?.id ?? `${leadId}-${index}`}
                      className="relative flex gap-3"
                    >
                      <div className="relative z-10 flex w-9 shrink-0 justify-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-orange-500 text-sm font-bold text-white shadow-md ring-1 ring-orange-200">
                          {index + 1}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-start gap-4 px-3 py-3">
                          {/* DATE */}
                          <div className="flex w-[145px] shrink-0 items-start gap-2 border-r border-gray-100 pr-4">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-100">
                              <CalendarDays
                                size={14}
                                className="text-orange-600"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                                Follow Up Date
                              </p>

                              <p className="mt-0.5 text-xs font-bold text-gray-700">
                                {formatDate(followupDate)}
                              </p>

                              {formatTime(followupDate) && (
                                <p className="text-[10px] font-medium text-gray-400">
                                  {formatTime(followupDate)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* REMARK */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-50">
                                <MessageSquareText
                                  size={14}
                                  className="text-orange-600"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                                  Remark
                                </p>

                                <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-5 text-gray-600">
                                  {remark}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/60 px-3 py-1.5">
                          <span className="text-[9px] font-medium text-gray-400">
                            Interaction #{index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hasLostReason && (
            <div className="mb-3 mt-5">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-orange-500" />

                <h3 className="text-sm font-bold text-gray-700">
                  Lost Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {/* Lost Reason */}
                {lostReason !== "-" && (
                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-50">
                        <AlertCircle size={14} className="text-orange-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                          Lost Reason
                        </p>

                        <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-5 text-gray-600">
                          {lostReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lost Reason Details */}
                {lostReasonDetails !== "-" && (
                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-50">
                        <FileText size={14} className="text-orange-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                          Lost Reason Details
                        </p>

                        <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-5 text-gray-600">
                          {lostReasonDetails}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t bg-white px-4 py-2.5">
          <p className="text-[11px] text-gray-400">
            Lead #{lead?.id ?? "-"}{" "}
            <span className="mx-1 text-gray-300">•</span>
            Follow-up history
          </p>
        </div>
      </div>
    </div>
  );
}
