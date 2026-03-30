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
    description: "Automatic Movement, 42mm Case, Stainless Steel Bracelet, Sapphire Crystal",
    location: "Tokyo, Japan",
    category: "Collectibles",
    currentBid: "$1,240",
    bids: 37,
    endsIn: "2h 11m",
    watchers: 91,
    imageUrl: "/auction-images/ceas.jpg",
    imageAccent: "linear-gradient(135deg,#2f80ff,#8ec5ff)",
  },
  {
    id: "psa10-jordan-rookie",
    title: "PSA 10 Jordan Rookie Card",
    description: "1986 Fleer #57, Gem Mint Condition, Authenticated & Graded",
    location: "Chicago, IL 60601",
    category: "Sports Cards",
    currentBid: "$6,850",
    bids: 52,
    endsIn: "5h 44m",
    watchers: 138,
    imageUrl: "/auction-images/card.jpg",
    imageAccent: "linear-gradient(135deg,#3d9bff,#d5ebff)",
  },
  {
    id: "mid-century-lounge-chair",
    title: "Mid-Century Lounge Chair",
    description: "Walnut Frame, Italian Leather Cushions, Original 1960s Design",
    location: "Portland, OR 97201",
    category: "Home Design",
    currentBid: "$2,100",
    bids: 19,
    endsIn: "1d 03h",
    watchers: 64,
    imageUrl: "/auction-images/scaun.jpg",
    imageAccent: "linear-gradient(135deg,#2c6ce8,#5fc7ff)",
  },
  {
    id: "signed-first-edition",
    title: "Signed First Edition Novel",
    description: "Hardcover, Dust Jacket Intact, Author-Signed, Near Fine Condition",
    location: "New York, NY 10001",
    category: "Books",
    currentBid: "$740",
    bids: 26,
    endsIn: "8h 14m",
    watchers: 58,
    imageUrl: "/auction-images/premiu.jpg",
    imageAccent: "linear-gradient(135deg,#105ed6,#8cbcff)",
  },
  {
    id: "lens-master-kit",
    title: "Cinema Lens Master Kit",
    description: "3-Lens Set, PL Mount, T1.5 Aperture, Hard Carrying Case Included",
    location: "Los Angeles, CA 90028",
    category: "Gear",
    currentBid: "$4,920",
    bids: 14,
    endsIn: "3d 06h",
    watchers: 72,
    imageUrl: "/auction-images/obiectiv_foto.jpg",
    imageAccent: "linear-gradient(135deg,#1a7cf4,#88d6ff)",
  },
  {
    id: "kit_auto",
    title: "OEM Front Bumper Kit",
    description: "Complete Assembly, Primer Finish, Fog Light Brackets, Hardware Included",
    location: "Detroit, MI 48201",
    category: "Auto Parts",
    currentBid: "$4,920",
    bids: 14,
    endsIn: "3d 06h",
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


export default function HomePage() {
  return (
    <div className="page-gradient relative overflow-x-clip">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 pb-10 pt-10 sm:px-8">
        <section className="relative">
          <div className="animate-rise space-y-6 max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-text-heading sm:text-5xl">
              The auction marketplace built for speed, trust, and smarter bids.
            </h1>
            <p className="text-lg leading-relaxed text-text-body">
              BidZone pairs intense live bidding with a clean seller workflow so
              every listing can reach its best possible value.
            </p>
            <form action="/auctions" method="get" className="flex w-full max-w-xl mx-auto overflow-hidden rounded-2xl border border-border-strong bg-card-bg shadow-sm">
              <input
                type="text"
                name="q"
                placeholder="Search auctions..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-text-heading placeholder:text-text-muted focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-r-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Search
              </button>
            </form>
            <div className="flex flex-wrap justify-center gap-3">
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

      </main>

      <Footer />
    </div>
  );
}
