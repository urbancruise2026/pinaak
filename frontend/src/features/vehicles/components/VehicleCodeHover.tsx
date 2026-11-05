"use client";

import React, { useEffect, useRef, useState } from "react";

interface VehicleCodeHoverProps {
  code?: string | null;
  seat?: string | number | null;
  category?: string | null;
  config?: string | null;
  make?: string | null;
  model?: string | null;
  variant?: string | null;
}

const LABEL = "text-[10px] font-semibold uppercase tracking-wider text-gray-400";

const Divider = () => <div className="h-8 w-px bg-gray-200" />;

const VehicleCodeHover: React.FC<VehicleCodeHoverProps> = ({
  code,
  seat,
  category,
  config,
  make,
  model,
  variant,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const codeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!showTooltip) return;

    const handleScroll = () => {
      setShowTooltip(false);
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showTooltip]);

  // Early return must come AFTER all hooks (rules of hooks)
  if (!code) {
    return <span>-</span>;
  }

  // Actual values from vehicle data (NOT parsed from the code string)
  const displaySeat = seat || "-";
  const displayCategory = category || "-";
  const displayConfig = config || "-";
  const displayMake = make || "-";
  const displayModel = model || "-";
  const variants = variant
    ? variant
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

  const handleMouseEnter = () => {
    if (!codeRef.current) return;

    const rect = codeRef.current.getBoundingClientRect();

    setPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });

    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      {/* CODE */}
      <span
        ref={codeRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block cursor-help whitespace-nowrap font-bold text-orange-700"
      >
        {code}
      </span>

      {/* TOOLTIP */}
      {showTooltip && (
        <div
          className="
            pointer-events-none
            fixed
            z-[99999]
            -translate-y-1/2
            rounded-xl
            border
            border-orange-200
            bg-white
            px-4
            py-3
            shadow-[0_10px_35px_rgba(15,23,42,0.18)]
          "
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {/* Arrow */}
          <div
            className="
              absolute
              -left-1.5
              top-1/2
              h-3
              w-3
              -translate-y-1/2
              rotate-45
              border-b
              border-l
              border-orange-200
              bg-white
            "
          />

          <div className="relative z-10 flex flex-col gap-3 whitespace-nowrap">
            {/* ROW 1: SEAT / CATEGORY / CONFIG */}
            <div className="flex items-center gap-4">
              <div className="flex min-w-[45px] flex-col items-center">
                <span className={LABEL}>Seat</span>
                <span className="mt-0.5 text-sm font-bold text-gray-800">
                  {displaySeat}
                </span>
              </div>

              <Divider />

              <div className="flex min-w-[65px] flex-col items-center">
                <span className={LABEL}>Category</span>
                <span className="mt-0.5 text-sm font-bold text-orange-600">
                  {displayCategory}
                </span>
              </div>

              <Divider />

              <div className="flex min-w-[50px] flex-col items-center">
                <span className={LABEL}>Config</span>
                <span className="mt-0.5 text-sm font-bold text-gray-800">
                  {displayConfig}
                </span>
              </div>
            </div>

            {/* HORIZONTAL DIVIDER */}
            <div className="h-px w-full bg-gray-200" />

            {/* ROW 2: MAKE / MODEL / VARIANT */}
            <div className="flex items-center gap-4">
              <div className="flex min-w-[45px] flex-col items-center">
                <span className={LABEL}>Make</span>
                <span className="mt-0.5 text-sm font-bold text-gray-800">
                  {displayMake}
                </span>
              </div>

              <Divider />

              <div className="flex min-w-[65px] flex-col items-center">
                <span className={LABEL}>Model</span>
                <span className="mt-0.5 text-sm font-bold text-gray-800">
                  {displayModel}
                </span>
              </div>

              <Divider />

              <div className="flex min-w-[50px] flex-col items-center">
                <span className={LABEL}>Variant</span>
                <div className="mt-0.5 flex flex-wrap justify-center gap-1">
                  {variants.length ? (
                    variants.map((v) => (
                      <span
                        key={v}
                        className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600"
                      >
                        {v}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-bold text-gray-800">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleCodeHover;