"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface AuthModalProps {
  closeOnSuccess?: boolean;
  onClose: () => void;
  initialView?: "login" | "register";
  redirectTo?: string;
}

export default function AuthModal({
  closeOnSuccess = true,
  onClose,
  initialView = "login",
  redirectTo = "/profile",
}: AuthModalProps) {
  const [view, setView] = useState<"login" | "register">(initialView);
  const [rememberMe, setRememberMe] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"Buyer" | "Seller">("Buyer");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { bootstrapAuth, hasBootstrapped, isAuthenticated, isLoading, login, register } = useAuthStore();

  useEffect(() => {
    if (!hasBootstrapped) {
      void bootstrapAuth();
      return;
    }

    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [bootstrapAuth, hasBootstrapped, isAuthenticated, redirectTo, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      if (view === "login") {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        await register({
          username,
          fullName,
          email,
          password,
          role,
        });
      }

      if (closeOnSuccess) {
        onClose();
      }
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[340px] rounded-2xl border border-border bg-card-bg p-5 shadow-2xl sm:p-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {view === "login" ? "Sign in or create an account" : "Create your account"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted transition hover:bg-accent-soft hover:text-text-heading"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title + toggle */}
        <div className="mt-3 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-text-heading">
            {view === "login" ? "Welcome back!" : "Get started"}
          </h2>
          <button
            type="button"
            onClick={() => setView(view === "login" ? "register" : "login")}
            className="text-sm font-semibold text-accent hover:text-accent/80 transition"
          >
            {view === "login" ? "Create account" : "Sign in"}
          </button>
        </div>

        {/* Form */}
        <form
          className="mt-4 space-y-3"
          onSubmit={handleSubmit}
        >
          {view === "register" && (
            <>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-border-strong bg-surface-alt px-3 py-2 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-lg border border-border-strong bg-surface-alt px-3 py-2 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                {(["Buyer", "Seller"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      role === option
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border-strong bg-surface-alt text-text-heading hover:bg-accent-soft/40"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-lg border border-border-strong bg-surface-alt px-3 py-2 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-border-strong bg-surface-alt px-3 py-2 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            required
          />

          {view === "register" && (
            <>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-lg border border-border-strong bg-surface-alt px-3 py-2 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
              />
            </>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {error}
            </div>
          )}

          {view === "login" && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border-strong bg-surface-alt text-accent focus:ring-accent/20 focus:ring-2 focus:ring-offset-0"
                />
                <span className="text-xs text-text-heading whitespace-nowrap">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                onClick={onClose}
                className="text-xs font-medium text-accent hover:text-accent/80 transition whitespace-nowrap"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <p className="text-xs text-text-muted">
            {view === "login" ? (
              <>
                By signing in, you agree to our{" "}
                <Link href="/terms" className="font-medium text-accent hover:text-accent/80 transition">Terms of Use</Link>
              </>
            ) : (
              <>
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="font-medium text-accent hover:text-accent/80 transition">Terms of Use</Link>
                {" and "}
                <Link href="/privacy" className="font-medium text-accent hover:text-accent/80 transition">Privacy Policy</Link>
              </>
            )}
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="!mt-3 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-card-bg"
          >
            {isLoading ? "Please wait..." : view === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
