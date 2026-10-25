"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { LeadRecord } from "@/types/types";
import { lazy } from "@/lib/lazy";

const RateQuotationTable = lazy<{ leadData?: LeadRecord | null }>(
  () => import("@/features/rate-quotation/components/ratequotationtable"),
);

export default function Page() {
  const lead = useSelector(
    (s: RootState) => s.navigation.selectedLeadForRateQuotation,
  );
  return <RateQuotationTable leadData={lead} />;
}