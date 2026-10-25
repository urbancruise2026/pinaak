import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { resolveRole } from "@/lib/roles";

export function useRole(): string {
  const { currentUser } = useSelector((s: RootState) => s.user);
  return resolveRole(currentUser);
}