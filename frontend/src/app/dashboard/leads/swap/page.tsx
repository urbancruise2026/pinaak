"use client";

import { lazy } from "@/lib/lazy";

const SwapTable = lazy(
  () => import("@/features/telesales/components/Swap/swapTable"),
);

export default function Page() {
  return <SwapTable />;
}