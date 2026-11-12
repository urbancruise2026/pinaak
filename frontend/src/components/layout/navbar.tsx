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

type Tone =
  | "orange"
  | "blue"
  | "violet"
  | "emerald"
  | "rose"
  | "teal"
  | "indigo"
  | "sky";

// Full class names are written out so Tailwind can detect them.
const TONES: Record<
  Tone,
  {
    idle: string;
    open: string;
    active: string;
    icon: string;
    panel: string;
    title: string;
    item: string;
    itemActive: string;
    check: string;
  }
> = {
  orange: {
    idle: "bg-orange-100 text-orange-800 ring-orange-200 hover:bg-orange-200 hover:ring-orange-300",
    open: "bg-orange-200 text-orange-900 ring-orange-300",
    active: "bg-gradient-to-r from-orange-500 to-amber-500 text-white ring-orange-600 shadow-md shadow-orange-500/30",
    icon: "text-orange-600",
    panel: "border-orange-200 border-t-orange-500 bg-orange-50",
    title: "text-orange-600",
    item: "bg-orange-100/70 text-orange-900 border-transparent hover:border-orange-400 hover:bg-orange-200",
    itemActive: "bg-orange-200 text-orange-900 border-orange-500",
    check: "text-orange-600",
  },
  blue: {
    idle: "bg-blue-100 text-blue-800 ring-blue-200 hover:bg-blue-200 hover:ring-blue-300",
    open: "bg-blue-200 text-blue-900 ring-blue-300",
    active: "bg-gradient-to-r from-blue-500 to-sky-500 text-white ring-blue-600 shadow-md shadow-blue-500/30",
    icon: "text-blue-600",
    panel: "border-blue-200 border-t-blue-500 bg-blue-50",
    title: "text-blue-600",
    item: "bg-blue-100/70 text-blue-900 border-transparent hover:border-blue-400 hover:bg-blue-200",
    itemActive: "bg-blue-200 text-blue-900 border-blue-500",
    check: "text-blue-600",
  },
  violet: {
    idle: "bg-violet-100 text-violet-800 ring-violet-200 hover:bg-violet-200 hover:ring-violet-300",
    open: "bg-violet-200 text-violet-900 ring-violet-300",
    active: "bg-gradient-to-r from-violet-500 to-purple-500 text-white ring-violet-600 shadow-md shadow-violet-500/30",
    icon: "text-violet-600",
    panel: "border-violet-200 border-t-violet-500 bg-violet-50",
    title: "text-violet-600",
    item: "bg-violet-100/70 text-violet-900 border-transparent hover:border-violet-400 hover:bg-violet-200",
    itemActive: "bg-violet-200 text-violet-900 border-violet-500",
    check: "text-violet-600",
  },
  emerald: {
    idle: "bg-emerald-100 text-emerald-800 ring-emerald-200 hover:bg-emerald-200 hover:ring-emerald-300",
    open: "bg-emerald-200 text-emerald-900 ring-emerald-300",
    active: "bg-gradient-to-r from-emerald-500 to-green-500 text-white ring-emerald-600 shadow-md shadow-emerald-500/30",
    icon: "text-emerald-600",
    panel: "border-emerald-200 border-t-emerald-500 bg-emerald-50",
    title: "text-emerald-600",
    item: "bg-emerald-100/70 text-emerald-900 border-transparent hover:border-emerald-400 hover:bg-emerald-200",
    itemActive: "bg-emerald-200 text-emerald-900 border-emerald-500",
    check: "text-emerald-600",
  },
  rose: {
    idle: "bg-rose-100 text-rose-800 ring-rose-200 hover:bg-rose-200 hover:ring-rose-300",
    open: "bg-rose-200 text-rose-900 ring-rose-300",
    active: "bg-gradient-to-r from-rose-500 to-pink-500 text-white ring-rose-600 shadow-md shadow-rose-500/30",
    icon: "text-rose-600",
    panel: "border-rose-200 border-t-rose-500 bg-rose-50",
    title: "text-rose-600",
    item: "bg-rose-100/70 text-rose-900 border-transparent hover:border-rose-400 hover:bg-rose-200",
    itemActive: "bg-rose-200 text-rose-900 border-rose-500",
    check: "text-rose-600",
  },
  teal: {
    idle: "bg-teal-100 text-teal-800 ring-teal-200 hover:bg-teal-200 hover:ring-teal-300",
    open: "bg-teal-200 text-teal-900 ring-teal-300",
    active: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white ring-teal-600 shadow-md shadow-teal-500/30",
    icon: "text-teal-600",
    panel: "border-teal-200 border-t-teal-500 bg-teal-50",
    title: "text-teal-600",
    item: "bg-teal-100/70 text-teal-900 border-transparent hover:border-teal-400 hover:bg-teal-200",
    itemActive: "bg-teal-200 text-teal-900 border-teal-500",
    check: "text-teal-600",
  },
  indigo: {
    idle: "bg-indigo-100 text-indigo-800 ring-indigo-200 hover:bg-indigo-200 hover:ring-indigo-300",
    open: "bg-indigo-200 text-indigo-900 ring-indigo-300",
    active: "bg-gradient-to-r from-indigo-500 to-blue-500 text-white ring-indigo-600 shadow-md shadow-indigo-500/30",
    icon: "text-indigo-600",
    panel: "border-indigo-200 border-t-indigo-500 bg-indigo-50",
    title: "text-indigo-600",
    item: "bg-indigo-100/70 text-indigo-900 border-transparent hover:border-indigo-400 hover:bg-indigo-200",
    itemActive: "bg-indigo-200 text-indigo-900 border-indigo-500",
    check: "text-indigo-600",
  },
  sky: {
    idle: "bg-sky-100 text-sky-800 ring-sky-200 hover:bg-sky-200 hover:ring-sky-300",
    open: "bg-sky-200 text-sky-900 ring-sky-300",
    active: "bg-gradient-to-r from-sky-500 to-cyan-500 text-white ring-sky-600 shadow-md shadow-sky-500/30",
    icon: "text-sky-600",
    panel: "border-sky-200 border-t-sky-500 bg-sky-50",
    title: "text-sky-600",
    item: "bg-sky-100/70 text-sky-900 border-transparent hover:border-sky-400 hover:bg-sky-200",
    itemActive: "bg-sky-200 text-sky-900 border-sky-500",
    check: "text-sky-600",
  },
};

