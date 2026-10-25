"use client";

import React from "react";
import { Plus } from "lucide-react";

interface FormPageHeaderProps {
  title: string;
}

const FormPageHeader: React.FC<FormPageHeaderProps> = ({ title }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-[0_8px_30px_rgba(234,88,12,0.10)]">
      {/* =========================
          TOP ORANGE DESIGN STRIP
      ========================= */}
      <div className="relative h-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-[15%] top-0 h-full w-20 skew-x-[-35deg] bg-white" />
          <div className="absolute left-[45%] top-0 h-full w-10 skew-x-[-35deg] bg-white" />
          <div className="absolute left-[70%] top-0 h-full w-16 skew-x-[-35deg] bg-white" />
        </div>
      </div>

      {/* =========================
          MAIN HEADER
      ========================= */}
      <div className="relative flex min-h-[105px] items-center px-5 py-5 sm:px-7">
        {/* LEFT VERTICAL DESIGN */}
        <div className="relative mr-5 flex h-[68px] w-[68px] shrink-0 items-center justify-center">
          {/* Outer diamond */}
          <div className="absolute h-[54px] w-[54px] rotate-45 rounded-xl border-2 border-orange-200 bg-orange-50" />

          {/* Inner diamond */}
          <div className="absolute h-[42px] w-[42px] rotate-45 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_6px_15px_rgba(234,88,12,0.30)]" />

          {/* Icon */}
          <Plus
            size={24}
            strokeWidth={2.5}
            className="relative z-10 text-white"
          />
        </div>

        {/* TITLE AREA */}
        <div className="relative z-10">
          {/* Small label */}
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500">
              Management
            </span>

            <span className="h-[1px] w-8 bg-orange-300" />
          </div>

          {/* Main title */}
          <h2 className="text-2xl font-black tracking-tight text-gray-800 sm:text-[30px]">
            {title}
          </h2>

          {/* Accent */}
          <div className="mt-2 flex items-center gap-1">
            <span className="h-[4px] w-10 rounded-full bg-orange-500" />
            <span className="h-[4px] w-4 rounded-full bg-orange-300" />
            <span className="h-[4px] w-2 rounded-full bg-orange-200" />
          </div>
        </div>

        {/* =========================
            RIGHT SIDE GEOMETRIC DESIGN
        ========================= */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-[260px] overflow-hidden">
          {/* Big orange angled block */}
          <div className="absolute -right-16 -top-12 h-[180px] w-[180px] rotate-45 rounded-[35px] bg-orange-50" />

          {/* Orange outline */}
          <div className="absolute -right-20 top-5 h-[120px] w-[200px] rotate-[25deg] rounded-[30px] border-[10px] border-orange-100" />

          {/* Small floating blocks */}
          <div className="absolute right-24 top-7 h-3 w-3 rotate-45 bg-orange-400" />
          <div className="absolute right-14 bottom-8 h-2 w-2 rotate-45 bg-amber-400" />
          <div className="absolute right-6 top-16 h-4 w-4 rotate-45 border-2 border-orange-300" />

          {/* Dotted pattern */}
          <div
            className="
              absolute
              bottom-4
              right-28
              h-16
              w-20
              opacity-40
              [background-image:radial-gradient(circle,_#f97316_1.2px,_transparent_1.2px)]
              [background-size:8px_8px]
            "
          />
        </div>

        {/* Bottom orange corner */}
        <div className="absolute bottom-0 right-0 h-1 w-36 bg-gradient-to-l from-orange-500 to-transparent" />
      </div>
    </div>
  );
};

export default FormPageHeader;
