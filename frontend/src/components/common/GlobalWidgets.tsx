"use client";

import { usePathname } from "next/navigation";
import AuthInitializer from "@/features/auth/components/AuthInitializer";
import GlobalLeadPopup from "./GlobalLeadPopup";

const PUBLIC_ROUTES = ["/gac-form"];

export default function GlobalWidgets() {
  const rawPathname = usePathname();
  const pathname =
    rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;

  if (PUBLIC_ROUTES.includes(pathname)) return null;

  return (
    <>
      <AuthInitializer />
      <GlobalLeadPopup />
    </>
  );
}
