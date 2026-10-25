"use client";

import { lazy } from "@/lib/lazy";

const Comp = lazy(() => import("@/features/presales/components/dashboardpresales"));

export default function Page() {
  return <Comp />;
}