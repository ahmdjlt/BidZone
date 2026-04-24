"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthBootstrapper() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);

  useEffect(() => {
    void bootstrapAuth();
  }, [bootstrapAuth]);

  return null;
}
