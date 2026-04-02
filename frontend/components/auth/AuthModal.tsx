"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  onClose: () => void;
  initialView?: "login" | "register";
}

export default function AuthModal({ onClose, initialView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "register">(initialView);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[440px] rounded-2xl border border-border bg-card-bg p-8 shadow-2xl sm:p-10">
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
        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-text-heading">
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

        {/* Social auth */}
        <p className="mt-5 text-sm font-medium text-text-muted">Continue with</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <button
            type="button"
            className="flex items-center justify-center rounded-lg bg-[#1877F2] px-3 py-3 transition hover:brightness-110"
          >
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-lg border border-border-strong bg-surface-alt px-3 py-3 transition hover:bg-accent-soft/40"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-lg bg-[#1a1a1a] dark:bg-[#e5e5e5] px-3 py-3 transition hover:brightness-110"
          >
            <svg className="h-5 w-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 814 1000">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.3-105.9-207.9-105.9-328.3 0-193 125.4-295.6 248.8-295.6 65.5 0 120.1 43.1 161.2 43.1 39.2 0 100.2-45.7 174.5-45.7 28.2 0 129.5 2.6 196.3 99.8zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8.7 15.6 1.3 18.2 2.6.4 6.5 1.3 10.4 1.3 45.3 0 103.6-30.4 139.3-71.5z" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Form */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
            router.push(view === "login" ? "/profile" : "/dashboard");
          }}
        >
          {view === "register" && (
            <input
              type="text"
              placeholder="Full name"
              className="w-full rounded-lg border border-border-strong bg-surface-alt px-4 py-3 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-lg border border-border-strong bg-surface-alt px-4 py-3 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-border-strong bg-surface-alt px-4 py-3 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />

          {view === "register" && (
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full rounded-lg border border-border-strong bg-surface-alt px-4 py-3 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
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
                <span className="text-sm text-text-heading">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                onClick={onClose}
                className="text-sm font-medium text-accent hover:text-accent/80 transition"
              >
                Forgotten your password?
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
            className="!mt-5 w-full rounded-lg bg-accent px-4 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-card-bg"
          >
            {view === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
