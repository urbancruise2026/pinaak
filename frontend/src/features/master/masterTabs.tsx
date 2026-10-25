import type { ComponentType } from "react";
import { lazy } from "@/lib/lazy";

export const MASTER_TABS: Record<string, ComponentType<any>> = {
  vendor: lazy(() => import("@/features/vendors/components/VendorFormData")),
  "vendor-table": lazy(() => import("@/features/vendors/components/vendortable")),
  vehicles: lazy(
    () => import("@/features/vehicles/components/VehiclesMaster/vehiclesmasterTable"),
  ),
  "vehicle-manager": lazy(
    () => import("@/features/vehicles/components/VehiclesManager/VehicleManagerTable"),
  ),
  driver: lazy(() => import("@/features/drivers/components/DriverFormData")),
  "driver-table": lazy(() => import("@/features/drivers/components/drivertable")),
  "customer-personal": lazy(
    () => import("@/features/customers/components/customerForm"),
  ),
  "customer-table": lazy(
    () => import("@/features/customers/components/customertable"),
  ),
  "customer-history": lazy(
    () => import("@/features/customers/components/CustomerHistory"),
  ),
  "card-reel": lazy(() => import("@/features/master/components/cardreel")),
  "quotation-pdf": lazy(
    () => import("@/features/rate-quotation/components/quotation"),
  ),
  "country-code": lazy(
    () => import("@/features/location/components/countrycode"),
  ),
};