const MASTER_TONES: Record<string, Tone> = {
  customers: "blue",
  vendor: "violet",
  vehicles: "emerald",
  drivers: "rose",
};

const navBtnClass = (
  tone: Tone,
  active: boolean,
  open = false,
  justify = "justify-start",
) => {
  const t = TONES[tone];
  return `group inline-flex h-11 w-full items-center ${justify} gap-2 whitespace-nowrap rounded-lg px-4 text-[15px] font-semibold ring-1 ring-inset transition-all duration-200 md:w-auto md:justify-center ${
    active ? t.active : open ? t.open : t.idle
  }`;
};

const panelClass = (tone: Tone) =>
  `nav-pop z-50 mt-1 max-h-80 w-full overflow-y-auto whitespace-nowrap rounded-xl border border-t-4 p-2 shadow-xl shadow-slate-900/10 md:absolute md:left-0 md:top-full md:mt-2 md:w-max md:min-w-[15rem] ${TONES[tone].panel}`;

// Hover effect now shows on BOTH sides (left + right border, padding grows on both sides)
const itemClass = (tone: Tone, active: boolean) =>
  `nav-item flex w-full items-center justify-between gap-6 rounded-lg border-x-[4px] px-3 py-2.5 text-left text-[15px] font-semibold transition-all duration-150 hover:px-4 ${
    active ? TONES[tone].itemActive : TONES[tone].item
  }`;

type DropdownProps = {
  open: boolean;
  onToggle: () => void;
  active?: boolean;
  icon?: ReactNode;
  label: string;
  panelTitle: string;
  tone?: Tone;
  children: ReactNode;
};

