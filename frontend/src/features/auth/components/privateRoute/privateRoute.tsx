"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "../../../../hooks/useRedux";
import { FullScreenLoader } from "./loading";

type AccessRole =
  | "EMPLOYEE"
  | "TEAM_LEAD"
  | "MANAGER"
  | "ZONAL_HEAD"
  | "HOD"
  | "SUPER_ADMIN";

const ROLE_DASHBOARD_MAP: Record<AccessRole, string> = {
  EMPLOYEE: "/employee-dashboard",
  TEAM_LEAD: "/teamlead-dashboard",
  MANAGER: "/manager-dashboard",
  ZONAL_HEAD: "/zonal-dashboard",
  HOD: "/hod-dashboard",
  SUPER_ADMIN: "/",
};

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: AccessRole[];
}

export default function PrivateRoute({
  children,
  allowedRoles,
}: PrivateRouteProps) {
  const { isAuthenticated, initialized, currentUser } = useAppSelector(
    (state) => state.user,
  );

  const router = useRouter();
  const pathname = usePathname();

  const userRole = (currentUser?.access_role as AccessRole) ?? "EMPLOYEE";

  const dashboardRoute = ROLE_DASHBOARD_MAP[userRole] ?? "/employee-dashboard";

  useEffect(() => {
    // Step 1 — wait until initialized
    if (!initialized) return;

    // Step 2 — authentication check
    if (!isAuthenticated) {
      router.replace(`/login?from=${pathname}`);
      return;
    }

    // Step 3 — redirect "/" except SUPER_ADMIN
    if (pathname === "/" && userRole !== "SUPER_ADMIN") {
      router.replace(dashboardRoute);
      return;
    }

    // Step 4 — role check
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAccess = allowedRoles.includes(userRole);
      if (!hasAccess) {
        router.replace("/unauthorized");
      }
    }
  }, [initialized, isAuthenticated, pathname, userRole, allowedRoles]);

  // Loader while checking
  if (!initialized) {
    return (
      <FullScreenLoader
        variant="colorful"
        message="Preparing your workspace..."
      />
    );
  }

  return <>{children}</>;
}
