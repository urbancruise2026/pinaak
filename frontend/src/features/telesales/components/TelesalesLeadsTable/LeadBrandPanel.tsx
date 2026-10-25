"use client";

import { Users, Target, ArrowRight } from "lucide-react";

export default function LeadBrandPanel() {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 via-orange-50/50 to-white px-4 py-2.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 shadow-md sm:h-12 sm:w-12">
        <Users className="h-6 w-6 text-orange-500" strokeWidth={2} />
      </div>

      <div className="min-w-0">
        {/* single line title */}
        <h2 className="whitespace-nowrap text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
          Lead Manager
        </h2>
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
          <span className="font-medium">Tele-Sales</span>
          <span className="hidden items-center gap-1.5 text-xs md:inline-flex">
            <Target className="h-3.5 w-3.5 text-orange-500" />
            More Conversations
            <ArrowRight className="h-3 w-3" />
            More Opportunities
          </span>
        </p>
      </div>
    </div>
  );
}