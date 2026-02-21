"use client";

// Auction detail page - shows auction info, live bidding, bid history, countdown timer
import { use, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CountdownTimer from "@/components/auction/CountdownTimer";

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Demo data calculated client-side only to avoid hydration mismatch
  const demoEndTimes = useMemo(() => ({
    normal: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    urgent: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    expired: new Date(Date.now() - 60 * 1000).toISOString(),
  }), []);
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#d5e8ff_0,transparent_34%),linear-gradient(to_bottom,#f5f9ff_0%,#eef5ff_52%,#f6faff_100%)]">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-blue-950">
          CountdownTimer
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          Auction ID: <code className="rounded bg-blue-50 px-2 py-0.5 text-blue-700">{id}</code>
        </p>

        <div className="space-y-6">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Normal — 2+ hours left</p>
            <CountdownTimer endTime={demoEndTimes.normal} />
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-600">Urgent — under 5 minutes</p>
            <CountdownTimer endTime={demoEndTimes.urgent} />
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Expired</p>
            <CountdownTimer endTime={demoEndTimes.expired} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
