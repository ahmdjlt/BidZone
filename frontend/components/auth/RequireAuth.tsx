"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@/types/user";
import { useAuthStore } from "@/store/authStore";

interface RequireAuthProps {
  allowedRoles?: User["role"][];
  children: React.ReactNode;
  fallbackPath?: string;
}

export default function RequireAuth({
  allowedRoles,
  children,
  fallbackPath = "/",
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!hasBootstrapped) {
      void bootstrapAuth();
      return;
    }

    if (!isAuthenticated) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }

    if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
      router.replace(fallbackPath);
    }
  }, [allowedRoles, bootstrapAuth, fallbackPath, hasBootstrapped, isAuthenticated, pathname, router, user]);

  if (!hasBootstrapped || isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">
        Checking your permissions...
      </div>
    );
  }

  return <>{children}</>;
}
