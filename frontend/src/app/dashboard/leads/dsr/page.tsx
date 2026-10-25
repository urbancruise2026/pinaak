"use client";

import { lazy } from "@/lib/lazy";

const DsrTable = lazy(() => import("@/features/dsr/components/DsrTable"));

export default function Page() {
  return <DsrTable />;
}