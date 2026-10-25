"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnwantedLeads } from "../../leads/leadSlice";
import { RootState, AppDispatch } from "@/store/store";
import { LeadRecord } from "@/types/types";

export default function PreTabla() {
  const dispatch = useDispatch<AppDispatch>();

  const { unwantedLeads, unwantedLeadsLoading } = useSelector(
    (state: RootState) => state.lead,
  );

  useEffect(() => {
    dispatch(fetchUnwantedLeads());
  }, [dispatch]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (unwantedLeadsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-base text-gray-400 font-medium">
          Loading unwanted leads...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pl-4 border-l-4 border-orange-500 bg-orange-50 px-4 py-3 rounded-lg">
        <h2 className="text-2xl font-semibold text-orange-700">
          Unwanted Leads
        </h2>
        <p className="text-sm text-orange-400 mt-0.5">
          {unwantedLeads.length} record{unwantedLeads.length !== 1 ? "s" : ""}{" "}
          found
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm text-left border-collapse">
          {/* Head */}
          <thead>
            <tr className="bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3 border border-gray-200">Date</th>
              <th className="px-5 py-3 border border-gray-200">Status</th>
              <th className="px-5 py-3 border border-gray-200">Name</th>
              <th className="px-5 py-3 border border-gray-200">Phone</th>
              <th className="px-5 py-3 border border-gray-200">City</th>
              <th className="px-5 py-3 border border-gray-200">Lost Reason</th>
              <th className="px-5 py-3 border border-gray-200">Details</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {unwantedLeads.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-400 text-sm border border-gray-200"
                >
                  No unwanted leads found
                </td>
              </tr>
            ) : (
              unwantedLeads.map((lead: LeadRecord, idx: number) => (
                <tr
                  key={lead.id}
                  className={`
                    transition-colors duration-100
                    ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    hover:bg-orange-50
                  `}
                >
                  <td className="px-5 py-3 border border-gray-200 text-gray-500 whitespace-nowrap">
                    {formatDate(
                      (lead as any).updated_at || (lead as any).created_at,
                    )}
                  </td>

                  <td className="px-5 py-3 border border-gray-200 text-gray-600 whitespace-nowrap">
                    {lead.status || "N/A"}
                  </td>

                  <td className="px-5 py-3 border border-gray-200 font-medium text-gray-800 whitespace-nowrap">
                    {(lead as any).fullName ||
                      [lead.firstName, lead.middleName, lead.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                      "N/A"}
                  </td>

                  <td className="px-5 py-3 border border-gray-200 text-gray-600 whitespace-nowrap">
                    {lead.customerPhone || "N/A"}
                  </td>

                  <td className="px-5 py-3 border border-gray-200 text-gray-600 whitespace-nowrap">
                    {lead.customerCity || "N/A"}
                  </td>

                  <td className="px-5 py-3 border border-gray-200">
                    {(lead as any).lost_reason ? (
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                        {(lead as any).lost_reason}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>

                  <td className="px-5 py-3 border border-gray-200 text-gray-500 max-w-[220px] truncate">
                    {(lead as any).lost_reason_details || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
