import { LeadRecord } from "@/types/types";

export interface LeadStatusCounts {
  totalLeadsCount: number;
  newLeads: number;
  rfqLeads: number;
  kycLeads: number;
  hotLeads: number;
  vehnLeads: number;
  lostLeads: number;
  bookLeads: number;
  blankLeads: number;
}

export interface LeadStatusPercentages {
  totalPercentage: string;
  newPercentage: string;
  rfqPercentage: string;
  kycPercentage: string;
  hotPercentage: string;
  vehnPercentage: string;
  lostPercentage: string;
  bookPercentage: string;
  blankPercentage: string;
}

export const calculateLeadStatusCounts = (
  leads: LeadRecord[],
): LeadStatusCounts => {
  const totalLeadsCount = leads.length;

  return {
    totalLeadsCount,
    newLeads: leads.filter((lead) => lead.status === "New").length,
    rfqLeads: leads.filter((lead) => lead.status === "RFQ").length,
    kycLeads: leads.filter((lead) => lead.status === "KYC").length,
    hotLeads: leads.filter((lead) => lead.status === "HOT").length,
    vehnLeads: leads.filter((lead) => lead.status === "Veh-n").length,
    lostLeads: leads.filter((lead) => lead.status === "Lost").length,
    bookLeads: leads.filter((lead) => lead.status === "Book").length,
    blankLeads: leads.filter((lead) => lead.status === "Blank").length,
  };
};
export const calculateLeadStatusPercentages = (
  counts: LeadStatusCounts,
): LeadStatusPercentages => {
  const total = counts.totalLeadsCount;

  const calculatePercentage = (value: number): string => {
    return total > 0 ? Math.round((value / total) * 100).toString() : "0";
  };

  return {
    totalPercentage: total > 0 ? "100" : "0",
    newPercentage: calculatePercentage(counts.newLeads),
    rfqPercentage: calculatePercentage(counts.rfqLeads),
    kycPercentage: calculatePercentage(counts.kycLeads),
    hotPercentage: calculatePercentage(counts.hotLeads),
    vehnPercentage: calculatePercentage(counts.vehnLeads),
    lostPercentage: calculatePercentage(counts.lostLeads),
    bookPercentage: calculatePercentage(counts.bookLeads),
    blankPercentage: calculatePercentage(counts.blankLeads),
  };
};

const BASE_CONTAINER =
  "flex items-center justify-between px-3 sm:px-4 py-1 shadow-md border rounded-md w-fit max-w-full h-10 whitespace-nowrap flex-shrink-0 gap-3";

export const STATUS_BADGE_STYLES = {
  total: {
    container: `${BASE_CONTAINER} bg-black border-white`,
    label: "font-bold text-sm text-white",
    value: "font-extrabold text-md text-white",
    percentage: "text-md font-bold text-white",
  },
  new: {
    container: `${BASE_CONTAINER} bg-blue-200 border-sky-800`,
    label: "font-bold text-sm text-black",
    value: "font-extrabold text-md text-black",
    percentage: "text-md font-bold text-black",
  },
  kyc: {
    container: `${BASE_CONTAINER} bg-cyan-200 border-cyan-800`,
    label: "font-extrabold text-md text-cyan-950",
    value: "font-extrabold text-md text-cyan-900",
    percentage: "text-md font-bold text-cyan-700",
  },
  rfq: {
    container: `${BASE_CONTAINER} bg-amber-300 border-amber-800`,
    label: "font-extrabold text-md text-amber-950",
    value: "font-extrabold text-md text-amber-900",
    percentage: "text-md font-bold text-amber-700",
  },
  hot: {
    container: `${BASE_CONTAINER} bg-pink-200 border-pink-800`,
    label: "font-extrabold text-md text-pink-950",
    value: "font-extrabold text-md text-pink-900",
    percentage: "text-md font-bold text-pink-700",
  },
  vehn: {
    container: `${BASE_CONTAINER} bg-[#2c1332] border-pink-900`,
    label: "font-extrabold text-md text-white",
    value: "font-extrabold text-md text-white",
    percentage: "text-md font-bold text-white",
  },
  lost: {
    container: `${BASE_CONTAINER} bg-red-600 border-red-900`,
    label: "font-bold text-md text-white",
    value: "font-extrabold text-white",
    percentage: "text-md font-bold text-white",
  },
  book: {
    container: `${BASE_CONTAINER} bg-green-800 border-green-900`,
    label: "font-extrabold text-md text-white",
    value: "font-extrabold text-md text-white",
    percentage: "text-md font-bold text-white",
  },
};

export interface LeadStatusBadgeProps {
  type: keyof typeof STATUS_BADGE_STYLES;
  label: string;
  value: number;
  percentage: string;
}

export const LeadStatusBadge = ({
  type,
  label,
  value,
  percentage,
}: LeadStatusBadgeProps) => {
  const styles = STATUS_BADGE_STYLES[type];

  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      <span className={styles.percentage}>({percentage}%)</span>
    </div>
  );
};

export const calculateMonthPickupCounts = (
  leads: LeadRecord[],
  monthValue: string,
): number => {
  return (
    leads?.filter((lead) => {
      if (!lead.pickupDateTime) return false;
      const pickupDate = new Date(lead.pickupDateTime);
      if (isNaN(pickupDate.getTime())) return false;
      const leadMonth = pickupDate.getMonth() + 1;
      return leadMonth === Number(monthValue);
    }).length || 0
  );
};

export interface MonthPickupBadgeProps {
  month: { value: string; label: string };
  count: number;
  isCurrentMonth?: boolean;
  onClick?: () => void;
}

export const MonthPickupBadge = ({ month, count, isCurrentMonth, onClick }: MonthPickupBadgeProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-w-[84px] h-8 px-3 flex items-center justify-between gap-2 rounded-lg text-[13px] font-bold transition-colors ${
      isCurrentMonth
        ? "bg-blue-600 text-white ring-2 ring-blue-400/60"
        : "bg-[#0b1426] text-slate-300 border border-[#243553] hover:bg-[#1b2c4d]"
    }`}
  >
    <span>{month.label}</span>
    <span className="text-[12px] rounded-full px-2 py-0.5 bg-white/10 text-slate-100">{count}</span>
  </button>
);

