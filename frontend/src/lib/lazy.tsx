"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const LoadingPanel = () => (
  <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
    Loading module…
  </div>
);

export function lazy<P = any>(
  loader: () => Promise<any>,
): ComponentType<P> {
  return dynamic(loader, {
    ssr: false,
    loading: LoadingPanel,
  }) as ComponentType<P>;
}