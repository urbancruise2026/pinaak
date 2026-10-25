"use client";

import { lazy } from "@/lib/lazy";

const Comp = lazy(() => import("@/features/telesales/components/telesalesDashboard"));

export default function Page() {
  return <Comp />;
}