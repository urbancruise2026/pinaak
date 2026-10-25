"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { lazy } from "@/lib/lazy";

const LeadTable = lazy<{ selectedRegion?: string; selectedCity?: string }>(
  () => import("@/features/leads/components/leadTable"),
);

export default function Page() {
  const nav = useSelector((s: RootState) => s.navigation);
  return (
    <LeadTable
      selectedRegion={nav.selectedRegion}
      selectedCity={nav.selectedCity}
    />
  );
}