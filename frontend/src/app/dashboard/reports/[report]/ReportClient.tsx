"use client";

import type { ComponentType } from "react";
import { useParams, notFound } from "next/navigation";
import { lazy } from "@/lib/lazy";

const REPORTS: Record<string, ComponentType<any>> = {
  "monthly-enquiry": lazy(() => import("@/features/reports/components/mereReport")),
  "monthly-distribution": lazy(() => import("@/features/reports/components/leadDistribution")),
  unwanted: lazy(() => import("@/features/reports/components/UnwantedLead")),
  employee: lazy(() => import("@/features/reports/components/EmployeeReport")),
  "time-enquiry": lazy(() => import("@/features/reports/components/TimeEnquiryReports")),
  "long-weekend": lazy(() => import("@/features/reports/components/LongWeekendReport")),
  "monthly-leads-two": lazy(() => import("@/features/reports/components/MereReportTwo")),
  "date-employee": lazy(() => import("@/features/reports/components/EmployeeDateReport")),
  aging: lazy(() => import("@/features/reports/components/AgingReport")),
  "time-tracking": lazy(() => import("@/features/reports/components/vehiclesTracking")),
};

export default function ReportPage() {
  const { report } = useParams<{ report: string }>();
  const Comp = REPORTS[report];
  if (!Comp) notFound();
  return <Comp />;
}