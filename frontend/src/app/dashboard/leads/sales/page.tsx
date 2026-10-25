"use client";

import { lazy } from "@/lib/lazy";

const SaleLeadTable = lazy(
  () => import("@/features/telesales/components/saleleadable"),
);

export default function Page() {
  return <SaleLeadTable />;
}