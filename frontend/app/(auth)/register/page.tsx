import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function RegisterPage() {
  return (
    <div className="page-gradient relative overflow-x-clip">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md space-y-8 rounded-3xl border border-border/50 bg-card-bg/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center">
              <h1 className="mb-2 bg-gradient-to-r from-text-heading to-text-label bg-clip-text text-4xl font-bold text-transparent">
                Create account
              </h1>
              <p className="text-text-body">Join BidZone and start bidding live.</p>
            </div>

            <RegisterForm />

            <div className="text-center">
              <p className="text-sm text-text-body">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-accent hover:brightness-110">
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
