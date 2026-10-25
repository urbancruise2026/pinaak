"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

import { Bell } from "lucide-react";
import { getTodayFollowups } from "@/features/leads/lead_followupsSlice";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  
};

export default function NotificationDropdown({ isOpen, onToggle }: Props) {
  const dispatch = useAppDispatch();

  const { todayFollowups, todayFollowupsLoading, todayFollowupsError } =
    useAppSelector((state) => state.followUp);

  console.log(todayFollowups);

  useEffect(() => {
    dispatch(getTodayFollowups());
  }, [dispatch]);

  const unreadCount = todayFollowups.length;

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-orange-200 bg-white text-orange-600 transition-all duration-200 hover:border-orange-400 hover:shadow-md"
      >
        <Bell size={18} />

        {/* Notification Count */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-base font-semibold text-gray-900">
              Today&apos;s Followups
            </h3>
          </div>

          {/* Followups List */}
          <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
            {/* Loading */}
            {todayFollowupsLoading && (
              <li className="px-4 py-3 text-sm text-gray-400">Loading...</li>
            )}

            {/* Error */}
            {!todayFollowupsLoading && todayFollowupsError && (
              <li className="px-4 py-3 text-sm text-red-500">
                {todayFollowupsError}
              </li>
            )}

            {/* No Followups */}
            {!todayFollowupsLoading &&
              !todayFollowupsError &&
              todayFollowups.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-400">
                  No followups for today.
                </li>
              )}

            {/* Followup Items */}
            {!todayFollowupsLoading &&
              !todayFollowupsError &&
              todayFollowups.map((f) => (
                <li
                  key={f.followup_id}
                  className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  {/* Left Side - Followup Details */}
                  <div className="min-w-0 flex-1">
                    {/* Customer Name */}
                    <p className="text-sm font-semibold text-gray-900">
                      {f.firstName} {f.lastName}
                    </p>

                    {/* Remark */}
                    <p className="truncate text-sm text-gray-500">
                      {f.remark || "No remark added"}
                    </p>

                    {/* Date & Phone */}
                    <p className="mt-1 text-xs text-gray-400">
                      {f.followup_date} • {f.customerPhone}
                    </p>
                  </div>

                  {/* Right Side - Month Oval */}
                  <div className="flex flex-shrink-0 items-start">
                    <span className="rounded-full border-2 border-green-500 bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-800">
                      {f.pickup_month_name
                        ? f.pickup_month_name.slice(0, 3)
                        : "N/A"}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
