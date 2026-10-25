"use client";
import { Sparkles, Coffee, Loader2, Briefcase, Layers } from "lucide-react";
import React from "react";

type Variant = "default" | "minimal" | "colorful" | "brand" | "warm";

export function FullScreenLoader({
  message = "Loading your workspace...",
  variant = "default",
}: {
  message?: string;
  variant?: Variant;
}) {
  const variants = {
    default: {
      outerBg: "bg-gradient-to-br from-primary/5 via-background to-primary/5",
      spinnerBorder: "border-primary/20 border-t-primary",
      iconColor: "text-primary",
      titleColor: "text-foreground",
      icon: <Briefcase className="h-7 w-7" />,
      dotColors: ["bg-primary", "bg-primary/70", "bg-primary/40"],
    },

    minimal: {
      outerBg: "bg-background",
      spinnerBorder: "border-muted-foreground/20 border-t-muted-foreground",
      iconColor: "text-muted-foreground",
      titleColor: "text-muted-foreground",
      icon: <Loader2 className="h-7 w-7 animate-spin" />,
      dotColors: [
        "bg-muted-foreground",
        "bg-muted-foreground/70",
        "bg-muted-foreground/40",
      ],
    },

    colorful: {
      outerBg:
        "bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 dark:from-green-950/30 dark:via-orange-950/30 dark:to-yellow-950/30",
      spinnerBorder: "border-green-500/20 border-t-green-600",
      iconColor: "text-green-600",
      titleColor: "text-green-700 dark:text-green-300",
      icon: <Layers className="h-7 w-7" />,
      dotColors: ["bg-green-500", "bg-orange-500", "bg-yellow-500"],
    },

    brand: {
      outerBg: "bg-gradient-to-br from-primary via-primary/90 to-purple-700",
      spinnerBorder: "border-white/20 border-t-white",
      iconColor: "text-white",
      titleColor: "text-white",
      icon: <Coffee className="h-7 w-7" />,
      dotColors: ["bg-white", "bg-white/70", "bg-white/40"],
    },

    warm: {
      outerBg:
        "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-red-950/30",
      spinnerBorder: "border-orange-500/20 border-t-orange-500",
      iconColor: "text-orange-500",
      titleColor: "text-orange-700 dark:text-orange-300",
      icon: <Sparkles className="h-7 w-7" />,
      dotColors: ["bg-amber-500", "bg-orange-500", "bg-red-500"],
    },
  };

  const v = variants[variant];
  const dotDelays = ["0ms", "200ms", "400ms"];

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${v.outerBg}`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative w-[72px] h-[72px]">
          <div
            className={`w-full h-full rounded-full border-[3px] animate-spin ${v.spinnerBorder}`}
          />
          <div
            className={`absolute inset-0 flex items-center justify-center ${v.iconColor}`}
          >
            {v.icon}
          </div>
        </div>

        {/* Message */}
        <p className={`text-sm font-medium ${v.titleColor}`}>{message}</p>

        {/* Dots */}
        <div className="flex gap-2">
          {v.dotColors.map((color, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${color}`}
              style={{
                animation: "bounceDot 1.4s infinite",
                animationDelay: dotDelays[i],
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
