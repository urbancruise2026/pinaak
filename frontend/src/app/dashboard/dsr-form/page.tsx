"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { LeadRecord } from "@/types/types";
import { lazy } from "@/lib/lazy";

const DsrForm = lazy<{ leadData?: LeadRecord | null }>(
  () => import("@/features/dsr/components/DsrForm"),
);

export default function Page() {
  const lead = useSelector((s: RootState) => s.navigation.selectedLeadForDsr);
  return <DsrForm leadData={lead} />;
}