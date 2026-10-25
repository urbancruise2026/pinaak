"use client";

import { lazy } from "@/lib/lazy";

const LeadForm = lazy(() => import("@/features/leads/components/leadsfrom"));

export default function Page() {
  return <LeadForm />;
}