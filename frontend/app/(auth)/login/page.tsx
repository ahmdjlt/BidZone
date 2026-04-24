"use client";

import { useEffect } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? "/profile";
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
      initialView="login"
      onClose={() => router.push("/")}
      redirectTo={redirectTo}
    />
  );
}
