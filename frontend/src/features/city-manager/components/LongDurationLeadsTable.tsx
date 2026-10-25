"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchLongDurationLeads } from "@/features/user/accessSlice";
import { Clock } from "lucide-react";
import {
  CARD,
  CardHeader,
  Pager,
  StatusPill,
  TD,
  TH,
  fmtDateTime,
} from "./dashboardShared";

interface LongDurationLeadsTableProps {
  cityIds: number[];
  selectedAdvisorId: number | null;
}

const COLUMN_COUNT = 7;

export default function LongDurationLeadsTable({
  cityIds,
  selectedAdvisorId,
}: LongDurationLeadsTableProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { leads, loading, page, totalPages, total } = useSelector(
    (state: RootState) => state.travelAdvisor.longDurationLeads,
  );

  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchLongDurationLeads({
        page: tablePage,
        cityIds,
        advisorId: selectedAdvisorId,
        daysThreshold: 5,
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
        icon={Clock}
        title="Long Duration Leads"
        subtitle="Leads with longer duration"
        loading={loading}
      />

      <div className="max-h-[300px] overflow-auto rounded-xl border border-slate-100">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className={TH}>Customer</th>
              <th className={TH}>City</th>
              <th className={TH}>Assigned To</th>
              <th className={TH}>Status</th>
              <th className={TH}>Day</th>
              <th className={TH}>Pickup</th>
              <th className={TH}>Drop</th>
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
                  No long duration leads found
                </td>
              </tr>
            ) : (
              leads.map((lead, idx) => (
                <tr key={lead.id ?? idx} className="hover:bg-slate-50">
                  <td className={`${TD} font-medium text-slate-900`}>
                    {lead.customerName ?? "-"}
                  </td>
                  <td className={TD}>{lead.cityName ?? "-"}</td>
                  <td className={TD}>{lead.advisorFullName ?? "-"}</td>
                  <td className={TD}>
                    <StatusPill status={lead.status} />
                  </td>
                  <td className={`${TD} font-semibold text-rose-600`}>
                    {lead.days ?? 0}
                  </td>
                  <td className={TD}>{fmtDateTime(lead.pickupDateTime)}</td>
                  <td className={TD}>{fmtDateTime(lead.dropDateTime)}</td>
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