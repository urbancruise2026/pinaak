"use client";

import { lazy } from "@/lib/lazy";

const Comp = lazy(() => import("@/features/team-leader/components/teamleaderdashboard"));

export default function Page() {
  return <Comp />;
}