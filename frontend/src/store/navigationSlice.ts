import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { LeadRecord } from "@/types/types";

type SidebarSection =
  | "leads"
  | "master"
  | "rate-quotation"
  | "dsr-form"
  | "booking-trip"
  | "payment"
  | "feedback"
  | "dashboard"
  | "website"
  | "download-report"
  | "rules"
  // ── Vendor-only sections ──────────────────────────────
  | "vehicle-documents"
  | "vendor-profile"
  | "vendorDashboard";  

type MasterKey =
  | "vendor"
  | "vendor-table"
  | "vehicles"
  | "vehicle-category"
  | "vehicle-manager"
  | "vehicle-add"
  | "driver"
  | "driver-table"
  | "employee"
  | "hr"
  | "city"
  | "corporate-form"
  | "corporate-event"
  | "customer-personal"
  | "customer-table"
  | "customer-history"
  | "rate-quotation"
  | "dsr-form"
  | "card-reel"
  | "quotation-pdf"
  | "country-code"
  | "access-level"
  | "region"
  | "zone";

type LeadView =
  | "dashboard"
  | "lead-form"
  | "lead-table"
  | "sale-lead-table"
  | "dsr-lead-table"
  | "sales-edit-form";

type DashboardView =
  | "leads-dashboard"
  | "presales-dashboard"
  | "telesales-dashboard"
  | "teamleader-dashboard"
  | "citymanager-dashboard";

// ── Login type coming from JWT / currentUser (decoded.loginType) ──────────
type LoginType = "employee" | "vendor" | "driver" | "customer" | "";

interface NavigationState {
  loginType: LoginType;
  activeSection: SidebarSection;
  activeMaster: MasterKey;
  activeLeadView: LeadView;
  activeDashboardView: DashboardView;
  activeWebsiteView: "gac" | "gaq";
  activeAccessKey: string | null;
  activeYearKey: string | null;
  pendingModuleKey: string | null;
  selectedRegion: string;
  selectedCity: string;
  selectedZone: string;
  selectedLeadForEdit: LeadRecord | null;
  selectedLeadForRateQuotation: LeadRecord | null;
  selectedLeadForDsr: LeadRecord | null;
  // Report toggles
  showMonthlyEnquiry: boolean;
  showMonthlyDistribution: boolean;
  showUnwantedLeads: boolean;
  showEmployeeReports: boolean;
  showTimeEnquiryReports: boolean;
  showDateEmployeeReports: boolean;
  showagingReports: boolean;
  showTimeTrackingReports: boolean;
  showMonthlyLeadsTwo: boolean;
  showLongWeekendLeads: boolean;
}

const initialState: NavigationState = {
  loginType: "",
  activeSection: "leads",
  activeMaster: "vendor",
  activeLeadView: "dashboard",
  activeDashboardView: "leads-dashboard",
  activeWebsiteView: "gac",
  activeAccessKey: null,
  activeYearKey: null,
  pendingModuleKey: null,
  selectedRegion: "",
  selectedCity: "",
  selectedZone: "",
  selectedLeadForEdit: null,
  selectedLeadForRateQuotation: null,
  selectedLeadForDsr: null,
  showMonthlyEnquiry: false,
  showMonthlyDistribution: false,
  showUnwantedLeads: false,
  showEmployeeReports: false,
  showTimeEnquiryReports: false,
  showDateEmployeeReports: false,
  showagingReports: false,
  showMonthlyLeadsTwo: false,
  showLongWeekendLeads: false,
  showTimeTrackingReports: false,
};

