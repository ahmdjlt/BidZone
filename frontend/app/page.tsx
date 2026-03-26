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
    imageUrl: "/auction-images/ceas.jpg",
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
    imageUrl: "/auction-images/card.jpg",
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
    imageUrl: "/auction-images/scaun.jpg",
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
    imageUrl: "/auction-images/premiu.jpg",
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
    imageUrl: "/auction-images/obiectiv_foto.jpg",
    imageAccent: "linear-gradient(135deg,#1a7cf4,#88d6ff)",
  },
  {
    id: "kit_auto",
    title: "Cinema Lens Master Kit",
    category: "Gear",
    currentBid: "$4,920",
    bids: 14,
    endsIn: "Ends in 3d 06h",
    watchers: 72,
    imageUrl: "/auction-images/bumper.png",
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
    <div className="page-gradient relative overflow-x-clip">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 pb-10 pt-10 sm:px-8">
        <section className="relative grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div className="animate-rise space-y-6">
            <span className="inline-flex items-center rounded-full border border-border-strong bg-card-bg px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
              Live auctions. Real urgency.
            </span>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-text-heading sm:text-5xl">
              The auction marketplace built for speed, trust, and smarter bids.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-text-body">
              BidZone pairs intense live bidding with a clean seller workflow so
              every listing can reach its best possible value.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auctions"
                className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(16,84,209,0.85)] transition hover:brightness-110"
              >
                Explore live auctions
              </Link>
              <Link
                href="/auctions/create"
                className="rounded-2xl border border-border-strong bg-card-bg px-5 py-3 text-sm font-semibold text-text-label transition hover:border-accent/50 hover:bg-accent-soft"
              >
                Start selling
              </Link>
            </div>
          </div>

          <div className="animate-float relative rounded-[2.2rem] border border-border bg-card-bg p-6 card-shadow-heavy">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl bg-accent px-4 py-3 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-blue-100 dark:text-blue-200">
                    Ending now
                  </p>
                  <p className="text-base font-semibold">Vintage Lens Bundle</p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  01:49
                </span>
              </div>
              <div className="grid gap-3 rounded-2xl border border-border p-4">
                <p className="text-sm font-semibold text-text-heading">Current battle</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-text-body">
                    <span>Highest bid</span>
                    <strong className="text-text-heading">$2,840</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-body">
                    <span>Bidders in room</span>
                    <strong className="text-text-heading">48 live</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-body">
                    <span>Bid increments</span>
                    <strong className="text-text-heading">$50 minimum</strong>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-text-body">
                When bids arrive in the final minute, the timer automatically
                extends to keep every bidder in play.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-4 rounded-[2rem] border border-border bg-card-bg/85 p-5 sm:grid-cols-3 sm:p-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border/80 bg-accent-soft/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-text-label">
                {metric.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-text-heading">
                {metric.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
                Featured listings
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-text-heading">
                High-activity auctions
              </h2>
            </div>
            <Link
              href="/auctions"
              className="rounded-xl border border-border-strong bg-card-bg px-4 py-2 text-sm font-semibold text-text-label hover:bg-accent-soft"
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
              className="rounded-[1.7rem] border border-border bg-card-bg p-6 card-shadow-heavy"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
                Step 0{index + 1}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-text-heading">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-body">{step.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-[2.3rem] border border-border-strong cta-gradient p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
                Built for confidence
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-heading">
                Seller tools + buyer protection in one flow.
              </h2>
              <p className="mt-3 max-w-xl text-text-body">
                Verified profiles, transparent bid history, and status tracking
                after checkout create a marketplace people return to.
              </p>
            </div>
            <div className="rounded-3xl bg-card-bg p-6 shadow-[0_24px_70px_-45px_var(--card-shadow-heavy)]">
              <p className="text-sm font-semibold text-text-heading">This week on BidZone</p>
              <ul className="mt-4 space-y-3 text-sm text-text-body">
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
