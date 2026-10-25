"use client";

import { lazy } from "@/lib/lazy";

const VendorProfile = lazy(
  () => import("@/features/vendors/components/vendorProfile"),
);

export default function Page() {
  return <VendorProfile />;
}