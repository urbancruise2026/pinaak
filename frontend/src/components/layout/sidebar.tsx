"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import type { RootState } from "@/store/store";

import {
  setActiveSection,
  setActiveLeadView,
  setActiveWebsiteView,
  setActiveMaster,
  setActiveDashboardView,
} from "@/store/navigationSlice";

import {
  Database,
  Search,
  FileText,
  Calendar,
  MessageSquare,
  Car,
  Monitor,
  Download,
  ChevronRight,
  FileBadge,
  UserCircle,
  Truck,
  Users,
  Store,
} from "lucide-react";

// ============================================================
// COLORS
// ============================================================

type Color =
  | "orange"
  | "green"
  | "blue"
  | "purple"
  | "yellow"
  | "red"
  | "indigo";

const colorMap: Record<
  Color,
  {
    bg: string;
    hoverBg: string;
    text: string;
    border: string;
    activeBg: string;
  }
> = {
  orange: {
    bg: "bg-orange-100",
    hoverBg: "hover:bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-500",
    activeBg: "bg-orange-50",
  },

  green: {
    bg: "bg-green-100",
    hoverBg: "hover:bg-green-50",
    text: "text-green-600",
    border: "border-green-500",
    activeBg: "bg-green-50",
  },

  blue: {
    bg: "bg-blue-100",
    hoverBg: "hover:bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-500",
    activeBg: "bg-blue-50",
  },

  purple: {
    bg: "bg-purple-100",
    hoverBg: "hover:bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-500",
    activeBg: "bg-purple-50",
  },

  yellow: {
    bg: "bg-yellow-100",
    hoverBg: "hover:bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-500",
    activeBg: "bg-yellow-50",
  },

  red: {
    bg: "bg-red-100",
    hoverBg: "hover:bg-red-50",
    text: "text-red-600",
    border: "border-red-500",
    activeBg: "bg-red-50",
  },

  indigo: {
    bg: "bg-indigo-100",
    hoverBg: "hover:bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-500",
    activeBg: "bg-indigo-50",
  },
};

// ============================================================
// ROLE TAGS
// ============================================================

type RoleTag =
  | "advisor"
  | "manager"
  | "presale"
  | "tele-sales"
  | "seo-executive"
  | "seo-tl"
  | "super-admin"
  | "team-leader-sales"
  | "city-manager";

// ============================================================
// SIDEBAR
// ============================================================

