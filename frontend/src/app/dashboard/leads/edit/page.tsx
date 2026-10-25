"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { setSelectedLeadForEdit } from "@/store/navigationSlice";
import { lazy } from "@/lib/lazy";

const EditLeadForm = lazy<any>(
  () => import("@/features/leads/components/EditForm/editleadform"),
);

export default function Page() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const lead = useSelector((s: RootState) => s.navigation.selectedLeadForEdit);

  useEffect(() => {
    if (!lead) router.replace("/dashboard/leads/sales");
  }, [lead, router]);

  if (!lead) return null;

  const done = () => {
    dispatch(setSelectedLeadForEdit(null));
    router.push("/dashboard/leads/sales");
  };

  return <EditLeadForm initialData={lead} onSuccess={done} onCancel={done} />;
}