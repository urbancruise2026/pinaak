// src/app/redux/redux-provider.tsx
"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";  // ✅ Path sahi check karo

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}