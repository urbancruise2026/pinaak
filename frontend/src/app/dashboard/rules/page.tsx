"use client";

import { lazy } from "@/lib/lazy";

const RulesBoard = lazy(() => import("@/features/rules/components/RulesBoard"));

export default function Page() {
  return <RulesBoard />;
}