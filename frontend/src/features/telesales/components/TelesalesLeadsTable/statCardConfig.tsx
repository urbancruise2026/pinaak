import {
  Plus,
  FileText,
  Flame,
  Car,
  XCircle,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";

export type StatusKey = "NEW" | "KYC" | "RFQ" | "HOT" | "VEH-N" | "LOST" | "BOOK";

export interface StatCardStyle {
  label: StatusKey;
  Icon: LucideIcon;
  card: string;
  iconBg: string;
  labelText: string;
  bar: string;
  track: string;
  ring: string;
}

// Full class names so Tailwind never purges them
export const STATUS_CARDS: StatCardStyle[] = [
  {
    label: "NEW",
    Icon: Plus,
    card: "bg-gradient-to-b from-blue-50 to-blue-100/60 border-blue-100",
    iconBg: "bg-blue-500",
    labelText: "text-blue-600",
    bar: "bg-blue-500",
    track: "bg-blue-100",
    ring: "ring-blue-400",
  },
  {
    label: "KYC",
    Icon: FileText,
    card: "bg-gradient-to-b from-orange-50 to-orange-100/60 border-orange-100",
    iconBg: "bg-orange-400",
    labelText: "text-orange-600",
    bar: "bg-orange-500",
    track: "bg-orange-100",
    ring: "ring-orange-400",
  },
  {
    label: "RFQ",
    Icon: FileText,
    card: "bg-gradient-to-b from-sky-50 to-blue-100/60 border-blue-100",
    iconBg: "bg-blue-500",
    labelText: "text-blue-700",
    bar: "bg-blue-600",
    track: "bg-blue-100",
    ring: "ring-blue-500",
  },
  {
    label: "HOT",
    Icon: Flame,
    card: "bg-gradient-to-b from-purple-50 to-purple-100/60 border-purple-100",
    iconBg: "bg-purple-500",
    labelText: "text-purple-700",
    bar: "bg-purple-600",
    track: "bg-purple-100",
    ring: "ring-purple-400",
  },
  {
    label: "VEH-N",
    Icon: Car,
    card: "bg-gradient-to-b from-rose-50 to-rose-100/60 border-rose-100",
    iconBg: "bg-rose-400",
    labelText: "text-rose-600",
    bar: "bg-rose-500",
    track: "bg-rose-100",
    ring: "ring-rose-400",
  },
  {
    label: "LOST",
    Icon: XCircle,
    card: "bg-gradient-to-b from-red-50 to-red-100/60 border-red-100",
    iconBg: "bg-red-500",
    labelText: "text-red-600",
    bar: "bg-red-500",
    track: "bg-red-100",
    ring: "ring-red-400",
  },
  {
    label: "BOOK",
    Icon: CalendarCheck,
    card: "bg-gradient-to-b from-green-50 to-green-100/60 border-green-100",
    iconBg: "bg-green-500",
    labelText: "text-green-700",
    bar: "bg-green-600",
    track: "bg-green-100",
    ring: "ring-green-400",
  },
];