function Dropdown({
  open,
  onToggle,
  active = false,
  icon,
  label,
  panelTitle,
  tone = "orange",
  children,
}: DropdownProps) {
  const t = TONES[tone];
  return (
    <div className="relative w-full md:w-auto">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        className={navBtnClass(tone, active, open, "justify-between")}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon && (
            <span
              className={`transition-transform duration-200 group-hover:scale-110 ${
                active ? "text-white" : t.icon
              }`}
            >
              {icon}
            </span>
          )}
          <span key={label} className="nav-label max-w-[220px] truncate">
            {label}
          </span>
          {active && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
          )}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-300 ${
            active ? "text-white" : t.icon
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div role="menu" className={panelClass(tone)}>
          <p
            className={`px-3 pb-1.5 pt-1.5 text-xs font-bold uppercase tracking-wider ${t.title}`}
          >
            {panelTitle}
          </p>
          <ul className="space-y-1">{children}</ul>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  active,
  onClick,
  children,
  index = 0,
  tone = "orange",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  index?: number;
  tone?: Tone;
}) {
  return (
    <li
      role="none"
      className="nav-item-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className={itemClass(tone, active)}
      >
        <span>{children}</span>
        {active && (
          <Check size={16} className={`check-pop shrink-0 ${TONES[tone].check}`} />
        )}
      </button>
    </li>
  );
}
function NavLink({
  active,
  onClick,
  icon,
  children,
  tone = "orange",
}: {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={navBtnClass(tone, active)}
    >
      <span className={active ? "text-white" : TONES[tone].icon}>{icon}</span>
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

  const activeTrackingItem = trackingItems.find(
    ({ key }) => pathname === `/dashboard/reports/${REPORT_SLUGS[key]}`,
  );

  const isRulesActive = is("/dashboard/rules");

  return (
    <nav
      ref={navbarRef}
      className="sticky top-0 z-50 w-full border-b border-orange-200 bg-gradient-to-r from-orange-100 via-amber-50 to-orange-100 shadow-sm"
    >
      <style>{`
  @keyframes nav-pop {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes nav-item-in {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes nav-label {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes check-pop {
    0%   { transform: scale(0) rotate(-45deg); }
    70%  { transform: scale(1.25) rotate(0); }
    100% { transform: scale(1); }
  }
  .nav-pop { animation: nav-pop 0.18s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: top left; }
  .nav-item-in { opacity: 0; animation: nav-item-in 0.22s ease-out forwards; }
  .nav-label { animation: nav-label 0.25s ease-out; }
  .check-pop { animation: check-pop 0.3s ease-out; }
`}</style>

      {/* Brand accent line */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        {/* Mobile: hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-300 bg-orange-500 text-white transition-colors hover:bg-orange-600 md:hidden"
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

        <div className="hidden h-6 w-px bg-orange-300 md:block" />

        {/* Menu container: dropdown sheet on mobile, inline row on desktop */}
        <div
          className={`${mobileOpen ? "flex" : "hidden"} absolute inset-x-0 top-16 max-h-[calc(100vh-4rem)] flex-col gap-3 overflow-y-auto border-b border-orange-200 bg-orange-50 p-4 shadow-lg md:static md:flex md:max-h-none md:flex-1 md:flex-row md:items-center md:justify-between md:gap-2 md:overflow-visible md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {/* Left: navigation */}
          <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-2">
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
                    tone={MASTER_TONES[menu.key] ?? "orange"}
                  >
                    {menu.items.map((item) => (
                      <DropdownItem
                        key={item.value}
                        active={item.value === activeMaster}
                        onClick={() => handleMasterSelect(item.value)}
                        tone={MASTER_TONES[menu.key] ?? "orange"}
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
                      className={`inline-flex h-11 w-full items-center justify-start gap-2 whitespace-nowrap rounded-lg px-4 text-[15px] font-bold text-white shadow-md transition-colors duration-150 md:w-auto md:justify-center ${
                        activeLeadKey === "lead-form"
                          ? "bg-orange-700 ring-2 ring-orange-300"
                          : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                      }`}
                    >
                      <Plus size={17} />
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
                      icon={<ClipboardList size={17} />}
                      label={
                        isLeadManagerActive
                          ? LEAD_LABELS[activeLeadKey]
                          : "Lead Manager"
                      }
                      panelTitle="Lead Manager"
                      tone="blue"
                    >
                      {LEAD_MANAGER_KEYS.map((key) => (
                        <DropdownItem
                          key={key}
                          active={activeLeadKey === key}
                          onClick={() => handleLeadSelect(key)}
                          tone="blue"
                        >
                          {LEAD_LABELS[key]}
                        </DropdownItem>
                      ))}
                    </Dropdown>
                  ) : (
                    <NavLink
                      active={activeLeadKey === "lead-table"}
                      onClick={() => handleLeadSelect("lead-table")}
                      icon={<ClipboardList size={17} />}
                      tone="blue"
                    >
                      Lead Manager
                    </NavLink>
                  ))}

                {/* TL Tables */}
                {isTeamLeader && (
                  <NavLink
                    active={activeLeadKey === "lead-table"}
                    onClick={handleTlTablesSelect}
                    icon={<ClipboardList size={17} />}
                    tone="blue"
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
                      icon={<Headphones size={17} />}
                      tone="blue"
                    >
                      Sales Lead Manager
                    </NavLink>

                    <NavLink
                      active={activeLeadKey === "swap-lead-table"}
                      onClick={() => handleSwapLeadSelect("swap-lead-table")}
                      icon={<ArrowLeftRight size={17} />}
                      tone="violet"
                    >
                      Swap Lead Manager
                    </NavLink>

                    <NavLink
                      active={activeLeadKey === "dsr-lead-table"}
                      onClick={handleDsrSelect}
                      icon={<FileText size={17} />}
                      tone="emerald"
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
                    icon={<MapPin size={17} />}
                    label={
                      activeTrackingItem ? activeTrackingItem.label : "Tracking"
                    }
                    panelTitle="Reports"
                    tone="teal"
                  >
                    {trackingItems.map(({ label, key }, index) => (
                      <DropdownItem
                        key={key}
                        index={index}
                        active={
                          pathname === `/dashboard/reports/${REPORT_SLUGS[key]}`
                        }
                        onClick={() => {
                          router.push(`/dashboard/reports/${REPORT_SLUGS[key]}`);
                          close();
                        }}
                        tone="teal"
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
                icon={<LayoutDashboard size={17} />}
                label="Dashboards"
                panelTitle="Dashboards"
                tone="indigo"
              >
                {dashboardItems.map((item) => (
                  <DropdownItem
                    key={item.value}
                    active={pathname === DASHBOARD_ROUTES[item.value]}
                    onClick={() => handleDashboardSelect(item.value)}
                    tone="indigo"
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
                icon={<Monitor size={17} />}
                label="Website"
                panelTitle="Website"
                tone="sky"
              >
                {[
                  { key: "gac", label: "GAC Table" },
                  { key: "gaq", label: "GAQ Table" },
                ].map(({ key, label }) => (
                  <DropdownItem
                    key={key}
                    active={pathname.endsWith("/" + key)}
                    onClick={() => handleWebsiteSelect(key)}
                    tone="sky"
                  >
                    {label}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </div>

          {/* Right: notifications, rules, profile */}
          <div className="flex flex-col gap-2 border-t border-orange-200 pt-3 md:ml-auto md:flex-row md:items-center md:gap-2 md:border-0 md:pt-0">
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
                className={`inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-[15px] font-semibold ring-1 ring-inset transition-colors duration-150 ${
                  isRulesActive
                    ? "bg-red-500 text-white ring-red-600 shadow-md shadow-red-500/30"
                    : "bg-red-100 text-red-700 ring-red-200 hover:bg-red-200"
                }`}
              >
                <BookOpen size={17} className="flex-shrink-0" />
                Rules
              </button>
            )}

            <div className="hidden h-6 w-px bg-orange-300 md:block" />

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
        <div className="ml-auto flex items-center gap-2 rounded-full border border-orange-200 bg-white py-1 pl-1 pr-3 md:hidden">
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