"use client";

import { lazy } from "@/lib/lazy";

const DownloadReport = lazy(
  () => import("@/features/download/components/download"),
);

export default function Page() {
  return <DownloadReport />;
}