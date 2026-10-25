"use client";

import { lazy } from "@/lib/lazy";

const VehicleDocuments = lazy(
  () =>
    import("@/features/vehicles/components/VehiclesManager/VehicleManagerCalenderPopup"),
);

export default function Page() {
  return <VehicleDocuments />;
}