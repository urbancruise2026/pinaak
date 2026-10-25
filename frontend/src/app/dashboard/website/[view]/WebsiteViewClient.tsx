"use client";

import type { ComponentType } from "react";
import { useParams, notFound } from "next/navigation";
import { lazy } from "@/lib/lazy";

const VIEWS: Record<string, ComponentType<any>> = {
  gac: lazy(() => import("@/features/website/components/gacTable")),
  gaq: lazy(() => import("@/features/website/components/gaqTable")),
};

export default function WebsitePage() {
  const { view } = useParams<{ view: string }>();
  const Comp = VIEWS[view];
  if (!Comp) notFound();
  return <Comp />;
}