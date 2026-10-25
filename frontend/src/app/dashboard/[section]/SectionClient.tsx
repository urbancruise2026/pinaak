"use client";

import { useParams, notFound } from "next/navigation";

const TITLES: Record<string, string> = {
  "booking-trip": "Booking",
  payment: "Trip / Payment",
  feedback: "Feedback",
};

export default function ComingSoon() {
  const { section } = useParams<{ section: string }>();
  const title = TITLES[section];
  if (!title) notFound();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">{title} module coming soon</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-500">This feature is under development.</p>
    </div>
  );
}