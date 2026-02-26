import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function RegisterPage() {
  return (
    <div className="relative overflow-x-clip bg-[radial-gradient(circle_at_top_right,#d5e8ff_0,transparent_34%),linear-gradient(to_bottom,#f5f9ff_0%,#eef5ff_52%,#f6faff_100%)]">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md space-y-8 rounded-3xl border border-blue-100/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center">
              <h1 className="mb-2 bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-4xl font-bold text-transparent">
                Create account
              </h1>
              <p className="text-slate-600">Join BidZone and start bidding live.</p>
            </div>

            <RegisterForm />

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign in
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