const resetReports = (state: NavigationState) => {
  state.showMonthlyEnquiry = false;
  state.showMonthlyDistribution = false;
  state.showUnwantedLeads = false;
  state.showEmployeeReports = false;
  state.showTimeEnquiryReports = false;
  state.showDateEmployeeReports = false;
  state.showagingReports = false;
  state.showTimeTrackingReports = false;
  state.showMonthlyLeadsTwo = false;
  state.showLongWeekendLeads = false;
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    // ── Section ──────────────────────────────────────────
    setActiveSection(state, action: PayloadAction<SidebarSection>) {
      state.activeSection = action.payload;
      state.pendingModuleKey = null;
      resetReports(state);
    },

    // ── Master ───────────────────────────────────────────
    setActiveMaster(state, action: PayloadAction<MasterKey>) {
      state.activeSection = "master";
      state.activeMaster = action.payload;
      state.pendingModuleKey = null;
      resetReports(state);
    },
    setPendingModuleKey(state, action: PayloadAction<string | null>) {
      state.pendingModuleKey = action.payload;
    },

    // ── Leads ────────────────────────────────────────────
    setActiveLeadView(state, action: PayloadAction<LeadView>) {
      state.activeSection = "leads";
      state.activeLeadView = action.payload;
      state.pendingModuleKey = null;
      resetReports(state);
    },
    setSelectedLeadForEdit(state, action: PayloadAction<LeadRecord | null>) {
      state.selectedLeadForEdit = action.payload;
    },
    setSelectedLeadForRateQuotation(
      state,
      action: PayloadAction<LeadRecord | null>,
    ) {
      state.selectedLeadForRateQuotation = action.payload;
      state.activeSection = "rate-quotation";
      state.pendingModuleKey = null;
      resetReports(state);
    },
    setSelectedLeadForDsr(state, action: PayloadAction<LeadRecord | null>) {
      state.selectedLeadForDsr = action.payload;
      state.activeSection = "dsr-form";
      state.pendingModuleKey = null;
      resetReports(state);
    },

    // ── Dashboard ────────────────────────────────────────
    setActiveDashboardView(state, action: PayloadAction<DashboardView>) {
      state.activeDashboardView = action.payload;
    },

    // ── Website ──────────────────────────────────────────
    setActiveWebsiteView(state, action: PayloadAction<"gac" | "gaq">) {
      state.activeSection = "website";
      state.activeWebsiteView = action.payload;
      state.pendingModuleKey = null;
      resetReports(state);
    },

    // ── Filters ──────────────────────────────────────────
    setSelectedRegion(state, action: PayloadAction<string>) {
      state.selectedRegion = action.payload;
      state.selectedCity = "";
    },
    setSelectedCity(state, action: PayloadAction<string>) {
      state.selectedCity = action.payload;
    },
    setSelectedZone(state, action: PayloadAction<string>) {
      state.selectedZone = action.payload;
    },

    // ── Access / Year ────────────────────────────────────
    setActiveAccessKey(state, action: PayloadAction<string | null>) {
      state.activeAccessKey = action.payload;
    },
    setActiveYearKey(state, action: PayloadAction<string | null>) {
      state.activeYearKey = action.payload;
    },

    // ── Reports ──────────────────────────────────────────
    showReport(
      state,
      action: PayloadAction<
        | "monthlyEnquiry"
        | "monthlyDistribution"
        | "unwantedLeads"
        | "employeeReports"
        | "timeEnquiryReports"
        | "dateEmployeeReports"
        | "monthlyLeadsTwo"
        | "longWeekendLeads"
        | "agingReports"
        | "showTimeTrackingReports"
      >,
    ) {
      resetReports(state);
      state.activeSection = "leads";
      state.activeLeadView = "dashboard";
      switch (action.payload) {
        case "monthlyEnquiry":
          state.showMonthlyEnquiry = true;
          break;
        case "monthlyDistribution":
          state.showMonthlyDistribution = true;
          break;
        case "unwantedLeads":
          state.showUnwantedLeads = true;
          break;
        case "employeeReports":
          state.showEmployeeReports = true;
          break;
        case "timeEnquiryReports":
          state.showTimeEnquiryReports = true;
          break;
        case "dateEmployeeReports":
          state.showDateEmployeeReports = true;
          break;
        case "agingReports":
          state.showagingReports = true;
          break;
        // case "TimeTrackingReports":
        //   state.showTimeTrackingReports = true;
        //   break;
        case "showTimeTrackingReports":   // was "TimeTrackingReports"
          state.showTimeTrackingReports = true;
          break;
        case "monthlyLeadsTwo":
          state.showMonthlyLeadsTwo = true;
          break;
        case "longWeekendLeads":
          state.showLongWeekendLeads = true;
          break;
      }
    },

    resetAllReports: resetReports,

    // ── Initial setup from role / loginType ───────────────
    initFromRole(
      state,
      action: PayloadAction<{
        role: string;
        department: string;
        subDepartment: string;
        loginType?: LoginType;
      }>,
    ) {
      const {
        role,
        department,
        subDepartment,
        loginType = "",
      } = action.payload;

      state.loginType = loginType;

      resetReports(state);
      state.pendingModuleKey = null;

      // ══════════════════════════════════════════════════
      // VENDOR LOGIN — completely separate navigation.
      // Vendor only ever sees: Trip/Booking, Vehicle
      // Documents, Vendor Profile. Nothing from the
      // employee menu (Master, Leads, Rate Quotation,
      // Website, Download Report, Payment, Feedback) is
      // reachable for this loginType.
      // ══════════════════════════════════════════════════
      if (loginType === "vendor") {
        state.activeSection = "vendorDashboard";
        return;
      }

      // (driver / customer login types can get their own
      // branches here later, following the same pattern)

      const r = role.toLowerCase();
      const dept = department.toLowerCase();
      const sub = subDepartment.toLowerCase();

      if (r === "superadmin") {
        state.activeSection = "leads";
        state.activeLeadView = "dashboard";
        state.activeDashboardView = "leads-dashboard";
        return;
      }

      const isSalesDept = dept === "sales";
      const isPresalesSub = sub === "pre-sales";
      const isTelesalesSub = sub === "tele-sales";

      // ────────────────────────────────────────────────────
      // "Leadership" roles: Manager, Travel Advisor, Team
      // Leader (incl. Team Leader-Sales), City Manager.
      //
      // `subDepartment` ("pre-sales" / "tele-sales") is only
      // a meaningful signal for individual-contributor
      // presales/telesales agents. On Manager / Travel
      // Advisor accounts this field can be stale or
      // incorrectly populated, which used to incorrectly
      // route them into a telesales/presales dashboard
      // instead of the Leads overview. Team Leader / City
      // Manager still use subDepartment below to know which
      // team they lead, so they're intentionally excluded
      // from this generic guard.
      // ────────────────────────────────────────────────────
      const isGenericManagementRole =
        r.includes("manager") || r.includes("advisor") || r.includes("travel");

      if (isSalesDept && isPresalesSub) {
        state.activeSection = "dashboard";
        state.activeDashboardView = r.includes("team leader")
          ? "teamleader-dashboard"
          : "presales-dashboard";
        return;
      }

      if (r.includes("team leader") && isTelesalesSub) {
        state.activeSection = "dashboard";
        state.activeDashboardView = "teamleader-dashboard";
        return;
      }
      if (r.includes("city manager") && isTelesalesSub) {
        state.activeSection = "dashboard";
        state.activeDashboardView = "citymanager-dashboard";
        return;
      }

      if (!isGenericManagementRole) {
        if (isTelesalesSub) {
          state.activeSection = "dashboard";
          state.activeDashboardView = "telesales-dashboard";
          return;
        }
        if (isPresalesSub) {
          state.activeSection = "dashboard";
          state.activeDashboardView = "presales-dashboard";
          return;
        }
      }

      state.activeSection = "leads";
      state.activeLeadView = "dashboard";
      state.activeDashboardView = "leads-dashboard";
    },
  },
});

export const {
  setActiveSection,
  setActiveMaster,
  setPendingModuleKey,
  setActiveLeadView,
  setSelectedLeadForEdit,
  setSelectedLeadForRateQuotation,
  setSelectedLeadForDsr,
  setActiveDashboardView,
  setActiveWebsiteView,
  setSelectedRegion,
  setSelectedCity,
  setSelectedZone,
  setActiveAccessKey,
  setActiveYearKey,
  showReport,
  resetAllReports,
  initFromRole,
} = navigationSlice.actions;

export default navigationSlice.reducer;
