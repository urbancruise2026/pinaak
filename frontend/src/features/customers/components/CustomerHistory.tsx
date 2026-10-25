"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Loader2,
  History,
  X,
  CalendarDays,
  MessageSquare,
  Search,
  RefreshCw,
} from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";

import {
  getAllLeads,
  getFollowupsByLeadId,
} from "@/features/leads/lead_followupsSlice";

import Pagination from "@/components/ui/pagination";
import LeadPageHeader from "@/components/ui/PageHeader/TablePageHeader";

import Table from "@/components/ui/Table/Table";
import TableHeader from "@/components/ui/Table/TableHeader";
import TableRow from "@/components/ui/Table/TableRow";
import TableCell from "@/components/ui/Table/TableCell";

interface Followup {
  followup_date: string | null;
  remark: string | null;


}

const LeadFollowupsTable = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { leads, loading, error } = useSelector(
    (state: RootState) => state.lead,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const [followups, setFollowups] = useState<Followup[]>([]);
  const [followupsLoading, setFollowupsLoading] = useState(false);
  const [followupsError, setFollowupsError] = useState<string | null>(null);

  const rowsPerPage = 50;

  const safeLeads = Array.isArray(leads) ? leads : [];

  // ============================================================
  // LOAD LEADS
  // ============================================================

  useEffect(() => {
    dispatch(getAllLeads());
  }, [dispatch]);

  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  const filteredLeads = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return safeLeads;
    }

    return safeLeads.filter((lead) => {
      return (
        String(lead.id ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.uuid ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.customer_id ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.fullName ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.customerPhone ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.customerEmail ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.advisor_id ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.advisorFullName ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.source ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.status ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.serviceType ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.city_id ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.cityName ?? "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [safeLeads, searchTerm]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;

    return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLeads, currentPage]);

  // ============================================================
  // RESET PAGE WHEN SEARCH CHANGES
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ============================================================
  // PAGE CHANGE
  // ============================================================

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    dispatch(getAllLeads());
  };

  // ============================================================
  // FORMAT LEAD DATE
  // ============================================================

  const formatDate = (date: string | null | undefined) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // FORMAT FOLLOWUP DATE
  // ============================================================

  const formatFollowupDate = (date: string | null | undefined) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status: string) => {
    const value = status?.toLowerCase().trim();

    if (
      value === "active" ||
      value === "open" ||
      value === "completed" ||
      value === "converted" ||
      value === "rfq"
    ) {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (
      value === "pending" ||
      value === "followup" ||
      value === "follow-up" ||
      value === "new"
    ) {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    if (
      value === "closed" ||
      value === "cancelled" ||
      value === "canceled" ||
      value === "lost"
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (value === "kyc") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  // ============================================================
  // OPEN FOLLOWUP HISTORY
  // ============================================================

  const handleOpenHistory = async (lead: any) => {
    if (!lead?.id) {
      return;
    }

    setFollowups([]);
    setFollowupsError(null);

    setSelectedLead(lead);
    setHistoryOpen(true);
    setFollowupsLoading(true);

    try {
      const result = await dispatch(
        getFollowupsByLeadId(Number(lead.id)),
      ).unwrap();

      console.log("FOLLOWUP API RESULT:", result);

      if (Array.isArray(result)) {
        setFollowups(result);
      } else if (
        result &&
        typeof result === "object" &&
        Array.isArray((result as any).data)
      ) {
        setFollowups((result as any).data);
      } else {
        setFollowups([]);
      }
    } catch (err: any) {
      console.error("Followup history error:", err);

      const status =
        err?.status ||
        err?.response?.status ||
        err?.payload?.status ||
        err?.payload?.statusCode;

      if (Number(status) === 404) {
        setFollowups([]);
        setFollowupsError(null);
      } else {
        setFollowups([]);
        setFollowupsError(
          err?.message ||
            err?.payload?.message ||
            "Failed to fetch followup history",
        );
      }
    } finally {
      setFollowupsLoading(false);
    }
  };

  // ============================================================
  // CLOSE HISTORY
  // ============================================================

  const handleCloseHistory = () => {
    setHistoryOpen(false);
    setSelectedLead(null);
    setFollowups([]);
    setFollowupsError(null);
    setFollowupsLoading(false);
  };

  // ============================================================
  // INITIAL LOADING
  // ============================================================

  if (loading && safeLeads.length === 0) {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />

            <p className="text-sm font-medium text-gray-500">
              Loading leads...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <>
      <div className="relative w-full space-y-4">
        <div className="flex h-full min-h-0 flex-col">
          {/* FIXED HEADER (with search menu inside) */}
          <div className="shrink-0">
            <LeadPageHeader
              title="Lead Followups"
              description="Manage, track & follow up with your leads"
            >
              {/* ================================================
                  SEARCH BOX (page-specific menu)
              ================================================ */}
              <div className="relative w-56 shrink-0">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search leads..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-600 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                />
              </div>

              {/* ================================================
                  REFRESH BUTTON
              ================================================ */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </LeadPageHeader>
          </div>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-600">{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              className="text-sm font-semibold text-red-600 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ======================================================
            LEADS TABLE
        ====================================================== */}
        <Table minWidth="min-w-[1350px]" maxHeight="max-h-[630px]">
          <TableHeader>
            <TableRow alternate={false}>
              <TableCell header sticky>
                #
              </TableCell>

              <TableCell header>Enquiry Date</TableCell>

              <TableCell header>Customer Name</TableCell>

              <TableCell header>Phone</TableCell>

              <TableCell header>Email</TableCell>

              <TableCell header>Source</TableCell>

              <TableCell header>Status</TableCell>

              <TableCell header>Service Type</TableCell>

              <TableCell header>City</TableCell>

              <TableCell header>Advisor Name</TableCell>

              <TableCell header>History</TableCell>
            </TableRow>
          </TableHeader>

          <tbody>
            {paginatedLeads.length > 0 ? (
              paginatedLeads.map((lead, index) => {
                const serialNumber =
                  (currentPage - 1) * rowsPerPage + index + 1;

                const customerName = lead.fullName || "-";

                const customerPhone = lead.customerPhone || "-";

                const customerEmail = lead.customerEmail || "-";

                const source = lead.source || "-";

                const status = lead.status || "-";

                const serviceType = lead.serviceType || "-";

                const cityName = lead.cityName || "-";

                const advisorName = lead.advisorFullName || "-";

                return (
                  <TableRow key={lead.id} index={index}>
                    {/* NUMBER */}

                    <TableCell sticky rowIndex={index}>
                      {serialNumber}
                    </TableCell>

                    {/* ENQUIRY DATE */}

                    <TableCell>{formatDate(lead.enquiryTime)}</TableCell>

                    {/* CUSTOMER */}

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">
                          {customerName !== "-"
                            ? customerName.charAt(0).toUpperCase()
                            : "-"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {customerName}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* PHONE */}

                    <TableCell>{customerPhone}</TableCell>

                    {/* EMAIL */}

                    <TableCell className="max-w-[220px]" title={customerEmail}>
                      <p className="truncate text-sm text-gray-600">
                        {customerEmail}
                      </p>
                    </TableCell>

                    {/* SOURCE */}

                    <TableCell>
                      <span className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {source}
                      </span>
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          status,
                        )}`}
                      >
                        {status}
                      </span>
                    </TableCell>

                    {/* SERVICE TYPE */}

                    <TableCell>{serviceType}</TableCell>

                    {/* CITY */}

                    <TableCell>{cityName}</TableCell>

                    {/* ADVISOR */}

                    <TableCell>{advisorName}</TableCell>

                    {/* HISTORY */}

                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleOpenHistory(lead)}
                        className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-100"
                      >
                        <History className="h-4 w-4" />
                        History
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              /* ==================================================
                  EMPTY STATE
              ================================================== */

              <tr>
                <td colSpan={11} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <History className="h-5 w-5 text-gray-400" />
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      No leads found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {searchTerm
                        ? "Try changing your search."
                        : "There are no leads available."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* ======================================================
            PAGINATION (same style as VehicleTable/master)
        ====================================================== */}
        {filteredLeads.length > 0 && (
          <div className="mt-2 shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLeads.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* ========================================================
          FOLLOWUP HISTORY MODAL
      ======================================================== */}

      {historyOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={handleCloseHistory}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <History className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    Followup History
                  </h3>

                  <p className="text-xs text-gray-500">
                    Lead #{selectedLead?.id} • {selectedLead?.fullName || "-"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseHistory}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ==================================================
                MODAL BODY
            ================================================== */}

            <div className="min-h-0 flex-1 overflow-auto p-5">
              {/* LOADING */}

              {followupsLoading && (
                <div className="flex min-h-[220px] flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />

                  <p className="mt-3 text-sm font-medium text-gray-500">
                    Loading followup history...
                  </p>
                </div>
              )}

              {/* ERROR */}

              {!followupsLoading && followupsError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                  <p className="text-sm font-semibold text-red-600">
                    {followupsError}
                  </p>
                </div>
              )}

              {/* EMPTY */}

              {!followupsLoading &&
                !followupsError &&
                followups.length === 0 && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <History className="h-6 w-6 text-gray-400" />
                    </div>

                    <h4 className="text-sm font-bold text-gray-700">
                      No followups found
                    </h4>

                    <p className="mt-1 max-w-sm text-xs text-gray-400">
                      No followup history is available for this lead.
                    </p>
                  </div>
                )}

              {/* ==================================================
                  FOLLOWUP TABLE
              ================================================== */}

              {!followupsLoading && !followupsError && followups.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="w-[80px] px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                            #
                          </th>

                          <th className="w-[250px] px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                            Followup Date
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                            Remark
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {followups.map((followup, index) => (
                          <tr
                            key={`${selectedLead?.id}-followup-${index}`}
                            className="transition hover:bg-orange-50/40"
                          >
                            {/* NUMBER */}

                            <td className="whitespace-nowrap px-4 py-4">
                              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-50 px-2 text-xs font-bold text-orange-600">
                                {index + 1}
                              </span>
                            </td>

                            {/* DATE */}

                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CalendarDays className="h-4 w-4 shrink-0 text-orange-500" />

                                <span>
                                  {formatFollowupDate(followup.followup_date)}
                                </span>
                              </div>
                            </td>

                            {/* REMARK */}

                            <td className="px-4 py-4">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                                  {followup.remark?.trim()
                                    ? followup.remark
                                    : "-"}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ==================================================
                        FOLLOWUP COUNT
                    ================================================== */}

                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">
                      Total followups:{" "}
                      <span className="font-bold text-gray-700">
                        {followups.length}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                onClick={handleCloseHistory}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadFollowupsTable;
