"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { currentUserThunk } from "@/features/user/userSlice";
import {
  initFromRole,
  setSelectedLeadForEdit,
  setSelectedLeadForRateQuotation,
  setSelectedLeadForDsr,
} from "@/store/navigationSlice";
import { getEffectiveRole, normalizeRole } from "@/lib/roles";
import type { LeadRecord } from "@/types/types";

export default function DashboardBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentUser } = useSelector((s: RootState) => s.user);

  // 1. Load current user
  useEffect(() => {
    dispatch(currentUserThunk());
  }, [dispatch]);

  // 2. Init role / department / login type
  useEffect(() => {
    if (!currentUser) return;
    const raw = (currentUser as any) ?? {};
    const data = raw?.data ?? raw;

    dispatch(
      initFromRole({
        role: normalizeRole(
          getEffectiveRole(
            raw?.role_name ?? data?.role_name,
            raw?.access_role ?? data?.access_role,
          ),
        ),
        department:
          raw?.department_name ??
          data?.department_name ??
          raw?.department ??
          data?.department ??
          "",
        subDepartment:
          raw?.subDepartment_name ??
          data?.subDepartment_name ??
          raw?.subdepartname_name ??
          data?.subdepartname_name ??
          "",
        loginType: raw?.loginType ?? data?.loginType ?? "",
      }),
    );
  }, [currentUser, dispatch]);

  // 3. Custom events now use the router
  useEffect(() => {
    const onViewLead = (e: CustomEvent<LeadRecord>) => {
      if (!e.detail) return;
      dispatch(setSelectedLeadForEdit(e.detail));
      router.push("/dashboard/leads/edit");
    };

    const onNavToTable = () => router.push("/dashboard/leads/table");

    const onRateQuotation = (e: CustomEvent<{ lead: LeadRecord }>) => {
      if (!e.detail?.lead) return;
      dispatch(setSelectedLeadForRateQuotation(e.detail.lead));
      router.push("/dashboard/rate-quotation");
    };

    const onDsr = (e: CustomEvent<{ lead?: LeadRecord }>) => {
      if (e.detail?.lead) dispatch(setSelectedLeadForDsr(e.detail.lead));
      router.push("/dashboard/dsr-form");
    };

    window.addEventListener("viewLead", onViewLead as EventListener);
    window.addEventListener("navigateToLeadTable", onNavToTable);
    window.addEventListener("rateQuotation", onRateQuotation as EventListener);
    window.addEventListener("dsr-form", onDsr as EventListener);

    return () => {
      window.removeEventListener("viewLead", onViewLead as EventListener);
      window.removeEventListener("navigateToLeadTable", onNavToTable);
      window.removeEventListener("rateQuotation", onRateQuotation as EventListener);
      window.removeEventListener("dsr-form", onDsr as EventListener);
    };
  }, [dispatch, router]);

  return null;
}