const Sidebar: React.FC = () => {
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname =
    rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;
  const is = (p: string) => pathname === p || pathname.startsWith(p + "/");
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const loginType = useSelector(
    (state: RootState) => state.navigation.loginType,
  );

  // ============================================================
  // USER DATA
  // ============================================================

  const rawUser = (currentUser as any) ?? {};

  const userData = rawUser?.data ?? rawUser;

  /*
   * ROLE PRIORITY:
   *
   * 1. role_name
   * 2. access_role
   * 3. role
   *
   * Example:
   *
   * role_name = "CITY MANAGER"
   * access_role = "SUPER_ADMIN"
   *
   * => CITY MANAGER access
   *
   * If:
   *
   * role_name = null
   * access_role = "SUPER_ADMIN"
   *
   * => SUPER ADMIN access
   */

  const roleName = String(rawUser?.role_name ?? userData?.role_name ?? "")
    .trim()
    .toLowerCase();

  const accessRole = String(rawUser?.access_role ?? userData?.access_role ?? "")
    .trim()
    .toLowerCase();

  const oldRole = String(rawUser?.role ?? userData?.role ?? "")
    .trim()
    .toLowerCase();

  /*
   * Effective role:
   *
   * role_name has highest priority.
   * If role_name doesn't exist, access_role is used.
   * Finally old role is used as fallback.
   */

  const effectiveRole = roleName || accessRole || oldRole;

  // ============================================================
  // OTHER USER DATA
  // ============================================================

  const subDept = String(
    rawUser?.subDepartment ?? userData?.subDepartment ?? "",
  )
    .trim()
    .toLowerCase();

  const departmentName = String(
    rawUser?.department_name ??
      userData?.department_name ??
      rawUser?.department ??
      userData?.department ??
      "",
  )
    .trim()
    .toLowerCase();

  const effectiveLoginType =
    loginType || rawUser?.loginType || userData?.loginType || "";

  const isVendor = String(effectiveLoginType).toLowerCase() === "vendor";

  // ============================================================
  // SUPER ADMIN
  // ============================================================

  /*
   * SUPER ADMIN can come from:
   *
   * role_name = SUPER_ADMIN
   * access_role = SUPER_ADMIN
   * role = SUPER_ADMIN
   *
   * All are normalized to lowercase.
   */

  const isSuperAdmin =
    effectiveRole === "super_admin" ||
    effectiveRole === "superadmin" ||
    effectiveRole === "super admin";

  // ============================================================
  // ROLE DETECTION
  // ============================================================

  const isPresale =
    effectiveRole.includes("presale") || effectiveRole.includes("pre-sale");

  const isAdvisor =
    effectiveRole.includes("advisor") || effectiveRole.includes("travel");

  const isManager = effectiveRole.includes("manager");

  const isTelesales =
    subDept === "tele-sales" ||
    effectiveRole === "tele-sales" ||
    effectiveRole === "telesales" ||
    effectiveRole === "tele sales";

  const isTeamLeaderSales =
    effectiveRole === "team leader-sales" ||
    effectiveRole === "team leader sales" ||
    effectiveRole.includes("team leader-sales") ||
    effectiveRole.includes("team leader sales");

  const isTeamLeader =
    effectiveRole === "team leader" || effectiveRole.includes("team leader");

  const isCityManagerRole =
    effectiveRole === "city manager" || effectiveRole.includes("city manager");

  const isSeoExecutiveDigitalMarketing =
    departmentName === "digital marketing" && effectiveRole === "seo executive";

  const isSeoTlDigitalMarketing =
    departmentName === "digital marketing" && effectiveRole === "seo tl";

  // ============================================================
  // ROLE TAGS
  // ============================================================

  /*
   * IMPORTANT:
   *
   * Super Admin ko directly super-admin tag diya gaya hai.
   */

  const userRoleTags: RoleTag[] = [
    isSuperAdmin && "super-admin",

    isAdvisor && "advisor",

    isManager && "manager",

    isPresale && "presale",

    isTelesales && "tele-sales",

    isSeoExecutiveDigitalMarketing && "seo-executive",

    isSeoTlDigitalMarketing && "seo-tl",

    isTeamLeaderSales && "team-leader-sales",

    isCityManagerRole && "city-manager",
  ].filter(Boolean) as RoleTag[];

  // ============================================================
  // ACCESS CHECK
  // ============================================================

  /*
   * SUPER ADMIN = FULL ACCESS
   *
   * Otherwise allowedRoles are checked.
   */

  const hasAccess = (allowedRoles: RoleTag[]) => {
    if (isSuperAdmin) {
      return true;
    }

    return allowedRoles.some((role) => userRoleTags.includes(role));
  };

  // ============================================================
  // SIDEBAR STATE
  // ============================================================

  const [isExpanded, setIsExpanded] = useState(false);

  const iconSize = isExpanded ? 26 : 28;

  // ============================================================
  // LEADS CLICK
  // ============================================================

  const handleLeadsClick = () => {
    if (isCityManagerRole || isTeamLeaderSales) {
      router.push("/dashboard/leads");
      return;
    }
    // Travel Advisor / Telesales land on the Telesales dashboard
    if (isAdvisor || isTelesales) {
      router.push("/dashboard/telesales");
      return;
    }
    router.push("/dashboard/leads");
  };

  const handleMasterClick = () => {
    if (isAdvisor && !isManager && !isSuperAdmin) {
      router.push("/dashboard/master/customer-table");
      return;
    }
    router.push("/dashboard/master/customer-personal");
  };

  // ============================================================
  // MASTER CLICK
  // ============================================================

  // ============================================================
  // EMPLOYEE MENU
  // ============================================================

  const employeeMenuItems = [
    {
      key: "master",

      icon: <Database size={iconSize} />,

      label: "Master",

      description: "Manage all forms and data",

      isActive: is("/dashboard/master"),

      onClick: handleMasterClick,

      color: "orange" as Color,

      allowedRoles: [
        "advisor",
        "manager",
        "super-admin",
        "city-manager",
      ] as RoleTag[],
    },

    {
      key: "leads",

      icon: <Search size={iconSize} />,

      label: "Leads",

      description: "Manage leads & inquiries",

      isActive:
        is("/dashboard/leads") ||
        is("/dashboard/reports") ||
        is("/dashboard/dsr-form") ||
        is("/dashboard/telesales") ||
        is("/dashboard/presales") ||
        is("/dashboard/team-leader") ||
        is("/dashboard/city-manager") ||
        is("/dashboard/bdm") ||
        pathname === "/dashboard",

      onClick: handleLeadsClick,

      color: "green" as Color,

      allowedRoles: [
        "presale",
        "tele-sales",
        "seo-executive",
        "advisor",
        "manager",
        "seo-tl",
        "team-leader-sales",
        "city-manager",
        "super-admin",
      ] as RoleTag[],
    },

    {
      key: "rate-quotation",

      icon: <FileText size={iconSize} />,

      label: "Rate Quotation",

      description: "Generate & manage quotations",

      isActive: is("/dashboard/rate-quotation"),

      onClick: () => router.push("/dashboard/rate-quotation"),

      color: "blue" as Color,

      allowedRoles: [
        "advisor",
        "manager",
        "team-leader-sales",
        "super-admin",
      ] as RoleTag[],
    },

    {
      key: "booking-trip",

      icon: <Calendar size={iconSize} />,

      label: "Booking",

      description: "Manage trip bookings",

      isActive: is("/dashboard/booking-trip"),

      onClick: () => router.push("/dashboard/booking-trip"),

      color: "purple" as Color,

      allowedRoles: [
        "advisor",
        "manager",
        "presale",
        "team-leader-sales",
        "super-admin",
      ] as RoleTag[],
    },

    {
      key: "payment",

      icon: <Car size={iconSize} />,

      label: "Trip",

      description: "Handle payments & transactions",

      isActive: is("/dashboard/payment"),
      onClick: () => router.push("/dashboard/payment"),

      color: "yellow" as Color,

      allowedRoles: [
        "advisor",
        "manager",
        "presale",
        "team-leader-sales",
        "super-admin",
      ] as RoleTag[],
    },

    {
      key: "feedback",

      icon: <MessageSquare size={iconSize} />,

      label: "Feedback",

      description: "Collect & manage feedback",

      isActive: is("/dashboard/feedback"),

      onClick: () => router.push("/dashboard/feedback"),

      color: "red" as Color,

      allowedRoles: [
        "advisor",
        "manager",
        "presale",
        "seo-executive",
        "super-admin",
      ] as RoleTag[],
    },

    {
      key: "website",

      icon: <Monitor size={iconSize} />,

      label: "Website",

      description: "Manage website content",

      isActive: is("/dashboard/website"),

      onClick: () => router.push("/dashboard/website/gac"),

      color: "red" as Color,

      allowedRoles: ["manager", "presale", "super-admin"] as RoleTag[],
    },

    {
      key: "download-report",

      icon: <Download size={iconSize} />,

      label: "Download Report",

      description: "Download & export reports",

      isActive: is("/dashboard/download-report"),

      onClick: () => router.push("/dashboard/download-report"),

      color: "indigo" as Color,

      allowedRoles: ["manager", "super-admin"] as RoleTag[],
    },
  ].filter((item) => hasAccess(item.allowedRoles));

  return (
    <div
      className="absolute top-0 left-0 z-40 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden"
      style={{
        width: isExpanded ? "280px" : "100px",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`${isExpanded ? "px-3" : "px-2"} space-y-1.5 pb-4`}>
        {/* ================================================== */}
        {/* VENDOR */}
        {/* ================================================== */}

        {isVendor ? (
          <>
            <SidebarItem
              icon={<Store size={iconSize} />}
              label="Dashboard"
              description="Vendor overview & stats"
              isExpanded={isExpanded}
              isActive={pathname === "/dashboard/vendor"}
              onClick={() => router.push("/dashboard/vendor")}
              color="indigo"
            />

            <SidebarItem
              icon={<Car size={iconSize} />}
              label="Trip / Booking"
              description="View & manage your trips"
              isExpanded={isExpanded}
              isActive={is("/dashboard/booking-trip")}
              onClick={() => router.push("/dashboard/booking-trip")}
              color="purple"
            />

            <SidebarItem
              icon={<FileBadge size={iconSize} />}
              label="Vehicle Documents"
              description="Manage vehicle documents"
              isExpanded={isExpanded}
              isActive={is("/dashboard/vendor/documents")}
              onClick={() => router.push("/dashboard/vendor/documents")}
              color="blue"
            />

            <SidebarItem
              icon={<UserCircle size={iconSize} />}
              label="Vendor Profile"
              description="View & edit your profile"
              isExpanded={isExpanded}
              isActive={is("/dashboard/vendor/profile")}
              onClick={() => router.push("/dashboard/vendor/profile")}
              color="orange"
            />

            <SidebarItem
              icon={<Truck size={iconSize} />}
              label="Vehicles"
              description="Manage your vehicles"
              isExpanded={isExpanded}
              isActive={is("/dashboard/master/vehicles")}
              onClick={() => router.push("/dashboard/master/vehicles")}
              color="yellow"
            />

            <SidebarItem
              icon={<Users size={iconSize} />}
              label="Driver"
              description="Manage your drivers"
              isExpanded={isExpanded}
              isActive={is("/dashboard/master/driver")}
              onClick={() => router.push("/dashboard/master/driver")}
              color="green"
            />

            <SidebarItem
              icon={<FileText size={iconSize} />}
              label="Rate Quotation"
              description="Generate & manage quotations"
              isExpanded={isExpanded}
              isActive={is("/dashboard/rate-quotation")}
              onClick={() => router.push("/dashboard/rate-quotation")}
              color="blue"
            />

            <SidebarItem
              icon={<Car size={iconSize} />}
              label="Trip"
              description="Handle payments & transactions"
              isExpanded={isExpanded}
              isActive={is("/dashboard/payment")}
              onClick={() => router.push("/dashboard/payment")}
              color="yellow"
            />
          </>
        ) : (
          <>
            {/* ================================================== */}
            {/* EMPLOYEE MENU */}
            {/* ================================================== */}

            {employeeMenuItems.map((item) => (
              <SidebarItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                description={item.description}
                isExpanded={isExpanded}
                isActive={item.isActive}
                onClick={item.onClick}
                color={item.color}
              />
            ))}
          </>
        )}
      </div>

      {/* ================================================== */}
      {/* COLLAPSED ARROW */}
      {/* ================================================== */}

      {!isExpanded && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 shadow-md animate-pulse">
          <ChevronRight size={16} className="text-gray-600" />
        </div>
      )}
    </div>
  );
};

