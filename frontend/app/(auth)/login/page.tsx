import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function LoginPage() {
  return (
    <div className="relative overflow-x-clip bg-[radial-gradient(circle_at_top_right,#d5e8ff_0,transparent_34%),linear-gradient(to_bottom,#f5f9ff_0%,#eef5ff_52%,#f6faff_100%)]">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md space-y-8 rounded-3xl border border-blue-100/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center">
              <h1 className="mb-2 bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-4xl font-bold text-transparent">
                Welcome Back
              </h1>
              <p className="text-slate-600">Sign in to your BidZone account</p>
            </div>

            <form className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-blue-900"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full rounded-2xl border border-blue-200 bg-blue-50/50 px-4 py-3 text-lg placeholder:text-slate-400 transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/50"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-blue-900"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="........"
                  className="w-full rounded-2xl border border-blue-200 bg-blue-50/50 px-4 py-3 text-lg placeholder:text-slate-400 transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/50"
                />
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-blue-200/50" />
                <span className="mx-4 flex-shrink px-2 text-xs uppercase tracking-wider text-slate-500">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-blue-200/50" />
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-blue-200/50 bg-white/85 px-6 py-3 text-sm font-semibold text-blue-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200/50"
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

              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200/50"
                >
                  Sign In
                </button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
