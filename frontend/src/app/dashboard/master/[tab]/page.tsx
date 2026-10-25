import MasterTabClient from "./MasterTabClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    "vendor",
    "vendor-table",
    "vehicles",
    "vehicle-manager",
    "driver",
    "driver-table",
    "customer-personal",
    "customer-table",
    "customer-history",
    "card-reel",
    "quotation-pdf",
    "country-code",
  ].map((tab) => ({ tab }));
}

export default function Page() {
  return <MasterTabClient />;
}
