"use client";

import React, { useEffect, useRef, useState } from "react";

interface VehicleCodeHoverProps {
  code?: string | null;
  seat?: string | number | null;
  category?: string | null;
  config?: string | null;
}

const VehicleCodeHover: React.FC<VehicleCodeHoverProps> = ({
  code,
  seat,
  category,
  config,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const codeRef = useRef<HTMLSpanElement>(null);

  if (!code) {
    return <span>-</span>;
  }

  // Actual values from vehicle data (NOT parsed from the code string)
  const displaySeat = seat || "-";
  const displayCategory = category || "-";
  const displayConfig = config || "-";

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

          <div className="relative z-10 flex items-center gap-4 whitespace-nowrap">
            {/* SEAT */}
            <div className="flex min-w-[45px] flex-col items-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Seat
              </span>

              <span className="mt-0.5 text-sm font-bold text-gray-800">
                {displaySeat}
              </span>
            </div>

            {/* DIVIDER */}
            <div className="h-8 w-px bg-gray-200" />

            {/* CATEGORY */}
            <div className="flex min-w-[65px] flex-col items-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Category
              </span>
              <span className="mt-0.5 text-sm font-bold text-orange-600">
                {displayCategory}
              </span>{" "}
            </div>

            {/* DIVIDER */}
            <div className="h-8 w-px bg-gray-200" />

            {/* CONFIG */}
            <div className="flex min-w-[50px] flex-col items-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Config
              </span>

              <span className="mt-0.5 text-sm font-bold text-gray-800">
                {displayConfig}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleCodeHover;
