"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchHighPaxLeads } from "@/features/user/accessSlice";
import {
  CARD,
  CardHeader,
  Pager,
  StatusPill,
  TD,
  TH,
  fmtDateTime,
} from "./dashboardShared";

const COLUMN_COUNT = 7;

export default function HighPaxLeadsTable({
  cityIds,
  selectedAdvisorId,
}: {
  cityIds: number[];
  selectedAdvisorId: number | null;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { leads, loading, error, page, totalPages, total, paxThreshold } =
    useSelector((state: RootState) => state.travelAdvisor.highPaxLeads);

  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchHighPaxLeads({
        page: tablePage,
        limit: 10,
        cityIds: cityIds.length ? cityIds : undefined,
        advisorId: selectedAdvisorId ?? undefined,
      }),
    );
  }, [dispatch, tablePage, cityIds, selectedAdvisorId]);

  // Reset pagination when filters change
  useEffect(() => {
    setTablePage(1);
  }, [selectedAdvisorId, cityIds]);

  return (
    <div className={CARD}>
      <CardHeader
        icon={Users}
        title="Passenger Leads"
        subtitle={
          loading ? "Loading…" : `${total} leads with ${paxThreshold}+ pax`
        }
      />

      {error && (
        <p className="mb-3 text-sm font-medium text-red-600">{error}</p>
      )}

      <div className="max-h-[300px] overflow-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className={TH}>Customer</th>
              <th className={TH}>PAX</th>
              <th className={TH}>City</th>
              <th className={TH}>Assigned To</th>
              <th className={TH}>Pickup</th>
              <th className={TH}>Drop</th>
              <th className={TH}>Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  Loading…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No high pax leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className={`${TD} font-medium text-slate-900`}>
                    {lead.customerName?.trim() || "-"}
                  </td>
                  <td className={TD}>{lead.pax ?? "-"}</td>
                  <td className={TD}>{lead.cityName || "-"}</td>
                  <td className={TD}>{lead.advisorFullName || "-"}</td>
                  <td className={TD}>{fmtDateTime(lead.pickupDateTime)}</td>
                  <td className={TD}>{fmtDateTime(lead.dropDateTime)}</td>
                  <td className={TD}>
                    <StatusPill status={lead.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pager
        total={total}
        shownPage={page}
        tablePage={tablePage}
        totalPages={totalPages}
        loading={loading}
        onChange={setTablePage}
      />
    </div>
  );
}