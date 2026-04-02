"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen bg-surface-alt">

      {/* Left panel — branding */}
      <div className="hidden w-[480px] shrink-0 flex-col justify-between bg-card-bg border-r border-border p-10 lg:flex">
        <Link href="/" className="text-lg font-bold tracking-tight text-text-heading">
          BidZone
        </Link>

        <div>
          <p className="text-[28px] font-semibold leading-tight tracking-tight text-text-heading">
            The modern auction<br />platform built for collectors.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            Buy and sell rare items, vintage collectibles, and unique finds with confidence.
          </p>
        </div>

        <p className="text-xs text-text-muted">&copy; 2026 BidZone. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-text-heading lg:hidden">
            BidZone
          </Link>
          <p className="ml-auto text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-text-heading hover:text-accent">
              Sign up
            </Link>
          </p>
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-[360px]">

            <h1 className="text-2xl font-bold tracking-tight text-text-heading">Sign in</h1>
            <p className="mt-1.5 text-sm text-text-muted">Enter your credentials to access your account</p>

            {/* Social buttons */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-md border border-border-strong bg-card-bg px-3 py-2.5 text-sm font-medium text-text-heading transition hover:bg-accent-soft/60"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-md border border-border-strong bg-card-bg px-3 py-2.5 text-sm font-medium text-text-heading transition hover:bg-accent-soft/60"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.56-.04-.95 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.32.06.65.06 1.02h.22zm3.44 17.3c-.2.46-1.02 2.04-1.96 2.46-.96.43-1.87.33-2.49.14-.71-.22-1.21-.57-1.74-.57-.56 0-1.12.36-1.75.58-.66.23-1.39.25-2.07-.12C7.73 19.79 6.18 15.57 6.2 12.2c.01-3.08 1.8-4.76 3.56-4.84.82-.04 1.61.46 2.15.46.52 0 1.56-.58 2.58-.5.72.03 2.27.28 3.17 2.02-2.42 1.55-2.03 4.94.33 5.95-.5 1.38-1.08 2.56-2.01 3.44z" />
                </svg>
                Apple
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wider text-text-muted">or continue with email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Form */}
            <form
              className="space-y-4"
              onSubmit={(e) => { e.preventDefault(); router.push("/profile"); }}
            >
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-heading">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border-strong bg-surface-alt px-3 py-2.5 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-text-heading">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium text-text-muted hover:text-text-heading">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-md border border-border-strong bg-surface-alt px-3 py-2.5 text-sm text-text-heading placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <button
                type="submit"
                className="!mt-6 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-surface-alt"
              >
                Sign in
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
