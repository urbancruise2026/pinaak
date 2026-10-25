"use client";

import { useCallback } from "react";
import type { LeadRecord } from "@/types/types";
import Pagination from "@/components/ui/pagination";
import { useLeadColumns } from "../../leads/types/LeadsTable/leadTableColumns";

interface StatusLeadsTableProps {
  leads: LeadRecord[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onViewLead?: (lead: LeadRecord) => void;
  onEditLead?: (lead: LeadRecord) => void;
  // Sirf ye column keys dikhengi (order bhi isi array ke hisab se). Undefined = sab columns.
  visibleColumnKeys?: string[];
}

export default function StatusLeadsTable({
  leads,
  loading,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onViewLead,
  onEditLead,
  visibleColumnKeys,
}: StatusLeadsTableProps) {
  // useLeadColumns needs these callbacks — kept stable via useCallback
  const handleUnwantedClick = useCallback(() => {}, []);
  const handleViewLead = useCallback(
    (lead: LeadRecord) => onViewLead?.(lead),
    [onViewLead],
  );
const setEditLead = useCallback(
  (lead: LeadRecord | null) => {
    if (lead) onEditLead?.(lead);
  },
  [onEditLead],
);

  const allColumns = useLeadColumns({
    handleUnwantedClick,
    handleViewLead,
    setEditLead,
  });

  // Agar visibleColumnKeys diya hai to sirf wahi columns rakho, aur usi order me
  const columns = visibleColumnKeys
    ? (visibleColumnKeys
        .map((key) => allColumns.find((c) => c.key === key))
        .filter(Boolean) as typeof allColumns)
    : allColumns;

  return (
    <div className="mt-2 bg-white border shadow-sm rounded-3xl border-slate-200 w-full flex flex-col">
      <div
        className="border border-slate-100 rounded-2xl"
        style={{
          maxHeight: "calc(100vh - 320px)",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <table className="min-w-full text-xs border-collapse sm:text-sm">
          <thead style={{ position: "sticky", top: 0, zIndex: 20 }}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border border-white text-center bg-slate-900 px-2 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-white sm:text-xs whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-sm font-semibold text-slate-500 py-8"
                >
                  Loading…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-sm font-semibold text-slate-500 py-8"
                >
                  No leads.
                </td>
              </tr>
            ) : (
              leads.map((lead, rowIndex) => (
                <tr
                  key={lead.id}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="border border-slate-100 text-slate-800 p-[3px_6px] text-sm font-semibold whitespace-nowrap"
                    >
                      {column.render(lead, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages ?? 1}
        totalItems={total ?? 0}
        rowsPerPage={50}
        onPageChange={onPageChange}
      />
    </div>
  );
}
