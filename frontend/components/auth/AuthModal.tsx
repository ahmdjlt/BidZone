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
  const [showPassword, setShowPassword] = useState(false);
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

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-border-strong bg-surface-alt px-3 py-2 pr-10 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text-heading"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {view === "register" && (
            <>
              <input
                type={showPassword ? "text" : "password"}
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
