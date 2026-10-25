"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { currentUserThunk } from "@/features/user/userSlice";

export default function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(currentUserThunk()); // ← app start pe user check
  }, [dispatch]);

  return null; // ← kuch render nahi karta, sirf effect chalata hai
}