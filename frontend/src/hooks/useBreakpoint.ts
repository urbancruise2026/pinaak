import { useEffect, useMemo, useState } from "react";

export type BreakpointKey = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const BREAKPOINT_MAP: Record<BreakpointKey, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const orderedKeys: BreakpointKey[] = ["2xl", "xl", "lg", "md", "sm", "xs"];

const getBreakpointKey = (width: number): BreakpointKey => {
  for (const key of orderedKeys) {
    if (width >= BREAKPOINT_MAP[key]) {
      return key;
    }
  }
  return "xs";
};

export const useBreakpoint = () => {
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window === "undefined" ? BREAKPOINT_MAP.md : window.innerWidth
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const breakpoint = useMemo(() => getBreakpointKey(viewportWidth), [viewportWidth]);

  const flags = useMemo(
    () => ({
      isXs: breakpoint === "xs",
      isSm: breakpoint === "sm",
      isMd: breakpoint === "md",
      isLg: breakpoint === "lg",
      isXl: breakpoint === "xl",
      is2Xl: breakpoint === "2xl",
      upFrom: (key: BreakpointKey) => viewportWidth >= BREAKPOINT_MAP[key],
      downFrom: (key: BreakpointKey) => viewportWidth < BREAKPOINT_MAP[key],
    }),
    [breakpoint, viewportWidth]
  );

  return {
    width: viewportWidth,
    breakpoint,
    ...flags,
  };
};

export default useBreakpoint;
