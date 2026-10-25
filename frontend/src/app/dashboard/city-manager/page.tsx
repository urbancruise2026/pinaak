"use client";

import { lazy } from "@/lib/lazy";

const Comp = lazy(() => import("@/features/city-manager/components/citymanagerdashboard"));

export default function Page() {
  return <Comp />;
}