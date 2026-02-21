"use client";

import { use, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CountdownTimer from "@/components/auction/CountdownTimer";
import BidHistory, { type Bid } from "@/components/auction/BidHistory";

const demoBids: Bid[] = [
  { id: "b1", bidder: "Alex M.", amount: "$2,840", time: "2 min ago" },
  { id: "b2", bidder: "Sarah K.", amount: "$2,790", time: "4 min ago" },
  { id: "b3", bidder: "Dan P.", amount: "$2,650", time: "11 min ago" },
  { id: "b4", bidder: "Ioana R.", amount: "$2,500", time: "18 min ago" },
  { id: "b5", bidder: "Mihai T.", amount: "$2,300", time: "25 min ago" },
  { id: "b6", bidder: "Elena V.", amount: "$2,100", time: "32 min ago" },
  { id: "b7", bidder: "Andrei S.", amount: "$1,900", time: "45 min ago" },
  { id: "b8", bidder: "Clara D.", amount: "$1,750", time: "1h ago" },
];

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

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
          Component Preview
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          Auction ID: <code className="rounded bg-blue-50 px-2 py-0.5 text-blue-700">{id}</code>
        </p>

        <div className="space-y-8">
          {/* CountdownTimer demos */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">CountdownTimer — Normal</p>
            <CountdownTimer endTime={demoEndTimes.normal} />
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-red-600">CountdownTimer — Urgent</p>
            <CountdownTimer endTime={demoEndTimes.urgent} />
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">CountdownTimer — Expired</p>
            <CountdownTimer endTime={demoEndTimes.expired} />
          </section>

          {/* BidHistory demos */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">BidHistory — 8 bids (show more/less)</p>
            <BidHistory bids={demoBids} />
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">BidHistory — Empty</p>
            <BidHistory bids={[]} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
