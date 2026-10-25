"use client";

import { useMemo, useState, useEffect, useRef, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Users,
  Car,
  FileText,
  UserCircle,
  MapPin,
  Building2,
  Monitor,
  Shield,
  Check,
  Plus,
  ClipboardList,
  Headphones,
  ArrowLeftRight,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import userAvatar from "@/assets/images/user-pic.png";
import pinaak from "@/assets/images/pinnak.png";
import { AppDispatch, RootState } from "@/store/store";
import { logoutEmployeeThunk } from "@/features/user/userSlice";
import UserProfileDropdown from "./UserProfileDropdown";
import {
  setActiveMaster,
  setActiveLeadView,
  setActiveDashboardView,
  setActiveWebsiteView,
  showReport,
  setActiveSection,
} from "@/store/navigationSlice";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import NotificationDropdown from "./NotificationDropdown";

type MenuItem = {
  label: string;
  value: string;
  allowedRoles?: string[];
};

type MenuSection = {
  key: string;
  label: string;
  items: MenuItem[];
  allowedRoles?: string[];
};

const normalizeRole = (role: unknown): string => {
  const value = String(role ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const roleMap: Record<string, string> = {
    "super admin": "superadmin",
    superadmin: "superadmin",

    "city manager": "city manager",

    "team leader": "team leader",

    "team leader sales": "team leader-sales",

    "pre sales executive": "pre-sales executive",
    "pre-sales executive": "pre-sales executive",

    "seo executive": "seo executive",
    "seo tl": "seo tl",

    "travel advisor": "travel advisor",

    manager: "manager",
    admin: "admin",

    sales: "sales",
    bdm: "bdm",
    presales: "presales",
    presale: "presale",
  };

  return roleMap[value] ?? value;
};

const getEffectiveRole = (roleName: unknown, accessRole: unknown): string => {
  const roleNameValue = String(roleName ?? "").trim();

  if (roleNameValue !== "") {
    return roleNameValue;
  }

  return String(accessRole ?? "").trim();
};

const toTitle = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const MASTER_ALLOWED_ROLES = [
  "superadmin",
  "admin",
  "manager",
  "city manager",
  "travel advisor",
];

const MASTER_MENU_SECTIONS: MenuSection[] = [
  {
    key: "customers",
    label: "CUSTOMERS",
    allowedRoles: [
      "superadmin",
      "admin",
      "manager",
      "city manager",
      "travel advisor",
    ],
    items: [
      {
        label: "Customer Form",
        value: "customer-personal",
        allowedRoles: ["superadmin", "admin", "manager", "city manager"],
      },
      {
        label: "Customer Search",
        value: "customer-table",
        allowedRoles: [
          "superadmin",
          "admin",
          "manager",
          "city manager",
          "travel advisor",
        ],
      },
      {
        label: "Customer History",
        value: "customer-history",
        allowedRoles: ["superadmin", "admin", "city manager"],
      },
    ],
  },

  {
    key: "vendor",
    label: "VENDOR",
    allowedRoles: ["superadmin", "admin", "manager", "city manager"],
    items: [
      {
        label: "Vendor Registration Form",
        value: "vendor",
      },
      {
        label: "Vendor Search",
        value: "vendor-table",
      },
    ],
  },

  {
    key: "vehicles",
    label: "VEHICLES",
    allowedRoles: [
      "superadmin",
      "admin",
      "manager",
      "city manager",
      "travel advisor",
    ],
    items: [
      {
        label: "Vehicles Master",
        value: "vehicles",
        allowedRoles: ["superadmin", "admin", "city manager"],
      },
      {
        label: "Vehicle Manager",
        value: "vehicle-manager",
        allowedRoles: ["city manager", "superadmin", "admin"],
      },
    ],
  },

  {
    key: "drivers",
    label: "DRIVER",
    allowedRoles: ["superadmin", "admin", "manager", "city manager"],
    items: [
      {
        label: "Driver Registration Form",
        value: "driver",
      },
      {
        label: "Driver Search",
        value: "driver-table",
      },
    ],
  },
];

const DASHBOARD_ITEMS: Record<string, MenuItem[]> = {
  admin: [
    {
      label: "Leads Dashboard",
      value: "leads-dashboard",
    },
    {
      label: "Pre-Sales Team Dashboard",
      value: "presales-dashboard",
    },
    {
      label: "City Manager Dashboard",
      value: "citymanager-dashboard",
    },
    {
      label: "BDM Dashboard",
      value: "bdm-dashboard",
    },
    {
      label: "Sales Team Dashboard",
      value: "salesteam-dashboard",
    },
    {
      label: "Team Leader Dashboard",
      value: "teamleader-dashboard",
    },
  ],

  presales: [
    {
      label: "Pre-Sales Team Dashboard",
      value: "presales-dashboard",
    },
  ],

  presale: [
    {
      label: "Pre-Sales Team Dashboard",
      value: "presales-dashboard",
    },
  ],

  bdm: [
    {
      label: "BDM Dashboard",
      value: "bdm-dashboard",
    },
  ],

  sales: [
    {
      label: "Sales Team Dashboard",
      value: "salesteam-dashboard",
    },
  ],

  "city manager": [
    {
      label: "City Manager Dashboard",
      value: "citymanager-dashboard",
    },
  ],

  citymanager: [
    {
      label: "City Manager Dashboard",
      value: "citymanager-dashboard",
    },
  ],

  "team leader": [
    {
      label: "Team Leader Dashboard",
      value: "teamleader-dashboard",
    },
  ],

  teamleader: [
    {
      label: "Team Leader Dashboard",
      value: "teamleader-dashboard",
    },
  ],

  team_leader: [
    {
      label: "Team Leader Dashboard",
      value: "teamleader-dashboard",
    },
  ],

  "team leader-sales": [
    {
      label: "City Manager Dashboard",
      value: "citymanager-dashboard",
    },
  ],

  "travel advisor": [
    {
      label: "Telesales Team Dashboard",
      value: "telesales-dashboard",
    },
  ],

  "tele-sales": [
    {
      label: "Telesales Team Dashboard",
      value: "telesales-dashboard",
    },
  ],

  telesales: [
    {
      label: "Telesales Team Dashboard",
      value: "telesales-dashboard",
    },
  ],

  "tele sales": [
    {
      label: "Telesales Team Dashboard",
      value: "telesales-dashboard",
    },
  ],
};

const getMenuIcon = (menuKey: string) => {
  if (menuKey.includes("customer")) {
    return <Users size={16} />;
  }
  if (menuKey.includes("master")) {
    return <Building2 size={16} />;
  }
  if (menuKey.includes("vendor")) {
    return <FileText size={16} />;
  }

  if (menuKey.includes("vehicle")) {
    return <Car size={16} />;
  }

  if (menuKey.includes("driver")) {
    return <UserCircle size={16} />;
  }

  if (menuKey.includes("access")) {
    return <Shield size={16} />;
  }

  return null;
};

const REPORT_SLUGS: Record<string, string> = {
  monthlyEnquiry: "monthly-enquiry",
  monthlyLeadsTwo: "monthly-leads-two",
  monthlyDistribution: "monthly-distribution",
  longWeekendLeads: "long-weekend",
  employeeReports: "employee",
  dateEmployeeReports: "date-employee",
  unwantedLeads: "unwanted",
  agingReports: "aging",
  TimeTrackingReports: "time-tracking",
};

const LEAD_ROUTES: Record<string, string> = {
  "lead-form": "/dashboard/leads/new",
  "lead-table": "/dashboard/leads/table",
  "sale-lead-table": "/dashboard/leads/sales",
  "swap-lead-table": "/dashboard/leads/swap",
  "dsr-lead-table": "/dashboard/leads/dsr",
};

const LEAD_LABELS: Record<string, string> = {
  "lead-form": "New Lead",
  "lead-table": "Presales Lead Manager",
  "sale-lead-table": "Telesales Lead Manager",
  "swap-lead-table": "Swap Lead Manager",
  "dsr-lead-table": "DSR Lead Manager",
};

const LEAD_MANAGER_KEYS = ["lead-table", "sale-lead-table", "swap-lead-table"];

const DASHBOARD_ROUTES: Record<string, string> = {
  "leads-dashboard": "/dashboard/leads",
  "presales-dashboard": "/dashboard/presales",
  "citymanager-dashboard": "/dashboard/city-manager",
  "bdm-dashboard": "/dashboard/bdm",
  "salesteam-dashboard": "/dashboard/telesales",
  "teamleader-dashboard": "/dashboard/team-leader",
  "telesales-dashboard": "/dashboard/telesales",
};

/* ------------------------------------------------------------------ */
/* Design tokens + small UI building blocks                            */
/* ------------------------------------------------------------------ */

const navBtnClass = (
  active: boolean,
  open = false,
  justify = "justify-start",
) =>
  `inline-flex h-10 w-full items-center ${justify} gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors duration-150 md:w-auto md:justify-center ${
    active
      ? "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200"
      : open
        ? "bg-slate-100 text-slate-900"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const panelClass =
  "nav-pop z-50 mt-1 max-h-80 w-full overflow-y-auto whitespace-nowrap rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 md:absolute md:left-0 md:top-full md:mt-2 md:w-max md:min-w-[14rem]";

const itemClass = (active: boolean) =>
  `flex w-full items-center justify-between gap-6 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
    active
      ? "bg-orange-50 text-orange-700"
      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
  }`;

type DropdownProps = {
  open: boolean;
  onToggle: () => void;
  active?: boolean;
  icon?: ReactNode;
  label: string;
  panelTitle: string;
  children: ReactNode;
};

function Dropdown({
  open,
  onToggle,
  active = false,
  icon,
  label,
  panelTitle,
  children,
}: DropdownProps) {
  return (
    <div className="relative w-full md:w-auto">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        className={navBtnClass(active, open, "justify-between")}
      >
        <span className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            active ? "text-orange-500" : "text-slate-400"
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div role="menu" className={panelClass}>
          <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {panelTitle}
          </p>
          <ul className="space-y-0.5">{children}</ul>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className={itemClass(active)}
      >
        <span>{children}</span>
        {active && <Check size={16} className="shrink-0 text-orange-600" />}
      </button>
    </li>
  );
}

function NavLink({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={navBtnClass(active)}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const rawPathname = usePathname();
  const pathname =
    rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;
  const is = (p: string) => pathname === p || pathname.startsWith(p + "/");

  const activeLeadKey =
    Object.entries(LEAD_ROUTES).find(
      ([, route]) => pathname === route || pathname.startsWith(route + "/"),
    )?.[0] ?? "";
  const isLeadManagerActive = LEAD_MANAGER_KEYS.includes(activeLeadKey);

  const activeMaster = pathname.startsWith("/dashboard/master/")
    ? pathname.split("/")[3]
    : "";
  const rawUser = (currentUser as any) ?? {};
  const userData = rawUser?.data ?? rawUser;
  const userEmail = rawUser?.officeEmail ?? userData?.officeEmail ?? "";
  const userAliasName = rawUser?.aliasName ?? userData?.aliasName ?? "";
  const userDepartment = rawUser?.department ?? userData?.department ?? "";
  const userSubDepartment =
    rawUser?.subDepartment ?? userData?.subDepartment ?? "";
  const userRegionNames = rawUser?.region_names ?? userData?.region_names ?? [];
  const userZoneNames = rawUser?.zone_names ?? userData?.zone_names ?? [];
  const userCityNames = rawUser?.city_names ?? userData?.city_names ?? [];
  const roleName = rawUser?.role_name ?? userData?.role_name ?? "";
  const accessRole = rawUser?.access_role ?? userData?.access_role ?? "";
  const effectiveRole = getEffectiveRole(roleName, accessRole);
  const normalizedRole = normalizeRole(effectiveRole);
  const adminRole = effectiveRole;
  const canSeeMaster = MASTER_ALLOWED_ROLES.includes(normalizedRole);
  const visibleMasterSections = useMemo(
    () =>
      MASTER_MENU_SECTIONS.filter(
        (menu) =>
          !menu.allowedRoles || menu.allowedRoles.includes(normalizedRole),
      ).map((menu) => ({
        ...menu,
        items: menu.items.filter(
          (item) =>
            !item.allowedRoles || item.allowedRoles.includes(normalizedRole),
        ),
      })),
    [normalizedRole],
  );

  const showMaster =
    is("/dashboard/master") && canSeeMaster && visibleMasterSections.length > 0;

  const isSales = normalizedRole === "sales";
  const isTravelAdvisor = normalizedRole === "travel advisor";
  const isTeamLeader = normalizedRole === "team leader";
  const isSuperAdmin = normalizedRole === "superadmin";
  const isManager = normalizedRole === "manager";
  const isCityManager = normalizedRole === "city manager";
  const isTeamLeaderSales = normalizedRole === "team leader-sales";
  const isSeoExecutive = normalizedRole === "seo executive";
  const isSeoTl = normalizedRole === "seo tl";
  const isDigitalMarketingDept =
    String(userDepartment ?? "")
      .toLowerCase()
      .trim() === "digital marketing";
  const isSeoExecutiveDigitalMarketing =
    isSeoExecutive && isDigitalMarketingDept;
  const isSeoTlDigitalMarketing = isSeoTl && isDigitalMarketingDept;
  const isPresalesExecutive = normalizedRole === "pre-sales executive";

  const isTelesales =
    normalizedRole === "telesales" || normalizedRole === "tele sales";

  const isOnTelesalesLanding =
    pathname === "/dashboard/telesales" && (isTravelAdvisor || isTelesales);

  const showLeadsMenu =
    is("/dashboard/leads") ||
    is("/dashboard/reports") ||
    pathname === "/dashboard/dsr-form" ||
    isOnTelesalesLanding;

  const showDashboardMenu =
    (pathname === "/dashboard" ||
      is("/dashboard/presales") ||
      is("/dashboard/team-leader") ||
      is("/dashboard/city-manager") ||
      is("/dashboard/bdm") ||
      is("/dashboard/telesales")) &&
    !isTravelAdvisor &&
    !isTelesales;

  const showWebsiteMenu = is("/dashboard/website");

  const leadsAllowedRoles = [
    "superadmin",
    "manager",
    "city manager",
    "team leader",
    "team leader-sales",
    "pre-sales executive",
    "seo executive",
    "travel advisor",
    "telesales",
    "tele sales",
  ];

  const canSeeLeadsMenu = leadsAllowedRoles.includes(normalizedRole);
  const shouldShowLeadManagerDropdown =
    isSuperAdmin || isManager || isCityManager || isTeamLeaderSales;

  const dashboardItems = DASHBOARD_ITEMS[normalizedRole] ?? [];
  const isDashboardActive = dashboardItems.some(
    (item) => pathname === DASHBOARD_ROUTES[item.value],
  );

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openMenu) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenu]);

  const toggle = (key: string) =>
    setOpenMenu((prev) => (prev === key ? null : key));

  const close = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleMasterSelect = (value: string) => {
    router.push(`/dashboard/master/${value}`);
    close();
  };

  const handleLeadSelect = (value: string) => {
    router.push(LEAD_ROUTES[value] ?? "/dashboard/leads");
    close();
  };
  const handleSalesLeadSelect = handleLeadSelect;
  const handleSwapLeadSelect = handleLeadSelect;

  const handleDsrSelect = () => {
    router.push("/dashboard/leads/dsr");
    close();
  };

  const handleDashboardSelect = (value: string) => {
    router.push(DASHBOARD_ROUTES[value] ?? "/dashboard");
    close();
  };

  const handleWebsiteSelect = (key: string) => {
    router.push(`/dashboard/website/${key}`);
    close();
  };

  const handleTlTablesSelect = () => {
    router.push("/dashboard/leads/table");
    close();
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutEmployeeThunk()).unwrap();

      toast.success("Logout successfully");

      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch {
      toast.error("Logout failed");
    }
  };

  const trackingItems = [
    {
      label: "Monthly Enquiry PS (MER)",
      key: "monthlyEnquiry",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isTeamLeader ||
        isCityManager ||
        isTeamLeaderSales ||
        isSeoExecutiveDigitalMarketing ||
        isSeoTlDigitalMarketing,
    },

    {
      label: "Monthly Enquiry PS 2 (MER 2)",
      key: "monthlyLeadsTwo",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isTeamLeader ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Lead Distribution PS (LDR)",
      key: "monthlyDistribution",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Long Weekend Distribution (LWD)",
      key: "longWeekendLeads",
      show:
        isSuperAdmin ||
        isTravelAdvisor ||
        isTeamLeader ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Employee Performance - TS (EP-TS)",
      key: "employeeReports",
      show:
        isSuperAdmin ||
        isTravelAdvisor ||
        isTeamLeader ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Employee Performance - PS (EP-PS)",
      key: "dateEmployeeReports",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Unwanted Leads (ULR)",
      key: "unwantedLeads",
      show: isPresalesExecutive,
    },

    {
      label: "Aging Performance - PS (AP-PS)",
      key: "agingReports",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Lead Performance - PS (AP-PS)",
      key: "TimeTrackingReports",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isCityManager ||
        isTeamLeaderSales,
    },
  ].filter((item) => item.show);

  const isRulesActive = is("/dashboard/rules");

  return (
    <nav
      ref={navbarRef}
      className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md"
    >
      <style>{`
        @keyframes nav-pop {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-pop { animation: nav-pop 0.14s ease-out; }
      `}</style>

      {/* Brand accent line */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        {/* Mobile: hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <div className="flex h-full flex-shrink-0 items-center">
          <Image
            src={pinaak}
            alt="logo"
            width={140}
            priority
            className="hidden flex-shrink-0 sm:block"
          />
        </div>

        <div className="hidden h-6 w-px bg-slate-200 md:block" />

        {/* Menu container: dropdown sheet on mobile, inline row on desktop */}
        <div
          className={`${mobileOpen ? "flex" : "hidden"} absolute inset-x-0 top-16 max-h-[calc(100vh-4rem)] flex-col gap-3 overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-lg md:static md:flex md:max-h-none md:flex-1 md:flex-row md:items-center md:justify-between md:gap-2 md:overflow-visible md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {/* Left: navigation */}
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
            {/* Master menus */}
            {showMaster &&
              visibleMasterSections.map((menu) => {
                if (menu.items.length === 0) {
                  return null;
                }

                return (
                  <Dropdown
                    key={menu.key}
                    open={openMenu === menu.key}
                    onToggle={() => toggle(menu.key)}
                    active={menu.items.some((i) => i.value === activeMaster)}
                    icon={getMenuIcon(menu.key)}
                    label={toTitle(menu.label)}
                    panelTitle={toTitle(menu.label)}
                  >
                    {menu.items.map((item) => (
                      <DropdownItem
                        key={item.value}
                        active={item.value === activeMaster}
                        onClick={() => handleMasterSelect(item.value)}
                      >
                        {item.label}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                );
              })}

            {showLeadsMenu && (
              <>
                {/* New Lead (primary action) */}
                {canSeeLeadsMenu &&
                  !isSales &&
                  !isTravelAdvisor &&
                  !isTelesales &&
                  !isSeoTlDigitalMarketing &&
                  !isSeoExecutiveDigitalMarketing && (
                    <button
                      type="button"
                      onClick={() => handleLeadSelect("lead-form")}
                      className={`inline-flex h-10 w-full items-center justify-start gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 md:w-auto md:justify-center ${
                        activeLeadKey === "lead-form"
                          ? "bg-orange-700 ring-2 ring-orange-200"
                          : "bg-orange-600 hover:bg-orange-700"
                      }`}
                    >
                      <Plus size={16} />
                      <span>New Lead</span>
                    </button>
                  )}

                {/* Lead Manager */}
                {canSeeLeadsMenu &&
                  !isSales &&
                  !isTravelAdvisor &&
                  !isTelesales &&
                  !isSeoExecutiveDigitalMarketing &&
                  (shouldShowLeadManagerDropdown ? (
                    <Dropdown
                      open={openMenu === "lead-manager-superadmin"}
                      onToggle={() => toggle("lead-manager-superadmin")}
                      active={isLeadManagerActive}
                      icon={<ClipboardList size={16} />}
                      label={
                        isLeadManagerActive
                          ? LEAD_LABELS[activeLeadKey]
                          : "Lead Manager"
                      }
                      panelTitle="Lead Manager"
                    >
                      {LEAD_MANAGER_KEYS.map((key) => (
                        <DropdownItem
                          key={key}
                          active={activeLeadKey === key}
                          onClick={() => handleLeadSelect(key)}
                        >
                          {LEAD_LABELS[key]}
                        </DropdownItem>
                      ))}
                    </Dropdown>
                  ) : (
                    <NavLink
                      active={activeLeadKey === "lead-table"}
                      onClick={() => handleLeadSelect("lead-table")}
                      icon={<ClipboardList size={16} />}
                    >
                      Lead Manager
                    </NavLink>
                  ))}

                {/* TL Tables */}
                {isTeamLeader && (
                  <NavLink
                    active={activeLeadKey === "lead-table"}
                    onClick={handleTlTablesSelect}
                    icon={<ClipboardList size={16} />}
                  >
                    TL Tables
                  </NavLink>
                )}

                {/* Travel Advisor / Telesales */}
                {(isTravelAdvisor || isTelesales) && (
                  <>
                    <NavLink
                      active={activeLeadKey === "sale-lead-table"}
                      onClick={() => handleSalesLeadSelect("sale-lead-table")}
                      icon={<Headphones size={16} />}
                    >
                      Sales Lead Manager
                    </NavLink>

                    <NavLink
                      active={activeLeadKey === "swap-lead-table"}
                      onClick={() => handleSwapLeadSelect("swap-lead-table")}
                      icon={<ArrowLeftRight size={16} />}
                    >
                      Swap Lead Manager
                    </NavLink>

                    <NavLink
                      active={activeLeadKey === "dsr-lead-table"}
                      onClick={handleDsrSelect}
                      icon={<FileText size={16} />}
                    >
                      DSR Lead Manager
                    </NavLink>
                  </>
                )}

                {/* Tracking */}
                {trackingItems.length > 0 && (
                  <Dropdown
                    open={openMenu === "lead-track-menu"}
                    onToggle={() => toggle("lead-track-menu")}
                    active={is("/dashboard/reports")}
                    icon={<MapPin size={16} />}
                    label="Tracking"
                    panelTitle="Reports"
                  >
                    {trackingItems.map(({ label, key }) => (
                      <DropdownItem
                        key={key}
                        active={
                          pathname === `/dashboard/reports/${REPORT_SLUGS[key]}`
                        }
                        onClick={() => {
                          router.push(
                            `/dashboard/reports/${REPORT_SLUGS[key]}`,
                          );
                          close();
                        }}
                      >
                        {label}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                )}
              </>
            )}

            {/* Dashboards */}
            {showDashboardMenu && dashboardItems.length > 0 && (
              <Dropdown
                open={openMenu === "dashboard-menu"}
                onToggle={() => toggle("dashboard-menu")}
                active={isDashboardActive}
                icon={<LayoutDashboard size={16} />}
                label="Dashboards"
                panelTitle="Dashboards"
              >
                {dashboardItems.map((item) => (
                  <DropdownItem
                    key={item.value}
                    active={pathname === DASHBOARD_ROUTES[item.value]}
                    onClick={() => handleDashboardSelect(item.value)}
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}

            {/* Website */}
            {showWebsiteMenu && (
              <Dropdown
                open={openMenu === "website-menu"}
                onToggle={() => toggle("website-menu")}
                active={is("/dashboard/website")}
                icon={<Monitor size={16} />}
                label="Website"
                panelTitle="Website"
              >
                {[
                  { key: "gac", label: "GAC Table" },
                  { key: "gaq", label: "GAQ Table" },
                ].map(({ key, label }) => (
                  <DropdownItem
                    key={key}
                    active={pathname.endsWith("/" + key)}
                    onClick={() => handleWebsiteSelect(key)}
                  >
                    {label}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </div>

          {/* Right: notifications, rules, profile */}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 md:ml-auto md:flex-row md:items-center md:gap-2 md:border-0 md:pt-0">
            <NotificationDropdown
              isOpen={openMenu === "notifications"}
              onToggle={() => toggle("notifications")}
            />

            {(normalizedRole === "city manager" ||
              isTeamLeaderSales ||
              normalizedRole === "pre-sales executive") && (
              <button
                type="button"
                onClick={() => router.push("/dashboard/rules")}
                className={`inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors duration-150 ${
                  isRulesActive
                    ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
                    : "text-red-600 hover:bg-red-50"
                }`}
              >
                <BookOpen size={16} className="flex-shrink-0" />
                Rules
              </button>
            )}

            <div className="hidden h-6 w-px bg-slate-200 md:block" />

            <div className="flex items-center gap-3">
              <UserProfileDropdown
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                userAvatar={userAvatar.src}
                userAliasName={userAliasName}
                userEmail={userEmail}
                rawUser={rawUser}
                userData={userData}
                adminRole={adminRole}
                userDepartment={userDepartment}
                userSubDepartment={userSubDepartment}
                userRegionNames={userRegionNames}
                userZoneNames={userZoneNames}
                userCityNames={userCityNames}
                handleLogout={handleLogout}
              />
            </div>
          </div>
        </div>

        {/* Mobile: user chip */}
        <div className="ml-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 md:hidden">
          <Image
            src={userAvatar}
            alt="User"
            width={32}
            height={32}
            className="rounded-full object-cover ring-2 ring-orange-400"
          />

          <div className="text-left leading-tight">
            <p className="max-w-[110px] truncate text-sm font-semibold text-slate-800">
              {userAliasName}
            </p>

            <p className="max-w-[110px] truncate text-[10px] uppercase tracking-wide text-slate-500">
              {adminRole}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