// ============================================================
// SIDEBAR ITEM
// ============================================================

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isExpanded: boolean;
  isActive: boolean;
  onClick: () => void;
  color: Color;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  description,
  isExpanded,
  isActive,
  onClick,
  color,
}) => {
  const c = colorMap[color];

  // ==========================================================
  // EXPANDED
  // ==========================================================

  if (isExpanded) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all group relative ${c.hoverBg} ${
          isActive ? `${c.activeBg} border-r-4 ${c.border}` : "text-gray-700"
        }`}
      >
        <div
          className={`p-2 ${c.bg} rounded-lg group-hover:bg-opacity-80 flex-shrink-0`}
        >
          <span className={c.text}>{icon}</span>
        </div>

        <div className="text-left flex-1 min-w-0">
          <p className="font-extrabold text-md truncate">{label}</p>

          <p className="text-sm text-gray-500 truncate">{description}</p>
        </div>
      </button>
    );
  }

  // ==========================================================
  // COLLAPSED
  // ==========================================================

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex flex-col items-center gap-1 py-3 px-1 rounded-lg transition-all group relative ${
        c.hoverBg
      } ${isActive ? `${c.activeBg} border-r-4 ${c.border}` : ""}`}
    >
      <div className={`p-1.5 ${c.bg} rounded-lg group-hover:bg-opacity-80`}>
        <span className={c.text}>{icon}</span>
      </div>

      <span className="text-xs font-bold text-gray-600 truncate w-full text-center">
        {label}
      </span>
    </button>
  );
};

export default Sidebar;
