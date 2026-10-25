"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { lazy } from "@/lib/lazy";
import { useRole } from "@/hooks/useRole";

const CityManagerDashboard = lazy(
  () => import("@/features/city-manager/components/citymanagerdashboard"),
);
const LeadsOverview = lazy(
  () => import("@/features/leads/components/leadsDashboard"),
);

export default function DashboardHome() {
  const router = useRouter();
  const role = useRole();
  const loginType = useSelector((s: RootState) => s.navigation.loginType);

  useEffect(() => {
    if (loginType === "vendor") router.replace("/dashboard/vendor");
  }, [loginType, router]);

  if (loginType === "vendor") return null;

  const showCityManager = role === "city manager" || role === "team leader-sales";
  return showCityManager ? <CityManagerDashboard /> : <LeadsOverview />;
}