"use client";

import { lazy } from "@/lib/lazy";
import { useRole } from "@/hooks/useRole";

const CityManagerDashboard = lazy(
  () => import("@/features/city-manager/components/citymanagerdashboard"),
);
const LeadsOverview = lazy(
  () => import("@/features/leads/components/leadsDashboard"),
);

export default function LeadsHome() {
  const role = useRole();
  const showCityManager = role === "city manager" || role === "team leader-sales";
  return showCityManager ? <CityManagerDashboard /> : <LeadsOverview />;
}