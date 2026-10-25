"use client";

import { lazy } from "@/lib/lazy";

const VendorDashboard = lazy(
  () => import("@/features/vendors/components/vendorDashboard"),
);

export default function Page() {
  return <VendorDashboard />;
}