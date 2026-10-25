"use client";

import { useParams, notFound } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { MASTER_ALLOWED_ROLES, MASTER_ITEM_ALLOWED_ROLES } from "@/lib/roles";
import { MASTER_TABS } from "@/features/master/masterTabs";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const Denied = ({ text }: { text: string }) => (
  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
    <h1 className="text-2xl font-semibold text-slate-800">Access Denied</h1>
    <p className="mt-2 max-w-xl text-sm text-slate-500">{text}</p>
  </div>
);

export default function MasterTabPage() {
  const { tab } = useParams<{ tab: string }>();
  const role = useRole();
  const currentUser = useSelector((s: RootState) => s.user.currentUser);
if (!currentUser) return null;

  const Comp = MASTER_TABS[tab];
  if (!Comp) notFound();

  if (!MASTER_ALLOWED_ROLES.includes(role)) {
    return <Denied text="You don't have permission to view the Master section." />;
  }

  const allowed = MASTER_ITEM_ALLOWED_ROLES[tab];
  if (allowed && !allowed.includes(role)) {
    return <Denied text="You don't have permission to view this Master module." />;
  }

  return <Comp />;
}