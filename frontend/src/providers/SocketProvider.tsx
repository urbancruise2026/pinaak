"use client";
import { useSocket } from "../hooks/useSocket";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  useSocket();
  return <>{children}</>;
};
