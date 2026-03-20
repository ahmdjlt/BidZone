"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); router.push("/dashboard"); }}>
      <div>
        <label
          htmlFor="fullName"
          className="mb-2 block text-sm font-semibold text-text-heading"
        >
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"

          placeholder="Alex Johnson"
          className="w-full rounded-2xl border border-border-strong bg-accent-soft/50 px-4 py-3 text-lg text-text-heading placeholder:text-text-muted transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-text-heading"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"

          placeholder="your@email.com"
          className="w-full rounded-2xl border border-border-strong bg-accent-soft/50 px-4 py-3 text-lg text-text-heading placeholder:text-text-muted transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-semibold text-text-heading"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"


          placeholder="Minimum 8 characters"
          className="w-full rounded-2xl border border-border-strong bg-accent-soft/50 px-4 py-3 text-lg text-text-heading placeholder:text-text-muted transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-semibold text-text-heading"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"


          placeholder="Re-enter your password"
          className="w-full rounded-2xl border border-border-strong bg-accent-soft/50 px-4 py-3 text-lg text-text-heading placeholder:text-text-muted transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-border-strong/50" />
        <span className="mx-4 flex-shrink px-2 text-xs uppercase tracking-wider text-text-muted">
          Or continue with
        </span>
        <div className="flex-grow border-t border-border-strong/50" />
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-border-strong/50 bg-card-bg/85 px-6 py-3 text-sm font-semibold text-text-heading shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-card-bg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-accent/20"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <label className="flex items-start gap-3 text-sm text-text-body">
        <input
          type="checkbox"

          className="mt-0.5 h-4 w-4 rounded border-border-strong text-accent focus:ring-accent/50"
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="font-semibold text-accent hover:brightness-110">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-accent hover:brightness-110">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        className="w-full rounded-2xl bg-gradient-to-r from-accent to-blue-700 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-accent/20 dark:from-accent dark:to-blue-500"
      >
        Create account
      </button>
    </form>
  );
}
