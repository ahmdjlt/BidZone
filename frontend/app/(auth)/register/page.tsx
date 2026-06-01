"use client";

import { useEffect } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/store/authStore";
import { getSafeRedirectPath } from "@/lib/redirect";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("next"));
  const { bootstrapAuth, hasBootstrapped, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!hasBootstrapped) {
      void bootstrapAuth();
      return;
    }

    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [bootstrapAuth, hasBootstrapped, isAuthenticated, redirectTo, router]);

  return (
    <AuthModal
      closeOnSuccess={false}
      initialView="register"
      onClose={() => router.push("/")}
      redirectTo={redirectTo}
    />
  );
}
