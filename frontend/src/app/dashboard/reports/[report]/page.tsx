import ReportClient from "./ReportClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    "monthly-enquiry",
    "monthly-distribution",
    "unwanted",
    "employee",
    "time-enquiry",
    "long-weekend",
    "monthly-leads-two",
    "date-employee",
    "aging",
    "time-tracking",
  ].map((report) => ({ report }));
}

export default function Page() {
  return <ReportClient />;
}
