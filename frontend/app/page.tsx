// Landing page - hero section, featured auctions, call-to-action
import Link from "next/link";
import AuctionGrid from "@/components/auction/AuctionGrid";
import type { AuctionPreview } from "@/components/auction/AuctionCard";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const featuredAuctions: AuctionPreview[] = [
  {
    id: "rare-seiko-chrono",
    title: "Rare Seiko Chronograph",
    category: "Collectibles",
    currentBid: "$1,240",
    bids: 37,
    endsIn: "Ends in 2h 11m",
    watchers: 91,
    imageAccent: "linear-gradient(135deg,#2f80ff,#8ec5ff)",
  },
  {
    id: "psa10-jordan-rookie",
    title: "PSA 10 Jordan Rookie Card",
    category: "Sports Cards",
    currentBid: "$6,850",
    bids: 52,
    endsIn: "Ends in 5h 44m",
    watchers: 138,
    imageAccent: "linear-gradient(135deg,#3d9bff,#d5ebff)",
  },
  {
    id: "mid-century-lounge-chair",
    title: "Mid-Century Lounge Chair",
    category: "Home Design",
    currentBid: "$2,100",
    bids: 19,
    endsIn: "Ends in 1d 03h",
    watchers: 64,
    imageAccent: "linear-gradient(135deg,#2c6ce8,#5fc7ff)",
  },
  {
    id: "signed-first-edition",
    title: "Signed First Edition Novel",
    category: "Books",
    currentBid: "$740",
    bids: 26,
    endsIn: "Ends in 8h 14m",
    watchers: 58,
    imageAccent: "linear-gradient(135deg,#105ed6,#8cbcff)",
  },
  {
    id: "lens-master-kit",
    title: "Cinema Lens Master Kit",
    category: "Gear",
    currentBid: "$4,920",
    bids: 14,
    endsIn: "Ends in 3d 06h",
    watchers: 72,
    imageAccent: "linear-gradient(135deg,#1a7cf4,#88d6ff)",
  },
];

const metrics = [
  { label: "Active bidders", value: "12.8K" },
  { label: "Auctions this week", value: "1,540" },
  { label: "Avg. sell uplift", value: "+24%" },
];

const steps = [
  {
    title: "List in Minutes",
    text: "Sellers publish listings with smart pricing guidance and instant category matching.",
  },
  {
    title: "Live Bid Momentum",
    text: "Real-time updates keep urgency high while anti-sniping extensions protect fairness.",
  },
  {
    title: "Secure Checkout",
    text: "Winners complete payment quickly and both sides receive shipment and status tracking.",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip bg-[radial-gradient(circle_at_top_right,#d5e8ff_0,transparent_34%),linear-gradient(to_bottom,#f5f9ff_0%,#eef5ff_52%,#f6faff_100%)]">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-10 sm:px-6">
        <section className="relative grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div className="animate-rise space-y-6">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Live auctions. Real urgency.
            </span>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-blue-950 sm:text-5xl">
              The auction marketplace built for speed, trust, and smarter bids.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              BidZone pairs intense live bidding with a clean seller workflow so
              every listing can reach its best possible value.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auctions"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,84,209,0.85)] transition hover:bg-blue-700"
              >
                Explore live auctions
              </Link>
              <Link
                href="/auctions/create"
                className="rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Start selling
              </Link>
            </div>
          </div>

          <div className="animate-float relative rounded-[2.2rem] border border-blue-100 bg-white p-6 shadow-[0_36px_90px_-46px_rgba(17,90,225,0.65)]">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-200/45 blur-2xl" />
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl bg-blue-600 px-4 py-3 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-blue-100">
                    Ending now
                  </p>
                  <p className="text-base font-semibold">Vintage Lens Bundle</p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  01:49
                </span>
              </div>
              <div className="grid gap-3 rounded-2xl border border-blue-100 p-4">
                <p className="text-sm font-semibold text-blue-900">Current battle</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Highest bid</span>
                    <strong className="text-blue-900">$2,840</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Bidders in room</span>
                    <strong className="text-blue-900">48 live</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Bid increments</span>
                    <strong className="text-blue-900">$50 minimum</strong>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                When bids arrive in the final minute, the timer automatically
                extends to keep every bidder in play.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-4 rounded-[2rem] border border-blue-100 bg-white/85 p-5 sm:grid-cols-3 sm:p-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-blue-100/80 bg-blue-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-blue-700">
                {metric.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-blue-950">
                {metric.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Featured listings
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-blue-950">
                High-activity auctions
              </h2>
            </div>
            <Link
              href="/auctions"
              className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              View all auctions
            </Link>
          </div>
          <AuctionGrid auctions={featuredAuctions} />
        </section>

        <section className="mt-20 grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[1.7rem] border border-blue-100 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(27,111,242,0.65)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Step 0{index + 1}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-blue-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-[2.3rem] border border-blue-200 bg-[linear-gradient(135deg,#f8fbff_0%,#dbe9ff_100%)] p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Built for confidence
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-blue-950">
                Seller tools + buyer protection in one flow.
              </h2>
              <p className="mt-3 max-w-xl text-slate-700">
                Verified profiles, transparent bid history, and status tracking
                after checkout create a marketplace people return to.
              </p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_70px_-45px_rgba(9,63,181,0.8)]">
              <p className="text-sm font-semibold text-blue-900">This week on BidZone</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>94.7% completed transactions closed within 24 hours.</li>
                <li>Average time from listing to first bid: 11 minutes.</li>
                <li>Top categories: watches, cards, and studio gear.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
